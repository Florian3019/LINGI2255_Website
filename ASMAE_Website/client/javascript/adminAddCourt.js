/*
    AdminAddCourt is the template that allows the staff to add a court and assign it
    to an existing user. By default, it sets ownerOK and staffOK to true.
    It creates the address in the db and links it to the created court, that is also
    added to the db.
*/

Template.adminAddCourt.helpers({
    'searchComplete':function(){
        return Session.get("adminAddCourt/searchComplete");
    },

    'getSelectedOwner':function(){
        return Session.get("adminAddCourt/selected");
    },
    'player': function(){
        Session.set("adminAddCourt/selected", "");
        lastName = Session.get('adminAddCourt/lastName');
        if(lastName!==undefined) lastName = lastName.toLowerCase();
        firstName = Session.get('adminAddCourt/firstName');
        if(firstName!==undefined) firstName = firstName.toLowerCase();
        address = Session.get('adminAddCourt/address');
        if(address!==undefined) address = address.toLowerCase();


        var query = [];
        if(lastName!=="" && lastName!==undefined) query.push({$where:function(){if(this.profile.lastName!==undefined) return this.profile.lastName.toLowerCase().indexOf(lastName)>-1;}});
        if(firstName!=="" && firstName!==undefined) query.push({$where:function(){if(this.profile.firstName!==undefined) return this.profile.firstName.toLowerCase().indexOf(firstName)>-1;}});
        if(address!=="" && address!==undefined) query.push({$where:function(){return this.emails[0].address.toLowerCase().indexOf(address)>-1;}});

        cursor = [];
        if(query.length>0) cursor = Meteor.users.find({$and:query}).fetch();

        if(cursor.length>0){
            Session.set("adminAddCourt/searchComplete",true);
        }
        else{
            Session.set("adminAddCourt/searchComplete",false);
        }
        return cursor;
    }
});

Template.adminAddCourt.onRendered(function(){
    Session.set("adminAddCourt/selected", ""); //Reset
    Session.set('adminAddCourt/lastName',"");
    Session.set('adminAddCourt/firstName',"");
    Session.set('adminAddCourt/address',"");
    Session.set("adminAddCourt/searchComplete",false);
});

Template.adminAddCourt.events({
    'keyup #lastName':function(event){
        Session.set('adminAddCourt/lastName', event.currentTarget.value);
        Session.set("adminAddCourt/searchComplete",true);
    },

    'keyup #firstName':function(event){
        Session.set('adminAddCourt/firstName', event.currentTarget.value);
        Session.set("adminAddCourt/searchComplete",true);
    },

    'keyup #address':function(event){
        Session.set('adminAddCourt/address', event.currentTarget.value);
        Session.set("adminAddCourt/searchComplete",true);
    },


    'submit form': function(event){
        event.preventDefault();
        var address = {
            street : $('[name=street]').val(),
            number : $('[name=addressNumber]').val(),
            box : $('[name=box]').val(),
            city : $('[name=city]').val(),
            zipCode : $('[name=zipCode]').val(),
            country : $('[name=country]').val(),
            isCourtAddress : true
        };

        var currentOwnerID = Session.get("adminAddCourt/selected");
        infoBox = document.getElementById("infoBox");
        if(currentOwnerID=="" || currentOwnerID===undefined){
            if(infoBox!==null && infoBox!==undefined){
                infoBox.removeAttribute("hidden");
                return;
            }
        }
        else{
            if(infoBox!==null && infoBox!==undefined) infoBox.setAttribute("hidden","");
        }

        var courtData = {
            ownerID : currentOwnerID,
            surface : $('[name=surface]').val(),
            courtType : $('[name=courtType]:checked').val(),
            numberOfCourts : $('[name=numberOfCourts]').val(),
            instructions : $('[name=instructions]').val(),
            ownerComment : $('[name=ownerComment]').val(),
            dispoSamedi : $('[name=dispoSamedi]').is(":checked"),
            dispoDimanche : $('[name=dispoDimanche]').is(":checked"),
            staffOK : true, // Default to true
            ownerOK : true, // Default to true
            isOutdoor: $('[name=isOutdoor]').is(":checked")
        };

        Meteor.call('updateAddress', address, function(err, res){
            if(err){
                console.error("CourtRegistration updateAddress error");
                console.error(err);
                return;
            }
            // Set addressId :
            courtData.addressID = res;

            Meteor.call('updateCourt', courtData, function(error, result){
                if(error){
                    console.error('CourtRegistration error');
                    console.error(error);
                }
                else if(result == null){
                    console.error("No result");
                }
                Router.go('confirmationRegistrationCourt', {_id: result});
            });
        });
        
    },
    'click .playerFound': function(event) {
        playerId = event.currentTarget.id;

        oldPlayer = document.getElementById(Session.get("adminAddCourt/selected"));
        if(oldPlayer!==undefined && oldPlayer!==null) oldPlayer.className = oldPlayer.className.replace(' courtSelected', '');

        Session.set("adminAddCourt/selected", playerId);
        
        document.getElementById(playerId).className += " courtSelected";
    }
});
