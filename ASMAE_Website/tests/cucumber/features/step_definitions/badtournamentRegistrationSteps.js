module.exports = function () {
    this.When(/^I fill nothing in the inscription form but submit$/, function () {
       client.click('button#submit.btn.btn-default');
        
    });

    this.Then(/^I should see the correct errors corresponding to the unfilled boxes$/, function() {
        var lastNameError = browser.getText("#lastnameError");
        expect(lastNameError).toEqual("Merci d'entrer votre nom");
        var firstNameError = browser.getText("#firstnameError");
        expect(firstNameError).toEqual("Merci d'entrer votre prénom");
        var dayError = browser.getText("#dayError");
        expect(dayError).toEqual("Merci d'entrer le jour");
        var monthError = browser.getText("#monthError");
        expect(monthError).toEqual("Merci d'entrer le mois");
        var yearError = browser.getText("#yearError");
        expect(yearError).toEqual("Merci d'entrer l'année");
        var sexError = browser.getText("#sexErrorText");
        var streetError = browser.getText("#streetErrorText");
        expect(streetError).toEqual("Merci d'entrer votre rue");
        var numberError = browser.getText("#numberErrorText");
        var zipcodeError = browser.getText("#zipcodeErrorText");
        var cityError = browser.getText("#cityErrorText");
        //expect(numberError).toEqual("Merci d'entrer votre numéro");
        //expect(zipcodeError).toEqual("Merci d'entrer votre code postal");
        //expect(cityError).toEqual("Merci d'entrer votre ville");
        
    });
}