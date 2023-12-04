import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";

export default async function handler(request, response) {
    try {
        const userSession = await getSession(request, response);

        if (!userSession) {
            return response.status(401).json({ error: "User not authenticated" });
        }

        const { message } = request.body;

        // Validate message data
        if (!isValidMessage(message)) {
            return response.status(422).json({
                error: "Invalid message. It is required and must be less than 200 characters",
            });
        }

        const newUserMessage = {
            role: "user",
            content: message,
        };

        const mongoClient = await clientPromise;
        const database = mongoClient.db("DummyChatbot");

        const newChat = await createNewChat(database, userSession.user.sub, newUserMessage);

        response.status(200).json({
            _id: newChat.insertedId.toString(),
            messages: [newUserMessage],
            title: message,
        });
    } catch (error) {
        response.status(500).json({ error: "An error occurred while creating a new chat" });
        console.error("Error occurred in creating a new chat: ", error);
    }
}

function isValidMessage(message) {
    return message && typeof message === "string" && message.length <= 200;
}

async function createNewChat(db, userId, newUserMessage) {
    return db.collection("chats").insertOne({
        userId,
        messages: [newUserMessage],
        title: newUserMessage.content,
    });
}
