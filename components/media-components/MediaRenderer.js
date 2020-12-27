import '/node_modules/flickity/dist/flickity.css'
import '../../assets/flickity-reset.css'

import { StatusAudio, StatusGif, StatusImage, StatusVideo } from './renderers'
import { useEffect, useRef, useState } from 'preact/hooks'

import Flickity from 'react-flickity-component'
import { createElement } from 'preact'
import styled from 'styled-components'

const FLICKITY_CLASSNAME = 'carousel'
const MediaWrapper = styled.div`
  margin-bottom: 0.5rem;
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

const flickityOptions = {
  initialIndex: 0
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
  const { media } = props

  if (media.length === 0) return null

  if (media.length === 1) {
    return <MediaWrapper>{renderMedia(media[0])}</MediaWrapper>
  } else {
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
          {flickityIndex + 1}/{media.length}
        </FlickityCounter>
        <Flickity
          className={FLICKITY_CLASSNAME}
          elementType='div'
          flickityRef={ref => {
            flickityRef.current = ref
          }}
        >
          {media.map(media => (
            <FlickitySlide>{renderMedia(media)}</FlickitySlide>
          ))}
        </Flickity>
      </MediaWrapper>
    )
  }
}

export default MediaRenderer
