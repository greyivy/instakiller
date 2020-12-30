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
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [statuses, setStatuses] = useState([])

  const { masto, user } = useContext(MastodonInstance)

  // Determine which timeline to use
  const timeline = useMemo(() => {
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
      timeline = masto.fetchAccountStatuses(params.userId)
    } else if (type === 'self') {
      timeline = masto.fetchAccountStatuses(user.id)
    } else if (type === 'hashtag') {
      timeline = masto.fetchTagTimeline(params.name)
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

  const load = async clear => {
    if (clear) {
      setStatuses([])
    }
    setError(null)
    setHasMore(false)
    setIsLoading(true)

    try {
      if (timeline) {
        // Load new statuses
        const { value, done } = await timeline.next()

        let tempStatuses = []
        if (value) {
          const newStatuses = Object.values(value)

          if (clear) {
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
      setIsLoading(false)
    }
  }

  const measureHeader = () => {
    // Remeasure from header on
    cache.clear(0)
    listRef.current?.recomputeRowHeights()
  }

  let header = null
  if (type === 'user') {
    header = <UserHeader userId={params.userId} measure={measureHeader} />
  } else if (type === 'self') {
    header = <UserHeader userId={user.id} self measure={measureHeader} />
  } else if (type === 'hashtag') {
    header = <HashtagHeader name={params.name} measure={measureHeader} />
  }

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
                noRowsRenderer={() =>
                  isLoading ? (
                    <CenteredSpinner />
                  ) : error ? (
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
                      cache={cache}
                      parent={parent}
                      columnIndex={0}
                      rowIndex={index}
                    >
                      <div style={style}>
                        <StatusWrapper>
                          {index === 0 && (
                            <HeaderWrapper>{header}</HeaderWrapper>
                          )}

                          <Status status={status} />
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
