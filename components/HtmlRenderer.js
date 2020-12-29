import { Hashtag, Mention } from './Mention'

import { createElement } from 'preact'
import parse from 'html-dom-parser'

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

const tagMap = {
  p: props => (
    <p>
      <HtmlRenderer tags={props.children} context={props.context} />
    </p>
  ),
  a: props => {
    const {
      children,
      attribs: { href, class: className, rel }
    } = props

    const renderedChildren = (
      <HtmlRenderer tags={children} context={props.context} />
    )

    // Detect mentions
    if (props.context && className?.includes('mention')) {
      const data = children[1]?.children[0]?.data

      if (className.includes('hashtag')) {
        return <Hashtag name={data}>{renderedChildren}</Hashtag>
      } else {
        const mention = props.context.mentions.find(
          mention => mention.username === data
        )

        if (mention) {
          return <Mention account={mention}>{renderedChildren}</Mention>
        }
      }
    }

    // External link
    return (
      <a href={href} target='_blank' rel='noopener'>
        {renderedChildren}
      </a>
    )
  },
  br: () => <br />,
  span: props => (
    <span>
      <HtmlRenderer tags={props.children} context={props.context} />
    </span>
  )
}

const HtmlRenderer = props => {
  let { tags, content, context } = props

  if (!tags && content) {
    tags = parse(content)
  }

  if (!tags || tags.length === 0) return null

  return tags.map(tag => {
    const { children, parent, prev, next, ...other } = tag

    if (tag.type === 'text') {
      return tag.data
    } else if (tagMap[tag.name]) {
      return createElement(tagMap[tag.name], { ...tag, context })
    } else {
      return (
        <strong>
          Unknown tag:{' '}
          <pre>{JSON.stringify(other, getCircularReplacer(), 2)}</pre>
        </strong>
      )
    }
  })
}

export default HtmlRenderer
