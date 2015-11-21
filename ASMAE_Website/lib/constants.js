typeKeys = ["men", "women", "mixed", "family"];
categoriesKeys = ["preminimes", "minimes", "cadets", "scolars", "juniors", "seniors", "elites", "all"];
categoriesTranslate = {"preminimes":"Pré Minimes","minimes":"Minimes", "cadets":"Cadet", "scolars":"Scolaire", "juniors":"Junior", "seniors":"Seniors", "elites":"Elites", "all":"familyCategory"};
typesTranslate = {"men":"Hommes", "women":"Femmes", "mixed":"Mixtes", "family":"Familles"};
paymentTypes = ["CreditCard", "BankTransfer", "Cash"];
paymentTypesTranslate = {"CreditCard":"Carte de crédit", "BankTransfer":"Virement bancaire", "Cash":"Cash"};
surfaceTypes = ["Béton","Terre battue","Synthétique","Gazon"];


ALLYEARS = [2015]; // Update this as needed
tournamentDate = new Date(2015, 8, 12); // 12 sept 2015

currentYear = ""+tournamentDate.getFullYear(); // must be a string

// One must be < MAX_FAMILY_AGE and the other > MIN_FAMILY_AGE for the pair to be accepted in the families
MAX_FAMILY_AGE = 15;
MIN_FAMILY_AGE = 25;

/*
    @param birthDate of the player for which we want to know if he is accepted into the family tournament
*/
acceptForFamily = function(birthDate, tournamentDate){
    age = getAge(birthDate, tournamentDate);
    return age<=MAX_FAMILY_AGE || age>=MIN_FAMILY_AGE;
}

/*
    @returns true if the 2 players whose birthDates are given can play together at the family tournament
*/
acceptPairForFamily = function(birthDate1, birthDate2, tournamentDate){
    age1 = getAge(birthDate1, tournamentDate);
    age2 = getAge(birthDate2, tournamentDate);

    return (age1<=MAX_FAMILY_AGE && age2>= MIN_FAMILY_AGE) || (age2<=MAX_FAMILY_AGE && age1>= MIN_FAMILY_AGE);
}

/*
* @param age is of type int
*/
getCategory = function(age){

    if(age < 9){
        return undefined;
    }
    if(9 <= age && age <= 10){
        return categoriesKeys[0];
    }
    if(11 <= age && age <= 12){
        return categoriesKeys[1];
    }
    if(13 <= age && age <= 14){
        return categoriesKeys[2];
    }
    if(15 <= age && age <= 16){
        return categoriesKeys[3];
    }
    if(17 <= age && age <= 19){
        return categoriesKeys[4];
    }
    if(20 <= age && age <= 40){
        return categoriesKeys[5];
    }
    return categoriesKeys[6];
}

getCategoryForBirth = function(birth, tournamentDate) {
    var age = getAge(birth, tournamentDate);
    return getCategory(age);
}


/*
 *  @param category = preminimes | minimes | ... --> See switch cases
 */
 getAgeBoundsForCategory = function(category) {
     //console.log("getAgeBoundsForCategory : "+category);
    switch (category) {
        case categoriesKeys[0]:
            return [9, 10];
        case categoriesKeys[1]:
            return [11, 12];
        case categoriesKeys[2]:
            return [13, 14];
        case categoriesKeys[3]:
            return [15, 16];
        case categoriesKeys[4]:
            return [17, 19];
        case categoriesKeys[5]:
            return [20, 40];
        case categoriesKeys[6]:
            return [41, 80];
        default:
            return undefined;
    }
}



/*
 *  @param birthDate is of type Date
 */
getAge = function(birthDate, tournamentDateSpecified){
    var thisTournamentDate = tournamentDate; // The global one in constants.
    if (typeof tournamentDateSpecified !== 'undefined') {
        thisTournamentDate = tournamentDateSpecified;
    }
    var age = thisTournamentDate.getFullYear() - birthDate.getFullYear();
    var m = thisTournamentDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && thisTournamentDate.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/*
 *  @param year a year
 *  @param month = 0 | 1 | ... | 11
 */
getAgeNoDate = function(year, month, day, tournamentDate){
    var date = new Date(year, month, day);
    return getAge(date, tournamentDate);
}

/*
 *  @param email string
 *  Check if it is a good email
 */
isValidEmail = function (email) {
    var re = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$','i');
    return re.test(email);
}
