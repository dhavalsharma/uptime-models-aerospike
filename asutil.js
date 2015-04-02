var ASUtil = function(){}

ASUtil.isDictEmpty = function(obj){
    for(var i in obj){
        //if attribute found
        return false
    }
    return true
}
module.exports = ASUtil