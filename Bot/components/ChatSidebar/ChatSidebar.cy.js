import React from 'react'
import { ChatSidebar } from './ChatSidebar'

describe('<ChatSidebar />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ChatSidebar />)
  })
})