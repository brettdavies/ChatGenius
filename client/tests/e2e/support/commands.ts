/// <reference types="cypress" />

// Add custom Cypress commands here
// See: https://docs.cypress.io/api/cypress-api/custom-commands

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to reset the counter state
       * @example cy.resetCounter()
       */
      resetCounter(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('resetCounter', () => {
  cy.request('POST', `${Cypress.env('API_URL')}/api/counter/reset`);
}); 