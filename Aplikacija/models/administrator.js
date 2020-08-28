var mongoose=require('mongoose');
var bcrypt=require('bcryptjs');
var validator=require('validator');
var jwt = require('jsonwebtoken');
var passportLocalMongoose=require('passport-local-mongoose');

var administratorSchema=new mongoose.Schema(
{tipkorisnika:{
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
odobren:Number,
email:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true,
    validator(value){
        if(!validator.IsEmail(value))
            throw new Error('Email is invalid')
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
}

});

administratorSchema.pre('save', async function (next){
    if(this.isModified('password'))
        this.password= await bcrypt.hash(this.password,8)
    next()
});

administratorSchema.methods.getPublic = function() {
    const object=this.toObject();

    delete object.password;
    delete object.tokens;

    return object;
};

administratorSchema.statics.findByCredentials = async (email, password) => {
    const user=await administrator.findOne({email})

    if (!user)
        return null;
    
    const t= await bcrypt.compare(password,user.password)
    if (!t)
        return null;
    return user;
};
administratorSchema.plugin(passportLocalMongoose,{usernameField:"email"});

const administrator=mongoose.model("Administrator",administratorSchema);
module.exports=administrator;