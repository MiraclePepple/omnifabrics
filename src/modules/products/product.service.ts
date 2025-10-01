import { Product } from './product.model';
import { ProductItem } from '../../modules/product_items/product_item.model';
import { User } from '../users/user.model';
import sequelize from '../../config/db';
import { Op } from 'sequelize';
import Store from '../store/store.model';

export class ProductService {

  // Create a new product
  static async createProduct(user_id: number, productData: any) {
    const user = await User.findByPk(user_id);
    if (!user || !user.is_seller) throw new Error('User is not a seller');

    const store = await Store.findByPk(productData.store_id);
    if (!store) throw new Error('Store not found');

    // Validate minimum 3 images
    if (!productData.images || productData.images.length < 3) {
      throw new Error('Minimum of 3 images required');
    }
    if (!productData.category_id) throw new Error("category_id is required");

    // Create product
    const product = await Product.create({
      user_id,
      store_id: productData.store_id,
      category_id: productData.category_id,
      product_name: productData.product_name,
      short_description: productData.short_description,
      full_description: productData.full_description,
      images: productData.images,
      rating: 0,
      is_active: true,
      discount_rate: productData.discount_rate || 0,
      discount_start_date: productData.discount_start_date || null,
      discount_end_date: productData.discount_end_date || null,
    });

    // Add product variants/items if provided
    if (productData.variants && productData.variants.length > 0) {
      const productItems = productData.variants.map((v: any) => ({
        product_id: product.product_id,
        color: v.color,
        quantity: v.quantity,
        price: v.price,
        is_available: v.quantity > 0,
      }));
      await ProductItem.bulkCreate(productItems);
    }

    return product;
  }

  // Update product
  static async updateProduct(user_id: number, product_id: number, updateData: any) {
    const product = await Product.findByPk(product_id);
    if (!product) throw new Error('Product not found');
    if (product.user_id !== user_id) throw new Error('Unauthorized');

    await product.update({
      product_name: updateData.product_name || product.product_name,
      short_description: updateData.short_description || product.short_description,
      full_description: updateData.full_description || product.full_description,
      images: updateData.images || product.images,
      discount_rate: updateData.discount_rate ?? product.discount_rate,
      discount_start_date: updateData.discount_start_date ?? product.discount_start_date,
      discount_end_date: updateData.discount_end_date ?? product.discount_end_date,
      is_active: updateData.is_active ?? product.is_active,
    });

    if (updateData.variants) {
      for (const v of updateData.variants) {
        const item = await ProductItem.findByPk(v.product_item_id);
        if (item) {
          await item.update({
            color: v.color ?? item.color,
            quantity: v.quantity ?? item.quantity,
            price: v.price ?? item.price,
            is_available: (v.quantity ?? item.quantity) > 0,
          });
        }
      }
    }

    return product;
  }

  // Disable product
  static async disableProduct(user_id: number, product_id: number) {
    const product = await Product.findByPk(product_id);
    if (!product) throw new Error('Product not found');
    if (product.user_id !== user_id) throw new Error('Unauthorized');

    await product.update({ is_active: false });
    return { message: 'Product disabled successfully' };
  }

  // Delete product
  static async deleteProduct(user_id: number, product_id: number) {
    const product = await Product.findByPk(product_id);
    if (!product) throw new Error('Product not found');
    if (product.user_id !== user_id) throw new Error('Unauthorized');

    await product.destroy();
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
      is_active: true
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
        }
      ],
      order: filter?.sortBy === 'latest' ? [['created_at', 'DESC']] :
             filter?.sortBy === 'oldest' ? [['created_at', 'ASC']] :
             filter?.sortBy === 'rating' ? [['rating', 'DESC']] : undefined
    });

    return products;
  }

  // Get single product with variants
  static async getProductById(product_id: number) {
    const product = await Product.findByPk(product_id, {
      include: [{ model: ProductItem, as: 'variants' }]
    });
    if (!product) throw new Error('Product not found');
    return product;
  }
}
