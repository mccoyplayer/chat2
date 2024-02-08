import { Button, Typography } from "@mui/material";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { groupMainPath } from "../../../routes";
import { joinChatRoom } from "../../../sdkFunctions";
import { FeedContext } from "../../contexts/feedContext";
import { GeneralContext } from "../../contexts/generalContext";
import { RouteContext } from "../../contexts/routeContext";
import { UserContext } from "../../contexts/userContext";

type GroupAllFeedTileProps = {
  groupTitle: any;
  chatroomId: any;
  followStatus: any;
  isSecret: any;
};

const GroupAllFeedTile = ({
  groupTitle,
  chatroomId,
  followStatus,
  isSecret,
}: GroupAllFeedTileProps) => {
  const feedContext = useContext(FeedContext);
  const userContext = useContext(UserContext);
  const routeContext = useContext(RouteContext);
  const generalContext = useContext(GeneralContext);
  const navigate = useNavigate();
  async function joinGroup() {
    try {
      const call = await joinChatRoom(chatroomId, userContext.currentUser.id);
      // chatroomContext.refreshChatroomContext();
      const joinEvent = new CustomEvent("joinEvent", { detail: chatroomId });
      document.dispatchEvent(joinEvent);
      if (!call.error) {
        navigate(`${groupMainPath}/${chatroomId}`);
      }
    } catch (error) {
      // // // console.log(error);
    }
  }

  return (
    <div
      className="flex justify-between leading-5 py-4 px-5 border-[#EEEEEE] border-t-[1px]"
      onClick={() => {
        routeContext.setIsNavigationBoxOpen(!routeContext.isNavigationBoxOpen);
      }}
    >
      <Typography
        sx={{ marginTop: "6px" }}
        component="span"
        className="text-base font-normal"
      >
        {groupTitle}
        {isSecret === true ? (
          <span className="bg-[#FFEFC6] rounded-[4px] px-[6px] py-[5px] text-[#F6BD2A] line-height-[12px] text-[10px] font-medium m-1">
            Private
          </span>
        ) : null}
      </Typography>
      {!followStatus ? (
        <Button
          variant="outlined"
          className="rounded-[5px]"
          onClick={joinGroup}
        >
          Join
        </Button>
      ) : null}
    </div>
  );
};
export default GroupAllFeedTile;
