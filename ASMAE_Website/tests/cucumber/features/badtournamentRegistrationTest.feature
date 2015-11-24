Feature: Incorrect fill of the form

    As a user
    I want to register to the tournament
    So I can participate in the tournament
    But I don't fill the form correctly

    Background: Tournament registrations launched
        Given An admin has been created

    @watch
    Scenario: Authenticated user can register to the tournament
        Given I am logged in
        When I navigate to the tournament registration page
        And I fill nothing in the inscription form but submit
        Then I should see the correct errors corresponding to the unfilled boxes