//var ASchema = require("aschema");
//var Ping = new ASchema();

var aerospike = require('aerospike')
var policy = aerospike.policy;
var status = aerospike.status;

var tag = require("./tag")

config = {
    hosts: [{
        addr: '127.0.0.1', port: 3000
    }]
}

var client = aerospike.client(config)

function connect_cb(err, client){
    if(err.code == status.AEROSPIKE_OK){
        console.log("aerospike connection - success")
    }
    else{
        console.log('connect error: ', err)
    }
}

client.connect(connect_cb)

var my_tag = new tag()

var key = aerospike.key("test", "uptime", 'tag')
tag.setKey(key)
tag.setClient(client)

tag.setBins({
    name: "timmerd"
})

tag.save()