var mongoose=require('mongoose');
var validator=require('validator');

var terminSchema=new mongoose.Schema({
sati:{
    type:Number,
    required:true
},
dan:{
    type:String,
    required:true
},
popunjen:{
    type:Boolean,
    required:true
},
podaci:{
    ime:{
        type:String
    },
    prezime:{
        type:String
    },
    opis:{
        type:String
    },
    telefon:{
        type:String
    }
}
});
module.exports=mongoose.model("Termin",terminSchema);