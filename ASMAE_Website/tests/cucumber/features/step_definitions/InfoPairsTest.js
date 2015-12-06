module.exports = function () {
    this.When(/^I click on a special Pair$/, function () {
        
        var a = "#"+server.call('getOnePairId')
        client.waitForExist(a)
        client.waitForVisible(a)
        client.pause(2000)
        client.click(a)
        client.click(a)
        client.pause(2000)
    });

    this.Then(/^I should see correct informations on the pair$/,function(){
        var title = '#HeaderPairObservation';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual("Information sur la paire");

/*
        //PLAYER 1 CORRECTLY SHOWN
        var title1 = '#WishesOnPlayersValue1';
        browser.waitForExist(title1);
        expect(browser.getText(title1)).toEqual("Souhaits sur les joueurs");

        var title2 = '#WishesOnCourtValue1';
        browser.waitForExist(title2);
        expect(browser.getText(title2)).toEqual("Souhaits sur un terrain");

        var title3 = '#OtherWishesValue1';
        browser.waitForExist(title3);
        expect(browser.getText(title3)).toEqual("Autres souhaits");

        //PLAYER 2 CORRECTLY SHOWN
        var title1 = '#WishesOnPlayersValue2';
        browser.waitForExist(title1);
        expect(browser.getText(title1)).toEqual("Souhaits sur les joueurs");

        var title2 = '#WishesOnCourtValue2';
        browser.waitForExist(title2);
        expect(browser.getText(title2)).toEqual("Souhaits sur un terrain");

        var title3 = '#OtherWishesValue2';
        browser.waitForExist(title3);
        expect(browser.getText(title3)).toEqual("Autres souhaits");*/
    });
}