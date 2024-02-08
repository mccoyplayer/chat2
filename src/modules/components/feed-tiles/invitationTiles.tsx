import { Box, IconButton, Typography } from "@mui/material";
import cancelIcon from "../../../assets/svg/cancel.svg";
import acceptIcon from "../../../assets/svg/accept.svg";
import { log } from "../../../sdkFunctions";

const GroupInviteTile = ({
  title,
  response,
  id,
  refreshHomeFeed,
  localRefreshInviteList,
}: any) => {
  async function rejectInvite() {
    try {
      await response(id, 2);
      localRefreshInviteList(id);
      refreshHomeFeed();
    } catch (error) {
      console.log(error);
    }
  }
  async function acceptInvite() {
    try {
      await response(id, 1);
      localRefreshInviteList(id);
      refreshHomeFeed();
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div
      key={id}
      className="bg-white flex justify-between py-2.5 px-5 border-t border-[#EEEEEE] cursor-pointer"
    >
      <Box>
        <Typography
          variant="body2"
          className="text-[#ADADAD] text-xs text-left font-normal"
        >
          You have been invited to
        </Typography>

        <Typography
          component="p"
          className="text-[#323232] text-base font-normal"
        >
          {title}

          <span className="bg-[#FFEFC6] rounded-[4px] px-[6px] py-[5px] text-[#F6BD2A] line-height-[12px] text-[10px] font-medium m-1">
            Private
          </span>
        </Typography>
      </Box>

      <Box>
        <IconButton
          disableRipple
          onClick={() => {
            rejectInvite();
          }}
          className="cursor-pointer"
        >
          <img src={cancelIcon} alt="cancel" />
        </IconButton>

        <IconButton
          disableRipple
          onClick={() => {
            acceptInvite();
          }}
          className="cursor-pointer"
        >
          <img src={acceptIcon} alt="accept" />
        </IconButton>
      </Box>
    </div>
    // </Link>
  );
};

export default GroupInviteTile;
