var linticketEvents = [];
var facebookEvents = [];
var todayEvents = [];
var futureEvents = [];
var todayDate = new Date();
//var EventList = new Mongo.Collection("listevent");
//EventList.remove({});
	//EventList.insert({
	//	eventname:"Movie"
	//});

if (Meteor.isServer) {

    Meteor.methods({
        checkJson: function () {
            return Meteor.http.call("GET", "http://www.linticket.no/json/Kvarteret/index.php3");
        },
        getFacebookEvents: function() {
            return Meteor.http.call("GET", "https://graph.facebook.com/v2.5/20210537496/events?access_token=465892016940274|KVKzfuxnF9CQdlW7-jIASIJoHP0");
        }
    });

}

//invoke the server method
if (Meteor.isClient) {

    Meteor.call("getFacebookEvents", function(error, results) {
        if(error) {
            console.log(error);
        } else {
            for(var i=0; i<results.data.data.length; i++) {
                var obj = results.data.data[i];
                obj.datasource = "facebook";
                obj.sortDate = obj.start_time.substring(0,10);
                facebookEvents.push(obj);
            }
            //console.log(facebookEvents.length);
        }
    });

    Meteor.call("checkJson", function(error, results) {
    	if(error) {
    		console.log(error);
    	} else {
            for(var i=0; i<results.data.length; i++) {
                  var obj = results.data[i];
                  obj.datasource = "linticket";
                  obj.sortDate = obj.dato;
                  linticketEvents.push(obj);
            }
            //console.log(linticketEvents.length);
            addTodayAndFutureEvents();
            sortFutureEvents();
            //printevents();
            displayEvents();
    	}
    });
   

    //Meteor.setInterval(getLinticketEvents, 3600000);
    //Meteor.setInterval(getFacebookEvents, 3600000);
}


function displayEvents() {
    for(var i=0; i<todayEvents.length; i++) {
        var obj = todayEvents[i];
        if(obj.datasource == "linticket") {
            $("<div>"+"<h3>"+obj.navn+"</h3>"+"<p>"+dayToString(obj.dato)+". "+monthToString(obj.dato)+" - "+obj.sted+", kl. "+obj.starttid.substring(0,5)+" - "+obj.slutttid.substring(0,5)+"</p>"+"<p>"+obj.tekst+"</p>"+"</div>").appendTo("#eventsToday");
        } else {
            $("<div>"+"<h3>"+obj.name+"</h3>"+"<p>"+dayToString(obj.start_time)+". "+monthToString(obj.start_time)+" - "+obj.place.name+", kl. "+obj.start_time.substring(11,16)+"</p>"+"</div>").appendTo("#eventsToday");
        }
    }
    for(var i=0; i<futureEvents.length; i++) {
        var obj = futureEvents[i];
        if(obj.datasource == "linticket") {
            $("<div>"+"<h3>"+obj.navn+"</h3>"+"<p>"+dayToString(obj.dato)+". "+monthToString(obj.dato)+" - "+obj.sted+", kl. "+obj.starttid.substring(0,5)+" - "+obj.slutttid.substring(0,5)+"</p>"+"<p>"+obj.tekst+"</p>"+"</div>").appendTo("#eventsFuture");
        } else {
            $("<div>"+"<h3>"+obj.name+"</h3>"+"<p>"+dayToString(obj.start_time)+". "+monthToString(obj.start_time)+" - "+obj.place.name+", kl. "+obj.start_time.substring(11,16)+"</p>"+"</div>").appendTo("#eventsFuture");
        }
    }
    slideshowToday();
    slideshowFuture()
}

function addTodayAndFutureEvents() {
    var date = todayDate.toISOString().substring(0,10);
    var dayInMonth = stringToInt(date.substring(8,10));
    var monthNumber = stringToInt(date.substring(5,7));
    for(var i=0; i<linticketEvents.length; i++) {
            var obj = linticketEvents[i];
            if(obj.dato == date) {
                todayEvents.push(obj);
            } else {
                futureEvents.push(obj);
            }
      }
      for(var i=0; i<facebookEvents.length; i++) {
            var obj = facebookEvents[i];
            if(stringToInt(obj.start_time.substring(5,7)) < monthNumber) {
                //do nothing since old event
            } else if(stringToInt(obj.start_time.substring(5,7)) == monthNumber && obj.start_time.substring(8,10) < dayInMonth) {
                //do nothing since old event
            }
            else if(obj.start_time.substring(0,10) == date) {
                todayEvents.push(obj);
            } else {
                futureEvents.push(obj);
            }
      }
}

function sortFutureEvents(){
    if(futureEvents.length != 0) {
    futureEvents.sort(function(a, b) {
        var c = new Date(a.sortDate);
        var d = new Date(b.sortDate);
        return c-d;
    });
    }
}

function printevents() {
      for(var i=0; i<todayEvents.length; i++) {
            console.log(todayEvents[i]);
      }
      for(var i=0; i<futureEvents.length; i++) {
            console.log(futureEvents[i]);
      }
      console.log(todayDate.toISOString());
      console.log("Size todayEvents: "+todayEvents.length);
      console.log("Size futureEvents: "+futureEvents.length);
}

function monthToString(date) {
    var monthNr = date.substring(5,7);
    var month = "";
    if(monthNr == "01") {
        month = "Januar";
    } else if(monthNr == "02") {
        month = "Februar";
    } else if(monthNr == "03") {
        month = "Mars";
    } else if(monthNr == "04") {
        month = "April";
    } else if(monthNr == "05") {
        month = "Mai";
    } else if(monthNr == "06") {
        month = "Juni";
    } else if(monthNr == "07") {
        month = "Juli";
    } else if(monthNr == "08") {
        month = "August";
    } else if(monthNr == "09") {
        month = "September";
    } else if(monthNr == "10") {
        month = "Oktober";
    } else if(monthNr == "11") {
        month = "November";
    } else if(monthNr == "12") {
        month = "Desember";
    } else {
    }

    return month;
}

function stringToInt(date) {
    var start = date.substring(0,1);
    var numb;
    if(start == "0") {
        numb = parseInt(date.substring(1,2));
    } else {
         numb = parseInt(date.substring(0,2));
    }
    return numb;
}

function dayToString(date) {
    var dayNr = date.substring(8,10);
    var day = "";
    if(dayNr.substring(0,1) == "0") {
        day = dayNr.substring(1,2);
    } else {
        day = dayNr;
    }
    return day;
}

function stopslide() {
    $("#eventsToday").slick("unslick");
}

function slideshowToday() {
    $('#eventsToday').slick({
  autoplay: true,
  autoplaySpeed: 5000,
  fade: true,
  dots: true,
  arrows: false,
});
}

function slideshowFuture() {
    $('#eventsFuture').slick({
  autoplay: true,
  autoplaySpeed: 5000,
  fade: true,
  dots: true,
  arrows: false,
});
}









