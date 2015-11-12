// Template.playersInfo.events({
//    'submit form': function(){
//       event.preventDefault();
//         var lastName = event.target.lastname.value;
//         var firstName = event.target.firstname.value;
//         var email = event.target.email.value;
//         var sex = event.target.sex.value;
//         var rank = event.target.rank.value;
//         var query = {};
//         if(lastName){query["profile.lastName"] = lastName;}
//         if(firstName){query["profile.firstName"] = firstName;}
//         if(email){query["emails.address"] = email;}
//         if(sex) {query["profile.gender"] = sex;}
//         if(rank) {query["profile.AFT"] = rank;}
//         cursor = Meteor.users.find(query).fetch();
//         Session.set('cursor', cursor);
//         return false;
//     },
//     'click li': function() {
//         Session.set('selected', this);
//         Router.go('playerInfoPage');
//     }
// });
// Template.playersInfo.helpers({
//     'player': function(){
//         return Session.get('cursor');
//     },
//     'getAll' : function(){
//     	return Meteor.users.find();
//     },
//     'getEmail' : function(){
// 		return this.emails[0].address;
// 	}
// });


Template.playersInfo.helpers({
    userCollection: function () {
        return Meteor.users.find();
    },

    settings : function(){
        return {
            fields:[
                { key: 'profile.firstName', label: 'Prénom'},
                { key: 'profile.lastName', label: 'Nom'},
                { key: 'emails', label: 'Email', fn: function(value, object){
                    return value[0].address;
                }},
                { key: 'profile.gender', label:"Sexe"},
                { key: 'profile.phone', label: "Numéro"},
                { key: 'profile.birthDate', label: "Naissance", fn: function(value, object){ return (value==null || typeof value === "undefined") ? "undefined" : value.toLocaleDateString()}},
                { key: 'profile.AFT', label: "AFT"},
                { key: 'profile.addressID', label: "Addresse", fn: function(value, object){
                    addr = Addresses.findOne({"_id":value});
                    if (typeof addr === "undefined") {
                        return "undefined";
                    }
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
                { key: 'profile.isStaff', label:'Staff'},
                { key: 'profile.isAdmin', label:'Admin'},
            ],
            rowClass:"playerInfoRow"

        }
    }
});

Template.playersInfo.events({
    'click .playerInfoRow' : function(event){
        //Router.go('playerInfoPage',{_id:this._id});
        Session.set('selected', this);
        Router.go('playerInfoPage');
    }
});
