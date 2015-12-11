Feature: Check that the knock off is correctly working

    As an admin
    I want to manage the forum

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: 
        Given I am logged in
        And The database has been populated
        When I navigate to the knockoff page
        Then I should see the knockoff page