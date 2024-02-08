import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { log } from "../../../sdkFunctions";
import routeVariable from "../../../enums/routeVariables";

type GroupHomeTileProps = {
  groupTitle: any;
  chatroomId: any;
  isSecret: any;
  unseenConversationCount: any;
};
const GroupHomeTile = ({
  groupTitle,
  chatroomId,
  isSecret,
  unseenConversationCount,
}: GroupHomeTileProps) => {
  const [unreadMessages, setUnreadMessages] = useState<number>(
    unseenConversationCount,
  );
  const params = useParams();
  const id: any = params[routeVariable.id];
  const mode: any = params[routeVariable.mode];
  const operation: any = params[routeVariable.operation];
  return (
    <div
      className="flex justify-between py-4 px-5 border-[#EEEEEE] border-t-[1px] items-center"
      style={{ backgroundColor: chatroomId === id ? "#ECF3FF" : "#FFFFFF" }}
      onClick={() => {
        setUnreadMessages(0);
      }}
    >
      <Typography
        sx={{ color: chatroomId == id ? "#3884f7" : "#000000" }}
        component="span"
        className="text-4 text-[#323232] leading-[17px]"
      >
        {groupTitle}
        {isSecret === true ? (
          <span className="bg-[#FFEFC6] rounded-[4px] px-[6px] py-[5px] text-[#F6BD2A] line-height-[12px] text-[10px] font-medium m-1">
            Private
          </span>
        ) : null}
      </Typography>

      {unreadMessages > 0 && chatroomId != id ? (
        <span className="text-[#3884f7] text-xs">
          {unreadMessages} new messages
        </span>
      ) : null}
    </div>
  );
};
export { GroupHomeTile };
