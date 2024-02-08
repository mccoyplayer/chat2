import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { onValue, ref } from "firebase/database";
import { myClient } from "../..";
import routeVariable from "../../enums/routeVariables";
import { SEARCHED_CONVERSATION_ID } from "../../enums/localStorageConstants";

export function useFirebaseChatConversations(
  getChatroomConversations: any,
  setBufferMessage: any,
  setNewMessage: any,
) {
  const db = myClient.fbInstance();
  const params = useParams();
  const id: any = params[routeVariable.id];
  useEffect(() => {
    const query = ref(db, `collabcards`);
    return onValue(query, (snapshot: any) => {
      if (snapshot.exists()) {
        if (sessionStorage.getItem(SEARCHED_CONVERSATION_ID) !== null) {
          return;
        }
        getChatroomConversations(id, 100).then(() => {
          setBufferMessage(null);
          setTimeout(() => {
            setNewMessage();
          }, 500);
        });
      }
    });
  }, [id]);
}
