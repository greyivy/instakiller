import { Component, createContext, createElement, h, render } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { Masto } from 'masto'
import { Spinner } from '@blueprintjs/core'

const MastodonInstance = createContext(null)

const MastodonInstanceWrapper = props => {
  const { uri, accessToken, onError } = props

  const [masto, setMasto] = useState(null)

  const login = async () => {
    try {
      const masto = await Masto.login({
        uri,
        accessToken
      })

      setMasto(masto)
    } catch (e) {
      onError && onError(e)
    }
  }

  useEffect(() => {
    login()

    return () => setMasto(null)
  }, [uri, accessToken])

  if (!masto) {
    return <Spinner />
  }

  return (
    <MastodonInstance.Provider value={masto}>
      {props.children}
    </MastodonInstance.Provider>
  )
}

export { MastodonInstanceWrapper, MastodonInstance }
