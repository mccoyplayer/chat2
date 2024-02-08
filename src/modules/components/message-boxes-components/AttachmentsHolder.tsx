/* eslint-disable react/jsx-no-useless-fragment */
import ImageAndMedia from "./ImageAndMedia";
import { attType } from "./MessageBox";
import pdfIcon from "../../../assets/svg/pdf-document.svg";
import DocAttachments from "./DocAttachments";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "./audionote.css";

type AttachmentHolderType = {
  attachmentsObject: attType;
  setMediaDisplayModel: any;
  setMediaData: any;
};

const AttachmentsHolder = ({
  attachmentsObject,
  setMediaDisplayModel,
  setMediaData,
}: AttachmentHolderType) => (
  <>
    {attachmentsObject.mediaAttachments?.length > 0 ? (
      <div>
        <ImageAndMedia
          mediaArray={attachmentsObject.mediaAttachments}
          setMediaDisplayModel={setMediaDisplayModel}
          setMediaData={setMediaData}
        />
      </div>
    ) : null}
    {attachmentsObject.audioAttachments?.length > 0 ? (
      <>
        {attachmentsObject.audioAttachments.map((item: any) => (
          <audio
            controls
            src={item.url}
            className="my-2 w-[230]"
            key={item.url}
          >
            {" "}
            <a href={item.url}>Download audio</a>
          </audio>
        ))}
      </>
    ) : null}
    {/* {attachmentsObject.docAttachments?.length > 0 ? (
      <>
        {attachmentsObject.docAttachments?.map((item: any) => (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="mb-2 w-[200px] flex"
            key={item.url}
          >
            <img src={pdfIcon} alt="pdf" className="w-[24px]" />
            <span className="text-[#323232] text-[14px] ml-2 mt-1">
              {item.name}
            </span>
            <br />
          </a>
        ))}
      </>
    ) : null} */}
    <DocAttachments files={attachmentsObject?.docAttachments} />

    {attachmentsObject.voiceNote ? (
      <VoiceNote attachmentsObject={attachmentsObject.voiceNote} />
    ) : null}
  </>
);

const VoiceNote = ({ attachmentsObject }: any) => {
  const audio = useMemo(() => {
    const audioElement = new Audio(attachmentsObject.url);
    audioElement.addEventListener("ended", function () {
      setPlayState(false);
    });
    // audioElement.addEventListener("timeupdate", timeUpdate);
    return audioElement;
  }, [attachmentsObject]);
  function timeUpdate() {
    rangeRef.current!.value = timeToPercent(audio.currentTime).toString();
    axisRef.current!.style.width = `calc(${timeToPercent(audio.currentTime)
      .toString()
      .concat("%")})`;
  }
  const [playState, setPlayState] = useState<boolean>(false);

  const timeToPercent = (val: number) => {
    return (val / audio.duration) * 100;
  };
  const rangeRef = useRef<HTMLInputElement | null>(null);
  const axisRef = useRef<HTMLDivElement | null>(null);
  function debounce(callBack: (value: string) => void) {
    let timer: null | NodeJS.Timeout = null;
    return (argument: string) => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        callBack(argument);
      }, 100);
    };
  }
  const debouncedCaller = useMemo(() => {
    return debounce((time: string) => {
      audio.currentTime = parseInt(time);
      // audio.play();
    });
  }, []);
  useEffect(() => {
    if (playState) {
      audio.addEventListener("timeupdate", timeUpdate);
      audio?.play();
    } else {
      audio?.pause();
      audio.removeEventListener("timeupdate", timeUpdate);
    }
  }, [playState]);
  return (
    <div
      style={
        {
          // display: "flex",
          // alignItems: "center",
        }
      }
    >
      <AudioPlayer
        src={attachmentsObject.url}
        volume={0.5}
        // Try other props!
        customControlsSection={[RHAP_UI.MAIN_CONTROLS]}
        layout={"horizontal-reverse"}
        showJumpControls={false}
        customProgressBarSection={[RHAP_UI.PROGRESS_BAR]}
        showDownloadProgress={false}
        customIcons={{
          play: (
            // <span
            //   style={{
            //     width: "2.625rem",
            //     height: "2.625rem",
            //     background: "#ff9500",
            //     display: "inline-flex",
            //     borderRadius: "50%",
            //   }}
            // >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              style={{
                marginLeft: "4px",
              }}
            >
              <path
                d="M0.75 0.8125V19.1875L15.1875 10L0.75 0.8125Z"
                fill="white"
              />
            </svg>
            // </span>
          ),
          pause: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="15"
              viewBox="0 0 12 15"
              fill="none"
            >
              <path
                d="M1.38197 14.7168H3.4474C4.28236 14.7168 4.71302 14.2861 4.71302 13.4512V1.35742C4.71302 0.504883 4.28236 0.100586 3.4474 0.0917969H1.38197C0.547007 0.0917969 0.116343 0.522461 0.116343 1.35742V13.4512C0.107554 14.2861 0.538218 14.7168 1.38197 14.7168ZM8.06166 14.7168H10.1183C10.9533 14.7168 11.3839 14.2861 11.3839 13.4512V1.35742C11.3839 0.504883 10.9533 0.0917969 10.1183 0.0917969H8.06166C7.21791 0.0917969 6.79603 0.522461 6.79603 1.35742V13.4512C6.79603 14.2861 7.21791 14.7168 8.06166 14.7168Z"
                fill="white"
              />
            </svg>
          ),
        }}
      />
    </div>
  );
};

export default AttachmentsHolder;
