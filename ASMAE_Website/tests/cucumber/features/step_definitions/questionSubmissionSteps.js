module.exports = function () {
    this.When(/^I navigate to the question page$/,function() {
        browser.waitForExist('#askQuestion');
        browser.click("#askQuestion");
        browser.waitForExist('#firstname');
        browser.setValue('#fistname','Josey');
        browser.setValue('#lastname','Dupont');
        browser.setValue('#question','Bonjour, j"ai une petite question : Quand se déroulera le tournoi ?');
        browser.click("#sub");        
        browser.alertAccept();
    });
    
}
