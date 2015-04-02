var aeroSchema = require('./aschema')
var aerospike = require('aerospike')
var policy = aerospike.policy;
var status = aerospike.status;
var util = require("util");
var filter = aerospike.filter;
var gencounter = require("./gencounter")
var options = require("./options")

var Check = function(){
    //call aschema constructor
    Check.super_.call(this);
    console.log("Check Constructor");
    
    //auto generate the key 
    var parentThis = this
    var gen = new gencounter
    gen.getCounter("check", function(err, check_key){
        if(check_key){
            parentThis.key = aerospike.key(options.namespace, options.checksetname, check_key)
        }
    })    
}

util.inherits(Check, aeroSchema)

Check.prototype.set = "check"

//default bins
Check.prototype.bins = {
    qos: {}
}

Check.prototype.setLastTest = function(status, time, error) {
    console.log("setLastTest")
}

module.exports = Check
 