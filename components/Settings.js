import {
  AnchorButton,
  Button,
  Callout,
  Card,
  ControlGroup,
  FormGroup,
  H2,
  H5,
  InputGroup,
  Intent,
  Radio,
  RadioGroup,
  Switch
} from '@blueprintjs/core'
import { Preferences, usePreference } from '../prefs'
import { useContext, useEffect, useState } from 'preact/hooks'

import styled from 'styled-components'

const Container = styled.div`
  width: 100%;
  max-width: var(--containerWidth);
  margin: auto;
  padding: 24px;
`

function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const Settings = props => {
  const { preferences } = useContext(Preferences)
  const [accounts, setAccounts] = usePreference('accounts')
  const [tempAccount, setTempAccount] = useState({})
  const [enableBackgroundBlur, setEnableBackgroundBlur] = usePreference(
    'enableBackgroundBlur'
  )
  const [profileTheme, setProfileTheme] = usePreference('profileTheme')

  return (
    <Container>
      <H2>Accounts</H2>

      <Card style={{ marginBottom: '2rem' }}>
        {accounts.map((account, i) => (
          <Callout key={i} style={{ marginBottom: '1rem' }}>
            <FormGroup label='Instance URI' labelFor={`uri-${i}`}>
              <ControlGroup>
                <InputGroup fill id={`uri-${i}`} value={account.uri} readOnly />
                <Button
                  intent={Intent.DANGER}
                  onClick={() =>
                    setAccounts(accounts.filter(a => a.id !== account.id))
                  }
                >
                  Delete
                </Button>
              </ControlGroup>
            </FormGroup>
            <FormGroup label='Access token' labelFor={`access-token-${i}`}>
              <InputGroup
                id={`access-token-${i}`}
                value={account.accessToken}
                readOnly
              />
            </FormGroup>
          </Callout>
        ))}

        <H5>Add account</H5>
        <FormGroup
          helperText='e.g. mastodon.online (no https://)'
          label='Instance URI'
          labelFor='uri'
          labelInfo='(required)'
        >
          <InputGroup
            id='uri'
            value={tempAccount.uri}
            onChange={e =>
              setTempAccount({ ...tempAccount, uri: e.target.value })
            }
          />
        </FormGroup>
        <FormGroup
          helperText={null}
          label='Access token'
          labelFor='access-token'
          labelInfo='(required)'
        >
          <ControlGroup>
            <InputGroup
              fill
              id='access-token'
              value={tempAccount.accessToken}
              onChange={e =>
                setTempAccount({ ...tempAccount, accessToken: e.target.value })
              }
            />
            <AnchorButton
              disabled={!tempAccount.uri}
              href={`https://${tempAccount.uri}/settings/applications/new`}
              target='_blank'
              rel='noopener'
            >
              Don't have one?
            </AnchorButton>
          </ControlGroup>
        </FormGroup>

        <Button
          intent={Intent.PRIMARY}
          icon='plus'
          disabled={!(tempAccount.uri && tempAccount.accessToken)}
          onClick={() => {
            setAccounts([...accounts, { id: uuidv4(), ...tempAccount }])
            setTempAccount({
              uri: '',
              accessToken: ''
            })
          }}
        >
          Add account
        </Button>
      </Card>

      <H2>Settings</H2>
      <Card style={{ marginBottom: '1rem' }}>
        <H5>Display settings</H5>
        <RadioGroup
          label='Profile theme'
          selectedValue={profileTheme}
          onChange={e => setProfileTheme(e.target.value)}
        >
          <Radio label='Twitter' value='twitter' />
          <Radio label='Instagram' value='instagram' />
        </RadioGroup>

        <Switch
          label='Enable background blur'
          checked={enableBackgroundBlur}
          onChange={() => setEnableBackgroundBlur(!enableBackgroundBlur)}
        />
      </Card>

      <pre class='bp3-code-block'>{JSON.stringify(preferences, null, 2)}</pre>
    </Container>
  )
}

export default Settings
