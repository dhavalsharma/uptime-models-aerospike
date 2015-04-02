
var gencounter = require("./gencounter")
var wait=require('wait.for')

var gen = new gencounter

console.log("gencounter", gen.getCounter(function(err, gen){
//console.log("gencounter", gencounter(function(err,gen){
    console.log("gen", gen)
}))
//console.log("gencounter", gencounter)


/*
function test(){
    var ret = wait.forMethod(gen,'getCounter')
    console.log("gen", ret[0], ret[1])
}
wait.launchFiber(test)

console.log("test:",test())
*/