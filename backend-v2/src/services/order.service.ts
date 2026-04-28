import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { canTransition, STATUS_LABELS } from "../types/order.js";
import { publishOrderEvent } from "../utils/events.js";
import type {
  CreateOrderInput,
  UpdateStatusInput,
  OrderQueryInput,
} from "../validations/order.validation.js";

export async function createOrder(input: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missing = productIds.filter((id) => !foundIds.includes(id));
      throw Object.assign(
        new Error(`Products not found or unavailable: ${missing.join(", ")}`),
        { statusCode: 400 }
      );
    }

    let total = new Prisma.Decimal(0);
    const orderItems = input.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemTotal = product.price.mul(item.quantity);
      total = total.add(itemTotal);
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    const orderData: any = {
      orderType: input.orderType,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress || null,
      pickupTime: input.pickupTime || null,
      total,
      status: OrderStatus.RECEIVED,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
      items: { create: orderItems },
      statusHistory: {
        create: {
          status: OrderStatus.RECEIVED,
          notes: "Comanda primita",
        },
      },
    };

    const order = await tx.order.create({
      data: orderData,
      include: {
        items: { include: { product: true } },
        statusHistory: true,
      },
    });

    return order;
  }).then((order) => {
    publishOrderEvent({
      type: "ORDER_CREATED",
      orderId: order.id,
      status: order.status,
      timestamp: new Date().toISOString(),
      data: {
        customerName: order.customerName,
        total: order.total,
        itemCount: order.items.length,
        orderType: order.orderType,
      },
    });
    return order;
  });
}

export async function getOrders(query: OrderQueryInput) {
  const where: any = {};

  if (query.status) {
    where.status = query.status.toUpperCase();
  }

  if (query.phone) {
    where.customerPhone = { contains: query.phone };
  }

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) {
      where.createdAt.gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      where.createdAt.lte = new Date(query.dateTo);
    }
  }

  const skip = (query.page - 1) * query.limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getOrderByIdAndPhone(id: number, phone: string) {
  return prisma.order.findFirst({
    where: { id, customerPhone: phone },
    include: {
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function updateOrderStatus(id: number, input: UpdateStatusInput) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { statusHistory: true },
    });

    if (!order) {
      throw Object.assign(new Error("Order not found"), { statusCode: 404 });
    }

    const newStatus = input.status as OrderStatus;

    if (!canTransition(order.status, newStatus)) {
      throw Object.assign(
        new Error(
          `Cannot transition from ${STATUS_LABELS[order.status]} to ${STATUS_LABELS[newStatus]}`
        ),
        { statusCode: 400 }
      );
    }

    const updated = await tx.order.update({
      where: { id },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            status: newStatus,
            notes: input.notes || `Status changed to ${STATUS_LABELS[newStatus]}`,
          },
        },
      },
      include: {
        items: { include: { product: true } },
        statusHistory: true,
      },
    });

    return updated;
  }).then((order) => {
    publishOrderEvent({
      type: "ORDER_STATUS_CHANGED",
      orderId: order.id,
      status: order.status,
      timestamp: new Date().toISOString(),
      data: {
        customerName: order.customerName,
        status: order.status,
      },
    });
    return order;
  });
}

export async function getOrderStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    revenueToday,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.order.count({ where: { status: OrderStatus.RECEIVED } }),
    prisma.order.count({ where: { status: OrderStatus.PREPARING } }),
    prisma.order.count({ where: { status: OrderStatus.READY } }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: todayStart, lt: todayEnd },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { total: true },
    }),
  ]);

  return {
    totalOrders,
    todayOrders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    revenueToday: revenueToday._sum.total?.toNumber() ?? 0,
  };
}

export async function getMyOrders(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}
