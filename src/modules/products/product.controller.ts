import { Request, Response } from "express";
import { Op } from 'sequelize';
import { Product } from "./product.model";
import { ProductItem } from "../product_items/product_item.model";

// Filter products based on price range, availability, and sort order
export const filterProductsWithItems = async (req: Request, res: Response) => {
  try {
    const { minPrice, maxPrice, sortBy } = req.query;

    // Build where clause for products
    const productWhere: any = { is_active: 1 };

    // Build order clause
    let orderClause: any = [["created_at", "DESC"]]; // default: latest

    if (sortBy === "oldest") orderClause = [["created_at", "ASC"]];
    else if (sortBy === "priceAsc") orderClause = [["discount_rate", "ASC"]];
    else if (sortBy === "priceDesc") orderClause = [["discount_rate", "DESC"]];
    else if (sortBy === "rating") orderClause = [["rating", "DESC"]];

    // Fetch products
    const products = await Product.findAll({
      where: productWhere,
      order: orderClause,
    });

    // For each product, get available product items and apply price filter
    const results = await Promise.all(
      products.map(async (product) => {
        let items = await ProductItem.findAll({
          where: {
            product_id: product.product_id,
            is_available: 1,
          },
        });

        // Filter by price if specified
        if (minPrice) {items = items.filter((i: ProductItem) => i.price !== null && i.price >= Number(minPrice));}
        if (maxPrice) {items = items.filter((i: ProductItem) => i.price !== null && i.price <= Number(maxPrice));}


        return {
          product_id: product.product_id,
          product_name: product.product_name,
          short_description: product.short_description,
          full_description: product.full_description,
          images: product.images,
          rating: product.rating,
          discount_rate: product.discount_rate,
          product_items: items.map((i) => ({
            product_item_id: i.product_item_id,
            color: i.color,
            price: i.price,
            quantity: i.quantity,
            is_available: i.is_available,
          })),
        };
      })
    );

    return res.json({ products: results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Fetch all products including related data if needed (like category or store)
    const products = await Product.findAll({
      include: [
        { association: "category" }, // if you have associations defined
        { association: "store" }
      ],
      order: [["createdAt", "DESC"]], // newest first
    });

    return res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { product_id } = req.params;

  try {
    const product = await Product.findByPk(product_id, {
      include: [
        { association: "category" },
        { association: "store" },
        { association: "productItems" }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      product
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  const { query } = req.query;

  try {
    const products = await Product.findAll({
      where: {
        product_name: {
          [Op.like]: `%${query}%`
        }
      },
      include: [
        { association: "category" },
        { association: "store" },
        { association: "productItems" }
      ]
    });

    return res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create({
      ...req.body,
      user_id: (req as any).user.user_id, // seller id from JWT
    });
    res.status(201).json({ message: "Product created", product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update a product (requires admin approval after update)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const product = await Product.findByPk(product_id);

    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.user_id !== (req as any).user.user_id)
      return res.status(403).json({ error: "Forbidden" });

    await product.update({ ...req.body, is_active: false }); // hide until admin approves
    res.json({ message: "Product updated and hidden until approval", product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Disable a product (manual hide)
export const disableProduct = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const product = await Product.findByPk(product_id);

    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.user_id !== (req as any).user.user_id)
      return res.status(403).json({ error: "Forbidden" });

    await product.update({ is_active: false });
    res.json({ message: "Product disabled", product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const product = await Product.findByPk(product_id);

    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.user_id !== (req as any).user.user_id)
      return res.status(403).json({ error: "Forbidden" });

    await product.destroy();
    res.json({ message: "Product deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// List all products for a seller
export const listProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({ where: { user_id: (req as any).user.user_id } });
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
