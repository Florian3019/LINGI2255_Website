Meteor.methods({
    'getPairsAlonePlayers' : function(type, category, date) {
        var pairs = Meteor.call('getPlayersID', type, category);
        if(typeof pairs !== 'undefined') {
            var pairsAlonePlayers = [];
            var pair;
            for (var i=0; i<pairs.length; i++) {
                pair = Pairs.findOne({_id:pairs[i]});
                if (typeof pair.player2 === 'undefined' && typeof pair.player1 !== 'undefined') {
                    if (type === 'family') {
                        var other = Meteor.users.findOne({_id:pair.player1._id});
                        var otherDate = other.profile.birthDate;
                        if (acceptPairForFamily(date,otherDate)) {
                            pairsAlonePlayers.push(pair);
                        }
                    }
                    else {
                        pairsAlonePlayers.push(pair);
                    }
                }
            }
            return pairsAlonePlayers;
        }
        else {
            return undefined;
        }

    },

    'getPlayersID' : function(type, category) {
        if (typeKeys.indexOf(type) < 0) {
            console.error("getPlayersID error : type provided is not supported ("+type+")");
            return undefined;
        }
        if (categoriesKeys.indexOf(category) < 0) {
            console.error("getPlayersID error : category provided is not supported ("+category+")");
            return undefined;
        }
        if (type === 'family') {
            category = 'all';
        }
        yearTable = Years.findOne({_id:currentYear});
        if (typeof yearTable === 'undefined') {
            console.warn("getPlayersID : no yeartable found for year "+currentYear);
            return undefined;
        }
        typeTableID = yearTable[type];
        var typeTable = Types.findOne({_id:typeTableID});

        if (typeof typeTable === 'undefined') {
            console.warn("getPlayersID : no typeTable found for type "+type);
            return undefined;
        }
        var poolList = typeTable[category];
        if (typeof poolList === 'undefined') {
            console.warn("getPlayersID : no pool found for type "+type+" and category "+category);
            return undefined;
        }

        var pool;
        var pairs = [];
        for(var i=0;i<poolList.length;i++){
            pool = Pools.findOne({_id:poolList[i]});
            pairs = pairs.concat(pool['pairs']);
        }
        return pairs;
    }
});
