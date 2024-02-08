import { myClient } from "../../..";
import {
  getThumbnailOfVideo,
  mergeInputFiles,
  sendDmRequest,
} from "../../../sdkFunctions";
import { InputFieldContextType } from "../../contexts/inputFieldContext";
import { chatroomContextType } from "../../contexts/chatroomContext";
import {
  LAST_CONVERSATION_ID_BACKWARD,
  LAST_CONVERSATION_ID_FORWARD,
} from "../../../enums/localStorageConstants";

type ConversationCreateData = {
  chatroom_id: any;
  created_at: any;
  has_files: boolean;
  text: any;
  attachment_count?: any;
  replied_conversation_id?: string | number;
};

type UploadConfigType = {
  conversation_id: number;
  files_count: number;
  index: number | string;
  meta?: any;
  name: string;
  thumbnail_url?: string;
  type: string;
  url: string;
};
function base64ToBlob(base64String: string, contentType: string = ""): Blob {
  const byteCharacters = Buffer.from(base64String, "base64").toString("binary");
  console.log(byteCharacters);
  const byteArray = new Uint8Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }

  return new Blob([byteArray], { type: contentType });
}
const sendMessage = async (
  chat_request_state: any,
  state: any,
  chatroomContext: chatroomContextType,
  chatroom_id: number,
  inputFieldContext: InputFieldContextType,
  setBufferMessage: any,
  setEnableInputBox: any,
  mode: any
) => {
  try {
    if (chat_request_state === null && mode === "direct-messages") {
      await sendDmRequest(chatroom_id, inputFieldContext.messageText, state);
      document.dispatchEvent(
        new CustomEvent("joinEvent", { detail: chatroom_id })
      );
      if (state === 1) {
        document.dispatchEvent(new CustomEvent("addedByStateOne"));
        inputFieldContext.setMessageText("");
      }
      return;
    }
    setEnableInputBox(true);
    sessionStorage.removeItem(LAST_CONVERSATION_ID_FORWARD);
    sessionStorage.removeItem(LAST_CONVERSATION_ID_BACKWARD);
    const {
      conversationList,
      setConversationList,
      selectedConversation,
      setSelectedConversation,
      isSelectedConversation,
      setIsSelectedConversation,
    } = chatroomContext;
    const {
      messageText,
      setMessageText,
      audioAttachments,
      setAudioAttachments,
      mediaAttachments,
      setMediaAttachments,
      documentAttachments,
      setDocumentAttachments,
      giphyUrl,
      setGiphyUrl,
    } = inputFieldContext;
    const message = messageText;
    const mediaContext = {
      mediaAttachments: [...mediaAttachments],
      audioAttachments: [...audioAttachments],
      documentAttachments: [...documentAttachments],
    };
    const filesArray = mergeInputFiles(mediaContext);

    setMessageText("");
    setAudioAttachments([]);
    setMediaAttachments([]);
    setDocumentAttachments([]);

    if (
      messageText.trim() === "" &&
      filesArray.length === 0 &&
      giphyUrl?.images?.fixed_height?.url === undefined
    ) {
      return;
    }
    const config: any = {
      text: message,
      createdAt: Date.now(),
      chatroomId: parseInt(chatroom_id.toString()),
      hasFiles: false,
    };
    if (filesArray.length) {
      config.hasFiles = true;
      config.attachmentCount = filesArray.length;
    }
    if (giphyUrl) {
      config.hasFiles = true;
      config.attachmentCount = 1;
    }
    if (isSelectedConversation) {
      config.repliedConversationId = selectedConversation?.id;
      setSelectedConversation({});
      setIsSelectedConversation(false);
    }

    const createConversationCall = await myClient.postConversation(config);

    document.dispatchEvent(
      new CustomEvent("sentMessage", { detail: chatroom_id })
    );
    // log(createConversationCall);
    localHandleConversation(
      createConversationCall?.data?.conversation,
      filesArray,
      setBufferMessage
    );
    // render local changes here

    // above this point

    if (filesArray.length) {
      let index = 0;
      for (const newFile of filesArray) {
        const uploadConfig = {
          messageId: parseInt(createConversationCall.id, 10),
          chatroomId: chatroom_id,
          file: newFile,
        };
        let fileType = "";
        if (filesArray[0].type.split("/")[1] === "pdf") {
          fileType = "pdf";
        } else if (filesArray[0].type.split("/")[0] === "audio") {
          fileType = "audio";
        } else if (filesArray[0].type.split("/")[0] === "video") {
          fileType = "video";
        } else {
          fileType = "image";
        }

        let thumbnail_url = "";
        // log(newFile);
        if (fileType === "video") {
          const video = document.createElement("video");
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const localIndex = index;
          // Load the video
          const url = URL.createObjectURL(newFile);
          video.src = url;
          let blobEl = null;
          video.addEventListener("loadedmetadata", async () => {
            // Set canvas dimensions to match video dimensions
            console.log(video.videoHeight + " " + video.videoWidth);
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            video.currentTime = 1;
            video.addEventListener("seeked", async () => {
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

              // Convert canvas content to blob
              canvas.toBlob(
                (blob) => {
                  blobEl = blob;
                  const thumbnailConfig = {
                    messageId: parseInt(createConversationCall?.data?.id, 10),
                    chatroomId: chatroom_id,
                    file: new File(
                      [blobEl!],
                      createConversationCall?.data?.id
                        .toString()
                        .concat("thumbnail.jpeg")
                    ),
                  };
                  console.log(thumbnailConfig);
                  const responseUpload = myClient
                    .uploadMedia(thumbnailConfig)
                    .then((thumbnailResponse: any) => {
                      console.log(thumbnailResponse);
                      myClient
                        .uploadMedia(uploadConfig)
                        .then((fileResponse: any) => {
                          const onUploadConfig: {
                            conversationId: number;
                            filesCount: number;
                            index: number;
                            meta: { size: number };
                            name: string;
                            type: string;
                            url: string;
                            thumbnailUrl: undefined | string;
                          } = {
                            conversationId: parseInt(
                              createConversationCall?.data?.id,
                              10
                            ),
                            filesCount: 1,
                            index: localIndex,
                            meta: { size: newFile.size },
                            name: newFile.name,
                            type: fileType,
                            url: fileResponse.Location,
                            thumbnailUrl: thumbnailResponse.Location,
                          };

                          console.log(onUploadConfig);
                          myClient.putMultimedia(onUploadConfig);
                        });
                    });
                },
                "image/jpeg",
                0.8
              );
            });
          });

          video.load();
        } else {
          await myClient.uploadMedia(uploadConfig).then((fileResponse: any) => {
            const onUploadConfig: {
              conversationId: number;
              filesCount: number;
              index: number;
              meta: { size: number };
              name: string;
              type: string;
              url: string;
              thumbnail_url: null | string;
            } = {
              conversationId: parseInt(createConversationCall?.data?.id, 10),
              filesCount: 1,
              index,
              meta: { size: newFile.size },
              name: newFile.name,
              type: fileType,
              url: fileResponse.Location,
              thumbnail_url: null,
            };
            if (fileType === "video") {
              onUploadConfig.thumbnail_url = thumbnail_url;
            }
            myClient.putMultimedia(onUploadConfig);
          });
        }
        index++;
      }
    }

    if (giphyUrl) {
      const onUploadConfig = {
        conversationId: parseInt(createConversationCall?.data?.id, 10),
        filesCount: 1,
        index: 0,
        meta: {
          size: parseInt(giphyUrl?.images?.fixed_height?.size?.toString()),
        },
        name: giphyUrl?.title,
        type: giphyUrl?.type,
        url: giphyUrl?.images?.fixed_height?.url,
        thumbnailUrl: giphyUrl?.images["480w_still"]?.url,
      };
      myClient.putMultimedia(onUploadConfig);
    }
    inputFieldContext.setGiphyUrl(null);
  } catch (error) {
    // log(error);
  }
};

export { sendMessage };

async function localHandleConversation(
  conversation: any,
  media: any,
  setBufferMessage: any
) {
  // // log(media);
  let count = 1;
  if (conversation?.has_files) {
    for (const file of media) {
      const attachmentTemplate = {
        url: URL.createObjectURL(file),
        index: count++,
        type: file.type.split("/")[0],
        name: file.name,
        meta: { size: file.size },
      };
      conversation?.attachments?.push(attachmentTemplate);
    }
  }
  setBufferMessage(conversation);
}
