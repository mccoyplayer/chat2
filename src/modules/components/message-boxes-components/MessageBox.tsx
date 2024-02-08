/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-use-before-define */
import { Box, Dialog, IconButton, Menu, MenuItem } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import parse from "html-react-parser";
import { myClient } from "../../..";
import { UserContext } from "../../contexts/userContext";
import ReportConversationDialogBox from "../reportConversation/ReportConversationDialogBox";
import emojiIcon from "../../../assets/svg/smile.svg";
import moreIcon from "../../../assets/svg/more-vertical.svg";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {
  addReaction,
  deleteChatFromDM,
  getChatRoomDetails,
  getConversationsForGroup,
  linkConverter,
  log,
  tagExtracter,
  undoBlock,
} from "../../../sdkFunctions";
import { directMessageChatPath, directMessageInfoPath } from "../../../routes";
import ChatroomContext from "../../contexts/chatroomContext";
import { GeneralContext } from "../../contexts/generalContext";
import AttachmentsHolder from "./AttachmentsHolder";
import MediaCarousel from "../carousel";
import routeVariable from "../../../enums/routeVariables";
import PollResponse from "../../poll-response";
import { GIF_MESSAGE } from "../../constants/constants";

async function getChatroomConversations(
  chatroomId: number,
  pageNo: number,
  chatroomContext: any
) {
  if (chatroomId == null) {
    return;
  }
  const optionObject = {
    chatroomID: chatroomId,
    page: pageNo,
  };
  const response: any = await getConversationsForGroup(optionObject);
  if (!response.error) {
    const conversations = response.data;
    sessionStorage.setItem("dmLastConvo", conversations[0].id);
    chatroomContext.setConversationList(conversations);
  } else {
    log(response.errorMessage);
  }
}
type messageBoxType = {
  username: string;
  messageString: string;
  time: any;
  userId: string;
  attachments: any;
  convoId: number;
  conversationReactions: any;
  conversationObject: any;
  replyConversationObject: any;
  index: number;
};
const MessageBoxDM = ({
  username,
  messageString,
  time,
  userId,
  attachments,
  convoId,
  conversationReactions,
  conversationObject,
  replyConversationObject,
  index,
}: messageBoxType) => {
  const userContext = useContext(UserContext);
  const generalContext = useContext(GeneralContext);

  const chatroomContext = useContext(ChatroomContext);
  switch (conversationObject?.state) {
    case 0: {
      return (
        <div>
          <Box className="flex mb-4">
            <StringBox
              username={username}
              messageString={messageString}
              time={time}
              userId={userId}
              attachments={attachments}
              replyConversationObject={replyConversationObject}
              conversationObject={conversationObject}
            />
            <MoreOptions
              convoId={convoId}
              convoObject={conversationObject}
              index={index}
            />
          </Box>
          <div>
            {conversationObject.deleted_by !== undefined ? null : (
              <>
                {conversationReactions.map(
                  (reactionObject: any, reactionObjectIndex: any) => (
                    <ReactionIndicator
                      reaction={reactionObject.reaction}
                      key={reactionObjectIndex}
                    />
                  )
                )}
              </>
            )}
          </div>
        </div>
      );
    }
    case 1: {
      return (
        <div className="mx-auto text-center rounded-[4px] text-[14px] w-full font-[300] text-[#323232]">
          <span id="state-1 mx-auto">
            {parse(linkConverter(tagExtracter(messageString, userContext, 1)))}
          </span>
        </div>
      );
    }
    case 10: {
      return (
        <div>
          <Box className="flex mb-4">
            <StringBox
              username={username}
              messageString={messageString}
              time={time}
              userId={userId}
              attachments={attachments}
              replyConversationObject={replyConversationObject}
              conversationObject={conversationObject}
            />
            <MoreOptions
              convoId={convoId}
              convoObject={conversationObject}
              index={index}
            />
          </Box>
          <div>
            {conversationObject.deleted_by !== undefined ? null : (
              <>
                {conversationReactions.map(
                  (reactionObject: any, reactionObjectIndex: any) => (
                    <ReactionIndicator
                      reaction={reactionObject.reaction}
                      key={reactionObjectIndex}
                    />
                  )
                )}
              </>
            )}
          </div>
        </div>
      );
    }
    default:
      return (
        <div className="mx-auto text-center rounded-[4px] text-[14px] w-full font-[300] text-[#323232]">
          {parse(linkConverter(tagExtracter(messageString, userContext)))}
          {/* Showing Tap to undo only if the user that has rejected the chatroom see it */}
          {conversationObject?.state === 19 &&
          generalContext?.currentChatroom?.chat_request_state === 2 &&
          userContext.currentUser.id ===
            generalContext.currentChatroom.chat_requested_by[0].id &&
          index === chatroomContext.conversationList.length - 1 ? (
            <span
              className="text-[#3884f7] cursor-pointer"
              onClick={() => {
                undoBlock(conversationObject.chatroom_id).then(() => {
                  getChatroomConversations(
                    generalContext.currentChatroom.id,
                    100,
                    chatroomContext
                  ).then(() => {
                    getChatRoomDetails(
                      myClient,
                      generalContext.currentChatroom.id
                    ).then((e: any) => {
                      generalContext.setCurrentChatroom(e.data.chatroom);
                      generalContext.setCurrentProfile(e.data);
                    });
                  });
                });
              }}
            >
              {" "}
              Tap to Undo
            </span>
          ) : null}
        </div>
      );
  }
};

const ReactionIndicator = ({ reaction }: any) => (
  <span className="text-normal mx-1">{reaction}</span>
);

export type attType = {
  mediaAttachments: any[];
  audioAttachments: any[];
  docAttachments: any[];
  voiceNote: any;
};
const StringBox = ({
  username,
  messageString,
  time,
  userId,
  attachments,
  replyConversationObject,
  conversationObject,
}: any) => {
  const ref = useRef(null);
  const userContext = useContext(UserContext);
  const [displayMediaModal, setDisplayMediaModel] = useState(false);
  const [mediaData, setMediaData] = useState<any>(null);
  const [attachmentObject, setAttachmentObject] = useState<attType>({
    mediaAttachments: [],
    audioAttachments: [],
    docAttachments: [],
    voiceNote: null,
  });

  function removeGifMessage(text: string): string {
    const gifMessage = "* This is a gif message. Please update your app *";

    return text.includes(gifMessage) ? text.replace(gifMessage, "") : text;
  }
  useEffect(() => {
    const att = { ...attachmentObject };
    attachments?.forEach((attachment: any) => {
      const type = attachment.type.split("/")[0];
      switch (type) {
        case "voice_note": {
          att.voiceNote = attachment;
          break;
        }
        case "gif":
        case "image":
        case "video": {
          att.mediaAttachments.push(attachment);
          break;
        }
        case "audio": {
          att.audioAttachments.push(attachment);
          break;
        }
        case "pdf": {
          att.docAttachments.push(attachment);
          break;
        }
      }
    });
    setAttachmentObject(att);
  }, [attachments]);
  return (
    <div
      className="flex flex-col py-[16px] px-[20px] min-w-[282px] max-w-[350px] border-[#eeeeee] rounded-[10px] break-all z:max-sm:min-w-[242px] z:max-sm:max-w-[282px]"
      style={{
        background:
          userId === userContext.currentUser.id ? "#ECF3FF" : "#FFFFFF",
      }}
    >
      <DialogBoxMediaDisplay
        shouldOpen={displayMediaModal}
        onClose={() => setDisplayMediaModel(false)}
        mediaData={mediaData}
      />
      <div className="flex w-full justify-between mb-1 clear-both">
        <div className="text-[12px] leading-[14px] text-[#323232] font-[700] capitalize">
          <div>{userId === userContext.currentUser.id ? "you" : username}</div>
        </div>
        <div className="text-[10px] leading-[12px] text-[#323232] font-[300]">
          {time}
        </div>
      </div>

      {conversationObject?.deleted_by !== undefined ? (
        <span className="text-[14px] w-full font-[300] text-[#323232]">
          This message has been deleted.
        </span>
      ) : (
        <div className="flex w-full flex-col">
          <div className="w-full mb-1 h-full">
            <AttachmentsHolder
              attachmentsObject={attachmentObject}
              setMediaData={setMediaData}
              setMediaDisplayModel={setDisplayMediaModel}
            />
          </div>
          {replyConversationObject != null ? (
            <div className="flex flex-col border-[1px] border-l-[5px] border-[#70A9FF] py-1 px-2 rounded-[5px] mb-1">
              <div className="text-[#70A9FF] font-bold text-[12px]">
                {replyConversationObject?.member?.name}
              </div>

              <div className="text-[#323232] font-[300] text-[12px] truncate">
                {replyConversationObject.attachment_count > 0 ? (
                  <>
                    {replyConversationObject.attachments?.map((item: any) => {
                      if (item.type === "image") {
                        return (
                          <img
                            src={item.url}
                            className="h-[120px] w-[120px]"
                            key={item.url}
                            alt=""
                          />
                        );
                      }
                      return null;
                    })}
                  </>
                ) : null}
                {parse(
                  linkConverter(
                    tagExtracter(
                      attachmentObject.mediaAttachments.length > 0 &&
                        attachmentObject.mediaAttachments[0]?.type === "gif"
                        ? removeGifMessage(replyConversationObject?.answer)
                        : replyConversationObject?.answer,
                      userContext
                    )
                  )
                )}
              </div>
            </div>
          ) : null}

          {conversationObject?.state === 10 ? (
            <PollResponse conversation={conversationObject} />
          ) : (
            <div className="text-[14px] w-full font-[300] text-[#323232]">
              <span className="msgCard " ref={ref}>
                {parse(
                  linkConverter(
                    tagExtracter(
                      attachmentObject.mediaAttachments.length > 0 &&
                        attachmentObject.mediaAttachments[0]?.type === "gif"
                        ? removeGifMessage(messageString)
                        : messageString,
                      userContext
                    )
                  )
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TimeBox = ({ time }: any) => (
  <span
    style={{
      fontSize: "10px",
      fontWeight: 300,
      color: "#323232",
    }}
  >
    {time}
  </span>
);

type moreOptionsType = {
  convoId: any;
  convoObject: any;
  index: any;
};

const MoreOptions = ({ convoId, convoObject, index }: moreOptionsType) => {
  const userContext = useContext(UserContext);
  const chatroomContext = useContext(ChatroomContext);
  const generalContext = useContext(GeneralContext);
  const [anchor, setAnchor] = useState(null);
  const [shouldShow, setShouldShowBlock] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const id: any = params[routeVariable.id];
  const mode: any = params[routeVariable.mode];
  const operation: any = params[routeVariable.operation];
  const open = Boolean(anchor);
  const [anchorEl, setAnchorEl] = useState(null);
  const ref2 = useRef(null);
  const handleOpen = () => {
    setAnchorEl(ref.current);
  };
  const handleCloseEmoji = () => {
    setAnchorEl(null);
  };
  const ref = useRef<any>(null);
  useState(() => {
    const handleCloseFunction = (e: any) => {
      if (ref?.current && !ref?.current?.contains(e.target)) {
        setAnchor(null);
      }
    };
    document.addEventListener("click", handleCloseFunction);
    return () => {
      document.removeEventListener("click", handleCloseFunction);
    };
  });
  function updateMessageLocally(emoji: any) {
    const newConvoArr = [...chatroomContext.conversationList];
    const reactionTemplate = {
      member: {
        id: userContext?.currentUser?.id,
        image_url: "",
        name: userContext?.currentUser?.name,
      },
      reaction: emoji,
      updated_at: Date.now(),
    };
    const newConvoObject = newConvoArr[index];
    const convoObjectReactionsArray = newConvoObject?.reactions?.filter(
      (item: any) => {
        if (item.member.id !== userContext.currentUser.id) {
          return true;
        } else {
          return false;
        }
      }
    );
    newConvoObject.reactions = convoObjectReactionsArray;
    newConvoObject?.reactions.push(reactionTemplate);
    chatroomContext.setConversationList(newConvoArr);
  }
  function deleteMessageLocally() {
    const newConvoArr = [...chatroomContext.conversationList];

    const newConvoObject = newConvoArr[index];
    newConvoObject.deleted_by = userContext?.currentUser?.id;
    chatroomContext.setConversationList(newConvoArr);
  }

  async function onClickhandlerReport(
    id: any,
    reason: any,
    convoid: any,
    reportedMemberId: any
  ) {
    try {
      const deleteCall = await myClient.pushReport({
        tagId: parseInt(id?.toString(), 10),
        reason,
        conversationId: convoid,
        reportedMemberId: reportedMemberId,
      });
      setShouldShowBlock(!shouldShow);
    } catch (error) {
      // // // console.log(error);
    }
  }

  const options = [
    {
      title: "Reply",
      clickFunction: () => {
        chatroomContext.setIsSelectedConversation(true);
        chatroomContext.setSelectedConversation(convoObject);
      },
    },
    {
      title: "Report",
      clickFunction: () => {
        setShouldShowBlock(!shouldShow);
      },
    },
    {
      title: "Delete",
      clickFunction: () => {
        deleteChatFromDM([convoId])
          .then(() => {
            deleteMessageLocally();
          })
          .catch(() => {
            generalContext.setShowSnackBar(true);
            generalContext.setSnackBarMessage(" error occoured");
          });
      },
    },
    {
      title: "Reply Privately",
      clickFunction: async () => {
        try {
          let checkDMLimitCall: any = await myClient.checkDMLimit({
            memberId: convoObject?.member?.id,
          });
          checkDMLimitCall = checkDMLimitCall?.data;
          let isReplyParam;
          if (
            userContext.currentUser?.memberState === 1 ||
            convoObject.member.state === 1
          ) {
            isReplyParam = 1;
          } else {
            isReplyParam = 2;
          }

          if (checkDMLimitCall.chatroom_id) {
            navigate(
              `${directMessageChatPath}/${checkDMLimitCall.chatroom_id}/${isReplyParam}`
            );
          } else if (!checkDMLimitCall.is_request_dm_limit_exceeded) {
            const createChatroomCall: any = await myClient.createDMChatroom({
              memberId: convoObject?.member?.id,
            });
            navigate(
              `${directMessageChatPath}/${createChatroomCall?.chatroom?.id}/${isReplyParam}`
            );
          } else {
            generalContext.setShowSnackBar(true);
            generalContext.setSnackBarMessage(
              `Limit Exceeded, new request timeout : ${checkDMLimitCall.new_request_dm_timestamp}`
            );
          }
        } catch (error) {
          log(error);
        }
      },
    },
  ];
  if (convoObject.deleted_by !== undefined) {
    return (
      <span
        style={{
          width: "72px",
        }}
      ></span>
    );
  }
  return (
    <Box className="flex items-center">
      <IconButton ref={ref2} onClick={handleOpen}>
        <img src={emojiIcon} alt="emo" width="20px" height="20px" />
      </IconButton>
      <IconButton
        ref={ref}
        onClick={(e: any) => {
          setAnchor(e.currentTarget);
        }}
        className="my-auto"
      >
        {/* <MoreVertIcon /> */}
        <img src={moreIcon} alt="More vertical icon" />
        {/* <MoreVertIcon /> */}
      </IconButton>
      <Menu sx={{ width: "250px" }} open={open} anchorEl={anchor}>
        {options.map((option) => {
          if (
            option.title === "Report" &&
            convoObject.member?.id === userContext.currentUser.id
          ) {
            return null;
          }
          if (
            option.title === "Delete" &&
            convoObject.member?.id !== userContext.currentUser.id
          ) {
            return null;
          }
          if (
            (option.title === "Reply Privately" &&
              generalContext.currentChatroom?.type !== 7 &&
              generalContext.currentChatroom?.type !== 0 &&
              chatroomContext.showReplyPrivately) ||
            (option.title === "Reply Privately" && mode === "direct-messages")
          ) {
            return null;
          }
          if (option.title === "Reply Privately") {
            if (convoObject.member?.id === userContext.currentUser?.id) {
              return null;
            }
            if (
              chatroomContext.replyPrivatelyMode === 2 &&
              convoObject?.member?.state === 4
            ) {
              return null;
            }
          }
          return (
            <MenuItem
              key={option.title}
              onClick={option.clickFunction}
              sx={{
                padding: "10px 20px",
                color: "#323232",
                borderBottom: "1px solid #eeeeee",
                fontSize: "14px",
              }}
            >
              {option.title}
            </MenuItem>
          );
        })}
      </Menu>
      <Dialog
        open={shouldShow}
        onClose={() => {
          setShouldShowBlock(false);
        }}
      >
        <ReportConversationDialogBox
          convoId={convoId}
          onClick={onClickhandlerReport}
          closeBox={() => {
            setShouldShowBlock(false);
          }}
          reportedMemberId={convoObject.member?.member_id}
        />
      </Dialog>
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseEmoji}
      >
        <EmojiPicker
          onEmojiClick={(e) => {
            addReaction(
              e.emoji,
              convoId,
              generalContext.currentChatroom.id
            ).then((_r) => {
              updateMessageLocally(e.emoji);
            });

            handleCloseEmoji();
          }}
        />
      </Menu>
    </Box>
  );
};

type dialogBoxType = {
  onClose: any;
  shouldOpen: any;
  mediaData: any;
};

const DialogBoxMediaDisplay = ({
  onClose,
  shouldOpen,
  mediaData,
}: dialogBoxType) => (
  <Dialog open={shouldOpen} onClose={onClose}>
    <MediaCarousel mediaArray={mediaData?.mediaObj} />
  </Dialog>
);

export default MessageBoxDM;

const ImageConversationView = ({
  imageArray,
  setMediaData,
  setDisplayMediaModel,
  item,
}: any) => {
  function setFunction() {
    setMediaData({ mediaObj: imageArray, type: "image" });
    setDisplayMediaModel(true);
  }
  switch (imageArray.length) {
    case 1:
      return <SingleImageView item={imageArray[0]} setFunction={setFunction} />;
    case 2:
      return null;
    default:
      return null;
  }
};

const SingleImageView = ({ setFunction, item }: any) => (
  <img
    src={item.url}
    alt=""
    className="m-1 w-full max-h-[230px]"
    key={item.url}
    onClick={() => {
      setFunction();
    }}
  />
);
