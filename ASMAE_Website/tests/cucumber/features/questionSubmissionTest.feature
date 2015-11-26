Feature: Register to the tournament

    As a user
    I want to submit a question

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: Authenticated user can register to the tournament
        Given I am logged in
        And The tournament inscriptions were launched
        When I navigate to the question page
        