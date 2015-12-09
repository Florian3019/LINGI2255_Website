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
  textehtml: function(){
    return this.texte;
  },
  encadrehtml : function(){
    return this.encadre;
  },
  hasEncadre:function(){
    return this.encadre!==undefined;
  },
});



Accounts.emailTemplates.siteName="Le Charles de Lorraine";
Accounts.emailTemplates.from = "Le Charles de Lorraine <staff@lecharlesdelorraine.com>";
Accounts.emailTemplates.verifyEmail.subject = function(user){
  return "Bienvenue sur le Charles de Lorraine";
};

Accounts.emailTemplates.verifyEmail.html = function(user,url){
  var data = {
    dataintro:"Merci pour votre inscription",
    dataacc:"Vous y êtes presque !",
    dataacccc:"Nous avons juste besoin de vérifier votre adresse email.",
    datacontent:"Grâce à votre inscription vous avez accès à de nouvelles fonctionalités ! Il vous sera possible à présent de vous inscrire au tournoi, mettre à jours votre profil, inscrire votre prope terrain. N'hésitez donc pas à visiter notre site !",
    datadesc:"Vérifiez votre compte en cliquant sur le lien suivant :",
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
    datacontent:"Il semble que vous ayez oublié votre mot de passe. Si c'est le cas, veuillez suivre les instructions ci-dessous. Si jamais vous n'avez pas demandé le changement de votre mot de passe, vous pouvez simplement ignorer cet email.",
    datadesc:"Pour modifier votre mot de passe, il suffit de cliquer sur le lien ci-dessous :",
    datalink:url,
    datafinal:""
  };
  return SSR.render("verifMail",data);
};


Meteor.methods({
  //You need to add the secrets.js file inside the server folder.
  /*
  This method sends email in secure if you're staff, admin or if the current user is the sender. By this way, any hackers can't send mails from our server.
  @param to: is for the receiver email,
  @param subject : is for the object of the mail,
  @param data : var data = {
  intro:"Bonjour Joseph !",
  important:"lorem1",
  texte:"lorem 2",
  encadre:"final2"};
  */
  'emailFeedback': function (to, subject, data) {


    // Don't wait for result
    this.unblock();

    // Define the settings
    var postURL = process.env.MAILGUN_API_URL + '/' + process.env.MAILGUN_DOMAIN + '/messages';
    var options =   {
      auth: "api:" + process.env.MAILGUN_API_KEY,
      params: {
        "from":"Le Charles de Lorraine <staff@lecharlesdelorraine.com>",
        "to":to,
        "subject": subject,
        "html": SSR.render("mailing",data),
      }
    }
    var onError = function(error, result) {
      if(error) {console.error("Error: " + error)}
    }

    // Send the request
    var user = Meteor.users.findOne({_id:Meteor.userId()});
    var usermail = user.emails[0].address;
    if(Meteor.call('isStaff') || Meteor.call('isAdmin') || usermail==to){
      Meteor.http.post(postURL, options, onError);
      //console.log("Email sent"); // Commenting this to avoir popDB to last too long
    }
    else{
      console.error("Forbidden permissions to send mail");
    }
  },

  /*This method send email to all users to announce the beginning of the tournament*/
  'emailLaunchTournament':function(){
    var mails=[];
    var usersCursor = Meteor.users.find();
    usersCursor.forEach( function(user) {
      mails.push(user.emails[0].address);
    });
    var subject = "[Le Charles De Lorraine] Lancement des inscriptions";
    var data  ={
      intro:"Bonjour,",
      important:"Nous avons une grande nouvelle à vous annoncer !",
      texte:"Dès aujourd'hui, vous avez la possibilité de vous inscrire à notre nouvelle édition du tournoi de tennis Le Charles de Lorraine.\n",
      encadre:"N'hésitez donc plus et allez vous inscire sur notre site internet !"
    };
    if(EMAIL_ENABLED){
      for (var i in mails) {
        Meteor.call('emailFeedback',mails[i],subject,data);
      }
    }


  },

  /*This method sends informations to all member of a pool.
  It takes a poolID as argument and send correct informations to members.*/
  'emailtoPoolPlayers':function(poolId){
    if(poolId != undefined){
      var mails = [];
      var pool = Pools.findOne({_id:poolId});
      for (var i in pool.pairs) {
        var p = Pairs.findOne({_id:pool.pairs[i]});
        if(p.player1!=undefined){
          var p1 = Meteor.users.findOne({_id:p.player1._id});
          mails.push(p1.emails[0].address);
        }
        if(p.player2!=undefined){
          var p2 = Meteor.users.findOne({_id:p.player2._id});
          mails.push(p2.emails[0].address);
        }
      }
      var leaduser = Meteor.users.findOne({_id:pool.leader});
      var leader= leaduser.profile.firstName+" "+leaduser.profile.lastName+" ("+leaduser.profile.phone+")"; //string

      var fam = Types.findOne({"all":poolId});
      if(fam==undefined){
        var allcat = ["preminimes","minimes","cadets","scolars","juniors","seniors","elites"];
        var responsableList=[];
        var type = Types.findOne({$or:[{"preminimes":poolId},{"minimes":poolId},{"cadets":poolId},{"scolars":poolId},{"juniors":poolId},{"seniors":poolId},{"elites":poolId}]});
        for (var j in allcat){
          var cat = allcat[j];
          if(type[cat].indexOf(poolId)>-1){ //Look if our pool is in a cat
            var r= cat.concat("Resp")
            var resplist=type[r];
            if (resplist!=undefined && resplist.length>0){
              for (var k = 0; k < resplist.length; k++) {
                responsableList.push(Meteor.users.findOne({_id:resplist[k]}));
              }
            }
          }
        }
      }
      else{
        var responsableList=[];
        var resplist = fam["allResp"];
        if (resplist!=undefined && resplist.length>0){
          for (var k = 0; k < resplist.length; k++) {
            responsableList.push(Meteor.users.findOne({_id:resplist[k]}));
          }
        }
      }
      var responsables="";//string
      for (var i = 0; i < responsableList.length; i++) {
        responsables += responsableList[i].profile.firstName+" "+responsableList[i].profile.lastName+" ("+responsableList[i].profile.phone+")";
      }

      var adresse="";//string
      if(pool.courtId!=undefined){
        court = Courts.findOne({"courtNumber":pool.courtId});
        if(court && court.addressID){
          address = Addresses.findOne({_id:court.addressID});
          adresse = address.street+" "+address.number+" "+address.zipCode+" "+address.city;
        }
      }
      if(responsableList.length>1){
        var encadre="Voici le nom et le numéro de téléphone des membres du staff qui encadrent votre poule :" + responsables +"\n Votre chef de poule est : "+leader+". C'est auprès de lui que vous obtiendrez les dernières informations."+"\n La poule se déroulera à l'adresse suivante : "+adresse;
      }else{
        var encadre="Voici le nom et le numéro de téléphone du membre du staff qui encadre votre poule :" + responsables +"\n Votre chef de poule est : "+leader+". C'est auprès de lui que vous obtiendrez les dernières informations."+"\n La poule se déroulera à l'adresse suivante : "+adresse;
      }
      var subject = "Quelques informations concernant votre poule.";
      var data = {
        intro:"Bonjour,",
        important:"",
        texte:"Nous voici bientôt arrivé à notre très attendu tournoi de tennis Le Charles de Lorraine et pour que tout se déroule pour le mieux, vous trouverez les informations concernant votre poule dans l'encadré suivant.",
        encadre:encadre,
      };
      if(EMAIL_ENABLED){
        for (var i in mails) {
          Meteor.call('emailFeedback',mails[i],subject,data);
        }
      }
    }
    else{
      console.error("emailtoPoolPlayers/ UNDEFINED POOLID");
    }
  },

  /*This method sents email to the pool leader.
  It contains some informations about the pool and what he have to du during tournament.*/
  'emailtoLeader':function(poolId){
    if(poolId!=undefined){
      var pool = Pools.findOne({_id:poolId});
      leader = Meteor.users.findOne({_id:pool.leader});

      var fam = Types.findOne({"all":poolId});
      if(fam==undefined){
        var allcat = ["preminimes","minimes","cadets","scolars","juniors","seniors","elites"];
        var responsableList=[];
        var type = Types.findOne({$or:[{"preminimes":poolId},{"minimes":poolId},{"cadets":poolId},{"scolars":poolId},{"juniors":poolId},{"seniors":poolId},{"elites":poolId}]});
        for (var j in allcat){
          var cat = allcat[j];
          if(type[cat].indexOf(poolId)>-1){ //Look if our pool is in a cat
            var r= cat.concat("Resp")
            var resplist=type[r];
            if (resplist!=undefined && resplist.length>0){
              for (var k = 0; k < resplist.length; k++) {
                responsableList.push(Meteor.users.findOne({_id:resplist[k]}));
              }
            }
          }
        }
      }
      else{
        var responsableList=[];
        var resplist = fam["allResp"];
        if (resplist!=undefined && resplist.length>0){
          for (var k = 0; k < resplist.length; k++) {
            responsableList.push(Meteor.users.findOne({_id:resplist[k]}));
          }
        }
      }
      var responsables="";//string
      for (var i = 0; i < responsableList.length; i++) {
        responsables += responsableList[i].profile.firstName+" "+responsableList[i].profile.lastName+" ("+responsableList[i].profile.phone+")";
      }
      var subject = "[IMPORTANT] Concernant le déroulement du tournoi de tennis Le Charles de Lorraine.";
      var data={
        intro:"Bonjour "+leader.profile.firstName+",",
        important:"Vous avez été choisi pour être le chef de la poule à laquelle vous allez jouer.",
        texte:"Cette responsabilité ne vous demande que quelques instants au début à la fin de la poule. Premièrement, il vous sera demandé d'aller récupérer la feuille de poule au quartier général avant d'aller jouer. Ensuite, veillez à ce que les points de chaque match soient inscrits dans les cases correspondantes. Finalement, nous vous demanderons aussi de ramener cette feuille au quartier général. Si vous avez besoin de plus d'informations, n'hésitez pas à contacter un membre du staff ou un responsable.",
        encadre:"Les responsables de votre poules sont : "+responsables+"\n Merci d'avance pour votre implication !",
      };
      if(EMAIL_ENABLED) Meteor.call('emailFeedback',leader.emails[0].address,subject,data);


    }
  },

  /* This function is to the remain player in a pair when the other is unregistered*/
  'emailtoAlonePairsPlayer':function(alonePlayerId,pair){
    var alonePlayer = Meteor.users.findOne({_id:alonePlayerId});

    if(alonePlayer!=undefined){
      if(alonePlayerId==pair.player1._id || alonePlayerId==pair.player2._id){
        var to = alonePlayer.emails[0].address;
        var subject= "Concernant votre paire au tournoi de tennis.";
        var data ={
          intro:"Bonjour "+alonePlayer.profile.firstName+",",
          important:"Nous avons une mauvaise nouvelle pour vous.",
          texte:"Votre partenaire ne souhaite plus s'inscrire pour notre tournoi de tennis Le Charles de Lorraine.",
          encadre:"C'est pourquoi nous vous invitons à venir choisir un nouveau partenaire sur notre site !"
        };

        var postURL = process.env.MAILGUN_API_URL + '/' + process.env.MAILGUN_DOMAIN + '/messages';
        var options =   {
          auth: "api:" + process.env.MAILGUN_API_KEY,
          params: {
            "from":"Le Charles de Lorraine <staff@lecharlesdelorraine.com>",
            "to":to,
            "subject": subject,
            "html": SSR.render("mailing",data),
          }
        }
        var onError = function(error, result) {
          if(error) {console.error("Error: " + error)}
        }
        Meteor.http.post(postURL, options, onError);
        console.log("Email sent");
      }else{
        console.error("Vous n'avez pas les permissions requises");
      }
    }else{
      console.error("Alone player is undefined");
    }
  },

  /*This function sends a remain mail to players who has payment issue*/
  'emailReminderToPay':function(currentYear){
    var paymentCursor = Payments.find({'status': "pending", 'tournamentYear': currentYear});
    paymentCursor.forEach( function(payment) {
      if(payment.paymentMethod!="Cash"){
        var user = Meteor.users.findOne({_id:payment.userID});

        var bank = "BE33 3753 3397 1254";

        if(payment.paymentMethod=="BankTransfer"){
          var data = {
            intro:"Bonjour "+user.profile.firstName+",",
            important:"Nous souhaitons vous rappeler les modalités du tournoi Le Charles de Lorraine.",
            texte:"Dans le cadre de l'asbl ASMAE, nous souhaitons collecter des fonds pour mener à bien notre projet. C'est pourquoi nous vous invitons à régulariser au plus vite votre inscription au tournoi",
            encadre:"Comme vous avez choisi de payer par virement, nous vous rappellons certaines informations pratiques.\n Votre montant : "+payment.balance+"€. Notre numéro de compte est le suivant : "+bank+"\n Merci de faire ceci dans les plus brefs délais."};
          }else{
            var data = {
              intro:"Bonjour "+user.profile.firstName+",",
              important:"Nous souhaitons vous rappeler les modalités du tournoi Le Charles de Lorraine.",
              texte:"Dans le cadre de l'asbl ASMAE, nous souhaitons collecter des fonds pour mener à bien notre projet. C'est pourquoi nous vous invitons à régulariser au plus vite votre inscription au tournoi",
              encadre:"Comme vous avez choisi de payer électroniquement, nous vous invitons à venr finaliser la transaction dans l'onget 'Mon inscription' une fois que vous êtes connecté sur notre site.\n Merci d'avance,"};
            }
            if(EMAIL_ENABLED){
              Meteor.call("emailFeedback", user.emails[0].address,"Concernant la finalisation de votre inscription",data, function(error, result){
                if(error){
                  console.log("error", error);
                }
              });
            }
          }
          else{
            console.log("cash");
          }
        });

      },

      /*Send email to all users. Subject and text are string to send*/
      'emailToAllUsers':function(subject,text){
        var data={
          intro:"Bonjour,",
          texte:text
        };
        var usersCursor = Meteor.users.find();
        usersCursor.forEach(function(user){
          if(EMAIL_ENABLED){
            Meteor.call("emailFeedback",user.emails[0].address,subject,data, function(error, result){
              if(error){
                console.log("error", error);
              }
            });
          }
        });
      },

      /*Send email to all players of current year.*/
      'emailToPlayers':function(subject,text,currentYear){
        var year = Years.findOne({_id:currentYear});
        var typest = ["men","women","mixed","family"];
        var allcat = ["preminimes","minimes","cadets","scolars","juniors","seniors","elites"];
        for (var i in typest) {
          var types=Types.findOne({_id:year[typest[i]]});
          for (var j in allcat) {
            for (var pl in types[allcat[j]]) {
              var currentPool = Pools.findOne({_id:types[allcat[j]][pl]});
              for (var k in currentPool["pairs"]) {
                var pair = Pairs.findOne({_id:currentPool["pairs"][k]});
                if (pair["player1"]!=undefined) {
                  player1= Meteor.users.findOne({_id:pair["player1"]},{emails:1});
                  var data={
                    intro:"Bonjour,",
                    texte:text
                  };
                  if(EMAIL_ENABLED){
                    Meteor.call("emailFeedback", player1.emails[0].address,subject,data, function(error, result){
                      if(error){
                        console.log("error", error);
                      }
                    });}
                  }
                  if (pair["player2"]!=undefined) {
                    player2= Meteor.users.findOne({_id:pair["player2"]},{emails:1});
                    var data={
                      intro:"Bonjour,",
                      texte:text
                    };
                    if(EMAIL_ENABLED){
                      Meteor.call("emailFeedback", player2.emails[0].address,subject,data, function(error, result){
                        if(error){
                          console.log("error", error);
                        }
                      });
                    }
                  }
                }
              }
            }
          }
        },

        /*Send email to all staff members*/
        'emailToStaff': function(subject,text){
          var data={
            intro:"Bonjour,",
            texte:text
          };
          var usersCursor = Meteor.users.find({"profile.isStaff":true},{emails:1});
          usersCursor.forEach( function(user) {
            if(EMAIL_ENABLED){
              Meteor.call("emailFeedback", user.emails[0].address,subject,data, function(error, result){
                if(error){
                  console.log("error", error);
                }
              });
            }
          });
        },

        /*Send email to all court owners.*/
        'emailToCourtOwner':function(subject,text){
          var data={
            intro:"Bonjour,",
            texte:text,
          };
          var courtsCursor= Courts.find();
          courtsCursor.forEach( function(court){
            var owner = Meteor.users.findOne({_id:court.ownerID},{emails:1});
            if(EMAIL_ENABLED){
              Meteor.call("emailFeedback",owner.emails[0].address,subject,data, function(error, result){
                if(error){
                  console.log("error", error);
                }
              });
            }
          });
        },

        'emailToAlreadyRegisteredUser' : function(userId, partnerId) {
          var user = Meteor.users.findOne({_id:userId});
          var part = Meteor.users.findOne({_id:partnerId});

          if (user!== undefined && part !== undefined) {
            var data={
              intro:"Bonjour "+part.profile.firstName+",",
              important: user.firstName+ " "+ user.lastName+ " veut jouer avec vous !",
              texte:"Cependant vous êtes déjà inscrit au tournoi. C'est pourquoi nous vous demandons de suivre les instructions dans l'encadré suivant.",
              encadre:"Premièrement désinscrivez-vous du tournoi auquel vous êtes déjà inscrit.\n Ensuite, réinscrivez-vous en selectionnant la bonne catégorie. Vous verrez apparaître le nom de votre partenaire dans la liste déroulante se trouvant au bas de la page.",
            };
            var postURL = process.env.MAILGUN_API_URL + '/' + process.env.MAILGUN_DOMAIN + '/messages';
            var options =   {
              auth: "api:" + process.env.MAILGUN_API_KEY,
              params: {
                "from":"Le Charles de Lorraine <staff@lecharlesdelorraine.com>",
                "to":part.emails[0].address,
                "subject": "Quelqu'un veut jouer avec vous !",
                "html": SSR.render("mailing",data),
              }
            }
            var onError = function(error, result) {
              if(error) {console.error("Error: " + error)}
            }
            Meteor.http.post(postURL, options, onError);
            console.log("Email sent");
          }
        },

        'emailInvitPeople':function(userId,partner){
          var user = Meteor.users.findOne({_id:userId});
          if(user !== undefined && user == Meteor.user()){
            var data ={
              intro:"Bonjour,",
              important:user.firstName+ " "+ user.lastName+ " veut jouer avec vous !",
              texte: "Pour vous inscrire et participer au tournoi de tennis Le Charles de Lorraine, suivez les instructions dans l'encadré suivant !",
              encadre:"Premièrement, inscrivez-vous sur notre site en cliquand sur 'Se connecter' en haut à droite de votre écran.\n Ensuite, choisissez l'onglet m'inscrire. Une fois que vous avez complétez vos informations et choisi le bon jour pour le tournoi, vous verrez alors l'adresse email de votre partenaire. Il ne vous reste plus qu'à la sélectionner et vous êtes inscrits !"
            };
            var postURL = process.env.MAILGUN_API_URL + '/' + process.env.MAILGUN_DOMAIN + '/messages';
            var options =   {
              auth: "api:" + process.env.MAILGUN_API_KEY,
              params: {
                "from":"Le Charles de Lorraine <staff@lecharlesdelorraine.com>",
                "to":partner,
                "subject": "Quelqu'un veut jouer avec vous !",
                "html": SSR.render("mailing",data),
              }
            }
            var onError = function(error, result) {
              if(error) {console.error("Error: " + error)}
            }
            Meteor.http.post(postURL, options, onError);
            console.log("Email sent");
          }
        },

      });
