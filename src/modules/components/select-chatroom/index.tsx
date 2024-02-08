import { useContext, useEffect } from "react";
import { GeneralContext } from "../../contexts/generalContext";

const SelectChatroom: React.FC = () => {
  const gc = useContext(GeneralContext);
  useEffect(() => {
    gc.setShowLoadingBar(false);
  });
  return (
    <div className="h-full w-full flex flex-1 justify-center items-center z-[50]">
      <span className="text-base text">Select a chatroom to get started</span>
    </div>
  );
};
export default SelectChatroom;
