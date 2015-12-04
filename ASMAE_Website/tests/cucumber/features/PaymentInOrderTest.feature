Feature: Manage the pools

    As an admin
    I want to manage the pools

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: Authenticated user can register to the tournament
        Given I am logged in
        And The database has been populated
        When I click on Paiements en ordre
        Then I should see the page that checks the payments