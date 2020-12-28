import 'preact/debug'

import App from './App'
import { PreferencesWrapper } from './prefs'
import { render } from 'preact'

render(
  <PreferencesWrapper
    default={{
      accounts: [],
      enableBackgroundBlur: true,
      profileTheme: 'twitter'
    }}
  >
    <App />
  </PreferencesWrapper>,
  document.getElementById('App')
)
