
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
}
});
// Object to store in the memcached.....
var counterClick = 0, counterSignup = 0, counterASignup = 0, counterBSignup = 0, counterAClick = 0, counterBClick = 0;
var signup = new Array(), click = new Array();
var signups, clicks;
var N = 5, events = 100;

asyncCall();

async function asyncCall() {
 console.log('calling');
 await resolveAfterPost();
}

 function resolveAfterPost() {
 setInterval(function(){
for(var i = 1; i<= events; i++)
{
var chosenEvent =  Math.random() < 0.5 ? "signup" : "click";
var chosenTrackingId =  Math.random() < 0.5 ? "TrackA" : "TrackB";

if(chosenEvent == "signup" && chosenTrackingId == "TrackA")
{
var s = "signup";
counterASignup++;
counterSignup++;
}
else if(chosenEvent == "signup" && chosenTrackingId == "TrackB")
{
var s = "signup";
counterBSignup++;
counterSignup++;
}
else if(chosenEvent == "click" && chosenTrackingId == "TrackA")
{
var s = "click";
counterAClick++;
counterClick++;
}
else {
var s = "click";
counterBClick++;
counterClick++;
}


 signups = {
 totalEventsCaptured: counterSignup,
 eventsCapturedByTrackingIds:{
 "INF-yj562hjojzbtez": counterASignup,
 "INF-3gbfcjjsd6vhvo": counterBSignup,
},
"timestamp":new Date()
};

 clicks = {
 totalEventsCaptured: counterClick,
 eventsCapturedByTrackingIds:{
 "INF-yj562hjojzbtez": counterAClick,
 "INF-3gbfcjjsd6vhvo": counterBClick
},
"timestamp":new Date()
};

if(chosenEvent == 'signup')
{
  signup.push(signups);
  memcached.set('signup', signup, 100000, function (err,success) {
if(err) throw new err;

});
}

if(chosenEvent == 'click')
{
  click.push(clicks);
  memcached.set('click', click, 100000, function (err, success) {
if(err) throw new err;
});
}
}
}, 1000);
}

setInterval(function(){
  resolveAfterGet();
}, 10000)


async function resolveAfterGet (){
  // method to get saved data....
  var d = new Date();
  var dDupl = new Date();
  d.setMinutes(d.getMinutes() - N);
  var newSignup = new Array();
  var newClick = new Array();


  await memcached.get('signup', function (err, data) {
    data.forEach(element => {
      if(new Date(element.timestamp) > d)
      {
      newSignup.push(element);
      }
    });
    console.log("Data captured for SIGNUP event type, from last "+N+" minutes starting from "+ d +" to "+ dDupl +" out of total events triggered in this period ===> ");
     console.log("signup = "+ JSON.stringify(newSignup[newSignup.length-1]));
    console.log("===============================================================================================================================================================");
  });

  await memcached.get('click', function (err, data) {
    data.forEach(element => {
    if(new Date(element.timestamp) > d)
    {
    newClick.push(element);
    }
  });
  console.log("Data captured for CLICK event type, from last "+N+" minutes starting from "+ d +" to "+ dDupl +" out of total events triggered in this period ===> ");
  console.log("click = "+ JSON.stringify(newClick[newClick.length-1]));
  console.log("===============================================================================================================================================================");
  });
}

app.listen(4000,function(){
console.log("Server running on port 4000");
});
