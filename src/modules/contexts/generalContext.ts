/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext } from "react";

export const GeneralContext = createContext<{
  showSnackBar: any;
  setSnackBarMessage: any;
  snackBarMessage: any;
  setShowSnackBar: any;
  showLoadingBar: any;
  setShowLoadingBar: any;
  currentChatroom: any;
  setCurrentChatroom: any;
  currentProfile: any;
  setCurrentProfile: any;
  chatroomUrl: any;
  setChatroomUrl: any;
}>({
  showSnackBar: false,
  setSnackBarMessage: () => {},
  snackBarMessage: "",
  setShowSnackBar: () => {},
  showLoadingBar: false,
  setShowLoadingBar: () => {},
  currentChatroom: {},
  setCurrentChatroom: () => {},
  currentProfile: {},
  setCurrentProfile: null,
  chatroomUrl: "",
  setChatroomUrl: null,
});
