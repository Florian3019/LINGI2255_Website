# Mini doc pour la db


## Year

A year structure is as follows :
{
    _id:<date>,
    mixed:<typeID>,
    men:<typeID>,
    women:<typeID>,
    family:<typeID>
}


## Type

A type structure is as follows :
{
    // Can only $addToSet
    _id:<typeID>
    preminimes:<list of poolIDs>
    minimes:<list of poolIDs>
    cadets:<list of poolIDs>
    scolars:<list of poolIDs>
    juniors:<list of poolIDs>
    seniors:<list of poolIDs>
    elites:<list of poolIDs>


    // Can only $set
    preminimesBracket:<list of pairId>
    minimesBracket:<list of pairId>
    cadetsBracket:<list of pairId>
    scolarsBracket:<list of pairId>
    juniorsBracket:<list of pairId>
    seniorsBracket:<list of pairId>
    elitesBracket:<list of pairId>
    listBracket:<list of pairID>

    NOTE : for the family tournament, only one list of pools :
    list:<list of poolIDs>
}


## Pool

A pool is structured as follows:
{
    _id:<id>,
    court:<court>, --> To remove
    pairs:[<pairID>, <pairID>, ...], // Will append pairs to existing array (no duplicates possible)
    leader:<pairId>, // Leader is the player1 from the pair
    courtId:<courtID>,
}

## Court

A court structure is as follows :
{
    _id:<courtId>,
    addressID:<addressID>,
    ownerID:<ownerID>,
    surface:<surface>,
    type:<type>,
    instructions:<instructions>,
    ownerComment:<ownerComment>,
    staffComment:<staffComment>,
    availability:<availability>
}


## Meteor.user

User structure is as follows :
{
    createdAt:<createdAt>,
    _id:<id>,
    emails:[{ "address" : "<email1>", "verified" : false } , ...],
    profile:{
        name:<name>,
        title:<title>,
        firstName:<firstName>,
        lastName:<lastName>,
        addressID:<addressID>,
        phone:<phone>,
        birthDate:<birthDate>,
        AFT:<AFT>,
        isStaff:<isStaff>,
        isAdmin:<isAdmin>,
        gender:<gender>
    },
    services:{
        google{
            <google stuff>
        }
        facebook{
            <facebook stuff>
        }
    }
}


## Address

The addressData structure is as follows :
{
    _id:<id>, // Omit this if you want to create a new address, this will be auto-generated
    street:<street>,
    number:<number>,
    box:<box>,
    city:<city>,
    zipCode:<zipCode>,
    country:<country>
}


## Pair

A pair is structured as follows:
{
    _id:<id>,
    player1:{
        _id:<userID>,
        extras:{
            <name>:<number>
        },
        wish:<wish>,
        constraint:<constraint>,
        paymentID:<paymentID>
    }
    player2:{
        _id:<userID>,
        extras:{
            <name>:<number>
        },
        wish:<wish>,
        constraint:<constraint>,
        paymentID:<paymentID>
    }
    tournament :[<pointsRound1>, <pointsRound2>, ....]
    day: family | saturday | sunday
    category: <category>
}


## Payment

A payment is structured as follows :
{
    _id:<id>,
    status:<status>, // paid or pending
    balance:<balance>,
    date:<date>,
    paymentMethod:<method>, // Cash, CreditCard or BankTransfer
}


## Match

A match is structured as follows :
{
    _id:<id>,
    poolId:<poolId>,
    <pairID>:<points>,
    <pairID>:<points>,
    courtId:<courtID>
}

matchData is expected to be formated like this :
{
    _id:<id>, // Optional
    poolId:<poolId>,
    pair1: {pairId: <pairID>, points:<points>}, // Note : the order pair1/pair2 is irrelevant and is just for the convenience of parsing the data
    pair2: {pairId: <pairID>, points:<points>}
}
