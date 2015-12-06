module.exports = function () {
 
    this.When(/^I click on Paiements en ordre$/,function(){
        client.waitForExist('#PaymentInOrderButtonMenu');
        client.waitForVisible('#PaymentInOrderButtonMenu');
        client.click('#PaymentInOrderButtonMenu');
    });

    this.Then(/^I should see the page that checks the payments$/,function(){
        

        var title = '#BigHeaderPayment';
        browser.waitForExist(title);
        expect(browser.getText(title)).toEqual('Joueurs pas en ordre de paiement');
     
    });

}