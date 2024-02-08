import React from "react";
import PollHeader from "./poll-header";
import PollBody from "./poll-body";
import "./index.css";
function Poll({ closeDialog }: any) {
  return (
    <div className="w-[424px] min-h-[614px] max-h-[700px] relative py-5 px-12 bg-white opacity-100">
      <PollHeader closeDialog={closeDialog} />
      <PollBody closeDialog={closeDialog} />
    </div>
  );
}

export default Poll;
