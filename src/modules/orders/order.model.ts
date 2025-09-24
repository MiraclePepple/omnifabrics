import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/db";

export class Order extends Model {
  public order_id!: number;
  public user_id!: number;
  public store_id!: number;
  public total_amount!: number;
  public product_info!: string; // JSON string
  public delivery_details!: string; // JSON string
  public delivery_status!: string;
  public is_canceled!: boolean;
  public card_id!: number | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Order.init(
  {
    order_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: true },
    store_id: { type: DataTypes.BIGINT, allowNull: true },
    total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    product_info: { type: DataTypes.TEXT, allowNull: true },
    delivery_details: { type: DataTypes.TEXT, allowNull: true },
    delivery_status: { type: DataTypes.STRING(100), allowNull: true },
    is_canceled: { type: DataTypes.BOOLEAN, defaultValue: false },
    card_id: { type: DataTypes.BIGINT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: false,
  }
);

export class OrderItem extends Model {
  public order_item_id!: number;
  public order_id!: number;
  public product_id!: number;
  public product_item_id!: number | null; // optional variant or SKU
  public quantity!: number;
  public price!: number; // price per unit
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
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false }, // unit price
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "order_items",
    timestamps: false,
  }
);
