import { Router } from "express";
import { MessageController } from "../controllers/messageController.js";

const messageController = new MessageController();
const messageRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Messages
 *     description: Contact / Messages APIs
 */

/**
 * @openapi
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     description: Send a contact or feedback message.
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - email
 *             properties:
 *               message:
 *                 type: string
 *                 example: Salam, məhsul haqqında məlumat almaq istəyirəm.
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               phone:
 *                 type: string
 *                 example: "+994501234567"
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: Salam, məhsul haqqında məlumat almaq istəyirəm.
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 phone:
 *                   type: string
 *                   example: "+994501234567"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
messageRouter.post("/", messageController.createMessage);

/**
 * @openapi
 * /api/messages:
 *   get:
 *     summary: Get all messages
 *     description: Retrieve all contact messages.
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   message:
 *                     type: string
 *                     example: Salam, məhsul haqqında məlumat almaq istəyirəm.
 *                   email:
 *                     type: string
 *                     example: user@example.com
 *                   phone:
 *                     type: string
 *                     example: "+994501234567"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 */
messageRouter.get("/", messageController.getMessages);

export default messageRouter;