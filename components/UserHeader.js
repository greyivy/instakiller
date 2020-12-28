import { useContext, useEffect, useState } from 'preact/hooks'

import { MastodonInstance } from '../mastodon'
import styled from 'styled-components'

import HtmlRenderer from './HtmlRenderer'

const Header = styled.header`
  width: 100%;
  height: 200px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
`

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  & img {
    width: 100%;
  }
`

const UserData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
`

const UserCounts = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  & > p {
    margin-left:.5rem;
    font-size:1rem; 
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

  if (!user) return <div style="height:200px"></div>

  // console.log(user)

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
        <Avatar>
          <img src={avatar} alt={username + "'s avatar"} />
        </Avatar>
        <UserData>
          <h1>{username}</h1>
          <UserCounts>
            <p>{statusesCount} <span>posts</span></p>
            <p>{followersCount} <span>followers</span></p>
            <p>{followingCount} <span>following</span></p>
          </UserCounts>
          <div>
          <HtmlRenderer content={note}/>
          </div>
        </UserData>
      </Header>
      
    </div>
  )
}

export default UserHeader
