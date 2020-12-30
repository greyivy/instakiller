import {
  Alignment,
  Button,
  Classes,
  Intent,
  Menu,
  Navbar,
  NonIdealState,
  PanelStack,
  Popover,
  Position
} from '@blueprintjs/core'
import { useEffect, useState } from 'preact/hooks'

import { Action } from 'history'
import Settings from './components/Settings'
import VirtualizedTimeline from './components/VirtualizedTimeline'
import history from 'history/browser'
import { match } from 'path-to-regexp'
import styled from 'styled-components'
import { usePreference } from './prefs'

const Wrapper = styled.div`
  padding-top: 50px;

  main {
    height: calc(100vh - 50px);
  }
  .bp3-panel-stack {
    height: 100%;

    .bp3-panel-stack-view {
      background: var(--bg);
    }
  }
`

const SlidingNavBar = styled(Navbar)`
  position: fixed;
  bottom: 0;
  transform: ${props => (props.visible ? 'translateY(50px);' : 'none')};
  transition: 0.5s all cubic-bezier(0.165, 0.84, 0.44, 1);
`

const routes = [
  {
    path: '/timeline/:type',
    component: VirtualizedTimeline
  },
  {
    path: '/user',
    component: VirtualizedTimeline,
    defaultParams: {
      type: 'self'
    }
  },
  {
    path: '/user/:userId',
    component: VirtualizedTimeline,
    defaultParams: {
      type: 'user'
    }
  },
  {
    path: '/hashtag/:name',
    component: VirtualizedTimeline,
    defaultParams: {
      type: 'hashtag'
    }
  },
  {
    path: '/settings',
    component: Settings
  },
  {
    path: '/',
    component: VirtualizedTimeline,
    defaultParams: {
      type: 'home'
    }
  }
]

// Determines if current browser location matches a specific route
const isMatch = path => match(path)(location.pathname)

function App (props) {
  const [accounts] = usePreference('accounts')
  const [currentAccount, setCurrentAccount] = useState(accounts[0])

  // Gets a panel (component and props) for a specific route
  const getRoutePanel = path => {
    const { path: routePath, component, defaultParams } = routes.find(route => {
      return match(route.path)(path)
    })

    const { params } = match(routePath)(path)

    return {
      component,
      props: {
        account: currentAccount,
        params: { ...defaultParams, ...params }
      }
    }
  }

  const [panels, setPanels] = useState([
    getRoutePanel(window.location.pathname) // Default panel on page load
  ])

  useEffect(() => {
    // Listen for changes to the current location
    const unlisten = history.listen(({ location, action }) => {
      const panel = getRoutePanel(location.pathname)

      // Manipulate panels based on history action (push, pop, replace)
      if (action === Action.Push) {
        // Push stacks a new panel on top
        setPanels([...panels, panel])
      } else if (action === Action.Pop) {
        // Pop closes the topmost panel
        if (panels.length > 1) {
          setPanels(panels.slice(0, panels.length - 1))
        } else {
          setPanels([panel])
        }
      } else if (action === Action.Replace) {
        // Replace replaces the current panel stack
        setPanels([panel])
      }

      console.log('router', action, location.pathname, location.state, panels)
    })

    return () => unlisten()
  }, [panels])

  useEffect(() => {
    if (!currentAccount && accounts.length > 0) {
      // If no account is selected and there is an account available, select it
      setCurrentAccount(accounts[0])
    } else if (accounts.length === 0) {
      // Otherwise, select no account
      setCurrentAccount(null)
    }
  }, [accounts.length, currentAccount])

  useEffect(() => {
    // Change all panel accounts when the selected account changes
    setPanels(
      panels.map(panel => ({
        ...panel,
        props: {
          ...panel.props,
          account: currentAccount
        }
      }))
    )
  }, [currentAccount])

  // Go home
  const home = () => {
    history.replace('/')
  }

  const isSubPage = panels.length > 1
  const hasAccount = !!currentAccount

  return (
    <Wrapper>
      <Navbar
        fixedToTop
        onClick={e => {
          const event = new window.Event('scrollTop')
          document.dispatchEvent(event)
        }}
      >
        <Navbar.Group align={Alignment.LEFT}>
          {isSubPage && (
            <>
              <Button
                className={Classes.MINIMAL}
                icon='arrow-left'
                text='Back'
                onClick={() => history.back()}
              />
              <Navbar.Divider />
            </>
          )}
          {!isSubPage && accounts.length > 0 && (
            <Popover
              content={
                <Menu>
                  {accounts.map(account => (
                    <Menu.Item
                      key={account.id}
                      onClick={() => setCurrentAccount(account)}
                      text={account.uri}
                      active={
                        currentAccount && currentAccount.id === account.id
                      }
                    />
                  ))}
                </Menu>
              }
              position={Position.BOTTOM_LEFT}
            >
              <Navbar.Heading>
                <Button minimal rightIcon='chevron-down'>
                  {currentAccount ? currentAccount.uri : 'Accounts'}
                </Button>
              </Navbar.Heading>
            </Popover>
          )}
        </Navbar.Group>
        {!isSubPage && hasAccount && (
          <Navbar.Group align={Alignment.RIGHT}>
            <Button
              minimal
              icon='send-message'
              title='Messages'
              onClick={() => history.replace('/user')}
            />
          </Navbar.Group>
        )}
      </Navbar>
      <main>
        <PanelStack
          onOpen={panel => {
            setPanels([panel, ...panels])
          }}
          onClose={() => {
            setPanels(panels.slice(1))
          }}
          renderActivePanelOnly={false}
          showPanelHeader={false}
          stack={panels}
        />
      </main>
      <SlidingNavBar visible={isSubPage}>
        <Navbar.Group align={null} style={{ justifyContent: 'space-evenly' }}>
          <Button
            minimal
            fill
            icon='home'
            title='Following'
            onClick={() => home()}
            intent={isMatch('/') ? 'primary' : ''}
          />
          <Button
            minimal
            fill
            icon='people'
            title='Local timeline'
            onClick={() => history.replace('/timeline/local')}
            intent={isMatch('/timeline/local') ? 'primary' : ''}
          />
          <Button
            minimal
            fill
            icon='globe-network'
            title='Federated timeline'
            onClick={() => history.replace('/timeline/federated')}
            intent={isMatch('/timeline/federated') ? 'primary' : ''}
          />
          <Button
            minimal
            fill
            icon='user'
            title='Profile'
            onClick={() => history.replace('/user')}
            intent={isMatch('/user') ? 'primary' : ''}
          />
          <Button
            minimal
            fill
            icon='settings'
            title='Settings'
            onClick={() => history.replace('/settings')}
            intent={isMatch('/settings') ? 'primary' : ''}
          />
        </Navbar.Group>
      </SlidingNavBar>
      )
    </Wrapper>
  )
}

export default App
