import { Box } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  linkCss,
  linkTextCss,
  navIconCss,
} from "../../../styledAccessories/css";
import dm from "../../../assets/dm.svg";
import events from "../../../assets/events.svg";
import forum from "../../../assets/forum.svg";
import abm from "../../../assets/abm.svg";
import groups from "../../../assets/groups.svg";
import { RouteContext } from "../../contexts/routeContext";

import {
  addedByMePath,
  directMessagePath,
  eventsPath,
  forumPath,
  groupPath,
} from "../../../routes";
import { myClient } from "../../..";
import { log } from "../../../sdkFunctions";
import { UserContext } from "../../contexts/userContext";

const Sidenav = ({ setOpenMenu, openMenu }) => {
  const [showNav, setShowNav] = useState(false);
  const [showDmTab, setShowDMTab] = useState(false);
  const userContext = useContext(UserContext);
  useEffect(() => {
    if (userContext.currentUser?.id === undefined) {
      return;
    }
    myClient.checkDMTab().then((e) => { });
  });
  const navArray = [

    {
      title: "Groups",
      path: groupPath,
      Icon: groups,
    },

    {
      title: "Direct Messages",
      path: directMessagePath,
      Icon: dm,
    },

  ];
  const routeContext = useContext(RouteContext);

  function toggleNavigationBar() {
    routeContext.setIsNavigationBoxOpen(!routeContext.isNavigationBoxOpen);
  }

  return (
    <div
      className={`relative ${openMenu ? " z:max-sm:[143px] sm:max-md:w-[241px]" : ""
        }`}
    >

      {navArray.map((block, blockIndex) => (
        <NavBlock
          key={block.title + blockIndex}
          title={block.title}
          path={block.path}
          Icon={block.Icon}
        />
      ))}
    </div>
  );
};

const NavBlock = ({ title, Icon, path }) => {
  const useNavContext = useContext(RouteContext);
  function changeCurrentPath() {
    sessionStorage.setItem("routeContext", path);
    useNavContext.setCurrentRoute(path);
    // for responsiveness
    useNavContext.setIsNavigationBoxOpen(!useNavContext.isNavigationBoxOpen);
  }
  return (
    <Link to={path} style={{ ...linkCss }} onClick={changeCurrentPath}>
      <Box className="m-auto text-center p-3">
        <Box>
          <img
            src={Icon}
            style={{
              ...navIconCss,
              color:
                useNavContext.currentRoute === path ? "#FFFFFF" : "#3884F7",
              backgroundColor:
                useNavContext.currentRoute === path ? "#3884F7" : " #D7E6FD",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            alt="h"
          />
        </Box>
        <span
          style={{
            ...linkTextCss,
            fontWeight: useNavContext.currentRoute === path ? 400 : 300,
          }}
        >
          {title}
        </span>
      </Box>
    </Link>
  );
};

export default Sidenav;
