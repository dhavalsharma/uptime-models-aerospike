var aeroSchema = require('./aschema')
var aerospike = require('aerospike')
var policy = aerospike.policy;
var status = aerospike.status;
var util = require("util");
var client = require("./client");
    
//var Tag = function(client){
//    return new aeroSchema(client)
//}

var Tag = function(){
    //call aschema constructor
    Tag.super_.call(this);
    console.log("Tag Constructor");
    //this.client = this.setClient(client)
}

//Tag.prototype.__proto__ = aeroSchema.prototype
//Tag.prototype = aeroSchema.prototype
util.inherits(Tag, aeroSchema)

Tag.prototype.set = "tag"

/*
Tag.bins = {
  name           : "",//String,
  firstTested    : "",//Date,
  lastUpdated    : "",//Date,
  count          : 0,//Number,
  availability   : 0,//Number,
  responsiveness : 0,//Number,
  responseTime   : 0,//Number,
  downtime       : 0,//Number,
  outages        : [],//Array,
}

Tag.key = {
    a_namespace: "test",
    a_set: "uptime",
    a_key: "one",
}

Tag.setKey = function(tag_key){
    this.key = tag_key;
}

Tag.setBins = function(bins){
    //add type check if its dict 
    this.bins = bins;
}

Tag.client = null;

Tag.setClient = function(client){
    console.log("client ", client)
    this.client = client;
}

Tag.save = function(){
    
    var metadata = {
        ttl: 10000,
        gen: 0
    };    
    console.log("this.key ", this.key, " this.bins ", this.bins)
    this.client.put(this.key, this.bins, {} , function(err, key){
        
        switch(err.code){
            case status.AEROSPIKE_OK:
                console.log("save - success: key ", key )
                break
            default:
                console.log('save error: ', err.message)    
        }
        
    })
}
*/
module.exports = Tag;