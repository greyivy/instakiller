import { h, Component } from 'preact'
import styled from 'styled-components'

const StatusWrapper = styled.div`
  width: 100%;
  height: auto;
  margin: 8px;
  margin-bottom: 2rem;
  & > hr {
    margin: 1rem 0;
  }
`
const StatusHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin: 0;
  margin-bottom: 1rem;
  & > a {
    font-size: 2rem;
    color: black;
    margin: 0;
  }
`

const Avatar = styled.div`
  width: 75px;
  height: 75px;
  border-radius: 50%;
  overflow: hidden;
  & > img {
    width: 100%;
    height: auto;  
  }
`

const Status = (props) => {
  const { account } = props
  const { username, url, avatar, bot,  } = account
  return (
    <StatusWrapper>
      <StatusHeader>
        <Avatar>
          <img src={avatar} alt={username + 's avatar'}/>
        </Avatar>
        <a href={url}>{username}</a>
      </StatusHeader>
      <div>
        {props.children}
      </div>
      <hr/>
    </StatusWrapper>
  )
}

export default Status