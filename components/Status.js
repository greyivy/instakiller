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
  box-shadow: 0px 2.5px 2px -3px var(--shadowColor);

  a {
    font-size: 1.2rem;
    color: black;
    margin: 0;
  }
`

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  position: relative;

  a {
    > img {
      width: 100%;
      height: auto;
      border-radius: 50%;
    }

    :nth-child(2) {
      position: absolute;
      top: 28px;
      left: 32px;

      > img {
        width: 25px;
        height: auto;
        border: 2px solid #fff;
      }
    }
  }
`

const ContentWrapper = styled.div`
  width: 100%;
`

const Status = props => {
  const { account, rebloggedAccount } = props

  const { id, username, url, avatarStatic, bot } = account

  if (rebloggedAccount) {
    // Reblog
    return (
      <StatusWrapper style={props.style}>
        <StatusHeader>
          <Avatar>
            <a onClick={() => history.push(`/user/${id}`)}>
              <img src={avatarStatic} alt={username + 's avatar'} />
            </a>
            <a onClick={() => history.push(`/user/${rebloggedAccount.id}`)}>
              <img
                src={avatarStatic}
                alt={rebloggedAccount.username + 's avatar'}
              />
            </a>
          </Avatar>
          <div>
            <a onClick={() => history.push(`/user/${id}`)}>{'@' + username}</a>
            <div>
              via{' '}
              <a onClick={() => history.push(`/user/${rebloggedAccount.id}`)}>
                {'@' + rebloggedAccount.username}
              </a>
            </div>
          </div>
        </StatusHeader>
        <ContentWrapper>{props.children}</ContentWrapper>
      </StatusWrapper>
    )
  } else {
    return (
      <StatusWrapper style={props.style}>
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
}

export default Status
