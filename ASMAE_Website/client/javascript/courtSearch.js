// var options = {
//   keepHistory: 1000 * 60 * 5,
//   localSearch: true
// };
// var fields = ['street', 'number', 'city', 'zipCode'];

// CourtSearch = new SearchSource('courtsSearch', fields, options);

// Template.courtSearch.helpers({
//   'getCourts': function() {
//     return CourtSearch.getData({
//       transform: function(matchText, regExp) {
//         return matchText.replace(regExp, "<b>$&</b>");
//       }
//     });
//   },

//   'isLoading': function() {
//     return CourtSearch.getStatus().loading;
//   },

//   'courtInfos': function(addr){
//     var court = Courts.findOne({addressID: addr._id});
//     var result = {};
//     result.court = court;
//     result.address = addr;
//     return result;
//   },

//   'courtOwner': function(ownerID){
//     var owner = Meteor.users.findOne(ownerID);
//     if(owner.profile.firstName){
//       return owner.profile.firstName + " " + owner.profile.lastName;
//     }
//     else{
//       return owner.emails[0].address;
//     }
//   },

//   'checkedForDay': function(day){
//     if(day){
//       return "glyphicon-ok lendOk"
//     }
//     else
//     {
//       return "glyphicon-remove lendNot"
//     }
//   }

// });

// Template.courtSearch.rendered = function() {
//   CourtSearch.search(' ');
// };

// Template.courtSearch.events({
//   "keyup #search-box": _.throttle(function(e) {
//     var text = $(e.target).val().trim();
//     CourtSearch.search(text);
//   }, 200)
// });

Template.allCourtsTable.helpers({
    courtsCollection: function () {
        return Courts.find();
    },

    settings : function(){
      return {
        fields:[
          { key: 'ownerID', label: 'Owner', fn: function(value, object){
            user= Meteor.users.findOne({_id:value},{"profile":1});
            return user.profile.firstName + " " + user.profile.lastName;
          }},
          { key: 'addressID', label: 'Addresse' , fn: function(value, object){
            addr = Addresses.findOne({"_id":value});
            var ret = ""
                    if(addr.street != undefined) {
                        ret = ret+addr.street + ", ";
                    }
                    if(addr.number != undefined) {
                        ret = ret+addr.number + ", ";
                    }
                    if(addr.box != undefined) {
                        ret = ret+addr.box + ", ";
                    }
                    if(addr.city != undefined) {
                        ret = ret+addr.city + ", ";
                    }
                    if(addr.zipCode != undefined) {
                        ret = ret+addr.zipCode + ", ";
                    }
                    if(addr.country != undefined) {
                        ret = ret+addr.country;
                    }
                    return ret
          }},
          { key: 'surface', label: "Surface"},
          { key: 'dispoSamedi', label:"Samedi", tmpl:Template.dispoSaturdayLabel},
          { key: 'dispoDimanche', label:"Dimanche", tmpl:Template.dispoSundayLabel},
          { key: 'lendThisYear', label:"Loué", tmpl:Template.dispoLendLabel},
          { key: 'courtType', label:"Type"}
      ]
      }
    }
});

Template.courtSearch.events({
    'click .reactive-table tbody tr' : function(event){
        Router.go('courtInfoPage',{_id:this._id});
    }
});
