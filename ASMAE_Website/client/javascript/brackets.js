Template.brackets.events({

"click":function(event,template){
  	console.log("click");
  	// Meteor.call('updateUser', {firstName : 'guillaume'});
  },

	// Do something when the user clicks on a player
  "click .g_team":function(event, template){
  	// console.log(event);
  	// console.log(event.target.textContent);
  	var parsing = event.currentTarget.className.match(/.+ (.+) /);
  	var id = parsing[1];
  	console.log("id = "+id);

  	var text = event.target.textContent;
  	var seed = text.match(/\d+/);
  	var name = text.match(/(\w+) (\w+)/);
  	var firstName = name[1];
  	var lastName = name[2];

  	console.log("seed = "+seed);
  	console.log("firstName = "+firstName);
  	console.log("lastName = "+lastName);


  	// TODO : redirect to player profile ?

  }

});
