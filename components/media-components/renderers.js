import { Component, Fragment, createElement, h, render } from 'preact'

import styled from 'styled-components'

// Center inner image vertically
const MediaImageWrapper = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

// Pretty blurred background
const MediaImageBackgroundBlur = styled.div`
  position: absolute;
  top: -16px;
  left: -16px;
  width: calc(100% + 32px);
  height: calc(100% + 32px);
  background: url(${props => props.src});
  background-size: cover;
  background-position: center;
  filter: blur(16px);
`

// TODO ensure alt/title works
const MediaImage = styled.div`
  background: url(${props => props.src});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;
`

const MediaVideo = styled.video`
  background: #000;
`

export const StatusImage = props => {
  return (
    <div>
      <MediaImageBackgroundBlur src={props.media.url} />
      <MediaImageWrapper>
        <MediaImage src={props.media.url} title={props.media.description} />
      </MediaImageWrapper>
    </div>
  )
}

export const StatusVideo = props => {
  return <MediaVideo src={props.media.url} controls />
}

export const StatusAudio = props => {
  return <audio src={props.media.url} controls />
}

// TODO test
export const StatusGif = props => {
  return (
    <MediaImageWrapper>
      <MediaImage src={props.media.url} title={props.media.description} />
    </MediaImageWrapper>
  )
}
