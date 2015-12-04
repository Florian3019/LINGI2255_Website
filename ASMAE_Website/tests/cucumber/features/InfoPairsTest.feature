Feature: Manage the pools

    As an admin
    I want to manage the pools

    Background: Tournament registrations launched
        Given An admin has been created
        
    @ignore
    Scenario: Authenticated user can register to the tournament
        Given I am logged in
        And The database has been populated
        When I click on a special Pair
        Then I should see correct informations on the pair