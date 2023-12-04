import React from 'react'
import { ChatSidebar } from './ChatSidebar'

// cypress/integration/chatSidebar.spec.js
describe('<ChatSidebar />', () => {
  it('renders', () => {
    // Intercept API call and use fixture data
    cy.intercept('/api/chat/getChatList', { fixture: 'chatListFixture.json' });
    
    // Mount the component
    cy.mount(<ChatSidebar />);
    
    // Add assertions or interactions as needed
    cy.get('.your-selector').should('exist');
  });
});
