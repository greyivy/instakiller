import { Component, Fragment, createElement, h, render } from 'preact'

import styled from 'styled-components'

// Ensure media is always in 1:1 aspect ratio
const MediaWrapper = styled.div`
  max-width: 100%;
  padding-top: 100%;
  position: relative;
  overflow: hidden;
  background: ${props => props.background};

  & > video {
    max-width: 100%;
    max-height: 100%;
  }
`

// Center inner media vertically
const MediaInner = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

// Pretty blurred background
const MediaImageBackground = styled.div`
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

export const StatusImage = props => {
  return (
    <MediaWrapper>
      <MediaImageBackground src={props.media.url} />
      <MediaInner>
        <MediaImage src={props.media.url} title={props.media.description} />
      </MediaInner>
    </MediaWrapper>
  )
}

export const StatusVideo = props => {
  return (
    <MediaWrapper background='#000'>
      <video src={props.media.url} controls />
    </MediaWrapper>
  )
}

export const StatusAudio = props => {
  return <audio src={props.media.url} controls />
}

export const StatusGif = props => {
  return <img src={props.media.url} alt={props.media.description} />
}
