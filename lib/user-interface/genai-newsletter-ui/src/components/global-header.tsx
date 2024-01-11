import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@aws-amplify/auth";
import {
  ButtonDropdownProps,
  TopNavigation,
} from "@cloudscape-design/components";
export default function GlobalHeader() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getCurrentUser()

      if (!result || Object.keys(result).length === 0) {
        signOut();
        return;
      }

      const userName = result?.userId
      setUserName(userName);
    })();
  }, []);

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
                id: "username",
                text: userName ?? "User Not Found",
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