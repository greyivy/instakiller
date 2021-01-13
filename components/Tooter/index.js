import {
  Alignment,
  Button,
  Classes,
  Drawer,
  HTMLSelect,
  InputGroup,
  Intent,
  Navbar,
  Position,
  TextArea
} from '@blueprintjs/core'
import { MastodonInstance, MastodonInstanceWrapper } from '../../mastodon'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'

const Tooter = props => {
  const { isOpen, onClose } = props

  const { masto, user } = useContext(MastodonInstance)

  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [visibility, setVisibility] = useState('public')

  const [hasSpoiler, setHasSpoiler] = useState(false)
  const [spoiler, setSpoiler] = useState('')

  const toot = async () => {
    setIsLoading(true)

    const payload = {
      status,
      visibility
    }

    if (hasSpoiler && spoiler) {
      payload.spoilerText = spoiler
    }

    try {
      await masto.createStatus(payload)
    } catch (e) {
      toaster.show({ message: e.message, intent: Intent.DANGER })
    }

    setIsLoading(false)

    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      setStatus('')
    }
  }, [isOpen])

  return (
    <Drawer
      title={
        <div
          className={Classes.DRAWER_HEADER}
          style={{ justifyContent: 'space-between', paddingLeft: 0 }}
        >
          Compose toot
          <div>
            <span style={{ marginRight: '0.5rem' }}>{status.length}</span>
            <Button
              loading={isLoading}
              intent={Intent.PRIMARY}
              onClick={() => toot()}
            >
              Post
            </Button>
          </div>
        </div>
      }
      position={Position.BOTTOM}
      size='100%'
      isOpen={isOpen}
      onClose={() => onClose()}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexFlow: 'column'
        }}
      >
        {hasSpoiler && (
          <div style={{ padding: '0.5rem' }}>
            <InputGroup
              large
              id='spoiler'
              value={spoiler}
              onChange={e => setSpoiler(e.target.value)}
              disabled={isLoading}
              autoComplete='off'
              autoFocus
              title='Content warning'
              placeholder='Content warning'
            />
          </div>
        )}

        <div style={{ padding: '0.5rem', flex: 1 }}>
          <TextArea
            autoFocus
            fill
            disabled={isLoading}
            style={{ height: '100%' }}
            large
            value={status}
            onChange={e => setStatus(e.target.value)}
          ></TextArea>
        </div>

        <Navbar>
          <Navbar.Group
            align={null}
            style={{ justifyContent: 'space-between' }}
          >
            <HTMLSelect
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
              disabled={isLoading}
              options={[
                { label: 'Public', value: 'public' },
                { label: 'Unlisted', value: 'unlisted' },
                { label: 'Followers-only', value: 'private' },
                { label: 'Direct', value: 'direct' }
              ]}
            ></HTMLSelect>

            <Button
              minimal
              icon={hasSpoiler ? 'eye-off' : 'eye-open'}
              title='Content warning'
              onClick={() => setHasSpoiler(!hasSpoiler)}
              intent={hasSpoiler ? Intent.PRIMARY : Intent.NONE}
            />
          </Navbar.Group>
        </Navbar>
      </div>
    </Drawer>
  )
}

export default props => (
  <MastodonInstanceWrapper account={props.account}>
    <Tooter {...props} />
  </MastodonInstanceWrapper>
)
