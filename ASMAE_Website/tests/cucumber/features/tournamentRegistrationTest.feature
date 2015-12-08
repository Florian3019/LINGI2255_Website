Feature: Register to the tournament

    As a user
    I want to register to the tournament
    So I can participate in the tournament

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: 
        Given I am logged in
        And The tournament inscriptions were launched
        When I navigate to the tournament registration page
        And I fill in the formulary to play with a friend
        Then I should see a confirmation page of my inscription