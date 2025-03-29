// cypress/e2e/content-creation.cy.js
describe("Création d'articles", () => {
  beforeEach(() => {
    cy.loginAsUser() // Utilisateur avec ROLE_SUBSCRIBER
    cy.visit('/create-content')
  })

  it('permet de créer un nouvel article', () => {
    cy.get('#title').type('Mon article de test')
    cy.get('#metaDescription').type('Description de mon article de test')
    cy.get('#content').type('Contenu de mon article de test')
    cy.get('#coverImage').type('https://example.com/image.jpg')
    cy.get('#tags').type('rouge, test, psychologie')

    cy.get('form').submit()

    // Vérifier la redirection vers la page de l'article créé
    cy.url().should('include', '/articles/')
    cy.contains('Mon article de test').should('be.visible')
  })

  it('affiche une erreur quand les champs obligatoires ne sont pas remplis', () => {
    cy.get('form').submit()
    cy.contains('Le titre est requis').should('be.visible')
  })
})
