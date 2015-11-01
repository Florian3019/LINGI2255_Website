Template.scoreTable.helpers({

	'getLeader' : function(poolId){
		pool = Pools.findOne({_id:poolId},{leader:1});
		if(pool.leader){
			pair = Pairs.findOne({_id:pool.leader},{player1:1});
			if(pair && pair.player1 && pair.player1._id){
				user = Meteor.users.findOne({_id:pair.player1._id});
				console.log(user);
				return user;
			}
		}
		return undefined;
	},

	'getEmail' : function(user){
		if(user.emails){
			return user.emails[0].address;
		}
		else{
			return undefined;
		}
	},

	// Returns a list of pairs that are in this pool
	'getPairs' : function(poolId){
		var pairList = [];
		var pool = Pools.findOne({_id:poolId});
		if(!pool){
			return;
		}
		for(var i=0;i<pool.pairs.length;i++){
			var pair = Pairs.findOne({_id:pool.pairs[i]});
			if(pair.player1 && pair.player2) pairList.push(pair);
		}

		// Create a match for each of these pairs, if it does not yet exist
		for(var i=0;i<pairList.length;i++){
			for(var j=0;j<i;j++){
				pairId1 = pairList[i]._id;
				pairId2 = pairList[j]._id;

				var d1 = {};
				d1[pairId1] = {$exists:true};
				var d2 = {};
				d2[pairId2] = {$exists:true};


				var match = Matches.findOne(
					{
						$and: [
							{"poolId":poolId}, // I want to find only matches belonging to this pool
							{$and: [d1,d2]} // A match has to have both fields for pair1 and pair2 set 
						]
					}
				);

				if(!match){
					// Match does not exist, create a new one

					data = {"poolId":poolId};
					data.pair1 = {"pairId": pairId1, "points":0};
					data.pair2 = {"pairId": pairId2, "points":0};
					console.log("scoreTable/match creation");
					console.log(data);
					Meteor.call("updateMatch", data); // This will create a new match and link it to the pool
				}
			}
		}

		return pairList;
	},

	'getPlayer' : function(userId){
		var res = Meteor.users.findOne({_id:userId},{profile:1});
		return res;
	},

	'getPoints' : function(match, pairId){
		var points = match[pairId];
		return points;
	},

	'getMatch' : function(poolId, pairId1, pairId2){
		var d1 = {};
		d1[(pairId1)] = {$exists:true};
		var d2 = {};
		d2[(pairId2)] = {$exists:true};

		var match = Matches.findOne(
			{
				$and: [
					{"poolId":poolId}, // I want to find only matches belonging to this pool
					{$and: [d1,d2]} // A match has to have both fields for pair1 and pair2 set 
				]
			}
		);

		return match ? match : undefined;
	}

});

Template.scoreTable.events({
	'click #save' : function(event){
		var points = document.getElementsByClassName("points");
		var poolId = this._id; // "this" is the parameter of the template
		for(var i=0; i<points.length;i++){
			var score = points[i].value;
			var matchId = points[i].getAttribute('data-matchid');
			var pairId = points[i].getAttribute('data-pairid');

			// the fact that this is pair1 and not pair2 is irrelevant for the update (just for parsing convenience)
			data = {"_id":matchId, pair1:{"pairId":pairId, "points":parseInt(score)}}; 
			console.log("save");
			console.log(data);
			// Update the DB !
			Meteor.call("updateMatch", data);
		}

		document.getElementById("successBox").removeAttribute("hidden");
	},

	'change #checkBoxEmptyTable' : function(event){
		checked = document.getElementById(event.target.id).checked;
		Session.set("scoreTable/emptyTable", checked);
	},

	'change .points' : function(event){
		document.getElementById("successBox").setAttribute("hidden","");// Remove any success message if any, user just changed a score
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
					if(i!=j && !Session.get("scoreTable/emptyTable")){

						var d1 = {};
						d1[(pool.pairs[j])] = {$exists:true};
						var d2 = {};
						d2[( pool.pairs[i])] = {$exists:true};


						// Fetch the match
						var match = Matches.findOne(
							{
								$and: [
									{"poolId":poolId}, // I want to find only matches belonging to this pool
									{$and: [d1,d2]} // A match has to have both fields for pair1 and pair2 set 
								]
							}
						);

						score = match[pool.pairs[i]];

						// Display the score of pool.pairs[i] against pool.pairs[j]
						tempRow.push(score);
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

		leader = undefined;
		// Fetch the leader
		if(pool.leader){
			pair = Pairs.findOne({_id:pool.leader},{player1:1});
			if(pair && pair.player1 && pair.player1._id){
				leader = Meteor.users.findOne({_id:pair.player1._id});
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
            doc.text("Poule\n", options.margins.horizontal, 30); // TODO : change this to contain the court name. Would be good to add leader/staff info too
            if(leader){
            	doc.setFontSize(15);
	            leaderText = "Chef de poule : " + leader.profile.firstName + " " + leader.profile.lastName;
	            
	            if(leader.emails) leaderText += "\n" + leader.emails[0].address;
	            if(leader.profile.phone) leaderText += "    " + leader.profile.phone;
	        	doc.text(leaderText,  options.margins.horizontal, 50);
	        }
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
        	var text = pdf.splitTextToSize(data+"", textSpace + 1, {fontSize: settings.fontSize}); // split the text to display it on multiple lines

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