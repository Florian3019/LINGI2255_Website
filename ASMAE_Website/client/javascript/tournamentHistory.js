var makeYearGraph = function(){
	// http://gionkunz.github.io/chartist-js/index.html

	/* Add a basic data series with six labels and values */
	var years = [ '1974', 
	  			'1975', 
	  			'1976', 
	  			'1977', 
	  			'1978', 
	  			'1979',
	  			'1980',
	  			'1981',
	  			'1982',
	  			'1983',
	  			'1984',
	  			'1985',
	  			'1986',
	  			'1987',
	  			'1988',
	  			'1989',
	  			'1990',
	  			'1991',
	  			'1992',
	  			'1993',
	  			'1994',
	  			'2000',
	  			'2003',
	  			'2004',
	  			'2005',
	  			'2006',
	  			'2007',
	  			'2008',
	  			'2009',
	  			'2010',
	  			'2011',
	  			'2012',
	  			'2013'
	  			];

	var graphData = [{meta:years[0], value:60},
	      		 {meta:years[1],value:150}, 
	      		 {meta:years[2],value:380}, 
	      		 {meta:years[3],value:650}, 
	      		 {meta:years[4],value:960},
	      		 {meta:years[5],value:750},
	      		 {meta:years[6],value:720},
	      		 {meta:years[7],value:640},
	      		 {meta:years[8],value:600},
	      		 {meta:years[9],value:550},
	      		 {meta:years[10],value:490},
	      		 {meta:years[11],value:400},
	      		 {meta:years[12],value:420},
	      		 {meta:years[13],value:350},
	      		 {meta:years[14],value:460},
	      		 {meta:years[15],value:850},
	      		 {meta:years[16],value:550},
	      		 {meta:years[17],value:600},
	      		 {meta:years[18],value:620},
	      		 {meta:years[19],value:650},
	      		 {meta:years[20],value:800},
	      		 {meta:years[21],value:1020},
	      		 {meta:years[22],value:760},
	      		 {meta:years[23],value:884},
	      		 {meta:years[24],value:998},
	      		 {meta:years[25],value:1056},
	      		 {meta:years[26],value:1130},
	      		 {meta:years[27],value:1092},
	      		 {meta:years[28],value:1242},
	      		 {meta:years[29],value:1274},
	      		 {meta:years[30],value:1126},
	      		 {meta:years[31],value:986},
	      		 {meta:years[32],value:1000}
	      		 ]


	// Add data for the new years
	var yearData = Years.find({},{sort:{_id:1}}).fetch();
	for(var i=0;i<yearData.length;i++){
		years.push(yearData[i]._id);
		var players = getNumberOfPlayers(yearData[i]._id);
		graphData.push({meta:yearData[i]._id, value:players});
	}

	var data = {
	  labels: years,
	  series: [
	    {
	      data: graphData
	    }
	  ]
	};

	/* Set some base options (settings will override the default settings in Chartist.js *see default settings*). We are adding a basic label interpolation function for the xAxis labels. */
	var options = {
	  // axisX: {
	  //   labelInterpolationFnc: function(value) {
	  //     return value;
	  //   }
	  // },
	  height:"200px",
	  classNames:{
	  	horizontal: 'rotate',
	  },
  	  axisY: {
	    offset: 100
	  },
	  chartPadding: {
		top: 20,
		right: 0,
		bottom: 30,
		left: 0
	  },
	  plugins: [
        Chartist.plugins.ctAxisTitle({
            axisY: {
                axisTitle: 'Joueurs',
                axisClass: 'ct-axis-title',
                offset: {
                    x: 0,
                    y: 0
                },
                flipTitle: false
            }
        }),
        Chartist.plugins.tooltip()
    ]
	};

	var responsiveOptions = [
	  ['screen and (min-width: 641px) and (max-width: 1024px)', {
	    showPoint: false,
	  }],
	  ['screen and (max-width: 640px)', {
	    showLine: false,
	  }]
	];

	/* Initialize the chart with the above settings */
	new Chartist.Line('#yearGraph', data, options, responsiveOptions);
}

var makeThisYearGraph = function(){
	var labels = [];
	var series = [];

	var c = GlobalValues.findOne({_id:"currentYear"});
    var currentYear = c.value;

	var data = getPlayersInYear(currentYear);
	// console.log(data);
	for(var i=0; i<data.length;i++){
		var d = data[i];
		labels.push(d.label);
		var categoryData = d.value;

		var curSerie = [];
		for(var j=0; j<categoryData.length;j++){
			var catLabel = categoryData[j].label;
			curSerie.push({meta:catLabel, value:categoryData[j].value});
		}
		series.push(curSerie);
	}

	// Transpose that matrix

	var seriesTranspose = [];
	for(var i=0; i<series[0].length;i++){
		seriesTranspose.push([]);
		for(var j=0; j<series.length; j++){
			seriesTranspose[i].push(series[j][i]);
		}
	}

	var pluginOptions = [
	  	Chartist.plugins.ctAxisTitle({
            axisY: {
                axisTitle: 'Joueurs',
                axisClass: 'ct-axis-title',
                offset: {
                    x: 0,
                    y: -1
                },
                flipTitle: false
            }
        }),
        Chartist.plugins.tooltip()
		];

	new Chartist.Bar('#thisYearGraph', {
	  'labels': labels,
	  'series': seriesTranspose
	}, {
	  // Default mobile configuration
	  stackBars: true,
	  axisX: {
	    labelInterpolationFnc: function(value) {
	      return value.split(/\s+/).map(function(word) {
	        return word[0];
	      }).join('');
	    }
	  },
	  axisY: {
	    offset: 20
	  },
	  height:"200px",
	  plugins:pluginOptions
	}, [
	  // Options override for media > 400px
	  ['screen and (min-width: 400px)', {
	    reverseData: true,
	    horizontalBars: true,
	    axisX: {
	      labelInterpolationFnc: Chartist.noop
	    },
	    axisY: {
	      offset: 60
	    }
	  }],
	  // Options override for media > 1000px
	  ['screen and (min-width: 1000px)', {
	  	stackBars: false,
	    reverseData: false,
	    horizontalBars: false,
	    seriesBarDistance: 15
	  }]
	]
	);
}

var getPlayersInCategory = function(typeData, category){
	var players = 0;
	if(typeData === undefined) return 0;
	var pools = typeData[category];
	if(pools===undefined) return 0;

	// Go through all the pools
	for(var i=0; i<pools.length;i++){
		var pool = Pools.findOne({_id:pools[i]}, {pairs:1});
		var pairs = pool.pairs;

		// Go through all the pairs in the pool
		for(var j=0; j<pairs.length;j++){
			players += hasBothPlayers(Pairs.findOne({_id:pairs[j]})) ? 2 : 1;
		}
	}
	return players;
}

var getPlayersInType = function(yearData, type){
	if(yearData===undefined) return [];
	var typeId = yearData[type];
	var typeData = Types.findOne({_id:typeId});

	var data = [];
	for(var i=0; i<categoriesKeys.length;i++){
		// skip family
		if(type!=="family"){
			var cat = categoriesTranslate[categoriesKeys[i]];
			if(categoriesKeys[i]==="all"){
				data.push({label:"", value:0});
			} 
			else{
				data.push({label:cat, value:getPlayersInCategory(typeData, categoriesKeys[i])});
			}
		}
		else if(categoriesKeys[i]==="all") {// Category is all
			data.push({label:typesTranslate[type], value:getPlayersInCategory(typeData, "all")});
		}
		else{
			data.push({label:"", value:0});
		}
	}

	return data;
}

var getPlayersInYear = function(year){
	var data = [];
	var yearData = Years.findOne({_id:year});

	for(var i=0; i<typeKeys.length;i++){
		var type = typesTranslate[typeKeys[i]];
		data.push({label:type, value:getPlayersInType(yearData, typeKeys[i])}); 
	}
	return data;
}

var getNumberOfPlayers = function(year){
    var P1Exists = {player1:{$exists:true}};
    var P2Exists = {player2:{$exists:true}};
    var P2DoesNotExist = {player2:{$exists:false}};

    var fullPairs = Pairs.find({$and:[{year:year}, P1Exists, P2Exists]}).count();
    var alonePairs = Pairs.find({$and:[{year:year}, P1Exists, P2DoesNotExist]}).count();

    return fullPairs*2 + alonePairs;
}

var anchorBoolean = false;

Template.tournamentHistory.onRendered(function(){
	makeYearGraph();
	makeThisYearGraph();

	var $window = $(window);
	var wWidth  = $window.width();
	if (wWidth <= 750) { // Only in mobile screen (not 767px cause marge of 17px)
		// Go mobile menu
		/*window.location.hash = '#menu-mobile';*/
	}
});

Template.tournamentHistory.helpers({
	'tournamentStarted':function(){
		var c = GlobalValues.findOne({_id:"currentYear"});
	    if(c===undefined) return false;
	    var currentYear = c.value;
	    return currentYear!=="" && currentYear!==undefined;
	},

	// Returns the total amount of players for this year
	'getNumberOfPlayers':function(){
		var c = GlobalValues.findOne({_id:"currentYear"});
    	var currentYear = c.value;
		return getNumberOfPlayers(currentYear);
	},

	'getCurrentYear':function(){
		var c = GlobalValues.findOne({_id:"currentYear"});
	    var currentYear = c.value;
	    return currentYear;
	},
});

Template.tournamentHistory.onCreated(function(){
	init_chartist_plugin_axisTitle(window, document, Chartist);
	init_chartist_plugin_tooltip(window, document, Chartist);
});