import { prisma } from "../utils/prisma.js";
import { getCache, setCache } from "../utils/cache.js";

const CACHE_KEY = "reports:summary";
const CACHE_TTL = 300; // 5 minutes

export async function getSummaryStats() {
  const cached = await getCache(CACHE_KEY);
  if (cached) return cached;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalRevenue,
    totalOrders,
    todayOrders,
    todayRevenue,
    totalCustomers,
    newCustomersThisMonth,
    newCustomersLastMonth,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _sum: { total: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
    }),
  ]);

  const avgOrderValue =
    totalOrders > 0
      ? (totalRevenue._sum.total?.toNumber() || 0) / totalOrders
      : 0;

  const result = {
    totalRevenue: totalRevenue._sum.total?.toNumber() || 0,
    totalOrders,
    todayOrders,
    todayRevenue: todayRevenue._sum.total?.toNumber() || 0,
    totalCustomers,
    newCustomersThisMonth,
    newCustomersLastMonth,
    avgOrderValue: Math.round(avgOrderValue),
  };

  await setCache(CACHE_KEY, result, CACHE_TTL);
  return result;
}

export async function getCategorySales() {
  const cacheKey = "reports:category-sales";
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const orderItems = await prisma.orderItem.findMany({
    include: {
      product: { include: { category: true } },
    },
  });

  const categoryMap = new Map();
  for (const item of orderItems) {
    const catName = item.product.category?.name || "Fără categorie";
    const existing = categoryMap.get(catName) || { name: catName, sales: 0, revenue: 0 };
    existing.sales += item.quantity;
    existing.revenue += item.price.toNumber() * item.quantity;
    categoryMap.set(catName, existing);
  }

  const result = Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

export async function getMonthlyRevenue(months = 6) {
  const cacheKey = `reports:monthly-revenue:${months}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    const [revenueAgg, ordersCount] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: date, lt: nextMonth },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: date, lt: nextMonth },
        },
      }),
    ]);

    result.push({
      month: date.toLocaleString("ro-RO", { month: "short" }),
      revenue: revenueAgg._sum.total?.toNumber() || 0,
      orders: ordersCount,
    });
  }

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

export async function getTopProducts(limit = 5) {
  const cacheKey = `reports:top-products:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const orderItems = await prisma.orderItem.findMany({
    include: { product: true },
  });

  const productMap = new Map();
  for (const item of orderItems) {
    const existing = productMap.get(item.productId) || {
      name: item.name,
      sales: 0,
      revenue: 0,
    };
    existing.sales += item.quantity;
    existing.revenue += item.price.toNumber() * item.quantity;
    productMap.set(item.productId, existing);
  }

  const result = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}
