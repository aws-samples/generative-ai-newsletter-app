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
                    <h3>A solution designed to intake data, summarize & tune information, and generate high quality newsletters</h3>
                </SpaceBetween>
            </Container>
        </ContentLayout>
        }
        />

    )
}