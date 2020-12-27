import { Component, createContext, createElement, h, render } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { Masto } from 'masto'
import { Spinner } from '@blueprintjs/core'

const MastodonInstance = createContext(null)

const MastodonInstanceWrapper = props => {
  const { uri, accessToken, onError } = props

  const [value, setValue] = useState(null)

  const login = async () => {
    try {
      const masto = await Masto.login({
        uri,
        accessToken
      })

      const user = await masto.verifyCredentials()

      setValue({ masto, user })
    } catch (e) {
      onError && onError(e)
    }
  }

  useEffect(() => {
    login()

    return () => setValue(null)
  }, [uri, accessToken])

  if (!value) {
    return <Spinner />
  }

  return (
    <MastodonInstance.Provider value={value}>
      {props.children}
    </MastodonInstance.Provider>
  )
}

export { MastodonInstanceWrapper, MastodonInstance }
