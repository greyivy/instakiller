import { Button, Classes, Intent } from '@blueprintjs/core'
import { useCallback, useContext, useState } from 'preact/hooks'

import HtmlRenderer from '../HtmlRenderer'
import { MastodonInstance } from '../../mastodon'
import MediaRenderer from '../MediaRenderer'
import { Mention } from '../Mention'
import ReactTimeAgo from 'react-time-ago'
import StatusContainer from './StatusContainer'
import styled from 'styled-components'
import toaster from '../toaster'

const CaptionWrapper = styled.div`
  padding: 0.5rem 1rem 0.25rem 1rem;
  overflow: hidden;
`

const CaptionHeader = styled.div`
  margin-bottom: 0.5rem;
`

const CaptionButtons = styled.div`
  margin-bottom: 0.5rem;
  margin-left: -8px;
  margin-right: -8px;
`

const Status = props => {
  const { status: originalStatus } = props

  const { masto } = useContext(MastodonInstance)

  let rebloggedStatus = originalStatus

  // Get deepest reblog
  // TODO do we need to recurse down the tree or can there only be one level?
  let isReblog = false
  while (rebloggedStatus.reblog) {
    rebloggedStatus = rebloggedStatus.reblog
    isReblog = true
  }

  const displayStatus = isReblog ? rebloggedStatus : originalStatus

  const [favourited, setFavourited] = useState(displayStatus.favourited)
  const [favouriteLoading, setFavouriteLoading] = useState(false)
  const [reblogged, setReblogged] = useState(displayStatus.reblogged)
  const [reblogLoading, setReblogLoading] = useState(false)
  const [bookmarked, setBookmarked] = useState(displayStatus.bookmarked)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  const toggleFavourite = useCallback(async () => {
    setFavouriteLoading(true)

    try {
      if (favourited) {
        await masto.unfavouriteStatus(displayStatus.id)
      } else {
        await masto.favouriteStatus(displayStatus.id)
      }

      setFavourited(!favourited)
    } catch (e) {
      toaster.show({ message: e.message, intent: Intent.DANGER })
    } finally {
      setFavouriteLoading(false)
    }
  }, [favourited])

  const toggleReblog = useCallback(async () => {
    setReblogLoading(true)

    try {
      if (reblogged) {
        await masto.reblogStatus(displayStatus.id)
      } else {
        await masto.unreblogStatus(displayStatus.id)
      }

      setReblogged(!reblogged)
    } catch (e) {
      toaster.show({ message: e.message, intent: Intent.DANGER })
    } finally {
      setReblogLoading(false)
    }
  }, [reblogged])

  const toggleBookmark = useCallback(async () => {
    setBookmarkLoading(true)

    try {
      if (bookmarked) {
        await masto.bookmarkStatus(displayStatus.id)
      } else {
        await masto.unbookmarkStatus(displayStatus.id)
      }

      setBookmarked(!bookmarked)
    } catch (e) {
      toaster.show({ message: e.message, intent: Intent.DANGER })
    } finally {
      setBookmarkLoading(false)
    }
  }, [bookmarked])

  return (
    <StatusContainer
      account={displayStatus.account}
      secondaryAccount={isReblog && originalStatus.account}
    >
      <MediaRenderer status={displayStatus} />

      <CaptionWrapper>
        <CaptionButtons>
          <Button
            minimal
            icon={favourited ? 'star' : 'star-empty'}
            title='Favorite'
            intent={favourited ? Intent.WARNING : Intent.NONE}
            onClick={() => toggleFavourite()}
            loading={favouriteLoading}
          >
            {favourited
              ? displayStatus.favouritesCount + 1
              : displayStatus.favouritesCount}
          </Button>
          <Button
            minimal
            icon='refresh'
            title='Boost'
            intent={reblogged ? Intent.PRIMARY : Intent.NONE}
            onClick={() => toggleReblog()}
            loading={reblogLoading}
          >
            {reblogged
              ? displayStatus.reblogsCount + 1
              : displayStatus.reblogsCount}
          </Button>

          <div style={{ float: 'right' }} title='Bookmark'>
            <Button
              minimal
              icon='bookmark'
              title='Bookmark'
              intent={bookmarked ? Intent.PRIMARY : Intent.NONE}
              onClick={() => toggleBookmark()}
              loading={bookmarkLoading}
            ></Button>
          </div>
        </CaptionButtons>

        <CaptionHeader>
          <Mention account={displayStatus.account} />{' '}
          <ReactTimeAgo
            className={Classes.TEXT_MUTED}
            date={Date.parse(displayStatus.createdAt)}
            locale='en-US'
            //timeStyle='twitter' // For comments
          />
        </CaptionHeader>

        {displayStatus.content && (
          <HtmlRenderer
            content={displayStatus.content}
            context={displayStatus}
          />
        )}
      </CaptionWrapper>
    </StatusContainer>
  )
}

export default Status
