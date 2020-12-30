import RouterLink from './RouterLink'
import styled from 'styled-components'

const MentionInner = styled(RouterLink)`
  font-weight: 600;
  color: inherit;
  text-decoration: none;

  :hover {
    color: inherit;
    text-decoration: none;
  }
`

const Mention = props => (
  <MentionInner
    push
    href={`/user/${props.account.id}`}
    title={`${props.account.username}'s account`}
    style={props.style}
  >
    {props.children ? props.children : `@${props.account.username}`}
  </MentionInner>
)

const Hashtag = props => (
  <MentionInner
    push
    href={`/hashtag/${props.name}`}
    title={`${props.name} hashtag`}
    style={props.style}
  >
    {props.children ? props.children : `#${props.name}`}
  </MentionInner>
)

export { Mention, Hashtag }
