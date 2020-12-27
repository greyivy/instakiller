import {
  Alignment,
  Button,
  Callout,
  Intent,
  Navbar,
  Spinner
} from '@blueprintjs/core'
import { Component, h, render } from 'preact'
import { MastodonInstance, MastodonInstanceWrapper } from './mastodon'
import { useContext, useEffect, useMemo, useState } from 'preact/hooks'

import Timeline from './components/TimeLine'

// const TestComponent = (props = <div>test</div>)

function App (props) {
  const masto = useContext(MastodonInstance)
  const [statuses, setStatuses] = useState([])

  const loadTimeline = async () => {
    // Generate iterable of timeline
    const timeline = masto.fetchPublicTimeline()

    const result = await timeline.next()
    console.log(result.value)
    setStatuses(Object.values(result.value))

    //for await (const statuses of timeline) {

    //  statuses.forEach(status => {
    //    masto.favouriteStatus(status.id)
    //  })
    //}
  }

  console.log('masto', masto)

  useEffect(() => {
    if (masto) loadTimeline()
  }, [masto])

  // const [panels, setPanels] = useState([
  //   {
  //     component: TestComponent,
  //     props: {
  //       panelNumber: 1
  //     },
  //     title: 'Panel 1'
  //   }
  // ])

  return (
    <div>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Mastogram</Navbar.Heading>
          <Navbar.Divider />
          <Button className='bp3-minimal' icon='home' text='Timeline' />
          <Button className='bp3-minimal' icon='home' text='Timeline' />
        </Navbar.Group>
      </Navbar>

      {/* <PanelStack
        initialPanel={panels[0]}
        onOpen={panel => {
          setPanels([panel, ...panels])
        }}
        onClose={() => {
          setPanels(panels.slice(1))
        }}
        renderActivePanelOnly
        showPanelHeader
      /> */}

      <Timeline statuses={statuses} />
    </div>
  )
}

export default App
