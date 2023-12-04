import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(request, response) {
    try {
        const userSession = await getSession(request, response);

        if (!userSession) {
            return response.status(401).json({ error: "User not authenticated" });
        }

        const mongoClient = await clientPromise;
        const database = mongoClient.db("DummyChatbot");

        const { chatId, role, content } = request.body;

        try {
            const objectId = new ObjectId(chatId);

            // Validate content data
            if (!isValidContent(content, role)) {
                return response.status(422).json({ error: "Invalid content or role" });
            }

            const updatedChat = await updateChat(database, objectId, userSession.user.sub, role, content);

            response.status(200).json({
                chat: {
                    ...updatedChat.value,
                    _id: updatedChat.value._id.toString(),
                },
            });
        } catch (error) {
            response.status(422).json({ error: "Invalid chat ID" });
        }
    } catch (error) {
        response.status(500).json({ error: "An error occurred when adding a message to a chat" });
    }
}

function isValidContent(content, role) {
    return (
        content &&
        typeof content === "string" &&
        ((role === "user" && content.length <= 200) || (role === "assistant" && content.length <= 100000))
    );
}

async function updateChat(db, objectId, userId, role, content) {
    return db.collection("chats").findOneAndUpdate(
        { _id: objectId, userId },
        {
            $push: {
                messages: {
                    role,
                    content,
                },
            },
        },
        { returnDocument: "after" }
    );
}
