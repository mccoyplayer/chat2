import React, { useContext, useEffect } from "react";
import MessageBlock from "../message-boxes-components/MessageBlock";
import ChatroomContext from "../../contexts/chatroomContext";

const BufferStack = ({ bufferMessage, updateHeight }: any) => {
  useEffect(() => {
    updateHeight();
  });
  const chatroomContext = useContext(ChatroomContext);
  return (
    <div
      className="ml-[28px] mr-[114px] pt-5 z:max-md:mr-[28px] z:max-sm:ml-2  z:max-sm:mr-0"
      key={bufferMessage.id}
    >
      <MessageBlock
        userId={bufferMessage.member_id}
        conversationObject={bufferMessage}
        index={chatroomContext.conversationList.length - 1}
      />
    </div>
  );
};

export default BufferStack;
