import { useContext, } from "react";
import { signOut } from "@aws-amplify/auth";
import {
  ButtonDropdownProps,
  TopNavigation,
} from "@cloudscape-design/components";
import { UserContext } from "../common/user-context";
import { AppContext } from "../common/app-context";
export default function GlobalHeader() {
  const appContext = useContext(AppContext)
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
  const addedLinks = []
  if(appContext?.ui?.headerLinks){
    for(const link of appContext.ui.headerLinks){
      addedLinks.push({
        id:"added-link-" + link.title.replace(' ',''),
        text: link.title,
        href: link.url,
      })
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
                text: "Hi, " + userContext?.userGivenName ?? "Hi there!",
              },
              {
                id: "signout",
                text: "Sign Out",
              },
              ...addedLinks
            ], 
          }
        ]}

      />
    </div>
  )
}