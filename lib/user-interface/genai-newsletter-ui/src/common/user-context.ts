import { createContext } from "react";
import { UserData } from "./types";

export const userContextDefault: UserData = {
    userId: "",
    userGroups: [],
    userFamilyName: "",
    userGivenName: "",
    setUserGroups: () => {},
    setUserId: () => {},
    setUserFamilyName: () => {},
    setUserGivenName: () => {},
}

export const UserContext = createContext<UserData | null>(userContextDefault);
