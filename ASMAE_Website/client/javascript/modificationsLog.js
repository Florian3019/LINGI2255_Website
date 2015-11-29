Template.modificationsLog.helpers({
    modificationsLog: function () {
        return ModificationsLog.find();
    },

    settings : function(){
    	return {
    		fields:[
			    { key: 'userId', label: 'Utilisateur', fn: function(value, object){
			    	user= Meteor.users.findOne({_id:value},{"profile":1});
			    	return user.profile.firstName + " " + user.profile.lastName;
			    }},
			    { key: 'createdAt', label: 'Temps' , sortOrder: 0, sortDirection: 'descending', fn: function(value, object){return value.toLocaleString('fr-BE')}},
			    { key: 'opType', label: "Opération"},
			    { key: 'details', label: "Détails"}
			]
    	}
    }
});