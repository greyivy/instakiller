import HtmlRenderer from '../HtmlRenderer'
import { Textfit } from 'react-textfit'
import gradient from 'random-gradient'
import styled from 'styled-components'
import { useState } from 'preact/hooks'

const MIN_SIZE = 18
const MAX_SIZE = 56

const TextFitWrapper = styled(Textfit)`
  padding: 4rem;
  display: flex;
  align-items: center;
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
`
const TextRenderer = props => {
  const { status } = props

  const [overflow, setOverflow] = useState(false)

  return (
    <TextFitWrapper
      mode='multi'
      min={MIN_SIZE}
      max={MAX_SIZE}
      style={{ background: gradient(status.id) }}
      onReady={size => {
        // Determine if the text is overflowing
        if (size <= MIN_SIZE) {
          setOverflow(true)
        } else {
          setOverflow(false)
        }
      }}
      overflow={overflow}
    >
      <HtmlRenderer content={status.content} context={status} />
    </TextFitWrapper>
  )
}
export default TextRenderer
