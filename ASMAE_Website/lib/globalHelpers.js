
/*
	Global helpers
*/
Template.registerHelper("equals", function (x,y) {
    return x==y;
});

Template.registerHelper("log", function (value, text) {
    console.log(text);
    console.log(value);
});