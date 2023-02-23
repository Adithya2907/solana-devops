export type UserState = {
    authenticated: boolean;
    authenticating: boolean;
    code: string | null;
    state: string | null;
    token: string | null;
};