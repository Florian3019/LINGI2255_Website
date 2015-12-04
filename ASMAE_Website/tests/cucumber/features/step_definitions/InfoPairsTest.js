module.exports = function () {
    this.When(/^I click on a special Pair$/, function () {
        
        var a = "#"+server.call('getOnePairId')
        client.waitForExist(a)
        client.waitForVisible(a)
        client.click(a)

    });

}