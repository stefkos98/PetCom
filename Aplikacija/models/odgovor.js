var mongoose=require('mongoose');
var validator=require('validator');

var odgovorSchema=new mongoose.Schema({
idveterinara:{type: mongoose.Schema.Types.ObjectId,
    ref : "Veterinar" },
sadrzajodgovora:{
    type:String,
    required:true
},
vreme:Date});
module.exports=mongoose.model("Odgovor",odgovorSchema);