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
      <HtmlRenderer tags={props.children} />
    </p>
  ),
  a: props => (
    <a href={props.attribs.href} target={props.attribs.target}>
      <HtmlRenderer tags={props.children} />
    </a>
  ),
  br: () => <br />,
  span: props => (
    <span>
      <HtmlRenderer tags={props.children} />
    </span>
  )
}

const HtmlRenderer = props => {
  let { tags, content } = props

  if (!tags && content) {
    tags = parse(content)
  }

  if (!tags || tags.length === 0) return null

  return tags.map(tag => {
    const { children, parent, prev, next, ...other } = tag

    if (tag.type === 'text') {
      return tag.data
    } else if (tagMap[tag.name]) {
      return createElement(tagMap[tag.name], tag)
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
