Template.staffManagement.ShowStaff = function(){
	return Questions.find()
}


Template.staffManagement.helpers({
	'isProcessed' : function(){
		if(this.processed)
			return "Oui";
		else
			return "Non";
	}

});
