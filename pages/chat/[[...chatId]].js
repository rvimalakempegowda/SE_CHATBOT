import { ChatSidebar } from "components/ChatSidebar";
import Head from "next/head";
import { useEffect, useState } from "react";
import { streamReader } from "openai-edge-stream";
import { v4 as uuid } from 'uuid';
import { Message } from "components/Message";
import { useRouter } from "next/router";
import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";

export default function ChatPage({ initialChatId,initialMessages = [] }) {
  const [newChatId, setNewChatId] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [fullMessage, setFullMessage] = useState("");
  const [originalChatId, setOriginalChatId] = useState(initialChatId);
  const router = useRouter();

  const routeHasChanged = initialChatId !== originalChatId;

  useEffect(() => {
    resetChatState();
  }, [initialChatId]);

  useEffect(() => {
    handleIncomingMessage();
  }, [generatingResponse, fullMessage, routeHasChanged]);

  useEffect(() => {
    handleNewChat();
  }, [newChatId, generatingResponse, router]);

  const resetChatState = () => {
    setNewChatMessages([]);
    setNewChatId(null);
  };

  const handleIncomingMessage = () => {
    if (!routeHasChanged && !generatingResponse && fullMessage) {
      setNewChatMessages(prev => [
        ...prev,
        {
          _id: uuid(),
          role: "assistant",
          content: fullMessage
        }
      ]);
      setFullMessage("");
    }
  };

  const handleNewChat = () => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingResponse(true);
    setOriginalChatId(initialChatId);

    setNewChatMessages(prev => [
      ...prev,
      {
        _id: uuid(),
        role: "user",
        content: messageText,
      },
    ]);

    setMessageText("");

    const response = await fetch(`/api/chat/SendMessage`, {
      method: "POST",
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ chatId: initialChatId, message: messageText }),
    });

    const data = response.body;

    if (!data) {
      return;
    }

    const reader = data.getReader();
    let content = "";

    await streamReader(reader, (message) => {
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessage((s) => `${s}${message.content}`);
        content = content + message.content;
      }
    });

    setFullMessage(content);
    setIncomingMessage("");
    setGeneratingResponse(false);
  };

  const allMessages = [...initialMessages, ...newChatMessages];

  return (
    <>
      <Head>
        <title>New Chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={initialChatId} />
        <div className="bg-stone-500 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col-reverse text-white overflow-scroll">
            <div className="mb-auto">
              {allMessages.map(message => (
                <Message key={message._id} role={message.role} content={message.content} />
              ))}
              {!!incomingMessage && !routeHasChanged && (
                <Message role="assistant" content={incomingMessage} />
              )}
              {!!incomingMessage && !!routeHasChanged &&
                <Message role="notice" content="Only one message at a time. Please allow other responses to complete" />
              }
            </div>
          </div>
          <footer className="bg-stone-500 p-10">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={generatingResponse ? "" : "Send a message ..."}
                  className="w-full resize-none rounded-md bg-red-50 p-2 text-black focus:border-red-900 focus:bg-gray-300 focus:outline "
                />
                <button type="submit" className="btn">
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const initialChatId = ctx.params?.chatId?.[0] || null;

  if (initialChatId) {
    let objectId;

    try {
      objectId = new ObjectId(initialChatId);
    } catch (e) {
      return {
        redirect: {
          destination: "/chat"
        },
      };
    }
    const { user } = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("DummyChatbot");
    const chat = await db.collection("chats").findOne({
      userId: user.sub,
      _id: objectId,
    });

    if (!chat) {
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }
    return {
      props: {
        initialChatId,
        initialTitle: chat.title,
        initialMessages: chat.messages.map(message => ({
          ...message,
          _id: uuid(),
        }))
      },
    };
  }
  return {
    props: {}
  };
};
