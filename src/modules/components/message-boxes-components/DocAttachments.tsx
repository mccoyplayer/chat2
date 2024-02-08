import React from "react";
import "./imageAndMedia.css";
import pdfIcon from "../../../assets/svg/pdf-document.svg";
type DocAttachmentsProps = {
  files: unknown[] | any;
};

const DocAttachments: React.FC<DocAttachmentsProps> = ({ files }) => {
  if (!files || files.length === 0) {
    return null;
  }
  return (
    <div className="flex max-w-[242px] justify-between flex-wrap">
      {files.map((file: any, index: number) => {
        return (
          <a
            href={file?.url?.toString() || ""}
            target="_blank"
            rel="noreferrer"
            className="mb-2  w-[115px]  h-[115px] flex  justify-center bg-[#f9f9f9] rounded-[12px]
            items-center"
            key={index.toString().concat(file?.url)}
          >
            <img src={pdfIcon} alt="pdf" className="w-[24px]" />

            <br />
          </a>
        );
      })}
    </div>
  );
};

export default DocAttachments;
{
  /* {files?.length === 1 ? (
        <a
          href={files[0]?.url?.toString() || ""}
          target="_blank"
          rel="noreferrer"
          className="mb-2 w-[200px] flex"
          key={files[0]?.url}
        >
          <img src={pdfIcon} alt="pdf" className="w-[24px]" />
          <span className="text-[#323232] text-[14px] ml-2 mt-1">
            {files[0].name}
          </span>
          <br />
        </a>
      ) : (
        <div className="multipleImagesContainer">
          <div className="primaryImage imgBubble">
            {files[0].type === "pdf" ? (
              <a
                href={files[0]?.url?.toString() || ""}
                target="_blank"
                rel="noreferrer"
                className="block h-full flex justify-center items-center bg-[#f9f9f9] rounded-[12px]"
                key={files[0]?.url}
              >
                <img
                  src={pdfIcon}
                  alt="pdf"
                  className="max-w-full max-h-full block h-auto text-[24px] w-[1.5em]"
                />

                <br />
              </a>
            ) : (
              <video
                className="max-w-full max-h-full block h-auto w-auto"
                key={files[0]?.url}
              >
                <source src={files[0]?.url} type="video/mp4" />
                <source src={files[0]?.url} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div className="secondaryImage imgBubble">
            <p className="foregroundCover">+{(files.length - 1).toString()}</p>
            {files[1].type === "pdf" ? (
              <a
                href={files[0]?.url?.toString() || ""}
                target="_blank"
                rel="noreferrer"
                className="block h-full flex justify-center items-center bg-[#f9f9f9]"
                key={files[0]?.url}
              >
                <img
                  src={pdfIcon}
                  alt="pdf"
                  className="max-w-full max-h-full block h-auto text-[24px] w-[1.5em]"
                />

                <br />
              </a>
            ) : (
              <video
                className="max-w-full max-h-full block h-auto w-auto"
                key={files[1]?.url}
              >
                <source src={files[1]?.url} type="video/mp4" />
                <source src={files[1]?.url} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )} */
}
