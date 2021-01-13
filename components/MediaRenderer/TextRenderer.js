import styled, { css } from 'styled-components'
import { useRef, useState } from 'preact/hooks'

import HtmlRenderer from '../HtmlRenderer'
import LRU from 'lru-cache'
import { Textfit } from 'react-textfit'
import randomGradient from 'random-gradient'

const MIN_SIZE = 24
const MAX_SIZE = 48

const CLASS_TEXT_FIT_WRAPPER = 'text-fit-wrapper'

const cache = new LRU({
  max: 512
})

window.addEventListener('resize', () => cache.reset())

const textFitWrapperStyle = css`
  height: 100%;
  width: 100%;
  text-align: center;
  word-wrap: break-word;
  overflow: hidden;
  user-select: none;

  // background: ${props => (props.overflow ? 'red' : 'green')}; // DEBUG

  display: ${props => (props.overflow ? 'block' : 'flex')};

  // If flex...
  // HACK: ensures text is cut off cleanly when text is too long
  column-width: 100vw;
  column-gap: 100vw;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  > div {
    max-height: 100%;
  }

  * {
    color: inherit !important;
  }
`

const TextFitWrapper = styled(Textfit)`
  visibility: hidden;

  ${textFitWrapperStyle}
`
const CachedTextFitWrapper = styled.div`
  color: #fff;
  text-shadow: 0px 0px 4px #000;

  ${textFitWrapperStyle}
`

const TextFitContainer = styled.div`
  padding: 50px;
`

const TextRenderer = props => {
  const { status } = props

  const textRendererRef = useRef()

  const [display, setDisplay] = useState(cache.get(status.id))

  if (display) {
    const { size, overflow, gradient } = display

    return (
      <TextFitContainer
        style={{
          background: gradient
        }}
        ref={textRendererRef}
      >
        <CachedTextFitWrapper
          overflow={overflow}
          style={{ fontSize: `${size}px` }}
          className={CLASS_TEXT_FIT_WRAPPER}
        >
          <HtmlRenderer content={status.content} context={status} />
        </CachedTextFitWrapper>
      </TextFitContainer>
    )
  } else {
    return (
      <TextFitContainer ref={textRendererRef}>
        <TextFitWrapper
          mode='multi'
          min={MIN_SIZE}
          max={MAX_SIZE}
          className={CLASS_TEXT_FIT_WRAPPER}
          onReady={size => {
            // Calculating all of this is expensive so cache it for later
            if (!cache.has(status.id)) {
              const {
                scrollWidth: innerWidth,
                scrollHeight: innerHeight
              } = textRendererRef.current.getElementsByClassName(
                CLASS_TEXT_FIT_WRAPPER
              )[0]
              const {
                clientWidth: containerWidth,
                clientHeight: containerHeight
              } = textRendererRef.current.firstChild

              const overflow =
                innerWidth > containerWidth + MIN_SIZE / 2 ||
                innerHeight > containerHeight + MIN_SIZE / 2

              const gradient = randomGradient(status.id)

              const display = {
                size: size - 1,
                overflow,
                gradient
              }
              setDisplay(display)
              cache.set(status.id, display)
            }
          }}
        >
          <HtmlRenderer content={status.content} context={status} />
        </TextFitWrapper>
      </TextFitContainer>
    )
  }
}
export default TextRenderer
