import {
  Alignment,
  Button,
  Menu,
  Navbar,
  PanelStack,
  Popover,
  Position
} from '@blueprintjs/core'
import { Component, Fragment, h, render } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'

import { Action } from 'history'
import { MastodonInstance } from './mastodon'
import VirtualizedTimeline from './components/VirtualizedTimeline'
import history from 'history/browser'
import { match } from 'path-to-regexp'
import styled from 'styled-components'

const Wrapper = styled.div`
  padding-top: 50px;

  .bp3-panel-stack {
    height: calc(100vh - ${props => (props.isSubPage ? 50 : 100)}px);
  }
`

const routes = [
  {
    path: '/timeline/:type',
    component: VirtualizedTimeline
  },
  {
    path: '/user/:userId?',
    component: VirtualizedTimeline,
    props: {
      type: 'user'
    }
  },
  {
    path: '/',
    component: VirtualizedTimeline,
    props: {
      type: 'home'
    }
  }
]

const getRoutePanel = path => {
  const { path: routePath, component, props } = routes.find(route => {
    return match(route.path)(path)
  })

  const { params } = match(routePath)(path)

  return { component, props: { ...props, ...params } }
}

const isMatch = path => match(path)(location.pathname)

function App (props) {
  const [panels, setPanels] = useState([
    getRoutePanel(window.location.pathname)
  ])

  useEffect(() => {
    // Listen for changes to the current location
    const unlisten = history.listen(({ location, action }) => {
      const panel = getRoutePanel(location.pathname)

      if (action === Action.Push) {
        setPanels([...panels, panel])
      } else if (action === Action.Pop) {
        if (panels.length > 1) {
          setPanels(panels.slice(0, panels.length - 1))
        } else {
          setPanels([panel])
        }
      } else if (action === Action.Replace) {
        setPanels([panel])
      }

      console.log('router', action, location.pathname, location.state, panels)
    })

    return () => unlisten()
  }, [panels])

  const home = () => {
    history.replace('/')
  }

  const { user } = useContext(MastodonInstance)

  const isSubPage = panels.length > 1

  return (
    <Wrapper isSubPage={isSubPage}>
      <Navbar fixedToTop>
        <Navbar.Group align={Alignment.LEFT}>
          {isSubPage && (
            <>
              <Button
                className='bp3-minimal'
                icon='arrow-left'
                text='Back'
                onClick={() => history.back()}
              />
              <Navbar.Divider />
            </>
          )}
          {!isSubPage && (
            <Popover
              content={
                <Menu>
                  <Menu.Item onClick={() => {}} text={user.username} active />
                </Menu>
              }
              position={Position.BOTTOM_LEFT}
            >
              <Navbar.Heading>
                <Button minimal rightIcon='chevron-down'>
                  {user.username}
                </Button>
              </Navbar.Heading>
            </Popover>
          )}
        </Navbar.Group>
        {!isSubPage && (
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

      {!isSubPage && (
        <Navbar style={{ position: 'fixed', bottom: 0 }}>
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
              intent={isMatch('/user/:userId') ? 'primary' : ''}
            />
          </Navbar.Group>
        </Navbar>
      )}
    </Wrapper>
  )
}

export default App
