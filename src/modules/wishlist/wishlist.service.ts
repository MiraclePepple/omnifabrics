import { Wishlist } from './wishlist.model';
import { ProductItem } from '../product_items/product_item.model';

export const addToWishlist = async (userId:number, data:any) => {
  // Optionally check duplicates
  return Wishlist.create({ user_id: userId, ...data, created_at: new Date() });
};

export const listWishlist = async (userId:number) => Wishlist.findAll({ where: { user_id: userId }});

export const removeFromWishlist = async (id:number, userId:number) => Wishlist.destroy({ where: { wish_id: id, user_id: userId }});
