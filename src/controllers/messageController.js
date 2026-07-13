import {MessageService} from "../services/messageService.js";


const messageService = new MessageService();

export class MessageController {

    async createMessage(req, res) {
        try {
            const { message, email, phone } = req.body;
            const result = await messageService.createMessage(message, email, phone);
            res.status(201).json(result);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Mesaj yaradılarkən xəta baş verdi" });
        }
    }

    async getMessages(req, res) {
        try {
           
            const messages = await messageService.getAllMessages();
            res.status(200).json(messages);
        }
        catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Mesajlar gətirilərkən xəta baş verdi" });
        }

    }

}
