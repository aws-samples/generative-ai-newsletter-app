import { AppLayout, AppLayoutProps } from "@cloudscape-design/components";
import NavigationPanel from "./navigation-panel";



export default function BaseAppLayout(props: AppLayoutProps) {

    return (
        <AppLayout
            toolsHide={true}
            navigationOpen={true}
            navigationHide={false}
            navigation={<NavigationPanel/>}
            {...props}
        />
    );
}
