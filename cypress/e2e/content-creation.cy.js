describe('Fonctionnalité de commentaires', () => {
  // Utilisation d'un UUID réel qui existe dans votre système
  const validArticleId = 'b36a0eb1-814b-47de-8caf-198e03ba226a'

  // Utilisateur standard (non abonné)
  const regularUser = {
    email: 'user@test.com',
    password: 'password',
  }

  // Utilisateur abonné - assurez-vous que cet utilisateur existe avec le rôle SUBSCRIBER
  const subscriberUser = {
    email: 'test@test.com',
    password: 'password',
  }

  // Configuration personnalisée pour les requêtes réseau
  beforeEach(() => {
    // Attendre plus longtemps que par défaut
    cy.visit(`/articles/${validArticleId}`, { timeout: 10000 })

    // Ignorer les erreurs de chargement d'article pour ne pas bloquer le test
    cy.on('window:alert', (text) => {
      // Vous pouvez faire un log mais ne pas échouer le test
      console.log('Alert:', text)
      return false
    })
  })

  it("vérifie qu'un utilisateur non connecté ne peut pas commenter", () => {
    // Attendre que l'article se charge correctement
    cy.url().should('include', '/articles/')

    // Vérifier si le message d'invitation à se connecter apparaît
    cy.contains('connecté pour ajouter un commentaire', { timeout: 10000 }).should('be.visible')

    // Vérifier que le formulaire de commentaire n'est pas disponible
    cy.get('form.comment-form, .add-comment-form').should('not.exist')
  })

  it("vérifie qu'un utilisateur non abonné ne peut pas commenter", () => {
    // Se connecter en tant qu'utilisateur standard
    cy.visit('/login')
    cy.get('input[name="email"], input[type="email"]').type(regularUser.email)
    cy.get('input[name="password"], input[type="password"]').type(regularUser.password)
    cy.get('form').submit()

    // Visiter la page de l'article
    cy.visit(`/articles/${validArticleId}`)

    // Vérifier que le message approprié est affiché
    cy.contains('connecté', { timeout: 8000 }).should('be.visible')

    // Vérifier que le formulaire de commentaire n'est pas disponible
    cy.get('form.comment-form, .add-comment-form').should('not.exist')
  })

  it("permet à un abonné d'ajouter un commentaire", () => {
    // Se connecter en tant qu'abonné
    cy.visit('/login')
    cy.get('input[name="email"], input[type="email"]').type(subscriberUser.email)
    cy.get('input[name="password"], input[type="password"]').type(subscriberUser.password)
    cy.get('form').submit()

    // Attendre que la connexion soit réussie
    cy.contains('palette').should('exist')

    // Visiter la page de l'article
    cy.visit(`/articles/${validArticleId}`)

    // Vérifier que le formulaire de commentaire est disponible (utiliser des sélecteurs plus génériques)
    cy.get('textarea, [name="comment"]', { timeout: 10000 }).should('be.visible')

    // Ajouter un commentaire
    const commentText = 'Ceci est un commentaire de test ' + Date.now()
    cy.get('textarea, [name="comment"]').type(commentText)
    cy.contains('button', /Publier|Envoyer|Commenter/).click()

    // Vérifier que le commentaire a été ajouté
    cy.contains(commentText, { timeout: 10000 }).should('be.visible')
  })

  // Ce test doit s'exécuter après avoir créé un commentaire
  it('permet à un abonné de modifier son propre commentaire', () => {
    // Se connecter en tant qu'abonné
    cy.visit('/login')
    cy.get('input[name="email"], input[type="email"]').type(subscriberUser.email)
    cy.get('input[name="password"], input[type="password"]').type(subscriberUser.password)
    cy.get('form').submit()

    // Attendre que la connexion soit réussie
    cy.contains('palette').should('exist')

    // Visiter la page de l'article
    cy.visit(`/articles/${validArticleId}`)

    // D'abord vérifier si des commentaires existent
    cy.get('body').then(($body) => {
      // Si un bouton Modifier existe déjà dans un commentaire
      if ($body.find('button:contains("Modifier")').length > 0) {
        // Utiliser le commentaire existant
        cy.contains('button', 'Modifier').first().click()
      } else {
        // Sinon créer un nouveau commentaire
        const commentText = 'Commentaire à modifier ' + Date.now()
        cy.get('textarea, [name="comment"]', { timeout: 10000 })
          .should('be.visible')
          .type(commentText)
        cy.contains('button', /Publier|Envoyer|Commenter/).click()

        // Attendre que le commentaire apparaisse et trouver le bouton Modifier
        cy.contains(commentText, { timeout: 10000 }).should('be.visible')
        cy.contains('button', 'Modifier').first().click()
      }
    })

    // Modifier le commentaire
    const editedComment = 'Commentaire modifié ' + Date.now()
    cy.get('textarea').first().clear().type(editedComment)
    cy.contains('button', 'Enregistrer').click()

    // Vérifier que le commentaire modifié est affiché
    cy.contains(editedComment, { timeout: 10000 }).should('be.visible')
  })
})
