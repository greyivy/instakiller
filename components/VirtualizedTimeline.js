import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List
} from 'react-virtualized'
import { Button, Intent, NonIdealState, Spinner } from '@blueprintjs/core'
import { MastodonInstance, MastodonInstanceWrapper } from '../mastodon'
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks'

import CenteredSpinner from './CenteredSpinner'
import HtmlRenderer from './HtmlRenderer'
import MediaRenderer from './media-components/MediaRenderer'
import Status from './Status'
import UserHeader from './UserHeader'
import styled from 'styled-components'
import toaster from './toaster'

const ItemContainer = styled.div`
  max-width: var(--containerWidth);
  margin: auto;
`

const HeaderWrapper = styled.div`
  margin-bottom: 1rem;
`

const CaptionWrapper = styled.div`
  padding: 0.75rem;
`

const VirtualizedTimeline = props => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [items, setItems] = useState([])

  const { params } = props
  const { masto, user } = useContext(MastodonInstance)
  const { type } = params

  const timeline = useMemo(() => {
    console.log('getting timeline', params)
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
    }

    return timeline
  }, [masto, type, params])

  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 600
      }),
    []
  )

  useEffect(() => {
    cache.clearAll()
    if (masto) load(true)
  }, [masto, type, params])

  const load = async clear => {
    if (clear) {
      setItems([])
    }
    setError(null)
    setHasMore(false)
    setIsLoading(true)

    try {
      if (timeline) {
        const { value, done } = await timeline.next()

        let header = null

        /*if (type === 'user') {
          header = {
            render: () => <UserHeader userId={params.userId || user.id} />
          }
        }*/

        if (value) {
          let tempItems = []

          const newItems = Object.values(value)

          if (clear) {
            tempItems = newItems
          } else {
            tempItems = [...items, ...newItems]
          }

          setItems(tempItems)
        }

        if (header) {
          tempItems.unshift(header)
        }

        setHasMore(!done)
      } else {
        throw new Error('Invalid timeline')
      }
    } catch (e) {
      console.error(e)
      toaster.show({ message: e.message, intent: Intent.DANGER })
      setError(e)
    } finally {
      setIsLoading(false)
    }
  }

  let header = null
  if (type === 'user') {
    header = <UserHeader userId={params.userId} />
  } else if (type === 'self') {
    header = <UserHeader userId={user.id} self />
  }

  // TODO accessibility https://github.com/bvaughn/react-virtualized/blob/master/docs/ArrowKeyStepper.md
  return (
    <>
      {/* {type === 'user' && <>USER HEADER HERE</>} */}

      <AutoSizer style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
        {({ width, height }) => (
          <InfiniteLoader
            isRowLoaded={({ index }) => !!items[index]}
            loadMoreRows={() => load()}
            rowCount={hasMore ? Number.MAX_VALUE : items.length}
          >
            {({ onRowsRendered, registerChild }) => (
              <List
                onRowsRendered={onRowsRendered}
                ref={registerChild}
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
                  const item = items[index]

                  return (
                    <CellMeasurer
                      key={key}
                      cache={cache}
                      parent={parent}
                      columnIndex={0}
                      rowIndex={index}
                    >
                      <div style={style}>
                        <ItemContainer>
                          {index === 0 && (
                            <HeaderWrapper>{header}</HeaderWrapper>
                          )}
                          <Status account={item.account}>
                            <MediaRenderer media={item.mediaAttachments} />

                            <CaptionWrapper>
                              <HtmlRenderer content={item.content} />
                            </CaptionWrapper>
                          </Status>
                        </ItemContainer>
                      </div>
                    </CellMeasurer>
                  )
                }}
                rowCount={items.length}
              />
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </>
  )
}

const VirtualizedTimelineWrapper = props => (
  <MastodonInstanceWrapper account={props.account}>
    <VirtualizedTimeline {...props} />
  </MastodonInstanceWrapper>
)

export default VirtualizedTimelineWrapper
