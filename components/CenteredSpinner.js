import { Component, Fragment, createElement, h } from 'preact'

import { Spinner } from '@blueprintjs/core'
import styled from 'styled-components'

const CenteredSpinnerWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CenteredSpinner = props => (
  <CenteredSpinnerWrapper>
    <Spinner {...props} />
  </CenteredSpinnerWrapper>
)

export default CenteredSpinner
