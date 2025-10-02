import { Request, Response } from 'express';
import { Product } from '../products/product.model';
import Store from '../store/store.model';

export const AdminProductsController = {
  // PATCH /admin/products/:id/disable
  async disableProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const product = await Product.findByPk(id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      (product as any).is_active = false;
      await product.save();
      return res.json({ message: 'Product disabled' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  // PATCH /admin/products/:id/enable
  async enableProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const product = await Product.findByPk(id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      (product as any).is_active = true;
      await product.save();
      return res.json({ message: 'Product enabled' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  // PATCH /admin/stores/:id/disable
  async disableStore(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const store = await Store.findByPk(id);
      if (!store) return res.status(404).json({ message: 'Store not found' });

      (store as any).is_active = false;
      await store.save();
      return res.json({ message: 'Store disabled' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  // PATCH /admin/stores/:id/enable
  async enableStore(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const store = await Store.findByPk(id);
      if (!store) return res.status(404).json({ message: 'Store not found' });

      (store as any).is_active = true;
      await store.save();
      return res.json({ message: 'Store enabled' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },
};
