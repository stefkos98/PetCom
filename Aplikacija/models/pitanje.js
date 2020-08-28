var mongoose=require('mongoose');
var validator=require('validator');

var pitanjeSchema=new mongoose.Schema({
korisnik:{type: mongoose.Schema.Types.ObjectId,
    ref : "Korisnik" },
sadrzajpitanja:{
    type:String,
    required:true
},
vreme:Date,
prikazano:{
    type:Boolean,
    required:true
},
odgovori:[{type:mongoose.Schema.Types.ObjectId,ref:"Odgovor"}]
});
module.exports=mongoose.model("Pitanje",pitanjeSchema);