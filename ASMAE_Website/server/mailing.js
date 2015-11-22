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
	return "Bienvenue sur le Charles de Lorraine";
};
// Accounts.emailTemplates.verifyEmail.text = function(user,url){
// 	return "Bonjour "+ user.username+",\n\n Merci de t'être inscrit au site Le Charles de Lorraine!\n\n"+
// 				"Pour vérifier ton compte et finaliser ton inscription, clique simplement sur le lien suivant: "+
// 				url+"\n"+
// 				"Merci et à bientôt !\n\nLe staff leCharlesdeLorraine"
// };

Accounts.emailTemplates.verifyEmail.html = function(user,url){
	var data = {
		dataintro:"Merci pour votre inscription",
		dataacc:"Vous y ête presque !",
		dataacccc:"Nous avons juste besoin de vérifier votre adresse email.",
		datacontent:"Grâce à votre inscription vous avez accès à de nouvelles fonctionalités ! Il vous sera possible à présent de vous inscrire au tournoi, mettre à jours votre profil, inscrire votre prope terrain. N'hésitez donc pas à visiter notre site !",
		datadesc:"Vérifier votre compte en cliquant sur le lien suivant :",
		datalink:url,
		datafinal:"Attention, ce lien expira dans 3 jours."
		};
		return SSR.render("verifMail",data);
};

Accounts.emailTemplates.resetPassword.subject = function(user){
	return "Comment réinitialiser votre mot de passe ?";
};
Accounts.emailTemplates.resetPassword.html =function(user,url){
	var data = {
		dataintro:"Bonjour,",
		dataacc:"",
		dataacccc:"",
		datacontent:"Il semble que vous ayez oublié votre mot de passe. Si c'est le cas, veuillez suivre les instructions ci-dessous. Si jamais vous n'avez pas demandé le changement de votre mot de passe, vous pouvez simplement ignoré cet email.",
		datadesc:"Pour modifier votre mot de passe, il suffit de cliquer sur le lien ci-dessous :",
		datalink:url,
		datafinal:""

	};
	return SSR.render("verifMail",data);
};
