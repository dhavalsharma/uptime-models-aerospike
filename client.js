var aerospike = require('aerospike');
var status = aerospike.status;

// Connect to the cluster.
var client = aerospike.client({
    hosts: [ { addr: '127.0.0.1', port: 3000 } ]
    ,log: {level: 4 , file: 2}
});

function connect_cb( err, client) {
    if (err.code == status.AEROSPIKE_OK) {
        console.log("Aerospike Connection Success")
    }
}

client.connect(connect_cb)

module.exports = client