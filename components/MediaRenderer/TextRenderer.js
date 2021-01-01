import HtmlRenderer from '../HtmlRenderer'
import LRU from 'lru-cache'
import { Textfit } from 'react-textfit'
import { default as randomGradient } from 'random-gradient'
import styled from 'styled-components'
import { useState } from 'preact/hooks'

const MIN_SIZE = 18
const MAX_SIZE = 56

const cache = new LRU({
  max: 512
})

const CLASS_TEXT_RENDERER_INNER = 'text-renderer'

const TextRendererWrapper = styled.div`
  padding: 4rem;
  display: relative;

  .${CLASS_TEXT_RENDERER_INNER} {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    text-shadow: 0px 0px 4px #000;

    > div {
      max-height: 100%;
      mask-image: ${props =>
        props.overflow // If the text is overflowing, fade it out
          ? `linear-gradient(to bottom, rgba(0, 0, 0, 1) 84%, rgba(0, 0, 0, 0));`
          : 'none'};
    }

    * {
      color: inherit !important;
    }
  }
`

const TextRenderer = props => {
  const { status } = props

  const cached = cache.get(status.id)

  const [overflow, setOverflow] = useState(cached ? cached.overflow : false)

  let gradient = null

  let textRendererInner = null

  if (cached) {
    gradient = cached.gradient

    textRendererInner = (
      <div
        className={CLASS_TEXT_RENDERER_INNER}
        style={{ fontSize: `${cached.size}px` }}
      >
        <HtmlRenderer content={status.content} context={status} />
      </div>
    )
  } else {
    gradient = randomGradient(status.id)

    textRendererInner = (
      <Textfit
        className={CLASS_TEXT_RENDERER_INNER}
        mode='multi'
        min={MIN_SIZE}
        max={MAX_SIZE}
        onReady={size => {
          // Determine if the text is overflowing
          // This occurs when the minimum font-size is reached
          let overflow = size <= MIN_SIZE
          setOverflow(overflow)

          // Calculating all of this is expensive so cache it for later
          cache.set(status.id, { size, overflow, gradient })
        }}
        overflow={overflow}
      >
        <HtmlRenderer content={status.content} context={status} />
      </Textfit>
    )
  }

  return (
    <TextRendererWrapper style={{ background: gradient }} overflow={overflow}>
      {textRendererInner}
    </TextRendererWrapper>
  )
}
export default TextRenderer
