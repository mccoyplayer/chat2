import React, { useContext, useEffect, useState } from "react";
import {
  getConversationsForGroup,
  linkConverter,
  tagExtracter,
} from "../../sdkFunctions";
import { UserContext } from "../contexts/userContext";
import parse from "html-react-parser";
import { messageStrings } from "../../enums/strings";
import { myClient } from "../..";
import { CircularProgress, Dialog, Tab, Tabs } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AccountCircle } from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import noResults from "./../../assets/svg/noResults.svg";
import routeVariable from "../../enums/routeVariables";
import { useParams } from "react-router-dom";
import ChatroomContext from "../contexts/chatroomContext";
import { GeneralContext } from "../contexts/generalContext";
dayjs.extend(relativeTime);
type PollResponseProps = {
  conversation: any;
};
const PollResponse = ({ conversation }: PollResponseProps) => {
  const { answer = "" } = conversation;
  const params = useParams();
  const id: any = params[routeVariable.id];
  const userContext = useContext(UserContext);
  const chatroomContext = useContext(ChatroomContext);
  const [selectedPolls, setSelectedPolls] = useState<any>([]);
  const [shouldShowSubmitPollButton, setShouldShowSubmitPollButton] =
    useState(false);
  const [showResultsButton, setShowResultsButton] = useState(false);
  const [addPollDialog, setAddPollDialog] = useState(false);
  const [addOptionInputField, setAddOptionInputField] = useState("");
  const [hasPollEnded, setHasPollEnded] = useState(false);

  function setSelectedPollOptions(pollIndex: any) {
    if (Date.now() > conversation.expiry_time) {
      return;
    }
    const newSelectedPolls = [...selectedPolls];
    const isPollIndexIncluded = newSelectedPolls.includes(pollIndex);

    if (isPollIndexIncluded) {
      const selectedIndex = newSelectedPolls.findIndex(
        (index) => index === pollIndex,
      );
      newSelectedPolls.splice(selectedIndex, 1);
    } else {
      switch (conversation?.multiple_select_state) {
        case 0: {
          if (selectedPolls.length === conversation.multiple_select_no) {
            return;
          }
          break;
        }
        case 1: {
          if (selectedPolls.length === conversation.multiple_select_no) {
            return;
          }
          break;
        }
      }
      newSelectedPolls.push(pollIndex);
    }
    setSelectedPolls(newSelectedPolls);
  }

  useEffect(() => {
    return () => {
      setSelectedPolls([]);
      setShouldShowSubmitPollButton(false);
      setShowResultsButton(false);
      setAddPollDialog(false);
      setAddOptionInputField("");
      setHasPollEnded(false);
    };
  }, [conversation]);
  useEffect(() => {
    const difference = conversation?.expiry_time - Date.now();

    if (difference > 0) {
      setHasPollEnded(false);
    } else {
      setHasPollEnded(true);
    }
    if (difference > 0) {
      const timer = setTimeout(() => {
        setHasPollEnded(true);
      }, difference);

      return () => {
        clearTimeout(timer);
      };
    }
  });

  useEffect(() => {
    const res = conversation?.polls?.some((poll: any) => {
      return poll.is_selected === true;
    });
    setShowResultsButton(res);
  }, [conversation]);
  useEffect(() => {
    if (conversation?.multiple_select_no === undefined) {
      if (selectedPolls.length > 0) {
        setShouldShowSubmitPollButton(true);
      } else {
        setShouldShowSubmitPollButton(false);
      }
    } else {
      switch (conversation?.multiple_select_state) {
        case undefined: {
          if (selectedPolls.length === conversation.multiple_select_no) {
            setShouldShowSubmitPollButton(true);
          } else {
            setShouldShowSubmitPollButton(false);
          }
          break;
        }
        case 1: {
          if (
            selectedPolls.length <= conversation.multiple_select_no &&
            selectedPolls.length > 0
          ) {
            setShouldShowSubmitPollButton(true);
          } else {
            setShouldShowSubmitPollButton(false);
          }
          break;
        }
        case 2: {
          if (selectedPolls.length >= conversation.multiple_select_no) {
            setShouldShowSubmitPollButton(true);
          } else {
            setShouldShowSubmitPollButton(false);
          }
          break;
        }
        default: {
          setShouldShowSubmitPollButton(false);
        }
      }
    }
  }, [selectedPolls]);
  async function submitPoll() {
    try {
      const polls = selectedPolls?.map((itemIndex: any) => {
        return conversation?.polls[itemIndex];
      });

      const pollSubmissionCall = await myClient.submitPoll({
        conversationId: conversation?.id,
        polls: polls,
      });
      const op: any = {
        chatroomID: id,
        paginateBy: 100,
      };
      const conversations = await myClient.getConversation(op);
      chatroomContext.setConversationList(conversations?.data?.conversations);
    } catch (error) {
      console.log(error);
    }
  }

  async function addPollOption() {
    try {
      if (addOptionInputField.length === 0) {
        return;
      }
      const pollObject = {
        text: addOptionInputField,
      };
      const addPollCall = await myClient.addPollOption({
        conversationId: conversation.id,
        poll: pollObject,
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="w-full p-2">
      <Dialog
        open={addPollDialog}
        onClose={() => {
          setAddPollDialog(false);
        }}
      >
        <div className="p-12 relative bg-white w-[350px] min-h-[250px]">
          <span
            onClick={() => {
              setAddPollDialog(false);
            }}
            className=" top-[16px] right-[16px] absolute  cursor-pointer"
          >
            <CloseIcon />
          </span>
          <div className="py-2 text-md text-black font-800">
            Add new poll option
          </div>
          <div className="text-400 text-sm">
            Enter an option that you think is missing in this poll. This can not
            be undone.
          </div>
          <div className="py-4">
            <input
              value={addOptionInputField}
              onChange={(e) => {
                setAddOptionInputField(e.target.value);
              }}
              type="text"
              className="w-full border border-[#727272] rounded-[16px] px-2 py-2"
            />
          </div>
          <div className="mt-2">
            <button
              className="w-full flex justify-center items-center bg-[#3884f7] border border-[#727272] rounded-[16px] py-2 mb-2 hover:opacity-50"
              onClick={addPollOption}
            >
              <span className="text-sm text-white hover:text-black">
                SUBMIT
              </span>
            </button>
          </div>
        </div>
      </Dialog>
      <div>
        <div className="flex justify-start items-center">
          <span className="text-xs pr-4 text-[#9B9B9B]">
            {conversation?.poll_type === 0
              ? messageStrings.INSTANT_POLL
              : messageStrings.DEFFERED_POLL}
          </span>
          <span className="text-xs pr-4 text-[#9B9B9B]">
            {conversation?.submit_type_text}
          </span>
        </div>
        <div className="my-2 flex">
          <span>
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="#3884f7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="12"
                fill="#3884f7"
                stroke="none"
                strokeWidth="3"
              />
              <path d="M9 17H7V11H9V17Z" fill="white" />
              <path d="M13 17H11V8H13V17Z" fill="white" />
              <path d="M17 17H15V13H17V17Z" fill="white" />
            </svg>
          </span>
          <span className="grow" />
          <span
            className={`border rounded-full py-1 px-2 text-xs text-white ${
              hasPollEnded ? "bg-[#ff0000]" : "bg-[#3884f7]"
            }`}
          >
            {hasPollEnded
              ? "Poll Ended"
              : "Poll Ends " + dayjs(conversation?.expiry_time).fromNow()}
          </span>
        </div>
        <div className="text-[14px] w-full font-[500] text-[#323232]">
          <span className="msgCard">
            {parse(linkConverter(tagExtracter(answer, userContext)))}
          </span>
        </div>
        <div>
          {conversation?.polls?.map(
            (poll: any, index: any, pollsArray: any) => {
              return (
                <VoteOptionField
                  conversation={conversation}
                  poll={poll}
                  pollsArray={pollsArray}
                  setSelectedPollOptions={setSelectedPollOptions}
                  index={index}
                  conversationId={conversation?.id}
                  key={poll?.id}
                  selectedPolls={selectedPolls}
                />
              );
            },
          )}
        </div>
        <div
          className={`my-2 ${
            conversation?.allow_add_option &&
            conversation?.poll_type === 0 &&
            !showResultsButton
              ? null
              : "hidden"
          } border border-[#D0D8E2] rounded py-2 flex justify-center hover:opacity-80  cursor-pointer`}
          onClick={() => {
            setAddPollDialog(true);
          }}
        >
          <span className="mx-auto text-black text-sm hover:text-black">
            ADD OPTION
          </span>
        </div>
        {conversation.poll_type === 0 ? (
          <div
            className={`my-2 ${
              shouldShowSubmitPollButton && showResultsButton === false
                ? null
                : "hidden"
            } border border-[#EEEEEE] rounded-[48px] py-2 flex justify-center bg-[#3884f7] hover:opacity-80 cursor-pointer`}
            onClick={submitPoll}
          >
            <span className="mx-auto text-white text-sm">SUBMIT</span>
          </div>
        ) : showResultsButton ? (
          <div
            className={`my-2 ${""} border border-[#EEEEEE] rounded-[48px] py-2 flex justify-center bg-[#3884f7] hover:opacity-80 cursor-pointer`}
            onClick={() => {
              setShowResultsButton(false);
              conversation.polls = conversation.polls.map((item: any) => {
                return {
                  ...item,
                  is_selected: false,
                };
              });
              setSelectedPolls([]);
            }}
          >
            <span className="mx-auto text-white text-sm">EDIT POLL</span>
          </div>
        ) : (
          <div
            className={`my-2 ${
              shouldShowSubmitPollButton ? null : "hidden"
            } border border-[#EEEEEE] rounded-[48px] py-2 flex justify-center bg-[#3884f7] hover:opacity-80 cursor-pointer`}
            onClick={submitPoll}
          >
            <span className="mx-auto text-white text-sm">SUBMIT POLL</span>
          </div>
        )}
        <span className="pt-4 text-xs text-[#9B9B9B]">
          {conversation.poll_answer_text}
        </span>
      </div>
    </div>
  );
};

function VoteOptionField({
  conversation,
  poll,
  pollsArray,
  setSelectedPollOptions,
  index,
  conversationId,
  setShouldShowResults,
  selectedPolls,
}: any) {
  const [shouldShowVotes, setShouldShowVotes] = useState(false);
  const [showSelected, setShowSelected] = useState(false);
  const [pollResults, setPollResults] = useState<any>();
  const [shouldOpenPollResultsDialog, setShouldOpenPollResultsDialog] =
    useState(false);
  const [selectedPollResultTab, setSelectedPollResultTab] = useState(0);
  const [showLoadingCircle, setShowLoadingCircle] = useState(false);
  const generalContext = useContext(GeneralContext);
  function clickHandler() {
    if (Date.now() > conversation.expiry_time || shouldShowVotes) {
      return;
    }
    setShowSelected(!showSelected);
    setSelectedPollOptions(index);
  }
  async function getPollUsers() {
    try {
      const getPollUsersCall: any = await myClient.getPollUsers({
        conversationId: conversationId,
        pollId: pollsArray[selectedPollResultTab]?.id,
      });
      setPollResults(getPollUsersCall?.data);
      setShowLoadingCircle(false);
    } catch {}
  }
  function handlePollResultTabChange(event: any, newValue: any) {
    setSelectedPollResultTab(newValue);
  }
  useEffect(() => {
    const res = pollsArray?.some((poll: any) => {
      return poll.is_selected === true;
    });
    setShouldShowVotes(res);
  }, [pollsArray]);

  useEffect(() => {
    if (shouldShowVotes) {
      setShowLoadingCircle(true);
      getPollUsers();
    }
  }, [shouldShowVotes, selectedPollResultTab]);

  return (
    <>
      <Dialog
        open={shouldOpenPollResultsDialog}
        onClose={() => {
          setShouldOpenPollResultsDialog(!shouldOpenPollResultsDialog);
        }}
      >
        <div className="py-2 px-4 min-h-[600px] min-w-[400px] max-h-full">
          <span
            className="absolute top-[16px] right-[16px] cursor-pointer"
            onClick={() => {
              setShouldOpenPollResultsDialog(!shouldOpenPollResultsDialog);
            }}
          >
            <CloseIcon />
          </span>
          <div className="my-8">
            <Tabs
              value={selectedPollResultTab}
              onChange={handlePollResultTabChange}
              variant="fullWidth"
            >
              {pollsArray.map((poll: any) => {
                return (
                  <Tab
                    label={poll?.text}
                    key={poll.id}
                    icon={
                      <p className="font-normal text-xs">
                        {poll.no_votes} Votes
                      </p>
                    }
                    iconPosition="top"
                  />
                );
              })}
            </Tabs>
            {showLoadingCircle ? (
              <div className="flex justify-center items-center h-full">
                <CircularProgress />
              </div>
            ) : pollResults?.members?.length === 0 ? (
              <div className="h-[400px] flex justify-center items-center flex-col text-sm">
                <img src={noResults} alt="" />

                <p>No Results</p>
              </div>
            ) : (
              pollResults?.members?.map((member: any) => {
                return (
                  <div
                    className="py-4 px-4 flex items-center border-t border-b"
                    key={member.id}
                  >
                    <div className="mr-6">
                      {member?.image_url?.length !== 0 ? (
                        <div className="h-[48px] w-[48px] rounded rounded-full">
                          <img
                            className="h-full w-auto rounded rounded-full"
                            src={member?.image_url}
                            alt="imageIcon"
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center">
                          <AccountCircle />
                        </div>
                      )}
                    </div>
                    <div className="grow">
                      {member.name
                        .split(" ")
                        .map((text: string) => {
                          return text.charAt(0).toUpperCase() + text.slice(1);
                        })
                        .join(" ")}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Dialog>
      <div key={poll?.id} className={` text-md font-[300] mt-2 cursor-pointer`}>
        <div onClick={clickHandler}>
          {poll.is_selected || selectedPolls.includes(index) ? (
            <div
              className={`border border-[#3884f7] py-2 px-4 rounded rounded-2`}
            >
              {poll?.text}
            </div>
          ) : (
            <div className="border border-[#D0D8E2] rounded rounded-2 py-2 px-4">
              {poll?.text}
            </div>
          )}
        </div>
      </div>
      {shouldShowVotes || Date.now() > conversation.expiry_time ? (
        <span
          className="cursor-pointer text-xs"
          onClick={() => {
            if (poll?.is_anonymous) {
              generalContext.setShowSnackBar(true);
              generalContext.setSnackBarMessage(
                "Viewing Results Not Available In Anonymous Polls",
              );
              return;
            }
            setShouldOpenPollResultsDialog(true);
          }}
        >
          {poll.no_votes} votes
        </span>
      ) : null}
    </>
  );
}
export default PollResponse;
