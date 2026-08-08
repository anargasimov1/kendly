import User from './userModel.js';
import Product from './productModel.js';
import Order from './orderModel.js';
import OrderItem from './orderItemModel.js';
import Category from './categoryModel.js';
import Region from './regionModel.js';
import Payment from './paymentModel.js';
import AuditLog from './auditLogModel.js';
import FarmerProfile from './farmerProfileModel.js';
import Review from './reviewModel.js';
import ContactMessage from './contactMessageModel.js';
import ContentPage from './contentPageModel.js';
import Cart from './cartModel.js';
import CartItem from './cartItemModel.js';
import Address from './addressModel.js';
import DeliveryZone from './deliveryZoneModel.js';
import NewsletterSubscriber from './newsletterSubscriberModel.js';
import Blog from './blogModel.js';
import ComboMenu from './comboMenuModel.js';
import ComboItem from './comboItemModel.js';
import Follow from './followModel.js';

// Category & Product
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Region & Product
Region.hasMany(Product, { foreignKey: 'region_id', as: 'products' });
Product.belongsTo(Region, { foreignKey: 'region_id', as: 'region' });

// User & Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order & OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product & OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order & Payment
Order.hasOne(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

// User & AuditLog
User.hasMany(AuditLog, { foreignKey: 'adminId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

// User & Follow (Many-to-Many for following farmers)
User.belongsToMany(User, { through: Follow, as: 'Following', foreignKey: 'follower_id', otherKey: 'following_id' });
User.belongsToMany(User, { through: Follow, as: 'Followers', foreignKey: 'following_id', otherKey: 'follower_id' });

// User & FarmerProfile (1-to-1)
User.hasOne(FarmerProfile, { foreignKey: 'user_id', as: 'farmerProfile' });
FarmerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Product & Owner (Farmer) (1-to-Many)
User.hasMany(Product, { foreignKey: 'owner_id', as: 'products' });
Product.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// User & Review (1-to-Many)
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Product & Review (1-to-Many)
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User & Blog (1-to-Many)
User.hasMany(Blog, { foreignKey: 'author_id', as: 'blogs' });
Blog.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// ComboMenu & ComboItem (1-to-Many)
ComboMenu.hasMany(ComboItem, { foreignKey: 'combo_id', as: 'items', onDelete: 'CASCADE' });
ComboItem.belongsTo(ComboMenu, { foreignKey: 'combo_id', as: 'combo' });

// Product & ComboItem (1-to-Many)
Product.hasMany(ComboItem, { foreignKey: 'product_id', as: 'comboItems' });
ComboItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// === YENİ ƏLAQƏLƏR === //

// User & Cart (1-to-One / 1-to-Many aktiv səbətlərə görə dəyişə bilər, amma 1 User-ın 1 aktiv Cart-ı olur əsasən)
User.hasMany(Cart, { foreignKey: 'user_id', as: 'carts' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Cart & CartItem
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

// Product & CartItem
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User & Address
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order & Address
Address.hasMany(Order, { foreignKey: 'address_id', as: 'orders' });
Order.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });

// Order & Cart
Cart.hasOne(Order, { foreignKey: 'cart_id', as: 'order' });
Order.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });


export {
  User,
  Product,
  Order,
  OrderItem,
  Category,
  Region,
  Payment,
  AuditLog,
  FarmerProfile,
  Review,
  ContactMessage,
  ContentPage,
  Cart,
  CartItem,
  Address,
  DeliveryZone,
  NewsletterSubscriber,
  Blog,
  ComboMenu,
  ComboItem,
  Follow
};
