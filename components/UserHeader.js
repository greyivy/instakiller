import { h, Component } from 'preact'
import styled from 'styled-components'

const Header = styled.header`
  width: 100%;
  height: auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 4rem;
`

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
`

const UserHeader = props => {
  return(
    <Header>

    </Header>
  )
}

export default UserHeader
