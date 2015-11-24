Template.home.helpers({
    'registrationsON': function(){
         return GlobalValues.findOne({_id: "registrationsON"}).value;
    }
});
