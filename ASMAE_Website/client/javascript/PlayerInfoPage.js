Template.playerInfoPage.helpers({
 	dataHelpers: function() {
        data = {
            'firstName': function(){
			return Session.get('selected').profile.firstName;
			},
			'lastName': function(){
			return Session.get('selected').profile.lastName;
			},
			'emails': function(){
			return Session.get('selected').emails[0].address;
			},
			'phone': function(){
			return Session.get('selected').profile.phone;
			},
			'birdth': function(){
			return Session.get('selected').profile.birthDate;
			},
			'genre': function(){
			return Session.get('selected').profile.gender;
			},
			'street': function(){
			if(Session.get('address')) return Session.get('address').street;
			},
			'number': function(){
			if(Session.get('address')) return Session.get('address').number;
			},
			'boite': function(){
			if(Session.get('address')) return Session.get('address').box;
			},
			'postal': function(){
			if(Session.get('address')) return Session.get('address').zipCode;
			},
			'city': function(){
			if(Session.get('address')) return Session.get('address').city;
			},
			'land': function(){
			if(Session.get('address')) return Session.get('address').country;
			},
			'rank': function(){
			return Session.get('selected').profile.AFT;
			}
		};
        return data;

    }

});
