import { FormField, Input, Select, SpaceBetween } from "@cloudscape-design/components";
import { NewsletterStyle } from "@shared/common/newsletter-style";
import { MuiColorInput } from 'mui-color-input'
import { useEffect, useState } from "react";

interface NewsletterDesignerFormProps {
    style: NewsletterStyle
    setStyle: (style: NewsletterStyle) => void;
}

export default function NewsletterDesignerForm(props: NewsletterDesignerFormProps) {
    const { style, setStyle } = props;
    const [bodyBackgroundColor, setBodyBackgroundColor] = useState(style.body.backgroundColor)
    const [bodyFontFamily, setBodyFontFamily] = useState(style.body.fontFamily)
    const [bodyTextColor, setBodyTextColor] = useState(style.body.color)
    const [contentBackgroundColor, setContentBackgroundColor] = useState(style.content.backgroundColor)
    const [contentFontSize, setContentFontSize] = useState(style.content.fontSize)
    useEffect(() => {
        setStyle(new NewsletterStyle({
            body: {
                backgroundColor: bodyBackgroundColor,
                fontFamily: bodyFontFamily,
                color: bodyTextColor
            },
            content: {
                backgroundColor: contentBackgroundColor,
                fontSize: contentFontSize
            }
        }))
    }, [bodyBackgroundColor, bodyFontFamily, bodyTextColor, contentBackgroundColor, contentFontSize, setStyle])
    return (
        <SpaceBetween direction="vertical" size="m">
            <FormField label="Primary Font" description="What is the primary font used. Must be a valid, standard font">
                <Input value={bodyFontFamily} onChange={({ detail }) => { setBodyFontFamily(detail.value) }} />
            </FormField>
            <FormField label="Email Body Background Color" description="The background color of the base email body">
                <MuiColorInput format="hex"  value={bodyBackgroundColor} onChange={(value) => { setBodyBackgroundColor(value) }} />
            </FormField>
            <FormField label="Email Body Text Color" description="The color of the text in the email">
                <MuiColorInput format="hex" value={bodyTextColor} onChange={(value) => { setBodyTextColor(value) }} />
            </FormField>
            <FormField label="Content Background Color" description="The background color of the content area">
                <MuiColorInput format="hex" value={contentBackgroundColor} onChange={(value) => { setContentBackgroundColor(value) }} />
            </FormField>
            <FormField label="Content Font Size" description="The font size of the content area">
                <Select selectedOption={{ label: contentFontSize, value: contentFontSize }} onChange={({ detail }) => { if (detail.selectedOption.value !== undefined) { setContentFontSize(detail.selectedOption.value) } }}
                    options={[
                        { label: '12px', value: '12px' },
                        { label: '13px', value: '13px' },
                        { label: '14px', value: '14px' },
                        { label: '15px', value: '15px' },
                        { label: '16px', value: '16px' },
                        { label: '17px', value: '17px' },
                        { label: '18px', value: '18px' },
                        { label: '19px', value: '19px' },
                        { label: '20px', value: '20px' },
                        { label: '21px', value: '21px' },
                        { label: '22px', value: '22px' },
                        { label: '23px', value: '23px' },
                        { label: '24px', value: '24px' }

                    ]} />
            </FormField>
        </SpaceBetween>
    )
}