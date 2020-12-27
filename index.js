import { Component, h, render } from 'preact'

import App from './App'
import { MastodonInstanceWrapper } from './mastodon'

render(
  <MastodonInstanceWrapper
    uri='https://mastodon.online'
    accessToken='IWMnNA345JVckwU1QljWhNCbMD4wRar4JfgX_WuxItY'
  >
    <App />
  </MastodonInstanceWrapper>,
  document.body
)
