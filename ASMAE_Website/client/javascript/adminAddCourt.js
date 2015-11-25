Template.adminAddCourt.helpers({
    'availableThisDay': function(available){
        if(available === null){
            return 'checked';
        }
        else
        {
            if(available){
                return 'checked';
            }
            else{
                return '';
            }
        }
    },

    'getSelectedOwner':function(){
        return Session.get("adminAddCourt/selected");
    },

    'selectedSurface': function(value, surfaceName){
        return value === surfaceName ? 'selected' : '';
    },

    'searchComplete':function(){
        return Session.get("adminAddCourt/searchComplete");
    },

    'isPrivate': function(value){
        if(value === "privé"){
            return 'checked';
        }
        else{
            return '';
        }
    },
    'isClub': function(value){
        if(value === "club"){
            return 'checked';
        }
        else{
            return '';
        }
    },
    'player': function(){
        Session.set("adminAddCourt/selected", "");
        lastName = Session.get('adminAddCourt/lastName');
        firstName = Session.get('adminAddCourt/firstName');
        address = Session.get('adminAddCourt/address');

        var query = [];
        if(lastName!=="" && lastName!==undefined) query.push({$where:function(){if(this.profile.lastName!==undefined) return this.profile.lastName.indexOf(lastName)>-1;}});
        if(firstName!=="" && firstName!==undefined) query.push({$where:function(){if(this.profile.firstName!==undefined) return this.profile.firstName.indexOf(firstName)>-1;}});
        if(address!=="" && address!==undefined) query.push({$where:function(){return this.emails[0].address.indexOf(address)>-1;}});

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
            country : $('[name=country]').val()
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
            dispoDimanche : $('[name=dispoDimanche]').is(":checked")
        };

        Meteor.call('updateCourt', courtData, address, function(error, result){
            if(error){
                console.error('CourtRegistration error');
                console.error(error);
            }
            else if(result == null){
                console.error("No result");
            }
            Router.go('confirmationRegistrationCourt', {_id: result});
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
