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
	}
});