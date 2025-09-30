import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/db';

export class Card extends Model {
  public card_id!: number;
  public user_id!: number;
  public flw_token!: string; // Flutterwave token or card token
  public last4!: string;
  public brand!: string | null;
  public expiry_month!: string | null;
  public expiry_year!: string | null;
  public is_default!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

Card.init({
  card_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  flw_token: { type: DataTypes.STRING(255), allowNull: false },
  last4: { type: DataTypes.STRING(4), allowNull: false },
  brand: { type: DataTypes.STRING(50), allowNull: true },
  expiry_month: { type: DataTypes.STRING(2), allowNull: true },
  expiry_year: { type: DataTypes.STRING(4), allowNull: true },
  is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  tableName: 'cards',
  timestamps: false
});

export default Card;
