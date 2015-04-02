/*
* Module dependencies
*/
var client = require("./client");
var options = require("./options")
var asutil = require("./asutil")

var EventEmitter = require('events').EventEmitter;

/*
function ASchema(asConfig, bins) {
    //create key
    var new_key = {
        ns: asConfig.namespace,
        set: asConfig.set,
        key: asConfig.key
    }
    //iteracte all bins and create corresponding datatypes

}

ASchema.prototype.__proto__ = EventEmitter.prototype;
*/
var aerospike = require('aerospike')
var policy = aerospike.policy;
var status = aerospike.status;

var ASchema = function(){
    //this.client = this.setClient(client)
    this.client = client
}

ASchema.prototype.__proto__ = EventEmitter.prototype;

ASchema.prototype.setKey = function(tag_key){
    this.key = tag_key
}

//get namespace 
ASchema.prototype.getNameSpace = function(){
    var local_key = this.key
    if(local_key)
        return local_key.ns 
    return null    
}

//get set
ASchema.prototype.getSetName = function(){
    var local_key = this.key

    if(local_key)
        return local_key.set
    return null    
}

ASchema.prototype.setBins = function(bins){
    //add type check if its dict 
    this.bins = bins
}

//var client = null;
ASchema.prototype.client = null

//array of methods
ASchema.prototype.methods = {}

ASchema.prototype.setClient = function(client){
    console.log("ASchema.prototype.setClient")
    console.log("client ", client)
    this.client = client;
}

ASchema.prototype.save = function( cb ){
    
    console.log("ASchema.prototype.save")
    
    var metadata = {
        //ttl: 10000,
        //gen: 0
        //send the keys, as queries may return digest and not keys
        key: policy.key.SEND
    }
    
    //add attributes that have been missed out as bins 
    this.addAttributesToBins()
    
    console.log("this.key ", this.key, "\nthis.bins ", this.bins, "\nmetadata", metadata)
    this.client.put(this.key, this.bins, metadata , function(err, key){
        
        switch(err.code){
            case status.AEROSPIKE_OK:
                console.log("\nsave - success: key ", key )
                
                break
            default:
                console.log('\nsave error: ', err.message)    
        }
        //if callback is set do call it , will this key contain digest
        if(cb)
            cb(err, key)
        
    })
}   

ASchema.prototype.get = function(cb){
    var parentThis = this
    this.client.get(this.key, function(err, rec, meta, key){
        console.log("get", rec)
        //populate bins
        parentThis.bins = rec
        
        //for now simply return 
        if(cb) cb(err, rec, meta, key)        
    })
}

//iterate over all attributes and set it to bins if not already set 
ASchema.prototype.addAttributesToBins = function(){
    for (propName in this){
        if(this.hasOwnProperty(propName)){
            //discard functions 
            if(typeof(this[propName] != 'function')){
                console.log("Missed property ", this[propName], " PROPERTY ", propName)
                //add it to existing bins
                if(propName == "client" || propName == "key" || 
                   propName == "bins" || propName == "set"){
                    //do nothing
                   }
                else{
                    console.log("this.bins", this.bins)
                    if(asutil.isDictEmpty(this.bins) ){
                        this.bins = {}    
                    }
                    this.bins[propName] = this[propName]
                   }   
                
            }
        }
        else{
            //not this objects property like toString etc
        }
    }
}

//set attributes from bins to object
ASchema.prototype.setAttributesFromBins = function(){
    for(propName in this.bins){
        if(propName){
            console.log("propName", propName, "this.bins[propName]", this.bins[propName])
            this[propName] = this.bins[propName]
        }
    }
}

//common functions across models 
//assumption is if keys are in place
function populateBins(parentThis, cb){
    console.log("populateBins")
    //this.bins.check will be the digest of the check set 
    //digest not supported in nodejs so using key name
    //var search_key = aerospike.key(options.namespace, parentThis.set, parentThis.bins.check)
    //find check is always for check set name
    var search_key = aerospike.key(options.namespace, options.checksetname, parentThis.bins.check)
    console.log("search_key", search_key)
    parentThis.client.get(search_key, function(err, record, metadata, key){
        console.log("client.get")
        switch (err.code){
            case status.AEROSPIKE_OK:
                console.log("OK - ", key, metadata, record)
                if(cb) cb(err, record)
            break
            case status.AEROSPIKE_ERR_RECORD_NOT_FOUND:
                console.log("NOT_FOUND  -", key)
                if(cb) cb(err)
            break
            default:
                console.log("ERR - ", key)
                if(cb) cb(err)
        }
        })
}

//Ping.prototype.methods.findCheck = function(cb){
//not using mongoose like methods dict for now
ASchema.prototype.findCheck = function(cb){
    console.log("ASchema.prototype.findCheck", this)
    
    var parentThis = this
    //check if check is not populated yet in bins
    console.log("this.bins",this.bins)
    if(!this.bins || !this.bins.check){
        this.get(function(err,bins){
            if(err.code == status.AEROSPIKE_OK){
                console.log("bins are not found and being set now")
                this.bins = bins
                populateBins(parentThis, cb)                
            }
            else{
                
            }
        })
    }
    else{
        populateBins(parentThis, cb)
    }
}

//statics
ASchema.prototype.find = function(searchOptions, callback){
    console.log("ASchema.find")
}

module.exports = ASchema;