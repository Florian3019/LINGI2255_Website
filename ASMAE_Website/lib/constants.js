typeKeys = ["men", "women", "mixed", "family"];
typesTranslate = {"men":"Hommes", "women":"Dames", "mixed":"Mixtes", "family":"Familles"};
categoriesKeys = ["preminimes", "minimes", "cadets", "scolars", "juniors", "seniors", "elites", "all"];
categoriesTranslate = {"preminimes":"Pré Minimes","minimes":"Minimes", "cadets":"Cadet", "scolars":"Scolaire", "juniors":"Junior", "seniors":"Seniors", "elites":"Elites", "all":"familyCategory"};
paymentTypes = ["CreditCard", "BankTransfer", "Cash"];
paymentTypesTranslate = {"CreditCard":"Carte de crédit", "BankTransfer":"Virement bancaire", "Cash":"Cash"};
surfaceTypes = ["Béton","Terre battue","Synthétique","Gazon"];

HQCoords = {"lat":50.854227, "lng":4.353841}; // Latitude and longitude of the head quarters
paymentTranslate = {"paid":"Payé", "pending":"En attente"};

if(Meteor.isClient){
    Session.setDefault('showNavBar', false);
}

// One must be < MAX_FAMILY_AGE and the other > MIN_FAMILY_AGE for the pair to be accepted in the families
MAX_FAMILY_AGE = 15;
MIN_FAMILY_AGE = 25;

LAST_N_LOGS = 3; // Amount of logs to keep for each user/courts. All logs are still kept in the full log table.
/*
    @param birthDate of the player for which we want to know if he is accepted into the family tournament
*/
acceptForFamily = function(birthDate, tournamentDate){
    age = getAge(birthDate, tournamentDate);
    return age<=MAX_FAMILY_AGE || age>=MIN_FAMILY_AGE;
}

/*
    Returns the distance (in terms of lat/lng) between the coordinates and the HQ
*/
getDistanceFromHQ = function(coords){
    var latDist = coords.lat-HQCoords.lat;
    var lngDist = coords.lng-HQCoords.lng;
    return Math.sqrt(Math.pow(latDist,2) + Math.pow(lngDist,2)); // Pythagore
}

getSortableDate = function(date){
    var month = date.getMonth();
    var day = date.getDate();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    return date.getFullYear()+"/"+((month<10)?"0":"")+month+"/"+((day<10)?"0":"")+day+" "+((h<10)?"0":"")+h+":"+((m<10)?"0":"")+m+":"+((s<10)?"0":"")+s;
}

formatAddress = function(addr){
  if(addr==undefined) return "Pas défini";
  var ret = ""
  if(addr.street != undefined) {
      ret = ret+addr.street + ", ";
  }
  if(addr.number != undefined) {
      ret = ret+addr.number + ", ";
  }
  if(addr.box != undefined) {
          ret = ret+addr.box + ", ";
  }
  if(addr.city != undefined) {
      ret = ret+addr.city + ", ";
  }
  if(addr.zipCode != undefined) {
      ret = ret+addr.zipCode + ", ";
  }
  if(addr.country != undefined) {
      ret = ret+addr.country;
  }
  return ret
};

/*
    return the pair corresponding to the current year for the current user
*/
getPairsFromPlayerID = function(userId, cursor) {
    var id = userId;
    if (id==undefined) {
        return undefined;
    }
    var currentYear = GlobalValues.findOne({_id:"currentYear"}).value;
    var pairs = Pairs.find({$or:[{"player1._id":id, year:currentYear},{"player2._id":id, year:currentYear}]});
    if (typeof pairs === 'undefined' || pairs.fetch().length < 1) {
        return undefined;
    }
    return cursor ? pairs : pairs.fetch();
}

getDayPairFromPlayerID = function(userId, day) {
    var pairs = getPairsFromPlayerID(userId);
    for (var i=0; i<pairs.length; i++) {
        var data = getTypeAndCategoryFromPairID(pairs[i]._id);
        if (getDayFromType(data.playerType) == day) {
            return pairs[i];
        }
    }
}

getTypeAndCategoryFromPairID = function(pairID) {
    var pool = Pools.findOne({pairs:pairID});
    var poolID = pool._id;
    var typeData = Types.findOne({$or:[{"preminimes":poolID}, {"minimes":poolID}, {"cadets":poolID}, {"scolars":poolID}, {"juniors":poolID}, {"seniors":poolID}, {"elites":poolID}, {"all":poolID}]});
    var playerType = typeData.typeString;

    var playerCategory = undefined;
    for(var i=0; i<categoriesKeys.length;i++){
        var cat = typeData[categoriesKeys[i]]; // List of pool ids
        if(cat!==undefined && cat.indexOf(pool._id)>-1){
            playerCategory = categoriesTranslate[categoriesKeys[i]];
            break;
        }
    }
    return {playerType:playerType, playerCategory:playerCategory};
}


getDayFromType = function(type) {
    if (type=="men" || type=="women") {
        return "sunday";
    }
    else if (type=="mixed" || type=="family") {
        return "saturday";
    }
    else {
        console.error("Error getDayFromType : type provided ("+type+") is not supported.");
        return undefined;
    }
}

getRegistrationInfoFromPlayerID = function(playerID) {
    var pairs = getPairsFromPlayerID(playerID);
    if (typeof pairs === 'undefined') {
        return undefined;
    }
    var satData;
    var sunData;
    for (var i=0; i<pairs.length; i++) {
        var pairID = pairs[i]._id;
        var data = getTypeAndCategoryFromPairID(pairID);
        var type = data.playerType;
        var category = data.playerCategory;
        var day = getDayFromType(type);
        if (day == 'saturday') {
            satData = {playerType:type, playerCategory:category};
        }
        else if (day == 'sunday') {
            sunData = {playerType:type, playerCategory:category};
        }
        else {
            console.error("getDayFromType returned something weird : "+day);
        }
    }
    return {saturday: satData, sunday: sunData};
}

isSaturdayRegistered = function(playerID) {
    var info = getRegistrationInfoFromPlayerID(playerID);
    return info !== undefined && info.saturday !== undefined;
}

isSundayRegistered = function(playerID) {
    var info = getRegistrationInfoFromPlayerID(playerID);
    return info !== undefined && info.sunday !== undefined;
}

isBothRegistered = function(playerID) {
    var info = getRegistrationInfoFromPlayerID(playerID);
    return info !== undefined && info.sunday !== undefined && info.saturday !== undefined;
}

isRegistered = function(playerID) {
    var info = getRegistrationInfoFromPlayerID(playerID);
    return info !== undefined && (info.sunday !== undefined || info.saturday !== undefined);
}

/*
    @returns true if the 2 players whose birthDates are given can play together at the family tournament
*/
acceptPairForFamily = function(birthDate1, birthDate2, tournamentDate){
    age1 = getAge(birthDate1, tournamentDate);
    age2 = getAge(birthDate2, tournamentDate);

    return acceptPairForFamilyAge(age1,age2);
}

acceptPairForFamilyAge = function(age1, age2) {
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
    var currentYearData = (GlobalValues.findOne({_id:"currentYear"}));
    if(currentYearData===undefined){
        console.error("getAge : currentYear is not defined");
        return;
    }
    var currentYear = currentYearData.value;
    var tournamentDate;
    if (typeof tournamentDateSpecified !== 'undefined') {
        tournamentDate = tournamentDateSpecified;
    }
    else {
        tournamentDate = (Years.findOne({_id:currentYear})).tournamentDate;
    }
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

/*
*   params are strings
*   @param dateMatch := saturday | sunday | family
*   @param gender := M | F
*/
getTypeForPlayer = function(dateMatch, gender) {
    if (dateMatch === 'family') {
        return 'family';
    }
    else if (dateMatch === 'saturday') {
        return typeKeys[2];
    }
    else if (dateMatch === 'sunday') {
        return gender==='M' ? typeKeys[0] : typeKeys[1];
    }
    else {
        console.error("Error getTypeForPlayer - invalid dateMatch : "+dateMatch);
        return undefined;
    }
}

getColorFromPlayer = function(player){
        count = 0;
        code = 0;
        if(player.playerWish){
            count += 1;
            code = 1;
        }
        if(player.courtWish){
            count+=1;
            code = 2;
        }
        if(player.otherWish){
            count+=1;
            code = 3;
        }
        if(count>1) return '#4782ff';
        if(code == 1) return 'orange';
        if(code == 2) return 'red';
        if(code == 3) return 'magenta';
        return "";
}

addressToString = function(theAddress){
    var theString = "";
    if(theAddress!=undefined &&theAddress!=null){
        theString +=theAddress.street+" ";
        theString += theAddress.number+", ";
        theString += (theAddress.box!=="" && theAddress.box!==undefined)?"B."+theAddress.box+", ":"";
        theString += theAddress.zipCode+" ";
        theString +=theAddress.city+", ";
        theString += theAddress.country+" ";
    }
    return theString;
};

courtToString = function(court){
    if(court===undefined || court===null){
        return "";
    }
    var theString = "";

    var user = Meteor.users.findOne({_id:court.ownerID});
    if(user!==null && user!==undefined) theString += user.profile.lastName + " " + user.profile.firstName + " ";

    var address = Addresses.findOne({_id:court.addressID});
    theString += addressToString(address);

    theString += court.surface;
    theString += court.courtType;

    return theString.toLowerCase();
};

playerToString = function(player){
    var theString = "";
    if(player==undefined) return theString;
    addr = Addresses.findOne({_id:player.profile.addressID});
    if(addr!==undefined) theString += addressToString(addr);
    theString += player.profile.firstName += " ";
    theString += player.profile.lastName += " ";
    if(player.profile.phone!==undefined) theString += player.profile.phone += " ";
    if(player.profile.AFT!==undefined) theString += player.profile.AFT += " ";
    if(player.profile.gender!==undefined) theString += player.profile.gender += " ";
    if(player.profile.birthDate!==undefined) theString += player.profile.birthDate.toLocaleString() + " ";

    for(var i=0; i<player.emails.length;i++){
        theString += player.emails[i].address;
    }

    return theString.toLowerCase();
};

/*
  Returns the order in which to fill the first round of the tournament
*/
getOrder = function(size){

  var partial = function(n ,ni,result){

    var half = result.length/2;

    for(var i=0;i<ni;i++){
      result[ni+i] = result[i]+n;
      result[half+ni+i] = result[half+i]+n;
    }
  }

  var result=[];

  for(var k=0;k<size;k++){
    if(k==size/2){
      result.push(1);
    }
    else{
      result.push(0);
    }
  }

  var n=size/2;
  var ni=1;

  while(n>1){
    partial(n,ni,result);
    n=n/2;
    ni=ni*2;
  }

  return result;
};

/*
    Return the number of matches to play for the first round
*/

getNumberMatchesFirstRound = function(nbrPairs){

    var logPairs = Math.log2(nbrPairs);

    var numMatchesFull = Math.floor(logPairs);

    if(logPairs!=numMatchesFull){
        return nbrPairs - Math.pow(2,numMatchesFull);// the nbr of pairs is not a multiple of 2
    }
    else{
        return nbrPairs/2; // the nbr of pairs is a multiple of 2
    }
}
