import { faFileExport, faPlus, faComment, faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
import download  from 'downloadjs'; // Import the download function

export const ChatSidebar = ({ chatId }) => {
  const [messageList, chatList] = useState([]);

  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch('/api/chat/getChatList', {
        method: "POST",
      });
      const json = await response.json();
      console.log("CHAT LIST: ", json);
      chatList(json?.chats || []);
    };
    loadChatList();
  }, [chatId]);

  // Function to export props in .txt format
const exportProps = () => {
  // Filter mesaageList to include only the chat with a matching chatId
  const selectedChat = messageList.find((chat) => chat._id === chatId);

  if (!selectedChat) {
    console.error("Chat not found");
    return;
  }

  // Extract messages (role and content) from the selected chat
  const selectedChatMessages = selectedChat.messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  // Convert messages to a formatted text representation
  const formattedText = selectedChatMessages
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n');

  // Trigger the download using the downloadjs library
  download(formattedText, 'exportedProps.txt', 'text/plain');
};
const sideMenuItemClass = "side-menu-item hover:bg-stone-500";
const activeChatClass = "bg-stone-700 text-white hover:bg-stone-500";
const shouldShowExportButton = true; // Update this based on your condition

return (
  <nav className="bg-red-950 text-white flex flex-col overflow-scroll">
    <Link href="/chat" className={`${sideMenuItemClass} text-white bg-stone-500 hover:bg-stone-600`}>
      <FontAwesomeIcon icon={faPlus} /> New chat
    </Link>
    <div className="flex-1 bg-red-950">
      {messageList.map((chat) => (
        <Link key={chat._id} href={`/chat/${chat._id}`} className={`${sideMenuItemClass} ${activeChatClass}`}>
          <FontAwesomeIcon icon={faComment} /><span title={chat.title} className="overflow-hidden text-ellipsis whitespace-nowrap">{chat.title}</span>
        </Link>
      ))}
    </div>
    {shouldShowExportButton && (
      <button className={sideMenuItemClass} onClick={exportProps}>
        <FontAwesomeIcon icon={faFileExport} /> Export Props
      </button>
    )}
    <Link href="/api/auth/logout" className={sideMenuItemClass}>
      <FontAwesomeIcon icon={faSignOutAlt} /> Logout
    </Link>
  </nav>
);
};
