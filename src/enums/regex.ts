export const REGEX_USER_TAGGING =
  /<<(?<name>[^<>|]+)\|route:\/\/(?<route>[^?]+(\?.+)?)>>/g;
export const REGEX_USER_SPLITTING = /(<<.+?\|route:\/\/\S+>>)/gu;
