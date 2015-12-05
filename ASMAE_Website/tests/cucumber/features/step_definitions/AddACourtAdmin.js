
module.exports = function () {
    this.When(/^I click on Ajouter un Terrain$/,function(){
            client.waitForExist('#AddCourtButtonMenu')
            client.waitForVisible('#AddCourtButtonMenu')
            client.click('#AddCourtButtonMenu')
            client.pause(500)
        });


    this.Then(/^I should see the Add Court page for admin$/,function(){
        var title = '#AddCourtAdminHeader';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Ajouter un terrain');
    });

}