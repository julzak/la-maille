import { cookies, headers } from "next/headers";
import {
  LANG_COOKIE,
  isValidLanguage,
  parseAcceptLanguage,
  type Language,
} from "./detect";

export function getServerLanguage(): Language {
  const stored = cookies().get(LANG_COOKIE)?.value;
  if (isValidLanguage(stored)) return stored;
  return parseAcceptLanguage(headers().get("accept-language"));
}
