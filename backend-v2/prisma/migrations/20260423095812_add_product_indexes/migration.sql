-- CreateIndex
CREATE INDEX "products_category_id_is_available_is_featured_idx" ON "products"("category_id", "is_available", "is_featured");

-- CreateIndex
CREATE INDEX "products_sort_order_created_at_idx" ON "products"("sort_order", "created_at");
