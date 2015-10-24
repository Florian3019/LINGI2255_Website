// Source : http://ondrej-kvasnovsky.blogspot.be/2013/07/meteor-how-to-login-with-github-account.html
isProdEnv = function () {
    if (process.env.ROOT_URL == "http://localhost:3000/") {
        return false;
    } else {
        return true;
    }
}

ServiceConfiguration.configurations.remove({
    service: 'google'
});

ServiceConfiguration.configurations.remove({
     service: 'facebook'
});

if (isProdEnv()) {

 // TODO (for production)

    ServiceConfiguration.configurations.insert({
        service: 'google',
        appId: '413437801707-k3bevh2blautvhg0m2mtac69up6jl5ge.apps.googleusercontent.com',
        secret: 'mXBYrXgom9rVMKsog_K1JsIL'
    });
    ServiceConfiguration.configurations.insert({
        service: 'facebook',
        appId: '1665003880380917',
        secret: '8df4b4b1612e9792af5fd98066918ef7'
    });
} else {
    // dev environment, currently set up with guillaume leurquin's secrets.
    ServiceConfiguration.configurations.insert({
        service: 'google',
        clientId: '413437801707-k3bevh2blautvhg0m2mtac69up6jl5ge.apps.googleusercontent.com',
        secret: 'mXBYrXgom9rVMKsog_K1JsIL'
    });
    ServiceConfiguration.configurations.insert({
        service: 'facebook',
        appId: '1659508044263834',
        secret: '00b1e92517c09f04f9c2a2cadf137638'
    });
}


/*
    Ask for email verification --> TODO, currently doesn't forbid the client
    from logging in if email is not verified (nor does it erase the account after some time has passed)
    See this link on some ideas on how to do that : http://stackoverflow.com/questions/15383273/force-email-validation-before-login-meteor
*/
Accounts.config({sendVerificationEmail: true, forbidClientAccountCreation: false});

/*
    @param
*/
useServiceInfo = function(user){
    var services = user.services;

    // BirthDate
    if(!user.profile.birthDate)
        if(services.google && services.google.birth_date){
            user.profile.birthDate = service.google.birth_date;
        }
        else if(services.facebook && services.facebook.birth_date){
            user.profile.birthDate = service.facebook.birth_date;
        }

    // First name
    if(!user.profile.firstName)
        if(services.google){
            user.profile.firstName = services.google.given_name;
        }
        else if(services.facebook){
            user.profile.firstName = services.facebook.first_name;
        }

    // Last name
    if(!user.profile.lastName)
        if(services.google){
            user.profile.lastName = services.google.family_name;
        }
        else if(services.facebook){
            user.profile.lastName = services.facebook.last_name;
        }

    // Gender
    if(!user.profile.gender)
        if(services.google){
            user.profile.gender = services.google.gender;
        }
        else if(services.facebook){
            user.profile.gender = services.facebook.gender;
        }

    // Emails
    if(!user.profile.emails)
        if(services.google){
            user.emails = [{"address":services.google.email, "verified":services.google.verified_email}];
        }
        else if(services.facebook){
            user.emails = [{"address":services.facebook.email, "verified":true}];

        }

    return user;
}


addDefaultFields = function(user){
    user.profile.isStaff = false;
    user.profile.isAdmin = false;
    return user;
}

/*	
    Define what happens when the user logs in. Mainly merges the accounts if he logged in via google/facebook
    But already had an account on facebook/google. Also checks if he created an account manually (if so, merges the accounts)

    Currently only keeps the first logging information : if user created account with google but logs in with facebook afterwards,
    facebook information is discarded (but the user is logged in on its google account).
*/

Accounts.onCreateUser(function (options, user) {
	user.profile = {}; // To avoid TypeError : Cannot set 'isStaff' and 'isAdmin' of undefined when invoking function addDefaultFields
    // Check if the user logged in via a service (google or facebook)
    if (user.services) {
        if (options.profile) {
            user.profile = options.profile
        }

        // Get the service name
        var service = _.keys(user.services)[0];

        // Get the service's email address
        var email = user.services[service].email;
        if (!email) {
            if (user.emails) {
                email = user.emails.address;
            }
        }
        if (!email) {
            email = options.email;
        }
        if (!email) {
            // if email is not set, there is no way to link it with other accounts
            user = addDefaultFields(user)
            return useServiceInfo(user);
        }

        // see if any existing user has this email address, otherwise create new
        var existingUser = Meteor.users.findOne({'emails.address': email});
        if (!existingUser) {
            // check for email also in other services
            var existingGoogleUser = Meteor.users.findOne({'services.google.email': email});
            var existingFacebookUser = Meteor.users.findOne({'services.facebook.email': email});
            var doesntExist = !existingGoogleUser && !existingFacebookUser;
            if (doesntExist) {
                // User doesn't have an email address in google or facebook.

                // return the user as it came, because there he doesn't exist in the DB yet

                return useServiceInfo(addDefaultFields(user));
            }
            else {

                existingUser = existingGoogleUser ? existingGoogleUser : existingFacebookUser;

                // User has already an account under google or facebook
                if (user.emails) {
                    // user is signing in by email, we need to set it to the existing user
                    existingUser.emails = user.emails;
                }
            }
        }

        // At this point, we know that the user is already in the DB

        /*
            Had to remove this part as it was making the site crash, don't know exactly what it did either
        */
        // precaution, these will exist from accounts-password if used
        // if (!existingUser.services) {
        //     existingUser.services = { resume: { loginTokens: [] }};
        // }

        // copy accross new service info
        existingUser.services[service] = user.services[service];
        // existingUser.services.resume.loginTokens.push(
        //     user.services.resume.loginTokens[0]
        // );

        // even worse hackery
        Meteor.users.remove({_id: existingUser._id}); // remove existing record

        existingUser = useServiceInfo(existingUser);
        return existingUser;                  // record is re-inserted
    }

    return addDefaultFields(user);


});
