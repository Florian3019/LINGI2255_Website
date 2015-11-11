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

    'selectedSurface': function(value, surfaceName){
        return value === surfaceName ? 'selected' : '';
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
        console.log(value);
        if(value === "club"){
            return 'checked';
        }
        else{
            return '';
        }
    },
    'player': function(){
        return Session.get('cursor1');
    }
});

Template.adminAddCourt.events({
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
        var user = {
            firstName : $('[name=firstName]').val(),
            lastName : $('[name=lastName]').val(),
            address : $('[name=address]').val()
        };
        var go = false;
        var query = {};
        if(user.lastName){query["profile.lastName"] = user.lastName;}
        if(user.firstName){query["profile.firstName"] = user.firstName;}
        if(user.address){query["emails.address"] = user.address;}
        cursor = Meteor.users.find(query).fetch();
        var id, currentOwnerID; //Used for the update of an existing court
        console.log(this);
        console.log(this.court);
        console.log(user);
        console.log(address);
        
        
        if(this.court!=undefined){
            id = this.court._id;
            if(cursor.length > 0) {
                currentOwnerID = cursor[0]._id;
                go = true;
            }
            else {
                currentOwnerID = this.court.ownerID;
                go = true;
            }
        }
        else {
            if(cursor.length > 0) {
                currentOwnerID = cursor[0]._id;
                if(cursor.length == 1){
                    go = true;
                }
            }
            else {
                currentOwnerID = this.court.ownerID;
                go = true;
            }
        }
        var courtData = {
            _id : id,
            ownerID : currentOwnerID,
            surface : $('[name=surface]').val(),
            courtType : $('[name=courtType]:checked').val(),
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

                Meteor.call("addToModificationsLog", 
                {"opType":"Ajout d'un terrain", 
                "details":
                    "Id du Terrain: "+result +
                    "Owner : "+currentOwnerID 
                });

                if(go) {
                    Router.go('confirmation_registration_court', {_id: result});
                }
                else {
                    Session.set('cursor1',cursor)
                    Session.set('courtData', courtData);
                    Session.set('address', address);
                }
            });

    },  
    'click li': function() {
        var courtData = Session.get('courtData');
        var address = Session.get('address');
        courtData.ownerID = this._id;

        Meteor.call('updateCourt', courtData, address, function(error, result){
            if(error){
                console.error('CourtRegistration error');
                console.error(error);
            }
            else if(result == null){
                console.error("No result");
            }
            Router.go('confirmation_registration_court', {_id: result});
        });

    }
});