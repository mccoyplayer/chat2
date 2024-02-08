import { PropsWithChildren, memo } from "react";
import "./imageAndMedia.css";
type ImageAndMediaType = {
  mediaArray: any;
  setMediaDisplayModel: any;
  setMediaData: any;
};
const ImageAndMedia: React.FC<ImageAndMediaType> = ({
  mediaArray,
  setMediaDisplayModel,
  setMediaData,
}) => (
  <div className="flex w-full">
    {mediaArray?.length === 1 ? (
      <div
        className="w-full"
        onClick={() => {
          if (mediaArray[0].type !== "gif") {
            setMediaData({ mediaObj: mediaArray, type: "image" });
            setMediaDisplayModel(true);
          }
        }}
      >
        {mediaArray[0].type === "image" || mediaArray[0].type === "gif" ? (
          <img
            src={mediaArray[0].url!}
            className="max-w-full max-h-full block h-auto w-auto"
          />
        ) : (
          <video
            controls
            preload="none"
            className="max-w-full max-h-full block h-auto w-auto"
            key={mediaArray[0]?.url}
            poster={mediaArray[0]?.thumbnail_url}
          >
            <source src={mediaArray[0]?.url} type="video/mp4" />
            <source src={mediaArray[0]?.url} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    ) : (
      <>
        <div
          // className="max-w-[50%] h-full grow"
          // className=""
          className="w-[278px] h-full grow"
          onClick={() => {
            setMediaData({ mediaObj: mediaArray, type: "image" });
            setMediaDisplayModel(true);
          }}
        >
          <div className="multipleImagesContainer">
            <div className="primaryImage imgBubble">
              {mediaArray[0].type === "image" ? (
                <img
                  src={mediaArray[0].url!}
                  alt=""
                  className="max-w-full max-h-full block h-auto w-auto"
                />
              ) : (
                <video
                  // controls={false}
                  poster={mediaArray[0]?.thumbnail_url}
                  className="max-w-full max-h-full block h-auto w-auto"
                  key={mediaArray[0]?.url}
                  //   onClick={}
                >
                  <source src={mediaArray[0]?.url} type="video/mp4" />
                  <source src={mediaArray[0]?.url} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            <div className="secondaryImage imgBubble">
              <p className="foregroundCover">
                +{(mediaArray.length - 1).toString()}
              </p>
              {mediaArray[1].type === "image" ? (
                <img
                  src={mediaArray[1].url!}
                  alt=""
                  className="max-w-full max-h-full block h-auto w-auto"
                />
              ) : (
                <video
                  className="max-w-full max-h-full block h-auto w-auto"
                  key={mediaArray[1]?.url}
                  poster={mediaArray[1]?.thumbnail_url}
                  //   onClick={}
                >
                  <source src={mediaArray[1]?.url} type="video/mp4" />
                  <source src={mediaArray[1]?.url} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
        {/* <div
          className="max-w-[50%] grow flex justify-center items-center bg-slate-400"
          style={{ opacity: "50%" }}
        >
          <span className="text-xl text-black  text-center">
            + {(mediaArray.length - 1).toString()}
          </span>
        </div> */}
      </>
    )}
  </div>
);

export default memo(ImageAndMedia);
