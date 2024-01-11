import { useCallback, useContext, useEffect, useState } from "react";
import { Newsletter, Newsletters } from "../../API";
import { AppContext } from "../../common/app-context";
import { ApiClient } from "../../common/api";
import { Button, ButtonDropdown, ButtonDropdownProps, Header, SpaceBetween, Table, TextFilter } from "@cloudscape-design/components";
import { NewslettersTableColumnDefinition } from "./definitions";
import { useNavigate } from "react-router-dom";

export interface NewsFeedTableProps {

}

export default function NewslettersTable() {
    const appContext = useContext(AppContext)
    const navigate = useNavigate()
    const [newsFeeds, setNewsFeeds] = useState<Newsletters>({ newsletters: [], nextToken: null, __typename: "Newsletters" } as Newsletters)
    const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter>()
    const [loadingNewsletters, setLoadingNewsletters] = useState<boolean>(true)

    const getNewsletters = useCallback(
        async () => {
            if (!appContext) { return }
            const apiClient = new ApiClient(appContext)
            try {
                const result = await apiClient.newsletters.listNewsletters()
                if (result.data !== undefined && result.errors === undefined) {
                    setNewsFeeds(result.data.getNewsletters as Newsletters)
                }
            } catch (e) {
                console.error(e)

            }
            setLoadingNewsletters(false)
        }, [appContext, setNewsFeeds, setLoadingNewsletters]
    )

    const handleUpdateDropdownItemClick = (event: CustomEvent<ButtonDropdownProps.ItemClickDetails>) => {
        const { detail } = event
        switch (detail.id) {
            case 'edit':
                if (!selectedNewsletter) { return }
                navigate(`/newsletters/${selectedNewsletter?.newsletterId}/edit`)
                break
            default:
                break
        }
    }

    useEffect(() => {
        getNewsletters()
    }, [getNewsletters])

    return (<>
        <Table
            columnDefinitions={NewslettersTableColumnDefinition}
            items={newsFeeds?.newsletters}
            loadingText="Loading"
            loading={loadingNewsletters}
            variant="embedded"
            selectionType="single"
            filter={
                <TextFilter filteringPlaceholder="Search for Newsletters [Not Yet Implemented]" filteringText="" />
            }
            selectedItems={selectedNewsletter ? [selectedNewsletter] : []}
            onSelectionChange={({ detail }) => { setSelectedNewsletter(detail.selectedItems[0] as Newsletter) }}
            header={<Header actions={<SpaceBetween size="s" direction="horizontal">
                <Button variant="primary" onClick={() => { navigate('/newsletters/create') }} >Create New Newsletter</Button>
                <ButtonDropdown items={[
                    { text: "Edit Newsletter", id: "edit", }
                ]} onItemClick={handleUpdateDropdownItemClick}>
                    Update Newsletter
                </ButtonDropdown>
            </SpaceBetween>}>

            </Header>}
        />
    </>)
}