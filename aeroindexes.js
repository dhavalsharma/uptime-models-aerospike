//initialize all indexes for once

var client = require("./client");
var options = require("./options")

var aerospike = require('aerospike')
var policy = aerospike.policy;
var status = aerospike.status;


var AeroIndexes = function(){
    this.client = client
}

AeroIndexes.prototype.createPingIndexes = function(){
    //create indexes
    var options_index = {
        //ns: Ping.super_.prototype.getNameSpace(),
        //set: Ping.super_.prototype.getSetName()
        ns: options.namespace,
        set: options.pingsetname
    }
    var options_index_timestamp = options_index
    options_index_timestamp.bin = "timestamp"
    options_index_timestamp.index = "idx_" + options_index.ns + "_" + options_index.set + "_" + options_index_timestamp.bin
    
    this.client.createIntegerIndex(options_index_timestamp, function(err){
        if(err.code == status.AEROSPIKE_OK){
            console.log("Index created ", options_index_timestamp)
        }
        else{
            console.log("Index NOT created ", options_index_timestamp)
        }
    })
    
    var options_index_check = options_index
    options_index_check.bin = "check"
    options_index_check.index = "idx_" + options_index.ns + "_" + options_index.set + "_" + options_index_check.bin    
    
    this.client.createIntegerIndex(options_index_check, function(err){
        if(err.code == status.AEROSPIKE_OK){
            console.log("Index created ", options_index_check)
        }
        else{
            console.log("Index NOT created ", options_index_check)
        }
    })    
}

function generateIndexes(){
    var ai = new AeroIndexes
    ai.createPingIndexes()
}
generateIndexes()

module.exports = AeroIndexes