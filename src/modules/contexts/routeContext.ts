/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext } from "react";

export const RouteContext = createContext<{
  currentRoute: any;
  setCurrentRoute: any;
  isNavigationBoxOpen: any;
  setIsNavigationBoxOpen: any;
}>({
  currentRoute: "",
  setCurrentRoute: () => {},
  isNavigationBoxOpen: Boolean,
  setIsNavigationBoxOpen: () => {},
});
