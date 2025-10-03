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
import '../modules/card/card.model';
import Support from '../modules/support/support.model';
import Transaction from '../modules/payment/transaction.model';
import { Review } from '../modules/reviews/review.model';

// Model imports
import { User } from '../modules/users/user.model';
import { Store } from '../modules/store/store.model';
import { Category } from '../modules/category/category.model';
import { Product } from '../modules/products/product.model';
import { ProductItem } from '../modules/product_items/product_item.model';
import { Cart, CartItem } from '../modules/cart/cart.model';
import { Wishlist } from '../modules/wishlist/wishlist.model';
import { Rating } from '../modules/ratings/rating.model';
import { Order, OrderItem } from '../modules/orders/order.model';
import { Wallet } from '../modules/wallet/wallet.model';
import { Payment } from '../modules/payment/payment.model';
import { Notification } from '../modules/notifications/notification.model';
import { Admin } from '../modules/admin/admin.model';
import { Permission } from '../modules/permissions/permission.model';
import { AdminPermission } from '../modules/admin_permission/admin_permission.model';
import { Card } from '../modules/card/card.model';

// Associations

// Store & Wallet
Store.hasOne(Wallet, { foreignKey: 'store_id', as: 'wallet' });
Wallet.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Wallet ↔ Transactions
Wallet.hasMany(Transaction, { foreignKey: 'wallet_id', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Transaction.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User ↔ Store
User.hasMany(Store, { foreignKey: 'user_id', as: 'stores' });
Store.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// Store ↔ Product
Store.hasMany(Product, { foreignKey: 'store_id', as: 'products' });
Product.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Category ↔ Product
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Product ↔ ProductItem
Product.hasMany(ProductItem, { foreignKey: 'product_id', as: 'variants' });
ProductItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User ↔ Support
User.hasMany(Support, { foreignKey: 'userId', as: 'support_tickets' });
Support.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ Cart & CartItems
User.hasMany(Cart, { foreignKey: 'user_id', as: 'carts' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'cart_items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

// CartItem ↔ Product & ProductItem
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cart_items' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductItem.hasMany(CartItem, { foreignKey: 'product_item_id', as: 'cart_items_variant' });
CartItem.belongsTo(ProductItem, { foreignKey: 'product_item_id', as: 'product_variant' });
CartItem.belongsTo(ProductItem, { foreignKey: "product_item_id", as: "product_item" });

// Product ↔ Wishlist
Product.hasMany(Wishlist, { foreignKey: 'product_id', as: 'wishlists' });
Wishlist.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Ratings
User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Wishlist
User.hasMany(Wishlist, { foreignKey: 'user_id', as: 'wishlists' });
Wishlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Orders
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'order_items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'parent_order' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'ordered_items' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product_ordered' });
Order.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
Store.hasMany(Order, { foreignKey: 'store_id', as: 'orders' });

// Payments
Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });


// Notifications
Admin.hasMany(Notification, { foreignKey: 'admin_id', as: 'notifications' });
Notification.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Admin & Permission many-to-many
Admin.belongsToMany(Permission, { through: AdminPermission, foreignKey: 'admin_id', as: 'permissions' });
Permission.belongsToMany(Admin, { through: AdminPermission, foreignKey: 'permission_id', as: 'admins' });
AdminPermission.belongsTo(Permission, { foreignKey: 'permission_id', as: 'permission' });
Permission.hasMany(AdminPermission, { foreignKey: 'permission_id', as: 'admin_permissions' });

// Card
User.hasMany(Card, { foreignKey: 'user_id', as: 'cards' });
Card.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Reviews
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order_reviewed' });
Order.hasMany(Review, { foreignKey: 'order_id', as: 'reviews' });

// Export all models
export default {
  User, Store, Category, Product, ProductItem, Cart, CartItem,
  Wishlist, Rating, Order, OrderItem, Wallet, Transaction, Payment,
  Notification, Admin, Permission, AdminPermission, Card, Support, Review
};
