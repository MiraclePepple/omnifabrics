import { Request, Response } from "express";
import AdminProductService from "./admin.product.service";

class AdminProductController {
  // Shared: Admins & Super Admins
  async listAllProducts(req: Request, res: Response) {
    try {
      const products = await AdminProductService.listAllProducts();
      res.json(products);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // Super Admin only
  async createProduct(req: Request, res: Response) {
    try {
      const product = await AdminProductService.createProduct(req.body);
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // Super Admin only
  async updateProduct(req: Request, res: Response) {
    try {
      const product = await AdminProductService.updateProduct(Number(req.params.id), req.body);
      res.json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // Super Admin only
  async deleteProduct(req: Request, res: Response) {
    try {
      const result = await AdminProductService.deleteProduct(Number(req.params.id));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default new AdminProductController();
