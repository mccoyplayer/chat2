import { nanoid } from "nanoid";
import React, { useContext, useEffect, useState } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { DateTimePicker } from "@mui/x-date-pickers";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { messageStrings } from "../../enums/strings";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import checkmark from "../../assets/checkMark.svg";
import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";
import { myClient } from "../..";
import { useParams } from "react-router-dom";
import routeVariable from "../../enums/routeVariables";
import { GeneralContext } from "../contexts/generalContext";

function PollBody({ closeDialog }: any) {
  const [question, setQuestion] = useState<string>("");
  const [optionsArray, setOptionsArray] = useState<any>([]);
  const [voterAddOptions, setVoterAddOptions] = useState(false);
  const [anonymousPoll, setAnonymousPoll] = useState(false);
  const [liveResults, setLiveResults] = useState(false);
  const [voteAllowerPerUserTerm, setVoteAllowedPerUserTerm] = useState<any>(1);
  const [voteAllowedPerUser, setVoteAllowedPerUser] = useState<any>(1);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<any>(false);
  const [expiryTime, setExpiryTime] = useState<any>("");
  const [isOptionsOkay, setIsOptionsOkay] = useState<boolean>(false);
  const generalContext = useContext(GeneralContext);
  const params = useParams();
  const id = params[routeVariable.id];
  useEffect(() => {
    const id_1 = nanoid();
    const id_2 = nanoid();
    const initialOptionArray = [
      {
        id: id_1,
        text: "",
      },
      {
        id: id_2,
        text: "",
      },
    ];
    setOptionsArray(initialOptionArray);
  }, []);
  useEffect(() => {
    const tempPollOptionsMap: any = {};
    let shouldBreak = false;
    optionsArray.map((item: any) => {
      if (tempPollOptionsMap[item?.text?.trim().toLowerCase()] !== undefined) {
        shouldBreak = true;
        return null;
      } else {
        if (item?.text?.trim()?.toLowerCase() === "") {
          shouldBreak = true;
        }
        tempPollOptionsMap[item?.text?.trim().toLowerCase()] = true;
        return {
          text: item?.text?.trim().toLowerCase(),
        };
      }
    });
    if (shouldBreak) {
      return;
    } else {
      setIsOptionsOkay(true);
    }
  }, [optionsArray]);
  function setQuestionField(e: any) {
    setQuestion(e.target.value);
  }
  function handleInputOptionsChangeFunction(index: any, value: any) {
    const newOptions: any = [...optionsArray];
    newOptions[index].text = value;
    setOptionsArray(newOptions);
  }
  function addNewOption() {
    const newOptionsArr = [...optionsArray];
    const newOption = {
      id: nanoid(),
      text: "",
    };
    newOptionsArr.push(newOption);
    setOptionsArray(newOptionsArr);
  }
  function removeAnOption(index: any) {
    const newOptionsArr = [...optionsArray];
    newOptionsArr.splice(index, 1);
    setOptionsArray(newOptionsArr);
  }
  async function postPoll() {
    try {
      if (question?.trim().length === 0) {
        generalContext.setSnackBarMessage("Question field cannot be empty");
        generalContext.setShowSnackBar(true);
        return;
      }

      const tempPollOptionsMap: any = {};
      let shouldBreak = false;
      if (!optionsArray.length) {
        generalContext.setSnackBarMessage("A poll cannot have empty options.");
        generalContext.setShowSnackBar(true);
        return;
      }
      const polls = optionsArray.map((item: any) => {
        if (
          tempPollOptionsMap[item?.text?.trim().toLowerCase()] !== undefined
        ) {
          generalContext.setSnackBarMessage("Poll options cannot be the same");
          generalContext.setShowSnackBar(true);
          shouldBreak = true;
          return null;
        } else {
          if (item?.text?.trim()?.toLowerCase() === "") {
            generalContext.setSnackBarMessage("Empty options are not allowed");
            generalContext.setShowSnackBar(true);
            shouldBreak = true;
          }
          tempPollOptionsMap[item?.text?.trim().toLowerCase()] = true;
          return {
            text: item?.text?.trim().toLowerCase(),
          };
        }
      });
      if (shouldBreak) {
        return;
      }
      if (expiryTime?.length === 0) {
        generalContext.setSnackBarMessage("Please select expiry time");
        generalContext.setShowSnackBar(true);
        return;
      }
      if (Date.now() > expiryTime) {
        generalContext.setSnackBarMessage(
          "Poll expiry time should not be less than current time"
        );
        generalContext.setShowSnackBar(true);
        return;
      }

      const pollOptions = {
        chatroomId: parseInt(id!),
        text: question,
        expiryTime: parseInt(expiryTime),
        pollType: liveResults ? 1 : 0,
        isAnonymous: anonymousPoll,
        allowAddOption: voterAddOptions,
        polls: polls,
        state: 10,
        multipleSelectState: voteAllowerPerUserTerm,
        multipleSelectNo: voteAllowedPerUser,
      };

      const pollCall = await myClient.postPollConversation(pollOptions);

      closeDialog();
    } catch (error) {}
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="pt-2 overflow-x-hidden">
        <textarea
          className="text-4 font-normal leading-6 w-full border border-[#D0D8E2] rounded-[8px] p-4 resize-none"
          placeholder="Ask a question*"
          value={question}
          onChange={setQuestionField}
          rows={2}
        />

        <p className="text-[#ACB7C0] text-sm ml-4">
          {messageStrings.POLL_OPTIONS_HEADING}
        </p>
        <div className="mb-1 ">
          {optionsArray.map((option: any, index: number) => {
            return (
              <div className="mb-4 relative" key={option.id}>
                <input
                  type="text"
                  value={option?.text}
                  onChange={(e: any) => {
                    handleInputOptionsChangeFunction(index, e?.target?.value);
                  }}
                  className="text-4 font-normal leading-6 w-full border border-[#D0D8E2] rounded-[8px] p-4"
                  placeholder="Option"
                />
                <span
                  className="absolute top-[50%] right-0 mr-4 -translate-y-1/2 cursor-pointer"
                  onClick={() => {
                    removeAnOption(index);
                  }}
                >
                  <HighlightOffIcon
                    sx={{
                      color: "#979797",
                      fontWeight: 300,
                    }}
                  />
                </span>
              </div>
            );
          })}
          <div
            className="text-4 font-semibold leading-6 w-full border border-[#D0D8E2] rounded-[8px] p-4 flex items-center cursor-pointer mb-2"
            onClick={addNewOption}
          >
            <AddCircleOutlineIcon className="text-[#3884f7]" />
            <span className="px-2 text-[#3884f7]">
              {messageStrings.ADD_ANOTHER_POLL_OPTION}
            </span>
          </div>
        </div>
        <p className="text-[12px] text-[#ACB7C0] mt-2 ml-4">
          {messageStrings.POLL_EXPIRES_ON_HEADING}
        </p>
        {/* <div className="text-4 font-semibold leading-6 w-full border border-[#D0D8E2] rounded-2  cursor-pointer"> */}
        <div className="relative">
          <span className="absolute left-2 top-[50%] -translate-y-[50%]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="28" height="28" fill="white" fillOpacity="0.01" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.4834 10.25H22.5635C22.8293 10.25 23.0469 10.0391 23.0469 9.78125V8.375C23.0469 7.33984 22.1808 6.5 21.1133 6.5H19.1797V4.46875C19.1797 4.21094 18.9622 4 18.6963 4H17.085C16.8191 4 16.6016 4.21094 16.6016 4.46875V6.5H11.4453V4.46875C11.4453 4.21094 11.2278 4 10.9619 4H9.35059C9.08472 4 8.86719 4.21094 8.86719 4.46875V6.5H6.93359C5.86609 6.5 5 7.33984 5 8.375V9.78125C5 10.0391 5.21753 10.25 5.4834 10.25ZM22.5635 11.5H5.4834C5.21753 11.5 5 11.7109 5 11.9688V22.125C5 23.1602 5.86609 24 6.93359 24H21.1133C22.1808 24 23.0469 23.1602 23.0469 22.125V11.9688C23.0469 11.7109 22.8293 11.5 22.5635 11.5ZM10.1562 19.4688C10.1562 19.2109 9.93872 19 9.67285 19H8.06152C7.79565 19 7.57812 19.2109 7.57812 19.4688V21.0312C7.57812 21.2891 7.79565 21.5 8.06152 21.5H9.67285C9.93872 21.5 10.1562 21.2891 10.1562 21.0312V19.4688ZM9.67285 14C9.93872 14 10.1562 14.2109 10.1562 14.4688V16.0312C10.1562 16.2891 9.93872 16.5 9.67285 16.5H8.06152C7.79565 16.5 7.57812 16.2891 7.57812 16.0312V14.4688C7.57812 14.2109 7.79565 14 8.06152 14H9.67285ZM15.3125 19.4688C15.3125 19.2109 15.095 19 14.8291 19H13.2178C12.9519 19 12.7344 19.2109 12.7344 19.4688V21.0312C12.7344 21.2891 12.9519 21.5 13.2178 21.5H14.8291C15.095 21.5 15.3125 21.2891 15.3125 21.0312V19.4688ZM14.8291 14C15.095 14 15.3125 14.2109 15.3125 14.4688V16.0312C15.3125 16.2891 15.095 16.5 14.8291 16.5H13.2178C12.9519 16.5 12.7344 16.2891 12.7344 16.0312V14.4688C12.7344 14.2109 12.9519 14 13.2178 14H14.8291ZM20.4688 19.4688C20.4688 19.2109 20.2512 19 19.9854 19H18.374C18.1082 19 17.8906 19.2109 17.8906 19.4688V21.0312C17.8906 21.2891 18.1082 21.5 18.374 21.5H19.9854C20.2512 21.5 20.4688 21.2891 20.4688 21.0312V19.4688ZM19.9854 14C20.2512 14 20.4688 14.2109 20.4688 14.4688V16.0312C20.4688 16.2891 20.2512 16.5 19.9854 16.5H18.374C18.1082 16.5 17.8906 16.2891 17.8906 16.0312V14.4688C17.8906 14.2109 18.1082 14 18.374 14H19.9854Z"
                fill="#3884f7"
                // #3884f7
              />
            </svg>
          </span>
          <DateTimePicker
            sx={{
              width: "100%",
              border: "1px solid #D0D8E2",
              paddingLeft: "32px",
              borderRadius: "8px",
            }}
            slotProps={{
              textField: {
                className: "text-xs",
              },
            }}
            disablePast
            onChange={(val: any) => {
              if (val && Object.keys(val).includes("$d")) {
                setExpiryTime(Date.parse(val["$d"].toString()));
              }
            }}
          />
        </div>
        {/* </div> */}

        <div
          className="w-full border border-[#D0D8E2] mt-4 rounded-[8px]"
          style={{
            display: isAdvancedOpen ? "block" : "none",
          }}
        >
          <div className="border-b border-[#D0D8E2] flex justify-between items-center  pl-4 py-2">
            <div className="text-4">
              {messageStrings.ALLOW_VOTERS_TO_ADD_OPTIONS}
            </div>
            <div>
              <Switch
                value={voterAddOptions}
                onChange={(e) => {
                  setVoterAddOptions(e.target.checked);
                }}
              />
            </div>
          </div>
          <div className="border-b border-[#D0D8E2] flex justify-between items-center pl-4 py-2">
            <div className="text-4">{messageStrings.ANONYMOUS_POLL}</div>
            <div>
              <Switch
                value={anonymousPoll}
                onChange={(e) => {
                  setAnonymousPoll(e.target.checked);
                }}
              />
            </div>
          </div>

          <div className="border-b border-[#D0D8E2] flex justify-between items-center pl-4 py-2">
            <div className="text-4">
              {messageStrings.DONT_SHOW_LIVE_RESULTS}
            </div>
            <div>
              <Switch
                value={liveResults}
                onChange={(e) => {
                  setLiveResults(e.target.checked);
                }}
              />
            </div>
          </div>
          <div className="border-b border-[#D0D8E2] p-2 py-4">
            <div className="flex justify-between items-center">
              <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="user-can-vote-term">
                  {messageStrings.USERS_CAN_VOTE_FOR}
                </InputLabel>
                <Select
                  labelId="user-can-vote-term"
                  id="demo-simple-select-standard"
                  value={voteAllowerPerUserTerm}
                  onChange={(e) => {
                    setVoteAllowedPerUserTerm(e.target.value);
                  }}
                  label="Age"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={0}>Exactly</MenuItem>
                  <MenuItem value={1}>Atmost</MenuItem>
                  <MenuItem value={2}>Atleast</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="user-can-vote-term">Options</InputLabel>
                <Select
                  value={voteAllowedPerUser}
                  onChange={(e) => {
                    setVoteAllowedPerUser(e.target.value);
                  }}
                  label="Age"
                  defaultValue={1}
                >
                  {optionsArray?.map((_item: any, itemIndex: any) => {
                    return (
                      <MenuItem value={itemIndex + 1}>
                        {itemIndex + 1} Option
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
        <div
          className="flex justify-center cursor-pointer mt-2 text-xs font-normal text-[#ACB7C0]"
          onClick={() => {
            setIsAdvancedOpen(!isAdvancedOpen);
          }}
        >
          <span>ADVANCED</span>
          {isAdvancedOpen ? (
            <KeyboardArrowUpIcon
              sx={{
                fontSize: "20px",
                color: "#ACB7C0",
              }}
            />
          ) : (
            <KeyboardArrowDownIcon
              sx={{
                fontSize: "20px",
                color: "#ACB7C0",
              }}
            />
          )}
        </div>

        <div
          className={`flex justify-center items-center cursor-pointer mt-4 h-[54px] w-[54px] rounded-full mx-auto mb-4
          
          `}
          style={{
            backgroundColor:
              question?.trim().length !== 0 &&
              expiryTime?.length !== 0 &&
              Date.now() < expiryTime &&
              optionsArray.length !== 0 &&
              isOptionsOkay
                ? "#3884f7"
                : "#ACB7C0",
          }}
          onClick={() => {
            postPoll();
          }}
        >
          <img src={checkmark} alt="" />
        </div>
      </div>
    </LocalizationProvider>
  );
}

export default PollBody;
