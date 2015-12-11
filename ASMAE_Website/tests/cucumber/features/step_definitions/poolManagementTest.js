module.exports = function () {
    this.Given(/^The database has been populated$/, function () {
        client.waitForExist('#popdbtest')
        client.click('#popdbtest')
        client.click('#tournamentNavigation');
        this.server.call('addYear2015Tests');

        client.pause(9000);
	
	client.waitForExist('#GestionDuTournoiButtonMenu')
        client.click('#GestionDuTournoiButtonMenu')
        client.waitForVisible('#Year')
        client.waitForExist('#Year');
        client.click('#Year')
        client.waitForExist('option[value="2015"]')
        client.click('option[value="2015"]')
        client.waitForExist('#btn_men')
        client.click('#btn_men')
        client.waitForExist('#btn_men_preminimes')
        client.click('#btn_men_preminimes')
        client.waitForExist('#Poules')
        client.click('#Poules')
        client.pause(4000)
        // a allows drag and drop
        // b allows to see the pool/poolmanager/...

    }); 

    this.When(/^I click on a poolManagement$/,function(){
        var b = '#'+'clickOnIt'+server.call('getOnePoolId')
        
        client.waitForExist(b)
        client.waitForVisible(b)
        client.click(b)
    });

    this.Then(/^I should see the page of the points encoding$/,function(){
        
        var title3 = '#ConsignesHeader';
        browser.waitForExist(title3);
        expect(browser.getText(title3)).toEqual('Les paires dans la colonne jouent contre les paires de la ligne.');
    });

}
