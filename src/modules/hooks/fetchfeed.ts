/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-use-before-define */
import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { myClient } from "../..";
import {
  allChatroomMembersDm,
  dmChatFeed,
  getChatRoomDetails,
  log,
} from "../../sdkFunctions";
import { FeedContext } from "../contexts/feedContext";
import { GeneralContext } from "../contexts/generalContext";
import routeVariable from "../../enums/routeVariables";

type feedArrayContent = {
  header: string;
  list: Array<any>;
};

export function useFetchFeed(
  setShouldLoadMoreHome: React.Dispatch<boolean>,
  setShouldLoadMoreAll: React.Dispatch<boolean>,
  loadMoreHome: any,
  loadMoreAll: any,
  setShouldLoadDmMoreHome: React.Dispatch<boolean>,
  setShouldLoadDmMoreAll: React.Dispatch<boolean>,
  loadDmMoreHomeFeed: any,
  loadDmMoreAllFeed: any,
) {
  const params = useParams();
  const id: any = params[routeVariable.id];
  const mode: any = params[routeVariable.mode];
  const feedContext = useContext(FeedContext);
  const generalContext = useContext(GeneralContext);
  const { homeFeed, allFeed, setHomeFeed, setAllFeed, setSecretChatrooms } =
    feedContext;
  useEffect(() => {
    async function fetchFeed() {
      // // console.log("consoleling");
      // // console.log(mode);
      try {
        switch (mode) {
          case "groups": {
            loadGroupFeed(
              setSecretChatrooms,
              homeFeed,
              setHomeFeed,
              allFeed,
              setAllFeed,
              loadMoreHome,
              setShouldLoadMoreHome,
              loadMoreAll,
              setShouldLoadMoreAll,
            );
            break;
          }
          case "direct-messages": {
            fetchActiveHomeFeeds({
              setFeedList: feedContext.setDmHomeFeed,
              currentFeedList: feedContext.dmHomeFeed,
              setShouldLoadMore: setShouldLoadDmMoreHome,
            }).then(() => {
              document.dispatchEvent(
                new CustomEvent("feedLoaded", { detail: true }),
              );
            });
            fetchAllDMFeeds({
              setShouldLoadMore: setShouldLoadDmMoreAll,
              currentFeedList: feedContext.dmAllFeed,
              setFeedList: feedContext.setDmAllFeed,
            });
            break;
          }
          default:
            return null;
        }
      } catch (error) {
        log(error);
      }
    }
    fetchFeed();
  }, [mode]);

  useEffect(() => {
    async function setFeeds() {
      try {
        generalContext.setShowLoadingBar(true);
        const feedcall: any = await getChatRoomDetails(myClient, id);
        // console.log(feedcall);
        generalContext.setCurrentProfile(feedcall?.data?.data);
        generalContext.setCurrentChatroom(feedcall?.data?.data?.chatroom);
      } catch (error) {
        log(error);
      }
    }
    if (mode !== "direct-messages" && mode !== "groups") {
      return;
    }
    if (id !== "" && id !== null && id !== undefined) {
      setFeeds();
    }
  }, [id]);
}

// fetches the current feed with secret chatrooms and returns and
type fetchActiveFeedType = {
  setShouldLoadMore: React.Dispatch<boolean> | any;
  setFeedList: React.Dispatch<Array<any>> | any;
  currentFeedList: Array<any>;
};

export async function fetchActiveGroupFeeds({
  setShouldLoadMore,
  setFeedList,
  currentFeedList,
}: fetchActiveFeedType) {
  try {
    const currentChatroomLength = currentFeedList.length;
    const pageNo = Math.floor(currentChatroomLength / 10) + 1;
    const call = await myClient.getHomeFeed({ page: pageNo });
    // log("active feeds");
    // log(call);
    const chatrooms = call.data.data.my_chatrooms;
    if (chatrooms.length < 10) {
      setShouldLoadMore(false);
    }
    const newChatrooms = currentFeedList.concat(chatrooms);
    setFeedList(newChatrooms);
    return true;
  } catch (error) {
    log(`error under function fetchActiveGroupFeed: ${error} `);
    return false;
  }
}

// fetches all available feeds with secret chatrooms and returns and
type fetchAllFeedType = {
  setShouldLoadMore: React.Dispatch<boolean>;
  setFeedList: React.Dispatch<Array<any>> | any;
  currentFeedList: Array<any>;
};

export async function fetchAllGroupFeeds({
  setShouldLoadMore,
  setFeedList,
  currentFeedList,
}: fetchAllFeedType) {
  try {
    const currentChatroomLength = currentFeedList.length;
    const pageNo = Math.floor(currentChatroomLength / 10) + 1;
    const call = await myClient.getExploreFeed({
      page: pageNo,
      orderType: 0,
    });
    // log("all groups");
    // log(call);
    const { chatrooms } = call;
    if (chatrooms.length < 10) {
      setShouldLoadMore(false);
    }
    const newChatrooms = currentFeedList.concat(chatrooms);
    setFeedList(newChatrooms);
    return true;
  } catch (error) {
    log(`error under function fetchAllGroupFeed: ${error} `);
    return false;
  }
}

export async function fetchActiveHomeFeeds({
  setShouldLoadMore,
  setFeedList,
  currentFeedList,
}: fetchActiveFeedType) {
  try {
    const pageNo = Math.floor(currentFeedList.length / 10) + 1;
    const call: any = await dmChatFeed(
      sessionStorage.getItem("communityId")!,
      pageNo,
    );
    // log("line 180");
    // log(call);
    const chatrooms = call.data.dm_chatrooms;
    if (chatrooms.length < 10) {
      setShouldLoadMore(false);
    }
    const newChatrooms = currentFeedList.concat(chatrooms);
    setFeedList(newChatrooms);
  } catch (error) {
    log(error);
  }
}

export async function fetchAllDMFeeds({
  setShouldLoadMore,
  currentFeedList,
  setFeedList,
}: fetchAllFeedType) {
  try {
    const currentChatroomLength = currentFeedList.length;
    const pageNo = Math.floor(currentChatroomLength / 10) + 1;
    const call: any = await allChatroomMembersDm(
      sessionStorage.getItem("communityId"),
      pageNo,
    );

    if (pageNo === 1) {
      let chatrooms = call.data.members;
      for (let index = 1; index < 3; index++) {
        const call: any = await allChatroomMembersDm(
          sessionStorage.getItem("communityId"),
          index + 1,
        );
        chatrooms = chatrooms.concat(call.data.members);
        if (call.data.members.length < 10) {
          setShouldLoadMore(false);
          break;
        }
      }
      setFeedList(chatrooms);
    } else {
      const chatrooms = call.data.members;
      if (chatrooms.length < 10) {
        setShouldLoadMore(false);
      }
      const newChatrooms = currentFeedList.concat(chatrooms);
      setFeedList(newChatrooms);
    }
    return true;
  } catch (error) {
    log(`error under function fetchAllDmFeed: ${error} `);
    return false;
  }
}

const getSecretChatroomsInvite = async (setSecretChatrooms: any) => {
  try {
    let pageNo = 1;
    let shouldCall = true;
    let res = [] as any;
    const pageSize = 10;
    while (shouldCall) {
      const call = await myClient.getInvites({
        channelType: 1,
        page: pageNo++,
        pageSize: pageSize,
      });
      const inviteArray = call.data.user_invites;
      res = res.concat(inviteArray);
      if (inviteArray.length < pageSize) {
        shouldCall = false;
      }
    }
    setSecretChatrooms(res);
    // callBack(res.length);
    return true;
  } catch (error) {
    log(error);
  }
};

export async function loadGroupFeed(
  setSecretChatrooms: any,
  homeFeed: any,
  setHomeFeed: any,
  allFeed: any,
  setAllFeed: any,
  loadMoreHome: any,
  setLoadMoreHome: any,
  loadMoreAll: any,
  setLoadMoreAll: any,
) {
  try {
    homeFeed = [...homeFeed];
    allFeed = [...allFeed];
    let loadUnjoinedBool = false;
    // // console.log("consoleling inside loadGroupFeeds");
    await getSecretChatroomsInvite(setSecretChatrooms);
    if (loadMoreHome) {
      let cRooms: any = [];
      for (let i = 0; i < 3; i++) {
        const feedLength = homeFeed.length;
        const pgNo =
          Math.floor(feedLength / 10) + 1 + Math.floor(cRooms.length / 10);
        if (pgNo === 1) {
          homeFeed = [];
        }
        const call = await myClient.getHomeFeed({ page: pgNo });
        const myChatrooms = call.data.my_chatrooms;
        log(myChatrooms);
        cRooms = [...cRooms, ...myChatrooms];
        if (myChatrooms.length < 10) {
          setLoadMoreHome(false);
          setLoadMoreAll(true);
          loadUnjoinedBool = true;
          break;
        }
      }
      const newJoinedFeed = homeFeed.concat(cRooms);
      // log(`setting homefeed ${6}`);
      setHomeFeed(newJoinedFeed);
    }
    if (loadMoreAll || loadUnjoinedBool) {
      const feedLength = allFeed.length;
      const pgNo = Math.floor(feedLength / 10) + 1;
      const call = await myClient.getExploreFeed({
        page: pgNo,
        orderType: 0,
      });
      const chatrooms = call.data.chatrooms;
      if (chatrooms.length < 10) {
        setLoadMoreAll(false);
      }
      const newunJoinedFeed = allFeed.concat(chatrooms);
      setAllFeed(newunJoinedFeed);
    }
    // log("ending groups");
    return true;
  } catch (error) {
    log(error);
    return false;
  }
}

export const invitationResponse = async (channel_id: any, response: any) => {
  try {
    const call = await myClient.inviteAction({
      channelId: channel_id.toString(),
      inviteStatus: response,
    });
  } catch (error) {
    log(error);
  }
};
