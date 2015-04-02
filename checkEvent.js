var aeroSchema = require('./aschema')
var util = require("util");
var gencounter = require("./gencounter")
var options = require("./options")
var aeroindexes = require('./aeroindexes')
var client = require("./client")
var asutil = require("./asutil")

var aerospike = require('aerospike')
var policy = aerospike.policy;
var status = aerospike.status;
var filter = aerospike.filter;

var CheckEvent = function(checkevent_key, callback){
    //call aschema constructor
    CheckEvent.super_.call(this);
    console.log("CheckEvent Constructor");
    
    if(checkevent_key){
        //create key from param
        this.key = aerospike.key(options.namespace, options.checkeventsetname, checkevent_key)
    }
    else{
        //auto generate the key 
        var parentThis = this
        var gen = new gencounter
        var err_msg = null
        gen.getCounter("checkevent", function(err, checkevent_key){
            if(checkevent_key){
                console.log("checkevent_key found", checkevent_key)
                parentThis.key = aerospike.key(options.namespace, options.checkeventsetname, checkevent_key)
                callback(err_msg, checkevent_key)
            }
            else{
                err_msg = "checkevent_key not found"
                console.log(err_msg)
                callback(err_msg, null)
            }
        })
    }
    //this.client = this.setClient(client)       
}

util.inherits(CheckEvent, aeroSchema)
//TODO need to write utility for converting to and from timestamp

CheckEvent.prototype.set = options.checkeventsetname
CheckEvent.prototype.findCheck = function(cb){
    //this will set the bins.check from this context instead of parents one
    CheckEvent.super_.prototype.findCheck.call(this)
    console.log("CheckEvent.prototype.findCheck")
}

//statics
CheckEvent.aggregateEventsByDay = function(events, callback) {
    // list checks concerned by all events
    if(!events){
        return callback("events not defined")
    }
    var checkIds = [];
    var checkIdsKeys = [];
    events.forEach(function(event) {
        var check = event.bins.check;
        if (checkIds.indexOf(check) == -1) {
            checkIds.push(check);
            var check_key = aerospike.key(options.namespace, options.checksetname, check)
            checkIdsKeys.push(check_key)
        }
    });

    //this.db.model('Check').find({ _id: { $in: checkIds } }).select({ _id: 1, name: 1, url: 1 
    client.batchGet(checkIdsKeys, function(err, checks){
        console.log("batchGet", checks)
        // populate related check for each event
        if (err) return callback(err);        
        var indexedChecks = {};
        checks.forEach(function(check) {
          indexedChecks[check._id] = check;
        });
        events.forEach(function(event, index) {
          console.log("event", event, "index", index)
          //event = event.toJSON(); // bypass mongoose's magic setters
          event.check = indexedChecks[event.check];
          //delete event.__v;
          //delete event._id;
          if (event.message == 'up') {
            delete event.details;
          }
          events[index] = event;
        });        
        
        // aggregate events by day
        var currentDay;
        var aggregatedEvents = {};
        var currentAggregate = [];
        events.forEach(function(event) {
          var date = new Date(event.timestamp).toLocaleDateString();
          if (date != currentDay) {
            currentDay = date;
            currentAggregate = aggregatedEvents[date] = [];
          }
          currentAggregate.push(event);
        });
        callback(null, aggregatedEvents);        
    })
};

//statics
CheckEvent.find = function(searchOptions, callback){
    console.log("CheckEvent.find")
    //get all and return in callback
    var count = 0;

	var scanoptions = { nobins:false, concurrent: true
                  // , select: ['i', 's'] 
                  }
    //var query = client.query(options.namespace, options.checkeventsetname, scanoptions );    
    var statement = {};
    statement.filters = []
    var query = client.query(options.namespace, options.checkeventsetname, statement);

	var stream = query.execute();

    var records = []
    
    stream.on('data', function(rec) {
		// process the scanned record here
		count++;
		//console.log(rec);
        records.push(rec)
    });

    stream.on('error', function(err){
        console.log(err);
        callback(err, null)
    });

    stream.on('end', function() {
        console.log('TOTAL SCANNED:', count++);
        callback(null, records)
    });

}


module.exports = CheckEvent