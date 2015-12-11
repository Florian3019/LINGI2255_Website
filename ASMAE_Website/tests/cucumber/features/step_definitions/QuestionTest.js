module.exports = function () {
    this.When(/^I click on Poser une Question$/,function(){
            client.waitForExist('#askQuestion')
            client.waitForVisible('#askQuestion')
            client.click('#askQuestion')
            client.pause(500)
        });

    this.When(/^I fill the Question plus submit it$/,function(){
            client.setValue('#firstname','Serge')
            client.setValue('#lastname','Dupond')
            client.setValue('#question','Voila le contenu de l ensemble de ma question')
            client.waitForExist('#sub')
            client.waitForVisible('#sub')
            client.click('#sub')
            client.pause(200)
            client.waitForExist('button.confirm')
            client.click('button.confirm')
        });

    this.When(/^I go back to questions asked$/,function(){
            client.waitForExist('#tournamentNavigation')
            client.waitForVisible('#tournamentNavigation')
            client.click('#tournamentNavigation')
            
            client.waitForExist('#PlayerQuestionsButtonMenu')
            client.waitForVisible('#PlayerQuestionsButtonMenu')
            client.click('#PlayerQuestionsButtonMenu')
            client.pause(200)
        });

    this.Then(/^I should see the page that shows the questions$/,function(){
        var title = '#HeaderStaffManagementQuestion';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Questions des joueurs');
    });

}