import { useContext, useEffect, useState } from 'preact/hooks'

import Avatar from './Avatar'
import HtmlRenderer from './HtmlRenderer'
import { MastodonInstance } from '../mastodon'
import styled from 'styled-components'

const Header = styled.header`
  width: 100%;
  height: 250px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 0 auto;
  box-shadow: 0px 2.5px 2px -3px var(--shadowColor);
  overflow: hidden;
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

const UserHeader = props => {
  const { masto } = useContext(MastodonInstance)

  useEffect(() => {
    load(props.userId)
  }, [props.userId])

  const [user, setUser] = useState(null)

  const load = async userId => {
    const account = await masto.fetchAccount(userId)
    setUser(account)
  }

  if (!user) return <div style='height:250px'></div>

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
    url
  } = user

  //if props.self show settings button

  return (
    <div>
      <Header>
        <Avatar size={125} account={user}></Avatar>
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
