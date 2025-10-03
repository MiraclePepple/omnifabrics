// src/modules/reviews/review.service.ts
import Review from "./review.model";
import { Product } from "../products/product.model";

class ReviewService {
  // Create a review and update product rating
  async createReview(
    productId: number,
    userId: number,
    orderId: number | null,
    rating: number,
    comment?: string
  ) {
    if (!productId) throw new Error("productId is required");
    if (!userId) throw new Error("userId is required");
    if (!rating) throw new Error("rating is required");

    // Create the review
    const review = await Review.create({
      product_id: productId,
      user_id: userId,
      order_id: orderId || null,
      rating,
      comment: comment || null,
    });

    // Recalculate product rating summary
    const stats = (await Review.findOne({
      where: { product_id: productId },
      attributes: [
        [Review.sequelize!.fn("AVG", Review.sequelize!.col("rating")), "avg"],
        [Review.sequelize!.fn("COUNT", Review.sequelize!.col("review_id")), "count"],
      ],
      raw: true,
    })) as { avg: string; count: string } | null;

    const avg = stats && stats.avg ? parseFloat(stats.avg).toFixed(2) : "0.00";
    const count = stats && stats.count ? parseInt(stats.count, 10) : 0;

    await Product.update(
      { rating_avg: avg, rating_count: count },
      { where: { product_id: productId } }
    );

    return review;
  }

  // Get all reviews for a product
  async getProductReviews(productId: number) {
    if (!productId) throw new Error("productId is required");

    return Review.findAll({
      where: { product_id: productId },
      order: [["created_at", "DESC"]],
    });
  }

  // Delete a review and update product rating
  async deleteReview(reviewId: number, userId: number) {
    if (!reviewId) throw new Error("reviewId is required");
    if (!userId) throw new Error("userId is required");

    const review = await Review.findOne({
      where: { review_id: reviewId, user_id: userId },
    });

    if (!review) throw new Error("Review not found or not authorized");

    await review.destroy();

    // Update product rating after deletion
    const reviews = await Review.findAll({ where: { product_id: review.product_id } });
    const count = reviews.length;
    const avg = count > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(2) : "0.00";

    await Product.update(
      { rating_avg: avg, rating_count: count },
      { where: { product_id: review.product_id } }
    );

    return { message: "Review deleted" };
  }
}

export default new ReviewService();
