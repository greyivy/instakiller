import '/node_modules/flickity/dist/flickity.css'
import '../../assets/flickity-reset.css'

import { Component, createElement, h, render } from 'preact'
import { StatusAudio, StatusGif, StatusImage, StatusVideo } from './StatusMedia'

import Flickity from 'react-flickity-component'
import styled from 'styled-components'

const MediaWrapper = styled.div`
  width: 500px;
  height: 500px;
  max-width: 100%;
  margin: 0 auto;
  margin-bottom: 0.5rem;
  box-shadow: 0px 2.5px 2px -3px var(--shadowColor);
  & img,
  & video {
    max-width: 100%;
  }
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

const MediaRenderer = props => {
  const { media } = props

  if (media.length === 0) return null

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

  return (
    <MediaWrapper>
      {media.length === 1 ? (
        renderMedia(media[0])
      ) : (
        <Flickity
          className={'carousel'}
          elementType={'div'}
          options={flickityOptions}
        >
          {media.map(m => (
            <div style={{ width: 500, height: 500 }}>{renderMedia(m)}</div>
          ))}
        </Flickity>
      )}
    </MediaWrapper>
  )
}

export default MediaRenderer
