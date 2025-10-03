import { Request, Response } from 'express';
import { ProductService } from './product.service';

export class ProductController {
  // Seller creates a product
  static async createProduct(req: Request, res: Response) {
    try {
      const user_id = req.user!.user_id;
      const product = await ProductService.createProduct(user_id, req.body);
      return res.status(201).json({ message: 'Product created', product });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Seller updates a product
  static async updateProduct(req: Request, res: Response) {
    try {
      const user_id = req.user!.user_id;
      const product_id = Number(req.params.id);
      const product = await ProductService.updateProduct(user_id, product_id, req.body);
      return res.json({ message: 'Product updated', product });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Seller disables (hides) a product
  static async disableProduct(req: Request, res: Response) {
    try {
      const user_id = req.user!.user_id;
      const product_id = Number(req.params.id);
      const result = await ProductService.disableProduct(user_id, product_id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Seller deletes a product
  static async deleteProduct(req: Request, res: Response) {
    try {
      const user_id = req.user!.user_id;
      const product_id = Number(req.params.id);
      const result = await ProductService.deleteProduct(user_id, product_id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Seller lists their products
  static async listSellerProducts(req: Request, res: Response) {
    try {
      const user_id = req.user!.user_id;
      const products = await ProductService.listSellerProducts(user_id, req.query);
      return res.json({ products });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Buyer searches for products
  static async searchProducts(req: Request, res: Response) {
    try {
      const { q, ...filters } = req.query;
      if (!q) return res.status(400).json({ error: 'Search query missing' });
      const products = await ProductService.searchProducts(q as string, filters);
      return res.json({ products });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Get single product (buyer view)
  static async getProduct(req: Request, res: Response) {
    try {
      const product_id = Number(req.params.id);
      const product = await ProductService.getProductById(product_id);
      return res.json({ product });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
