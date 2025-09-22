import { Request, Response } from "express";
import { Product } from "../models/productModel";
import { ProductItem } from "../models/productItemModel";

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
        if (minPrice) items = items.filter((i) => i.price >= Number(minPrice));
        if (maxPrice) items = items.filter((i) => i.price <= Number(maxPrice));

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
