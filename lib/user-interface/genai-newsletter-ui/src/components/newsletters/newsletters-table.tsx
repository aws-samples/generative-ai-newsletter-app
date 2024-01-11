import { useCallback, useContext, useEffect, useState } from "react";
import { Newsletter, Newsletters } from "../../API";
import { AppContext } from "../../common/app-context";
import { ApiClient } from "../../common/api";
import { Button, ButtonDropdown, ButtonDropdownProps, Header, Link, SpaceBetween, Table, TextFilter } from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";
import useOnFollow from "../../common/hooks/use-on-follow";

export interface NewsFeedTableProps {

}

export default function NewslettersTable() {
    const appContext = useContext(AppContext)
    const navigate = useNavigate()
    const onFollow = useOnFollow()
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

    const newslettersTableColumnDefinitons = [
        {
            id: 'name',
            header: 'Newsletter Name',
            cell: (item: Newsletter) => (
                <Link
                    onFollow={onFollow}
                    href={`/newsletters/${item.newsletterId}`}>{item.title}</Link>
            ),
            isHeaderRow: true
        },
        {
            id: 'numberOfDays',
            header: 'Number of Days between Newsletters',
            cell: (item: Newsletter) => item.numberOfDaysToInclude,
            isHeaderRow: true
        },
        {
            id: 'discoverable',
            header: 'Discoverable',
            cell: (item: Newsletter) => item.discoverable !== undefined ? (item.discoverable ? "YES" : "NO") : "NO",
            isHeaderRow: true
        },
        {
            id: 'shared',
            header: 'Shared',
            cell: (item: Newsletter) => item.shared !== undefined ? (item.shared ? "YES" : "NO") : "NO",
            isHeaderRow: true
        },
        {
            id: 'Newsletter Created',
            header: 'Newsletter Created',
            cell: (item: Newsletter) => new Date(item.createdAt).toUTCString(),
        }
    ]

    useEffect(() => {
        getNewsletters()
    }, [getNewsletters])

    return (<>
        <Table
            columnDefinitions={newslettersTableColumnDefinitons}
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