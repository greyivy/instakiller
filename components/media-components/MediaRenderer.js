import { h, Component } from 'preact';
import { 
  StatusImage, 
  StatusVideo, 
  StatusAudio, 
  StatusGif 
} from './StatusMedia'

const attTypeMap = {
  image: StatusImage,
  video: StatusVideo,
  gifv: StatusGif,
  audio: StatusAudio,
  unknown: null,
}

export default const MediaRenderer = (props) => {
  const { media } = props


  return (
    {
      media.map(att => {
        if(attTypeMap[att.type]){
          return createElement(attTypeMap[att.type], {media: media, key: media.id})
        } else { 
          return null 
        }
      })
    }
  )
}