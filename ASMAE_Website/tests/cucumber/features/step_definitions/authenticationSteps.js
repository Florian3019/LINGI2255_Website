module.exports = function () {

    this.Given(/^I am logged in$/, function () {
        browser.url(process.env.ROOT_URL);
        browser.waitForExist('body *');
        browser.waitForExist('a.dropdown-toggle');
        browser.waitForExist('#login-dropdown-list');
        browser.click('a.dropdown-toggle');
        browser.setValue('#login-email', 'test@test.com');   //Test email
        browser.setValue('#login-password', '123456');       //Test password
        browser.click('#login-buttons-password');
    });

    this.Given(/^I am not logged in$/, function () {
        this.AuthenticationHelper.logout();
    });
}
