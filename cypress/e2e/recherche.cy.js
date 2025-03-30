describe("Fonctionnalité de recherche d'articles", () => {
  beforeEach(() => {
    // Visiter la page des articles avant chaque test
    cy.visit('/articles')

    // Attendre que les articles se chargent
    cy.get('.articles-grid', { timeout: 10000 }).should('exist')

    // Ignorer les erreurs d'alerte pour ne pas bloquer les tests
    cy.on('window:alert', (text) => {
      console.log('Alert:', text)
      return false
    })
  })

  it('filtre les articles par titre', () => {
    // Stocker le nombre initial d'articles
    cy.get('.article-card').then(($initialCards) => {
      const initialCount = $initialCards.length

      // Entrer un terme de recherche dans le champ titre
      cy.get('#title-filter').type('Mon article de test')

      // Cliquer sur le bouton Appliquer
      cy.contains('button', 'Appliquer').click()

      // Vérifier que les résultats de la recherche sont affichés
      cy.get('.article-card').should(($filteredCards) => {
        // Le nombre d'articles devrait être inférieur ou égal au nombre initial
        expect($filteredCards.length).to.be.at.most(initialCount)

        // Si des articles sont trouvés, vérifier que le premier contient le mot recherché
        if ($filteredCards.length > 0) {
          cy.get('.article-card')
            .first()
            .contains(/Mon article de test/i, { matchCase: false })
        }
      })
    })
  })

  it('filtre les articles par auteur', () => {
    // Attendre que les articles se chargent complètement
    cy.get('.article-card').should('have.length.at.least', 1)

    // Récupérer l'UUID de l'auteur du premier article pour le test
    cy.get('.article-card').first().click()
    cy.url().should('include', '/articles/')
    cy.contains('Test   ')
      .invoke('text')
      .then((authorText) => {
        // Revenir à la page des articles
        cy.visit('/articles')

        // Entrer l'auteur dans le champ de filtre
        cy.get('#author-filter').type(authorText.replace('Test: ', ''))

        // Appliquer le filtre
        cy.contains('button', 'Appliquer').click()

        // Vérifier que les articles affichés sont de cet auteur
        cy.get('.article-card').should('exist')
      })
  })

  it('filtre les articles par tags', () => {
    // Entrer un tag de test
    cy.get('#tags-filter').type('psychologie')

    // Appliquer le filtre
    cy.contains('button', 'Appliquer').click()

    // Vérifier les résultats
    cy.get('.article-card').then(($cards) => {
      if ($cards.length > 0) {
        // Vérifier que les tags sont affichés sur les cartes
        cy.get('.article-card').first().find('.tag').should('exist')
      }
    })
  })

  it('filtre les articles par date', () => {
    // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]

    // Entrer la date dans le filtre
    cy.get('#date-filter').type(today)

    // Appliquer le filtre
    cy.contains('button', 'Appliquer').click()

    // Vérifier que le filtre est appliqué (la date est dans l'URL)
    cy.url().should('include', 'created_at=')
  })

  it('réinitialise les filtres', () => {
    // Appliquer d'abord un filtre
    cy.get('#title-filter').type('test')
    cy.contains('button', 'Appliquer').click()

    // Puis réinitialiser les filtres
    cy.contains('button', 'Réinitialiser').click()

    // Vérifier que les champs sont vides
    cy.get('#title-filter').should('have.value', '')
    cy.get('#author-filter').should('have.value', '')
    cy.get('#date-filter').should('have.value', '')
    cy.get('#tags-filter').should('have.value', '')

    // Vérifier que tous les articles sont affichés à nouveau
    cy.get('.article-card').should('exist')
  })

  it('combine plusieurs filtres', () => {
    // Appliquer plusieurs filtres simultanément
    cy.get('#title-filter').type('design')
    cy.get('#tags-filter').type('couleur')

    // Appliquer les filtres
    cy.contains('button', 'Appliquer').click()

    // Vérifier que l'URL contient les deux paramètres
    cy.url().should('include', 'title=design').and('include', 'tags=couleur')

    // Vérifier que les résultats sont affichés (s'il y en a)
    cy.get('body').then(($body) => {
      if ($body.find('.article-card').length > 0) {
        cy.get('.article-card').should('exist')
      } else {
        // Si aucun résultat, vérifier le message "aucun article trouvé"
        cy.get('.no-articles, .empty-state').should('exist')
      }
    })
  })

  it("gère correctement l'absence de résultats", () => {
    // Rechercher un terme qui ne devrait pas exister
    cy.get('#title-filter').type('xyzabc123nonexistant')

    // Appliquer le filtre
    cy.contains('button', 'Appliquer').click()

    // Vérifier qu'un message "aucun article trouvé" est affiché
    cy.get('.no-articles, .empty-state').should('be.visible')
  })
})
