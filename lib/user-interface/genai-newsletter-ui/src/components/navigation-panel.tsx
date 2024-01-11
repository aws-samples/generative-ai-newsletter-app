import {
  SideNavigation,
  SideNavigationProps,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";
// import { AppContext } from "../common/app-context";
import { useNavigationPanelState } from "../common/hooks/use-navigation-panel-state";
import { useLocation, useNavigate } from "react-router-dom";
export default function NavigationPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeHref, setActiveHref] = useState<string>('')
  const [navigationPanelState, setNavigationPanelState] =
    useNavigationPanelState();
  const [items] = useState<SideNavigationProps.Item[]>(() => {
    return [
      {
        "type": "section",
        "text": "Newsletters",
        "items": [
          {
            "type": "link",
            "text": "Newsletters Dashboard",
            "href": "/newsletters"
          },
          {
            "type": "link",
            "text": "Create Newsletter",
            "href": "/newsletters/create"
          }
        ]
      }
    ]
  })

  const onChange = ({ detail }: { detail: SideNavigationProps.ChangeDetail; }) => {
    const sectionIndex = items.indexOf(detail.item);
    setNavigationPanelState({
      collapsedSections: {
        ...navigationPanelState.collapsedSections,
        [sectionIndex]: !detail.expanded,
      },
    });
  };

  const onFollow = (event: CustomEvent<SideNavigationProps.FollowDetail>) => {
    if (!event.detail.external && event.detail.type === 'link') {
      event.preventDefault()
      setActiveHref(event.detail.href)
      navigate(event.detail.href)
    }
  }

  useEffect(() => {
    const { pathname } = location
    setActiveHref(pathname)
  }, [location])

  return (
    <SideNavigation
      activeHref={activeHref}
      onFollow={onFollow}
      onChange={onChange}
      header={{ href: "/", text: "GenAI Newsletter Platform" }}
      items={items}
    />

  )
}