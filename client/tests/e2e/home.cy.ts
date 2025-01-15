describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the welcome message', () => {
    cy.contains(/welcome to pern starter kit/i).should('be.visible');
  });

  it('displays the description', () => {
    cy.contains(/modern full-stack starter template/i).should('be.visible');
  });

  it('has the correct page title', () => {
    cy.title().should('include', 'PERN Stack App');
  });

  it('has proper meta tags', () => {
    cy.get('meta[name="viewport"]').should('have.attr', 'content', 'width=device-width, initial-scale=1.0');
    cy.get('meta[charset="UTF-8"]').should('exist');
  });
}); 