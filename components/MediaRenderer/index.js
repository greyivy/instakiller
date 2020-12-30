import '/node_modules/flickity/dist/flickity.css'
import '../../assets/flickity-reset.css'

import { StatusAudio, StatusGif, StatusImage, StatusVideo } from './renderers'
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
  gifv: StatusGif,
  audio: StatusAudio,
  unknown: null
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

const MediaRenderer = props => {
  const { status } = props
  const { mediaAttachments } = status

  const [enableTextRenderer] = usePreference('enableTextRenderer')

  if (mediaAttachments.length === 0 && enableTextRenderer) {
    return (
      <MediaWrapper>
        <TextRenderer status={status} />
      </MediaWrapper>
    )
  } else if (mediaAttachments.length === 1) {
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

export default MediaRenderer