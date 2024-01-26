import { createContext } from "react";
import { UserData } from "./types";

export const userContextDefault: UserData = {
    userId: "",
    userGroups: [],
    setUserGroups: () => {},
    setUserId: () => {},
}

export const UserContext = createContext<UserData | null>(userContextDefault);
