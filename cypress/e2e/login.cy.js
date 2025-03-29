// cypress/e2e/auth/login.cy.js
describe('Authentification', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it("affiche un message d'erreur avec des identifiants invalides", () => {
    cy.get('input[type="email"]').type('utilisateur@invalide.com')
    cy.get('input[type="password"]').type('motdepasseincorrect')
    cy.get('form').submit()
    cy.contains('Email ou mot de passe incorrect').should('be.visible')
  })

  it("connecte l'utilisateur avec des identifiants valides", () => {
    cy.get('input[type="email"]').type('test@test.com')
    cy.get('input[type="password"]').type('password')
    cy.get('form').submit()

    // Vérifier que l'utilisateur est redirigé après connexion
    cy.url().should('not.include', '/login')

    // Vérifier que le token est stocké dans la session
    cy.window().its('sessionStorage').invoke('getItem', 'token').should('exist')
  })
})
