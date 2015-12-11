Feature: As An admin, I want to be able to see the modifications logs

    As An admin, I want to be able to see the modifications logs

    Background: Tournament registrations launched
        Given An admin has been created
        
    @watch
    Scenario: 
        Given I am logged in
        And The database has been populated
        When I click on Log des modifications
        Then I should see the page showing the list of all logs corresponding to modifications