import { FormField, Input, Select, SelectProps, SpaceBetween, Toggle } from "@cloudscape-design/components";
import { ArticleSummaryType } from "@shared/api/API";

interface NewsletterDetailsFormProps {
    title: string;
    setTitle: (title: string) => void;
    discoverable: boolean;
    setDiscoverable: (discoverable: boolean) => void;
    shared: boolean;
    setShared: (shared: boolean) => void;
    numberOfDaysToInclude: number;
    setNumberOfDaysToInclude: (numberOfDaysToInclude: number) => void;
    articleSummaryType: SelectProps.Option;
    setArticleSummaryType: (detail: SelectProps.Option) => void;
    titleError: string
    numberOfDaysToIncludeError: string
}

export default function NewsletterDetailsForm(props: NewsletterDetailsFormProps) {
    const { title, setTitle, discoverable, setDiscoverable, shared, setShared, numberOfDaysToInclude, setNumberOfDaysToInclude, articleSummaryType: contentSummaryConfiguration, setArticleSummaryType: setContentSummaryConfiguration, numberOfDaysToIncludeError, titleError } = props;
    return (<SpaceBetween size="l" direction="vertical">
        <FormField label="Newsletter Title" errorText={titleError}>
            <Input value={title}
                onChange={e => setTitle(e.detail.value)}
            />
        </FormField>
        <FormField label="Discoverable" description="Should the Newsletter appear in search results for other users?" >
            <Toggle checked={discoverable} onChange={e => setDiscoverable(e.detail.checked)}>Discoverable</Toggle>
        </FormField>
        <FormField label="Shared" description="Can users with the Newsletter URL access the Newsletter?" >
            <Toggle checked={shared} onChange={e => setShared(e.detail.checked)}>Shared</Toggle>
        </FormField>
        <FormField label="Number of days between Newsletter Publications" description="How many days between each newsletter publication sent?" errorText={numberOfDaysToIncludeError}>
            <Input value={numberOfDaysToInclude.toString()} onChange={e => setNumberOfDaysToInclude(parseInt(e.detail.value))} />
        </FormField>
        <FormField label="Content Summary Configuration" description="Do you want to use just a few keywords,
                         a single sentence summary or a multi-paragraph summary for each item included in the newsletter?">
            <Select selectedOption={contentSummaryConfiguration} onChange={({ detail }) => { setContentSummaryConfiguration(detail.selectedOption) }}
                options={[
                    {
                        label: 'Keywords',
                        value: ArticleSummaryType.KEYWORDS
                    },
                    {
                        label: 'Short Summary',
                        value: ArticleSummaryType.SHORT_SUMMARY
                    },
                    {
                        label: 'Long Summary',
                        value: ArticleSummaryType.LONG_SUMMARY
                    }
                ]} />
        </FormField>
    </SpaceBetween>)
}