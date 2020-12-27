import {
  Alignment,
  Button,
  Callout,
  Intent,
  Navbar,
  Spinner,
  PanelStack
} from '@blueprintjs/core'
import { Component, createElement, h, render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import parse from 'html-dom-parser'
import styled from 'styled-components'

import Status from './Status'
import MediaRenderer from './media-components/MediaRenderer'


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
  br: () => <br/>,
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
  const statuses = props.statuses
  let content
  let media
  return (
    <TimeLineWrapper>
      {statuses.map(status => {
        content = parse(status.content)
        media = status.mediaAttachments
        return (
          
          <Status key={status.id} account={status.account}>
            <MediaRenderer media={media}/>
            <HtmlRenderer tags={content} />
          </Status>
        
        )
      })}
    </TimeLineWrapper>
  )
}

export default Timeline
