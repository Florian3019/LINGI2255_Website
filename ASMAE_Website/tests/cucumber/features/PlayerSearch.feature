Feature: Search amongst players

    As an admin
    I want to Search amongst players

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: 
        Given I am logged in
        And The database has been populated
        When I click on Rechercher un joueur
        Then I should see the informations about the research between players
