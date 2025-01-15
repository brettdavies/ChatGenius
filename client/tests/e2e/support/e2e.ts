// Import commands.js using ES2015 syntax:
import './commands';

// Configure Cypress behavior
Cypress.on('uncaught:exception', (err) => {
  // Returning false here prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver loop')) {
    return false;
  }
  return true;
});

// Custom command to login
Cypress.Commands.add('login', (username, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      username,
      password,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

// Custom command to register
Cypress.Commands.add('register', (username, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: {
      username,
      password,
    },
  }).then((response) => {
    expect(response.status).to.eq(201);
  });
}); 