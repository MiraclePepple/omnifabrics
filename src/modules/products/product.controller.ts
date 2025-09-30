import { Request, Response } from 'express';
import { ProductService } from './product.service';

export class ProductController {

  static async createProduct(req: Request, res: Response) {
  try {
    const user_id = (req as any).user.user_id;

    // Validate required fields
    const { store_id, product_name, images } = req.body;
    if (!store_id) throw new Error('store_id is required');
    if (!product_name) throw new Error('product_name is required');
    if (!images || images.length < 3) throw new Error('At least 3 images are required');

    const product = await ProductService.createProduct(user_id, req.body);
    return res.json({ message: 'Product created', product });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

  static async updateProduct(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const product_id = parseInt(req.params.id);
      const product = await ProductService.updateProduct(user_id, product_id, req.body);
      return res.json({ message: 'Product updated', product });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async disableProduct(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const product_id = parseInt(req.params.id);
      const result = await ProductService.disableProduct(user_id, product_id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const product_id = parseInt(req.params.id);
      const result = await ProductService.deleteProduct(user_id, product_id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listSellerProducts(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const products = await ProductService.listSellerProducts(user_id, req.query);
      return res.json(products);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async searchProducts(req: Request, res: Response) {
    try {
      const { q, ...filter } = req.query;
      const products = await ProductService.searchProducts(q as string, filter);
      return res.json(products);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
