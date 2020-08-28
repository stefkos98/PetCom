var mongoose=require('mongoose');
var bcrypt=require('bcryptjs');
var validator=require('validator');
var jwt = require('jsonwebtoken');
var passportLocalMongoose=require('passport-local-mongoose');

var vlasnikSchema=new mongoose.Schema({
tipkorisnika:{
    type:String,
    required:true
},
ime:{
    type:String,
    required:true,
    trim:true
},
prezime:{
    type:String,
    required:true,
    trim:true
},
username:{
    type:String,
    required:true,
    unique:true,
    trim:true
},
email:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true,
    validator(value){
        if(!validator.IsEmail(value))
            throw new Error('Email is invalid');
    }
},
password:{
    type:String,
    required:true,
    minlength:7
},
telefon:{
    type:String,
    required:true,
},
zakazanitermini:[{type:mongoose.Schema.Types.ObjectId,ref:"Termin"}],
kupovine:[{type:mongoose.Schema.Types.ObjectId,ref:"Kupovina"}],
Pitanje:[{type:mongoose.Schema.Types.ObjectId,ref:"Pitanje"}]
});

vlasnikSchema.pre('save', async function (next){
    if(this.isModified('password'))
        this.password= await bcrypt.hash(this.password,8);
    next();
})

vlasnikSchema.methods.getPublic = function() {
    const object=this.toObject();

    delete object.password;
    delete object.tokens;

    return object;
};

vlasnikSchema.statics.findByCredentials = async (email, password) => {
    const user=await vlasnik.findOne({email})

    if (!user)
        return null;
    
    const t= await bcrypt.compare(password,user.password)
    if (!t)
        return null;
    return user;
};
vlasnikSchema.plugin(passportLocalMongoose,{usernameField:"email"});
const vlasnik=mongoose.model("Vlasnik",vlasnikSchema);
module.exports=vlasnik;