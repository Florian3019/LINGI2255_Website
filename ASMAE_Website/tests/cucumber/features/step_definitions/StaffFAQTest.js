
module.exports = function () {
    this.When(/^I click on Staff FAQ$/,function(){
            client.waitForExist('#StaffFAQButtonMenu')
            client.waitForVisible('#StaffFAQButtonMenu')
            client.click('#StaffFAQButtonMenu')
            client.pause(500)
        });


    this.Then(/^I should see the Staff FAQ page$/,function(){
        var title = '#StaffFAQHeaderTests';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Staff FAQ');
    });

}