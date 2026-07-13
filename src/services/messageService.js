import Messages from "../models/messageModel.js";

export class MessageService {

    async createMessage(message, email, phone) {
        try {
            await Messages.create({ message, email, phone });
            return 'Mesaj uğurla yaradıldı';
        } catch (error) {
            console.error("Mesaj yaradılarkən xəta baş verdi:", error);
            throw error;
        }
    }

    async getAllMessages() {
        try {
            const messages = await Messages.findAll();
            return messages;
        }
        catch (error) {
            console.error("Mesajlar gətirilərkən xəta baş verdi:", error);
            throw error;
        }
    }
}