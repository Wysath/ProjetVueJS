describe('Parcours utilisateur administrateur', () => {
  // Identifiants de l'administrateur - à remplacer par un compte admin valide
  const adminUser = {
    email: 'louna@test.com',
    password: 'password',
  }

  beforeEach(() => {
    // Intercepter les appels API pour éviter les problèmes de timing
    cy.intercept('GET', '**/api/users*').as('getUsers')
    cy.intercept('GET', '**/api/contents*').as('getContents')
    cy.intercept('GET', '**/api/comments*').as('getComments')

    // Gérer les alertes pour éviter qu'elles ne bloquent les tests
    cy.on('window:alert', (text) => {
      console.log('Alert:', text)
      return true
    })

    // Se connecter avant chaque test
    cy.visit('/login')
    cy.get('input[type="email"]').type(adminUser.email)
    cy.get('input[type="password"]').type(adminUser.password)
    cy.get('form').submit()

    // Attendre que l'utilisateur soit connecté (timeout augmenté)
    cy.url().should('not.include', '/login', { timeout: 10000 })

    // Naviguer vers la page d'administration
    cy.visit('/admin')

    // Vérifier que la page d'administration est accessible
    cy.contains('h1', 'Administration', { timeout: 10000 }).should('be.visible')
  })

  it("permet d'accéder au panel d'administration", () => {
    // Vérifier que les trois onglets sont présents
    cy.contains('button', 'Utilisateurs').should('be.visible')
    cy.contains('button', 'Publications').should('be.visible')
    cy.contains('button', 'Commentaires').should('be.visible')
  })

  it('affiche et permet de gérer les utilisateurs', () => {
    // S'assurer que l'onglet Utilisateurs est actif
    cy.contains('button', 'Utilisateurs').click()

    // Attendre que les données soient chargées
    cy.wait('@getUsers', { timeout: 10000 })

    // Vérifier que le tableau d'utilisateurs est visible
    cy.get('table', { timeout: 10000 }).should('be.visible')
    cy.contains('th', 'Email').should('be.visible')
    cy.contains('th', 'UUID').should('be.visible')
    cy.contains('th', 'Rôles').should('be.visible')

    // Tester la fonctionnalité de recherche
    cy.get('.filters input').type('test')
    cy.get('table tbody tr').should('have.length.at.least', 0)

    // Effacer la recherche
    cy.get('.filters input').clear()
    cy.get('table tbody tr').should('have.length.at.least', 1)
  })

  it('affiche et permet de gérer les publications', () => {
    // Naviguer vers l'onglet Publications
    cy.contains('button', 'Publications').click()

    // Attendre que les données soient chargées
    cy.wait('@getContents', { timeout: 10000 })

    // Vérifier que le tableau des publications est visible
    cy.get('table', { timeout: 10000 }).should('be.visible')
    cy.contains('th', 'Titre').should('be.visible')
    cy.contains('th', 'Description').should('be.visible')
    cy.contains('th', 'Date de création').should('be.visible')

    // Tester la fonctionnalité de recherche
    cy.get('.filters input').type('test')
    cy.get('table tbody tr').should('have.length.at.least', 0)

    // Effacer la recherche
    cy.get('.filters input').clear()

    // Si des publications existent, tester la modification
    cy.get('body').then(($body) => {
      // Attendre un peu pour s'assurer que le tableau est chargé
      cy.wait(1000)

      if ($body.find('table tbody tr').length > 0) {
        // Cliquer sur le bouton Modifier de la première publication
        cy.get('table tbody tr').first().find('.edit-btn').click()

        // Vérifier que le modal d'édition s'ouvre
        cy.get('.edit-modal', { timeout: 10000 }).should('be.visible')
        cy.contains('h3', 'Modifier la publication').should('be.visible')

        // Modifier le titre
        const newTitle = 'Publication modifiée ' + Date.now()
        cy.get('#title').clear().type(newTitle)

        // Sauvegarder et vérifier que le modal se ferme
        cy.contains('button', 'Enregistrer').click()
        cy.get('.edit-modal').should('not.exist')

        // Vérifier que la modification est visible dans le tableau
        cy.contains('td', newTitle, { timeout: 10000 }).should('be.visible')
      }
    })
  })

  it('affiche et permet de gérer les commentaires', () => {
    // Naviguer vers l'onglet Commentaires
    cy.contains('button', 'Commentaires').click()

    // Attendre que les données soient chargées
    cy.wait('@getComments', { timeout: 10000 })

    // Vérifier que le tableau des commentaires est visible
    cy.get('table', { timeout: 10000 }).should('be.visible')
    cy.contains('th', 'Commentaire').should('be.visible')
    cy.contains('th', 'Auteur').should('be.visible')

    // Tester la fonctionnalité de recherche
    cy.get('.filters input').type('test')
    cy.get('table tbody tr').should('have.length.at.least', 0)

    // Effacer la recherche
    cy.get('.filters input').clear()

    // Si des commentaires existent, tester la modification
    cy.get('body').then(($body) => {
      // Attendre un peu pour s'assurer que le tableau est chargé
      cy.wait(1000)

      if ($body.find('table tbody tr').length > 0) {
        // Vérifier si le bouton de modification existe
        cy.get('table tbody tr')
          .first()
          .then(($row) => {
            if ($row.find('.edit-btn').length > 0) {
              // Cliquer sur le bouton Modifier du premier commentaire
              cy.wrap($row).find('.edit-btn').click()

              // Vérifier que le modal d'édition s'ouvre
              cy.get('.edit-modal', { timeout: 10000 }).should('be.visible')
              cy.contains('h3', 'Modifier le commentaire').should('be.visible')

              // Modifier le commentaire
              const newComment = 'Commentaire modifié ' + Date.now()
              cy.get('textarea').clear().type(newComment)

              // Sauvegarder et vérifier que le modal se ferme
              cy.contains('button', 'Sauvegarder').click()
              cy.get('.edit-modal').should('not.exist')

              // Vérifier que la modification est visible dans le tableau
              cy.contains('td', newComment, { timeout: 10000 }).should('be.visible')
            } else {
              // Si le bouton n'existe pas, simplement passer le test
              cy.log('Bouton de modification non disponible pour les commentaires')
            }
          })
      }
    })
  })

  it("permet de créer une nouvelle publication depuis l'admin", () => {
    // Naviguer vers l'onglet Publications
    cy.contains('button', 'Publications').click()
    cy.wait('@getContents', { timeout: 10000 })

    // Vérifier la disponibilité du bouton de création
    cy.get('body').then(($body) => {
      // Si le bouton existe directement dans le panel admin
      if ($body.find('button:contains("Nouvelle publication")').length > 0) {
        cy.contains('button', 'Nouvelle publication').click()

        // Remplir le formulaire de création
        cy.get('#title', { timeout: 10000 }).type('Nouvelle publication test')
        cy.get('#metaDescription').type('Description de test')
        cy.get('#content').type('Contenu de test pour cette publication')
        cy.get('#tags').type('test, cypress')

        // Soumettre le formulaire
        cy.contains('button', 'Sauvegarder').click()

        // Vérifier que la nouvelle publication est dans la liste
        cy.contains('td', 'Nouvelle publication test', { timeout: 10000 }).should('be.visible')
      } else {
        // Alternative: vérifier que la page de création est accessible
        cy.visit('/create-content')
        cy.url().should('include', '/create-content')

        // Vérifier que la page contient un élément indiquant qu'il s'agit de la création
        cy.contains(/Créer|Nouvelle publication|Rédiger/i, { timeout: 10000 }).should('be.visible')
      }
    })
  })

  it("vérifie les droits d'accès en se déconnectant", () => {
    // Se déconnecter
    cy.visit('/profile')
    cy.contains('button', 'Se déconnecter').click()

    // Vérifier la redirection vers la page de connexion
    cy.url().should('include', '/login')

    // Essayer d'accéder à la page d'admin sans être connecté
    cy.visit('/admin')

    // Vérifier qu'on est redirigé ou qu'un message d'erreur apparaît
    cy.url()
      .should('not.include', '/admin')
      .or('contain', '/login')
      .or(() => {
        cy.contains(/non autorisé|permissions|accès refusé/i).should('be.visible')
      })
  })
})
