import '/node_modules/flickity/dist/flickity.css'
import '../../assets/flickity-reset.css'

import { Button, Classes, Colors, Icon } from '@blueprintjs/core'
import { StatusAudio, StatusImage, StatusVideo } from './renderers'
import { useEffect, useRef, useState } from 'preact/hooks'

import Flickity from 'react-flickity-component'
import TextRenderer from './TextRenderer'
import { createElement } from 'preact'
import styled from 'styled-components'
import { usePreference } from '../../prefs'

const FLICKITY_CLASSNAME = 'carousel'
const MediaWrapper = styled.div`
  box-shadow: 0px 2.5px 2px -3px var(--shadowColor); // Bottom border
  padding-top: 100%; // Ensure media is always 1:1 aspect ratio
  position: relative;
  overflow: hidden;

  > *:not(span) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .${FLICKITY_CLASSNAME} {
    .flickity-viewport {
      height: 100% !important;
    }
  }
`

const SensitiveWrapper = styled.div`
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 4rem;

  > .${Classes.ICON} {
    color: ${Colors.GRAY1};
    margin-bottom: 1rem;
  }

  > div {
    margin-bottom: 1.5rem;
  }
`

const FlickitySlide = styled.div`
  width: 100%;
  height: 100%;
`

const FlickityCounter = styled.span`
  position: absolute;
  z-index: 1;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-weight: 500;
  border-radius: 1rem;
`

const attTypeMap = {
  image: StatusImage,
  video: StatusVideo,
  gifv: StatusVideo,
  audio: StatusAudio,
  unknown: null // TODO use a vertically centered question mark icon!
}

const renderMedia = media => {
  if (attTypeMap[media.type]) {
    return createElement(attTypeMap[media.type], {
      media,
      key: media.id
    })
  } else {
    return null
  }
}

const SensitiveRenderer = props => (
  <MediaWrapper>
    <SensitiveWrapper>
      <Icon icon='eye-off' iconSize={56} />

      {props.content && (
        <div className={Classes.TEXT_LARGE}>{props.content}</div>
      )}

      <Button outlined large icon='eye-open' onClick={() => props.onClick()}>
        View content
      </Button>
    </SensitiveWrapper>
  </MediaWrapper>
)

const MediaRenderer = props => {
  const { status, mutateStatusInPlace } = props
  const {
    mediaAttachments,
    sensitive,
    spoilerText,
    showSpoilerText,
    showSensitiveMedia
  } = status

  const [enableTextRenderer] = usePreference('enableTextRenderer')
  const [showAllSensitiveMedia] = usePreference('showAllSensitiveMedia')

  if (mediaAttachments.length === 0 && enableTextRenderer) {
    if (spoilerText && !showSpoilerText) {
      return (
        <SensitiveRenderer
          onClick={() =>
            mutateStatusInPlace({ showSpoilerText: !showSpoilerText })
          }
          content={spoilerText}
        />
      )
    }

    return (
      <MediaWrapper>
        <TextRenderer status={status} />
      </MediaWrapper>
    )
  } else {
    if (sensitive && !showSensitiveMedia && !showAllSensitiveMedia) {
      return (
        <SensitiveRenderer
          onClick={() =>
            mutateStatusInPlace({ showSensitiveMedia: !showSensitiveMedia })
          }
        />
      )
    }

    if (mediaAttachments.length === 1) {
      return <MediaWrapper>{renderMedia(mediaAttachments[0])}</MediaWrapper>
    } else if (mediaAttachments.length > 0) {
      const [flickityIndex, setFlickityIndex] = useState(0)
      const flickityRef = useRef(null)

      useEffect(() => {
        if (flickityRef.current) {
          flickityRef.current.on('change', () => {
            const { selectedIndex } = flickityRef.current
            setFlickityIndex(selectedIndex)
          })

          return () => {
            flickityRef.current.off('change')
          }
        }
      }, [flickityRef.current])

      return (
        <MediaWrapper>
          <FlickityCounter>
            {flickityIndex + 1}/{mediaAttachments.length}
          </FlickityCounter>
          <Flickity
            className={FLICKITY_CLASSNAME}
            elementType='div'
            flickityRef={ref => {
              flickityRef.current = ref
            }}
          >
            {mediaAttachments.map(media => (
              <FlickitySlide key={media.id}>{renderMedia(media)}</FlickitySlide>
            ))}
          </Flickity>
        </MediaWrapper>
      )
    }
  }
}

export default MediaRenderer
