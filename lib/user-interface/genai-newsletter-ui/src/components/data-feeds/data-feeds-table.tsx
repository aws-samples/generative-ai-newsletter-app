import { Button, ButtonDropdown, ButtonDropdownProps, Header, SpaceBetween, Table, TextFilter } from "@cloudscape-design/components";
import { useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "../../common/app-context";
import { DataFeedSubscription } from "../../API";
import { ApiClient } from "../../common/api";
import { DataFeedsTableColumnDefinition, DataFeedsTableColumnDisplay } from "../newsletters/definitions";
import { useNavigate } from "react-router-dom";


export default function DataFeedsTable() {
    const appContext = useContext(AppContext)
    const navigate = useNavigate()
    const [dataFeeds, setDataFeeds] = useState<DataFeedSubscription[]>([])
    const [selectedDataFeed, setSelectedDataFeed] = useState<DataFeedSubscription>()
    const [loadingDataFeeds, setLoadingDataFeeds] = useState<boolean>(true)

    const getDataFeeds = useCallback(
        async () => {
            if (!appContext) { return }
            const apiClient = new ApiClient(appContext)
            try {
                const result = await apiClient.dataFeeds.listDataFeeds()
                if (result.data !== undefined && result.errors === undefined) {
                    setDataFeeds(result.data.getDataFeedSubscriptions.subscriptions as DataFeedSubscription[])
                }
            } catch (e) {
                console.log(e)
            } finally {
                setLoadingDataFeeds(false)
            }
        }, [appContext]
    )

    const handleUpdateDropdownClick = (event: CustomEvent<ButtonDropdownProps.ItemClickDetails>) => {
        const { detail } = event
        switch (detail.id) {
            case 'edit':
                if (!selectedDataFeed) { return }
                navigate(`/feeds/${selectedDataFeed?.subscriptionId}/edit`)
                break
            default:
                break
        }
    }

    useEffect(() => {
        getDataFeeds()
        setLoadingDataFeeds(false)
    }, [getDataFeeds])

    return (
        <Table
            columnDefinitions={DataFeedsTableColumnDefinition}
            columnDisplay={DataFeedsTableColumnDisplay}
            items={dataFeeds}
            loading={loadingDataFeeds}
            selectionType="single"
            trackBy="subscriptionId"
            selectedItems={selectedDataFeed ? [selectedDataFeed] : []}
            onSelectionChange={({ detail }) => {
                setSelectedDataFeed(detail.selectedItems[0])
            }}
            filter={
                <TextFilter filteringPlaceholder="Search for Feeds [Not Yet Implemented]" filteringText="" />
            }
            header={<Header actions={
                <SpaceBetween size="s" direction="horizontal">
                    <Button variant="primary" onClick={() => { }} >Create New Data Feed</Button>
                    <ButtonDropdown items={[
                        { id: "edit", text: "Edit Data Feed" },
                    ]} onItemClick={handleUpdateDropdownClick}>Update Data Feed</ButtonDropdown>
                </SpaceBetween>
            } />


            }
        />


    )
}