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
        // a allows drag and drop
        // b allows to see the pool/poolmanager/...

        var a = "#"+server.call('getOnePairId')
        client.waitForExist(a)
        var b = '#'+'clickOnIt'+server.call('getOnePoolId')
        var c = '#a'+server.call('getPreviousPoolId')
        //client.click(b)
        client.waitForExist(b)
        client.waitForExist(c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.dragAndDrop(a,c)
        client.click(a)
        client.click(a)
        client.click(a)
        client.click(a)
        client.click(a)
        client.click(a)
        client.click(a)
        client.click(a)
        client.click(a)
        client.click(a)

    });

}