module.exports = function () {
    this.When(/^I navigate to the tournament registration page$/, function () {
        client.url(process.env.ROOT_URL + 'inscription-tournoi');
    });

    this.Given(/^An admin launched the tournament registrations for this year$/, function(){
        pending();
    });

}
