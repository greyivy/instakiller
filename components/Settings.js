import {
  AnchorButton,
  Button,
  Callout,
  Card,
  Classes,
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
    var r = (Math.random() * 16) | 0
    var v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function validateInput(regex, currentValue, newValue) {
  if(currentValue.includes('http://')){
    const item = currentValue.replace(regex, newValue)
    return item
  } else if(currentValue.includes('https://')){
    return currentValue
  } else {
    const item = ('https://' + currentValue)
    return item
  }
}

const Settings = props => {
  const { preferences } = useContext(Preferences)
  const [accounts, setAccounts] = usePreference('accounts')
  const [tempAccount, setTempAccount] = useState({})
  const [onlyMedia, setOnlyMedia] = usePreference('onlyMedia')
  const [enableBackgroundBlur, setEnableBackgroundBlur] = usePreference(
    'enableBackgroundBlur'
  )
  const [enableTextRenderer, setEnableTextRenderer] = usePreference(
    'enableTextRenderer'
  )
  const [displayHeaderImage, setDisplayHeaderImage] = usePreference('displayHeaderImage')

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

        {/* Note: URL is shown here the the field is actually URI */}
        <H5>Add account</H5>
        <FormGroup
          helperText='e.g. https://mastodon.online'
          label='Instance URL'
          labelFor='url'
          labelInfo='(required)'
        >
          <InputGroup
            id='url'
            type='url'
            placeholder='https://'
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
              href={`${tempAccount.uri}/settings/applications/new`}
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
            setAccounts([...accounts, { id: uuidv4(), uri: validateInput('/^http:\/\//i', tempAccount.uri, 'https://'), accessToken: tempAccount.accessToken }])
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
        <Switch 
          label='Display User Header Images'
          checked={displayHeaderImage}
          onChange={() => setDisplayHeaderImage(!displayHeaderImage)}
        />
        <Switch
          label='Only show posts with media'
          checked={onlyMedia}
          onChange={() => setOnlyMedia(!onlyMedia)}
        />
        <Switch
          label='Enable background blur'
          checked={enableBackgroundBlur}
          onChange={() => setEnableBackgroundBlur(!enableBackgroundBlur)}
        />
        <Switch
          label='Enable text renderer'
          checked={enableTextRenderer}
          onChange={() => setEnableTextRenderer(!enableTextRenderer)}
        />
      </Card>

      <pre className={Classes.CODE_BLOCK}>
        {JSON.stringify(preferences, null, 2)}
      </pre>
    </Container>
  )
}

export default Settings
