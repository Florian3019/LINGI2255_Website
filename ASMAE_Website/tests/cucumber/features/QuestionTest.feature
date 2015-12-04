Feature: Check how questions can be asked

    As an admin
    I want to ask a question
    but also see all the questions asked previously

    Background: Tournament registrations launched
        Given An admin has been created
        
    @ignore
    Scenario: Authenticated user can register to the tournament
        Given I am logged in
        And The database has been populated
        When I click on Poser une Question
        And I fill the Question plus submit it
        And I go back to questions asked
        Then I should see the page that shows the questions