import { Router } from "express";
import reviewController from "./review.controller";

const router = Router();

router.post("/", reviewController.create);       // create review
router.get("/:productId", reviewController.list); // list reviews for a product
router.delete("/", reviewController.remove);      // delete review

export default router;
