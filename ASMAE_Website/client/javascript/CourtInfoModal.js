Template.CourtInfoModal.helpers({
	'getEmail':function(emails){
		if(emails!=undefined){
			return emails[0].address;
		}
		else{
			return undefined;
		}
	},
	'getAddress':function(street,number){
		return street+", "+number;
	},
	'getModalCourtInfo':function(){
		return Session.get("PoolList/ModalCourtData");
	},
});

Template.CourtInfoModal.events({
	'click #goToMap':function(event){
		var courtId = event.currentTarget.dataset.id;
		 $('#CourtInfoModal').modal('hide');
		 $('#CourtInfoModal').on('hidden.bs.modal', function(){
			Router.go("courtMap", {_id:courtId});
		 });
	}
});