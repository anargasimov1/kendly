import { ContactMessage } from '../models/index.js';

class ContactController {
  // İstifadəçidən mesaj qəbul etmək
  async sendMessage(req, res, next) {
    try {
      const { name, email, subject, message } = req.body;
      
      await ContactMessage.create({
        name,
        email,
        subject,
        message
      });

      res.status(201).json({ message: 'Mesajınız qəbul edildi. Tezliklə sizinlə əlaqə saxlayacağıq!' });
    } catch (error) {
      next(error);
    }
  }
}

export default new ContactController();
