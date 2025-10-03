import { Product } from './product.model';
import { ProductItem } from '../../modules/product_items/product_item.model';
import { Op } from 'sequelize';

export class ProductService {
  // Create a new product (seller only)
  static async createProduct(user_id: number, data: Partial<Product>) {
    const product = await Product.create({ ...data, user_id });
    return product;
  }

  // Update product (seller can only update their own product)
  static async updateProduct(user_id: number, product_id: number, data: Partial<Product>) {
    const product = await Product.findOne({ where: { product_id, user_id } });
    if (!product) throw new Error('Product not found or you do not have permission');
    await product.update(data);
    return product;
  }

  // Disable product (soft delete, seller only)
  static async disableProduct(user_id: number, product_id: number) {
    const product = await Product.findOne({ where: { product_id, user_id } });
    if (!product) throw new Error('Product not found or you do not have permission');
    await product.update({ is_active: false });
    return { message: 'Product disabled successfully' };
  }

  // Delete product (soft delete, seller only)
  static async deleteProduct(user_id: number, product_id: number) {
    const product = await Product.findOne({ where: { product_id, user_id } });
    if (!product) throw new Error('Product not found or you do not have permission');
    await product.update({ is_active: false });
    return { message: 'Product deleted successfully' };
  }

  // List seller products with optional filters
  static async listSellerProducts(user_id: number, filters?: any) {
    const where: any = { user_id };
    if (filters?.category_id) where.category_id = filters.category_id;
    if (filters?.is_active !== undefined) where.is_active = filters.is_active;

    const products = await Product.findAll({
      where,
      include: [{ model: ProductItem, as: 'variants' }],
    });

    return products;
  }

  // Search products for buyers with price filter on variants
  static async searchProducts(search: string, filter: any) {
    const where: any = {
      product_name: { [Op.like]: `%${search}%` },
      is_active: true,
    };

    const variantWhere: any = {};
    if (filter?.price_min) variantWhere.price = { [Op.gte]: filter.price_min };
    if (filter?.price_max) variantWhere.price = { ...variantWhere.price, [Op.lte]: filter.price_max };

    const products = await Product.findAll({
      where,
      include: [
        {
          model: ProductItem,
          as: 'variants',
          where: Object.keys(variantWhere).length ? variantWhere : undefined,
          required: false,
        },
      ],
      order:
        filter?.sortBy === 'latest'
          ? [['created_at', 'DESC']]
          : filter?.sortBy === 'oldest'
          ? [['created_at', 'ASC']]
          : filter?.sortBy === 'rating'
          ? [['rating', 'DESC']]
          : undefined,
    });

    return products;
  }

  // Get single product with variants (buyer view)
  static async getProductById(product_id: number) {
    const product = await Product.findByPk(product_id, {
      include: [{ model: ProductItem, as: 'variants' }],
    });
    if (!product) throw new Error('Product not found');
    return product;
  }
}
