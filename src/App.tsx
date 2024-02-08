import { useEffect, useState } from "react";
import "./App.css";
import RouteProvider from "./modules/components/routes";
import { UserContext } from "./modules/contexts/userContext";
import { log } from "./sdkFunctions";
import { initiateSDK, retrieveMemberStates } from "./sdkFunctions/clientSetup";

function App() {
  const [currentUser, setCurrentUser] = useState<any>({});
  const [community, setCommunity] = useState();

  useEffect(() => {
    const initiateClient = async () => {
      try {
        const queryParams = new URL(window.location.href).searchParams;
        const call: any = await initiateSDK(
          false,
          queryParams.get("uuid") ||
            window.sessionStorage.getItem("uuid") ||
            "",
          ""
        );
        setCommunity(call?.data?.community);
        setCurrentUser(call?.data?.user);
        sessionStorage.setItem("communityId", call?.data?.community?.id);
        sessionStorage.setItem("uuid", call?.data?.user?.uuid?.toString());
      } catch (error) {
        log(error);
      }
    };
    initiateClient();
  }, []);
  useEffect(() => {
    async function settingMemberState() {
      try {
        if (
          currentUser?.id === undefined ||
          currentUser.memberRights !== undefined
        ) {
          return null;
        }
        if (currentUser?.memberState !== undefined) {
          return null;
        }
        const res: any = await retrieveMemberStates(currentUser.id);

        const newUserObject = { ...currentUser };

        newUserObject.memberState = res?.data?.member?.state;
        newUserObject.memberRights = res?.data?.member_rights;

        setCurrentUser(newUserObject);
      } catch (error) {
        log(error);
      }
    }
    settingMemberState();
  }, [currentUser]);

  if (currentUser?.id === null || currentUser?.id === undefined) {
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        community,
        setCommunity,
      }}
    >
      <RouteProvider />
    </UserContext.Provider>
  );
}

export default App;
