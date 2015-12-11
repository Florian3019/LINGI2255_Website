
module.exports = function () {
    this.When(/^I navigate to the knockoff page$/,function(){
        
        client.waitForExist('#KnockOff')
        client.click('#KnockOff')
        });


    this.Then(/^I should see the knockoff page$/,function(){
        var title = '#startText';
        browser.waitForExist(title);
        browser.pause(20000)
        expect(browser.getText(title)).toEqual('Démarrer ce knock-off');
    });

}