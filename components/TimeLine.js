import {
  Alignment,
  Button,
  Callout,
  Intent,
  Navbar,
  PanelStack,
  Spinner
} from '@blueprintjs/core'
import { Component, Fragment, createElement, h, render } from 'preact'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'preact/hooks'

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

const CaptionWrapper = styled.div`
  padding: 0.75rem;
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

// TODO react-virtualized
const Timeline = props => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [statuses, setStatuses] = useState([])

  const { type } = props
  const { masto, user } = useContext(MastodonInstance)

  const timeline = useMemo(() => {
    console.log('getting timeline')
    let timeline = null

    if (type === 'home') {
      timeline = masto.fetchHomeTimeline()
    } else if (type === 'local') {
      timeline = masto.fetchPublicTimeline({
        local: true
      })
    } else if (type === 'federated') {
      timeline = masto.fetchPublicTimeline()
    } else if (type === 'user') {
      timeline = masto.fetchAccountStatuses(props.userId || user.id)
    }

    return timeline
  }, [masto, type])

  useEffect(() => {
    if (masto) load(true)
  }, [masto, type])

  console.log('user', user)

  const load = async clear => {
    if (clear) {
      setStatuses([])
    }
    setHasMore(false)
    setIsLoading(true)

    try {
      if (timeline) {
        const { value, done } = await timeline.next()

        console.log('timeline', value)
        const newStatuses = Object.values(value)
        if (clear) {
          setStatuses(newStatuses)
        } else {
          setStatuses([...statuses, ...newStatuses])
        }
        setHasMore(!done)
      } else {
        throw new Error('Invalid timeline')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const loader = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '240px',
      threshold: 1.0
    })
    if (loader.current) {
      observer.observe(loader.current)
    }
  })

  const handleObserver = entities => {
    const target = entities[0]
    if (target.isIntersecting) {
      load()
    }
  }

  return (
    <TimeLineWrapper>
      {type === 'user' && <>USER HEADER HERE</>}

      {statuses.map(status => {
        const content = parse(status.content)
        const media = status.mediaAttachments

        return (
          <Status key={status.id} account={status.account}>
            <MediaRenderer media={media} />
            <CaptionWrapper>
              <HtmlRenderer tags={content} />
            </CaptionWrapper>
          </Status>
        )
      })}

      {isLoading && <Spinner />}

      {hasMore && (
        <div className='loading' ref={loader}>
          <h2>Load More</h2>
        </div>
      )}
    </TimeLineWrapper>
  )
}

export default Timeline
