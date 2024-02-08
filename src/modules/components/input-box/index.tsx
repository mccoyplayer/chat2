import { Box, Dialog, IconButton, Menu } from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { MentionsInput, Mention } from "react-mentions";
import { Close } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import ReactGiphySearchbox from "react-giphy-searchbox";
import { INPUT_BOX_DEBOUNCE_TIME } from "../../constants/constants";
import InputFieldContext from "../../contexts/inputFieldContext";
import { GeneralContext } from "../../contexts/generalContext";
import ChatroomContext from "../../contexts/chatroomContext";
import pdfIcon from "../../../assets/svg/pdf-document.svg";
import paperclip from "../../../assets/svg/paperclip.svg";
import routeVariable from "../../../enums/routeVariables";
import { clearInputFiles } from "../../../sdkFunctions";
import SendIcon from "../../../assets/svg/send.svg";
import camera from "../../../assets/svg/camera.svg";
import smiley from "../../../assets/svg/smile.svg";
import giffy from "../../../assets/svg/giffy.svg";
import mic from "../../../assets/svg/mic.svg";
import ReplyBox from "./replyContainer";
import { sendMessage } from "./input";
import { myClient } from "../../..";
import Poll from "../../post-polls";
import "./Input.css";

const Input = ({ setBufferMessage, disableInputBox }: any) => {
  const [messageText, setMessageText] = useState("");
  const [audioAttachments, setAudioAttachments] = useState([]);
  const [mediaAttachments, setMediaAttachments] = useState([]);
  const [giphyUrl, setGiphyUrl] = useState("");
  const inputBoxContainerRef = useRef<any>(null);
  const [documentAttachments, setDocumentAttachments] = useState([]);
  const [toggleGifRef, setToggleGifRef] = useState(function () {});

  return (
    <InputFieldContext.Provider
      value={{
        messageText,
        setMessageText,
        audioAttachments,
        setAudioAttachments,
        mediaAttachments,
        setMediaAttachments,
        documentAttachments,
        setDocumentAttachments,
        giphyUrl,
        setGiphyUrl,
      }}
    >
      <Box
        className="pt-[20px] pb-[5px] px-[40px] bg-white z:max-md:pl-2 "
        // ref={inputBoxContainerRef}
        id="input-container"
      >
        <InputSearchField
          setBufferMessage={setBufferMessage}
          disableInputBox={disableInputBox}
          setToggleGifRef={setToggleGifRef}
        />
        <InputOptions
          containerRef={inputBoxContainerRef}
          disableInputBox={disableInputBox}
          toggleGifRef={toggleGifRef}
          // toggleGifRef={() => {}}
        />
      </Box>
    </InputFieldContext.Provider>
  );
};

const InputSearchField = ({
  setBufferMessage,
  disableInputBox,
  setToggleGifRef,
}: any) => {
  const [memberDetailsArray, setMemberDetailsArray] = useState<Array<any>>([]);
  const [enableInputBox, setEnableInputBox] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [loadMoreMembers, setLoadMoreMembers] = useState<any>(true);
  // const [debounceBool, setDebounceBool] = useState(true);
  const chatroomContext = useContext(ChatroomContext);
  const inputFieldContext = useContext(InputFieldContext);
  const generalContext = useContext(GeneralContext);
  const { messageText, setMessageText } = inputFieldContext;
  const inputBoxRef = useRef<any>(null);
  const params = useParams();
  const id: any = params[routeVariable.id];
  const mode: any = params[routeVariable.mode];
  const operation: any = params[routeVariable.operation];
  const [chatRequestVariable, setChatRequestVariable] = useState<any>(null);
  const [throttleScroll, setThrottleScroll] = useState(true);
  const timeOut = useRef<any>(null);
  const suggestionsRef = useRef<any>(null);
  const cbRef = useRef<any>(null);
  async function getTaggingMembers(searchString: any, pageNo: any) {
    try {
      const call = await myClient.getTaggingList({
        chatroomId: parseInt(id, 10),
        page: pageNo,
        pageSize: 10,
        searchName: searchString,
      });
      // // log(call);
      // return call?.data?.community_members;
      return call?.data?.members;
    } catch (error) {
      // log(error);
    }
  }
  useEffect(() => {
    if (throttleScroll === false) {
      setTimeout(() => {
        setThrottleScroll(true);
      }, 1000);
    }
  });
  useEffect(() => () => {
    if (timeOut.current != null) {
      clearTimeout(timeOut.current);
    }
  });
  useEffect(() => {
    if (enableInputBox) {
      setTimeout(() => {
        setEnableInputBox(false);
      }, INPUT_BOX_DEBOUNCE_TIME);
    }
  });
  useEffect(() => {
    const { currentChatroom } = generalContext;
    if (
      currentChatroom?.member?.state === 1 ||
      currentChatroom?.chatroom_with_user?.state === 1
    ) {
      setChatRequestVariable(1);
    } else {
      setChatRequestVariable(0);
    }
  }, [generalContext.currentChatroom]);

  useEffect(() => {
    if (inputBoxRef.current) {
      inputBoxRef?.current?.focus();
    }
  });

  const keyObj = {
    enter: false,
    shift: false,
  };

  // State to manage the visibility of the div
  const [isDivVisible, setIsDivVisible] = useState(false);

  // Function to toggle the visibility state
  const toggleDivVisibility = () => {
    setIsDivVisible(!isDivVisible);
  };

  useEffect(() => {
    setToggleGifRef(() => toggleDivVisibility);
  }, [isDivVisible]);

  return (
    <Box sx={{ position: "relative" }}>
      <div className="giphyContainer">
        {/* Giphy Searchbox component */}
        <ReactGiphySearchbox
          apiKey="9hQZNoy1wtM2b1T4BIx8B0Cwjaje3UUR"
          onSelect={(item: any) => {
            inputFieldContext.setGiphyUrl(item);
            toggleDivVisibility();
          }}
          poweredByGiphy={false}
          searchPlaceholder="Search GIPHY"
          wrapperClassName={`gifContainer ${
            isDivVisible ? "visible" : "hidden"
          }`}
          searchFormClassName="gifSearchBox"
          masonryConfig={[
            { columns: 2, imageWidth: 140, gutter: 10 },
            { mq: "600px", columns: 4, imageWidth: 200, gutter: 3 },
            // { mq: "1000px", columns: 4, imageWidth: 220, gutter: 10 },
          ]}
        />
      </div>
      {/* for adding reply */}
      {chatroomContext.isSelectedConversation ? (
        <ReplyBox
          openReplyBox={chatroomContext.isSelectedConversation}
          memberName={chatroomContext.selectedConversation?.member?.name}
          answer={chatroomContext.selectedConversation?.answer}
          setIsSelectedConversation={chatroomContext.setIsSelectedConversation}
          setSelectedConversation={chatroomContext.setSelectedConversation}
          attachments={chatroomContext.selectedConversation.attachments}
        />
      ) : null}

      {/* for preview Image */}

      <DocPreview />
      <AudioPreview />
      <ImagePreview />
      <div className="relative">
        <IconButton
          onClick={() => {
            // console.log(generalContext.currentChatroom);
            sendMessage(
              generalContext?.currentChatroom?.chat_request_state,
              chatRequestVariable,
              chatroomContext,
              parseInt(id, 10),
              inputFieldContext,
              setBufferMessage,
              setEnableInputBox,
              mode
            ).then(() => {
              if (!generalContext.currentChatroom?.follow_status) {
              }
            });
          }}
          className="absolute right-[8.6%] top-[9.5%]"
          sx={{
            position: "absolute",
            top: "9.5%",
            bottom: "9.5%",
            right: "1%",
            zIndex: 1,
            display: disableInputBox ? "none" : "block",
          }}
        >
          {/* <SendIcon className="text-[#3884F7]" /> */}
          <img src={SendIcon} alt="send" />
        </IconButton>
        <MentionsInput
          disabled={enableInputBox || disableInputBox}
          className="mentions"
          spellCheck="false"
          placeholder={
            disableInputBox
              ? "Input box has been disabled"
              : "Write a Comment..."
          }
          value={messageText}
          customSuggestionsContainer={(children: any) => (
            <div
              className="max-h-[400px] overflow-auto hello_world"
              ref={suggestionsRef}
              onScroll={() => {
                if (!loadMoreMembers || !throttleScroll) {
                  return;
                }
                const current = suggestionsRef?.current?.scrollTop;
                let currentHeight = suggestionsRef?.current?.clientHeight;
                currentHeight = currentHeight.toString();
                if (current >= currentHeight) {
                  setThrottleScroll(false);
                  console.log(memberDetailsArray);
                  const pgNo = Math.floor(memberDetailsArray?.length / 10) + 1;
                  getTaggingMembers(searchString, pgNo).then((val) => {
                    const arr = val.map((item: any) => {
                      item.display = item.name;
                      return item;
                    });
                    const n = [...memberDetailsArray].concat(arr);
                    setMemberDetailsArray(n);
                    cbRef.current(n);
                  });
                }
              }}
            >
              {children}
            </div>
          )}
          onChange={(event) => setMessageText(event.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              keyObj.enter = true;
            }
            if (e.key === "Shift") {
              keyObj.shift = true;
            }
            if (keyObj.enter === true && keyObj.shift === true) {
              let newStr = messageText;
              newStr += " \n ";
              setMessageText(newStr);
            } else if (keyObj.enter === true && keyObj.shift === false) {
              e.preventDefault();
              sendMessage(
                generalContext.currentChatroom.chat_request_state,
                chatRequestVariable,
                chatroomContext,
                parseInt(id, 10),
                inputFieldContext,
                setBufferMessage,
                setEnableInputBox,
                mode
              );
            }
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              keyObj.enter = false;
            }
            if (e.key === "Shift") {
              keyObj.shift = false;
            }
          }}
          inputRef={inputBoxRef}
        >
          <Mention
            trigger="@"
            data={(search, callback) => {
              timeOut.current = setTimeout(() => {
                getTaggingMembers(search, 1).then((val) => {
                  console.log(val);
                  const arr = val?.map((item: any) => {
                    item.display = item?.name;
                    item.id = item?.sdk_client_info.uuid;
                    return item;
                  });
                  if (arr?.length < 10) {
                    setLoadMoreMembers(false);
                  }
                  cbRef.current = callback;
                  setSearchString(search);
                  setMemberDetailsArray(arr);
                  callback(arr);
                });
              }, 500);
            }}
            markup="<<__display__|route://user_profile/__id__>>"
            style={{ backgroundColor: "#daf4fa" }}
            // onAdd={(id) => setActorIds((actorIds) => [...actorIds, id])}
            appendSpaceOnAdd
            renderSuggestion={(
              suggestion: any,
              _search,
              _highlightedDisplay,
              _index,
              focused
            ) => (
              <div className={`user ${focused ? "focused" : ""}`}>
                {suggestion?.imageUrl?.length > 0 ? (
                  <div className="imgBlock">
                    <img src={suggestion?.imageUrl} alt="profile_image" />
                  </div>
                ) : (
                  <div className="imgBlock">
                    <span>{suggestion?.display[0]}</span>
                  </div>
                )}
                <span style={{ color: "#323232" }}>{suggestion.display}</span>
              </div>
            )}
          />
        </MentionsInput>
      </div>
    </Box>
  );
};

const InputOptions = ({ containerRef, disableInputBox, toggleGifRef }: any) => {
  const [openPollDialog, setOpenPollDialog] = useState(false);
  const inputFieldContext = useContext(InputFieldContext);
  const params = useParams();

  const mode: any = params[routeVariable.mode];
  const operation: any = params[routeVariable.operation];
  const {
    audioAttachments,
    setAudioAttachments,
    mediaAttachments,
    setMediaAttachments,
    documentAttachments,
    setDocumentAttachments,
  } = inputFieldContext;
  const optionArr = [
    {
      title: "emojis",
      Icon: smiley,
    },
    // {
    //   title: "audio",
    //   Icon: mic,
    //   file: audioAttachments,
    //   setFile: setAudioAttachments,
    // },
    {
      title: "camera",
      Icon: camera,
      file: mediaAttachments,
      setFile: setMediaAttachments,
    },
    {
      title: "attach",
      Icon: paperclip,
      file: documentAttachments,
      setFile: setDocumentAttachments,
    },
    {
      title: "gif",
      Icon: giffy,
    },
    {
      title: "poll",
      Icon: paperclip,
    },
  ];
  if (disableInputBox) {
    return null;
  }
  return (
    <Box className="flex items-center">
      {optionArr.map((option, _optionIndex) => {
        const { title, Icon, file, setFile } = option;
        let accept;
        let fileType;
        if (title === "audio") {
          accept = "audio/*";
          fileType = "audio";
        } else if (title === "camera") {
          accept = "image/*,video/*";
          fileType = "video";
        } else if (title === "attach") {
          accept = ".pdf";
          fileType = "doc";
        }
        // GIPHY
        if (title === "gif") {
          return (
            <IconButton
              key={title}
              className="p-2"
              onClick={() => {
                toggleGifRef();
              }}
            >
              <img src={giffy} alt="gif" />
            </IconButton>
          );
        }

        // Poll Room
        if (title === "poll" && mode === "groups") {
          return (
            <IconButton
              onClick={() => {
                setOpenPollDialog(true);
              }}
              key={title}
              className="p-2"
            >
              <span className="cursor-pointer ">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 20 20"
                  fill="red"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.4269 19.0057H7.63737V0.0583496H11.4269V19.0057ZM3.84796 19.0057H0.0584717V5.74254H3.84796V19.0057ZM15.2163 19.0057H19.0058V11.4268H15.2163V19.0057Z"
                    fill="black"
                  />
                </svg>
              </span>
            </IconButton>
          );
        }
        if (title === "camera" || title === "attach") {
          return (
            <OptionButtonBox
              key={title}
              icon={Icon}
              accept={accept}
              setFile={setFile}
              file={file}
            />
          );
        }
        if (title === "emojis") {
          return (
            <EmojiButton
              option={option}
              key={option.title}
              containerRef={containerRef}
            />
          );
        }
      })}
      <Dialog
        open={openPollDialog}
        onClose={() => {
          setOpenPollDialog(false);
        }}
      >
        <Poll
          closeDialog={() => {
            setOpenPollDialog(false);
          }}
        />
      </Dialog>
    </Box>
  );
};
const OptionButtonBox = ({ icon, accept, setFile, file }: any) => {
  const inputFieldContext = useContext(InputFieldContext);
  const ref = useRef<any>(null);
  useEffect(() => {
    if (file?.length === 0) {
      if (ref.current != null) {
        ref.current!.value = null;
      }
    }
  });
  return (
    <IconButton>
      <label>
        <input
          ref={ref}
          type="file"
          style={{ display: "none" }}
          multiple
          accept={accept}
          onChange={(e) => {
            inputFieldContext.setDocumentAttachments([]);
            inputFieldContext.setMediaAttachments([]);
            setFile(e.target.files);
          }}
        />
        <img className="w-[20px] h-[20px]" src={icon} alt="" />
      </label>
    </IconButton>
  );
};

const EmojiButton = ({ option }: any) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const ref = useRef(null);
  const handleOpen = () => {
    setAnchorEl(ref.current);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { messageText, setMessageText } = useContext(InputFieldContext);
  return (
    <div>
      <IconButton ref={ref} onClick={handleOpen}>
        <img className="w-[20px] h-[20px]" src={option.Icon} />
      </IconButton>
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        sx={{
          transform: "translate(0%, -15%)",
        }}
      >
        <EmojiPicker
          onEmojiClick={(e) => {
            let newText = messageText;
            newText += `${e.emoji}`;
            setMessageText(newText);
          }}
        />
      </Menu>
    </div>
  );
};

export default Input;

const ImagePreview = () => {
  const inputFieldContext = useContext(InputFieldContext);
  const {
    audioAttachments,
    setAudioAttachments,
    mediaAttachments,
    setMediaAttachments,
    documentAttachments,
    setDocumentAttachments,
    giphyUrl,
  } = inputFieldContext;

  const [mediaArray, setMediaArray] = useState<Array<any>>([]);
  useEffect(() => {
    const newArr: any = [];
    for (const nf of mediaAttachments) {
      if (
        nf.type.split("/")[0] === "image" ||
        nf.type.split("/")[0] === "video"
      ) {
        newArr.push(nf);
      }
    }
    setMediaArray(newArr);
  }, [audioAttachments, mediaAttachments, documentAttachments]);
  function removeMediaAttachment(index: number) {
    const newDocAttachments = [...mediaAttachments];
    newDocAttachments.splice(index, 1);
    setMediaAttachments(newDocAttachments);
  }
  return (
    <div
      style={{
        display:
          mediaArray.length > 0 ||
          giphyUrl?.images?.fixed_height?.url?.length > 0
            ? "block"
            : "none",
      }}
    >
      <div className="w-full  p-3 pt-0 flex">
        {mediaArray.map((file: any, fileIndex) => {
          const fileTypeInitial = file.type.split("/")[0];
          if (fileTypeInitial === "image") {
            return (
              <div
                className="max-w-[120px] w-[90px] h-[90px] mr-2 relative"
                key={file.name + fileIndex}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="h-full w-full cover rounded-[12px]  "
                />
                <span
                  onClick={() => {
                    removeMediaAttachment(fileIndex);
                  }}
                  className="absolute top-[-12px] right-[-8px] width-[24px] height-[24px] text-center rounded-full bg-[#f9f9f9]  cursor-pointer"
                >
                  <Close
                    style={{
                      width: "12px",
                      height: "12px",
                    }}
                  />
                </span>
              </div>
            );
          }
          if (fileTypeInitial === "video") {
            return (
              <div
                className="max-w-[120px] w-[90px] h-[90px] mr-2 relative"
                key={file.name + fileIndex}
              >
                <video
                  src={URL.createObjectURL(file)}
                  controls
                  className="h-full w-full cover rounded-[12px] "
                />
                <span
                  onClick={() => {
                    removeMediaAttachment(fileIndex);
                  }}
                  className="absolute top-[-12px] right-[-8px] width-[24px] height-[24px] text-center rounded-full bg-[#f9f9f9]  cursor-pointer"
                >
                  <Close
                    style={{
                      width: "12px",
                      height: "12px",
                    }}
                  />
                </span>
              </div>
            );
          }
          return null;
        })}
        {/* GIPHY Preview  */}
        {/* {giphyUrl?.images?.fixed_height?.url?.length > 0 ? ( */}
        {giphyUrl?.url?.length > 0 ? (
          <div className="max-w-[120px]">
            {/* <img src={giphyUrl?.url} alt="giphy image" /> */}
            <img src={giphyUrl?.images?.fixed_height?.url} alt="giphy image" />
          </div>
        ) : null}
      </div>
      <IconButton
        style={{
          position: "absolute",
          right: "16px",
          top: "0px",
        }}
        onClick={() => {
          clearInputFiles({
            setDocFiles: setDocumentAttachments,
            setMediaFiles: setMediaAttachments,
            setAudioFiles: setAudioAttachments,
          });
          inputFieldContext.setGiphyUrl(null);
        }}
      >
        <Close />
      </IconButton>
    </div>
  );
};
const AudioPreview = () => {
  const chatroomContext = useContext(ChatroomContext);
  const inputFieldContext = useContext(InputFieldContext);
  const {
    audioAttachments,
    setAudioAttachments,
    mediaAttachments,
    setMediaAttachments,
    documentAttachments,
    setDocumentAttachments,
  } = inputFieldContext;

  const [mediaArray, setMediaArray] = useState<Array<[]>>([]);
  useEffect(() => {
    const newArr: any = [];
    for (const nf of audioAttachments) {
      if (nf.type.split("/")[0] === "audio") {
        newArr.push(nf);
      }
    }
    setMediaArray(newArr);
  }, [audioAttachments, mediaAttachments, documentAttachments]);
  return (
    <div style={{ display: mediaArray.length > 0 ? "block" : "none" }}>
      <div className="w-full  p-3 pt-0 flex justify-between">
        {mediaArray.map((file: any, fileIndex) => {
          const fileTypeInitial = file.type.split("/")[0];

          if (fileTypeInitial === "audio") {
            return (
              <div className="max-w-[120px]" key={file.name + fileIndex}>
                <audio src={URL.createObjectURL(file)} controls />
              </div>
            );
          }
          return null;
        })}
        <IconButton
          onClick={() => {
            clearInputFiles({
              setDocFiles: setDocumentAttachments,
              setMediaFiles: setMediaAttachments,
              setAudioFiles: setAudioAttachments,
            });
          }}
        >
          <Close />
        </IconButton>
      </div>
    </div>
  );
};
const DocPreview = () => {
  const chatroomContext = useContext(ChatroomContext);
  const inputFieldContext = useContext(InputFieldContext);
  const {
    audioAttachments,
    setAudioAttachments,
    mediaAttachments,
    setMediaAttachments,
    documentAttachments,
    setDocumentAttachments,
  } = inputFieldContext;

  const [mediaArray, setMediaArray] = useState<unknown[] | any>([]);
  useEffect(() => {
    const newArr: any = [];
    for (const nf of documentAttachments) {
      if (nf.type.split("/")[1] === "pdf") {
        newArr.push(nf);
      }
    }
    setMediaArray(newArr);
  }, [audioAttachments, documentAttachments, mediaAttachments]);
  function removeDocumentAttachment(index: number) {
    const newDocAttachments = [...documentAttachments];
    newDocAttachments.splice(index, 1);
    setDocumentAttachments(newDocAttachments);
  }
  return (
    <div
      style={{
        display: mediaArray.length > 0 ? "block" : "none",
        position: "relative",
      }}
    >
      <div className="w-full  p-3 pt-0 flex items-center grow-0">
        {/* {mediaArray.map((file: any, fileIndex) => {
          const fileTypeInitial = file.type.split("/")[1];

          if (fileTypeInitial === "pdf") {
            return (
              <div className="max-w-[120px]" key={file.name + fileIndex}>
                <img src={pdfIcon} alt="pdf" className="w-[24px]" />
              </div>
            );
          }
          return null;
        })} */}
        {mediaArray.map((item: any, index: number) => {
          return (
            <>
              <div className=" bg-[#f9f9f9] rounded-[12px] p-4 flex justify-center items-center relative mr-5">
                <a
                  href={item?.url?.toString() || ""}
                  target="_blank"
                  rel="noreferrer"
                  key={item?.url}
                >
                  <img src={pdfIcon} alt="pdf" className="w-[24px]" />
                </a>
                <span
                  onClick={() => {
                    removeDocumentAttachment(index);
                  }}
                  className="absolute top-[-12px] right-[-8px] width-[24px] height-[24px] text-center rounded-full bg-[#f9f9f9]  cursor-pointer"
                >
                  <Close
                    style={{
                      width: "12px",
                      height: "12px",
                    }}
                  />
                </span>
              </div>
            </>
          );
        })}
      </div>
      <IconButton
        style={{
          position: "absolute",
          right: "16px",
          top: "0px",
        }}
        onClick={() => {
          clearInputFiles({
            setDocFiles: setDocumentAttachments,
            setMediaFiles: setMediaAttachments,
            setAudioFiles: setAudioAttachments,
          });
        }}
      >
        <Close />
      </IconButton>
    </div>
  );
};
