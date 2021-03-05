var express = require("express");
var Memcached = require('memcached');
var app = express();

// Created object for memcached
var memcached = new Memcached();
/* code to connect with your memecahced server */
memcached.connect('localhost:11211', function( err, conn ){
if( err ) {
console.log( conn.server,'error while memcached connection!!');
}
else {
  console.log('Memcached server connected!');
  console.log("===============================================================================================================================================================");
  console.log('Trigerring.......(events...)');
  console.log('wait for 10 seconds.......(approximation)');
  console.log("===============================================================================================================================================================");

// Object to store in the memcached.....
var n = 20, x = 10, time = 10000;
//n = number of events
//x = number of tracking ids

var events = [], obj;
obj = {
totalEventsCaptured: 0,
eventsCapturedByTrackingIds:{
},
"timestamp":new Date()
};

for(var i=0;i<n;i++)
{
  events.push(JSON.parse(JSON.stringify(obj)));
}
events.forEach((item, i) => {
  for(var i=0;i<x;i++)
  item.eventsCapturedByTrackingIds["trackID"+i] = 0;
});
// console.log("events formed = "+ JSON.stringify(events));
//end formation

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(function() {
// console.log("setInterval Entered!");
var randomEventCount = randomInteger(1,n); //11
// console.log("randomEventCount = "+ randomEventCount);
var eventSorted = [], trackIDsSorted = [];

while(eventSorted.length < randomEventCount){
    var r = Math.floor(Math.random() * n) + 1;
    if(eventSorted.indexOf(r) === -1)
     eventSorted.push(r);
}

// console.log("eventSorted = "+ JSON.stringify(eventSorted));

for(var i=0; i<randomEventCount; i++)
{
  var randomTrackIDCount = randomInteger(1, x);
  // console.log("randomTrackIDCount = "+ randomTrackIDCount);
    events[eventSorted[i]-1].totalEventsCaptured = events[eventSorted[i]-1].totalEventsCaptured + randomTrackIDCount;
    // console.log("events[eventSorted[i]].totalEventsCaptured = "+events[eventSorted[i]-1].totalEventsCaptured);
  while(trackIDsSorted.length < randomTrackIDCount){
      var r = Math.floor(Math.random() * x) + 1;
      r = r - 1;
         events[eventSorted[i]-1].eventsCapturedByTrackingIds["trackID"+r] ++;
         // console.log("events[eventSorted["+i+"]-1].eventsCapturedByTrackingIds[trackID"+r+"] = "+ events[eventSorted[i]-1].eventsCapturedByTrackingIds["trackID"+r]);
      trackIDsSorted.push(r);
    }
    // console.log("trackIDsSorted = "+ JSON.stringify(trackIDsSorted));
    trackIDsSorted = [];
}

memcached.set('events', events, 100000, function (err, success) {
if(err) throw new err;
else {
  console.log("Some Events triggered just now!");
}
});
},  1000)

console.log("Total Events = "+n);
console.log("Total Tracking IDs = "+x);
console.log("===============================================================================================================================================================");

setInterval(function(){
  resolveAfterGet();
}, time)


async function resolveAfterGet (){
  // method to get saved data...

  await memcached.get('events', function (err, data) {
      data.forEach((item, i) => {
      console.log("Data captured for all events and event type, from last "+(time/1000)+" seconds");
      console.log("EVENT_"+i+" = "+ JSON.stringify(item));
      console.log("===============================================================================================================================================================");
    });
    });
}
}
});
app.listen(4000,function(){
console.log("Server running on port 4000");
});
