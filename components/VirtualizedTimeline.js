import { Button, Intent, NonIdealState, Spinner } from '@blueprintjs/core'
import { MastodonInstance, MastodonInstanceWrapper } from '../mastodon'
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks'

import CenteredSpinner from './CenteredSpinner'
import HashtagHeader from './HashtagHeader'
import Status from './Status'
import UserHeader from './UserHeader'
import { Virtuoso } from 'react-virtuoso'
import history from 'history/browser'
import styled from 'styled-components'
import toaster from './toaster'
import { usePreference } from '../prefs'

const DEFAULT_STATUS_HEIGHT = 800

const StatusWrapper = styled.div`
  max-width: var(--containerWidth);
  margin: 0 auto;
  overflow: hidden;
`

const HeaderSpacer = styled.div`
  height: 1rem;
`

// TODO use context to hold/mutate statuses? Mutation is broken.
// e.g. if we expand a content warning, then like the post below it,
// the content warning collapses!
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
      listRef.current.scrollTo({ top: 0, behavior: 'smooth' })
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
      mutatedStatuses[index] = { ...mutatedStatuses[index], ...mutatedStatus }
    }
    if (rebloggedIndex !== -1) {
      // Mutate reblog
      mutatedStatuses[rebloggedIndex].reblog = {
        ...mutatedStatuses[rebloggedIndex].reblog,
        ...mutatedStatus
      }
    }

    setStatuses(mutatedStatuses)
  }

  const removeStatus = id => {
    setStatuses(
      statuses.filter(status => {
        if (status.id === id) return false
        if (status.reblog && status.reblog.id === id) return false
        return true
      })
    )
  }

  const isLoading = isInitialTimelineLoading || isAccountLoading

  if (isLoading) return <CenteredSpinner />

  return (
    <Virtuoso
      ref={listRef}
      style={{ height: '100%' }}
      data={statuses}
      defaultItemHeight={DEFAULT_STATUS_HEIGHT}
      endReached={() => load()}
      computeItemKey={index => statuses[index].id}
      overscan={DEFAULT_STATUS_HEIGHT * 8}
      components={{
        Header: () => {
          let header = null
          if (type === 'user') {
            header = <UserHeader account={timelineAccount} type={'user'} />
          } else if (type === 'self') {
            header = <UserHeader account={timelineAccount} type={'self'} />
          } else if (type === 'hashtag') {
            header = <HashtagHeader name={params.name} />
          } else {
            header = <HeaderSpacer />
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
              removeStatus={id => removeStatus(id)}
            />
          </StatusWrapper>
        )
      }}
    />
  )
}

const VirtualizedTimelineWrapper = props => {
  const { isLoading, error } = useContext(MastodonInstance)

  useEffect(() => {
    if (error) {
      toaster.show({ message: error.message, intent: Intent.DANGER })
    }
  }, [error])

  if (isLoading) {
    return <CenteredSpinner />
  }

  if (error) {
    return (
      <NonIdealState
        icon='error'
        title='Error connecting to instance'
        description='Please check your credentials and verify that the instance is up'
        action={
          <>
            <Button intent={Intent.PRIMARY} onClick={() => login()}>
              Try again
            </Button>
            <a href={uri} target='_blank' rel='noopener'>
              View instance
            </a>
          </>
        }
      />
    )
  }

  return <VirtualizedTimeline {...props} />
}

export default props => {
  const { account } = props

  if (!account) {
    return (
      <NonIdealState
        icon='user'
        title='No account'
        description='Please add a Mastodon account before continuing'
        action={
          <Button
            intent={Intent.PRIMARY}
            onClick={() => history.replace('/settings')}
          >
            Add account
          </Button>
        }
      />
    )
  }

  return (
    <MastodonInstanceWrapper account={account}>
      <VirtualizedTimelineWrapper {...props} />
    </MastodonInstanceWrapper>
  )
}
