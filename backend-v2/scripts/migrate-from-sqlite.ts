import { execSync } from "child_process";
import { prisma } from "../src/utils/prisma.js";
import argon2 from "argon2";
import { Role, OrderStatus, PaymentStatus } from "@prisma/client";

const DB_PATH = "./scripts/rotiserie-legacy.db";

function querySQLite(sql: string): any[] {
  const output = execSync(`sqlite3 ${DB_PATH} -json "${sql}"`, { encoding: "utf-8" });
  return output.trim() ? JSON.parse(output) : [];
}

const ROLE_MAP: Record<string, Role> = {
  admin: Role.ADMIN,
  bucatarie: Role.KITCHEN,
  staff: Role.CUSTOMER,
};

const STATUS_MAP: Record<string, OrderStatus> = {
  primita: OrderStatus.RECEIVED,
  primită: OrderStatus.RECEIVED,
  "în preparare": OrderStatus.PREPARING,
  "in preparare": OrderStatus.PREPARING,
  gata: OrderStatus.READY,
  "în livrare": OrderStatus.OUT_FOR_DELIVERY,
  "in livrare": OrderStatus.OUT_FOR_DELIVERY,
  livrată: OrderStatus.DELIVERED,
  livrata: OrderStatus.DELIVERED,
  anulată: OrderStatus.CANCELLED,
  anulata: OrderStatus.CANCELLED,
};

async function migrateUsers() {
  const rows = querySQLite("SELECT * FROM users WHERE active = 1");
  console.log(`Migrating ${rows.length} users...`);

  for (const row of rows) {
    const tempPassword = await argon2.hash("TempPass123!");
    await prisma.user.upsert({
      where: { email: row.email || `${row.username}@rotiserie.ro` },
      update: {},
      create: {
        email: row.email || `${row.username}@rotiserie.ro`,
        password: tempPassword,
        name: row.username,
        role: ROLE_MAP[row.role] || Role.CUSTOMER,
        phone: row.pin ? `07${row.pin}` : null,
        isActive: true,
      },
    });
  }
  console.log("Users migrated. Temp password for all: TempPass123!");
}

async function migrateCategories() {
  const rows = querySQLite("SELECT * FROM categories WHERE active = 1 ORDER BY sort_order");
  console.log(`Migrating ${rows.length} categories...`);

  for (const row of rows) {
    const slug = row.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: row.name,
        slug,
        description: row.description,
        image: row.image,
        sortOrder: row.sort_order || 0,
        isActive: true,
      },
    });
  }
  console.log("Categories migrated.");
}

async function migrateProducts() {
  const rows = querySQLite("SELECT * FROM products WHERE available = 1");
  console.log(`Migrating ${rows.length} products...`);

  // Build category slug map
  const catRows = querySQLite("SELECT id, name FROM categories");
  const catMap = new Map<number, string>();
  for (const c of catRows) {
    const slug = c.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    catMap.set(c.id, slug);
  }

  for (const row of rows) {
    const category = await prisma.category.findUnique({
      where: { slug: catMap.get(row.category_id) || "unknown" },
    });

    if (!category) {
      console.warn(`Skipping product ${row.name}: category not found`);
      continue;
    }

    await prisma.product.upsert({
      where: { id: row.id },
      update: {},
      create: {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price.toFixed(2),
        image: row.image,
        categoryId: category.id,
        isFeatured: row.featured === 1,
        isAvailable: true,
        sortOrder: row.sort_order || 0,
      },
    });
  }
  console.log("Products migrated.");
}

async function migrateOrders() {
  const rows = querySQLite("SELECT * FROM orders");
  console.log(`Migrating ${rows.length} orders...`);

  for (const row of rows) {
    const items = querySQLite(`SELECT * FROM order_items WHERE order_id = ${row.id}`);

    const orderTotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    await prisma.order.create({
      data: {
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerAddress: row.customer_address,
        total: orderTotal.toFixed(2),
        status: STATUS_MAP[row.status] || OrderStatus.RECEIVED,
        paymentMethod: row.payment_method || "cash",
        paymentStatus: row.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING,
        notes: row.notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.product_id,
            name: item.product_name,
            price: item.price.toFixed(2),
            quantity: item.quantity,
          })),
        },
        statusHistory: {
          create: {
            status: STATUS_MAP[row.status] || OrderStatus.RECEIVED,
            notes: "Migrated from legacy system",
          },
        },
      },
    });
  }
  console.log("Orders migrated.");
}

async function migrateSettings() {
  const rows = querySQLite("SELECT * FROM settings");
  console.log(`Migrating ${rows.length} settings...`);

  for (const row of rows) {
    await prisma.setting.upsert({
      where: { key: row.key },
      update: { value: row.value },
      create: { key: row.key, value: row.value },
    });
  }
  console.log("Settings migrated.");
}

async function migrateBusinessHours() {
  const rows = querySQLite("SELECT * FROM business_hours");
  console.log(`Migrating ${rows.length} business hours...`);

  for (const row of rows) {
    const dayMap: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6,
      duminica: 0, luni: 1, marti: 2, miercuri: 3,
      joi: 4, vineri: 5, sambata: 6,
    };
    const dayOfWeek = dayMap[row.day_of_week.toLowerCase()];
    if (dayOfWeek === undefined) {
      console.warn(`Unknown day: ${row.day_of_week}`);
      continue;
    }

    await prisma.businessHour.upsert({
      where: { dayOfWeek },
      update: {
        openTime: row.open_time || "10:00",
        closeTime: row.close_time || "22:00",
        isClosed: row.is_open === 0,
      },
      create: {
        dayOfWeek,
        openTime: row.open_time || "10:00",
        closeTime: row.close_time || "22:00",
        isClosed: row.is_open === 0,
      },
    });
  }
  console.log("Business hours migrated.");
}

async function main() {
  console.log("=== Legacy SQLite → PostgreSQL Migration ===\n");

  await migrateUsers();
  await migrateCategories();
  await migrateProducts();
  await migrateOrders();
  await migrateSettings();
  await migrateBusinessHours();

  console.log("\n=== Migration Complete ===");
  console.log("All users have temporary password: TempPass123!");
  console.log("Please inform users to reset their passwords.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
