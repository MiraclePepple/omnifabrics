import { Rating } from './rating.model';
import { Product } from '../products/product.model';
import { Order } from '../orders/order.model';

export const createRating = async (userId:number, data:any) => {
  return Rating.create({ user_id: userId, ...data, created_at: new Date() });
};

export const getRatingsForProduct = async (productId:number) => Rating.findAll({ where: { product_id: productId }});
