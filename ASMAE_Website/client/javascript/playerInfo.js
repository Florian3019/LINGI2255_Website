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
Template.mySpecialFilterEmail.events({
    'keyup .emailFilter':function(event){
        emailInput = event.currentTarget.value;
        console.log(emailInput);
        Session.set("playersInfo/emailInput", emailInput);
    }
});
Template.mySpecialFilterFirstName.events({
    'keyup .firstNameFilter':function(event){
        firstNameInput = event.currentTarget.value;
        console.log(firstNameInput);
        Session.set("playersInfo/firstNameInput", firstNameInput);
    }
});
Template.mySpecialFilterLastName.events({
    'keyup .lastNameFilter':function(event){
        lastNameInput = event.currentTarget.value;
        console.log(lastNameInput);
        Session.set("playersInfo/lastNameInput", lastNameInput);
    }
});
Template.mySpecialFilterPhone.events({
    'keyup .phoneFilter':function(event){
        phoneInput = event.currentTarget.value;
        console.log(phoneInput);
        Session.set("playersInfo/phoneInput", phoneInput);
    }
});
Template.mySpecialFilterRank.events({
    'keyup .rankFilter':function(event){
        rankInput = event.currentTarget.value;
        console.log(rankInput);
        Session.set("playersInfo/rankInput", rankInput);
    }
});
Template.mySpecialFilterAddress.events({
    'keyup .addressFilter':function(event){
        addressInput = event.currentTarget.value;
        console.log(addressInput);
        Session.set("playersInfo/addressInput", addressInput);
    }
});

Template.playersInfo.helpers({
    userCollection: function () {
        emailInput = Session.get("playersInfo/emailInput");
        if(emailInput!=undefined && emailInput!=""){
            return Meteor.users.find({$where: function(){if(this.emails[0].address!=null){return this.emails[0].address.indexOf(emailInput)>-1;}}});
        }
        firstNameInput = Session.get("playersInfo/firstNameInput");
        if(firstNameInput!=undefined && firstNameInput!=""){
            return Meteor.users.find({$where:function(){if(this.profile.firstName!=null){return this.profile.firstName.indexOf(firstNameInput)>-1}}});
        }
        lastNameInput = Session.get("playersInfo/lastNameInput");
        if(lastNameInput!=undefined && lastNameInput!=""){
            return Meteor.users.find({$where:function(){if(this.profile.lastName!=null){return this.profile.lastName.indexOf(lastNameInput)>-1}}});
        }
        phoneInput = Session.get("playersInfo/phoneInput");
        if(phoneInput!=undefined && phoneInput!="" ){
            return Meteor.users.find({$where:function(){
                if(this.profile.phone!=null){
                return this.profile.phone.indexOf(phoneInput)>-1}}});
        }
        rankInput = Session.get("playersInfo/rankInput");
        if(rankInput!=undefined && rankInput!="" ){
            return Meteor.users.find({$where:function(){
                if(this.profile.AFT!=null){
                return this.profile.AFT.indexOf(rankInput)>-1}}});
        }

        addressInput = Session.get("playersInfo/addressInput");
        if(addressInput!=undefined && addressInput!="" ){
            return Meteor.users.find({$where:function(){
                var addid = this.profile.addressID
                var theAddress = Addresses.findOne({_id:addid})
                var theString = "";
                if(theAddress!=undefined &&theAddress!=null){
                    theString +=theAddress.city+" "
                    theString +=theAddress.street+" "
                    theString += theAddress.country+" "
                    theString += theAddress.box+" "
                    theString += theAddress.number+" "
                    theString += theAddress.zipCode+" " 
                }
                if(theString!=null && theString !=""){
                    console.log(theString)
                    return (theString.indexOf(addressInput)>-1)
                }
                }});
        }

        return Meteor.users.find();
    },

    settings : function(){
        return {
            fields:[
                { key: 'profile.lastName', label: 'Nom'},
                { key: 'profile.firstName', label: 'Prénom'},
                { key: 'emails', label: 'Email', fn: function(value, object){
                    return value[0].address;
                }},
                { key: 'profile.gender', label:"Sexe"},
                { key: 'profile.phone', label: "Numéro"},
                { key: 'profile.birthDate', label: "Naissance", fn: function(value, object){ return (value==null || typeof value === "undefined") ? "undefined" : value.toLocaleDateString()}},
                { key: 'profile.AFT', label: "AFT"},
                { key: 'profile.addressID', label: "Adresse", fn: function(value, object){
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
                { key: 'profile.isStaff', label:'Staff', tmpl:Template.isStaffLabel},
                { key: 'profile.isAdmin', label:'Admin', tmpl:Template.isAdminLabel},
            ],
             filters: ['NomDeFamille'],
             rowClass: "playerInfoRow"
        }
    }
    
});

// Template.mySpecialFilterLastName.created = function () {
//   this.filter = new ReactiveTable.Filter('NomDeFamille', ['profile.lastName']);
// };

// Template.mySpecialFilterLastName.events({
//     "keyup":function(event,template){
//         console.log(event.target.value);
//         var input = event.target.value;
//         console.log(input)
//         console.table(Meteor.users.find({$where: function(){return this.profile.lastName.indexOf(input)>-1;}}).fetch())
//         template.filter.set(input);    
        
        
//     }


// });

// Template.mySpecialFilterFirstName.created = function () {
//   this.filter = new ReactiveTable.Filter('Prenom', ['_id']);
// };

// Template.mySpecialFilterFirstName.events({
//     "keyup":function(event,template){
//         console.log(event.target.value);
//         var input = event.target.value;
//         console.log(input)
//         if(input!=""){
//         // var userList = Meteor.users.find().fetch();
//         // var monString = "";
//         // for(var i = 0;i<userList.length;i++){
//         //     console.log("salut")
//         //     monString += userList[i]._id+" ";
//         // }

//         template.filter.set({"$where": function(){return this.emails[0].address.indexOf(input)>-1;}});    
//         }
//         else{
//             template.filter.set('');
//         }
        
//     }


// });



Template.playersInfo.events({
    'click .playerInfoRow' : function(event){
        //Router.go('playerInfoPage',{_id:this._id});
        Session.set('selected', this);
        Router.go('playerInfoPage');
    }
});
