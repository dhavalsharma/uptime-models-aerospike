var Client = function(){
    this.host = 22
    this.port = 3000
}

Client.prototype.toString = function(){
    console.log("host: ", host, " port ", port)
}

var Schema = function(client) {
    console.log("Schema constructor ", client)
    this.client = client;
}

//function Foo() {};
//Schema.prototype.client = 2
Schema.prototype.client =  function(){
    console.log("Schema.prototype.client ")
    return this.client
}

Schema.prototype.bar = function () {
    //Foo.prototype.bar = function bar() {
    //console.trace();
}

//var f = new Foo()
//f.bar();

/*
var Tag = function() {}
Tag.prototype = new Schema()
Tag.prototype.constructor = Tag

console.log("Schema.client " + Schema.client)

var tag = new Tag()
console.log("tag.client " + tag.client)
*/
var client = new Client()
var Tag = new Schema(client)

tag = Tag
console.log("tag.client ", tag.client)

var ping = new Schema(client)
console.log("ping.client ", ping.client)

