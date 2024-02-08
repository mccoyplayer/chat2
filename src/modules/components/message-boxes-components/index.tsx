/* eslint-disable no-use-before-define */
import React, { useContext } from "react";
import MessageBlock from "./MessageBlock";
import ChatroomContext from "../../contexts/chatroomContext";

type regularBoxType = {
  convoArray: any;
};

const RegularBox = ({ convoArray }: regularBoxType) => {
  const chatroomContext = useContext(ChatroomContext);
  return (
    <div className="ml-[28px] mr-[114px] pt-5">
      <DateSpecifier dateString={convoArray[0].date} />

      {convoArray.map((conversation: any, _conversationIndex: any) => (
        <MessageBlock
          userId={conversation.member.id}
          conversationObject={conversation}
          key={conversation.id}
          index={chatroomContext.conversationList.length - 1}
        />
      ))}
    </div>
  );
};
export default RegularBox;

export const DateSpecifier = ({ dateString }: any) => (
  <div className="border-b border-solid border-[#EEEEEE] relative my-5 flex justify-center items-center">
    <div className="border-[#EEEEEE] border-solid border py-1 px-3 text-[10px] line-height-[12px] font-normal rounded-[20px] absolute bg-white">
      {dateString}
    </div>
  </div>
);
