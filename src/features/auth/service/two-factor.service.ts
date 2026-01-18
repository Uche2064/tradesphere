import { getApiUrl } from "@/lib/constants";
import { ApiRouteNames } from "@/lib/enums";
import axios from "axios";

export async function setup2FA(email: string) {
  return await axios.post(getApiUrl(ApiRouteNames.setup2FA), { email }).then((res) => {
    console.log(res);
    return res.data;
  });
}


export async function verify2FA(token: string) {
  return await axios.post(getApiUrl(ApiRouteNames.twoFactor), { token }).then((res) => {
    console.log(res);
    return res.data;
  });
}
