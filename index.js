import 'preact/debug'

import App from './App'
import { PreferencesWrapper } from './prefs'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { render } from 'preact'

TimeAgo.addDefaultLocale(en)

render(
  <PreferencesWrapper
    default={{
      accounts: [],
      onlyMedia: false,
      enableBackgroundBlur: true,
      enableTextRenderer: true,
      profileTheme: 'twitter'
    }}
  >
    <App />
  </PreferencesWrapper>,
  document.getElementById('App')
)
