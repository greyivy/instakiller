import {
  Alignment,
  Button,
  Callout,
  Intent,
  Navbar,
  Spinner
} from '@blueprintjs/core'
import { Component, h, render } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { Masto } from 'masto'

function MyComponent (props) {
  const [statuses, setStatuses] = useState([])

  const loadTimeline = async () => {
    const masto = await Masto.login({
      uri: 'https://mastodon.online',
      accessToken: 'IWMnNA345JVckwU1QljWhNCbMD4wRar4JfgX_WuxItY'
    })

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

  useEffect(() => {
    loadTimeline()
  }, [])

  return (
    <div>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Blueprint</Navbar.Heading>
          <Navbar.Divider />
          <Button className='bp3-minimal' icon='home' text='Home' />
          <Button className='bp3-minimal' icon='document' text='Files' />
        </Navbar.Group>
      </Navbar>
      {statuses.map(status => (
        <Callout
          key={status.id}
          title={status.account.username}
          style={{ margin: 8 }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: status.content
            }}
          ></div>
        </Callout>
      ))}
    </div>
  )
}

// Usage
const App = <MyComponent name='John Doe' />

// Renders: <div>My name is John Doe.</div>
render(App, document.body)
