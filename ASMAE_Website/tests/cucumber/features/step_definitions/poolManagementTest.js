module.exports = function () {
    this.Given(/^The database has been populated$/, function () {
        client.waitForExist('#popdbtest')
        client.click('#popdbtest')
        client.click('#tournamentNavigation');


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
        client.pause(1000)
        // a allows drag and drop
        // b allows to see the pool/poolmanager/...

    });

    this.When(/^I click on a poolManagement$/,function(){
        var b = '#'+'clickOnIt'+server.call('getOnePoolId')
        
        client.waitForExist(b)
        client.waitForVisible(b)
        client.click(b)
    });

}