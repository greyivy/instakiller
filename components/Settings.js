import { Radio, RadioGroup, Switch } from '@blueprintjs/core'

import { Preferences } from '../prefs'
import styled from 'styled-components'
import { useContext } from 'preact/hooks'

const Container = styled.div`
  width: var(--containerWidth);
  margin: auto;
  padding: 24px;
`

const Settings = props => {
  const { preferences, setPreference } = useContext(Preferences)

  return (
    <Container>
      <h2 class='bp3-heading'>Settings</h2>
      <div style={{ marginBottom: '2rem' }}>
        <RadioGroup
          label='Profile theme'
          selectedValue={preferences.profileTheme}
          onChange={e => setPreference('profileTheme', e.target.value)}
        >
          <Radio label='Twitter' value='twitter' />
          <Radio label='Instagram' value='instagram' />
        </RadioGroup>
      </div>

      <Switch
        label='Disable background blur'
        checked={preferences.disableBackgroundBlur}
        onChange={() =>
          setPreference(
            'disableBackgroundBlur',
            !preferences.disableBackgroundBlur
          )
        }
      />
      <pre style={{ marginTop: 200 }}>
        {JSON.stringify(preferences, null, 2)}
      </pre>
    </Container>
  )
}

export default Settings
