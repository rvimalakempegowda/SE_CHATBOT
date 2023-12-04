import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
    runtime: "edge",
};

export default async function handler(request) {
    try {
        const { chatId: chatIdFromParam, message } = await request.json();

        // Validate message data
        if (!isValidMessage(message)) {
            return new Response({
                error: "Invalid message. It is required and must be less than 200 characters",
            }, {
                status: 422,
            });
        }

        let chatId = chatIdFromParam;

        const initialChatMessage = {
            role: "system",
            content: "Your name is dummy chatbot",
        };

        let newChatId;
        let chatMessages = [];

        if (chatId) {
            // Add message to an existing chat
            chatMessages = await addMessageToChatApi(request, chatId, message, "user");
        } else {
            // Create a new chat
            const newChatResponse = await createNewChatApi(request, message);
            chatId = newChatResponse._id;
            newChatId = newChatResponse._id;
            chatMessages = newChatResponse.messages || [];
        }

        const messagesToInclude = getMessagesToInclude(chatMessages);

        const stream = await OpenAIEdgeStream("https://api.openai.com/v1/chat/completions", {
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            method: "POST",
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [initialChatMessage, ...messagesToInclude],
                stream: true,
            }),
        }, {
            onBeforeStream: ({ emit }) => {
                if (newChatId) {
                    emit(chatId, "newChatId");
                }
            },
            onAfterStream: async ({ fullContent }) => {
                await addMessageToChatApi(request, chatId, fullContent, "assistant");
            },
        });

        return new Response(stream);
    } catch (error) {
        return new Response(
            { error: "An error occurred in sendMessage" },
            { status: 500 },
        );
    }
}

function isValidMessage(message) {
    return message && typeof message === "string" && message.length <= 200;
}

async function addMessageToChatApi(req, chatId, content, role) {
    const response = await fetch(`${req.headers.get("origin")}/api/chat/addMessageToChat`, {
        method: "POST",
        headers: {
            'content-type': "application/json",
            cookie: req.headers.get("cookie"),
        },
        body: JSON.stringify({
            chatId,
            role,
            content,
        }),
    });

    const jsonResponse = await response.json();
    return jsonResponse.chat.messages || [];
}

async function createNewChatApi(req, message) {
    const response = await fetch(`${req.headers.get("origin")}/api/chat/createNewChat`, {
        method: "POST",
        headers: {
            'content-type': 'application/json',
            cookie: req.headers.get("cookie"),
        },
        body: JSON.stringify({
            message,
        }),
    });

    return await response.json();
}

function getMessagesToInclude(chatMessages) {
    const messagesToInclude = [];
    let usedTokens = 0;

    for (const chatMessage of chatMessages.reverse()) {
        const messageTokens = chatMessage.content.length / 4;
        usedTokens += messageTokens;

        if (usedTokens <= 2000) {
            messagesToInclude.push(chatMessage);
        } else {
            break;
        }
    }

    return messagesToInclude.reverse();
}
