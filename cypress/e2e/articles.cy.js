describe('Accès public aux articles', () => {
  // Les deux premiers tests restent inchangés

  it('ne permet pas de commenter sans être connecté', () => {
    // Visiter d'abord la page des articles pour trouver un ID valide
    cy.visit('/articles')

    // Attendre que les articles se chargent
    cy.get('.article-card', { timeout: 10000 }).should('exist')

    // Cliquer sur le premier article disponible
    cy.get('.article-card').first().click()

    // Vérifier que la page de détail se charge
    cy.url().should('include', '/articles/')

    // Vérifier que le formulaire de commentaire n'est pas disponible
    cy.get('form.comment-form, .add-comment-form, form:has(textarea)').should('not.exist')

    // Vérifier qu'il y a un message indiquant qu'il faut être connecté
    // Utiliser un sélecteur plus souple pour s'adapter à différentes structures HTML
    cy.contains(/connecté|login|authentifier/).should('be.visible')

    // Vérifier spécifiquement la présence du bouton de connexion
    cy.get('button')
      .contains(/connecter|login|connexion/i)
      .should('be.visible')
  })
})
