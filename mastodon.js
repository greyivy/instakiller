import { Button, Intent, NonIdealState } from '@blueprintjs/core'
import { useEffect, useState } from 'preact/hooks'

import CenteredSpinner from './components/CenteredSpinner'
import { Masto } from 'masto'
import { createContext } from 'preact'
import history from 'history/browser'
import toaster from './components/toaster'

const MastodonInstance = createContext(null)

const MastodonInstanceWrapper = props => {
  const { account } = props

  if (!account) {
    return (
      <NonIdealState
        icon='user'
        title='No account'
        description='Please add a Mastodon account before continuing'
        action={
          <Button
            intent={Intent.PRIMARY}
            onClick={() => history.replace('/settings')}
          >
            Add account
          </Button>
        }
      />
    )
  }

  const { uri, accessToken } = account

  const [error, setError] = useState(null)
  const [value, setValue] = useState(null)

  const login = async () => {
    setError(null)

    try {
      const masto = await Masto.login({
        uri,
        accessToken
      })

      const user = await masto.verifyCredentials()
      setValue({ masto, user })
    } catch (e) {
      toaster.show({ message: e.message, intent: Intent.DANGER })
      setError(e)
    }
  }

  useEffect(() => {
    login()

    return () => setValue(null)
  }, [uri, accessToken])

  if (error) {
    return (
      <NonIdealState
        icon='error'
        title='Error connecting to instance'
        description='Please check your credentials and verify that the instance is up'
        action={
          <>
            <Button intent={Intent.PRIMARY} onClick={() => login()}>
              Try again
            </Button>
            <a href={uri} target='_blank' rel='noopener'>
              View instance
            </a>
          </>
        }
      />
    )
  }

  if (!value) {
    return <CenteredSpinner />
  }

  return (
    <MastodonInstance.Provider value={value}>
      {props.children}
    </MastodonInstance.Provider>
  )
}

export { MastodonInstanceWrapper, MastodonInstance }
