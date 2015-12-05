Feature: Check if the page Recherche d'un terrain Admin is still correctly shown

    As an admin
    I want to search through courts

    Background: Tournament registrations launched
        Given An admin has been created
        
    @ignore
    Scenario: Authenticated user can register to the tournament
        Given I am logged in
        And The database has been populated
        When I click on Rechercher un Terrain
        Then I should see the Court Search page