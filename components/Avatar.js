import { Classes } from '@blueprintjs/core'
import RouterLink from './RouterLink'
import styled from 'styled-components'
import { useState } from 'preact/hooks'

const AvatarPrimary = styled(RouterLink)`
  display: inline-block;
  background: url(${props => props.src});
  background-size: contain;
  border-radius: 50%;

  min-width: ${props => props.size};
  min-height: ${props => props.size};
  position: relative;
`

const AvatarSecondary = styled.div`
  background: url(${props => props.src});
  background-size: contain;
  border-radius: 50%;
  position: absolute;

  top: calc(${props => props.size}* 0.56);
  left: calc(${props => props.size} * 0.64);
  min-width: calc(${props => props.size} / 2);
  min-height: calc(${props => props.size} / 2);
  border: 2px solid var(--white);
`

const DEFAULT_SIZE = '48px'
const Avatar = props => {
  const { account, secondaryAccount, size, style } = props

  const [loaded, setLoaded] = useState(false)
  const [secondaryLoaded, setSecondaryLoaded] = useState(false)

  // Determine CSS unit for the size prop
  const actualSize = size
    ? typeof size === 'number'
      ? `${size}px`
      : size
    : DEFAULT_SIZE

  // Wait for avatars to load flly before displaying them
  const img = new window.Image()
  img.onload = () => setLoaded(true)
  img.src = account.avatarStatic

  if (secondaryAccount) {
    const secondaryImg = new window.Image()
    secondaryImg.onload = () => setSecondaryLoaded(true)
    secondaryImg.src = secondaryAccount.avatarStatic
  }

  const allLoaded = loaded && (!secondaryAccount || secondaryLoaded)

  return (
    <AvatarPrimary
      push
      href={`/user/${account.id}`}
      src={allLoaded ? account.avatarStatic : ''}
      title={`${account.username}'s avatar`}
      className={allLoaded ? '' : Classes.SKELETON}
      size={actualSize}
      style={style}
    >
      {secondaryAccount && allLoaded && (
        <AvatarSecondary
          src={secondaryAccount.avatarStatic}
          title={`${secondaryAccount.username}'s avatar`}
          size={actualSize}
        />
      )}
    </AvatarPrimary>
  )
}

export default Avatar
