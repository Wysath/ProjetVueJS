describe('Accès public aux articles', () => {
  it("permet d'accéder à la liste des articles sans être connecté", () => {
    // Visiter la page d'accueil/articles sans se connecter
    cy.visit('/articles')

    // Vérifier que la page se charge correctement
    cy.contains('h1', 'Palette').should('be.visible')

    // Vérifier qu'au moins un article est visible
    cy.get('.article-card').should('exist')
  })

  it("permet d'accéder au détail d'un article sans être connecté", () => {
    // Visiter la page d'articles
    cy.visit('/articles')

    // Cliquer sur le premier article disponible
    cy.get('.article-card').first().click()

    // Vérifier que la page de détail se charge
    cy.url().should('include', '/articles/')

    // Vérifier que le contenu de l'article est visible
    cy.get('.article-content').should('be.visible')

    // Vérifier que les commentaires sont visibles
    cy.get('.comments-section').should('exist')
  })

  it('ne permet pas de commenter sans être connecté', () => {
    // Visiter un article spécifique
    cy.visit('/articles/17038d87-66cd-4917-9385-e0563363f257') // Remplacer par un ID d'article valide dans votre système

    // Vérifier que le formulaire de commentaire n'est pas disponible
    // ou qu'il y a un message invitant à se connecter
    cy.get('.comment-form').should('not.exist')
    cy.contains('Vous devez être connecté pour ajouter un commentaire.').should('be.visible')
  })
})
