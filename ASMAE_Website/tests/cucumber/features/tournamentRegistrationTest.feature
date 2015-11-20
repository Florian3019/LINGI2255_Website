Feature: Register to the tournament

    As a user
    I want to register to the tournament
    So I can participate in the tournament

    Background: Tournament registrations launched
        Given An admin launched the tournament registrations for this year

    @ignore
    Scenario: Authenticated user can register to the tournament
        Given I am logged in
        When I navigate to the tournament registration page
        And I fill in correct information
