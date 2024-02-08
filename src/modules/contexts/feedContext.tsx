/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable react/require-default-props */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Feeds from "../components/feedlist/Feed";
import routeVariable from "../../enums/routeVariables";
import { log } from "../../sdkFunctions";

type childrenType = {
  children?: any;
};

const FeedContextProvider: React.FC<childrenType> = () => {
  const [homeFeed, setHomeFeed] = useState<Array<any>>([]);
  const [allFeed, setAllFeed] = useState<Array<any>>([]);
  const [dmHomeFeed, setDmHomeFeed] = useState<Array<any>>([]);
  const [dmAllFeed, setDmAllFeed] = useState<Array<any>>([]);
  const [secretChatrooms, setSecretChatrooms] = useState<Array<any>>([]);
  const [modeCounter, setModeCounter] = useState(0);
  const params = useParams();
  const id: any = params[routeVariable.id];
  const mode: any = params[routeVariable.mode];
  const operation: any = params[routeVariable.operation];
  const setComponent = () => {
    switch (modeCounter) {
      case 1: {
        return <Feeds />;
      }
      default:
        return null;
    }
  };
  // useEffect(() => {
  //   log(`setting homefeed ${7}`);
  //   setHomeFeed([]);
  //   setAllFeed([]);
  //   setSecretChatrooms([]);
  //   setModeCounter(0);
  // }, [mode]);
  return (
    <FeedContext.Provider
      value={{
        homeFeed,
        allFeed,
        secretChatrooms,
        dmHomeFeed,
        dmAllFeed,
        setHomeFeed,
        setAllFeed,
        setSecretChatrooms,
        setDmHomeFeed,
        setDmAllFeed,
      }}
    >
      {/* {setComponent()} */}
      <Feeds />
    </FeedContext.Provider>
  );
};

type feedContext = {
  homeFeed: Array<any>;
  allFeed: Array<any>;
  secretChatrooms: Array<any>;
  dmHomeFeed: Array<any>;
  dmAllFeed: Array<any>;
  setHomeFeed: React.Dispatch<Array<any>> | null;
  setAllFeed: React.Dispatch<Array<any>> | null;
  setSecretChatrooms: React.Dispatch<Array<any>> | null;
  setDmHomeFeed: React.Dispatch<Array<any>> | null;
  setDmAllFeed: React.Dispatch<Array<any>> | null;
};

export const FeedContext = React.createContext<feedContext>({
  homeFeed: [],
  allFeed: [],
  secretChatrooms: [],
  dmHomeFeed: [],
  dmAllFeed: [],
  setHomeFeed: null,
  setAllFeed: null,
  setSecretChatrooms: null,
  setDmHomeFeed: null,
  setDmAllFeed: null,
});

export default FeedContextProvider;
