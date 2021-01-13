import RouterLink from './RouterLink'

const Mention = props => (
  <RouterLink
    className='link-plain'
    push
    href={`/user/${props.account.id}`}
    title={`${props.account.username}'s account`}
    style={props.style}
  >
    {props.children ? props.children : `@${props.account.username}`}
  </RouterLink>
)

const Hashtag = props => (
  <RouterLink
    className='link-plain'
    push
    href={`/hashtag/${props.name}`}
    title={`${props.name} hashtag`}
    style={props.style}
  >
    {props.children ? props.children : `#${props.name}`}
  </RouterLink>
)

export { Mention, Hashtag }
