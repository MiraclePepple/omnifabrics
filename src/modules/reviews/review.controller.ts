import { Request, Response } from "express";
import reviewService from "./review.service";

class ReviewController {
  async create(req: Request, res: Response) {
    try {
      const { productId, userId, orderId, rating, comment } = req.body;
      const review = await reviewService.createReview(productId, userId, orderId || null, rating, comment);
      return res.status(201).json(review);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const reviews = await reviewService.getProductReviews(Number(productId));
      return res.json(reviews);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { reviewId, userId } = req.body;
      const result = await reviewService.deleteReview(Number(reviewId), Number(userId));
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default new ReviewController();
