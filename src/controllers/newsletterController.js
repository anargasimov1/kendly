import { NewsletterSubscriber } from '../models/index.js';
import { Op } from 'sequelize';

// Mock verification function (gələcəkdə util/notification olacaq)
const sendVerification = async (channel, destination, code) => {
  console.log(`[MOCK NOTIFICATION] OTP sent via ${channel} to ${destination}: ${code}`);
  return true;
};

class NewsletterController {

  // Abunə ol
  async subscribe(req, res, next) {
    try {
      const { email, whatsapp, telegram } = req.body;

      if (!email && !whatsapp && !telegram) {
         return res.status(400).json({ error: "Ən azı bir kanal (email, whatsapp və ya telegram) təmin edilməlidir." });
      }

      // Varsa tap, yoxsa yarat
      let subscriber = await NewsletterSubscriber.findOne({
         where: {
           [Op.or]: [
             email ? { email } : null,
             whatsapp ? { whatsapp } : null,
             telegram ? { telegram } : null
           ].filter(Boolean)
         }
      });

      if (!subscriber) {
         subscriber = await NewsletterSubscriber.create({ email, whatsapp, telegram });
      } else {
         if (email) subscriber.email = email;
         if (whatsapp) subscriber.whatsapp = whatsapp;
         if (telegram) subscriber.telegram = telegram;
         await subscriber.save();
      }

      // Şərti OTP / link göndərimi (Hər bir fərqli kanal üçün)
      const pin = Math.floor(1000 + Math.random() * 9000); // MOCK PIN
      if (email) await sendVerification('email', email, pin);
      if (whatsapp) await sendVerification('whatsapp', whatsapp, pin);
      if (telegram) await sendVerification('telegram', telegram, pin);

      res.status(200).json({ 
        message: "Təsdiq kodu müvafiq kanallara göndərildi. Zəhmət olmasa təsdiq edin.",
        id: subscriber.id,
        // Yalnız test mühiti üçün. Normalda qaytarılmır.
        _mock_pin: pin 
      });
    } catch (error) {
      next(error);
    }
  }

  // Təsdiqlə
  async verify(req, res, next) {
    try {
       const { id, code } = req.body; // Gələcəkdə code doğrulaması redis-də saxlana bilər.

       if (!id || !code) {
           return res.status(400).json({ error: "id və təsdiq code-u mütləqdir" });
       }

       const subscriber = await NewsletterSubscriber.findByPk(id);
       if (!subscriber) return res.status(404).json({ error: "Abunəçi tapılmadı" });

       // Əgər code doğrudursa: (Yalandan qəbul edirik)
       subscriber.verified_at = new Date();
       subscriber.is_active = true;
       await subscriber.save();

       res.status(200).json({ message: "Abunəlik uğurla təsdiqləndi!" });
    } catch (error) {
      next(error);
    }
  }

  // Abunəlikdən çıx
  async unsubscribe(req, res, next) {
    try {
      const { email, whatsapp, telegram } = req.body;
      
      const subscriber = await NewsletterSubscriber.findOne({
         where: {
           [Op.or]: [
             email ? { email } : null,
             whatsapp ? { whatsapp } : null,
             telegram ? { telegram } : null
           ].filter(Boolean)
         }
      });

      if (subscriber) {
          subscriber.unsubscribed_at = new Date();
          subscriber.is_active = false;
          await subscriber.save();
      }

      res.status(200).json({ message: "Abunəlik uğurla ləğv edildi." });
    } catch (error) {
      next(error);
    }
  }

  // Admin üçün abunəçilərin listələnməsi
  async adminList(req, res, next) {
    try {
      const { channel } = req.query; // 'email', 'whatsapp' və ya 'telegram'

      const whereClause = {};
      if (channel === 'email') whereClause.email = { [Op.not]: null };
      if (channel === 'whatsapp') whereClause.whatsapp = { [Op.not]: null };
      if (channel === 'telegram') whereClause.telegram = { [Op.not]: null };

      const subscribers = await NewsletterSubscriber.findAll({ where: whereClause, order: [['subscribed_at', 'DESC']] });

      // Əgər request-də format=csv gələrsə csv string yaradıb qaytarırıq (və ya download).
      if (req.query.export === 'csv') {
         const csvRows = [
           ['ID', 'Email', 'WhatsApp', 'Telegram', 'Active', 'Verified At', 'Subscribed At']
         ];
         
         subscribers.forEach(sub => {
             csvRows.push([
               sub.id,
               sub.email || '',
               sub.whatsapp || '',
               sub.telegram || '',
               sub.is_active ? 'Yes' : 'No',
               sub.verified_at ? sub.verified_at.toISOString() : '',
               sub.subscribed_at ? sub.subscribed_at.toISOString() : ''
             ]);
         });

         const csvString = csvRows.map(e => e.join(",")).join("\n");
         
         res.setHeader('Content-Type', 'text/csv');
         res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
         return res.send(csvString);
      }

      res.status(200).json(subscribers);
    } catch (error) {
      next(error);
    }
  }
}

export default new NewsletterController();
