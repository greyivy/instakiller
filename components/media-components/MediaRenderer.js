import { Component, createElement, h, render } from 'preact'
import { StatusAudio, StatusGif, StatusImage, StatusVideo } from './StatusMedia'

import styled from 'styled-components'

const attTypeMap = {
  image: StatusImage,
  video: StatusVideo,
  gifv: StatusGif,
  audio: StatusAudio,
  unknown: null
}

const MediaRenderer = props => {
  const { media } = props

  return media.map(att => {
    if (attTypeMap[att.type]) {
      return createElement(attTypeMap[att.type], {
        media: att,
        key: att.id
      })
    } else {
      return null
    }
  })
}

export default MediaRenderer
