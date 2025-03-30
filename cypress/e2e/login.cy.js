describe('Authentification', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it("affiche un message d'erreur avec des identifiants invalides", () => {
    // Créer une variable pour stocker le message d'alerte
    let alertMessage = null

    // Intercepter l'alerte avant de soumettre le formulaire
    cy.window().then((win) => {
      cy.stub(win, 'alert').callsFake((msg) => {
        alertMessage = msg
      })
    })

    // Remplir et soumettre le formulaire avec des identifiants invalides
    cy.get('input[type="email"]').type('utilisateur@invalide.com')
    cy.get('input[type="password"]').type('motdepasseincorrect')
    cy.get('form').submit()

    // Vérifier le message d'alerte après soumission
    cy.wait(1000) // Attendre que l'alerte soit déclenchée
    cy.then(() => {
      expect(alertMessage).to.not.be.null
      expect(alertMessage).to.eq('Une erreur est survenue pendant la connexion')
    })
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
