import {
  Button,
  Classes,
  Icon,
  Menu,
  Popover,
  Position
} from '@blueprintjs/core'

import Avatar from '../Avatar'
import { Mention } from '../Mention'
import styled from 'styled-components'

const StatusCard = styled.div`
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
`

const CaptionWrapper = styled.div`
  width: 100%;
`

const BoostIcon = styled(Icon)`
  margin-bottom: 3px;
  margin-right: 6px;
  vertical-align: middle;
`

const StatusContainer = props => {
  const { account, secondaryAccount } = props

  return (
    <>
      {secondaryAccount && (
        <div className={`${Classes.TEXT_MUTED} ${Classes.TEXT_LARGE}`}>
          <BoostIcon icon='refresh' title='Boost' />
          <Mention account={secondaryAccount} /> boosted
        </div>
      )}
      <StatusCard style={props.style}>
        <StatusHeader className={Classes.TEXT_LARGE}>
          <Avatar
            account={account}
            secondaryAccount={secondaryAccount}
            style={{ marginRight: 8 }}
          />

          <Mention account={account} />

          <div style={{ flex: 1 }} /> {/* fill space */}

          <Popover
            content={
              <Menu>
                <Menu.Item text='Test' />
              </Menu>
            }
            position={Position.BOTTOM_RIGHT}
          >
            <Button minimal icon='more' title='More options' />
          </Popover>
        </StatusHeader>

        <CaptionWrapper>{props.children}</CaptionWrapper>
      </StatusCard>
    </>
  )
}

export default StatusContainer
