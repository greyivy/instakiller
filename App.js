import {
  Alignment,
  Button,
  Callout,
  Intent,
  Navbar,
  PanelStack,
  Spinner
} from '@blueprintjs/core'
import { Component, Fragment, h, render } from 'preact'
import { MastodonInstance, MastodonInstanceWrapper } from './mastodon'
import { useContext, useEffect, useMemo, useState } from 'preact/hooks'

import { Action } from 'history'
import Timeline from './components/Timeline'
import history from 'history/browser'
import { match } from 'path-to-regexp'
import styled from 'styled-components'

// const TestComponent = (props = <div>test</div>)

const routes = [
  {
    path: '/timeline/:type',
    component: Timeline
  },
  {
    path: '/user/:userId?',
    component: Timeline,
    props: {
      type: 'user'
    }
  },
  {
    path: '/',
    component: Timeline,
    props: {
      type: 'home'
    }
  }
]

const Wrapper = styled.div`
  .bp3-panel-stack {
    height: calc(100vh - 50px);
  }
`

const getRoutePanel = path => {
  const { path: routePath, component, props } = routes.find(route => {
    return match(route.path)(path)
  })

  const { params } = match(routePath)(path)

  return { component, props: { ...props, ...params } }
}

function App (props) {
  const [panels, setPanels] = useState([
    getRoutePanel(window.location.pathname)
  ])

  useEffect(() => {
    // Listen for changes to the current location.
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

  return (
    <Wrapper>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading onClick={() => home()}>Mastogram</Navbar.Heading>
          <Navbar.Divider />
          {panels.length > 1 && (
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
          <Button
            className='bp3-minimal'
            icon='home'
            text='Home'
            onClick={() => home()}
          />
          <Button
            className='bp3-minimal'
            icon='people'
            text='Local'
            onClick={() => history.replace('/timeline/local')}
          />
          <Button
            className='bp3-minimal'
            icon='globe-network'
            text='Federated'
            onClick={() => history.replace('/timeline/federated')}
          />

          <Button
            className='bp3-minimal'
            icon='user'
            text={user.username}
            onClick={() => history.replace('/user')}
          />
        </Navbar.Group>
      </Navbar>

      <PanelStack
        onOpen={panel => {
          setPanels([panel, ...panels])
        }}
        onClose={() => {
          setPanels(panels.slice(1))
        }}
        renderActivePanelOnly
        showPanelHeader={false}
        stack={panels}
      />
    </Wrapper>
  )
}

export default App
