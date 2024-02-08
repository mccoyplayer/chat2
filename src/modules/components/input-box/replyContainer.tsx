/* eslint-disable react/require-default-props */
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React, { useContext } from "react";
import { getString, linkConverter, tagExtracter } from "../../../sdkFunctions";
import parse from "html-react-parser";
import { UserContext } from "../../contexts/userContext";
type ReplyBoxType = {
  openReplyBox: boolean;
  memberName: string;
  answer: string;
  setIsSelectedConversation: any;
  setSelectedConversation: any;
  attachments?: any;
};

const ReplyBox: React.FC<ReplyBoxType> = ({
  openReplyBox,
  memberName,
  answer,
  setIsSelectedConversation,
  setSelectedConversation,
  attachments,
}: ReplyBoxType) => {
  const userContext = useContext(UserContext);
  function renderAttachment() {
    switch (attachments[0].type) {
      case "image": {
        return (
          <img src={attachments[0]?.url} className="h-full w-full" alt="" />
        );
      }
      default:
        return <></>;
    }
  }

  return (
    <div
      className="w-full justify-between overflow-auto shadow-sm bg-white  h-[60px] mt-[-20px] max-h-[250px] rounded-[5px]"
      style={{
        display: openReplyBox ? "flex" : "none",
        // transform: "translate(0, -105%)",
      }}
    >
      <div className="border-l-4 border-l-green-500 px-2 text-[14px] grow flex">
        <div className="grow py-1">
          <p className="mb-2 text-green-500">{memberName}</p>
          <div className="w-[80%]" style={{}}>
            {parse(linkConverter(tagExtracter(answer, userContext, 1)))}
          </div>
        </div>

        <div className=" py-2">
          {attachments !== undefined ? <>{renderAttachment()}</> : null}
        </div>
      </div>
      <div>
        <IconButton
          onClick={() => {
            setIsSelectedConversation(false);
            setSelectedConversation({});
          }}
        >
          <Close />
        </IconButton>
      </div>
    </div>
  );
};

export default ReplyBox;
