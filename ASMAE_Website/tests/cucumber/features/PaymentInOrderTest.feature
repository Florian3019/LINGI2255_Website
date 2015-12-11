Feature: Check the payments

    As an admin
    I want to check the payments

    Background: Tournament registrations launched
        Given An admin has been created
        
    @ignore
    Scenario:
        Given I am logged in
        And The database has been populated
        When I click on Paiements en ordre
        Then I should see the page that checks the payments