import { Cart, CartItem } from './cart.model';
import { ProductItem } from '../product_items/product_item.model';

export const createCartIfNotExists = async (userId:number) => {
  let cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) cart = await Cart.create({ user_id: userId, created_at: new Date() });
  return cart;
};

export const addItemToCart = async (userId:number, payload:{ product_id:number, product_item_id:number, quantity:number }) => {
  const cart = await createCartIfNotExists(userId);
  // check stock
  const item = await ProductItem.findByPk(payload.product_item_id);
  if (!item || Number(item.get('quantity')) < payload.quantity) {
    throw new Error('Insufficient stock or item not found');
  }
  const cartItem = await CartItem.create({
    cart_id: cart.get('cart_id'),
    product_id: payload.product_id,
    product_item_id: payload.product_item_id,
    quantity: payload.quantity
  });
  return cartItem;
};

export const listCartItems = async (userId:number) => {
  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) return [];
  return CartItem.findAll({ where: { cart_id: cart.get('cart_id') } });
};

export const removeCartItem = async (cartItemId:number) => CartItem.destroy({ where: { cart_item_id: cartItemId } });
