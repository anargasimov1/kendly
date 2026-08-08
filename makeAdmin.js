import { User } from './src/models/index.js';
import { connectDB } from './src/config/db.js';

const makeAdmin = async (email) => {
  try {
    await connectDB();
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('İstifadəçi tapılmadı!');
      process.exit(1);
    }
    user.role = 'admin';
    await user.save();
    console.log(`Uğurlu! ${email} artıq Admin-dir.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Emaili buraya yazırıq
makeAdmin('suleymanovailahe012@gmail.com');
