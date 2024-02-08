import { log } from ".";
import { myClient } from "..";

async function searchConversationsInsideChatroom(
  chatroomId: string,
  search: string,
  followStatus: boolean,
  page?: number,
  pageSize?: number,
) {
  try {
    const searchCall = await myClient.searchConversation({
      chatroomId,
      search,
      followStatus,
      page,
      pageSize,
    });
    return searchCall;
  } catch (error) {
    log("error in function searchConversationInsideChatroom");
    return error;
  }
}

export default searchConversationsInsideChatroom;
