# Mini doc pour la db

## GlobalValues

The website always needs some GlobalValues.
A global value structure is as follows:

    {
        _id: <string: key>,
        value: <value>
    }

These GlobalValues documents should be initialized when launching the website on a new platform:

    _id: "currentYear" --> value: <string: year>
    _id: "nextCourtNumber" --> value: <
    _id: "registrationsON" --> value: <boolean>
    _id: "nextBankTransferNumber" --> value: <integer>

## Years

    {
        _id:<string: year>,
        tournamentDate: <date>,
        tournamentPrice: <number>,
        maximumAFT: <string: AFT ranking>,  // Registrations to the tournament are only allowed if the AFT ranking is smaller than maximumAFT
        mixed:<typeID>,
        men:<typeID>,
        women:<typeID>,
        family:<typeID>,

        //The stepXdone fields are used for the tournamentProgression template to know which steps are marked as done
        step2done:<boolean>,
        step3done:<boolean>,
        step4done:<boolean>,
        step5done:<boolean>,
        step6done:<boolean>,
        step7done:<boolean>,
        step8done:<boolean>
    }


## Types

        A type structure is as follows :
        {
            typeString : men | women | mixed | family

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


            // Staff responsables
                Can only add a single staff for each update to a category.
            preminimesResp:<list of userId>
            minimesResp:<list of userId>
            cadetsResp:<list of userId>
            scolarsResp:<list of userId>
            juniorsResp:<list of userId>
            seniorsResp:<list of userId>
            elitesResp:<list of userId>
            listResp:<list of pairID>

            NOTE : for the family tournament, only one list of pools :
            all:<list of poolIDs>

            completion:{
                pools: {minimes:<percentage>, ...}  // NOTE: 0 <= <percentage> <= 1
                brackets: {minimes:<percentage>, ...}
            }
        }


## Pools

    {
        _id:<id>,
        pairs:[<pairID>, <pairID>, ...], // Will append pairs to existing array (no duplicates possible)
        leader:<pairId>, // Leader is the player1 from the pair
        courtId:<courtID>,
        type:<type>,
        category:<category>
    }

## Courts

    {
        _id:<courtId>,
        addressID:<addressID>,
        ownerID:<ownerID>,
        surface:<surface>,
        type:<type>,
        instructions:<instructions>,
        ownerComment:<ownerComment>,
        staffComment:<staffComment>,
        dispoSamedi:<boolean>,
        dispoDimanche:<boolean>,
        ownerOK:<boolean>,
        staffOK:<boolean>,
        numberOfCourts: <integer>,
        isOutdoor:<boolean>,
        log:[<logId>, ...],
        coords:{ // automatically set when addressID is provided
            lat:<latitude>,
            lng:<longitude>
        },
        HQDist:<double> (distance from HQ)
    }


## Meteor.users

    {
        createdAt:<createdAt>,
        _id:<id>,
        emails:[{ "address" : "<email1>", "verified" : false } , ...],
        profile:{
            name:<name>,
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
        },
        log:[<logId>, ...]
    }


## Addresses

    {
        _id:<id>, // Omit this if you want to create a new address, this will be auto-generated
        street:<string: street>,
        number:<integer: number>,
        box:<string: box>,
        city:<string: city>,
        zipCode:<integer: zipCode>,
        country:<string: country>,
        isCourtAddress:<boolean>
    }


## Pairs

    {
        _id:<id>,
        player1:{
            _id:<userID>,
            extras:{
                <name>:<number>
            },
            playerWish:<playerWish>,
            courtWish:<courtWish>,
            otherWish:<otherWish>
        },
        player2:{
            _id:<userID>,
            extras:{
                <name>:<number>
            },
            playerWish:<playerWish>,
            courtWish:<courtWish>,
            otherWish:<otherWish>
        },
        tournament :[<pointsRound1>, <pointsRound2>, ....],
        tournamentCourts:[<courtForRound1>, ...],
        year:<year>
    }

## Extras

    {
        _id: <id>,
        name: <string: extra name>,
        price: <double: price>,
        comment: <string: comment>
    }

## Payments

    {
        _id: <id>,
        userID: <user id>,
        tournamentYear: <tournament year>,
        status: <string: status>, // "paid" or "pending"
        balance:< number: balance>,
        date: <date>,
        paymentMethod: <string: method>, // "Cash", "CreditCard" or "BankTransfer"
        bankTransferNumber: <integer> // Only present when paymentMethod=="BankTransfer". A number (> 1000) used for the communication field of a bank transfer.
    }


## Matches

    {
        _id:<id>, // Automatically set
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

## Winners

    {
        _id: <id>, // Automatically set
        year: <year>,
        type: <type>,
        category: <category>,
        first: <pairId>,
        second: <pairId>
    }

## Questions

    {
        _id: <id>, // Automatically set
        lastname : <user lastname>,
        firstname: <user firstname>,
        email : <user email>,
        question : <string: question>,
        date : <date>,
        processed : <boolean>
    }

## ModificationsLog

    {
        _id: <id>, // Automatically set
        userId : <userId> // Automatically generated
        opType : <string: operationType> // String describing the type of the operation (mandatory)
        details : <string: all usefull informations about the operation> // short String describing the operation (optional)
        createdAt : <date> // automatically generated
    }

## FORUM

Thread structure:

    {
        _id: <threadId>, // Automatically set
        name: <threadName>,
        topics:[
            <topicId1>, ...
        ]
    }

Topic structure:

    {
        _id: <topicId>, // Automatically set
        name:<topic name>,
        lastUpdatedTime:<Date>,
        lastUpdatedUser:<userId>,
        posts:[<post1>,...]
    }

Post structure:

    {
        _id: <postId>, // Automatically set
        time:<Date>,
        author:<userId>,
        postText:<post text>
    }
