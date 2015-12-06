module.exports = function () {
    this.When(/^I click on Rechercher un Terrain$/,function(){
            client.waitForExist('#CourtSearchButtonMenu')
            client.waitForVisible('#CourtSearchButtonMenu')
            client.click('#CourtSearchButtonMenu')
            client.pause(500)
        });


    this.Then(/^I should see the Court Search page$/,function(){
        var title = '#CourtSearchHeader';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Rechercher un terrain');
    });

}