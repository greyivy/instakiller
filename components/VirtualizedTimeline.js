import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List
} from 'react-virtualized'
import { Button, Intent, NonIdealState } from '@blueprintjs/core'
import { MastodonInstance, MastodonInstanceWrapper } from '../mastodon'
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks'

import CenteredSpinner from './CenteredSpinner'
import HashtagHeader from './HashtagHeader'
import Status from './Status'
import UserHeader from './UserHeader'
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
  }, [masto, type, params])

  // Row height cache
  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 600
      }),
    []
  )

  // Reload when configuration changes
  useEffect(() => {
    cache.clearAll()
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
    console.log(mutatedStatus)

    const mutatedStatuses = [...statuses]

    const index = mutatedStatuses.findIndex(
      status => status.id === mutatedStatus.id
    )
    const rebloggedIndex = mutatedStatuses.findIndex(
      status => status.reblog && status.reblog.id === mutatedStatus.id
    )
    if (index !== -1) {
      // Mutate status
      mutatedStatuses[index] = mutatedStatus
    }
    if (rebloggedIndex !== -1) {
      // Mutate reblog
      mutatedStatuses[rebloggedIndex].reblog = mutatedStatus
    }

    console.log(index, rebloggedIndex)

    setStatuses(mutatedStatuses)
  }

  let header = null
  if (type === 'user') {
    header = <UserHeader account={timelineAccount} />
  } else if (type === 'self') {
    header = <UserHeader account={timelineAccount} />
  } else if (type === 'hashtag') {
    header = <HashtagHeader name={params.name} />
  }

  const isLoading = isInitialTimelineLoading || isAccountLoading

  if (isLoading) return <CenteredSpinner />

  // TODO accessibility https://github.com/bvaughn/react-virtualized/blob/master/docs/ArrowKeyStepper.md
  return (
    <AutoSizer style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
      {({ width, height }) => {
        useEffect(() => {
          cache.clearAll()
          listRef.current?.recomputeRowHeights()
        }, [width])

        return (
          <InfiniteLoader
            isRowLoaded={({ index }) => !!statuses[index]}
            loadMoreRows={() => load()}
            rowCount={hasMore ? Number.MAX_VALUE : statuses.length}
          >
            {({ onRowsRendered, registerChild }) => (
              <List
                onRowsRendered={onRowsRendered}
                ref={ref => {
                  listRef.current = ref
                  registerChild(ref)
                }}
                width={width}
                height={height}
                rowHeight={cache.rowHeight}
                overscanRowCount={10}
                noRowsRenderer={() =>
                  error ? (
                    <>
                      {header}
                      <NonIdealState
                        icon='error'
                        title='Error fetching timeline'
                        action={
                          <Button
                            intent={Intent.PRIMARY}
                            onClick={() => load(true)}
                          >
                            Try again
                          </Button>
                        }
                      />
                    </>
                  ) : (
                    <NonIdealState
                      icon='clean'
                      title='Looking a little empty here…'
                      description='No statuses'
                    />
                  )
                }
                rowRenderer={({ index, key, style, parent }) => {
                  const status = statuses[index]

                  return (
                    <CellMeasurer
                      key={key}
                      rowIndex={index}
                      parent={parent}
                      cache={cache}
                      columnIndex={0}
                    >
                      <div style={style}>
                        <StatusWrapper>
                          {index === 0 && (
                            <HeaderWrapper>{header}</HeaderWrapper>
                          )}

                          <Status
                            status={status}
                            mutateStatus={mutatedStatus =>
                              mutateStatus(mutatedStatus)
                            }
                          />
                        </StatusWrapper>
                      </div>
                    </CellMeasurer>
                  )
                }}
                rowCount={statuses.length}
              />
            )}
          </InfiniteLoader>
        )
      }}
    </AutoSizer>
  )
}

const VirtualizedTimelineWrapper = props => (
  <MastodonInstanceWrapper account={props.account}>
    <VirtualizedTimeline {...props} />
  </MastodonInstanceWrapper>
)

export default VirtualizedTimelineWrapper
