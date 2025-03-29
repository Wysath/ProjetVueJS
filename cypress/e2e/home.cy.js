// cypress/e2e/home.cy.js
describe('template spec', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('affiche le titre principal', () => {
    cy.get('.main-title').should('contain', 'Palette')
    cy.get('.main-title').should('contain', 'Expérimentale')
  })

  it('permet de naviguer vers les articles', () => {
    cy.get('.cta-primary').click()
    cy.url().should('include', '/articles')
  })

  it('affiche les 3 articles récents', () => {
    cy.get('.article-card').should('have.length', 3)
  })

  it('affiche la section des couleurs et émotions', () => {
    cy.get('.emotions-grid').should('be.visible')
    cy.get('.emotion-card').should('have.length', 6)
  })
})
