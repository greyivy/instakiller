import {
  Button,
  Classes,
  Collapse,
  Icon,
  Intent,
  Menu,
  Spinner
} from '@blueprintjs/core'
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

const SpoilerText = styled.a`
  display: inline-block;
  margin-bottom: 0.5rem;
`

const StatusPadding = styled.div`
  padding-bottom: 1rem;
`

const Status = props => {
  const { status: originalStatus, mutateStatus, removeStatus } = props

  const { masto, user } = useContext(MastodonInstance)
  if (!masto || !user) {
    return null
  }

  const status = originalStatus.reblog || originalStatus
  const isReblog = status.id !== originalStatus.id
  const isSelf = user.id === status.account.id

  const {
    account,
    createdAt,
    content,
    favourited,
    favouritesCount,
    reblogged,
    reblogsCount,
    bookmarked,
    spoilerText,
    showSpoilerText,
    url,
    application
  } = status
  const host = new URL(url).host

  const [favouriteLoading, setFavouriteLoading] = useState(false)
  const [reblogLoading, setReblogLoading] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  const mutateStatusInPlace = useCallback(
    mutation => {
      const mutatedStatus = {
        ...status,
        ...mutation
      }

      mutateStatus(mutatedStatus)
      return mutatedStatus
    },
    [status]
  )

  const removeSelf = useCallback(async () => {
    try {
      await masto.removeStatus(status.id)

      removeStatus(status.id)

      toaster.show({ message: 'Status removed', intent: Intent.SUCCESS })
    } catch (e) {
      toaster.show({ message: e.message, intent: Intent.DANGER })
    }
  }, [])

  const toggleFavourite = useCallback(async () => {
    setFavouriteLoading(true)

    try {
      if (favourited) {
        // When favouriteStatus/unfavouriteStatus is called, the function returns an updated
        // status object. We pass this to the parent component and update the state there.
        const mutatedStatus = await masto.unfavouriteStatus(status.id)

        mutateStatusInPlace({
          ...mutatedStatus,
          // Ensure these values are actually updated... Mastodon doesn't always do so
          favourited: false,
          favouritesCount: favouritesCount - 1
        })
      } else {
        const mutatedStatus = await masto.favouriteStatus(status.id)

        mutateStatusInPlace({
          ...mutatedStatus,
          favourited: true,
          favouritesCount: favouritesCount + 1
        })
      }
    } catch (e) {
      toaster.show({ message: e.message, intent: Intent.DANGER })
    } finally {
      setFavouriteLoading(false)
    }
  }, [favourited, status])

  const toggleReblog = useCallback(async () => {
    setReblogLoading(true)

    try {
      if (reblogged) {
        const mutatedStatus = await masto.unreblogStatus(status.id)

        mutateStatusInPlace({
          ...mutatedStatus,
          reblogged: false,
          reblogsCount: reblogsCount - 1
        })
      } else {
        const mutatedStatus = (await masto.reblogStatus(status.id)).reblog

        mutateStatusInPlace({
          ...mutatedStatus,
          reblogged: true,
          reblogsCount: reblogsCount + 1
        })
      }
    } catch (e) {
      toaster.show({ message: e.message, intent: Intent.DANGER })
    } finally {
      setReblogLoading(false)
    }
  }, [reblogged, status])

  const toggleBookmark = useCallback(async () => {
    setBookmarkLoading(true)

    try {
      if (bookmarked) {
        const mutatedStatus = await masto.unbookmarkStatus(status.id)

        mutateStatusInPlace({
          ...mutatedStatus,
          bookmarked: false
        })
      } else {
        const mutatedStatus = await masto.bookmarkStatus(status.id)

        mutateStatusInPlace({
          ...mutatedStatus,
          bookmarked: true
        })
      }
    } catch (e) {
      toaster.show({ message: e.message, intent: Intent.DANGER })
    } finally {
      setBookmarkLoading(false)
    }
  }, [bookmarked, status])

  const renderedContent = content && (
    <HtmlRenderer content={content} context={status} />
  )

  const menuItems = [
    <Menu.Item
      href={url}
      target='_blank'
      rel='noopener'
      key='view'
      text={`View on ${host}`}
    />
  ]

  if (isSelf) {
    menuItems.push(<Menu.Divider key='divider' />)
    menuItems.push(
      <Menu.Item
        key='remove'
        text='Remove'
        icon='trash'
        onClick={() => removeSelf()}
      />
    )
  }

  return (
    <StatusPadding>
      <StatusContainer
        account={status.account}
        secondaryAccount={isReblog && originalStatus.account}
        menu={<Menu>{menuItems}</Menu>}
      >
        <MediaRenderer
          status={status}
          mutateStatusInPlace={mutateStatusInPlace}
        />

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
              {favouritesCount}
            </Button>
            <Button
              minimal
              icon='refresh'
              title='Boost'
              intent={reblogged ? Intent.PRIMARY : Intent.NONE}
              onClick={() => toggleReblog()}
              loading={reblogLoading}
            >
              {reblogsCount}
            </Button>

            <div style={{ float: 'right' }} title='Bookmark'>
              <Button
                minimal
                icon='bookmark'
                title='Bookmark'
                intent={bookmarked ? Intent.DANGER : Intent.NONE}
                onClick={() => toggleBookmark()}
                loading={bookmarkLoading}
              ></Button>
            </div>
          </CaptionButtons>

          <CaptionHeader>
            <Mention account={account} />{' '}
            <ReactTimeAgo
              className={Classes.TEXT_MUTED}
              date={Date.parse(createdAt)}
              locale='en-US'
              //timeStyle='twitter' // For comments
            />
            {application && application.website && (
              <span className={Classes.TEXT_MUTED}>
                {' via '}
                <a
                  className='link-plain'
                  href={application.website}
                  target='_blank'
                  rel='noopener'
                >
                  {application.name}
                </a>
              </span>
            )}
          </CaptionHeader>

          {spoilerText ? (
            <>
              <SpoilerText
                className='link-plain'
                href='#'
                onClick={e => {
                  e.preventDefault()
                  mutateStatusInPlace({ showSpoilerText: !showSpoilerText })
                }}
              >
                {spoilerText}
                <Icon
                  style={{ marginLeft: '0.1rem' }}
                  icon={showSpoilerText ? 'chevron-up' : 'chevron-down'}
                />
              </SpoilerText>

              {showSpoilerText && renderedContent}
            </>
          ) : (
            renderedContent
          )}
        </CaptionWrapper>
      </StatusContainer>
    </StatusPadding>
  )
}

export default Status
