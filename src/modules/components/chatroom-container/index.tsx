import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  checkDMStatus,
  getConversationsForGroup,
  log,
  // log,
  markRead,
} from "../../../sdkFunctions";
import ChatroomContext from "../../contexts/chatroomContext";
import Input from "../input-box";
import { DateSpecifier } from "../message-boxes-components";
import MessageBlock from "../message-boxes-components/MessageBlock";
import { useFirebaseChatConversations } from "../../hooks/firebase";
import BufferStack from "../buffer-stack";
import { GeneralContext } from "../../contexts/generalContext";
import { UserContext } from "../../contexts/userContext";
import LetThemAcceptInvite, {
  AcceptTheirInviteFirst,
} from "../direct-messages-trans-state";
import routeVariable from "../../../enums/routeVariables";
import { messageStrings } from "../../../enums/strings";
import { events } from "../../../enums/events";
import { myClient } from "../../..";
import "./index.css";
import {
  CONVERSATION_LAST_SCROLL,
  LAST_CONVERSATION_ID,
  LAST_CONVERSATION_ID_BACKWARD,
  LAST_CONVERSATION_ID_FORWARD,
  PAGINATE_FORCED,
  SEARCHED_CONVERSATION_ID,
} from "../../../enums/localStorageConstants";
const ChatContainer: React.FC = () => {
  const params = useParams();
  const id: any = params[routeVariable.id];
  const chatroomContext = useContext(ChatroomContext);
  const [bufferMessage, setBufferMessage] = useState(null);
  const scrollTop = useRef<HTMLDivElement>(null);
  const generalContext = useContext(GeneralContext);
  const userContext = useContext(UserContext);
  const [pageNo, setPageNo] = useState(1);
  const [disableScroll, setDisableScroll] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState<any>(null);
  const [loadMoreForwardConversations, setLoadMoreForwardConversations] =
    useState(false);
  const [loadMoreBackwardConversations, setLoadMoreBackwardConversations] =
    useState(true);

  // check if the scrollbar inside the chatroom is at the bottom
  const isScrollBarAtBottom = (ele: any) => {
    const sh = ele.scrollHeight;
    const st = ele.scrollTop;
    const ht = ele.offsetHeight;
    if (ht === 0) {
      return true;
    }
    if (st === Math.floor(sh - ht) || Math.abs(st - Math.floor(sh - ht)) < 24) {
      return true;
    } else {
      return false;
    }
  };

  // Update height
  const updateHeight = (e: any) => {
    const targetedConversationId = e?.detail;
    // console.log("the targeted conversation id is: ", targetedConversationId);
    if (targetedConversationId) {
      const element: Element | null = document.getElementById(
        targetedConversationId?.toString()
      );
      if (element) {
        // console.log("The targeted element is", element);
        setTimeout(() => {
          element.scrollIntoView();
        }, 500);
      }
    }
  };

  const setNewHeight = () => {
    const el: HTMLElement | null = document.getElementById("chat");
    if (el) {
      const lastDivElement: Element | null = el?.lastElementChild;
      lastDivElement?.scrollIntoView({
        behavior: "auto",
      });
    }
    generalContext.setShowLoadingBar(false);
  };

  const setHeightOnSearchedConversation = (convoId: any) => {
    const searchConvoElement: HTMLElement | null = document.getElementById(
      convoId?.toString()
    );
    // console.log("the searched convoId is, ", convoId);
    if (searchConvoElement) {
      setTimeout(() => {
        searchConvoElement.scrollIntoView();
        const msgNode = document.getElementById(convoId?.toString());
        if (msgNode) {
          msgNode.classList.add("lineItem");
          msgNode.classList.add("flash");
        }
        setTimeout(() => {
          generalContext.setShowLoadingBar(false);
        }, 500);
      }, 500);
    }
  };
  // get chatroom conversations
  const getChatroomConversations = async (chatroomId: string, pageNo: any) => {
    try {
      const optionObject = {
        chatroomID: chatroomId,
        paginateBy: pageNo,
      };
      const response: any = await getConversationsForGroup(optionObject);
      // // console.log(response);
      if (!response.error) {
        const conversations = response.data.conversations;
        if (conversations.length) {
          sessionStorage.setItem(
            LAST_CONVERSATION_ID_BACKWARD,
            conversations[0]?.id
          );
          sessionStorage.setItem(
            LAST_CONVERSATION_ID_FORWARD,
            conversations[conversations.length - 1]?.id
          );
        }
        chatroomContext.setConversationList(conversations);
      } else {
        // log(response.errorMessage);
      }
    } catch (e) {
      // log(e);
    }
  };

  // paginate chatroom conversation
  const paginateChatroomConversations = async (
    chatroomId: any,
    pageBy: any,
    scrollDirection: any
  ) => {
    // parameters for the fetch conversations API
    const optionObject = {
      chatroomID: chatroomId,
      paginateBy: pageBy,
      conversationID:
        scrollDirection === 0
          ? sessionStorage.getItem(LAST_CONVERSATION_ID_BACKWARD)
          : sessionStorage.getItem(LAST_CONVERSATION_ID_FORWARD),
      scrollDirection: scrollDirection,
      include: false,
    };
    if (
      optionObject?.conversationID === null ||
      optionObject?.conversationID === undefined
    ) {
      return;
    }
    // API call
    const response: any = await getConversationsForGroup(optionObject);

    // An empty list that will store the new conversation list after the paginated call.
    let newConversationArray: any = [];

    // chatroom id for scrolling into the view in the next pagination
    let scrollIntoViewId: any = "";

    if (!response.error) {
      // The list of conversations recieved from an array
      const conversations = response?.data?.conversations;

      // length of the conversation list
      const conversationsLength = conversations?.length;

      if (conversationsLength === 0) {
        if (scrollDirection === 1) {
          // setting the variable to load more conversations in the downwards direction to false
          setLoadMoreForwardConversations(false);
        } else {
          // setting the variable to load more conversations in the forward direction to false
          setLoadMoreBackwardConversations(false);
        }
      } else {
        if (scrollDirection === 1) {
          // setting the conversation id in the session storage and making the new conversation array
          sessionStorage.setItem(
            LAST_CONVERSATION_ID_FORWARD,
            conversations[conversationsLength - 1]?.id
          );
          newConversationArray = [
            ...chatroomContext.conversationList,
            ...conversations,
          ];

          scrollIntoViewId =
            chatroomContext.conversationList[conversationsLength - 1]?.id;
        } else {
          // setting the conversation id in the session storage and making the new conversation array
          sessionStorage.setItem(
            LAST_CONVERSATION_ID_BACKWARD,
            conversations[0]?.id
          );
          newConversationArray = [
            ...conversations,
            ...chatroomContext.conversationList,
          ];
          scrollIntoViewId = chatroomContext.conversationList[0]?.id;
        }
        // replacing the old with new conversation array in the context
        chatroomContext.setConversationList(newConversationArray);
      }
      return scrollIntoViewId;
    }
  };

  // fetch conversations for search
  async function getConversationsFromSearch(convoId: any) {
    try {
      const config: any = {
        chatroomID: id,
        // paginateBy: 50,
        scrollDirection: 0,
        conversationID: convoId,
        include: true,
      };

      const callPre = await myClient.getConversation(config);

      config.scrollDirection = 1;
      config.include = false;
      const callPost = await myClient.getConversation(config);
      const newConvo = [
        ...callPre?.data?.conversations,
        ...callPost?.data?.conversations,
      ];

      chatroomContext.setConversationList(newConvo);
      sessionStorage.removeItem(SEARCHED_CONVERSATION_ID);
      if (callPre?.data?.conversations?.length > 0) {
        sessionStorage.setItem(
          LAST_CONVERSATION_ID_BACKWARD,
          callPre?.data?.conversations[0]?.id
        );
        sessionStorage.setItem(
          LAST_CONVERSATION_ID_FORWARD,
          callPre?.data?.conversations[callPre?.data?.conversations?.length - 1]
            ?.id
        );
      }
      if (callPost?.data?.conversations?.length > 0) {
        sessionStorage.setItem(
          LAST_CONVERSATION_ID_FORWARD,
          callPost?.data?.conversations[
            callPost?.data?.conversations?.length - 1
          ]?.id
        );
      }
      const call: any = await checkDMStatus(id);
      setLoadMoreForwardConversations(true);
      if (call?.data?.showDM) {
        chatroomContext.setShowReplyPrivately(true);
        const cta: string = call?.data?.cta;
        const showListParams = cta.split("show_list=")[1];
        chatroomContext.setReplyPrivatelyMode(parseInt(showListParams, 10));
      }
    } catch (error) {
      log(error);
    }
  }

  // effect for marking read a chatroom and fetching the conversations of the chatroom, or getting the searched conversations in case we are getting the conversations from a searched convo.
  useEffect(() => {
    async function loadChatAndMarkReadChatroom() {
      try {
        // await getChatroomConversations(id, 100);
        await markRead(id);
        const call: any = await checkDMStatus(id);
        if (call?.data?.showDM) {
          chatroomContext.setShowReplyPrivately(true);
          const cta: string = call?.data?.cta;
          const showListParams = cta.split("show_list=")[1];
          chatroomContext.setReplyPrivatelyMode(parseInt(showListParams, 10));
        }
      } catch (error) {
        // log(error);
      }
    }
    setLoadMoreBackwardConversations(true);
    setLoadMoreForwardConversations(true);
    const convoId = sessionStorage.getItem(SEARCHED_CONVERSATION_ID);
    if (convoId) {
      getConversationsFromSearch(convoId)
        .then(() => {
          setHeightOnSearchedConversation(convoId);
        })
        .catch(() => {
          // console.log("ERROR AARHA H");
        });
    } else {
      loadChatAndMarkReadChatroom()
        .then(() => {
          setPageNo(1);
        })
        .catch((er) => {
          log("error here at loadChatroomAndMarkRead");
        });
    }

    return () => {
      sessionStorage.clear();
    };
  }, [id]);

  // effect for updating the height of the chatroom container after paginated calls
  useEffect(() => {
    document.addEventListener(events.updateHeightOnPagination, updateHeight);
    return () => {
      document.removeEventListener(
        events.updateHeightOnPagination,
        updateHeight
      );
    };
  });

  // effect for setting the event for setting new height of the chatroom container
  useEffect(() => {
    document.addEventListener(events.setNewHeight, setNewHeight);
    // document.addEventListener(events.sentMessage, setNewHeight);
    return () => {
      document.removeEventListener(events.setNewHeight, setNewHeight);
      // document.removeEventListener(events.sentMessage, setNewHeight);
    };
  });

  // effect for adding/removing event listeners for chat_request_state change and when chatrooms are left
  useEffect(() => {
    function reloadChatroom() {
      getChatroomConversations(id, 100);
    }
    document.addEventListener(events.addedByStateOne, reloadChatroom);
    document.addEventListener(events.leaveEvent, reloadChatroom);
    return () => {
      document.removeEventListener(events.addedByStateOne, reloadChatroom);
      document.removeEventListener(events.leaveEvent, reloadChatroom);
    };
  }, [id]);

  // effect for throttling / dethrottling the scroll event in conversations container
  useEffect(() => {
    const timeOutForEnablingScroll = setTimeout(() => {
      setDisableScroll(false);
    }, 500);
    return () => {
      clearTimeout(timeOutForEnablingScroll);
    };
  });

  // effect for removing the state/ setting default state when chatrooms are changed
  useEffect(() => {
    return () => {
      setLoadMoreBackwardConversations(true);
      setLoadMoreForwardConversations(false);
    };
  }, [id, generalContext.currentChatroom]);
  useEffect(() => {
    return () => chatroomContext.setConversationList([]);
  }, [id]);
  // firebase listener
  useFirebaseChatConversations(
    getChatroomConversations,
    setBufferMessage,
    setNewHeight
  );

  if (generalContext?.currentChatroom?.chat_request_state === 0) {
    if (
      userContext.currentUser?.id ===
      generalContext.currentChatroom.chat_requested_by[0]?.id
    ) {
      return (
        <LetThemAcceptInvite
          title={
            userContext.currentUser.id ===
            generalContext.currentChatroom.member.id
              ? generalContext.currentChatroom.chatroom_with_user.name
              : generalContext.currentChatroom.member.name
          }
        />
      );
    }
    return (
      <AcceptTheirInviteFirst
        title={
          userContext.currentUser.id ===
          generalContext.currentChatroom.member.id
            ? generalContext.currentChatroom.chatroom_with_user.name
            : generalContext.currentChatroom.member.name
        }
      />
    );
  }
  return (
    <>
      <div
        id="chat"
        className="relative overflow-x-hidden overflow-auto flex-[1]"
        ref={scrollTop}
        onScroll={() => {
          if (disableScroll) {
            return;
          }
          // setDisableScroll(true);
          const node = scrollTop.current!;
          const current = node.scrollTop;
          if (lastScrollPosition) {
            const scrollPosition =
              Math.floor(current - lastScrollPosition) >= 0 ? 1 : 0;
            let paginatePosition = undefined;
            if (isScrollBarAtBottom(scrollTop.current)) {
              paginatePosition = 1;
            } else if (current === 0) {
              paginatePosition = 0;
            } else {
              return;
            }
            if (
              scrollPosition === 0 &&
              paginatePosition === 0 &&
              loadMoreBackwardConversations
            ) {
              setDisableScroll(true);
              paginateChatroomConversations(id, 50, scrollPosition).then(
                (e) => {
                  document.dispatchEvent(
                    new CustomEvent(events.updateHeightOnPagination, {
                      detail: e,
                    })
                  );
                }
              );
            } else if (
              scrollPosition === 1 &&
              paginatePosition === 1 &&
              loadMoreForwardConversations
            ) {
              setDisableScroll(true);
              paginateChatroomConversations(id, 50, scrollPosition)
                // .then(() => setPageNo((p) => p + 1))
                .then((e) => {
                  // console.log("the last convoId is: ", e);
                  document.dispatchEvent(
                    new CustomEvent(events.updateHeightOnPagination, {
                      detail: e,
                    })
                  );
                });
            }
          }
          setLastScrollPosition(current);
        }}
      >
        {chatroomContext.conversationList.map(
          (convo: any, index: any, convoArr: any) => {
            let lastConvoDate;
            if (index === 0) {
              lastConvoDate = "";
            } else {
              lastConvoDate = convoArr[index - 1]?.date;
            }
            return (
              <div
                className="ml-[28px] mr-[114px] pt-5 z:max-md:mr-[28px] z:max-sm:ml-2  z:max-sm:mr-0"
                key={convo.id}
                id={convo.id}
              >
                {convo.date !== lastConvoDate ? (
                  <DateSpecifier
                    dateString={convo.date}
                    // key={convo.id + index}
                  />
                ) : null}
                <MessageBlock
                  userId={convo.member.id}
                  conversationObject={convo}
                  index={index}
                />
              </div>
            );
          }
        )}
        {bufferMessage ? (
          <BufferStack
            bufferMessage={bufferMessage}
            updateHeight={setNewHeight}
          />
        ) : null}
      </div>

      {generalContext.currentChatroom.type === 7 ? (
        userContext.currentUser.memberState === 1 ? (
          <Input
            disableInputBox={
              generalContext.currentChatroom?.chat_request_state === 2
            }
            setBufferMessage={setBufferMessage}
          />
        ) : (
          <p className="text-center">
            {messageStrings.chatroomResponseOnlyCMCanRespond}
          </p>
        )
      ) : userContext.currentUser?.memberRights[3]?.is_selected ? (
        <Input
          disableInputBox={
            generalContext.currentChatroom?.chat_request_state === 2
          }
          setBufferMessage={setBufferMessage}
        />
      ) : (
        <p className="text-center">
          {messageStrings.chatroomResponseNotAllowed}
        </p>
      )}
    </>
  );
};
export default ChatContainer;
