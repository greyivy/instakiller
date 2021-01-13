import RouterLink from '../RouterLink'
import missing from './missing.png'
import styled, { css } from 'styled-components'

const avatarPrimaryStyle = css`
  display: inline-block;
  background: url(${props => props.src});
  background-size: contain;
  border-radius: 50%;

  width: ${props => props.size};
  height: ${props => props.size};
  position: relative;
`

const AvatarPrimary = styled.div`
  ${avatarPrimaryStyle}
`

const AvatarPrimaryLink = styled(RouterLink)`
  ${avatarPrimaryStyle}
`

const AvatarSecondary = styled.div`
  background: url(${props => props.src});
  background-size: contain;
  border-radius: 50%;
  position: absolute;

  top: calc(${props => props.size}* 0.56);
  left: calc(${props => props.size} * 0.64);
  width: calc(${props => props.size} / 2);
  height: calc(${props => props.size} / 2);
  border: 2px solid var(--white);
`

const DEFAULT_SIZE = '42px'

const Avatar = props => {
  const { account, secondaryAccount, size, style, link } = props

  // Determine CSS unit for the size prop
  const actualSize = size
    ? typeof size === 'number'
      ? `${size}px`
      : size
    : DEFAULT_SIZE

  if (!account) {
    return (
      <AvatarPrimary
        src={missing}
        title='No account'
        size={actualSize}
        style={style}
      ></AvatarPrimary>
    )
  }

  const avatarProps = {
    src: account.avatarStatic,
    title: `${account.username}'s avatar`,
    size: actualSize,
    style
  }

  const secondaryAvatar = secondaryAccount && (
    <AvatarSecondary
      src={secondaryAccount.avatarStatic}
      title={`${secondaryAccount.username}'s avatar`}
      size={actualSize}
    />
  )

  if (link) {
    return (
      <AvatarPrimaryLink
        {...avatarProps}
        push
        href={`/user/${account.id}`}
        src={account.avatarStatic}
      >
        {secondaryAvatar}
      </AvatarPrimaryLink>
    )
  } else {
    return <AvatarPrimary {...avatarProps}>{secondaryAvatar}</AvatarPrimary>
  }
}

export default Avatar
