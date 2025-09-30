// central import & association file
import '../modules/users/user.model';
import '../modules/store/store.model';
import '../modules/category/category.model';
import '../modules/products/product.model';
import '../modules/product_items/product_item.model';
import '../modules/cart/cart.model';
import '../modules/wishlist/wishlist.model';
import '../modules/ratings/rating.model';
import '../modules/orders/order.model';
import '../modules/wallet/wallet.model';
import '../modules/payment/payment.model';
import '../modules/notifications/notification.model';
import '../modules/admin/admin.model';
import '../modules/permissions/permission.model';
import '../modules/admin_permission/admin_permission.model';

import { User } from '../modules/users/user.model';
import { Store } from '../modules/store/store.model';
import { Category } from '../modules/category/category.model';
import { Product } from '../modules/products/product.model';
import { ProductItem } from '../modules/product_items/product_item.model';
import { Cart, CartItem } from '../modules/cart/cart.model';
import { Wishlist } from '../modules/wishlist/wishlist.model';
import { Rating } from '../modules/ratings/rating.model';
import { Order, OrderItem } from '../modules/orders/order.model';
import { Wallet, Transaction } from '../modules/wallet/wallet.model';
import { Payment } from '../modules/payment/payment.model';
import { Notification } from '../modules/notifications/notification.model';
import { Admin } from '../modules/admin/admin.model';
import { Permission } from '../modules/permissions/permission.model';
import { AdminPermission } from '../modules/admin_permission/admin_permission.model';
import { Card } from '../modules/card/card.model';

// Associations matching your ERD:

// Store & Wallet
Store.hasOne(Wallet, { foreignKey: 'store_id' });
Wallet.belongsTo(Store, { foreignKey: 'store_id' });

// Wallet ↔ Transactions
Wallet.hasMany(Transaction, { foreignKey: 'wallet_id' });
Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id' });

// User ↔ Store (owner)
User.hasMany(Store, { foreignKey: 'user_id' });
Store.belongsTo(User, { foreignKey: 'user_id' });

// Store ↔ Product
Store.hasMany(Product, { foreignKey: 'store_id' });
Product.belongsTo(Store, { foreignKey: 'store_id' });

// Category ↔ Product
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// Product ↔ ProductItem
Product.hasMany(ProductItem, { foreignKey: 'product_id', as: 'variants' });
ProductItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User ↔ Cart & CartItems
User.hasMany(Cart, { foreignKey: 'user_id' });
Cart.belongsTo(User, { foreignKey: 'user_id' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });

// CartItem ↔ Product & ProductItem
Product.hasMany(CartItem, { foreignKey: 'product_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });
ProductItem.hasMany(CartItem, { foreignKey: 'product_item_id' });
CartItem.belongsTo(ProductItem, { foreignKey: 'product_item_id' });

// Product ↔ Wishlist
Product.hasMany(Wishlist, { foreignKey: "product_id", as: "wishlists" });
Wishlist.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// Ratings
User.hasMany(Rating, { foreignKey: "user_id", as: "ratings" });
Rating.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(Wishlist, { foreignKey: "user_id", as: "wishlists" });
Wishlist.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Orders
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// Payments
Order.hasMany(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

// Notifications
Admin.hasMany(Notification, { foreignKey: 'admin_id' });
Notification.belongsTo(Admin, { foreignKey: 'admin_id' });
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Admin & Permission many-to-many
Admin.belongsToMany(Permission, { through: AdminPermission, foreignKey: 'admin_id' });
Permission.belongsToMany(Admin, { through: AdminPermission, foreignKey: 'permission_id' });

// Card
User.hasMany(Card, { foreignKey: 'user_id' });
Card.belongsTo(User, { foreignKey: 'user_id' });




export default {
  User, Store, Category, Product, ProductItem, Cart, CartItem,
  Wishlist, Rating, Order, OrderItem, Wallet, Transaction, Payment,
  Notification, Admin, Permission, AdminPermission, Card
};
