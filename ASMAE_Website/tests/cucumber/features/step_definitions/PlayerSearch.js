module.exports = function () {
 
    this.When(/^I click on Rechercher un joueur$/,function(){
        client.waitForExist('#PlayerSearchButtonMenu');
        client.waitForVisible('#PlayerSearchButtonMenu');
        client.click('#PlayerSearchButtonMenu');
        client.pause(500);
        client.waitForExist('#permSelect');
        client.waitForVisible('#permSelect');
        client.click('#permSelect');
        client.waitForVisible('option[value="Admin"]');
        client.click('option[value="Admin"]');
    });

    this.Then(/^I should see the informations about the research between players$/,function(){
        var title = '#HeaderSearchAPlayer';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Rechercher un joueur');
     
    });

}