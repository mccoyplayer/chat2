/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";

export const UserContext = React.createContext<{
  currentUser: any;
  setCurrentUser: any;
  community: any;
  setCommunity: any;
}>({
  currentUser: null,
  setCurrentUser: () => {},
  community: {},
  setCommunity: () => {},
});
