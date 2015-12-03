module.exports = function () {
    this.Given(/^The database has been populated$/, function () {
        client.waitForExist('#popdbtest')
        client.click('#popdbtest')
        client.click('#tournamentNavigation');


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
        var a = "#"+server.call('getOnePairId')
        
        client.waitForExist(a)
        client.click(a)
    });

}