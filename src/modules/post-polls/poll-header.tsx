import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { messageStrings } from "../../enums/strings";
function PollHeader({ closeDialog }: any) {
  return (
    <div className="relative flex flex-col-reverse pt-5">
      <span
        className="absolute -right-8 top-0 cursor-pointer"
        onClick={closeDialog}
      >
        <CloseIcon />
      </span>
      <p className="text-black font-semibold">{messageStrings.NEW_POLL}</p>
    </div>
  );
}

export default PollHeader;
