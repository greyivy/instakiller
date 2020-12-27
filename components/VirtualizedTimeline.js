import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List
} from 'react-virtualized'
import { Button, Intent, NonIdealState, Spinner } from '@blueprintjs/core'
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks'

import CenteredSpinner from './CenteredSpinner'
import HtmlRenderer from './HtmlRenderer'
import { MastodonInstance } from '../mastodon'
import MediaRenderer from './media-components/MediaRenderer'
import Status from './Status'
import parse from 'html-dom-parser'
import styled from 'styled-components'
import toaster from './toaster'

const STATUS_WIDTH_MAX_PX = 600
const STATUS_SPACING_PX = 6

const CaptionWrapper = styled.div`
  padding: 0.75rem;
`

const VirtualizedTimeline = props => {
  const [error, setError] = useState(null)
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
  }, [masto, type])

  const load = async clear => {
    if (clear) {
      setStatuses([])
    }
    setError(null)
    setHasMore(false)
    setIsLoading(true)

    try {
      if (timeline) {
        const { value, done } = await timeline.next()

        if (value) {
          const newStatuses = Object.values(value)
          if (clear) {
            setStatuses(newStatuses)
          } else {
            setStatuses([...statuses, ...newStatuses])
          }
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

  // TODO accessibility https://github.com/bvaughn/react-virtualized/blob/master/docs/ArrowKeyStepper.md
  return (
    <>
      {/* {type === 'user' && <>USER HEADER HERE</>} */}

      <AutoSizer style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
        {({ width, height }) => (
          <InfiniteLoader
            isRowLoaded={({ index }) => !!statuses[index]}
            loadMoreRows={() => load()}
            rowCount={hasMore ? Number.MAX_VALUE : statuses.length}
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
                  ) : (
                    <NonIdealState
                      icon='clean'
                      title='Looking a little empty here…'
                      description='No statuses'
                    />
                  )
                }
                rowRenderer={({ index, key, style, parent }) => {
                  const { account, content, mediaAttachments } = statuses[index]

                  return (
                    <CellMeasurer
                      key={key}
                      cache={cache}
                      parent={parent}
                      columnIndex={0}
                      rowIndex={index}
                    >
                      <div
                        style={{
                          ...style,
                          width: '100%',
                          padding: STATUS_SPACING_PX,
                          paddingTop:
                            index === 0
                              ? STATUS_SPACING_PX * 2
                              : STATUS_SPACING_PX,
                          paddingBottom:
                            index === statuses.length - 1
                              ? STATUS_SPACING_PX * 2
                              : STATUS_SPACING_PX
                        }}
                      >
                        <Status
                          style={{
                            maxWidth: STATUS_WIDTH_MAX_PX,
                            margin: 'auto'
                          }}
                          account={account}
                        >
                          <MediaRenderer media={mediaAttachments} />

                          <CaptionWrapper>
                            <HtmlRenderer content={content} />
                          </CaptionWrapper>
                        </Status>
                      </div>
                    </CellMeasurer>
                  )
                }}
                rowCount={statuses.length}
              />
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </>
  )
}

export default VirtualizedTimeline
