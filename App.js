import {
  Alignment,
  Button,
  Callout,
  Intent,
  Navbar,
  PanelStack,
  Spinner
} from '@blueprintjs/core'
import { Component, h, render } from 'preact'
import { MastodonInstance, MastodonInstanceWrapper } from './mastodon'
import { useContext, useEffect, useMemo, useState } from 'preact/hooks'

import { Action } from 'history'
import Timeline from './components/TimeLine'
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
          setPanels(panels.slice(1))
        }
      } else if (action === Action.Replace) {
        setPanels([panel])
      }
      console.log(action, location.pathname, location.state, panels)
    })

    return () => unlisten()
  }, [panels])

  const home = () => {
    history.replace('/')
  }

  return (
    <Wrapper>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Mastogram</Navbar.Heading>
          <Navbar.Divider />
          <Button
            className='bp3-minimal'
            icon='home'
            text='Back'
            onClick={() => history.back()}
          />
          <Button
            className='bp3-minimal'
            icon='home'
            text='Home'
            onClick={() => home()}
          />
          <Button
            className='bp3-minimal'
            icon='home'
            text='Public'
            onClick={() => history.push('/timeline/public')}
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
