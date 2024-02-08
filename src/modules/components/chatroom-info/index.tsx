import { IconButton } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import backIcon from "../../../assets/svg/arrow-left.svg";
import rightArrow from "../../../assets/svg/right-arrow.svg";
import { GeneralContext } from "../../contexts/generalContext";
import { myClient } from "../../..";
import { groupMainPath } from "../../../routes";
import { log } from "../../../sdkFunctions";
import routeVariable from "../../../enums/routeVariables";

const ParticipantTile = ({ profile }: any) => (
  <div className="p-2.5 border-[#eeeeee] border-b-[1px] flex justify-between bg-white items-center cursor-pointer">
    <div className="flex items-center">
      <div className="w-[36px] h-[36px] uppercase border-[1px] border-[#eeeeee] bg-[#eeeeee] mr-2.5 rounded-[5px] flex justify-center items-center">
        {profile?.name[0]}
      </div>
      <div className="font-bold text-sm capitalize">{profile.name}</div>
    </div>

    <IconButton className="w-[32px] h-[32px]">
      <img src={rightArrow} alt="arrow icon" />
    </IconButton>
  </div>
);

const GroupInfo = () => {
  const gc = useContext(GeneralContext);
  const [participantList, setParticipantList] = useState([]);
  const [loadMode, setLoadMore] = useState(true);
  const params = useParams();
  const id: any = params[routeVariable.id];
  const callFn = (isSecret: any) => {
    const getMemberList = async (isSecret: any) => {
      try {
        const page = Math.floor(participantList.length / 20) + 1;
        const call = await myClient.viewParticipants({
          chatroomId: parseInt(id, 10),
          isSecret: isSecret,
          page,
          pageSize: 20,
        });
        if (call?.data?.participants?.length < 20) {
          setLoadMore(false);
        }
        const newList = participantList.concat(call?.data?.participants);
        setParticipantList(newList);
      } catch (error) {
        log(error);
      }
    };
    getMemberList(isSecret);
  };
  useEffect(() => {
    if (Object.keys(gc.currentChatroom).length > 0) {
      const isSecret = gc.currentChatroom.is_secret;
      callFn(isSecret);
    }
  }, [gc.currentChatroom]);

  return (
    <div className=" w-full customHeight">
      <div className="mr-[120px] ml-[20px] mt-[10px] h-full z:max-md:mr-[28px]">
        <div className="flex">
          <Link to={`${groupMainPath}/${id}`}>
            <IconButton>
              <img src={backIcon} alt="back icon" />
            </IconButton>
          </Link>
          <div className="text-[20px] mt-[8px] font-[700] leading-[24px] text-[#3884F7]">
            Group Info
          </div>
        </div>

        {/* Member list */}
        <div className="ml-1 pl-[5px] h-full">
          <div className="text-4 font-[700] text-[#323232]">Participants</div>
          <div
            className="py-[18px] overflow-auto max-h-[70%]"
            id="participant-list"
          >
            <InfiniteScroll
              next={() => callFn(gc.currentChatroom.is_secret)}
              hasMore={loadMode}
              dataLength={participantList.length}
              scrollableTarget="participant-list"
              loader={null}
            >
              {participantList?.map((profile: any) => (
                <ParticipantTile key={profile.id} profile={profile} />
              ))}
            </InfiniteScroll>
          </div>
        </div>
        {/* Member list */}
      </div>
    </div>
  );
};

export default GroupInfo;
