import styled from 'styled-components'
import { useContext } from 'preact/hooks'
import { usePreference } from '../../prefs'

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
  width: 100%;
  height: 100%;
`

const MediaAudioWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  audio {
    width: 80%;
  }
`

export const StatusImage = props => {
  const [enableBackgroundBlur] = usePreference('enableBackgroundBlur')

  return (
    <div>
      {enableBackgroundBlur && (
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
    <MediaAudioWrapper>
      <audio src={props.media.url} controls />
    </MediaAudioWrapper>
  )
}
