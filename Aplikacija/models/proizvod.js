var mongoose=require('mongoose');
var validator=require('validator');

var proizvodSchema=new mongoose.Schema({
ime:{
    type:String,
    required:true,
},
kolicina:{
    type:Number,
    required:true,
},
cena:{
    type:Number,
    required:true,
},
akcija:Boolean,
akcijskacena:Number,
vremedodavanja:Date,
opis:String,
kategorija:{
    type:String,
    required:true,
},
tip:{
    type:String,
    required:true,
},
url:String
});
module.exports=mongoose.model("Proizvod",proizvodSchema);