describe('Counter Feature', () => {
  beforeEach(() => {
    // Reset API state before each test
    cy.request('POST', `${Cypress.env('API_URL')}/api/counter/reset`);
    cy.visit('/');
  });

  it('displays initial counter value', () => {
    cy.contains(/current count: 0/i).should('be.visible');
  });

  it('increments counter when button is clicked', () => {
    cy.contains(/current count: 0/i).should('be.visible');
    cy.contains(/increment count/i).click();
    cy.contains(/current count: 1/i).should('be.visible');
  });

  it('handles multiple increments', () => {
    cy.contains(/current count: 0/i).should('be.visible');
    
    // Click multiple times
    for (let i = 0; i < 3; i++) {
      cy.contains(/increment count/i).click();
      cy.contains(`Current count: ${i + 1}`).should('be.visible');
    }
  });

  it('maintains counter state on page reload', () => {
    cy.contains(/increment count/i).click();
    cy.contains(/current count: 1/i).should('be.visible');
    
    cy.reload();
    cy.contains(/current count: 1/i).should('be.visible');
  });

  it('handles API errors gracefully', () => {
    // Intercept the increment request and force it to fail
    cy.intercept('POST', '**/counter/increment', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('incrementError');

    cy.contains(/increment count/i).click();
    cy.wait('@incrementError');
    
    // Verify error handling (adjust based on your error UI)
    cy.get('.error-message').should('be.visible');
  });
}); 