import { ApiRouteNames, RouteNames } from "./enums";


export function getApiUrl(routeName: ApiRouteNames): string {
    switch (routeName) {
        case "login":
            return "/api/auth/login";
            break;
        case "register":
            return "/api/auth/register";
            break;
        case "reset-password":
            return "/api/auth/reset-password";
            break;
        case "forgot-password":
            return "/api/auth/forgot-password";
            break;
        case "verify-email":
            return "/api/auth/verify-email";
            break;
        case "logout":
            return "/api/auth/logout";  
            break;
        case "change-password":
            return "/api/auth/change-password";
            break;
        case "setup-2fa":
            return "/api/auth/2fa/setup";
            break;
        case "verify-2fa":
            return "/api/auth/verify-2fa";
            break;
        case "enable-2fa":
            return "/api/auth/2fa/enable";
            break;
        case "disable-2fa":
            return "/api/auth/2fa/disable";
            break;
        default:
            return "/api/auth/login";
            break;
    }
}

export function getAppRouteName(routeName: RouteNames): string {
    switch (routeName) {
        case "login":
            return "/auth/login";
            break;
        case "register":
            return "/auth/register";
            break;
        case "reset-password":
            return "/auth/reset-password";
            break;
        case "forgot-password":
            return "/auth/forgot-password";
            break;
        case "verify-email":
            return "/auth/verify-email";
            break;
        case "logout":
            return "/auth/logout";  
            break;
        case "change-password":
            return "/auth/change-password";
            break;
        case "two-factor":
            return "/auth/two-factor";
            break;
        case "verify-2fa":
            return "/auth/verify-2fa";
            break;
        default:
            return "/auth/login";
            break;
    }
}   
