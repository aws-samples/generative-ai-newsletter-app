import { useContext, } from "react";
import { signOut } from "@aws-amplify/auth";
import {
  ButtonDropdownProps,
  TopNavigation,
} from "@cloudscape-design/components";
import { UserContext } from "../common/user-context";
export default function GlobalHeader() {
  const userContext = useContext(UserContext)

  const onUtilClick = ({
    detail,
  }: {
    detail: ButtonDropdownProps.ItemClickDetails;
  }) => {
    if (detail.id === "signout") {
      signOut();
    }
  }

  return (
    <div
      style={{ zIndex: 1002, top: 0, left: 0, right: 0, position: "fixed" }}
    >
      <TopNavigation
        identity={{
          href: "#",
        }}
        utilities={[
          {
            type: "menu-dropdown",
            iconName: "user-profile",
            onItemClick: onUtilClick,
            items: [
              {
                id: "name",
                text: userContext?.userGivenName ?? "User Not Found",
              },
              {
                id: "signout",
                text: "Sign Out",
              }
            ]
          }
        ]}
      />
    </div>
  )
}