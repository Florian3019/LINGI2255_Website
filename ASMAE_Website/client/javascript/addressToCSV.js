Template.addressToCSV.events({
	'click #getCSV':function(event){
		var curUser = Meteor.user();
		if(curUser===null || curUser===undefined || !(curUser.profile.isStaff || curUser.profile.isAdmin)){
			console.error("Operation denied : user is not logged in or does not have the rights required!");
			return;
		}
		var users = Meteor.users.find().fetch();
		var csvContent = "data:text/csv;charset=utf-8,";
		csvContent+="Prenom, Nom, Email , Rue, Numéro, Boite, Code postal, Ville, Pays\n";
		for(var i=0; i<users.length;i++){
			var user = users[i];
				
			var addr = Addresses.findOne({_id:user.profile.addressID});
			if(addr!==undefined){
				var userData = "";

				userData += user.profile.firstName+", ";
				userData += user.profile.lastName+", ";
				userData += user.emails[0].address+", ";
				userData += addr.street+", ";
				userData += addr.number+", ";
				userData += addr.box+", ";
				userData += addr.zipCode+", ";
				userData += addr.city+", ";
				userData += addr.country+"\n";

				csvContent += userData;
			}
		}

		var encodedUri = encodeURI(csvContent);

		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "data.csv");

		link.click(); // This will download the data file named "data.csv".
	},

});