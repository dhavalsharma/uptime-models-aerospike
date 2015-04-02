var aeroSchema = require('./aschema')

var util = require("util");
var client = require("./client");
var gencounter = require("./gencounter")
var checkModel = require('./check')
var options = require("./options")
var aeroindexes = require('./aeroindexes')
var asutil = require("./asutil")

var aerospike = require('aerospike')
var policy = aerospike.policy;
var status = aerospike.status;
var filter = aerospike.filter;

var Ping = function(ping_key){
    //call aschema constructor
    Ping.super_.call(this);
    console.log("Ping Constructor");
    
    if(ping_key){
        //create key from param
        this.key = aerospike.key(options.namespace, options.pingsetname, ping_key)
    }
    else{
        //auto generate the key 
        var parentThis = this
        var gen = new gencounter
        gen.getCounter("ping", function(err, ping_key){
            if(ping_key){
                parentThis.key = aerospike.key(options.namespace, options.pingsetname, ping_key)
            }
        })
    }
    //this.client = this.setClient(client)       
}

util.inherits(Ping, aeroSchema)
//TODO need to write utility for converting to and from timestamp

Ping.prototype.set = options.pingsetname
//default bins
Ping.prototype.bins = {
    timestamp: Date.now()
}

//find the check related to this
Ping.prototype.findCheck = function(cb){
    console.log("Ping.methods.findCheck", this)
    Ping.super_.prototype.findCheck.call(this)
}

function saveWithCheck(check_key, pingThis){
    var check_aero_key = new aerospike.key(options.namespace, options.checksetname, check_key)
    var check = new checkModel
    check.setKey(check_aero_key)
    var check_callback = function(err, key){
        console.log("check_callback ", err, key)
        //now save the ping object
        //call the base class save 
        pingThis.bins.check = check_key
        Ping.super_.prototype.save.apply(pingThis)
    }
    check.save(check_callback)
}

//how to save the digest of check in ths save 
Ping.prototype.save = function(){
    //create a check object 
    var check_key = this.bins.check
    console.log("Ping.save check ", check_key)
    var pingThis = this
    if (check_key){
        saveWithCheck(check_key, pingThis)
    }
    else{
        //check is not given, auto generate it 
        var gen = new gencounter
        gen.getCounter("check", function(err, check_key){
            console.log("gen", check_key)
            if(check_key){
                saveWithCheck(check_key, pingThis)
            }
        })
        
    }
}

Ping.prototype.setDetails = function(details){
    this.bins.details = details
}

//Ping.statics.createForCheck not using mongoose statics
Ping.createForCheck = function(status, timestamp, time, check, monitorName, error, details, callback) {
  console.log("Ping.createForCheck")
  
  //timestamp = timestamp || new Date();
  //timestamp = timestamp instanceof Date ? timestamp : new Date(parseInt(timestamp, 10));
  timestamp = timestamp || new Date.now();

  var ping = new this();
  ping.timestamp = timestamp;
  ping.isUp = status;
  if (status && check.maxTime) {
    //as boolean is not supported
    ping.isResponsive = time < check.maxTime ? 1 : 0;
  } else {
    //ping.isResponsive = false;
    ping.isResponsive = 0;  
  }
  ping.time = time;
  ping.check = check;
  ping.tags = check.tags;
  ping.monitorName = monitorName;
  if (!status) {
    ping.downtime = check.interval || 60000;
    ping.error = error;
  }
    
  if (details) {
    ping.setDetails(JSON.parse(details));
  }
    
  ping.save(function(err1) {
    if (err1) return callback(err1);
    check.setLastTest(status, timestamp, error);
    check.save(function(err2) {
      if (err2) return callback(err2);
      callback(null, ping);
    });
  });
    
};

//statics method
Ping.cleanup = function(maxAge, callback) {
    console.log("Ping.cleanup")
    //var oldestDateToKeep = new Date(Date.now() - (maxAge ||  3 * 31 * 24 * 60 * 60 * 1000));
    //get timestamp from epoch
    var oldestDateToKeep = new Date(Date.now() - (maxAge ||  3 * 31 * 24 * 60 * 60 * 1000)).getTime();
    //var oldestDateToKeep = 1427871767129
    console.log("oldestDateToKeep", oldestDateToKeep)
    
    //can this be range query from epoch to oldestDateToKeep
    //this.find({ timestamp: { $lt: new Date(oldestDateToKeep) } }).remove(callback);
    var statement = {};
    statement.filters = [filter.range("timestamp", 0, oldestDateToKeep)]
    var query = client.query(options.namespace, options.pingsetname, statement)
    var stream = query.execute()
    
    var count = 0
    stream.on('data', function(rec) {
        //process the record here
        count++;
        console.log("stream rec", rec)
        //if key is returned then remove it 
        if(!asutil.isDictEmpty(rec.key) ){
            //TODO check if key is rec.key or if rec.key.key
            var remove_key = aerospike.key(options.namespace, options.pingsetname, rec.key)
            client.remove(remove_key, function(err, key){
                console.log("ping removed key", key)
            })
        }
        else{
            console.log("rec.key not found")
        }
    });

    stream.on('error', function(err){
        console.log("at error");
        console.log(err);
    });

    stream.on('end', function() {
        console.log('TOTAL QUERIED:', count++);

    });  
  
};

module.exports = Ping