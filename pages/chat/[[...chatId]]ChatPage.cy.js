import React from 'react'
import ChatPage from './[[...chatId]]'

describe('<ChatPage />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ChatPage />)
  })
})