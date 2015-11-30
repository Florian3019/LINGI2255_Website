Tracker.autorun(function () {
  Meteor.subscribe("Courts");
  Meteor.subscribe("Addresses");
  Meteor.subscribe("users");
  Meteor.subscribe("Pairs");
  Meteor.subscribe("Questions");
  Meteor.subscribe("Pools");
  Meteor.subscribe("Years");
  Meteor.subscribe("Types");
  Meteor.subscribe("Matches");
  Meteor.subscribe("Extras");
  Meteor.subscribe("ModificationsLog");
  Meteor.subscribe("Payments");
  Meteor.subscribe("GlobalValues");
  Meteor.subscribe("Threads");
  Meteor.subscribe("Topics");
});