Feature: Send Mail to court owners

    As an admin
    I want to be able to send mails to court owners

    Background: Tournament registrations launched
        Given An admin has been created
        
    @ignore
    Scenario:
        Given I am logged in
        And The database has been populated
        When I click on envoi de mail aux gestionnaires de terrains
        Then I should see the page that allow to send emails to court owners