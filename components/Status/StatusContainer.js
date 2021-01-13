import { Button, Classes, Icon, Popover, Position } from '@blueprintjs/core'

import Avatar from '../Avatar'
import { Mention } from '../Mention'
import styled from 'styled-components'

const StatusCard = styled.div`
  width: 100%;
  height: auto;
  background: var(--white);
  border-radius: 5px;
`

const StatusHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  box-shadow: 0px 2.5px 2px -3px var(--shadowColor);
`

const CaptionWrapper = styled.div`
  width: 100%;
`

const BoostWrapper = styled.div`
  padding-bottom: 0.5rem;
  @media (max-width: 800px) {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
`

const BoostIcon = styled(Icon)`
  margin-bottom: 3px;
  margin-right: 6px;
  vertical-align: middle;
`

const StatusContainer = props => {
  const { account, secondaryAccount, menu } = props

  return (
    <>
      {secondaryAccount && (
        <BoostWrapper className={`${Classes.TEXT_MUTED} ${Classes.TEXT_LARGE}`}>
          <BoostIcon icon='refresh' title='Boost' />
          <Mention account={secondaryAccount} /> boosted
        </BoostWrapper>
      )}
      <StatusCard style={props.style}>
        <StatusHeader className={Classes.TEXT_LARGE}>
          <Avatar
            link
            account={account}
            secondaryAccount={secondaryAccount}
            style={{ marginRight: 8 }}
          />
          <Mention account={account} />
          <div style={{ flex: 1 }} /> {/* fill space */}
          <Popover content={menu} position={Position.BOTTOM_RIGHT}>
            <Button minimal icon='more' title='More options' />
          </Popover>
        </StatusHeader>

        <CaptionWrapper>{props.children}</CaptionWrapper>
      </StatusCard>
    </>
  )
}

export default StatusContainer
