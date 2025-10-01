// src/modules/orders/order.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { Product } from "../products/product.model";

export class Order extends Model {
  public order_id!: number;
  public user_id!: number;
  public store_id!: number | null;
  public total_amount!: number;
  public product_info!: string;
  public delivery_details!: string;
  public delivery_status!: "pending" | "shipped" | "delivered" | "cancelled";
  public is_canceled!: boolean;
  public card_id!: number | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Order.init(
  {
    order_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    store_id: { type: DataTypes.BIGINT, allowNull: true },
    total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    product_info: { type: DataTypes.TEXT, allowNull: false },
    delivery_details: { type: DataTypes.TEXT, allowNull: false },
    delivery_status: { type: DataTypes.ENUM("pending","shipped","delivered","cancelled"), allowNull: false, defaultValue: "pending" },
    is_canceled: { type: DataTypes.BOOLEAN, defaultValue: false },
    card_id: { type: DataTypes.BIGINT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
    underscored: true,
  }
);

export class OrderItem extends Model {
  public order_item_id!: number;
  public order_id!: number;
  public product_id!: number;
  public product_item_id!: number | null;
  public quantity!: number;
  public price!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OrderItem.init(
  {
    order_item_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.BIGINT, allowNull: false },
    product_id: { type: DataTypes.BIGINT, allowNull: false },
    product_item_id: { type: DataTypes.BIGINT, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "order_item",
    timestamps: true,
    underscored: true,
  }
);

// Associations
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
