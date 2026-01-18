
export enum ApiRouteNames  {
    login = "login",
    register = "register",
    resetPassword = "reset-password",
    forgotPassword = "forgot-password",
    verifyEmail = "verify-email",
    logout = "logout",
    changePassword = "change-password",
    admin = "admin",
    twoFactor = "two-factor",
    setup2FA = "setup-2fa",
    verify2FA = "verify-2fa",
    enable2FA = "enable-2fa",
    disable2FA = "disable-2fa",
}

export enum RouteNames {
    login = "login",
    register = "register",
    resetPassword = "reset-password",
    forgotPassword = "forgot-password",
    verifyEmail = "verify-email",
    logout = "logout",
    changePassword = "change-password",
    admin = "admin",
    twoFactor = "two-factor",
    verify2FA = "verify-2fa",
}

export enum TwoFactorType {
    SMS = "SMS",
    TOTP = "TOTP",
    EMAIL = "EMAIL",
}
