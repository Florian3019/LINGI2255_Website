
module.exports = function () {
    this.When(/^I click on Feuille de poule$/,function(){
            client.waitForExist('#PoolSheetsButtonMenu')
            client.waitForVisible('#PoolSheetsButtonMenu')
            client.click('#PoolSheetsButtonMenu')
            client.pause(500)
        });


    this.Then(/^I should see the page showing the possibility to print the tournament sheets$/,function(){
        var title = '#HeaderSheetPrintTestID';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Impression feuille de poule');

    
    });

}