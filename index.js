import 'preact/debug'

import App from './App'
import { PreferencesWrapper } from './prefs'
import { render } from 'preact'

render(
  <PreferencesWrapper>
    <App />
  </PreferencesWrapper>,
  document.getElementById('App')
)
