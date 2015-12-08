Feature: Check that the page of the forum is still available

    As an admin
    I want to manage the forum

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: 
        Given I am logged in
        And The database has been populated
        When I click on Voir le Forum
        Then I should see the Forum page