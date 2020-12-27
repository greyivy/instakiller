import { h, Component, createElement, render } from 'preact';
import styled from 'styled-components'
import { 
  StatusImage, 
  StatusVideo, 
  StatusAudio, 
  StatusGif 
} from './StatusMedia'

const MediaWrapper = styled.div`
  max-width:100%;
  margin: 0 auto;
  margin-bottom: .5rem;
  box-shadow: 0px 2.5px 2px -3px var(--shadowColor);
  & > img, & > video {
    max-width: 100%;
  }
`

const attTypeMap = {
  image: StatusImage,
  video: StatusVideo,
  gifv: StatusGif,
  audio: StatusAudio,
  unknown: null,
}

const MediaRenderer = props => {
  const { media } = props


  return (
    <MediaWrapper>
    {
      media.map(att => {
        if(attTypeMap[att.type]){
          return createElement(attTypeMap[att.type], {media: att, key: att.id})
        } else { 
          return null 
        }
      })
    }
    </MediaWrapper>
  )
}

export default MediaRenderer