module.exports = function () {
    this.When(/^I navigate to the tournament registration page$/, function () {
        
        browser.waitForExist('a#Droop.dropdown-togglebis');
        browser.click('a#Droop.dropdown-togglebis');
        browser.waitForExist('a#Registr');
        browser.click('a#Registr');
    });

    this.Given(/^An admin launched the tournament registrations for this year$/, function(){
        pending();
    });

    this.When(/^I fill in the formulary to play with a friend$/, function () {
        client.setValue('#lastname', 'LeDoux');
    	client.setValue('#firstname', 'José');
    	client.setValue('#birthDay', '23');
    	client.setValue('#birthMonth', '9');
    	client.setValue('#birthYear', '1994');
    	client.click('#male');
    	client.setValue('#phone', '0473383143');
    	client.setValue('#street', 'Place de l université');
    	client.setValue('#addressnumber', '23');
    	client.setValue('#box','123b');
    	client.setValue('#zipcode','1348');
    	client.setValue('#city','Louvain La Neuve');
    	client.setValue('#country','Belgique');
    	client.click('#Virement');
    	client.setValue('#playerWishes','Avoir une grande piscine et plein d argent');
    	client.click('select#rank.form-control');
        client.click('option[value="C30.5 "]');
        client.click('select#dateMatch.form-control.dateMatch');
        client.click('option[value="saturday"]');
    	client.setValue('#emailPlayer','serge@serge.com');
    	client.click('button#submit.btn.btn-default');
    });

    this.Then(/^I should see a confirmation page of my inscription$/, function() {
        browser.waitForExist('div.panel-heading');
        var title = browser.getText('#Status');
        expect(title).toEqual("Statut de votre inscription : En attente d'un partenaire");
        var mail = browser.getText('#Email');
        expect(mail).toEqual("test@test.com");
        //Get the surface value (This is an example. It's better to do it for every value).
    	var phone = browser.getText('#phone');
        var dob = browser.getText('#birth');
        var sex = browser.getText('#sex');
        var address = browser.getText('#address');
		var city = browser.getText('#city');
		var country = browser.getText('#land');
		var rank = browser.getText('#rank');
		var paiement = browser.getText('#paiement');

        expect(phone).toEqual("0473/38.31.43");
        expect(dob).toEqual("23/9/1994");
        expect(sex).toEqual("M");
        expect(address).toEqual("23, Place de l université. Boite 123b");
		expect(city).toEqual("1348 Louvain La Neuve");
        expect(country).toEqual("Belgique");
        expect(rank).toEqual("C30.5");
        expect(paiement).toEqual("Virement bancaire");
        
        
        
    });
}
