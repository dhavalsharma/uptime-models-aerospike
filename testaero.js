var aerospike = require('aerospike');
//var aeroSchema = require("./aschema");
var status = aerospike.status;
var tagModel = require('./tag')
var pingModel = require('./ping')
var options = require("./options")
var checkModel = require('./check')
var client = require("./client")
var async = require("async")
var CheckEvent = require("./checkEvent")

/*
// Connect to the cluster.
var client = aerospike.client({
    hosts: [ { addr: '127.0.0.1', port: 3000 } ]
});

function connect_cb( err, client) {
    if (err.code == status.AEROSPIKE_OK) {
        console.log("Aerospike Connection Success")
    }
}

client.connect(connect_cb)
*/

//aeroSchema.setClient(client)
/*
var key = aerospike.key("test", "uptime", 'tag')
var tag = new tagModel()
//tag.setClient(client)
tag.setKey(key)
//tag.setClient(client)

tag.setBins({
    name: "time"
})

tag.save()
*/

/*
var ping = new pingModel()
console.log("PING CLIENT ", ping.client)
//ping.setClient(client)
console.log("setClient PING CLIENT ", ping.client)


var key = aerospike.key("test", "ping", 'ping:1')
ping.setKey(key)
//will it be set once

ping.setBins({
    //isUp: true// Boolean datatype is not supported
    isUp: 1
    //,check: "check_key"
})

ping.save()
*/
//var key_ping_find = aerospike.key(options.namespace, options.pingsetname, 'ping:1')
//var ping_find = new pingModel()
//ping_find.setKey(key_ping_find)

/*
var ping_find = new pingModel(24)
//populate bins
//ping_find.get(function(err, pingbins){
    //now find check
    ping_find.findCheck(function(err,check){
        console.log("test findCheck ", check, err)
        console.log("check.qos",check.qos)
    })    
//})
//*/
//find only by keyname
    
/*
// The key of the record we are reading.
var key = aerospike.key('test','demo','foo');

// Read the record from the database
client.get(key, function(err, rec, meta) {

    // Check for errors
    if ( err.code == status.AEROSPIKE_OK ) {
        // The record was successfully read.
        console.log(rec, meta);
    }
    else {
        // An error occurred
        console.error('error:', err);
    }
});
*/

/*
var check = new checkModel
check.tags = ["a"]//if not set gives error 
//ERROR(25292) [conversions.cc:754] [recordbins_from_jsobject] - Bin value passed for bin tags is undefined
//ERROR(25292) [put.cc:124] [prepare] - Parsing as_record(C structure) from record object failed
var now = Date.now();
pingModel.createForCheck("status", now, now, check, "populator", "dummy error", null, function(err, pingParam){
    console.log("pingModel.createForCheck returned", err, pingParam)
})    
//*/
/*
pingModel.cleanup(0, function(err){
    console.log("TEST pingModel.cleanup ", err)
})

var key = aerospike.key("test", "ping", 19)
client.get(key, function(err, rec, meta, key){
    console.log("GET TEST", rec, meta, key)
})
*/

///*
//create some sample checkevents 
function createCheckEvent(checkid, cb){
    ///var checkevent_key = aerospike.key(options.namespace, options.checkeventsetname, eventid)
    var checkEvent = new CheckEvent(null, function(err, key){
        checkEvent.check = checkid
        checkEvent.save(function(err,key){
            cb(err,checkEvent)
        })    
    })

}

var checkids = [56,38,53,35]
var events = []
async.forEach(checkids, function(checkid, callback){
    createCheckEvent(checkid, function(err, event){
        events.push(event)
        callback()
    })    
}, function(err){
    console.log("events", events)
    //now events has all events 
    CheckEvent.aggregateEventsByDay(events, function(err,res){
        console.log("res", res)
    })
}              
)

//*/

CheckEvent.find(null, function(err, results){
    console.log("TEST CheckEvent.find err ", err, "results", results)
    if(!err){
    
    }
})