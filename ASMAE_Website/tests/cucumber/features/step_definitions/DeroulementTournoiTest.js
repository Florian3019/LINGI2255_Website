module.exports = function () {
 
    this.When(/^I click on Deroulement du tournoi$/,function(){
        client.waitForExist('#DeroulementTournoiButton');
        client.waitForVisible('#DeroulementTournoiButton');
        client.click('#DeroulementTournoiButton');
        client.pause(500);
    });

    this.Then(/^I should see the informations about the tournament appears$/,function(){
        
        var title = '#TournamentRunning';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Déroulement du tournoi');
    
        var title1 = '#AvailabilitiesPoint1';
        browser.waitForExist(title1);
        expect(browser.getText(title1)).toEqual('1. Lancer les inscriptions au tournoi');

        var title2 = '#AvailabilitiesPoint2';
        browser.waitForExist(title2);
        expect(browser.getText(title2)).toEqual('2. Envoyer un email d\'invitation à tous les utilisateurs');

        var title3 = '#AvailabilitiesPoint3';
        browser.waitForExist(title3);
        expect(browser.getText(title3)).toEqual('3. Accepter les terrains');

        var title4 = '#AvailabilitiesPoint4';
        browser.waitForExist(title4);
        expect(browser.getText(title4)).toEqual('4. Fermer les inscriptions');

        var title5 = '#AvailabilitiesPoint5';
        browser.waitForExist(title5);
        expect(browser.getText(title5)).toEqual('5. Gérer les poules');

        var title6 = '#AvailabilitiesPoint6';
        browser.waitForExist(title6);
        expect(browser.getText(title6)).toEqual('6. Assigner les terrains aux poules');

        var title7 = '#AvailabilitiesPoint7';
        browser.waitForExist(title7);
        expect(browser.getText(title7)).toEqual('7. Envoyer un email aux joueurs et aux chefs de poules'); 
        
        var title8 = '#AvailabilitiesPoint8';
        browser.waitForExist(title8);
        expect(browser.getText(title8)).toEqual('8. Terminer le tournoi'); 
    });

}