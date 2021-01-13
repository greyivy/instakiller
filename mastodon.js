import { useEffect, useState } from 'preact/hooks'

import { Masto } from 'masto'
import { createContext } from 'preact'

const DEFAULT_STATE = {
  masto: null,
  user: null,
  error: null,
  isLoading: true
}

const MastodonInstance = createContext(null)

const MastodonInstanceWrapper = props => {
  const { account } = props

  if (!account) return null

  const { uri, accessToken } = account

  const [value, setValue] = useState(DEFAULT_STATE)

  const login = async () => {
    setValue({
      ...DEFAULT_STATE,
      isLoading: true
    })

    try {
      const masto = await Masto.login({
        uri,
        accessToken
      })

      const user = await masto.verifyCredentials()

      setValue({ ...DEFAULT_STATE, isLoading: false, masto, user })
    } catch (e) {
      setValue({ ...DEFAULT_STATE, isLoading: false, error: e })
    }
  }

  useEffect(() => {
    login()

    return () => setValue(DEFAULT_STATE)
  }, [uri, accessToken])

  return (
    <MastodonInstance.Provider value={value}>
      {props.children}
    </MastodonInstance.Provider>
  )
}

export { MastodonInstanceWrapper, MastodonInstance }
