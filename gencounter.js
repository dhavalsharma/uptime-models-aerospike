//use generation to get the generation counter, this will serve as auto-increment for check
var aeroSchema = require('./aschema')
var aerospike = require('aerospike')
var util = require("util")
var client = require("./client")
var options = require("./options")
//var wait=require('wait.for')

var policy = aerospike.policy;
var status = aerospike.status;
var operator = aerospike.operator;



var AutoIncrementModel = function(){
    //AutoIncrementModel.super_.call(this);
    console.log("AutoIncrementModel Constructor");
    this.client = client
}
//util.inherits(AutoIncrementModel, aeroSchema)
//key_type could be for ping table or for check table
AutoIncrementModel.prototype.getCounter = function(key_type, cb){
    if(!key_type)
        key_type = 'counter'
        
    //var key = aerospike.key(options.namespace, "generation", 'counter')
    var key = aerospike.key(options.namespace, options.countersetname, key_type)
    
    /*
    var autoincrement = new AutoIncrementModel()
    autoincrement.setKey(key)
    autoincrement.setBins({
        dummybin: 1
    })
    autoincrement.save()
    */
    //now get 
    //just touch
    var ops = [
        operator.touch()
    ]
    
    var parentThis = this;
    this.client.operate(key, ops, function(err, bins, metadata, key){
        switch ( err.code ) {
            case status.AEROSPIKE_OK:
                console.log("metadata ", metadata)
                if(cb) cb(err, metadata.gen)
                break

            case status.AEROSPIKE_ERR_RECORD_NOT_FOUND:
                console.error("Error: Not Found.")
                //put the record as this is the first time 
                var bins = {
                    dummy: 1
                };

                var metadata = {
                    gen: 1
                }
                
                parentThis.client.put(key, bins, metadata, function(err,key){
                    switch ( err.code ) {
                        case status.AEROSPIKE_OK:
                            if(cb) cb(err,  1)
                            break

                        default:
                            console.error("Error: " + err.message)
                            if(cb) cb(err, err)
                            break
                    }                    
                })
                
                break
                
            default:
                console.error("Error: " + err.message)
                if(cb) cb(err)
                break
        }
        
    })
}

/*
var autoIncrement = new AutoIncrementModel

var genCallBack = function(){
    var ret = wait.for(autoIncrement.getCounter)
    return ret
}
wait.launchFiber(genCallBack)
module.exports = autoIncrement.getCounter
//module.exports = genCallBack
*/

module.exports = AutoIncrementModel
