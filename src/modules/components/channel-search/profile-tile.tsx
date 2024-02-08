import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { REGEX_USER_SPLITTING, REGEX_USER_TAGGING } from "../../../enums/regex";
import { useContext } from "react";
import parse from "html-react-parser";
import { GeneralContext } from "../../contexts/generalContext";
import { SEARCHED_CONVERSATION_ID } from "../../../enums/localStorageConstants";
import { linkConverter, tagExtracter } from "../../../sdkFunctions";
import { UserContext } from "../../contexts/userContext";

function renderAnswers(text: string) {
  const arr = [];
  const parts = text.split(REGEX_USER_SPLITTING);
  // console.log("the parts are");
  // console.log(parts);
  if (parts) {
    for (const matchResult of parts) {
      if (matchResult.match(REGEX_USER_TAGGING)) {
        const match: any = REGEX_USER_TAGGING.exec(matchResult);
        if (match !== null) {
          const { name, route } = match.groups;
          arr.push({
            key: name,
            route: route,
          });
        }
      } else {
        arr.push({
          key: matchResult,
          route: null,
        });
      }
    }
  }
}

const ProfileTile = ({ profile, setOpenSearch }: any) => {
  const generalContext = useContext(GeneralContext);
  function handleSearchNavigation() {
    generalContext.setShowLoadingBar(true);
    // console.log("the profile time id is ", profile.id);
    sessionStorage.setItem(SEARCHED_CONVERSATION_ID, profile?.id?.toString());
    setOpenSearch(false);
  }
  return (
    <div
      className="flex items-center my-4 p-2 mr-10  hover:bg-white cursor-pointer"
      onClick={handleSearchNavigation}
    >
      <ProfileImageView imgSource={profile.member?.image_url} />
      <ProfileData userName={profile.member?.name} answer={profile.answer} />
    </div>
  );
};

const ProfileImageView = ({ imgSource }: any) => {
  return (
    <div>
      <div className="rounded">
        {imgSource?.length !== 0 ? (
          <img
            src={imgSource}
            alt="profile data"
            className="rounded-full h-[48px] w-[48px]"
          />
        ) : (
          <AccountCircleIcon
            sx={{
              fontSize: "48px",
            }}
          />
        )}
      </div>
    </div>
  );
};

const ProfileData = ({ userName, answer }: any) => {
  const userContext = useContext(UserContext);
  return (
    <div className="grow pl-4">
      <div className="font-semibold">{userName}</div>
      <p className="text-ellipsis ">
        {parse(linkConverter(tagExtracter(answer, userContext)))}
      </p>
    </div>
  );
};

export default ProfileTile;
