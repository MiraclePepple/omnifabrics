import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/db";
import { Product } from "../products/product.model";
import { User } from "../users/user.model";

export class Review extends Model {
  public review_id!: number;
  public product_id!: number;
  public user_id!: number;
  public order_id!: number | null;
  public rating!: number;
  public comment!: string | null;
}

Review.init(
  {
    review_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Associations
Review.belongsTo(Product, { foreignKey: "product_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

export default Review;
