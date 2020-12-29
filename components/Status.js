import { Classes, Icon } from '@blueprintjs/core'

import Avatar from './Avatar'
import { Mention } from './Mention'
import RouterLink from './RouterLink'
import styled from 'styled-components'

const RebloggedByWrapper = styled.div`
  font-size: 1.2rem;
`

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

  font-size: 1.2rem;
`
const ContentWrapper = styled.div`
  width: 100%;
`

const Status = props => {
  const { account, secondaryAccount } = props

  return (
    <>
      {secondaryAccount && (
        <RebloggedByWrapper className={Classes.TEXT_MUTED}>
          <Icon
            icon='refresh'
            style={{ marginBottom: 3, marginRight: 6, verticalAlign: 'middle' }}
          />
          <Mention account={secondaryAccount} /> boosted
        </RebloggedByWrapper>
      )}
      <StatusWrapper style={props.style}>
        <StatusHeader>
          <Avatar account={account} secondaryAccount={secondaryAccount} />

          <Mention account={account} />
        </StatusHeader>
        <ContentWrapper>{props.children}</ContentWrapper>
      </StatusWrapper>
    </>
  )
}

export default Status
