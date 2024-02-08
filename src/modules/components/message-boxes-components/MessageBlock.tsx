import { Box } from "@mui/material";
import { useContext, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import MessageBox from "./MessageBox";

type msgBlockType = {
  conversationObject: any;
  userId: any;
  index: any;
};

const MessageBlock = ({ conversationObject, userId, index }: msgBlockType) => {
  const userContext = useContext(UserContext);
  const [convoDetails, setConvoDetails] = useState(conversationObject);
  const currentUser = userContext.currentUser?.id;

  return (
    <Box
      className="flex py-2 px-0 h-full overflow-auto"
      sx={{ flexDirection: userId === currentUser ? "row-reverse" : "row" }}
    >
      <MessageBox
        userId={userId}
        username={
          convoDetails.member !== undefined
            ? convoDetails.member.name
            : convoDetails.member_id
        }
        messageString={convoDetails.answer}
        time={convoDetails.created_at}
        attachments={
          convoDetails.attachments !== undefined
            ? convoDetails.attachments
            : null
        }
        replyConversationObject={convoDetails?.reply_conversation_object}
        convoId={conversationObject.id}
        conversationReactions={conversationObject.reactions}
        conversationObject={conversationObject}
        index={index}
      />
    </Box>
  );
};

export default MessageBlock;
