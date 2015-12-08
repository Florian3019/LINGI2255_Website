Feature: Check the good working of Deroulement du tournoi

    As an admin
    I want to manage the tournament

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: 
        Given I am logged in
        And The database has been populated
        When I click on Deroulement du tournoi
        Then I should see the informations about the tournament appears