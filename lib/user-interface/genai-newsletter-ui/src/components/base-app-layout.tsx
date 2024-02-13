import { AppLayout, AppLayoutProps } from '@cloudscape-design/components'
import NavigationPanel from './navigation-panel'
import { useNavigationPanelState } from '../common/hooks/use-navigation-panel-state'

export default function BaseAppLayout(props: AppLayoutProps) {
  const [navigationPanelState, setNavigationPanelState] =
    useNavigationPanelState()
  return (
    <AppLayout
      toolsHide={true}
      navigationOpen={!navigationPanelState.collapsed}
      navigation={<NavigationPanel />}
      onNavigationChange={({ detail }) =>
        setNavigationPanelState({ collapsed: !detail.open })
      }
      {...props}
    />
  )
}
