import { jsonReturnHandler, log } from ".";
import { myClient } from "..";

export async function initiateSDK(
  isGuest: boolean,
  userUniqueId: string,
  userName: string,
) {
  try {
    const initiateCall = await myClient.initiateUser({
      isGuest,
      userUniqueId,
      userName,
    });
    // log("initiate res ====>");
    // log(initiateCall);
    return jsonReturnHandler(initiateCall, null);
  } catch (error) {
    return jsonReturnHandler(null, error);
  }
}

export async function retrieveMemberStates(memberId: string) {
  try {
    const call = await myClient.getMemberState();
    return jsonReturnHandler(call, null);
  } catch (error) {
    return jsonReturnHandler(null, error);
  }
}
