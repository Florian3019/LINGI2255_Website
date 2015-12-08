Feature: Check that the page to add a court is still showing for the admin members

    As an admin
    I want to add courts

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: 
        Given I am logged in
        And The database has been populated
        When I click on Staff FAQ
        Then I should see the Staff FAQ page