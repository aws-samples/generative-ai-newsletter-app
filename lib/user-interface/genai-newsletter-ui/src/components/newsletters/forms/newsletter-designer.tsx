/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  ExpandableSection,
  FormField,
  Input,
  Select,
  SpaceBetween,
  Toggle
} from '@cloudscape-design/components'
import { NewsletterStyle } from '../../../../../../shared/common/newsletter-style'
import { MuiColorInput } from 'mui-color-input'
import { useEffect, useState } from 'react'

interface NewsletterDesignerFormProps {
  style: NewsletterStyle
  setStyle: (style: NewsletterStyle) => void
}

export default function NewsletterDesignerForm(
  props: NewsletterDesignerFormProps
) {
  const { style, setStyle } = props
  const defaultNewsletterStyle = new NewsletterStyle()
  const [bodyBackgroundColor, setBodyBackgroundColor] = useState(
    style.body?.backgroundColor ?? defaultNewsletterStyle.body.backgroundColor
  )
  const [bodyFontFamily, setBodyFontFamily] = useState(
    style.body?.fontFamily ?? defaultNewsletterStyle.body.fontFamily
  )
  const [bodyTextColor, setBodyTextColor] = useState(
    style.body?.color ?? defaultNewsletterStyle.body.backgroundColor
  )
  const [contentBackgroundColor, setContentBackgroundColor] = useState(
    style.content?.backgroundColor ??
      defaultNewsletterStyle.content.backgroundColor
  )
  const [contentFontSize, setContentFontSize] = useState(
    style.content?.fontSize ?? defaultNewsletterStyle.content.fontSize
  )
  const [introHeaderFontSize, setIntroHeaderFontSize] = useState(
    style.introHeader?.fontSize ?? defaultNewsletterStyle.introHeader.fontSize
  )
  const [introHeaderFontFamily, setIntroHeaderFontFamily] = useState(
    style.introHeader?.fontFamily ?? defaultNewsletterStyle.introBody.fontFamily
  )
  const [introHeaderTextColor, setIntroHeaderTextColor] = useState(
    style.introHeader?.color ?? defaultNewsletterStyle.introHeader.color
  )
  const [introHeaderFontWeight, setIntroHeaderFontWeight] = useState(
    style.introHeader?.fontWeight ?? defaultNewsletterStyle.introBody.fontSize
  )
  const [introHeaderAlign, setIntroHeaderAlign] = useState(
    style.introHeader?.align ?? defaultNewsletterStyle.introHeader.align
  )
  const [introBodyFontSize, setIntroBodyFontSize] = useState(
    style.introBody?.fontSize ?? defaultNewsletterStyle.introBody.fontSize
  )
  const [introBodyFontFamily, setIntroBodyFontFamily] = useState(
    style.introBody?.fontFamily ?? defaultNewsletterStyle.introBody.fontFamily
  )
  const [introBodyTextColor, setIntroBodyTextColor] = useState(
    style.introBody?.color ?? defaultNewsletterStyle.introBody.color
  )
  const [contentHeaderFontSize, setContentHeaderFontSize] = useState(
    style.contentHeader?.fontSize ??
      defaultNewsletterStyle.contentHeader.fontSize
  )
  const [contentHeaderFontFamily, setContentHeaderFontFamily] = useState(
    style.contentHeader?.fontFamily ??
      defaultNewsletterStyle.contentHeader.fontFamily
  )
  const [contentHeaderFontWeight, setContentHeaderFontWeight] = useState(
    style.contentHeader?.fontWeight ??
      defaultNewsletterStyle.contentHeader.fontWeight
  )
  const [contentHeaderAlign, setContentHeaderAlign] = useState(
    style.contentHeader?.align ?? defaultNewsletterStyle.contentHeader.align
  )
  const [contentBodyFontSize, setContentBodyFontSize] = useState(
    style.contentBody?.fontSize ?? defaultNewsletterStyle.contentBody.fontSize
  )
  const [contentBodyAlign, setContentBodyAlign] = useState(
    style.contentBody?.align ?? defaultNewsletterStyle.contentBody.align
  )
  const [contentBodyColor, setContentBodyColor] = useState(
    style.contentBody?.color ?? defaultNewsletterStyle.contentBody.color
  )
  const [contentBodyBackgroundColor, setContentBodyBackgroundColor] = useState(
    style.contentBody?.backgroundColor ??
      defaultNewsletterStyle.contentBody.backgroundColor
  )
  useEffect(() => {
    console.debug('setting style', {
      body: {
        backgroundColor: bodyBackgroundColor,
        fontFamily: bodyFontFamily,
        color: bodyTextColor
      },
      content: {
        backgroundColor: contentBackgroundColor,
        fontSize: contentFontSize
      },
      introHeader: {
        fontSize: introHeaderFontSize,
        fontFamily: introHeaderFontFamily,
        color: introHeaderTextColor,
        fontWeight: introHeaderFontWeight,
        align: introHeaderAlign
      },
      introBody: {
        fontSize: introBodyFontSize,
        fontFamily: introBodyFontFamily,
        color: introBodyTextColor
      },
      contentHeader: {
        fontSize: contentHeaderFontSize,
        fontFamily: contentHeaderFontFamily,
        fontWeight: contentHeaderFontWeight,
        align: contentHeaderAlign
      },
      contentBody: {
        fontSize: contentBodyFontSize,
        align: contentBodyAlign,
        color: contentBodyColor,
        backgroundColor: contentBodyBackgroundColor
      }
    })
    setStyle(
      new NewsletterStyle({
        body: {
          backgroundColor: bodyBackgroundColor,
          fontFamily: bodyFontFamily,
          color: bodyTextColor
        },
        content: {
          backgroundColor: contentBackgroundColor,
          fontSize: contentFontSize
        },
        introHeader: {
          fontSize: introHeaderFontSize,
          fontFamily: introHeaderFontFamily,
          color: introHeaderTextColor,
          fontWeight: introHeaderFontWeight,
          align: introHeaderAlign
        },
        introBody: {
          fontSize: introBodyFontSize,
          fontFamily: introBodyFontFamily,
          color: introBodyTextColor
        },
        contentHeader: {
          fontSize: contentHeaderFontSize,
          fontFamily: contentHeaderFontFamily,
          fontWeight: contentHeaderFontWeight,
          align: contentHeaderAlign
        },
        contentBody: {
          fontSize: contentBodyFontSize,
          align: contentBodyAlign,
          color: contentBodyColor,
          backgroundColor: contentBodyBackgroundColor
        }
      })
    )
  }, [
    bodyBackgroundColor,
    bodyFontFamily,
    bodyTextColor,
    contentBackgroundColor,
    contentBodyAlign,
    contentBodyBackgroundColor,
    contentBodyColor,
    contentBodyFontSize,
    contentFontSize,
    contentHeaderAlign,
    contentHeaderFontFamily,
    contentHeaderFontSize,
    contentHeaderFontWeight,
    introBodyFontFamily,
    introBodyFontSize,
    introBodyTextColor,
    introHeaderAlign,
    introHeaderFontFamily,
    introHeaderFontSize,
    introHeaderFontWeight,
    introHeaderTextColor,
    setStyle
  ])
  return (
    <SpaceBetween direction="vertical" size="m">
      <ExpandableSection
        defaultExpanded={true}
        headerText="Basic Style Changes"
        variant="stacked"
      >
        <SpaceBetween direction="vertical" size="m">
          <FormField
            label="Primary Font"
            description="What is the primary font used. Must be a valid, standard font"
          >
            <Input
              value={bodyFontFamily}
              onChange={({ detail }) => {
                setBodyFontFamily(detail.value)
              }}
            />
          </FormField>
          <FormField
            label="Email Body Background Color"
            description="The background color of the base email body"
          >
            <MuiColorInput
              format="hex"
              value={bodyBackgroundColor}
              onChange={(value) => {
                setBodyBackgroundColor(value)
              }}
            />
          </FormField>
          <FormField
            label="Email Body Text Color"
            description="The color of the text in the email"
          >
            <MuiColorInput
              format="hex"
              value={bodyTextColor}
              onChange={(value) => {
                setBodyTextColor(value)
              }}
            />
          </FormField>
          <FormField
            label="Content Background Color"
            description="The background color of the content area"
          >
            <MuiColorInput
              format="hex"
              value={contentBackgroundColor}
              onChange={(value) => {
                setContentBackgroundColor(value)
              }}
            />
          </FormField>
          <FormField
            label="Content Font Size"
            description="The font size of the content area"
          >
            <Select
              selectedOption={{
                label: contentFontSize,
                value: contentFontSize
              }}
              onChange={({ detail }) => {
                if (detail.selectedOption.value !== undefined) {
                  setContentFontSize(detail.selectedOption.value)
                }
              }}
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
              ]}
            />
          </FormField>
        </SpaceBetween>
      </ExpandableSection>
      <ExpandableSection headerText="Intro Section" variant="stacked">
        <SpaceBetween direction="vertical" size="m">
          <FormField label="Intro Header Font">
            <Input
              value={introHeaderFontFamily}
              onChange={({ detail }) => {
                setIntroHeaderFontFamily(detail.value)
              }}
            />
          </FormField>
          <FormField label="Intro Header Font Size">
            <Select
              selectedOption={{
                label: introHeaderFontSize,
                value: introHeaderFontSize
              }}
              onChange={({ detail }) => {
                if (detail.selectedOption.value !== undefined) {
                  setIntroHeaderFontSize(detail.selectedOption.value)
                }
              }}
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
                { label: '24px', value: '24px' },
                { label: '25px', value: '25px' },
                { label: '26px', value: '26px' },
                { label: '27px', value: '27px' },
                { label: '28px', value: '28px' },
                { label: '29px', value: '29px' },
                { label: '30px', value: '30px' }
              ]}
            />
          </FormField>
          <FormField label="Intro Header - Bold">
            <Toggle
              checked={introHeaderFontWeight === 'bold'}
              onChange={({ detail }) => {
                setIntroHeaderFontWeight(detail.checked ? 'bold' : 'normal')
              }}
            />
          </FormField>
          <FormField label="Intro Header Alignment">
            <Select
              selectedOption={{
                label: introHeaderAlign,
                value: introHeaderAlign
              }}
              onChange={({ detail }) => {
                setIntroHeaderAlign(detail.selectedOption.value ?? 'left')
              }}
              options={[
                { label: 'left', value: 'left' },
                { label: 'center', value: 'center' },
                { label: 'right', value: 'right' }
              ]}
            />
          </FormField>
          <FormField label="Intro Header Text Color">
            <MuiColorInput
              format="hex"
              value={introHeaderTextColor}
              onChange={(value) => {
                setIntroHeaderTextColor(value)
              }}
            />
          </FormField>
          <FormField label="Intro Body Font">
            <Input
              value={introBodyFontFamily}
              onChange={({ detail }) => {
                setIntroBodyFontFamily(detail.value)
              }}
            ></Input>
          </FormField>
          <FormField label="Intro Body Font Size">
            <Select
              onChange={({ detail }) => {
                setIntroBodyFontSize(detail.selectedOption.value ?? '20px')
              }}
              selectedOption={{
                label: introBodyFontSize,
                value: introBodyFontSize
              }}
              options={[
                { label: '12px', value: '12px' },
                { label: '13px', value: '13px' },
                { label: '14px', value: '14px' },
                { label: '15px', value: '15px' },
                { label: '16px', value: '16px' },
                { label: '17px', value: '17px' },
                { label: '18px', value: '18px' },
                { label: '19px', value: '19px' },
                { label: '20px', value: '20px' }
              ]}
            />
          </FormField>
          <FormField label="Intro Body Text Color">
            <MuiColorInput
              format="hex"
              value={introBodyTextColor ?? '#000'}
              onChange={(value) => {
                setIntroBodyTextColor(value)
              }}
            />
          </FormField>
        </SpaceBetween>
      </ExpandableSection>
      <ExpandableSection headerText="Main Content Styling" variant="stacked">
        <SpaceBetween direction="vertical" size="m">
          <FormField label="Content Header Font Size">
            <Select
              onChange={({ detail }) => {
                setContentHeaderFontSize(detail.selectedOption.value ?? '20px')
              }}
              selectedOption={{
                label: contentHeaderFontSize,
                value: contentHeaderFontSize
              }}
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
                { label: '24px', value: '24px' },
                { label: '25px', value: '25px' }
              ]}
            />
          </FormField>
          <FormField label="Content Header Alignment">
            <Select
              onChange={({ detail }) => {
                setContentHeaderAlign(detail.selectedOption.value ?? 'left')
              }}
              selectedOption={{
                label: contentHeaderAlign,
                value: contentHeaderAlign
              }}
              options={[
                { label: 'left', value: 'left' },
                { label: 'center', value: 'center' },
                { label: 'right', value: 'right' }
              ]}
            />
          </FormField>
          <FormField label="Content Header - Bold">
            <Toggle
              checked={contentHeaderFontWeight === 'bold'}
              onChange={({ detail }) => {
                setContentHeaderFontWeight(detail.checked ? 'bold' : 'normal')
              }}
            />
          </FormField>
          <FormField label="Content Header Font">
            <Input
              value={contentHeaderFontFamily}
              onChange={({ detail }) => {
                setContentHeaderFontFamily(detail.value)
              }}
            />
          </FormField>
          <FormField label="Content Body Font Size">
            <Select
              onChange={({ detail }) => {
                setContentBodyFontSize(detail.selectedOption.value ?? '20px')
              }}
              selectedOption={{
                label: contentBodyFontSize,
                value: contentBodyFontSize
              }}
              options={[
                { label: '12px', value: '12px' },
                { label: '13px', value: '13px' },
                { label: '14px', value: '14px' },
                { label: '15px', value: '15px' },
                { label: '16px', value: '16px' },
                { label: '17px', value: '17px' },
                { label: '18px', value: '18px' },
                { label: '19px', value: '19px' },
                { label: '20px', value: '20px' }
              ]}
            />
          </FormField>
          <FormField label="Content Body Alignment">
            <Select
              onChange={({ detail }) => {
                setContentBodyAlign(detail.selectedOption.value ?? 'left')
              }}
              selectedOption={{
                label: contentBodyAlign,
                value: contentBodyAlign
              }}
              options={[
                { label: 'left', value: 'left' },
                { label: 'center', value: 'center' },
                { label: 'right', value: 'right' }
              ]}
            />
          </FormField>
          <FormField label="Content Body Text Color">
            <MuiColorInput
              format="hex"
              value={contentBodyColor ?? '#000'}
              onChange={(value) => {
                setContentBodyColor(value)
              }}
            />
          </FormField>
          <FormField label="Content Body Background Color">
            <MuiColorInput
              format="hex"
              value={contentBodyBackgroundColor ?? '#fff'}
              onChange={(value) => {
                setContentBodyBackgroundColor(value)
              }}
            />
          </FormField>
        </SpaceBetween>
      </ExpandableSection>
    </SpaceBetween>
  )
}
