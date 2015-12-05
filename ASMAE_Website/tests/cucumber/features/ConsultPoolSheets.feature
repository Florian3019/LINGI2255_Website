Feature: As An admin, I want to be able to see the pdf of all the pools

    As An admin, I want to be able to see the pdf of all the pools

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: Authenticated user can register to the tournament
        Given I am logged in
        And The database has been populated
        When I click on Feuille de poule
        Then I should see the page showing the possibility to print the tournament sheets