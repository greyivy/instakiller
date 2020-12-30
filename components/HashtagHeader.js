import { Classes } from '@blueprintjs/core'
import { Hashtag } from './Mention'
import styled from 'styled-components'

const HashtagHeaderWrapper = styled.div`
  padding: 1rem 0 0;
`

const HashtagHeader = props => (
  <HashtagHeaderWrapper className={Classes.TEXT_LARGE}>
    Viewing <Hashtag name={props.name} />
  </HashtagHeaderWrapper>
)

export default HashtagHeader
