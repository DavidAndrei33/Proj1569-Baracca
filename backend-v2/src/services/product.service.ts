import { prisma } from "../utils/prisma.js";
import { getCache, setCache, delCache, delCachePattern } from "../utils/cache.js";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../validations/product.validation.js";

const CACHE_KEYS = {
  CATEGORIES: "categories:list",
  PRODUCTS: (query: string) => `products:list:${query}`,
  PRODUCT: (id: number) => `product:${id}`,
};

// Categories
export async function getCategories() {
  const cached = await getCache(CACHE_KEYS.CATEGORIES);
  if (cached) return cached;

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  await setCache(CACHE_KEYS.CATEGORIES, categories, 3600);
  return categories;
}

export async function getCategoryById(id: number) {
  return prisma.category.findUnique({ where: { id } });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function createCategory(data: CreateCategoryInput) {
  const category = await prisma.category.create({ data });
  await delCache(CACHE_KEYS.CATEGORIES);
  return category;
}

export async function updateCategory(id: number, data: UpdateCategoryInput) {
  const category = await prisma.category.update({ where: { id }, data });
  await delCache(CACHE_KEYS.CATEGORIES);
  await delCachePattern("products:list*");
  return category;
}

export async function deleteCategory(id: number) {
  const category = await prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
  await delCache(CACHE_KEYS.CATEGORIES);
  await delCachePattern("products:list*");
  return category;
}

// Products
export async function getProducts(query: ProductQueryInput, isAdmin = false) {
  const cacheKey = CACHE_KEYS.PRODUCTS(JSON.stringify({ ...query, isAdmin }));
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const where: any = {};

  if (!isAdmin) {
    where.isAvailable = true;
  }

  if (query.category) {
    const category = await prisma.category.findUnique({
      where: { slug: query.category },
    });
    if (category) {
      where.categoryId = category.id;
    }
  }

  if (query.featured !== undefined) {
    where.isFeatured = query.featured;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      ...(query.all ? {} : { skip, take: query.limit }),
    }),
    prisma.product.count({ where }),
  ]);

  const result = query.all ? {
    products,
    pagination: {
      page: 1,
      limit: total,
      total,
      totalPages: 1,
    },
  } : {
    products,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };

  await setCache(cacheKey, result, 300);
  return result;
}

export async function getProductById(id: number) {
  const cacheKey = CACHE_KEYS.PRODUCT(id);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (product) {
    await setCache(cacheKey, product, 300);
  }
  return product;
}

export async function createProduct(data: CreateProductInput) {
  const product = await prisma.product.create({
    data,
    include: { category: true },
  });
  await delCachePattern("products:list*");
  return product;
}

export async function updateProduct(id: number, data: UpdateProductInput) {
  const product = await prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });
  await delCache(CACHE_KEYS.PRODUCT(id));
  await delCachePattern("products:list*");
  return product;
}

export async function deleteProduct(id: number) {
  const product = await prisma.product.update({
    where: { id },
    data: { isAvailable: false },
  });
  await delCache(CACHE_KEYS.PRODUCT(id));
  await delCachePattern("products:list*");
  return product;
}
