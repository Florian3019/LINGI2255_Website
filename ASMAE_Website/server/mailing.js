SSR.compileTemplate("mailing", Assets.getText("mailing.html"));
SSR.compileTemplate("verifMail", Assets.getText("verifmail.html"));

Template.verifMail.helpers({
	intro: function(){
		return this.dataintro;
	},
	link : function(){
		return this.datalink;
	}

});


Template.mailing.helpers({
	introhtml: function(){
		 return this.intro;
	},
	importanthtml: function(){
		 return this.important;
	},
	texthtml: function(){
		 return this.text;
	},
	encadrehtml : function(){
		return this.encadre;
	},
});



Accounts.emailTemplates.siteName="Le Charles de Lorraine";
Accounts.emailTemplates.from = "Le Charles de Lorraine <staff@lecharlesdelorraine.com>";
Accounts.emailTemplates.verifyEmail.subject = function(user){
	return "Bienvenue sur le Charles de Lorraine, "+user.username ;
};
// Accounts.emailTemplates.verifyEmail.text = function(user,url){
// 	return "Bonjour "+ user.username+",\n\n Merci de t'être inscrit au site Le Charles de Lorraine!\n\n"+
// 				"Pour vérifier ton compte et finaliser ton inscription, clique simplement sur le lien suivant: "+
// 				url+"\n"+
// 				"Merci et à bientôt !\n\nLe staff leCharlesdeLorraine"
// };
Accounts.emailTemplates.verifyEmail.html = function(user,url){
	var data = {
		dataintro:"Bonjour "+ user.username,
		datalink:url
		};
		console.log("verification mail ?");
		return SSR.render("verifMail",data);
};
