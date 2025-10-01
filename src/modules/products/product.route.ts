import { Router } from "express";
import { ProductController } from "./product.controller";
import { authenticate } from "../../middlewares/validate.middleware";

const router = Router();

// Seller-only routes
router.post("/create", authenticate, ProductController.createProduct);
router.put("/update/:id", authenticate, ProductController.updateProduct);
router.patch("/disable/:id", authenticate, ProductController.disableProduct);
router.delete("/delete/:id", authenticate, ProductController.deleteProduct);
router.get("/my-products", authenticate, ProductController.listSellerProducts);

// Buyer routes
router.get("/search", ProductController.searchProducts);

export default router;
