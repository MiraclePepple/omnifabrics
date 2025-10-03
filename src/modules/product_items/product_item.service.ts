import { ProductItem } from '../product_items/product_item.model';

export class ProductItemService {
  // Create a new variant
  static async createProductItem(data: Partial<ProductItem>) {
    const item = await ProductItem.create(data);
    return item;
  }

  // Update variant
  static async updateProductItem(product_item_id: number, data: Partial<ProductItem>) {
    await ProductItem.update(data, { where: { product_item_id } });
    const updated = await ProductItem.findByPk(product_item_id);
    return updated;
  }

  // Delete a variant
  static async deleteProductItem(product_item_id: number) {
    await ProductItem.destroy({ where: { product_item_id } });
    return { message: "Product variant deleted successfully." };
  }

  // Get all variants for a product
  static async getVariantsByProduct(product_id: number) {
    const variants = await ProductItem.findAll({ where: { product_id } });
    return variants;
  }
}
