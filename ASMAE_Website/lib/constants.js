typeKeys = ["men", "women", "mixed", "family"];
categoriesKeys = ["preminimes", "minimes", "cadets", "scolars", "juniors", "seniors", "elites"];
categoriesTranslate = {"preminimes":"Pré Minimes","minimes":"Minimes", "cadets":"Cadet", "scolars":"Scolaire", "juniors":"Junior", "seniors":"Seniors", "elites":"Elites"};
typesTranslate = {"men":"Hommes", "women":"Femmes", "mixed":"Mixtes", "family":"Familles"};
paymentTypes = ["CreditCard", "BankTransfer", "Cash"];
paymentTypesTranslate = {"CreditCard":"Carte de crédit", "BankTransfer":"Virement bancaire", "Cash":"Cash"};

tournamentDate = new Date(2015, 8, 12); // 12 sept 2015
tournamentYear = "2015";

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
getAge = function(birthDate){
    var age = tournamentDate.getFullYear() - birthDate.getFullYear();
    var m = tournamentDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && tournamentDate.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/*
 *  @param year a year
 *  @param month = 0 | 1 | ... | 11
 */
getAgeNoDate = function(year, month, day){
    var age = tournamentDate.getFullYear() - year;
    var m = tournamentDate.getMonth() - month;
    if (m < 0 || (m === 0 && tournamentDate.getDate() < day)) {
        age--;
    }
    return age;
}
