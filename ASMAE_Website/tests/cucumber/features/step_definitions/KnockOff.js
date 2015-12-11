
module.exports = function () {
    this.When(/^I navigate to the knockoff page$/,function(){
        
        client.waitForExist('#KnockOff')
        client.click('#KnockOff')
        var title = '#HeaderKnockOffID';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Knock-offs Hommes en Pré Minimes');
        });


    this.Then(/^I should see the knockoff page$/,function(){
        /*
        browser.click('#startText');
        browser.waitForExist('button.confirm')
        browser.click('button.confirm')
        browser.waitForExist('input')
        browser.pause(5000)
        //browser.setValue('input',"2")
        browser.waitForExist('button.confirm')
        browser.click('button.confirm')                          

        browser.waitForExist('#continueToTournament')
        browser.click('#continueToTournament')
    */                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
        var title = '#HeaderKnockOffID';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Knock-offs Hommes en Pré Minimes');
    });

}