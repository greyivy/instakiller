import {
  Alignment,
  Button,
  Callout,
  Intent,
  Navbar,
  PanelStack,
  Spinner
} from '@blueprintjs/core'
import { Component, createElement, h, render } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'

import { MastodonInstance } from '../mastodon'
import MediaRenderer from './media-components/MediaRenderer'
import Status from './Status'
import parse from 'html-dom-parser'
import styled from 'styled-components'

const TimeLineWrapper = styled.div`
  margin: 0 auto;
  width: 500px;
  max-width: 90vw;
`

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

const tagMap = {
  p: props => (
    <p>
      <HtmlRenderer tags={props.children} />
    </p>
  ),
  a: props => (
    <a href={props.attribs.href} target={props.attribs.target}>
      <HtmlRenderer tags={props.children} />
    </a>
  ),
  br: () => <br />,
  span: props => (
    <span>
      <HtmlRenderer tags={props.children} />
    </span>
  )
}

const HtmlRenderer = props => {
  const { tags } = props

  return tags.map(tag => {
    const { children, parent, prev, next, ...other } = tag

    if (tag.type === 'text') {
      return tag.data
    } else if (tagMap[tag.name]) {
      return createElement(tagMap[tag.name], tag)
    } else {
      return (
        <strong>
          Unknown tag:{' '}
          <pre>{JSON.stringify(other, getCircularReplacer(), 2)}</pre>
        </strong>
      )
    }
  })
}

const Timeline = props => {
  const masto = useContext(MastodonInstance)
  const [statuses, setStatuses] = useState([])

  const loadTimeline = async () => {
    // Generate iterable of timeline
    let timeline = null

    if (props.type === 'home') {
      timeline = masto.fetchHomeTimeline()
    } else if (props.type === 'public') {
      timeline = masto.fetchPublicTimeline()
    }

    if (timeline) {
      const result = await timeline.next()
      console.log(result.value)
      setStatuses(Object.values(result.value))
    }

    //for await (const statuses of timeline) {

    //  statuses.forEach(status => {
    //    masto.favouriteStatus(status.id)
    //  })
    //}
  }

  useEffect(() => {
    if (masto) loadTimeline()
  }, [masto, props.type])

  let content
  let media
  return (
    <TimeLineWrapper>
      {props.type}
      {statuses.map(status => {
        content = parse(status.content)
        media = status.mediaAttachments
        return (
          <Status key={status.id} account={status.account}>
            <MediaRenderer media={media} />
            <HtmlRenderer tags={content} />
          </Status>
        )
      })}
    </TimeLineWrapper>
  )
}

export default Timeline
