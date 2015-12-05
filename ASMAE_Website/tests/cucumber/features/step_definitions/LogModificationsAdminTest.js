
module.exports = function () {
    this.When(/^I click on Log des modifications$/,function(){
            client.waitForExist('#LogModificationsButtonMenu')
            client.waitForVisible('#LogModificationsButtonMenu')
            client.click('#LogModificationsButtonMenu')
            client.pause(500)
        });


    this.Then(/^I should see the page showing the list of all logs corresponding to modifications$/,function(){
        var title = '#ModificationLogsHeaderID';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Historique des modifications');

    
    });

}