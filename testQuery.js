var aerospike = require('aerospike');
var status = aerospike.status;
var tagModel = require('./tag')
var pingModel = require('./ping')


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

//aeroSchema.setClient(client)

var key = aerospike.key("test", "uptime", 'tag')
var tag = new tagModel()
//tag.setClient(client)
tag.setKey(key)
tag.setClient(client)

tag.setBins({
    name: "time"
})

var save_callback = function(err, key){
    console.log("\nsave_callback err ", err, " key ", key)
    //now query using digest
    //var digest_key = aerospike.key(key.ns , key.set,"" ,key.digest)
    //console.log("\ndigest_key ", digest_key)
    var digest_key = aerospike.key(key.ns , key.set, key.key)
    tag.client.get(key, function(err, record, metadata, key_ret){
    //tag.client.get(digest_key, function(err, record, metadata, key_ret){
        switch (err.code){
            case status.AEROSPIKE_OK:
                console.log("OK - ", key, metadata, record)
            break
            case status.AEROSPIKE_ERR_RECORD_NOT_FOUND:
                console.log("NOT_FOUND  -", key)
            break
            default:
                console.log("ERR - ", key)
        }
        })
}

tag.save( save_callback )


