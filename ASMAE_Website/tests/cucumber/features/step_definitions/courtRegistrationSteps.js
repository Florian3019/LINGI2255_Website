(function() {
module.exports = function () {

    this.Given(/^An admin has been created$/, function(){
          this.server.call('addUserAdmin');
    });

    this.When(/^I navigate to the court registration page$/, function() {
        browser.click('#courtRegistrationButton');
    });

    this.When(/^I fill in information on my court and submit the form$/, function() {
        //browser.waitForExist('body');
        //browser.waitForVisible('body');
        //browser.waitForExist('#courtRegistrationForm');
        //browser.waitForVisible('#courtRegistrationForm');
        browser.waitForExist('#dispoDimanche');
        browser.waitForVisible('#dispoDimanche');

        client.setValue('#street', 'Rue des wallons');
        client.setValue('#addressNumber', '1');
        client.setValue('#city', 'Louvain-la-Neuve');
        client.setValue('#zipCode', '1348');
        client.setValue('#country', 'Belgique');
        client.click('#surface');
        client.click('option[value="Gazon"]')
        client.click('[value="privé"]');
        client.setValue('#numberOfCourts', '1');
        client.setValue('#instructions', 'Passez par le jardin.');
        client.click('#dispoDimanche');

        client.click('#SubmitIt');
    });

    this.Then(/^I should see a confirmation page of the court registration$/, function(){
        browser.waitForExist('.panel-title');
        var panelTitle = browser.getText('.panel-title');
        expect(panelTitle).toEqual("Confirmation de l'enregistrement de votre terrain");

        //Get the surface value (This is an example. It's better to do it for every value).
        browser.waitForExist('tbody tr:nth-child(9) td:nth-child(2)');
        var surfaceValue = browser.getText('tbody tr:nth-child(9) td:nth-child(2)');
        expect(surfaceValue).toEqual("Gazon");

    });

    /*
        Don't check databases with cucumber: only check what user can see !

    this.Then(/^the information about the court should be saved in the database$/, function(){
        client.url(function(err, res) {     //To get current URL (inside res)

            var urlSplitted = res.value.split('/');
            var courtID = urlSplitted[urlSplitted.length-1];

            server.call('getCourt', courtID).then(function(result){
                console.log(result);
                expect(result.court.surface).toEqual("Gazon");
            });

        });
    });
    */

}
})();
