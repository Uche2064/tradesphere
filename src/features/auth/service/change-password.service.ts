import { getApiUrl } from "@/lib/constants";
import { ApiRouteNames, RouteNames } from "@/lib/enums";
import axios from "axios";

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  return await axios.post(getApiUrl(ApiRouteNames.changePassword), {
    currentPassword,
    newPassword,
  }).then((res) => {
    return res.data;
  });
}
