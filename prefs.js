import { Button, Intent, NonIdealState } from '@blueprintjs/core'
import { useEffect, useMemo, useState } from 'preact/hooks'

import { createContext } from 'preact'

const Preferences = createContext({})

const KEY = 'preferences'

const PreferencesWrapper = props => {
  const [preferences, setPreferences] = useState(
    localStorage.getItem(KEY) ? JSON.parse(localStorage.getItem(KEY)) : {}
  )

  const setPreference = useMemo(() => (key, value) =>
    setPreferences({ ...preferences, [key]: value })
  )

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(preferences))
  }, [preferences])

  return (
    <Preferences.Provider
      value={{
        preferences,
        setPreference
      }}
    >
      {props.children}
    </Preferences.Provider>
  )
}

export { PreferencesWrapper, Preferences }
