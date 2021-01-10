import { Button, Intent, NonIdealState, Spinner } from '@blueprintjs/core'
import { MastodonInstance, MastodonInstanceWrapper } from '../mastodon'
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks'

import CenteredSpinner from './CenteredSpinner'
import HashtagHeader from './HashtagHeader'
import Status from './Status'
import UserHeader from './UserHeader'
import { Virtuoso } from 'react-virtuoso'
import styled from 'styled-components'
import toaster from './toaster'
import { usePreference } from '../prefs'

const StatusWrapper = styled.div`
  max-width: var(--containerWidth);
  margin: auto;
`

const HeaderWrapper = styled.div`
  margin-bottom: 1rem;
`

const VirtualizedTimeline = props => {
  const { params } = props
  const { type } = params

  const listRef = useRef()

  const [error, setError] = useState(null)
  const [isInitialTimelineLoading, setIsInitialTimelineLoading] = useState(true)
  const [isAccountLoading, setIsAccountLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [statuses, setStatuses] = useState([])
  const [timelineAccount, setTimelineAccount] = useState(null)

  const { masto, user } = useContext(MastodonInstance)

  const [onlyMedia] = usePreference('onlyMedia')

  // Determine which timeline to use
  const timeline = useMemo(() => {
    let timeline = null

    if (type === 'home') {
      timeline = masto.fetchHomeTimeline({
        // TODO this does not work (but it does on the public timelines)
        onlyMedia
      })
    } else if (type === 'local') {
      timeline = masto.fetchPublicTimeline({
        local: true,
        onlyMedia
      })
    } else if (type === 'federated') {
      timeline = masto.fetchPublicTimeline({
        onlyMedia
      })
    } else if (type === 'user') {
      // TODO excludeReplies, pinned (can use URL params)
      timeline = masto.fetchAccountStatuses(params.userId, {
        onlyMedia
      })
    } else if (type === 'self') {
      timeline = masto.fetchAccountStatuses(user.id, {
        onlyMedia
      })
    } else if (type === 'hashtag') {
      timeline = masto.fetchTagTimeline(params.name, {
        onlyMedia
      })
    }

    return timeline
  }, [masto, type, params, onlyMedia])

  // Reload when configuration changes
  useEffect(() => {
    if (masto) load(true)
  }, [masto, type, params])

  // Scroll to top event listener
  useEffect(() => {
    function scrollTop () {
      listRef.current.base.scrollTo({ top: 0, behavior: 'smooth' })
    }

    document.addEventListener('scrollTop', scrollTop, false)
    return () => document.removeEventListener('scrollTop', scrollTop)
  })

  const load = async isInitial => {
    try {
      setError(null)
      setHasMore(false)

      if (isInitial) {
        setIsInitialTimelineLoading(true)
        setStatuses([])
        setTimelineAccount(null)

        if (type === 'user') {
          setIsAccountLoading(true)
          setTimelineAccount(await masto.fetchAccount(params.userId))
          setIsAccountLoading(false)
        } else if (type === 'self') {
          setIsAccountLoading(true)
          setTimelineAccount(await masto.fetchAccount(user.id))
          setIsAccountLoading(false)
        }
      }

      if (timeline) {
        // Load new statuses
        const { value, done } = await timeline.next()

        let tempStatuses = []
        if (value) {
          const newStatuses = Object.values(value)

          if (isInitial) {
            // Clear old statuses, keeping only new ones
            tempStatuses = newStatuses
          } else {
            // Append new statuses to old ones
            tempStatuses = [...statuses, ...newStatuses]
          }

          setStatuses(tempStatuses)
        }

        setHasMore(!done)
      } else {
        throw new Error('Invalid timeline')
      }
    } catch (e) {
      toaster.show({ message: e.message, intent: Intent.DANGER })
      setError(e)
    } finally {
      setIsInitialTimelineLoading(false)
    }
  }

  const mutateStatus = mutatedStatus => {
    const mutatedStatuses = [...statuses]

    const index = mutatedStatuses.findIndex(
      status => status.id === mutatedStatus.id
    )
    const rebloggedIndex = mutatedStatuses.findIndex(
      status => status.reblog && status.reblog.id === mutatedStatus.id
    )
    if (index !== -1) {
      // Mutate status
      // Note: we specifically need to use Object.assign here
      // to keep the reference to the old status so the List
      // knows to rerender. mutatedStatuses[index] = mutatedStatus
      // DOES NOT WORK
      Object.assign(mutatedStatuses[index], mutatedStatus)
    }
    if (rebloggedIndex !== -1) {
      // Mutate reblog
      Object.assign(mutatedStatuses[rebloggedIndex].reblog, mutatedStatus)
    }

    setStatuses(mutatedStatuses)
  }

  const isLoading = isInitialTimelineLoading || isAccountLoading

  if (isLoading) return <CenteredSpinner />

  return (
    <Virtuoso
      style={{ height: '100%' }}
      totalCount={statuses.length}
      endReached={() => load()}
      overscan={{
        // 800px is the average height of a post...
        main: 800 * 4, // ...so overscan 4 posts going forward...
        reverse: 800 * 8 // ...and 8 going backward
      }}
      components={{
        Header: () => {
          let header = null
          if (type === 'user') {
            header = <UserHeader account={timelineAccount} type={'user'} />
          } else if (type === 'self') {
            header = <UserHeader account={timelineAccount} type={'self'} />
          } else if (type === 'hashtag') {
            header = <HashtagHeader name={params.name} />
          }

          return header
        },
        Footer: () =>
          hasMore && (
            <div style={{ paddingBottom: '1rem' }}>
              <Spinner />
            </div>
          )
      }}
      itemContent={index => {
        const status = statuses[index]

        return (
          <StatusWrapper>
            <Status
              status={status}
              mutateStatus={mutatedStatus => mutateStatus(mutatedStatus)}
            />
          </StatusWrapper>
        )
      }}
    />
  )
}

const VirtualizedTimelineWrapper = props => (
  <MastodonInstanceWrapper account={props.account}>
    <VirtualizedTimeline {...props} />
  </MastodonInstanceWrapper>
)

export default VirtualizedTimelineWrapper
