/*
	This file populates the database with fictive players and courts, for testing purposes.
*/

Meteor.methods({

	'activateDB' : function(isTest) {
		console.log("Activation of the DB");
		console.log("activateDB grants you ADMIN access !");
		Meteor.call("turnAdminInsecure", Meteor.userId());

		console.log("Activate GlobalValuesDB");
		Meteor.call('activateGlobalValuesDB');

		console.log("activateDB sets your email to verified");
		var user = Meteor.users.findOne({_id:Meteor.userId()});
		var a = "test@test.com";
		if (!isTest) {
			Accounts.addEmail(Meteor.userId(), a, true);
		}
	},

    /*
	 * Insert some users in the DB for the tournament specified as the first argument
	 * This is magic
	 */
	'populateDB': function(tournamentDateTab, nPairsTab, nAlonesTab, nUnregistered, nCourtSaturdayTab, nCourtSundayTab, nCourtBothTab, nStaff, nAdmin, isTest) {

		var firstnamesM = [ "Youssef", "Zakaria", "Yannick", "Zachary", "Younès", "Yannis", "Yani", "Ylan", "Yoni", "Julian", "Kilian", "Jules", "Kaïs", "Karim", "Pierre-antoine", "Oumar", "Noam", "Paco", "Bryan", "Anthony", "Arsène", "Auguste", "Aurèle", "Arnaud", "Angelo", "Esteban", "Eliott", "Elliot", "Elouan", "Constantin", "Damien", "Alexis", "Ahmed", "Alban", "Amara", "Adam", "Amaury", "Amir", "Andy", "Benjamin", "Baptiste", "Brayan", "Brieuc", "Ayman", "Briac", "Brian", "Bruno", "Avi", "Dimitri", "Eliot", "Flavio", "Florent", "Franck", "Hugues", "Gabin", "Henri", "Gad", "Mathurin", "Maxime", "Mayeul", "Mateo", "Mahe", "Jarod", "Jason", "Karim", "Ivan", "Joey", "Leonard", "Kyllian", "Lilian", "Kevin", "Nassim", "Noah", "Noam", "Neil", "Mohamed", "Nadir", "Nael", "Luca", "Lino", "Ibrahim", "Idriss", "Ilyès", "Ilan", "Igor", "Nathanaël", "Noe", "Paulin", "Oumar", "Oren", "Paco", "Souleymane", "Titouan", "Tristan", "Ulysse", "Xavier", "Tiago", "Timeo", "Tony", "Tao", "Chahine", "Bruno", "Guillaume", "Ibrahima", "Hector", "Henry", "Constantin", "Clement", "Colin", "Antoine", "Anthony", "Arnaud", "Anton", "Ange", "Balthazar", "Benjamin", "Aurelien", "Aviel", "Aymen", "Badis", "Alexandre", "Adame", "Abel", "Adel", "Adem", "Edouard", "Dan", "Jordan", "Isaac", "Issam", "Jimmy", "Kamil", "Jack", "Killian", "Kevin", "Erwann", "Eytan", "Elie", "Florian", "Georges", "Germain", "Farès", "Lirone", "Loan", "Balthazar", "Benjamin", "Aymeric", "Bakary", "Djibril", "Ambroise", "Anatole", "Alone", "Andy", "Armand", "Arthus", "Aubin", "Ayman", "Aymen", "Gaspard", "Gaspar", "Gianni", "Giulio", "Constantin", "François", "Esteban", "Florian", "Eugène", "Farès", "Ibrahim", "Harold", "Idriss", "Ian", "Sofiane", "Sidney", "Tanguy", "Simon", "Olivier", "Nathan", "Octave", "Noam", "Rodrigue", "Pierre", "Romain", "Oscar", "Sacha", "Mahamadou", "Maël", "Maceo", "Luca", "Sebastien", "Shaï", "Samy", "Youssouf", "Zakaria", "Wesley", "Wissem", "Younes", "Willy", "Michaël", "Moussa", "Alexandre", "Ambroise", "Amadou", "Alan", "Antoine", "Arthur", "Anas", "Ari", "Balthazar", "Aymeric", "Aymane", "Benoit", "Elias", "Elio", "Brandon", "Bilel", "Cyriaque", "Cyprien", "Djibril", "Dorian", "Darius", "Corto", "Dany", "Emmanuel", "Emile", "Enzo", "Eloi", "Christopher", "Corentin", "Chris", "Colin", "Esteban", "Ethan", "Erwan", "Evann", "Fares", "Ewan", "Geoffrey", "Giovanni", "Gautier", "Georges", "Gustave", "Germain", "Vladimir", "Thierry", "Timothe", "Yanni", "Jean-Baptiste", "Jean-Marc", "Ismaël", "Jacques", "Jeremy", "Ilyes", "Jean", "Mahamadou", "Lucien", "Louis", "Luc", "Mathis", "Marwan", "Marko", "Richard", "Romain", "Robin", "Stephane", "Sylvain", "Samuel", "Tanguy", "Simon", "Teddy", "Jonathan", "Johann", "Joël", "Kaïs", "Joris", "John", "Melchior", "Matteo", "Moussa", "Mathys", "Moïse", "Max", "Killian", "Laurent", "Lazare", "Kenny", "Lior", "Ibrahima", "Ilyass", "Hakim", "Idris", "Ilias", "Ilyas", "Hugo", "Guy", "Ian", "Philippe", "Olivier", "Octave", "Paul", "Khalil", "Kevin", "Karl", "Marwane", "Matteo", "Matthieu", "Max", "Maxim", "Melvin", "Melvyn", "Mickael", "Mickaël", "Morgan", "Moussa", "Moustapha", "Nino", "Nolhan", "Octave", "Oren", "Oscar", "Rafaël", "Reda", "Remi", "Riyad", "Rodrigue", "Roman", "Romeo", "Ryad", "Samba", "Stephane", "Steve", "Swan", "Theo", "Thibault", "Timothee", "Tomas", "Tommy", "Virgile", "Wandrille", "Wissem", "Yassin", "Yves", "Zacharie", "Zachary", "Abdallah", "Abdoulaye", "Adama", "Adel", "Adem", "Adil", "Alessandro", "Alfred", "Ali", "Amaury", "Ambroise", "Anis", "Anton", "Aristide", "Armand", "Arsène", "Arthur", "Bilel", "Boubacar", "Charles", "Charly", "Christian", "Denis", "Dimitri", "Djibril", "Dorian", "Elian", "Elias", "Elio", "Elliott", "Emile", "Eric", "Ernest", "Erwan", "Ethan", "Eugène", "Gaspard", "Gauthier", "Guillaume", "Hadrien", "Harry", "Henry", "Hippolyte", "Idriss", "Ilhan", "Ilyan", "Issa", "Issam", "Iyed", "Jacques", "Jad", "Jaden", "Jan", "Jason", "Jimmy", "Joaquim", "Robinson", "Ruben", "Ronan", "Sabri", "Ryad", "Baudouin", "Celestin", "Calvin", "Celian", "Ben", "Baptiste", "Aurèle", "Ariel", "Raphaël", "Pierre", "Riyad", "Rami", "Robinson", "Rudy", "Sean", "Olivier", "Ousmane", "Patrick", "Nolan", "Owen", "Anatole", "Amaury", "Amadou", "Allan", "Andre", "Amir", "Ludovic", "Louka", "Loup", "Christopher", "Christian", "Clarence", "Cesar", "Chris", "Corentin", "Djibril", "Elijah", "Côme", "Frederic", "Giovanni", "Gustave", "Gaëtan", "Flavien", "Franck", "Eliot", "Elyas", "Enzo", "Elio", "Luigi", "Luka", "Mohamed-amine", "Mohammed", "Nicolas", "Mohamed", "Michel", "Noe", "Lorenzo", "Lior", "Souleymane", "Theophile", "Theophane", "Stephane", "Terence", "Thibaud", "Leopold", "Kylian", "Lamine", "Leo", "Mathieu", "Martin", "Matheo", "Alessandro", "Timothe", "Achille", "Abdoul", "Timeo", "Alex", "Jean-baptiste", "Ismaïl", "Jawad", "Jalil", "Issa", "Jad", "Jonathan", "Julien", "Julian", "Justin", "Jules", "John", "Joan", "Erwan", "Felix", "Evan", "Ewan", "Ilyès", "Teo", "Sebastien", "Robinson", "Ronan", "Shaï", "Jeremie", "Joseph", "Joris", "Leonard", "Laurent", "Leon", "Lino", "Luca", "Luka", "Raphael", "Samba", "Samy", "Sam", "Mathurin", "Matisse", "Maxime", "Marvin", "Mayeul", "Mario", "Matys", "Melvin", "Morgan", "Niels", "Nil", "Mamadou", "Malik", "Malo", "Marc", "Mahe", "Selim", "Thibaut", "Solal", "Theo", "Teo", "Valerie", "Victor", "Wissem", "Tiago", "Vadim", "Zakarya", "Achille", "Adrian", "Aaron", "Yaya", "Ylan", "Yoni", "Florentin", "Foucauld", "Florent", "Flavio", "Eyal", "Elliott", "Eliott", "Elio", "Cyprien", "Cheick", "Côme", "Cyril", "Dany", "Andreas", "Angelo", "Amir", "Anas", "Augustin", "Barnabe", "Arthur", "Blaise", "Alexis", "Allan", "Alpha", "Alan", "Alec", "Celestin", "Brahim", "Brieuc", "Celian", "Boris", "Bryan", "Guillaume", "Gregoire", "Isaac", "Aaron", "Hamed", "Henry", "James", "Hugo", "Augustin", "Bastien", "Benoît", "Ayman", "Bilel", "Artus", "Alexander", "Ambroise", "Alexis", "Merlin", "Morgan", "Milan", "Mattheo", "Marius", "Marwan", "Marko", "Mahe", "Vladimir", "Titouan", "Tristan", "Virgile", "Viktor", "Warren", "Tommy", "Tim", "Ugo", "Paul-Antoine", "Patrick", "Raphael", "Rafaël", "Rafael", "Rayan", "Rami", "Ramy", "Moustapha", "Nathan", "Niels", "Milan", "Mory", "Sebastian", "Seydou", "Roman", "Remi", "Sami", "Samy", "Reda", "Rudy", "Timothee", "Vianney", "Virgile", "Wassim", "Vadim", "Tom", "Stanislas", "Simeon", "Stefan", "Solal", "Yanis", "Alban", "Adame", "Ali", "Joaquim", "Killian", "Justin", "Kevin", "Jimmy", "John", "Jude", "Karl", "Ilyas", "Jawad", "Ilan", "Leopold", "Joachim", "Lassana", "Lamine", "Liam", "Matthieu", "Matteo", "Merlin", "Matis", "Matt", "Valentin", "Yacouba", "Youcef", "Younes", "Yoann", "Tony", "Mahamadou", "Lucien", "Maël", "Lukas", "Lyes", "Lilian", "Loïc", "Louis", "Louka", "Moustapha", "Mickaël", "Mouhamed", "Nassim", "Marc-antoine", "Massinissa", "Marouane", "Mathias", "Martin", "Matheo", "Marwan", "Nathan", "Alexandre", "Abdoulaye", "Aboubakar", "Abdel", "Alex", "Christopher", "Christophe", "Baptiste", "Cedric", "Cesar", "Corentin", "Constant", "Damien", "Daouda", "Clovis", "Dan", "Aloïs", "Amine", "Ange", "Dorian", "Dylan", "Eddy", "Elie", "Aurelien", "Antonin", "Aymane", "Ayoub", "Anis", "Giovanni", "Hadrien", "Georges", "Hector", "Gaston", "Helios", "Henri", "Hedi", "Gabriel", "Francis", "Gaëtan", "Eythan", "Felix", "Gabin", "Fabio", "Ismaël", "Ismaïl", "Jason", "Hippolyte", "Hubert", "Ilian", "Elliot", "Emile", "Enzo", "Eric", "Jean-baptiste", "Jonathan", "Julien", "Joan", "Marcel", "Lucas", "Loan", "Luc", "Marwane", "Matthis", "Matteo", "Matias", "Mateo", "Marin", "Sebastien", "Santiago", "Sylvain", "Steven", "Shaï", "Swann", "Moussa", "Naël", "Noah", "Rodrigue", "Ricardo", "Samuel", "Ruben", "Ronan", "Salim", "Ryan", "Phileas", "Pascal", "Pablo", "Paolo", "Paul", "Omar", "Remy", "Maxence", "Melvyn", "Mehdi", "Milan", "Max", "Zakaria", "Wandrille", "Tristan", "Titouan", "Terence", "Jonathan", "Joris", "Justin", "Khalil", "Kilian", "Kilyan", "Lazare", "Loup", "Lucas", "Lukas", "Maceo", "Mahdi", "Malo", "Mamadou", "Marvin", "Adame", "Adem", "Albert", "Alessandro", "Allan", "Alone", "Aly", "Amin", "Amine", "Anatole", "Anthony", "Anton", "Antonin", "Ayman", "Benjamin", "Boubacar", "Brieuc", "Bruno", "Calixte", "Chahine", "Charles", "Christian", "Christophe", "Christopher", "Clarence", "Colin", "Constantin", "Corentin", "Curtis", "Damien", "Diego", "Elie", "Eliot", "Elyas", "Emir", "Eric", "Evann", "Gabin", "Gabriel", "Georges", "Gustave", "Haron", "Ibrahim", "Ilyan", "Jeremy", "Jerôme", "Jibril", "Joey", "Joseph", "Josue", "Julien", "Karamba", "Karl", "Kenzi", "Kilian", "Kyllian", "Lassana", "Liam", "Mael", "Maksim", "Malo", "Marko", "Marouane", "Marvin", "Marwan", "Marwane", "Matteo", "Matteo", "Maxim", "Michael", "Mohamed-amine", "Nael", "Nahel", "Naïm", "Nikola", "Nil", "Nils", "Nino", "Noah", "Oscar", "Oumar", "Ousmane", "Paolo", "Philemon", "Quentin", "Hugues", "Henri", "Ilian", "Ilyes", "Ilias", "Ilyas", "Kilian", "Kevin", "Kaïs", "Malik", "Matisse", "Mathys", "Matias", "Mayeul", "Mehdi", "Mohamed", "Merwan", "Moïse", "Naël", "Sebastian", "Simeon", "Samba", "Raphaël", "Rafaël", "Patrick", "Paul", "Reda", "Remy", "Nathanaël", "Ousmane", "Nelson", "Noah", "Nils", "Owen", "Thibault", "Thierry", "Tidiane", "Thomas", "Vincent", "Yassine", "Victor", "Wassim", "Yanis", "Yoann", "Tony", "Zachary", "Younès", "Yohann", "Youcef", "Yvan", "Jean-baptiste", "Jeremie", "Isidore", "Jeremy", "Jordan", "Jacob", "Issam", "John", "Barthelemy", "Benjamin", "Benoît", "Cedric", "Bryan", "Ben", "Killian", "Joseph", "Joshua", "Kilian", "Kilyan", "Kevin", "Guillaume", "Hector", "Ilyes", "Henry", "Ilias", "Damien", "Dylan", "Cyril", "Demba", "Dany", "Elio", "Leon", "Lior", "Marwan", "Mateo", "Christophe", "Clarence", "Cyprien", "Clovis", "Cesar", "Colin", "Aristide", "Anatole", "Antonin", "Armand", "Armel", "Andy", "Ambroise", "Alexis", "Amadou" ];

		var firstnamesF = [ "Lauren", "Laura", "Kiara", "Kim", "Philippine", "Quitterie", "Penelope", "Odelia", "Olga", "Charlotte", "Cassandra", "Cassandre", "Capucine", "Celeste", "Camelia", "Chaïma", "Charlie", "Carmen", "Ashley", "Athena", "Anna", "Asma", "Esther", "Enora", "Elya", "Emy", "Constance", "Christina", "Cleophee", "Delphine", "Chelsea", "Chirine", "Colombe", "Cindy", "Aïssatou", "Agathe", "Aïcha", "Alix", "Alma", "Anastasia", "Angelique", "Angèle", "Aminata", "Amelia", "Amel", "Ana", "Awa", "Eglantine", "Eleonore", "Dounia", "Eliane", "Diana", "Elena", "Eden", "Elea", "Florence", "Fatima", "Ethel", "Heloïse", "Helène", "Giulia", "Madeleine", "Mariame", "Maryam", "Lydia", "Lylia", "Kadidiatou", "Kadiatou", "Irène", "Julia", "Irina", "Laetitia", "Liliane", "Lauren", "Kenza", "Lilia", "Lia", "Nathalie", "Natacha", "Naïla", "Naomi", "Nina", "Nell", "Morgane", "Myriam", "Melina", "Meline", "Milla", "Mina", "Nada", "Ludivine", "Louise", "Lilou", "Louna", "Linda", "Lucia", "Lisa", "Luce", "Imène", "Inès", "Christelle", "Capucine", "Blanche", "Cecilia", "Charlie", "Celine", "Chayma", "Celia", "Helena", "Hanae", "Ilana", "Houda", "Hana", "Iman", "Constance", "Christine", "Clotilde", "Cynthia", "Claire", "Clea", "Cloe", "Annabelle", "Amandine", "Angel", "Amel", "Asma", "Audrey", "Bianca", "Avril", "Assa", "Abigaël", "Aïssata", "Adèle", "Aline", "Alya", "Eleonore", "Doriane", "Dounia", "Elena", "Dina", "Dora", "Elea", "Elia", "Joëlle", "Imène", "Imane", "Imene", "Khadija", "Leonie", "Karine", "Kenza", "Katia", "Lena", "Lila", "Lili", "Fanny", "Elise", "Elina", "Ella", "Elya", "Erin", "Eve", "Gabriela", "Felicie", "Gaëlle", "Gaïa", "Fatou", "Louis-marie", "Lou-ann", "Louison", "Lorena", "Louna", "Blanche", "Camelia", "Chaïma", "Calista", "Bintou", "Brune", "Domitille", "Elisabeth", "Delphine", "Deborah", "Emilia", "Elisa", "Elena", "Elia", "Elea", "Angelina", "Alicia", "Andrea", "Anissa", "Alya", "Amel", "Athenaïs", "Aurelie", "Astrid", "Ashley", "Assia", "Halima", "Haby", "Alienor", "Adeline", "Alicia", "Alice", "Amina", "Alya", "Anissa", "Angela", "Andrea", "Anouk", "Ania", "Amy", "Aurelie", "Astrid", "Assa", "Ava", "Elisabeth", "Doriane", "Elodie", "Eline", "Elia", "Charlène", "Berenice", "Caroline", "Camille", "Bianca", "Celia", "Betty", "Brune", "Domitille", "Djeneba", "Daphne", "Eloïse", "Elvire", "Emilie", "Ella", "Clotilde", "Charline", "Colette", "Coralie", "Chiara", "Cleo", "Estelle", "Eugenie", "Fanta", "Gabrielle", "Faustine", "Gloria", "Fleur", "Yasmine", "Toscane", "Viviane", "Isaure", "Joana", "Jade", "Lou-anne", "Maëlle", "Lucile", "Louane", "Mahaut", "Maeva", "Mathilde", "Margaux", "Mariama", "Maïssa", "Marina", "Manon", "Manal", "Philomène", "Salimata", "Samantha", "Sabrine", "Roxane", "Sadio", "Romy", "Solène", "Suzanne", "Sophie", "Tess", "Juliette", "Johanna", "Judith", "Karine", "Maylis", "Nawel", "Maya", "Mila", "Kelly", "Khady", "Liora", "Lily", "Lea", "Ilana", "Patricia", "Pauline", "Ornella", "Nicole", "Nayla", "Nour", "Adèle", "Katia", "Mathilde", "Meline", "Mila", "Mina", "Moïra", "Nayla", "Nell", "Nelly", "Nelya", "Nermine", "Nesrine", "Nina", "Ninon", "Noor", "Noura", "Pauline", "Philippine", "Philomène", "Rachel", "Rawane", "Rose", "Roxane", "Rym", "Sana", "Sarah", "Selène", "Sidonie", "Sienna", "Sofia", "Solange", "Sophia", "Sophie", "Tal", "Tali", "Tania", "Tasnime", "Thaïs", "Thalia", "Thelma", "Therèse", "Valentine", "Viviane", "Yamina", "Youmna", "Yse", "Zineb", "Adja", "Agnès", "Aïssatou", "Alma", "Alyssa", "Ambrine", "Amel", "Amelie", "Anaïs", "Angelique", "Anna", "Anya", "Bianca", "Bintou", "Blanche", "Camelia", "Camilia", "Candice", "Celestine", "Charlotte", "Cindy", "Claire", "Clara", "Clarisse", "Clotilde", "Coumba", "Dahlia", "Daniela", "Diane", "Domitille", "Elea", "Elisa", "Elise", "Elizabeth", "Ema", "Emilie", "Emy", "Eva", "Eve", "Fanta", "Fantine", "Fatim", "Felicie", "Hanae", "Hannah", "Heloïse", "Imène", "Iris", "Isaure", "Isee", "Jane", "Janna", "Julie", "Rosalie", "Romane", "Roxane", "Romy", "Cassandre", "Benedicte", "Catherine", "Caroline", "Candice", "Angelique", "Angèle", "Aurelie", "Barbara", "Axelle", "Anissa", "Assia", "Philomène", "Perrine", "Rebecca", "Prune", "Rivka", "Rim", "Solène", "Roxane", "Sirine", "Sienna", "Sarah", "Salma", "Safa", "Ombeline", "Ophelie", "Orlane", "Oumou", "Nour", "Alizee", "Alice", "Amina", "Ana", "Lucie", "Charlène", "Chaïma", "Clelia", "Clara", "Cleo", "Clothilde", "Daniela", "Deborah", "Divine", "Diane", "Danae", "Floriane", "Helène", "Grâce", "Flore", "Emilia", "Emilie", "Emily", "Emmy", "Ema", "Emy", "Maëlle", "Maëlys", "Maïssa", "Malek", "Morgane", "Natasha", "Ninon", "Nine", "Lilia", "Lilly", "Linda", "Lison", "Line", "Liza", "Liv", "Stephanie", "Thaïs", "Tania", "Tessa", "Leopoldine", "Laurène", "Laetitia", "Lana", "Lena", "Lia", "Marthe", "Maryam", "Adelaïde", "Adriana", "Albane", "Aimee", "Jennifer", "Irène", "Imen", "Jana", "Kadidiatou", "Justine", "Joyce", "Fatoumata", "Faustine", "Imane", "Iman", "Imen", "Odelia", "Raphaëlle", "Penelope", "Perrine", "Prune", "Sherine", "Sibylle", "Sidonie", "Salome", "Shirel", "Satine", "Josephine", "Judith", "Joana", "Lili-rose", "Lindsay", "Linda", "Lilas", "Lilia", "Lili", "Madeleine", "Louisa", "Loane", "Lucia", "Lylia", "Luna", "Line", "Romane", "Salome", "Rahma", "Romy", "Mathilda", "Melodie", "Meline", "Naomie", "Naïs", "Mila", "Mina", "Noa", "Mia", "Margot", "Mahaut", "Manon", "Malia", "Mae", "Sixtine", "Sephora", "Shaïma", "Serena", "Sofia", "Shana", "Tatiana", "Sophia", "Stella", "Solenn", "Syrine", "Tess", "Toscane", "Wendy", "Adriana", "Fatoumata", "Eulalie", "Esther", "Flore", "Emmanuelle", "Eloïse", "Elise", "Enora", "Emma", "Dora", "Ema", "Charlie", "Deborah", "Claire", "Celina", "Cloe", "Anastasia", "Anaëlle", "Alysson", "Amira", "Angel", "Anne", "Ariane", "Anouck", "Anouk", "Assa", "Ava", "Awa", "Aïssatou", "Alyssia", "Aïcha", "Aliya", "Alix", "Celestine", "Cecilia", "Carla", "Celia", "Charlotte", "Clothilde", "Clemence", "Clotilde", "Colombe", "Daphnee", "Coumba", "Dalia", "Cleo", "Gabrielle", "Faustine", "Estelle", "Fanny", "Fleur", "Heloïse", "Hanna", "Sidonie", "Sixtine", "Stella", "Tasnim", "Thaïs", "Sonia", "Ombeline", "Ondine", "Neïla", "Nelly", "Nina", "Nour", "Perrine", "Salma", "Paola", "Ranya", "Prune", "Maëlie", "Lucile", "Maelys", "Mahaut", "Luce", "Mae", "Sibylle", "Shirel", "Serine", "Sandra", "Sarah", "Sarra", "Shany", "Wendy", "Yaël", "Yona", "Ysee", "Maylis", "Melody", "Meriem", "Mila", "Maud", "Mariame", "Marjane", "Marina", "Maïa", "Malak", "Tina", "Paola", "Pia", "Nesrine", "Niouma", "Orlane", "Ninon", "Nora", "Sandra", "Rose", "Wendy", "Stephanie", "Sohane", "Soline", "Soraya", "Shana", "Sonia", "Alexandra", "Aïssata", "Agathe", "Jenna", "Kelly", "Isabelle", "Ilana", "Imene", "Irina", "Jade", "Ines", "Ines", "Leonie", "Lalie", "Lena", "Mathilde", "Melody", "Maya", "Vanessa", "Yousra", "Yona", "Maïmouna", "Lucille", "Aline", "Alixe", "Berenice", "Charline", "Bertille", "Camille", "Bianca", "Clementine", "Coraline", "Daphne", "Coline", "Angelique", "Angèle", "Alyssa", "Amicie", "Ambre", "Alma", "Ana", "Eglantine", "Djeneba", "Dounia", "Elise", "Diana", "Elena", "Antonia", "Armance", "Axelle", "Anna", "Asma", "Grace", "Hajar", "Floriane", "Flavia", "Fatim", "Isaure", "Iseult", "Irène", "Inès", "Houda", "Iman", "Imen", "Eurydice", "Elodie", "Erika", "Ella", "Eva", "Eve", "Johanna", "Julia", "Ludivine", "Lou-anne", "Margaux", "Maïssa", "Lucie", "Lynn", "Marguerite", "Mariama", "Maria", "Maud", "Shirel", "Satine", "Shanna", "Sonia", "Natacha", "Olivia", "Noelie", "Nawel", "Naomi", "Noor", "Samantha", "Rose", "Sana", "Raphaëlle", "Rebecca", "Pia", "Mélanie", "Mélissa", "Mélissa", "Maylis", "Melina", "Zelie", "Zoe", "Victoire", "Tamara", "Talia", "Tina", "Yaël", "Yse", "Laëtitia", "Juliette", "Lauryn", "Karen", "Keren", "Klara", "Laure", "Kady", "Levana", "Leana", "Lilya", "Lison", "Kadiatou", "Kahina", "Katia", "Kelly", "Khadidja", "Kim", "Klara", "Laëtitia", "Lahna", "Lara", "Laure", "Lea", "Leana", "Lena", "Lena", "Leonor", "Liana", "Lilou", "Liora", "Lisa", "Lise", "Lison", "Lola", "Lou-anne", "Lya", "Lyna", "Madeleine", "Mae", "Maelys", "Maeva", "Maëva", "Magdalena", "Marguerite", "Mariama", "Mariame", "Marie", "Marion", "Marjane", "Marwa", "Agathe", "Agnès", "Aïcha", "Aminata", "Anaelle", "Anaïs", "Anouk", "Apolline", "Assa", "Astrid", "Audrey", "Aurore", "Baya", "Berenice", "Blandine", "Camelia", "Capucine", "Carla", "Caroline", "Cassandra", "Cecile", "Celia", "Chaïma", "Christine", "Claire", "Clemence", "Cyrine", "Dana", "Daphnee", "Diane", "Dina", "Divine", "Elea", "Elena", "Emmie", "Estelle", "Fanta", "Fatim", "Fatimata", "Fatoumata", "Fiona", "Giulia", "Goundo", "Haby", "Halima", "Hana", "Hannah", "Helena", "Heloïse", "Jihane", "Julia", "Juliette", "Justine", "Kadiatou", "Kahina", "Kiara", "Lahna", "Laure", "Lea", "Lena", "Leonie", "Fantine", "Estelle", "Fatima", "Esther", "Heloïse", "Hermine", "Iliana", "Karolina", "Kamila", "Katell", "Ketsia", "Kaïna", "Kelly", "Keren", "Manelle", "Marine", "Manon", "Mélissa", "Melodie", "Maya", "Myriam", "Naomie", "Naomi", "Naïs", "Mona", "Mia", "Salome", "Sasha", "Sofia", "Shana", "Sana", "Philippine", "Patricia", "Prisca", "Rita", "Ornella", "Olivia", "Olympe", "Oumou", "Suzanne", "Solène", "Thelma", "Tara", "Victoire", "Tiffany", "Agathe", "Janelle", "Jade", "Berenice", "Carla", "Brune", "Celia", "Josephine", "Laurène", "Kahina", "Keren", "Isabelle", "Halima", "Ilana", "Hana", "Ines", "Domitille", "Eleonore", "Diane", "Elina", "Leïna", "Linoï", "Leana", "Lilas", "Linda", "Lison", "Lila", "Lise", "Mariam", "Marina", "Chahinez", "Claudia", "Cerise", "Cindy", "Apolline", "Anaïs", "Anita", "Ana", "Amelie", "Ambre", "Aline", "Aliya", "Amira", "Eulalie", "Esther", "Elodie", "Ethel", "Elsa", "Ella", "Eva", "Ashley", "Assia", "Manelle", "Manuela", "Maria" ];

        var firstnames = firstnamesM.concat(firstnamesF);

        var lastnames = [ "Tremblay", "Desmarais", "Larrivée", "Chan", "Gagnon", "Laberge", "Major", "Métivier", "Roy", "Nault", "Boissonneault", "Fradette", "Côté", "Bourgeois", "Patenaude", "Ranger", "Bouchard", "Lafrance", "Alarie", "Després", "Gauthier", "Lagacé", "Carpentier", "Lesage", "Morin", "Daoust", "Grenon", "Poliquin", "Lavoie", "Brault", "Bossé", "Généreux", "Fortin", "Castonguay", "Bessette", "Papineau", "Gagné", "Vallières", "Lajeunesse", "Frappier", "Ouellet", "Pellerin", "Barbeau", "Latreille", "Pelletier", "Rivest", "Miller", "Meloche", "Bélanger", "Brochu", "Masson", "Gouin", "Lévesque", "Samson", "Cournoyer", "Crête", "Bergeron", "Lépine", "Ratté", "Pedneault", "Leblanc", "Leroux", "Chrétien", "Berger", "Paquette", "Larochelle", "Bourgault", "Briand", "Girard", "Brousseau", "Leboeuf", "Olivier", "Simard", "Sauvé", "Nolet", "Truchon", "Boucher", "Laurin", "Sylvestre", "Sénéchal", "Caron", "Clément", "Rainville", "Lavergne", "Beaulieu", "Bissonnette", "Sénécal", "Rochefort", "Cloutier", "Lajoie", "Chaput", "Lelièvre", "Dubé", "Aubin", "Méthot", "Gaumond", "Poirier", "Doyon", "Desaulniers", "Roussy", "Fournier", "Labrie", "Lemelin", "René", "Lapointe", "Grondin", "Reid", "Pham", "Leclerc", "Faucher", "Lee", "Dasilva", "Lefebvre", "Corriveau", "Jacob", "McKenzie", "Poulin", "Tétreault", "Michel", "Marion", "Thibault", "Bourque", "Désilets", "Sergerie", "St-Pierre", "Dagenais", "Falardeau", "Dostie", "Nadeau", "Ducharme", "Bureau", "Madore", "Martin", "Carrière", "Gignac", "Mongeau", "Landry", "Duquette", "Lortie", "Crevier", "Martel", "Lafleur", "Mélançon", "Faubert", "Bédard", "Langevin", "Primeau", "Paiement", "Grenier", "Corbeil", "Bourget", "Bousquet", "Lessard", "Bourassa", "Robinson", "Favreau", "Bernier", "Pagé", "Chénier", "Gill", "Richard", "Trudeau", "Malenfant", "Juneau", "Michaud", "Gaudet", "St-Amour", "Paris", "Hébert", "Cantin", "Langlais", "Beausoleil", "Desjardins", "Goyette", "Williams", "Boilard", "Couture", "Boyer", "Lécuyer", "Adams", "Turcotte", "Francoeur", "Carbonneau", "Bellefleur", "Lachance", "St-Louis", "Charles", "Poissant", "Parent", "Barrette", "Campbell", "Gonzalez", "Blais", "Vigneault", "Pinard", "Laframboise", "Gosselin", "Ouimet", "Goudreau", "Ringuette", "Savard", "Baril", "Riendeau", "Garon", "Proulx", "Lafrenière", "St-Gelais", "Marier", "Beaudoin", "Meunier", "Robidoux", "Desnoyers", "Demers", "Laporte", "Wilson", "Li", "Perreault", "Joseph", "Hardy", "Perras", "Boudreau", "Brodeur", "Lampron", "Déziel", "Lemieux", "Legaré", "Jetté", "Gascon", "Cyr", "Lafond", "Clermont", "Crépeau", "Perron", "Ross", "Groleau", "Galipeau", "Dufour", "Maheux", "Bois", "Garcia", "Dion", "Rondeau", "Guertin", "Kaur", "Mercier", "Marquis", "Lecompte", "Coderre", "Bolduc", "Bastien", "Héroux", "Huynh", "Bérubé", "Plouffe", "Sylvain", "Milot", "Boisvert", "Bouffard", "Hallé", "Tassé", "Langlois", "Lacombe", "Desormeaux", "Hernandez", "Ménard", "Talbot", "Fraser", "Marin", "Therrien", "Julien", "Néron", "Hénault", "Plante", "Rouleau", "St-Denis", "Lehoux", "Bilodeau", "Roussel", "Adam", "Robertson", "Blanchette", "Guérin", "Voyer", "Taillon", "Dubois", "Boulianne", "Albert", "Bisaillon", "Champagne", "Beaupré", "Venne", "Laperrière", "Paradis", "Éthier", "Rochette", "Vinet", "Fortier", "Dussault", "Rodriguez", "Cartier", "Arsenault", "Lamarche", "Mayer", "Pothier", "Dupuis", "Gallant", "Racicot", "St-Georges", "Gaudreault", "Gauvin", "Miron", "Munger", "Hamel", "Lamothe", "White", "Angers", "Houle", "Joly", "Brosseau", "Audy", "Villeneuve", "Robichaud", "Lecours", "Dulude", "Rousseau", "Léveillé", "Nadon", "Ledoux", "Gravel", "Bellemare", "Pelchat", "Pruneau", "Thériault", "Huard", "St-Jacques", "Bond", "Lemay", "Garneau", "St-Arnaud", "Beauséjour", "Robert", "Levasseur", "Théorêt", "Biron", "Allard", "Dubuc", "Chassé", "Banville", "Deschênes", "Millette", "Pageau", "Pinette", "Giroux", "Poitras", "Delorme", "Martinez", "Guay", "Rochon", "Jolicoeur", "Perez", "Leduc", "Brière", "Sauvageau", "Dumouchel", "Boivin", "Guimond", "Bonin", "Labranche", "Charbonneau", "Hudon", "Galarneau", "Trahan", "Lambert", "Auclair", "Laprise", "Laviolette", "Raymond", "Beauchemin", "Mongrain", "Bénard", "Vachon", "Brisebois", "Thompson", "Hains", "Gilbert", "Godbout", "Valiquette", "Gaulin", "Audet", "Guilbault", "Carignan", "Lacoursière", "Jean", "Cadieux", "Cusson", "Guérard", "Larouche", "Brown", "Le", "Pratte", "Legault", "Durocher", "Dumoulin", "Duhamel", "Trudel", "Lamarre", "Babin", "Dufort", "Fontaine", "Ricard", "Chevrier", "Nolin", "Picard", "Monette", "Latulippe", "Lupien", "Labelle", "Cardinal", "Riopel", "Rouillard", "Lacroix", "Tran", "Turmel", "Dupéré", "Jacques", "St-Hilaire", "Claveau", "Choinière", "Moreau", "Jobin", "Lahaie", "Turbide", "Carrier", "Daigneault", "Pitre", "Vanier", "Bernard", "Chamberland", "Bourdeau", "Aubut", "Desrosiers", "Deschamps", "Lemaire", "Dupras", "Goulet", "Beaudin", "Migneault", "Belleau", "Renaud", "Henry", "Fecteau", "Davis", "Dionne", "Boulet", "Payette", "Lacelle", "Lapierre", "Collin", "Poisson", "Blondin", "Vaillancourt", "Sabourin", "Gratton", "Harnois", "Fillion", "Deslauriers", "Thiffault", "Laferrière", "Lalonde", "Dumais", "Scott", "Surprenant", "Tessier", "Gamache", "Cayer", "Bougie", "Bertrand", "Messier", "Garceau", "Collard", "Tardif", "Beaudet", "Boisclair", "Hamilton", "Lepage", "Pilote", "Belzile", "Fauteux", "Gingras", "Berthiaume", "Blain", "Gendreau", "Benoît", "Cossette", "Ste-Marie", "Cabana", "Rioux", "Hamelin", "Bernatchez", "Gougeon", "Giguère", "Rhéaume", "Laramée", "Maisonneuve", "Drouin", "Campeau", "Mainville", "Bouthillier", "Harvey", "Mallette", "Deneault", "Quenneville", "Lauzon", "Fleury", "Beauvais", "Bourbonnais", "Nguyen", "Patry", "Bigras", "Maillé", "Gendron", "St-Amand", "Cliche", "Morand", "Boutin", "Gariépy", "Parenteau", "Béchard", "Laflamme", "David", "Prince", "Bellerose", "Vallée", "Viens", "Clarke", "Nicolas", "Dumont", "Veillette", "Lacoste", "Taillefer", "Breton", "Blanchard", "Dessureault", "Caissy", "Paré", "Binette", "Roch", "Lanctôt", "Paquin", "Lebrun", "Bourgoin", "Cadorette", "Robitaille", "St-Germain", "Singh", "Lirette", "Gélinas", "Ladouceur", "Boileau", "Diotte", "Duchesne", "Fiset", "Péloquin", "Fernandez", "Lussier", "Moisan", "Lespérance", "Roger", "Séguin", "Loiselle", "Descôteaux", "Lachaîne", "Veilleux", "Comeau", "Arbour", "Théroux", "Potvin", "Mailhot", "Roux", "Lauzier", "Gervais", "Doré", "Joyal", "Beaumier", "Pépin", "Déry", "Chicoine", "Duhaime", "Laroche", "Mailloux", "Dubeau", "Giasson", "Morissette", "Forest", "Kelly", "Lewis", "Charron", "Huot", "Beauchesne", "Limoges", "Lavallée", "Morneau", "Joncas", "Cameron", "Laplante", "Allaire", "Lopez", "Canuel", "Chabot", "Viau", "Lafortune", "McLean", "Brunet", "Ayotte", "Chénard", "Dastous", "Vézina", "Massicotte", "Routhier", "Daviault", "Desrochers", "Genest", "Bellavance", "Dunn", "Labrecque", "Thivierge", "Moore", "Chen", "Coulombe", "Simoneau", "Brien", "Diamond", "Tanguay", "Robillard", "Hubert", "Stewart", "Chouinard", "Jalbert", "Maurice", "Jourdain", "Noël", "Chagnon", "Guindon", "Poudrier", "Pouliot", "Pomerleau", "Touchette", "Doyle", "Lacasse", "Leblond", "Dubreuil", "Normandeau", "Daigle", "Frenette", "Santerre", "Lacerte", "Marcoux", "Aubé", "Pronovost", "Nicol", "Lamontagne", "Desgagné", "Courtemanche", "Décarie", "Turgeon", "Jutras", "Deshaies", "Louis", "Larocque", "Ruel", "Chalifoux", "Roberts", "Roberge", "Thomas", "Sigouin", "Pearson", "Auger", "Murray", "Brouillard", "Walker", "Massé", "Bruneau", "Goyer", "Dansereau", "Pilon", "Béliveau", "Harrisson", "Pereira", "Racine", "Coutu", "Longpré", "Lévy", "Dallaire", "Lefrançois", "Rémillard", "Montreuil", "Émond", "Lheureux", "Filiatrault", "Dalpé", "Grégoire", "Desroches", "Verville", "Lacharité", "Beauregard", "Chartier", "Bérard", "Letendre", "Smith", "Courchesne", "Vermette", "Vandal", "Denis", "Verreault", "Rocheleau", "Daneau", "Lebel", "Brunelle", "Cohen", "Mireault", "Blouin", "Boulay", "Bourdon", "Ahmed", "Martineau", "Quirion", "Duchesneau", "Desfossés", "Labbé", "Marcil", "Anctil", "Belhumeur", "Beauchamp", "Alain", "Aubry", "Gemme", "St-Onge", "Drapeau", "Wong", "Jomphe", "Charette", "Marceau", "Goupil", "Langelier", "Dupont", "Lizotte", "Lamy", "Magnan", "Létourneau", "Pierre", "Verret", "Saucier", "Rodrigue", "Bussières", "Fafard", "Brissette", "Cormier", "Damours", "Montpetit", "Collins", "Rivard", "Normand", "Deblois", "Ly", "Mathieu", "Prudhomme", "Boutet", "Ruest", "Asselin", "Lord", "Quesnel", "Hélie", "St-Jean", "Baillargeon", "Gareau", "Lapalme", "Plourde", "Latour", "Corbin", "Gordon", "Thibodeau", "Sévigny", "Haché", "Bourbeau", "Bélisle", "Théberge", "Taylor", "Gonthier", "St-Laurent", "Plamondon", "Amyot", "Riverin", "Godin", "Matte", "Lalande", "Toussaint", "Desbiens", "Cousineau", "Bourdages", "April", "Lavigne", "Charland", "Bazinet", "Diaz", "Doucet", "Rancourt", "Jolin", "Manseau", "Labonté", "Bonneau", "Marleau", "Bachand", "Marchand", "Royer", "Flamand", "Hurtubise", "Brassard", "Petit", "Grimard", "King", "Forget", "Lalancette", "Perrier", "Alexandre", "Patel", "Lanthier", "Nantel", "Bleau", "Marcotte", "Léger", "Rhéault", "Mark", "Béland", "Léonard", "St-Martin", "Beaucage", "Larose", "St-Cyr", "Young", "Cauchon", "Duval", "Charlebois", "Couturier", "Neveu", "Archambault", "Paul", "Toupin", "Painchaud", "Maltais", "Bujold", "Beaumont", "Quintal", "Trépanier", "Choquette", "Hétu", "Rose", "Laliberté", "McDonald", "Gauvreau", "Dupré", "Bisson", "Bélair", "Deveault", "Morais", "Brisson", "Imbeault", "Fleurant", "Legros", "Dufresne", "Pigeon", "Desautels", "Pharand", "Beaudry", "Caouette", "Guy", "Boisjoli", "Chartrand", "Garand", "Racette", "François", "Houde", "Brouillette", "Tourigny", "Cardin", "Fréchette", "Gobeil", "Chayer", "Quévillon", "Lafontaine", "Pineault", "Danis", "Bergevin", "Guillemette", "Chiasson", "Duclos", "Levac", "Drolet", "Chevalier", "Foisy", "Kirouac", "Vincent", "Dugas", "Loyer", "Busque", "Richer", "Morel", "Valois", "Constantineau", "Germain", "Jones", "Couillard", "Delâge", "Larivière", "Tousignant", "Laverdière", "Valcourt", "Ferland", "Bibeau", "Meilleur", "Montminy", "Trottier", "Blackburn", "Dorval", "Doiron", "Piché", "Girouard", "Khan", "Sauriol", "Boulanger", "Malo", "Murphy", "Savage", "Sirois", "Marois", "Forgues", "Soulières", "Charest", "Pichette", "Otis", "Deraspe", "Provost", "Comtois", "Dorion", "Grant", "Durand", "Morency", "Phaneuf", "Guérette", "Dumas", "Laforest", "Awashish", "Lam", "Soucy", "Sarrazin", "Charpentier", "Loranger", "Lamoureux", "Isabelle", "Champoux", "Hogue", "Lachapelle", "Normandin", "Desmeules", "Carle", "Bégin", "Guénette", "Mitchell", "Ferron", "Boily", "Johnson", "Arcand", "Lemoine", "Croteau", "Bordeleau", "Tellier", "Frigon", "Savoie", "Jodoin", "Anderson", "Juteau", "Provencher", "Groulx", "Allen", "Forcier", "Prévost", "Brazeau", "Baron", "Pinsonneault", "Duguay", "Simon", "Baribeau", "Hervieux", "Lemire", "Belley", "Chapdelaine", "Daraiche", "Delisle", "Lebeau", "Bacon", "McDuff" ];

		var streets = ["Rue Bidon", "Avenue Louise", "Avenue Jupiter", "Rue de l\'Aurore", "Rue de l\'Abbaye", "Rue d\'Argent", "Rue de Dinant", "Rue Ducale", "Rue Lens", "Rue Lebeau", "Rue de Livourne", "Rue de Laeken", "Rue de Paris", "Rue du Persil", "Rue Picard", "Rue du Vautour", "Rue de la Vallée", "Rue Van Helmont", "Rue de la Violette", "Rue Willems", "Rue du Chameau", "Avenue de l'Amour", "Avenue des Carottes", "Avenue des Combattants", "Avenue de la République", "Avenue de l\'Escaut", "Rue Parmentier", "Rue Victor Hugo", "Avenue Karl Marx", "Avenue du Diamant", "Avenue Rogier", "Avenue de la Topaze", "Rue au Bois", "Rue de la Ferme", "Rue des Moissons", "Rue Potagère", "Rue de l\'Est", "Avenue Voltaire", "Avenue Maréchal Foch", "Avenue Colonel Picard", "Rue de la Marne", "Rue du Dragon", "Rue des Chevaux", "Avenue de la Forêt de Soignes", "Avenue des Cochons", "Chaussée de Braine-l\'Alleud", "Drève des Pins", "Avenue de la Corniche", "Avenue des Etangs", "Avenue des Bouleaux", "Chemin Lazard", "Rue de Belgique", "Rue Bois Paris", "Rue de Genleau", "Rue du Culot", "Rue de la Gendarmerie", "Rue du Village", "Rue de la Poste", "Rue de la Station", "Rue de la Croix", "Rue de la Hutte", "Rue du Mont Cornet", "Rue de l\'Empire", "Rue du Poteau", "Chemin des Couyettes", "Chemin du Crucifix", "Chemin de la Bruyère", "Chemin de Nivelles", "Chemin de Halle", "Route de Lillois", "Chemin du Trou du Bois", "Chemin de l\'Ange Gardien", "Rue Joséphine", "Rue du Tricot", "Rue aux Cailloux", "Rue Longue Bouteille", "Avenue Trigodet", "Avenue de la Liberté", "Chemin du Gendarme", "Rue du Gendarme", "Chaussée de Soignies", "Rue Basse Hollande", "Rue Minon", "Grand Chemin", "Rue de la Libération", "Rue Notre-Dame au Bois", "Rue aux Racines", "Rue de la Vallée", "Rue du Bailly", "Rue du Boukendael", "Rue des Radoux", "Avenue Beau Séjour", "Rue Flachaux", "Chemin Vert", "Chemin du Steck", "Drève de Collipins"];

		//var cities = [ "Les Abymes", "Anse-Bertrand", "Baie-Mahault", "Baillif", "Basse-Terre", "Bouillante", "Capesterre-Belle-Eau", "Capesterre-de-Marie-Galante", "Gourbeyre", "La Désirade", "Deshaies", "Grand-Bourg", "Le Gosier", "Goyave", "Lamentin", "Morne-à-l'Eau", "Le Moule", "Petit-Bourg", "Petit-Canal", "Pointe-à-Pitre", "Pointe-Noire", "Port-Louis", "Saint-Claude", "Saint-François", "Saint-Louis", "Sainte-Anne", "Sainte-Rose", "Terre-de-Bas", "Terre-de-Haut", "Trois-Rivières", "Vieux-Fort", "Vieux-Habitants", "L'Ajoupa-Bouillon", "Les Anses-d'Arlet", "Basse-Pointe", "Le Carbet", "Case-Pilote", "Le Diamant", "Ducos", "Fonds-Saint-Denis", "Fort-de-France", "Le François", "Grand'Rivière", "Gros-Morne", "Le Lamentin", "Le Lorrain", "Macouba", "Le Marigot", "Le Marin", "Le Morne-Rouge", "Le Prêcheur", "Rivière-Pilote", "Rivière-Salée", "Le Robert", "Saint-Esprit", "Saint-Joseph", "Saint-Pierre", "Sainte-Anne", "Sainte-Luce", "Sainte-Marie", "Schœlcher", "La Trinité", "Les Trois-Îlets", "Le Vauclin", "Le Morne-Vert", "Bellefontaine", "Régina", "Cayenne", "Iracoubo", "Kourou", "Macouria", "Mana", "Matoury", "Saint-Georges", "Remire-Montjoly", "Roura", "Saint-Laurent-du-Maroni", "Sinnamary", "Montsinéry-Tonnegrande", "Ouanary", "Saül", "Maripasoula", "Camopi", "Grand-Santi", "Saint-Élie", "Apatou", "Awala-Yalimapo", "Papaichton", "Les Avirons", "Bras-Panon", "Entre-Deux", "L'Étang-Salé", "Petite-Île", "La Plaine-des-Palmistes", "Le Port", "La Possession", "Saint-André", "Saint-Benoît", "Saint-Denis", "Saint-Joseph", "Saint-Leu", "Saint-Louis", "Saint-Paul", "Saint-Pierre", "Saint-Philippe", "Sainte-Marie", "Sainte-Rose", "Sainte-Suzanne", "Salazie", "Le Tampon", "Les Trois-Bassins", "Cilaos", "Acoua", "Bandraboua", "Bandrele", "Bouéni", "Chiconi", "Chirongui", "Dembeni", "Dzaoudzi", "Kani-Kéli", "Koungou", "Mamoudzou", "Mtsamboro", "M'Tsangamouji", "Ouangani", "Pamandzi", "Sada", "Tsingoni", "Avon", "Bailly-Romainvilliers", "Boissettes", "Boissise-la-Bertrand", "Boissise-le-Roi", "Brie-Comte-Robert", "Brou-sur-Chantereine", "Bussy-Saint-Georges", "Bussy-Saint-Martin", "Carnetin", "Cesson", "Chalifert", "Champs-sur-Marne", "Chanteloup-en-Brie", "Chelles", "Chessy", "Claye-Souilly", "Collégien", "Combs-la-Ville", "Conches-sur-Gondoire", "Condé-Sainte-Libiaire", "Couilly-Pont-aux-Dames", "Coupvray", "Courtry", "Coutevroult", "Crécy-la-Chapelle", "Crégy-lès-Meaux", "Croissy-Beaubourg", "Dammarie-les-Lys", "Dammartin-en-Goële", "Dampmart", "Émerainville", "Esbly", "Ferrières-en-Brie", "Fontainebleau", "Gouvernes", "Gretz-Armainvilliers", "Guermantes", "Héricy", "Isles-lès-Villenoy", "Jossigny", "Lagny-sur-Marne", "Lésigny", "Lieusaint", "Livry-sur-Seine", "Lognes", "Longperrier", "Magny-le-Hongre", "Meaux", "Le Mée-sur-Seine", "Melun", "Mitry-Mory", "Moissy-Cramayel", "Montévrain", "Montry", "Nandy", "Nanteuil-lès-Meaux", "Noisiel", "Ozoir-la-Ferrière", "Poincy", "Pomponne", "Pontault-Combault", "Pringy", "Quincy-Voisins", "La Rochette", "Roissy-en-Brie", "Rubelles", "Saint-Fargeau-Ponthierry", "Saint-Germain-sur-Morin", "Saint-Thibault-des-Vignes", "Samoreau", "Savigny-le-Temple", "Seine-Port", "Serris", "Servon", "Thorigny-sur-Marne", "Torcy", "Tournan-en-Brie", "Trilport", "Vaires-sur-Marne", "Vaux-le-Pénil", "Vert-Saint-Denis", "Villenoy", "Villeparisis", "Villiers-sur-Morin", "Voulangis", "Vulaines-sur-Seine", "Achères", "Andrésy", "Aubergenville", "Auffreville-Brasseuil", "Aulnay-sur-Mauldre", "Bazoches-sur-Guyonne", "Bois-d'Arcy", "Bougival", "Buc", "Buchelay", "Carrières-sous-Poissy", "Carrières-sur-Seine", "La Celle-Saint-Cloud", "Chambourcy", "Chanteloup-les-Vignes", "Chapet", "Chevreuse", "Les Clayes-sous-Bois", "Coignières", "Conflans-Sainte-Honorine", "Élancourt", "Épône", "L'Étang-la-Ville", "Évecquemont", "La Falaise", "Flins-sur-Seine", "Follainville-Dennemont", "Fontenay-le-Fleury", "Fourqueux", "Gaillon-sur-Montcient", "Gargenville", "Guyancourt", "Hardricourt", "Houilles", "Issou", "Jouars-Pontchartrain", "Jouy-en-Josas", "Juziers", "Limay", "Les Loges-en-Josas", "Louveciennes", "Magnanville", "Magny-les-Hameaux", "Mantes-la-Jolie", "Mantes-la-Ville", "Mareil-Marly", "Maurecourt", "Maurepas", "Médan", "Le Mesnil-le-Roi", "Le Mesnil-Saint-Denis", "Meulan-en-Yvelines", "Mézières-sur-Seine", "Mézy-sur-Seine", "Montesson", "Montigny-le-Bretonneux", "Les Mureaux", "Neauphle-le-Château", "Neauphle-le-Vieux", "Nézel", "Orgeval", "Plaisir", "Poissy", "Porcheville", "Le Port-Marly", "Rambouillet", "Saint-Cyr-l'École", "Saint-Rémy-lès-Chevreuse", "Saint-Rémy-l'Honoré", "Sartrouville", "Tessancourt-sur-Aubette", "Trappes", "Le Tremblay-sur-Mauldre", "Triel-sur-Seine", "Vaux-sur-Seine", "Verneuil-sur-Seine", "Vernouillet", "La Verrière", "Vert", "Villennes-sur-Seine", "Villepreux", "Villiers-Saint-Frédéric", "Voisins-le-Bretonneux", "Arpajon", "Athis-Mons", "Ballainvilliers", "Bièvres", "Bondoufle", "Boussy-Saint-Antoine", "Brétigny-sur-Orge", "Breuillet", "Breux-Jouy", "Brunoy", "Bruyères-le-Châtel", "Bures-sur-Yvette", "Champlan", "Chilly-Mazarin", "Corbeil-Essonnes", "Le Coudray-Montceaux", "Courcouronnes", "Crosne", "Draveil", "Écharcon", "Égly", "Épinay-sous-Sénart", "Épinay-sur-Orge", "Étiolles", "Évry", "Fleury-Mérogis", "Fontenay-le-Vicomte", "Forges-les-Bains", "Gif-sur-Yvette", "Gometz-le-Châtel", "Grigny", "Igny", "Juvisy-sur-Orge", "Leuville-sur-Orge", "Limours", "Linas", "Lisses", "Longjumeau", "Longpont-sur-Orge", "Marcoussis", "Massy", "Mennecy", "Montgeron", "Montlhéry", "Morangis", "Morsang-sur-Orge", "Morsang-sur-Seine", "La Norville", "Nozay", "Ollainville", "Ormoy", "Orsay", "Palaiseau", "Paray-Vieille-Poste", "Le Plessis-Pâté", "Quincy-sous-Sénart", "Ris-Orangis", "Saclay", "Saint-Aubin", "Sainte-Geneviève-des-Bois", "Saint-Germain-lès-Arpajon", "Saint-Germain-lès-Corbeil", "Saint-Michel-sur-Orge", "Saint-Pierre-du-Perray", "Saintry-sur-Seine", "Saint-Yon", "Saulx-les-Chartreux", "Savigny-sur-Orge", "Soisy-sur-Seine", "Tigery", "Varennes-Jarcy", "Vauhallan", "Verrières-le-Buisson", "Vigneux-sur-Seine", "Villabé", "Villebon-sur-Yvette", "La Ville-du-Bois", "Villejust", "Villemoisson-sur-Orge", "Villiers-le-Bâcle", "Villiers-sur-Orge", "Viry-Châtillon", "Wissous", "Yerres", "Les Ulis", "Gennevilliers", "Villeneuve-la-Garenne", "Aulnay-sous-Bois", "Le Blanc-Mesnil", "Bobigny", "Bondy", "Le Bourget", "Clichy-sous-Bois", "Coubron", "La Courneuve", "Drancy", "Dugny", "Épinay-sur-Seine", "Gagny", "Gournay-sur-Marne", "L'Île-Saint-Denis", "Livry-Gargan", "Montfermeil", "Neuilly-sur-Marne", "Noisy-le-Grand", "Noisy-le-Sec", "Les Pavillons-sous-Bois", "Pierrefitte-sur-Seine", "Romainville", "Rosny-sous-Bois", "Sevran", "Stains", "Tremblay-en-France", "Vaujours", "Villepinte", "Villetaneuse", "Ablon-sur-Seine", "Alfortville", "Boissy-Saint-Léger", "Bonneuil-sur-Marne", "Champigny-sur-Marne", "Chennevières-sur-Marne", "Chevilly-LaRue", "Choisy-le-Roi", "Créteil", "Fresnes", "Limeil-Brévannes", "Mandres-les-Roses", "Marolles-en-Brie", "Noiseau", "Orly", "Ormesson-sur-Marne", "Périgny", "Le Plessis-Trévise", "La Queue-en-Brie", "Rungis", "Santeny", "Sucy-en-Brie", "Thiais", "Valenton", "Villecresnes", "Villeneuve-le-Roi", "Villeneuve-Saint-Georges", "Villiers-sur-Marne", "Vitry-sur-Seine", "Andilly", "Argenteuil", "Arnouville", "Auvers-sur-Oise", "Beauchamp", "Beaumont-sur-Oise", "Bernes-sur-Oise", "Bessancourt", "Bezons", "Boisemont", "Bonneuil-en-France", "Bouffémont", "Butry-sur-Oise", "Cergy", "Champagne-sur-Oise", "Cormeilles-en-Parisis", "Courdimanche", "Deuil-la-Barre", "Domont", "Eaubonne", "Écouen", "Épiais-lès-Louvres", "Éragny", "Ermont", "Ézanville", "Franconville", "Frépillon", "La Frette-sur-Seine", "Garges-lès-Gonesse", "Gonesse", "Goussainville", "Groslay", "Herblay", "L'Isle-Adam", "Jouy-le-Moutier", "Margency", "Menucourt", "Mériel", "Méry-sur-Oise", "Montigny-lès-Cormeilles", "Montlignon", "Montmagny", "Montmorency", "Mours", "Nesles-la-Vallée", "Neuville-sur-Oise", "Osny", "Parmain", "Persan", "Pierrelaye", "Piscop", "Le Plessis-Bouchard", "Pontoise", "Puiseux-Pontoise", "Roissy-en-France", "Ronquerolles", "Saint-Brice-sous-Forêt", "Saint-Gratien", "Saint-Leu-la-Forêt", "Saint-Ouen-l'Aumône", "Saint-Prix", "Sannois", "Sarcelles", "Soisy-sous-Montmorency", "Taverny", "Le Thillay", "Valmondois", "Vaudherland", "Vauréal", "Villiers-Adam", "Villiers-le-Bel", "Paris", "Chatou", "Le Chesnay", "Croissy-sur-Seine", "Maisons-Laffitte", "Marly-le-Roi", "Le Pecq", "Rocquencourt", "Saint-Germain-en-Laye", "Vélizy-Villacoublay", "Versailles", "Le Vésinet", "Viroflay", "Antony", "Asnières-sur-Seine", "Bagneux", "Bois-Colombes", "Boulogne-Billancourt", "Bourg-la-Reine", "Châtenay-Malabry", "Châtillon", "Chaville", "Clamart", "Clichy", "Colombes", "Courbevoie", "Fontenay-aux-Roses", "Garches", "La Garenne-Colombes", "Issy-les-Moulineaux", "Levallois-Perret", "Malakoff", "Marnes-la-Coquette", "Meudon", "Montrouge", "Nanterre", "Neuilly-sur-Seine", "Le Plessis-Robinson", "Puteaux", "Rueil-Malmaison", "Saint-Cloud", "Sceaux", "Sèvres", "Suresnes", "Vanves", "Vaucresson", "Ville-d'Avray", "Aubervilliers", "Bagnolet", "Les Lilas", "Montreuil", "Neuilly-Plaisance", "Pantin", "Le Pré-Saint-Gervais", "Le Raincy", "Saint-Denis", "Saint-Ouen", "Villemomble", "Arcueil", "Bry-sur-Marne", "Cachan", "Charenton-le-Pont", "Fontenay-sous-Bois", "Gentilly", "L'Haÿ-les-Roses", "Ivry-sur-Seine", "Joinville-le-Pont", "Le Kremlin-Bicêtre", "Maisons-Alfort", "Nogent-sur-Marne", "Le Perreux-sur-Marne", "Saint-Mandé", "Saint-Maur-des-Fossés", "Saint-Maurice", "Villejuif", "Vincennes", "Enghien-les-Bains", "Annet-sur-Marne", "Bagneaux-sur-Loing", "Barbizon", "Bois-le-Roi", "Cannes-Écluse", "La Celle-sur-Morin", "Cély", "Chailly-en-Bière", "Chamigny", "Champagne-sur-Seine", "Chartrettes", "Chevry-Cossigny", "Coulommiers", "Darvault", "Écuelles", "Faremoutiers", "Férolles-Attilly", "La Ferté-sous-Jouarre", "Fleury-en-Bière", "Fontaine-le-Port", "Jouarre", "Mareuil-lès-Meaux", "Montereau-Fault-Yonne", "Moret-sur-Loing", "Mouroux", "Moussy-le-Neuf", "Nangis", "Nemours", "Chauconin-Neufmontiers", "Othis", "Perthes", "Le Pin", "Pommeuse", "Pontcarré", "Provins", "Réau", "Reuil-en-Brie", "Rouilly", "Saint-Brice", "Saint-Germain-Laval", "Saint-Germain-sur-École", "Saint-Mammès", "Saint-Martin-en-Bière", "Saint-Pierre-lès-Nemours", "Saint-Sauveur-sur-École", "Samois-sur-Seine", "Thomery", "Varennes-sur-Seine", "Veneux-les-Sablons", "Vernou-la-Celle-sur-Seine", "Villevaudé", "Villiers-en-Bière", "Voisenon", "Aigremont", "Les Alluets-le-Roi", "Auffargis", "Bailly", "Bazemont", "Bennecourt", "Beynes", "Boissy-Mauvoisin", "Bonnières-sur-Seine", "Bouafle", "Breuil-Bois-Robert", "BRueil-en-Vexin", "Cernay-la-Ville", "Châteaufort", "Chavenay", "Choisel", "Crespières", "Dampierre-en-Yvelines", "Davron", "Drocourt", "Ecquevilly", "Émancé", "Les Essarts-le-Roi", "Favrieux", "Feucherolles", "Fontenay-Mauvoisin", "Fontenay-Saint-Père", "Freneuse", "Gazeran", "Guernes", "Guerville", "Guitrancourt", "Houdan", "Jambville", "Jouy-Mauvoisin", "Lévis-Saint-Nom", "Limetz-Villez", "Mareil-le-Guyon", "Maule", "Ménerville", "Méré", "Méricourt", "Les Mesnuls", "Milon-la-Chapelle", "Montfort-l'Amaury", "Morainvilliers", "Mousseaux-sur-Seine", "Noisy-le-Roi", "Oinville-sur-Montcient", "Perdreauville", "Le Perray-en-Yvelines", "Raizeux", "Rennemoulin", "Rolleboise", "Rosny-sur-Seine", "Saint-Forget", "Saint-Germain-de-la-Grange", "Saint-Hilarion", "Saint-Lambert", "Saint-Martin-la-Garenne", "Saint-Nom-la-Bretèche", "Saulx-Marchais", "Senlisse", "Soindres", "Thiverval-Grignon", "Toussus-le-Noble", "Vicq", "Auvernaux", "Auvers-Saint-Georges", "Avrainville", "Ballancourt-sur-Essonne", "Baulne", "Boissy-sous-Saint-Yon", "Boullay-les-Troux", "Bouray-sur-Juine", "Boutigny-sur-Essonne", "Brières-les-Scellés", "Briis-sous-Forges", "Cerny", "Chamarande", "Champcueil", "Cheptainville", "Chevannes", "Courdimanche-sur-Essonne", "Courson-Monteloup", "D'Huison-Longueville", "Dourdan", "Étampes", "Étréchy", "La Ferté-Alais", "Fontenay-lès-Briis", "Gometz-la-Ville", "Guibeville", "Guigneville-sur-Essonne", "Itteville", "Janville-sur-Juine", "Janvry", "Lardy", "Leudeville", "Marolles-en-Hurepoix", "Mauchamps", "Les Molières", "Morigny-Champigny", "Nainville-les-Roches", "Pecqueuse", "Roinville", "Saint-Chéron", "Saint-Jean-de-Beauregard", "Saint-Maurice-Montcouronne", "Saint-Sulpice-de-Favières", "Saint-Vrain", "Sermaise", "Soisy-sur-École", "Torfou", "Vaugrigneuse", "Vayres-sur-Essonne", "Vert-le-Grand", "Vert-le-Petit", "Ableiges", "Aincourt", "Asnières-sur-Oise", "Attainville", "Baillet-en-France", "Béthemont-la-Forêt", "Boissy-l'Aillerie", "Bouqueval", "Bruyères-sur-Oise", "Chaumontel", "Chauvry", "Chennevières-lès-Louvres", "Condécourt", "Courcelles-sur-Viosne", "Ennery", "Fontenay-en-Parisis", "Fosses", "Frémainville", "Frouville", "Génicourt", "Hédouville", "Hérouville", "Labbeville", "Livilliers", "Longuesse", "Louvres", "Luzarches", "Maffliers", "Marly-la-Ville", "Le Mesnil-Aubry", "Moisselles", "Montgeroult", "Montsoult", "Nerville-la-Forêt", "Nointel", "Le Plessis-Gassot", "Presles", "Puiseux-en-France", "Sagy", "Saint-Cyr-en-Arthies", "Saint-Witz", "Seraincourt", "Seugy", "Survilliers", "Vallangoujard", "Vémars", "Vétheuil", "Viarmes", "Vienne-en-Arthies", "Villeron", "Achères-la-Forêt", "Amillis", "Amponville", "Andrezel", "Arbonne-la-Forêt", "Argentières", "Armentières-en-Brie", "Arville", "Aubepierre-Ozouer-le-Repos", "Aufferville", "Augers-en-Brie", "Aulnoy", "Baby", "Balloy", "Bannost-Villegagnon", "Barbey", "Barcy", "Bassevelle", "Bazoches-lès-Bray", "Beauchery-Saint-Martin", "Beaumont-du-Gâtinais", "Beautheil", "Beauvoir", "Bellot", "Bernay-Vilbert", "Beton-Bazoches", "Bezalles", "Blandy", "Blennes", "Boisdon", "Boissy-aux-Cailles", "Boissy-le-Châtel", "Boitron", "Bombon", "Bougligny", "Boulancourt", "Bouleurs", "Bourron-Marlotte", "Boutigny", "Bransles", "Bray-sur-Seine", "Bréau", "La Brosse-Montceaux", "Burcy", "Bussières", "Buthiers", "Cerneux", "Cessoy-en-Montois", "Chailly-en-Brie", "Chaintreaux", "Chalautre-la-Grande", "Chalautre-la-Petite", "Chalmaison", "Chambry", "Champcenest", "Champdeuil", "Champeaux", "Changis-sur-Marne", "La Chapelle-Gauthier", "La Chapelle-Iger", "La Chapelle-la-Reine", "La Chapelle-Rablais", "La Chapelle-Saint-Sulpice", "Les Chapelles-Bourbon", "La Chapelle-Moutils", "Charmentray", "Charny", "Chartronges", "Châteaubleau", "Château-Landon", "Le Châtelet-en-Brie", "Châtenay-sur-Seine", "Châtenoy", "Châtillon-la-Borde", "Châtres", "Chauffry", "Chaumes-en-Brie", "Chenoise", "Chenou", "Chevrainvilliers", "Chevru", "Chevry-en-Sereine", "Choisy-en-Brie", "Citry", "Clos-Fontaine", "Cocherel", "Compans", "Congis-sur-Thérouanne", "Coubert", "Coulombs-en-Valois", "Coulommes", "Courcelles-en-Bassée", "Courchamp", "Courpalay", "Courquetaine", "Courtacon", "Courtomer", "Coutençon", "CrèvecSur-en-Brie", "Crisenoy", "La Croix-en-Brie", "Crouy-sur-Ourcq", "Cucharmoy", "Cuisy", "Dagny", "Dammartin-sur-Tigeaux", "Dhuisy", "Diant", "Donnemarie-Dontilly", "Dormelles", "Doue", "Douy-la-Ramée", "Échouboulains", "Les Écrennes", "Égligny", "Égreville", "Épisy", "Esmans", "Étrépilly", "Everly", "Évry-Grégy-sur-Yerre", "Favières", "Faÿ-lès-Nemours", "Féricy", "La Ferté-Gaucher", "Flagy", "Fontaine-Fourches", "Fontains", "Fontenailles", "Fontenay-Trésigny", "Forfry", "Forges", "Fouju", "Fresnes-sur-Marne", "Frétoy", "Fromont", "Fublaines", "Garentreville", "Gastins", "La Genevraye", "Germigny-l'Évêque", "Germigny-sous-Coulombs", "Gesvres-le-Chapitre", "Giremoutiers", "Gironville", "Gouaix", "La Grande-Paroisse", "Grandpuits-Bailly-Carrois", "Gravon", "Gressy", "Grez-sur-Loing", "Grisy-Suisnes", "Grisy-sur-Seine", "Guérard", "Guercheville", "Guignes", "Gurcy-le-Châtel", "Hautefeuille", "La Haute-Maison", "Hermé", "Hondevilliers", "La Houssaye-en-Brie", "Ichy", "Isles-les-Meldeuses", "Iverny", "Jablines", "Jaignes", "Jaulnes", "Jouy-le-Châtel", "Jouy-sur-Morin", "Juilly", "Jutigny", "Larchant", "Laval-en-Brie", "Léchelle", "Lescherolles", "Lesches", "Leudon-en-Brie", "Limoges-Fourches", "Lissy", "Liverdy-en-Brie", "Lizines", "Lizy-sur-Ourcq", "Longueville", "Lorrez-le-Bocage-Préaux", "Louan-Villegruis-Fontaine", "Luisetaines" ];

		var cities = [{city:"Bruxelles", zip:1000}, {city:"Laeken", zip:1020}, {city:"Schaerbeek", zip:1030}, {city:"Etterbeek", zip:1040}, {city:"Ixelles", zip:1050}, {city:"Saint-Gilles", zip:1060}, {city:"Anderlecht", zip:1070}, {city:"Uccle", zip:1180}, {city:"Wavre", zip:1300}, {city:"Bierges", zip:1301}, {city:"Incourt", zip:1315}, {city:"Nodebais", zip:1320}, {city:"Bonlez", zip:1325}, {city:"Rixensart", zip:1330}, {city:"Genval", zip:1332}, {city:"Ottignies-Louvain-la-Neuve", zip:1340}, {city:"Limelette", zip:1342}, {city:"Louvain-la-Neuve", zip:1348}, {city:"Hélécine", zip:1357}, {city:"Perwez", zip:1367}, {city:"Ramilies", zip:1367}, {city:"Jodoigne", zip:1370}, {city:"Lasne", zip:1380}, {city:"Grez-Doiceau", zip:1390}, {city:"Nivelles", zip:1400}, {city:"Waterloo", zip:1410}, {city:"Braine-l\'Alleud", zip:1420}, {city:"Rebecq", zip:1430}, {city:"Corbais", zip:1435}, {city:"Chastre", zip:1450}, {city:"Ittre", zip:1460}, {city:"Baisy-Thy", zip:1470}, {city:"Tubize", zip:1480}, {city:"Court-Saint-Etienne", zip:1490}];

		var courtAddresses = [
			{street:"Bvd de Lauzelle", nbr:30, city:"LLN", zip:1348, lat:50.675963, lon:4.614891},
			{street:"Rue de Mèves", nbr:25, city:"Chaumont-Gistoux", zip:1325, lon:4.639929, lat:50.677426},
			{street:"Avenue de Chèremont", nbr:38, city:"Wavre", zip:1300, lon:4.624136, lat:50.709889},
			{street:"Rue du Bois du Buis", nbr:13, city:"Walhain", zip:1360, lon:4.733484, lat:50.612556},
			{street:"Chemin de l\'Herbe", nbr:50, city:"Chaumont-Gistoux", zip:1325, lon:4.685590, lat:50.700329},
			{street:"Rue des Piles", nbr:27, city:"Waterloo", zip:1410, lon:4.364240, lat:50.704083},
			{street:"Avenue des Croix du Feu", nbr:40, city:"Waterloo", zip:1410, lat:50.727455, lon:4.385354},
			{street:"Avenue des Primevères", nbr:4, city:"Rixensart", zip:1332, lat:50.726151, lon:4.497964},
			{street:"Allée du Bois de Bercuit", nbr:125, city:"Grez-Doiceau", zip:1390, lat:50.725064, lon:4.675634},
			{street:"Rue du Baty", nbr:32, city:"Jodoigne", zip:1370, lat:50.727237, lon:4.823434},
			{street:"Rue Brehen", nbr:2, city:"Orp-Jauche", zip:1350, lat:50.709413, lon:4.948404},
			{street:"Rue de la Station", nbr:20, city:"Ramilies", zip:1367, lat:50.638593, lon:4.907033},
			{street:"Rue Gabrielle Chatelain", nbr:25, city:"Namur", zip:5020, lat:50.504274, lon:4.866178},
			{street:"Rue Antoine Quintens", nbr:47, city:"Gembloux", zip:5032, lat:50.541381, lon:4.675634},
			{street:"Rue Bois des Pauvres", nbr:2, city:"Chastre", zip:1450, lat:50.607990, lon:4.614179},
			{street:"Drève des Deux Bois", nbr:1, city:"Court-Saint-Etienne", zip:1490, lat:50.620844, lon:4.539850},
			{street:"Chemin du Moulin", nbr:14, city:"Lasne", zip:1380, lat:50.696367, lon:4.483373},
			{street:"La Grande Buissière", nbr:29, city:"Lasne", zip:1380, lat:50.697889, lon:4.461915},
			{street:"Rue Colonel Montegnie", nbr:112, city:"Rixensart", zip:1332, lat:50.721804, lon:4.480970},
			{street:"Avenue du Gris Moulin", nbr:64, city:"La Hulpe", zip:1310, lat:50.732779, lon:4.473588},
			{street:"Hagaard", nbr:75, city:"Overijse", zip:3090, lat:50.761997, lon:4.525430},
			{street:"Willem Matstraat", nbr:14, city:"Hoeilaart", zip:1560, lat:50.764060, lon:4.479940},
			{street:"Avenue Mongolfier", nbr:100, city:"Woluwe-Saint-Pierre", zip:1150, lat:50.836534, lon:4.443033},
			{street:"Rue Leon Cuissez", nbr:29, city:"Ixelles", zip:1050, lat:50.823415, lon:4.379690},
			{street:"Avenue du Pesage", nbr:61, city:"Ixelles", zip:1050, lat:50.808448, lon:4.387243},
			{street:"Rue du Bassinia", nbr:25, city:"Louvain-la-Neuve", zip:1348, lat:50.663943, lon:4.607935},
			{street:"Rue Charles Quint", nbr:136, city:"Bruxelles", zip:1000, lat:50.849217, lon:4.388959},
			{street:"Avenue du Vert Chasseur", nbr:46, city:"Uccle", zip:1180, lat:50.800745, lon:4.369218},
			{street:"Avenue Blücher", nbr:57, city:"Uccle", zip:1180, lat:50.782298, lon:4.366472},
			{street:"Avenue Astrid", nbr:79, city:"Rhode-Saint-Genèse", zip:1640, lat:50.740167, lon:4.384153},
			{street:"Drève des Pins", nbr:29, city:"Braine-l\'Alleud", zip:1420, lat:50.723760, lon:4.338491},
			{street:"Place de la Paix", nbr:1, city:"Evere", zip:1140, lat:50.876929, lon:4.400386},
			{street:"Rue Frédéric Pelletier", nbr:73, city:"Schaerbeek", zip:1030, lat:50.845655, lon:4.401320},
			{street:"Rue de la Probité", nbr:29, city:"Ixelles", zip:1050, lat:50.812754, lon:4.394315},
			{street:"Rue Emile Wauters", nbr:79, city:"Bruxelles", zip:1020, lat:50.889161, lon:4.343058},
			{street:"Rue de Ganshoren", nbr:4, city:"Koekelberg", zip:1081, lat:50.859622, lon:4.329169},
			{street:"Fazantenlaan", nbr:12, city:"Vilvoorde", zip:1800, lat:50.910549, lon:4.378282},
			{street:"Avenue des Tarins", nbr:21, city:"Kraainem", zip:1950, lat:50.856567, lon:4.468299},
			{street:"Avenue des Genêts", nbr:20, city:"Wezembeek-Oppem", zip:3080, lat:50.830286, lon:4.498885},
			{street:"Avenue Minerve", nbr:30, city:"Waterloo", zip:1410, lat:50.706444, lon:4.420193},
			{street:"Rue Bois Paris", nbr:3, city:"Lasne", zip:1380, lat:50.684801, lon:4.467621},
			{street:"Avenue de l\'Europe", nbr:34, city:"Rixensart", zip:1330, lat:50.702337, lon:4.533052},
			{street:"Rue de la Mazerine", nbr:12, city:"La Hulpe", zip:1310, lat:50.731447, lon:4.493852},
			{street:"Kalvarieberg", nbr:27, city:"Overijse", zip:3090, lat:50.776333, lon:4.544764},
			{street:"Drève de Stadt", nbr:52, city:"Wavre", zip:1300, lat:50.728445, lon:4.610389},
			{street:"Avenue de la Seigneurerie", nbr:6, city:"Chaumont-Gistoux", zip:1325, lat:50.691117, lon:4.640105},
			{street:"Tienne de Chenois", nbr:2, city:"Chaumont-Gistoux", zip:1325, lat:50.696390, lon:4.668078},
			{street:"Rue de la Hocaille", nbr:11, city:"Grez-Doiceau", zip:1390, lat:50.752946, lon:4.677273},
			{street:"Rue de la Bruyère", nbr:23, city:"Braine-l\'Alleud", zip:1428, lat:50.651234, lon:4.376408},
			{street:"Rue Mon Plaisir", nbr:1, city:"Ittre", zip:1460, lat:50.636392, lon:4.219828},
			{street:"Fazantenlaat", nbr:10, city:"Beersel", zip:1653, lat:50.721929, lon:4.292184},
			{street:"Avenue du Vossegat", nbr:25, city:"Uccle", zip:1180, lat:50.802935, lon:4.331082}
		];


		var AFTs = ["NC", "C30.5", "C30.4", "C30.3", "C30.2", "C30.1", "C30", "C15.5", "C15.4", "C15.3", "C15.2", "C15.1", "C15"];

		var instructions = ["Continuez en bas du sentier", "Au fond à droite", "Après la boite aux lettres blanche, tournez à gauche", "Prendre le sentier de terre sur la gauche", "Suivre les panneaux indicatifs", "Derrière la ferme"];

		var comments = ["Attention au chien", "Pas d\'enfants", "Chaussures de salle uniquement", "Rafraichissements disponibles", "Balles fournies", "Interdiction de manger sur le terrain", "Veuillez bien fermer la porte du terrain"];

		var questions = ["Y aura-t-il un barbecue cette année aussi ?", "Que faire si mon partenaire et moi n\'avons pas le même âge ?", "Comment puis-je m\'inscrire au tournoi ?", "Quel est le nombre maximal de jeux dans un set ?", "Où dois-je me présenter samedi matin ?", "Où se retrouve-t-on à midi ?", "De combien de joueurs sont constituées les pools ?", "Où puis-je trouver des informations sur les actions humanitaires d\'ASMAE ?"];

		var saturdayExtras = ["BBQ", "Dessert"];
		var sundayExtras = ["Karaoke", "Chateau Gonflable"];


        // On renvoie un entier aléatoire entre une valeur min (incluse)
        // et une valeur max (exclue).
        // Attention : si on utilisait Math.round(), on aurait une distribution
        // non uniforme !
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

		function insertQuestions() {
			var users = Meteor.users.find().fetch();
			for (var i=0;i<questions.length; i++) {
				if (Questions.findOne({question:questions[i]})) {
					continue;
				}
				var user = getRandomElement(users);
				Questions.insert({lastname:user.profile.lastName, firstname:user.profile.firstName, email:user.emails[0].address, question:questions[i], date:new Date(), processed:false});
			}
		}

		function insertExtras() {
			if (typeof Extras.findOne({name:"BBQ"}) === 'undefined') {
				console.log("Inserting BBQ");
				Extras.insert({name: "BBQ", price: 8, comment: "poulet-merguez", day:"saturday"});
			}
			if (typeof Extras.findOne({name:"Karaoke"}) === 'undefined') {
				console.log("Inserting Karaoke");
				Extras.insert({name: "Karaoke", price: 4, comment: "Pour les petits et les grands", day:"sunday"});
			}
			if (typeof Extras.findOne({name:"Dessert"}) === 'undefined') {
				console.log("Inserting Dessert");
				Extras.insert({name: "Dessert", price: 3, comment: "Tiramisu maison", day:"saturday"});
			}
			if (typeof Extras.findOne({name:"Chateau gonflable"}) === 'undefined') {
				console.log("Inserting Chateau gonflable");
				Extras.insert({name: "Chateau gonflable", price: 1, comment: "15 min", day:"sunday"});
			}
		}


		function getPlayerWish(gender, forceWish) {
			var rand = getRandomInt(0,2);
			var name = gender=="M" ? getRandomElement(firstnamesM) : getRandomElement(firstnamesF);
			if (flipCoin() || forceWish) {
				switch (rand) {
					case 0: return "Je veux jouer avec "+name;
					case 1: return "Je ne veux pas jouer avec "+name;
					default: return null;
				}
			}
		}

		function getCourtWish(forceWish) {
			var rand = getRandomInt(0,2);
			var name = getRandomElement(firstnames);
			if (flipCoin() || forceWish) {
				switch (rand) {
					case 0: return "Je veux jouer sur le terrain de "+name;
					case 1: return "Je ne veux pas jouer sur le terrain de  "+name;
					default: return null;
				}
			}
		}

		function getOtherWish(forceWish) {
			var rand = getRandomInt(0,2);
			if (flipCoin() || forceWish) {
				switch (rand) {
					case 0: return "Disponible seulement le matin";
					case 1: return "Disponible seulement l'après-midi";
					default: return null;
				}
			}
		}

		function getWishes(gender) {
			if (flipCoin()) {
				var rand = getRandomInt(0,10);
				if (rand > 8) {
					return [getPlayerWish(gender, true), getCourtWish(true), getOtherWish(true)];
				}
				if (rand > 6) {
					return [getPlayerWish(gender, true), getCourtWish(true), undefined];
				}
				else {
					var rand = getRandomInt(0,3);
					if (rand===0) {
						return [getPlayerWish(gender, true), undefined, undefined];
					}
					if (rand===1) {
						return [undefined, getCourtWish(true), undefined];
					}
					else {
						return [undefined, undefined, getOtherWish(true)];
					}
				}
			}
			return [undefined, undefined, undefined];
		}

		function getExtra(day) {
			if (day !== "saturday" && day != "sunday") {
				console.error("Error popDB : day provided to getExtra is not saturday or sunday");
				return undefined;
			}
			if (flipCoin()) {
				var nbr = getRandomInt(1,5);
				var array = day=="saturday" ? saturdayExtras : sundayExtras;
				var playerExtras = {};
				for (var i=0; i<array.length; i++) {
					if (flipCoin()) {
						playerExtras[array[i]] = getRandomInt(1,5);
					}
				}
			}
			return undefined;
		}

		function getPaymentMethod() {
			return getRandomElement(paymentTypes);
		}

		function insertStaffAndAdminMembers(nbrStaff, nbrAdmin) {
			// Add some staff members
			for (var j=0; j<nbrStaff; j++) {
				var profile = {
	                firstName: getRandomElement(firstnames),
	                lastName:getRandomElement(lastnames),
	                phone:"0499112233",
	                birthDate:new Date(1990,8,21),
	                AFT:getRandomElement(AFTs),
	                isStaff:1,
	                isAdmin:false,
	                gender:"M"
	            };
				var email = "staff"+j+"@staff.com";
				if (Accounts.findUserByEmail(email)!==undefined) {
	                continue;
	            }
				var userID = Accounts.createUser({
	                           email : email,
	                           password : "passpass",
	                           profile: profile
	                       });
				Accounts.addEmail(userID, email, true);
				Meteor.users.update({_id: userID}, {$set: {"profile.isStaff":true}});
			}

			// Add some admin members
			for (var j=0; j<nbrAdmin; j++) {
				var profile = {
					firstName: getRandomElement(firstnames),
	                lastName:getRandomElement(lastnames),
	                phone:"0499112233",
	                birthDate:new Date(1990,8,21),
	                AFT:getRandomElement(AFTs),
	                isStaff:1,
	                isAdmin:1,
	                gender:"M"
	            };
				var email = "admin"+j+"@admin.com";
				if (Accounts.findUserByEmail(email)!==undefined) {
	                continue;
	            }
				var userID = Accounts.createUser({
	                           email : email,
	                           password : "passpass",
	                           profile: profile
	                       });
				Accounts.addEmail(userID, email, true);
				Meteor.users.update({_id: userID}, {$set: {"profile.isStaff":true}});
				Meteor.users.update({_id: userID}, {$set: {"profile.isAdmin":true}});
			}
		}
        /*
         * Returns two dates for players competing in a certain type and a certain category
         */
        function getDates(type, category, alone, tournamentDate) {
			var tournamentYear = tournamentDate.getFullYear();
            var bounds;
            var year1, year2, month1, month2, day1, day2, date1, date2;
            year1 = getRandomInt(1960,2005);
            year2 = getRandomInt(1960,2005);
            month1 = getRandomInt(0,12);
            month2 = getRandomInt(0,12);
            day1 = getRandomInt(0,29);
            day2 = getRandomInt(0,29);
            if (type === typeKeys[3]) { // Family
                bounds = [8,16,24,80];
				birthDate1 = new Date(year1, month1, day1);
				birthDate2 = new Date(year2, month2, day2);
				if (alone) {
					while(!acceptForFamily(birthDate1, tournamentDate)) {
						// Probability 0.5 to be the young
						if (flipCoin()) {
							year1 = tournamentYear - getRandomInt(bounds[0],bounds[1]+1);
						}
						else {
							year1 = tournamentYear - getRandomInt(bounds[2],bounds[3]+1);
						}
	                    month1 = getRandomInt(0,12);
	                    day1 = getRandomInt(0,29);
						birthDate1 = new Date(year1,month1,day1);
					}
					return birthDate1;
				}
				else {
					while(!acceptPairForFamily(birthDate1,birthDate2, tournamentDate)) {
						year1 = tournamentYear - getRandomInt(bounds[0],bounds[1]+1);
		                year2 = tournamentYear - getRandomInt(bounds[2],bounds[3]+1);
						month1 = getRandomInt(0,12);
	                    day1 = getRandomInt(0,29);
						month2 = getRandomInt(0,12);
	                    day2 = getRandomInt(0,29);
						birthDate1 = new Date(year1, month1, day1);
						birthDate2 = new Date(year2, month2, day2);
					}
					return [new Date(year1, month1, day1), new Date(year2, month2, day2)];
				}
            }
            else { // Not family
                bounds = getAgeBoundsForCategory(category);
                while (getCategory(getAgeNoDate(year1,month1,day1,tournamentDate)) !== category) {
                    year1 = tournamentYear - getRandomInt(bounds[0],bounds[1]+1);
                    month1 = getRandomInt(0,12);
                    day1 = getRandomInt(0,29);
                }
				if (!alone) {
					while (getCategory(getAgeNoDate(year2,month2,day2,tournamentDate)) !== category) {
	                    year2 = tournamentYear - getRandomInt(bounds[0],bounds[1]+1);
	                    month2 = getRandomInt(0,12);
	                    day2 = getRandomInt(0,29);
	                }
					return [new Date(year1, month1, day1), new Date(year2, month2, day2)];
				}
				return new Date(year1, month1, day1);
            }
        }

		function flipCoin() {
			return getRandomInt(0,2)===0;
		}
		function proba(n) {
			return getRandomInt(0,n)===0;
		}
		function getRandomElement(array) {
			return array[getRandomInt(0,array.length)];
		}

		function insertCourts(nbr, saturdayAvailable, sundayAvailable, tournamentYear) {
			if (Courts.find().fetch().length > nbr - 1) {
				return false;
			}
			function getCourtArray() {
				var rand = getRandomInt(5,11);
				var array = [];
				var globalValueDocument = Meteor.call('getNextCourtNumber');
				nextCourtNumber = globalValueDocument.value;

				for(var i = 0; i < rand; i++){
					array[i] = nextCourtNumber;
					nextCourtNumber++;
					nbr--;
				}
				Meteor.call('setNextCourtNumber', nextCourtNumber);
				return array;
			}
			function getInstructions() {
				if (flipCoin()) {
					return getRandomElement(instructions);
				}
				return undefined;
			}
			function getComment() {
				if (proba(3)) {
					return getRandomElement(comments);
				}
				return undefined;
			}

			var users = Meteor.users.find().fetch();

			for (var j=0; j<nbr; j++) {
				var courtArray = getCourtArray();
				var owner = getRandomElement(users);

				var ownerOK = tournamentYear.toString() === "2015";
				var staffOK = ownerOK ? flipCoin() : false;

				if (courtAddresses.length < 1) {
					console.log("Not enough addresses");
					return undefined;
				}
				var courtAddress = getRandomElement(courtAddresses);
				var index = courtAddresses.indexOf(courtAddress);
				courtAddresses.splice(index,1)

				var coords = {
					lat:courtAddress.lat,
					lng:courtAddress.lon
				};
				court = {
					addressID : insertAddress(true, courtAddress),
					courtNumber : courtArray,
					courtType : flipCoin() ? "club" : "privé",
					dispoSamedi : saturdayAvailable,
					dispoDimanche : sundayAvailable,
					instructions : getInstructions(),
					staffOK : staffOK,
					ownerOK : ownerOK,
					numberOfCourts : courtArray.length,
					ownerComment : getComment(),
					ownerID : owner._id,
					surface : getRandomElement(surfaceTypes),
					isOutdoor : flipCoin(),
					coords : coords,
					HQDist : getDistanceFromHQ(coords)
				};
				var id = Courts.insert(court);
			}
		}

		function insertAddress(isCourt, courtAddress) {
			var addressData;
			if (isCourt) {
				addressData = {
					street:courtAddress.street,
					number:courtAddress.nbr,
					box:getRandomInt(1,10).toString(),
					city:courtAddress.city,
					zipCode:courtAddress.zip,
					country:"Belgique",
					isCourtAddress:true
				};
			}
			else {
				var c = getRandomElement(cities);
				addressData = {
	                street:getRandomElement(streets),
	                number:getRandomInt(1,200),
	                box:getRandomInt(1,10).toString(),
	                city:c.city,
	                zipCode:c.zip,
	                country:"Belgique",
	                isCourtAddress:false
	            };
			}
			var addressID = Addresses.insert(addressData);
			if (typeof addressID1 === undefined) {
				console.log("Error popDB inserting address : "+addressData);
				return undefined;
			}
			return addressID;
		}

		function insertUnregisteredAccounts(nbr) {
			for (var i=0; i<nbr; i++) {
				var email = "unregisteredUser"+i+"@user.com";
				if (Accounts.findUserByEmail(email)!==undefined) {
					continue;
				}
				var userID = Accounts.createUser({
	                           email : email,
	                           password : "passpass",
	                       });
				Accounts.addEmail(userID, email, true);
			}
		}

        // type = Men | Women | Mixed | Family
        function createPair(type, category, alone, tournamentDate, count) {
			var tournamentYear = tournamentDate.getFullYear();
            var email1 = "user"+tournamentYear+"_"+count+"@user.com";
            count++;
			if (Accounts.findUserByEmail(email1)!==undefined) {
                return false;
            }
            var email2;
			if (!alone) {
				email2 = "user"+tournamentYear+"_"+count+"@user.com";
				count++;
				if (Accounts.findUserByEmail(email2)!==undefined) {
	                return false;
	            }
			}

            var dates = getDates(type, category, alone, tournamentDate);
			var date1, date2;
			if (alone) {
				date1 = dates;
			}
			else {
				date1 = dates[0];
				date2 = dates[1];
			}

            var firstname1, firstname2;
            var gen1, gen2;
			var dateMatch;
			// Determine genders and dateMatch
            switch (type) {
                case typeKeys[0]: // Men
					dateMatch="sunday";
                    firstname1 = getRandomElement(firstnamesM);
                    firstname2 = getRandomElement(firstnamesM);
                    gen1 = "M";
                    gen2 = "M";
                    break;
                case typeKeys[1]: // Women
					dateMatch="sunday";
                    firstname1 = getRandomElement(firstnamesF);
                    firstname2 = getRandomElement(firstnamesF);
                    gen1 = "F";
                    gen2 = "F";
                    break;
                case typeKeys[2]: // Mixed
					b = flipCoin()
					dateMatch="saturday";
                    firstname1 = b ? getRandomElement(firstnamesM) : getRandomElement(firstnamesF);
                    firstname2 = b ? getRandomElement(firstnamesF) : getRandomElement(firstnamesM);
                    gen1 = b ? "M" : "F";
                    gen2 = b ? "F" : "M";
                    break;
                case typeKeys[3]: // Family
					dateMatch="family";
                    firstname1 = getRandomElement(firstnames);
                    firstname2 = getRandomElement(firstnames);
                    if (firstnamesM.indexOf(firstname1) > -1) {
                        gen1 = "M";
                    }
                    else {
                        gen1 = "F"
                    }
                    if (firstnamesM.indexOf(firstname2) > -1) {
                        gen2 = "M";
                    }
                    else {
                        gen2 = "F"
                    }
                    break;
                default:
                    console.error("Error populateDB : createPair : type is not good");
            }

            var addressID1 = insertAddress(false);
			var addressID2;
			if (!alone) {
				addressID2 = insertAddress(false);
			}

            var phone1 = "04"+getRandomInt(10000000,99999999).toString();
            var phone2 = "04"+getRandomInt(10000000,99999999).toString();

            var profile1 = {
                firstName: firstname1,
                lastName:getRandomElement(lastnames),
                phone:phone1,
                birthDate:date1,
                AFT:getRandomElement(AFTs),
                isStaff:false,
                isAdmin:false,
                gender:gen1
            };

            var userID1 = Accounts.createUser({
                           email : email1,
                           password : "passpass",
                           profile: profile1
                       });
			Accounts.addEmail(userID1, email1, true);

			if (!alone) {
				var profile2 = {
	                firstName: firstname2,
	                lastName:getRandomElement(lastnames),
	                phone:phone2,
	                birthDate:date2,
	                AFT:getRandomElement(AFTs),
	                isStaff:false,
	                isAdmin:false,
	                gender:gen2
	            };

				var userID2 = Accounts.createUser({
	                          email : email2,
	                          password : "passpass",
	                          profile: profile2
	                      });
				Accounts.addEmail(userID2, email2, true);
			}

			function getOppositeGender(gender) {
				return gender==='M' ? 'F' : 'M'
			}

			var day = getDayFromType(type);
			var wishes1 = getWishes(dateMatch === 'saturday' ? getOppositeGender(gen1) : gen1);
			var extra1 = getExtra(day);
			var pairID;

			Meteor.call("updateUser", {_id:userID1, profile:{addressID:addressID1}});
			if (!alone) {
				var wishes2 = getWishes(dateMatch === 'saturday' ? getOppositeGender(gen2) : gen2);
				var extra2 = getExtra(day);
				Meteor.call("updateUser", {_id:userID2, profile:{addressID:addressID2}});
				pairID = Meteor.call("updatePair", {player1: {_id:userID1, playerWish:wishes1[0], courtWish:wishes1[1], otherWish:wishes1[2], extras:extra1}, player2: {_id:userID2, playerWish:wishes2[0], courtWish:wishes2[1], otherWish:wishes2[2], extras:extra2}, year:tournamentYear.toString(), paymentMethod:getPaymentMethod()}, true);
			}
			else {
				pairID = Meteor.call("updatePair", {player1: {_id:userID1, playerWish:wishes1[0], courtWish:wishes1[1], otherWish:wishes1[2], extras:extra1}, year:tournamentYear.toString(), paymentMethod:getPaymentMethod()}, true);
			}
			Meteor.call("addPairToTournament", pairID, tournamentYear.toString(), dateMatch);
        } // End createPair


		function popDBForYear(tournamentData, nPairs, nAlones, nCourtSaturday, nCourtSunday, nCourtBoth) {
			var tournamentDate = tournamentData.tournamentDate;
			var tournamentYear = tournamentDate.getFullYear();

			console.log("----- Begin popDB for year "+tournamentYear+" -----");

			Meteor.call('launchTournament', tournamentData);

			var count = 0;

			// Create the pairs
	        for (var i=0; i<3; i++) {
				console.log("popDB populates type "+typeKeys[i]);
	            for (var k=0; k < 7; k++) {
					console.log("popDB populates category "+categoriesKeys[k]);
					for (var j=0; j<nPairs[i][k]; j++) {
	                	createPair(typeKeys[i],categoriesKeys[k], false, tournamentDate, count);
						count+=2;
					}
					console.log("popDB populates category "+categoriesKeys[k]+" with alone players");
					for (var j=0; j<nAlones[i][k];j++) {
						createPair(typeKeys[i],categoriesKeys[k], true, tournamentDate, count);
						count++;
					}
	            }
	        }
			// Family
			console.log("popDB populates type family");
	        for (var j=0; j<nPairs[3]; j++) {
	            createPair(typeKeys[3],"doesnotmatterwhatiputhere", false, tournamentDate, count);
				count+=2;
	        }

			console.log("popDB populates type family with alone players");
			for (var j=0; j<nAlones[3]; j++) {
				createPair(typeKeys[3],"doesnotmatterwhatiputhere",true, tournamentDate, count);
				count++;
			}

			console.log("popDB populates courts");
			insertCourts(nCourtSaturday, true, false, tournamentYear);
			insertCourts(nCourtSunday, false, true, tournamentYear);
			insertCourts(nCourtBoth, true, true, tournamentYear);

			console.log("----- popDB done for year "+tournamentYear+" -----");
		}

		/*
			------------- MAIN function --------------
		*/

		console.log("---------- Begin popDB ----------");

		console.log("Activation of the DB");
		Meteor.call("activateDB", isTest);

		console.log("popDB populates extras");
		insertExtras();

		for (var i=0; i<tournamentDateTab.length; i++) {
			popDBForYear(tournamentDateTab[i], nPairsTab[i], nAlonesTab[i], nCourtSaturdayTab[i], nCourtSundayTab[i], nCourtBothTab[i]);
		}

		console.log("popDB populates staff and admin members");
		insertStaffAndAdminMembers(nStaff,nAdmin);
		console.log("popDB populates unregistered accounts");
		insertUnregisteredAccounts(nUnregistered);


		console.log("popDB populates questions");
		insertQuestions();

		console.log("---------- popDB done ----------");
	},
});
