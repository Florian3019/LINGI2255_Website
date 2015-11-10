SearchSource.defineSource('courtsSearch', function(searchText, options) {
  var options = {};

  if(searchText) {
    var regExp = buildRegExp(searchText);
    /*
    var courtSelector = {$or: [
      {surface: regExp},
      {courtType: regExp}
    ]};
    */
    var addressSelector = {$or: [
      {street: regExp},
      {number: regExp},
      {city: regExp},
      {zipCode: regExp}
    ]};

    //return Courts.find(courtSelector, options).fetch().concat(Addresses.find(addressSelector, options).fetch());
    //return Courts.find(courtSelector, options).fetch();
    return Addresses.find(addressSelector, options).fetch();
  } else {
    return [];
  }
});

function buildRegExp(searchText) {
  // this is a dumb implementation
  var parts = searchText.trim().split(/[ \-\:]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}
