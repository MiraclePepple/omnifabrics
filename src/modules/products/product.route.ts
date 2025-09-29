import { Router } from "express";
import {
  createProduct,
  updateProduct,
  disableProduct,
  deleteProduct,
  listProducts,
} from "./product.controller";
import { authenticate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/create-product", authenticate, createProduct);
router.put("/:product_id", authenticate, updateProduct);
router.patch("/disable/:product_id", authenticate, disableProduct);
router.delete("/:product_id", authenticate, deleteProduct);
router.get("/", authenticate, listProducts);

export default router;
