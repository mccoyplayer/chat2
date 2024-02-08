import { IconButton } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { myClient } from "../../..";
import searchConversationsInsideChatroom from "../../../sdkFunctions/searchFunctions";
import routeVariable from "../../../enums/routeVariables";
import { useParams } from "react-router";
import ProfileTile from "./profile-tile";
import { log } from "../../../sdkFunctions";
import { ref } from "@firebase/database";
import InfiniteScroll from "react-infinite-scroll-component";
import { GeneralContext } from "../../contexts/generalContext";
// import { log } from "console";
// log

const ChannelSearch = ({ setOpenSearch }: any) => {
  const [searchKey, setSearchKey] = useState("");
  const [searchState, setSearchState] = useState(0);
  const [searchArray, setSearchArray] = useState<any>([]);
  const [loadMoreConversations, setLoadMoreConversations] = useState(true);
  const params = useParams();
  const id = params[routeVariable.id];

  const searchInputBoxRef = useRef<HTMLDivElement>(null);

  const generalContext = useContext(GeneralContext);
  function setSearchString(e: any) {
    setSearchKey(e.target.value);
  }
  async function searchFunction() {
    try {
      const pageNo = Math.floor(searchArray?.length / 20) + 1;
      // console.log("the page is");
      // console.log(searchArray);
      const pageSize = 20;
      const call = await searchConversationsInsideChatroom(
        id!.toString(),
        searchKey,
        (() => {
          if (searchState === 1) {
            return true;
          } else {
            return false;
          }
        })(),
        pageNo,
        pageSize,
      );
      const response: any = call?.data?.conversations;
      log("the profiles after the search are");
      log(response);
      if (response.length < 20 && searchState === 1) {
        setSearchState(2);
      } else if (response.length < 20 && searchState === 2) {
        setLoadMoreConversations(false);
      }
      setSearchArray([...searchArray, ...response]);
    } catch (error) {
      log(error);
    }
  }

  useEffect(() => {
    function searchClickHandler(e: any) {
      // if (
      //   searchInputBoxRef.current &&
      //   !searchInputBoxRef.current.contains(e.target)
      // ) {
      //   setOpenSearch(false);
      //   log(e);
      // }
    }
    document.addEventListener("click", searchClickHandler, true);
    return () => {
      document.removeEventListener("click", searchClickHandler, true);
    };
  }, [searchInputBoxRef]);

  useEffect(() => {
    const searchChatroomTimeOut = setTimeout(() => {
      searchFunction();
    }, 500);
    return () => {
      clearTimeout(searchChatroomTimeOut);
    };
  }, [searchKey]);

  // for rendering the profiles
  function renderProfiles() {
    try {
      return searchArray?.map((profile: any) => {
        return (
          <div className="my-2" key={profile?.id}>
            <ProfileTile profile={profile} setOpenSearch={setOpenSearch} />
          </div>
        );
      });
    } catch (error) {
      log("error in renderProfiles");
      log(error);
    }
  }
  return (
    <div className="">
      <div
        className=" mx-4  border-b border-b-[#adadad] bg-[transparent]"
        ref={searchInputBoxRef}
      >
        <div className="relative flex ">
          <IconButton
            onClick={() => {
              setOpenSearch(false);
            }}
            sx={{
              position: "absolute",
              margin: "2px 4px",
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <input
            type="text"
            value={searchKey}
            onChange={setSearchString}
            placeholder={`Search withing ${generalContext.currentChatroom?.header}`}
            className="py-3 focus:border-0 focus:outline-0 active:border-0 focus:outline-0 px-14 bg-transparent grow"
            autoFocus={true}
          />
        </div>
      </div>
      <div
        className="mx-4 max-h-[400px] overflow-auto"
        id="conversations-holder"
      >
        <InfiniteScroll
          hasMore={loadMoreConversations}
          scrollableTarget="conversations-holder"
          dataLength={(() => {
            if (searchArray) {
              return 0;
            } else {
              return searchArray.length;
            }
          })()}
          next={searchFunction}
          loader={null}
        >
          {renderProfiles()}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default ChannelSearch;
