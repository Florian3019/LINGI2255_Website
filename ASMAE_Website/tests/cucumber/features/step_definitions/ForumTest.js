
module.exports = function () {
    this.When(/^I click on Voir le Forum$/,function(){
            client.waitForExist('#ForumButtonMenu')
            client.waitForVisible('#ForumButtonMenu')
            client.click('#ForumButtonMenu')
            client.pause(500)
        });


    this.Then(/^I should see the Forum page$/,function(){
        var title = '#ForumHeaderTests';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Forum');
    });

}