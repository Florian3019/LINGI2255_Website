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
                { key: 'emaiushshls', label: 'Email', fn: function(value, object){
                    return value[0].address;
                }},
                { key: 'profile.gender', label:"Sexe"},
                { key: 'profile.phone', label: "Numéro"},
                { key: 'profile.birthDate', label: "Naissance", fn: function(value, object){ return (value==null || typeof value === "undefined") ? "undefined" : value.toLocaleDateString()}},
                { key: 'profile.AFT', label: "AFT"},
                { key: 'profile.addressID', label: "Addresse", fn: function(value, object){
                    addr = Addresses.findOne({"_id":value});
                    if(addr==undefined) return "Pas défini";
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
            filters: ['NomDeFamille','Prenom']
        }
    }
    
});

Template.mySpecialFilterLastName.created = function () {
  this.filter = new ReactiveTable.Filter('NomDeFamille', ['profile.lastName']);
};

Template.mySpecialFilterLastName.events({
    "keyup":function(event,template){
        console.log(event.target.value);
        var input = event.target.value;
        console.log(input)
        console.table(Meteor.users.find({$where: function(){return this.profile.lastName.indexOf(input)>-1;}}).fetch())
        template.filter.set(input);    
        
        
    }


});

Template.mySpecialFilterFirstName.created = function () {
  this.filter = new ReactiveTable.Filter('Prenom', ['_id']);
};

Template.mySpecialFilterFirstName.events({
    "keyup":function(event,template){
        console.log(event.target.value);
        var input = event.target.value;
        console.log(input)
        if(input!=""){
        var userList = Meteor.users.find({$where: function(){return this.emails[0].address.indexOf(input)>-1;}}).fetch();
        var monString = "";
        for(var i = 0;i<userList.length;i++){
            console.log("salut")
            monString += userList[i]._id+" ";
        }

        template.filter.set(monString);    
        }
        else{
            template.filter.set('');
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
