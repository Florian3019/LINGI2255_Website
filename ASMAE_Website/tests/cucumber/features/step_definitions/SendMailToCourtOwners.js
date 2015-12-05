
module.exports = function () {
    this.When(/^I click on envoi de mail aux gestionnaires de terrains$/,function(){
            client.waitForExist('#SendMailButtonMenu')
            client.waitForVisible('#SendMailButtonMenu')
            client.click('#SendMailButtonMenu')
            client.pause(500)
        });


    this.Then(/^I should see the page that allow to send emails to court owners$/,function(){
        var title = '#SendMailToCourtsHeader';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Contacter les gestionnaires de terrains');

        var title = '#ConsignesSendEmailID';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Le mail sera envoyé à tous les propriétaires selectionnés ci-dessous');
    });

}