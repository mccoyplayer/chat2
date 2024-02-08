import { useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import { directMessageChatPath } from "../../../routes";
import { RouteContext } from "../../contexts/routeContext";
import { UserContext } from "../../contexts/userContext";
import { GeneralContext } from "../../contexts/generalContext";
import routeVariable from "../../../enums/routeVariables";

const DmTile = ({ profile }: any) => {
  const userContext = useContext(UserContext);
  const generalContext = useContext(GeneralContext);
  const params = useParams();
  const id: any = params[routeVariable.id];
  const routeContext = useContext(RouteContext);
  const [unreadMessages, setUnreadMessages] = useState(
    profile.unseen_conversation_count,
  );
  return (
    <Link
      // key={profile.chatroom.id.toString()}
      to={`${directMessageChatPath}/${profile.chatroom.id}`}
      style={{ textDecoration: "none" }}
      onClick={() => {
        routeContext.setIsNavigationBoxOpen(!routeContext.isNavigationBoxOpen);
        setUnreadMessages(0);
      }}
    >
      <div
        className="flex justify-between py-[16px] px-[20px] border-t border-solid border-[#EEEEEE] cursor-pointer"
        style={{
          backgroundColor:
            id === profile?.chatroom?.id.toString() ? "#ECF3FF" : "#FFFFFF",
        }}
      >
        <Typography
          component="span"
          className="text-base font-normal"
          sx={{
            color:
              id === profile?.chatroom?.id.toString() ? "#3884F7" : "#323232",
          }}
        >
          {userContext.currentUser.id === profile.chatroom.member.id
            ? profile.chatroom.chatroom_with_user.name
            : profile.chatroom.member.name}
        </Typography>

        <Typography
          component="span"
          className="text-sm font-light"
          sx={{
            color:
              unreadMessages !== undefined
                ? unreadMessages > 0
                  ? "#3884F7"
                  : "#323232"
                : profile.unread_messages !== undefined
                  ? profile.unread_messages > 0
                    ? "#3884F7"
                    : "#323232"
                  : "white",
            // display: shouldNotShow ? 'none' : 'inline'
          }}
        >
          {unreadMessages > 0 ? <>{unreadMessages} new messages</> : null}
        </Typography>
      </div>
    </Link>
  );
};

export default DmTile;
