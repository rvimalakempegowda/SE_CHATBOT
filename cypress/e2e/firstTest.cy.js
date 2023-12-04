describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('should have the correct title', () => {
    cy.title().should('contain', 'Smart Chatbot');
  });

  it('should have a navigation bar with the correct links', () => {
    cy.get('header nav').should('exist');
    cy.get('header nav a').contains('Login').should('exist');
    cy.get('header nav a').contains('Signup').should('exist');
  });

  
 
  it('should display chatbot information on the home page', () => {
    cy.get('.max-w-2xl').should('exist');
    cy.get('.max-w-2xl h1').should('have.text', 'Welcome to Smart Chatbot');
    
  });

 


  



  // Add more tests as needed
});