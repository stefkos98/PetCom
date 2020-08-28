var mongoose=require('mongoose');
var validator=require('validator');

var rasporedSchema=new mongoose.Schema({
spisaktermina:[{
    t:{
    type: mongoose.Schema.Types.ObjectId,
    ref : "Termin" }
}],
od:{
    type:Number,
    required:true
},
do:{
    type:Number,
    required:true}
});
module.exports=mongoose.model("Raspored",rasporedSchema);