import { Preferences } from '../../prefs'
import styled from 'styled-components'
import { useContext } from 'preact/hooks'

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

const AudioWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const StatusImage = props => {
  const {
    preferences: { disableBackgroundBlur }
  } = useContext(Preferences)

  return (
    <div>
      {!disableBackgroundBlur && (
        <MediaImageBackgroundBlur src={props.media.url} />
      )}
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
  return (
    <AudioWrapper>
      <audio src={props.media.url} controls />
    </AudioWrapper>
  )
}

// TODO test
export const StatusGif = props => {
  return (
    <MediaImageWrapper>
      <MediaImage src={props.media.url} title={props.media.description} />
    </MediaImageWrapper>
  )
}
