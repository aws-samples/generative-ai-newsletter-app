import { Container, ContentLayout, SpaceBetween } from "@cloudscape-design/components";
import { useEffect } from "react";
import BaseAppLayout from "../components/base-app-layout";

export default function Welcome() {

    useEffect(() => {

    })
    return (
        <BaseAppLayout
        content={
        <ContentLayout>
            <Container>
                <SpaceBetween direction="vertical" size="m">
                    <h1>Welcome to the GenAI Newsletter Platform</h1>
                    <p>This platform is designed to automate ingestion of news articles subsribed from RSS/ATOM feeds, summarization and aggregation into a newsletter and programmatic distribution</p>
                </SpaceBetween>
            </Container>
        </ContentLayout>
        }
        />

    )
}