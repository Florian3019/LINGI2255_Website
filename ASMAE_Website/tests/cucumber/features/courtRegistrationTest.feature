Feature: Register a court

    As a court owner
    I want to register a court
    So the players can play on my court during a tournament

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: authenticated user can register a court
        Given I am logged in
        And The tournament inscriptions were launched
        When I navigate to the court registration page
        And I fill in information on my court and submit the form
        Then I should see a confirmation page of the court registration
