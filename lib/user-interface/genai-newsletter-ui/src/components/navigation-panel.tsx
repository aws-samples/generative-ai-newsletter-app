/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  SideNavigation,
  SideNavigationProps
} from '@cloudscape-design/components'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../common/app-context'
import { useNavigationPanelState } from '../common/hooks/use-navigation-panel-state'
import { useLocation, useNavigate } from 'react-router-dom'
export default function NavigationPanel () {
  const navigate = useNavigate()
  const appContext = useContext(AppContext)
  const location = useLocation()
  const [activeHref, setActiveHref] = useState<string>('')
  const [navigationPanelState, setNavigationPanelState] =
    useNavigationPanelState()

  const [items, setItems] = useState<SideNavigationProps.Item[]>([])

  const onChange = ({
    detail
  }: {
    detail: SideNavigationProps.ChangeDetail
  }) => {
    const sectionIndex = items.indexOf(detail.item)
    setNavigationPanelState({
      collapsedSections: {
        ...navigationPanelState.collapsedSections,
        [sectionIndex]: !detail.expanded
      }
    })
  }

  const onFollow = (event: CustomEvent<SideNavigationProps.FollowDetail>) => {
    if (!event.detail.external && event.detail.type === 'link') {
      event.preventDefault()
      setActiveHref(event.detail.href)
      navigate(event.detail.href)
    }
  }

  useEffect(() => {
    const { pathname } = location
    setActiveHref(pathname)
  }, [location])

  useEffect(() => {
    const sideNavigation: SideNavigationProps.Item[] = [
      {
        type: 'section',
        text: 'Newsletters',
        items: [
          {
            type: 'link',
            text: 'Newsletters Dashboard',
            href: '/newsletters'
          },
          {
            type: 'link',
            text: 'My Newsletters',
            href: '/newsletters/my-newsletters'
          },
          {
            type: 'link',
            text: 'My Newsletter Subscriptions',
            href: '/newsletters/my-subscriptions'
          },
          {
            type: 'link',
            text: 'Create Newsletter',
            href: '/newsletters/create'
          }
        ]
      },
      {
        type: 'section',
        text: 'Data Feeds',
        items: [
          {
            type: 'link',
            text: 'Data Feeds Dashboard',
            href: '/feeds'
          },
          {
            type: 'link',
            text: 'Create Data Feed',
            href: '/feeds/create'
          }
        ]
      }
    ]
    if (
      appContext?.ui?.sideNavigation !== undefined &&
      appContext?.ui?.sideNavigation.length > 0
    ) {
      sideNavigation.push({
        type: 'divider'
      })
      sideNavigation.push({
        type: 'section',
        text: 'Additional Links',
        items: appContext.ui.sideNavigation.map((link) => ({
          type: 'link',
          text: link.text,
          href: link.href,
          external: true
        }))
      })
    }
    setItems(sideNavigation)
  }, [appContext])

  return (
    <SideNavigation
      activeHref={activeHref}
      onFollow={onFollow}
      onChange={onChange}
      items={items}
    />
  )
}
