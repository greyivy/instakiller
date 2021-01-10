import styled, { css } from 'styled-components'
import { useEffect, useRef, useState } from 'preact/hooks'

import HtmlRenderer from '../HtmlRenderer'
import LRU from 'lru-cache'
import { Textfit } from 'react-textfit'
import { default as randomGradient } from 'random-gradient'

const MIN_SIZE = 24
const MAX_SIZE = 56

const CLASS_TEXT_FIT_WRAPPER = 'text-fit-wrapper'

const cache = new LRU({
  max: 512
})

window.addEventListener('resize', () => cache.reset())

const textFitWrapperStyle = css`
  height: 100%;
  width: 100%;
  color: #fff;
  text-shadow: 0px 0px 4px #000;
  overflow: hidden;
  // HACK: ensures text is cut off cleanly when text is too long
  column-width: 100vw;
  column-gap: 100vw;
  align-items: ${props => (props.overflow ? 'inherit' : 'center')};
  display: ${props => (props.overflow ? 'box' : 'flex')};
  word-wrap: break-word;

  > div {
    max-height: 100%;
  }

  * {
    color: inherit !important;
  }
`

const TextFitWrapper = styled(Textfit)`
  ${textFitWrapperStyle}
`
const CachedTextFitWrapper = styled.div`
  ${textFitWrapperStyle}
`

const TextFitContainer = styled.div`
  padding: 4rem;
`

const TextRenderer = props => {
  const { status } = props

  const textRendererRef = useRef()

  const cached = cache.get(status.id)

  const [overflow, setOverflow] = useState(cached ? cached.overflow : false)

  const { scrollWidth, scrollHeight } = textRendererRef.current
    ? textRendererRef.current.getElementsByClassName(CLASS_TEXT_FIT_WRAPPER)[0]
    : {}
  const { clientWidth, clientHeight } = textRendererRef.current
    ? textRendererRef.current.firstChild
    : {}

  useEffect(() => {
    if (!scrollWidth || !scrollHeight) return

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

    if (innerWidth > containerWidth || innerHeight > containerHeight) {
      // Overflow!
      cache.set(status.id, { ...cache.get(status.id), overflow: true })
      setOverflow(true)
    }
  }, [scrollWidth, scrollHeight, clientWidth, clientHeight])

  let gradient = null

  if (cached) {
    gradient = cached.gradient

    return (
      <TextFitContainer
        style={{
          background: gradient
        }}
        ref={textRendererRef}
      >
        <CachedTextFitWrapper
          overflow={overflow}
          style={{ fontSize: `${cached.size}px` }}
          className={CLASS_TEXT_FIT_WRAPPER}
        >
          <HtmlRenderer content={status.content} context={status} />
        </CachedTextFitWrapper>
      </TextFitContainer>
    )
  } else {
    gradient = randomGradient(status.id)

    return (
      <TextFitContainer
        style={{
          background: gradient
        }}
        ref={textRendererRef}
      >
        <TextFitWrapper
          mode='multi'
          min={MIN_SIZE}
          max={MAX_SIZE}
          className={CLASS_TEXT_FIT_WRAPPER}
          onReady={size => {
            // Calculating all of this is expensive so cache it for later
            cache.set(status.id, { size, overflow: false, gradient })
          }}
          overflow={overflow}
        >
          <HtmlRenderer content={status.content} context={status} />
        </TextFitWrapper>
      </TextFitContainer>
    )
  }
}
export default TextRenderer
