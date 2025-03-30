describe('Profil utilisateur et inscription', () => {
  // Créer un utilisateur avec un email unique pour tous les tests
  const uniqueEmail = `test${Date.now()}@example.com`
  const testPassword = 'TestPassword123'

  it("permet à un utilisateur de s'inscrire puis de se connecter", () => {
    // Code inchangé...
    cy.visit('/register')
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub')
    })

    cy.get('#email').type(uniqueEmail, { force: true })
    cy.get('#password').type(testPassword, { force: true })
    cy.get('#confirmPassword').type(testPassword, { force: true })
    cy.get('.submit-btn').click({ force: true })

    cy.get('@alertStub').should(
      'have.been.calledWith',
      'Inscription réussie! Vous pouvez maintenant vous connecter.',
    )

    cy.url().should('include', '/login')

    cy.get('#email').type(uniqueEmail, { force: true })
    cy.get('#password').type(testPassword, { force: true })
    cy.get('.submit-btn').click({ force: true })

    cy.url().should('not.include', '/login', { timeout: 10000 })
  })

  it('permet à un utilisateur de voir et modifier son profil', () => {
    // Se connecter d'abord car les tests sont indépendants
    cy.visit('/login')
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('loginAlertStub')
    })

    cy.get('#email').type(uniqueEmail, { force: true })
    cy.get('#password').type(testPassword, { force: true })
    cy.get('.submit-btn').click({ force: true })

    cy.url().should('not.include', '/login', { timeout: 10000 })

    cy.visit('/profile')
    cy.url().should('include', '/profile')

    // Vérifier le titre
    cy.get('h1:contains("Votre Profil")').should('be.visible')

    // Vérifier que l'email actuel est affiché - utiliser un sélecteur plus précis
    cy.get('#currentEmail').should('exist')

    // Intercepter l'alerte avant de faire les modifications
    cy.window().then((win) => {
      if (win.alert.restore && typeof win.alert.restore === 'function') {
        win.alert.restore()
      }
      cy.stub(win, 'alert').as('profileAlertStub')
    })

    // Utiliser first() pour ne cibler que le premier élément correspondant
    cy.get('#newEmail')
      .first()
      .clear({ force: true })
      .type(`updated${Date.now()}@example.com`, { force: true })

    // Cliquer sur le bouton de mise à jour - utiliser un sélecteur plus précis
    cy.get('.update-btn').first().click({ force: true })

    // Vérifier qu'une alerte de confirmation est affichée
    cy.get('@profileAlertStub').should('have.been.called')
  })
})
