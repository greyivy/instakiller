import history from 'history/browser'

const RouterLink = props => (
  <a
    onClick={e => {
      e.preventDefault() // Cancel navigation
      history[props.push ? 'push' : 'replace'](props.href)
    }}
    {...props}
  >
    {props.children}
  </a>
)

export default RouterLink
