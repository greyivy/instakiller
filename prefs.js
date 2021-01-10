import { useContext, useEffect, useMemo, useState } from 'preact/hooks'

import { createContext } from 'preact'

const Preferences = createContext({})

const KEY = 'preferences'

const PreferencesWrapper = props => {
  // On load, read the preferences from localstorage and add any missing defaults
  const [preferences, setPreferences] = useState({
    ...props.default,
    ...(window.localStorage.getItem(KEY)
      ? JSON.parse(window.localStorage.getItem(KEY))
      : {})
  })

  // When preferences changes, update localStorage
  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(preferences))
  }, [preferences])

  return (
    <Preferences.Provider
      value={{
        preferences,
        setPreferences
      }}
    >
      {props.children}
    </Preferences.Provider>
  )
}

const usePreference = key => {
  const { preferences, setPreferences } = useContext(Preferences)

  // Get preference value if exists
  const value = Object.prototype.hasOwnProperty.call(preferences, key)
    ? preferences[key]
    : null

  // Memoize a setter for the preference
  const setter = useMemo(
    () => value => setPreferences({ ...preferences, [key]: value }),
    [preferences, setPreferences]
  )

  return [value, setter]
}

export { PreferencesWrapper, Preferences, usePreference }
