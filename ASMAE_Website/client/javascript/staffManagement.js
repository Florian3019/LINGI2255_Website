Template.staffManagement.ShowStaff = function(){
	return Questions.find()
}
Template.staffManagement.events({
	'click .btn':function(){
		Meteor.call('updateQuestionStatus',this.email,this.question,this.date);
	}
	
});
Template.staffManagement.helpers({
	'isProcessed' : function(){
		if(this.processed)
			return "Oui";
		else
			return "Non";
	},
	'showIt' : function(){
		if(this.processed){
			return "visibility:hidden";
		}
		else
			return "visibility:visible";
	}

});
