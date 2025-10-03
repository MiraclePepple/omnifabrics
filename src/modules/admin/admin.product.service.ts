import { Product } from "../products/product.model";

class AdminProductService {
  async listAllProducts() {
    return await Product.findAll();
  }

  async createProduct(data: any) {
    return await Product.create(data);
  }

  async updateProduct(id: number, data: any) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Product not found");
    return await product.update(data);
  }

  async deleteProduct(id: number) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Product not found");
    await product.destroy();
    return { message: "Product deleted successfully" };
  }
}

export default new AdminProductService();
