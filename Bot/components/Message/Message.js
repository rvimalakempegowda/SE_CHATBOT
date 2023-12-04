import { useUser } from "@auth0/nextjs-auth0/client";
import { faCommentAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export const Message = ({ role, content }) => {
  const { user } = useUser();

  const userAvatar = user ? (
    <Image
      src={user.picture}
      width={30}
      height={30}
      alt="User avatar"
      className="rounded-sm shadow-md shadow-black/50"
    />
  ) : (
    <div className="flex items-center justify-center h-[30px] w-[30px] rounded-sm shadow-md shadow-black/50 bg-red-950">
      <FontAwesomeIcon icon={faCommentAlt} className="text-white-500" />
    </div>
  );

  const assistantAvatar = (
    <div className="flex items-center justify-center h-[30px] w-[30px] rounded-sm shadow-md shadow-black/50 bg-red-950">
      <FontAwesomeIcon icon={faCommentAlt} className="text-white-500" />
    </div>
  );

  return (
    <div className={`grid grid-cols-[30px_1fr] gap-5 p-5 ${role === "assistant" ? "bg-orange-50"  : role === "notice" ? "bg-red-600" : ""}`}>
      <div>
        {role === "user" && user ? (
          userAvatar
        ) : (
          role === "user" && assistantAvatar
        )}

        {role === "assistant" && assistantAvatar}
      </div>
      <div className="prose prose-invert text-zinc-950 decoration-black  ">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
