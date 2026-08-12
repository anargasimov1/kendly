import express from 'express';
import 'dotenv/config';
import { sequelize, connectDB } from './src/config/db.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import farmerRoutes from './src/routes/farmerRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import contentRoutes from './src/routes/contentRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import addressRoutes from './src/routes/addressRoutes.js';
import deliveryRoutes from './src/routes/deliveryRoutes.js';
import newsletterRoutes from './src/routes/newsletterRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js';
import comboRoutes from './src/routes/comboRoutes.js';
import { requestLogger } from './src/middleware/requestLogger.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import './src/models/index.js'; // Əlaqələri aktivləşdirmək üçün
import messageRouter from './src/routes/messageRouter.js';
import {swaggerDocs} from './src/swagger/swagger.js';

const app = express();
import cors from 'cors';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
swaggerDocs(app);

// Req logger (ən birinci çalışmalıdır)
app.use(requestLogger);

// Stripe webhook üçün xüsusi raw parser əlavə edilə bilər
// Cari halda hamısı üçün json işlədirik (Mock)

const port = process.env.PORT || 3000;

// API Marşrutları
app.use('/api/auth', authRoutes); // login, register, refresh, logout
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRouter);
app.use('/api/farmers', farmerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/pages', contentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/delivery-zones', deliveryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/combos', comboRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Bu endpoint mövcud deyil" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server xətası', details: String(err), stack: err.stack });
});

// Observability & Health endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/readiness', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unavailable', database: 'disconnected', error: error.message });
  }
});

// Zod, Sequelize və sairə xətaları tutacaq mərkəzləşdirilmiş errorHandler
// Bütün route'lardan sonra ən sona yazılmalıdır!
app.use(errorHandler);
// Serveri işə sal
const startServer = async () => {
  try {
    await connectDB();
    // Alter:true yığışdırıldı çünki PostgreSQL enum-ları ilə köklü konflikt yaradır.
    // Biz yeni masaları onsuz da raw SQL script ilə bir dəfəlik migrate edəcəyik!
    // await sequelize.sync();
    app.listen(port, () => console.log(`🚀 Server ${port} portunda işə düşdü`));
  } catch (error) {
    console.error('Xəta:', error.message);
  }
};

startServer();