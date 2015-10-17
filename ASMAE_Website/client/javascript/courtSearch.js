var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
//var fields = ['street', 'city', 'zipCode', 'courtType', 'surface'];
var fields = ['street', 'city', 'zipCode'];

CourtSearch = new SearchSource('courtsSearch', fields, options);

Template.courtSearch.helpers({
  getCourts: function() {
    return CourtSearch.getData({
      transform: function(matchText, regExp) {
        return matchText.replace(regExp, "<b>$&</b>");
      }
    });
  },
  
  isLoading: function() {
    return CourtSearch.getStatus().loading;
  },

  courtInfos: function(addr){
    var court = Courts.findOne({addressID: addr._id});
    var result = {};
    result.court = court;
    result.address = addr;
    return result;
  }

});

Template.courtSearch.rendered = function() {
  CourtSearch.search('');
};

Template.courtSearch.events({
  "keyup #search-box": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    CourtSearch.search(text);
  }, 200)
});