import { useContext, useEffect, useState } from 'preact/hooks'

import Avatar from './Avatar'
import HtmlRenderer from './HtmlRenderer'
import RouterLink from './RouterLink'
import { usePreference } from '../prefs'
import { MastodonInstance } from '../mastodon'
import gradient from 'random-gradient'
import styled from 'styled-components'

const Header = styled.header`
  height: auto;
  max-width: var(--containerWidth);
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 0 auto;
  box-shadow: 0px 2.5px 2px -3px var(--shadowColor);
  overflow: hidden;
`

const HeaderImage = styled.div`
  width: var(--containerWidth);
  height: 200px;
  background: ${props => 
    { if(props.bgImage == "https://mastodon.online/headers/original/missing.png"){
      return props.bgGradient
    } else {
      return `url(${props.bgImage})`
    }}
  };
  background-size: cover;
  background-position: center;
  background-repeat: none;
  margin: 0 auto;
`

const Username = styled.h2`
  margin: 0;
  margin-bottom: 1.25rem;
  font-size: 1.6rem;
`

const DisplayName = styled.h5`
  font-size: 1.2rem;
  margin: 0;
`

const UserData = styled.div`
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
`

const Note = styled.div`
  max-width: 400px;
  text-align: right;
`

const UserCounts = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  & > p {
    margin-left: 0.5rem;
    font-size: 1rem;
    & > span {
      font-weight: bolder;
    }
  }
`

const AvatarWrapper = styled.div`
  display: flex; 
  flex-direction: column;
  align-items: center;
  & > .settings {
    text-decoration: none;
    cursor: pointer;
    transform: translateY(-3px);
  }
  & > .settings {
    margin-top:.5rem;
    border: 1px solid gray;
    width: max-content;
    padding: .15rem .5rem;
    border-radius: 5px;
  }
`

const UserHeader = props => {
  if (!props.account) return null

  const [displayHeaderImage] = usePreference('displayHeaderImage')

  const {
    avatar,
    headerStatic,
    username,
    followersCount,
    followingCount,
    statusesCount,
    displayName,
    note,
    bot,
    url,
    id
  } = props.account

  const gradientVar = gradient(id)

  return (
    <div>
      { displayHeaderImage && <HeaderImage bgImage={headerStatic} bgGradient={gradientVar}/> }
      <Header>
        <AvatarWrapper>
          <Avatar size={125} account={props.account} />
          {props.type === 'self'  && 
            <RouterLink href="/settings" className="settings">Settings</RouterLink>
          }
        </AvatarWrapper>
        <UserData>
          <Username>{'@' + username}</Username>
          <UserCounts>
            <p>
              {statusesCount} <span>posts</span>
            </p>
            <p>
              {followersCount} <span>followers</span>
            </p>
            <p>
              {followingCount} <span>following</span>
            </p>
          </UserCounts>
          <Note>
            <DisplayName>{displayName}</DisplayName>
            <HtmlRenderer content={note} />
          </Note>
        </UserData>
      </Header>
    </div>
  )
}

export default UserHeader
