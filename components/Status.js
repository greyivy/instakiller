import { Component, h } from 'preact'

import history from 'history/browser'
import styled from 'styled-components'

const StatusWrapper = styled.div`
  width: 100%;
  height: auto;
  margin: 8px auto;
  margin-bottom: 1rem;
  background: var(--white);
  border-radius: 5px;
  box-shadow: var(--shadow);
  & > hr {
    margin: 1rem 0;
  }
`
const StatusHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  margin: 0;
  margin-bottom: 0.5rem;
  box-shadow: 0px 2.5px 2px -3px var(--shadowColor);
  & > a {
    font-size: 1.2rem;
    color: black;
    margin: 0;
  }
`

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  & img {
    width: 100%;
    height: auto;
  }
`

const ContentWrapper = styled.div`
  width: 100%;
  padding: 0.75rem;
`

const Status = props => {
  const { account } = props
  const { id, username, url, avatarStatic, bot } = account
  return (
    <StatusWrapper>
      <StatusHeader>
        <Avatar>
          <a onClick={() => history.push(`/user/${id}`)}>
            <img src={avatarStatic} alt={username + 's avatar'} />
          </a>
        </Avatar>
        <a onClick={() => history.push(`/user/${id}`)}>{'@' + username}</a>
      </StatusHeader>
      <ContentWrapper>{props.children}</ContentWrapper>
    </StatusWrapper>
  )
}

export default Status
