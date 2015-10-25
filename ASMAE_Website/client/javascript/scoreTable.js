Template.scoreTable.helpers({

	// Returns a list of pairs
	'getPairs' : function(poolId){
		var pairList = [];
		var pool = Pools.findOne({_id:poolId});
		for(var i=0;i<pool.pairs.length;i++){
			var pair = Pairs.findOne({_id:pool.pairs[i]});
			if(pair.player1 && pair.player2) pairList.push(pair);
		}
		return pairList;
	},

	'getPlayer' : function(userId){
		var res = Meteor.users.findOne({_id:userId},{profile:1});
		return res;
	},

	'equals' : function(x, y){
		return x==y;
	},

	'getMatch' : function(pair1, pair2){
		var poolId = this._id;

		// TODO
		// var match = Pools.findOne(
		// 	{
		// 		"_id":poolId, 
		// 		"matchs":
		// 			{
		// 				"$or":
		// 					[
		// 						"$elemMatch" :  
		// 							{
		// 								{
		// 									"$and" : [{"pair1":pair1}, {"pair2":pair2}]
		// 							 	},
		// 							 	{
		// 							 		"$and" : [{"pair1":pair2}, {"pair2":pair1}]
		// 							 	}
		// 							}
		// 					]
		// 			}
		// 	}
		// );

		// if(!match){
		// 	// Create new match and return it TODO
		// 	console.log("create new match");
		// }
		// else{
		// 	// Return this match
		// 	return match;
		// }

	}

});

Template.scoreTable.events({
	'click #save' : function(event){
		var points = document.getElementsByClassName("points");
		var poolId = this._id; // "this" is the parameter of the template
		for(var i=0; i<points.length;i++){
			var score = points[i].value;
			//TODO
			console.log(points[i]);
		}
	},

	/*
		Generates and displays the pdf containing the scoreboard
	*/
	'click #getPDF' : function(event){

		/*
			Unhide the pdf preview window
		*/
		document.getElementsByClassName('preview-pane')[0].removeAttribute('hidden');
		
		/*
			Fetch pool data
		*/
		var poolId = document.getElementById('getPDF').getAttribute('data-pool');
		var pool = Pools.findOne({_id:poolId});

		/*
			Generate rows and columns
		*/
		var columns = ["Paires"]; // First line of the table
		var rows = [];
		for(var i=0;i<pool.pairs.length;i++){ // For each pair in the pool
			var pair = Pairs.findOne({_id:pool.pairs[i]}); // Fetch the pair from the db
			if(pair.player1 && pair.player2){
				/*
					Fetch the player data from the db
				*/
				var player1 = Meteor.users.findOne({_id:pair.player1._id},{profile:1});
				var player2 = Meteor.users.findOne({_id:pair.player2._id},{profile:1});

				/*	Create the pair display names	*/
				var pairString = player1.profile.firstName.substring(0,1) + ". " + player1.profile.lastName + "\n" +
					player2.profile.firstName.substring(0,1) + ". " + player2.profile.lastName;
				/*	The pair name is in the first line 	*/
				columns.push(pairString);

				/*	For every other column, add the pair's score 	*/
				var tempRow = [pairString];
				for(var j=0;j<pool.pairs.length;j++){
					if(i!=j+1){
						// Display the score of pool.pairs[j] against pool.pairs[i]
						tempRow.push("0"); // TODO : display the score of the match if we know it, otherwise display a spacebar to let the players write on the board
					}
					else{
						// A pair can't play against itself
						tempRow.push(" ");
					}
				}
				/*	Add that row all other rows	*/
				rows.push(tempRow);
			}
		}

	    /*
			Create the pdf
			Useful link : https://github.com/simonbengtsson/jsPDF-AutoTable/issues/44
	    */
		var pdf = new jsPDF('p','pt','a4');
        pdf.setDrawColor(51, 153, 255); // Lines color
		/*
			Create the header
		*/
	    var header = function (doc, pageCount, options) {
            doc.setFontSize(20);
            // pdf.addImage(headerImgData, 'JPEG', data.settings.margin.left, 40, 25, 25); // To add an image --> TODO : add ASMAE logo
            doc.text("Poule", options.margins.horizontal, 30); // TODO : change this to contain the court name. Would be good to add leader/staff info too
            doc.setFontSize(options.fontSize);
        };	



	    /*
			Create the footer
		*/
	    var totalPagesExp = "{total_pages_count_string}";
		var footer = function (doc, lastCellPos, pageCount, options) {
            var footerText = "Page " + pageCount + " sur " + totalPagesExp; // Display the page number
            doc.text(footerText, options.margins.horizontal, doc.internal.pageSize.height - 10); // Position of the page number display
        };


        /* 
        	Returns the text to display in a box of the score table and its offset for it to be centered
        */
        var getValue = function(data, settings, width){
            var textSpace = width - settings.padding * 2;
            // Add one pt to width to fix rounding error
        	var text = pdf.splitTextToSize(data, textSpace + 1, {fontSize: settings.fontSize}); // split the text to display it on multiple lines

            value = "";
            const maxLines = settings.lineHeight/pdf.internal.getLineHeight(); // Truncate the text after maxLines (avoid overlap)
            var maxWidth = 0; // Maximum width of the string

            for(var i=0;i<text.length && i<maxLines;i++){
            	value+=text[i];
         		if(i!=text.length-1) value+="\n"; // Add a line break between the words that have been split
         		var txtWidth = pdf.getStringUnitWidth(text[i])*settings.fontSize/pdf.internal.scaleFactor; // This is the width of the splitted word
            	if(txtWidth > maxWidth) maxWidth = txtWidth;
            }

            var diff = (width - maxWidth);
        	var offset = (diff>0 ? diff : 0) / 2; // Makes things centered

            return {"value":value, "offset" : offset};
        }

        var cell = function (x, y, width, height, key, value, row, settings) {
        		var fontSize = 0;
        		var fillParam = '';
        		if(key==0){
        			// Left column, pair names
        			fontSize = 10;
        			fillParam = 'F'; // fill without outline
        			pdf.setTextColor(255);
        			pdf.setFillColor(51, 153, 255);
                }
                else{
                	// Box of the table where points should be written
                	fillParam = 'S'; // outline
                	pdf.setTextColor(21, 21, 21);
                	fontSize = 9;
                }

                if(key==row+1){
                	// Can't play against yourself
                	fillParam = 'F'; // fill without outline
                	pdf.setFillColor(128, 128, 128);
                }

                settings.fontSize = fontSize;
        		pdf.setFontSize(fontSize);
                pdf.setLineWidth(0.1);

                // Draw the box
            	pdf.rect(x, y+(settings.lineHeight/2), width, height, fillParam);

            	// Get the text
                value = getValue(rows[row][key], settings, width);

                // Draw the text
                pdf.text('' + value["value"], x + value["offset"], y+settings.lineHeight);
            };

       var headerCell = function (x, y, width, height, key, value, settings){
       		console.log("headerCell");
       		var fontSize = 10;
       		settings.fontSize = fontSize;
        	pdf.setFontSize(fontSize);
            pdf.setLineWidth(0.1);

			pdf.setTextColor(255);
            pdf.setFillColor(26,188,156);

            // Draw the box
            pdf.rect(x, y+(settings.lineHeight/2), width, height, 'F');

            // Get the text
            value = getValue(columns[key].title, settings, width);

            // Display the text
            pdf.text('' + value["value"], x + value["offset"], y+settings.lineHeight);
       }

	    /*
			Create the table options
	    */
		var options = {
			renderHeaderCell: headerCell,
			renderHeader: header,
        	renderFooter: footer,
        	renderCell : cell,
        	lineHeight: 50 // Change this if you want a taller table
		};

		/*
			Add the table to the pdf
		*/
		pdf.autoTable(columns, rows, options);

		/*
			Display the page number
		*/
		// Total page number plugin only available in jspdf v1.0+
	    if (typeof pdf.putTotalPages === 'function') {
	        pdf.putTotalPages(totalPagesExp);
	    }

		/*
			Display the pdf in the html
		*/
		var string = pdf.output('datauristring');
		document.getElementsByClassName('preview-pane')[0].setAttribute('src', string);

	}

});