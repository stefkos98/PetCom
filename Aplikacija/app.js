// PROMENLJIVE
var proizvodi, proizvodiakcija, veterinari, termini, prodavci, administratori, vlasnici;
var cron = require("node-cron");
//EXPRESS
var express = require('express');
var app = express();
// za konvertovanje string query u json
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var bcrypt = require('bcryptjs');
var fs = require("fs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//MIDDLEWARE
var auth = require('./middleware/auth');
var UlogovanOdobren = auth.fja0;
var authVlasnik = auth.fja1;
var authVeterinar = auth.fja2;
var authAdministrator = auth.fja3;
var authProdavac = auth.fja4;
var authVlasnikVeterinar = auth.fja5;
var Ulogovan = auth.fja6;
var authRezervacija = auth.fja7;
var authProdavacProdavnica = auth.fja8;
var authProdavacProdavnica1 = auth.fja9;
var authAdministratorIzmena = auth.fja10;
var authVeterinarIzmena = auth.fja11;
var authProdavacIzmena = auth.fja12;
var authVlasnikIzmena = auth.fja13;
var authVeterinarAdministrator = auth.fja14;
var authProdavacAdministrator = auth.fja15;
var authVlasnikAdministrator = auth.fja16;
var authVeterinarIzmenaRasporeda = auth.fja17;
var authVeterinarOdgovor = auth.fja18;
var authVlasnikPitanje = auth.fja19;
var authVlasnikBrisePitanje = auth.fja20;
var authBrisanjeOdgovora = auth.fja21;

// FOLDER ZA CSS, JS I DRUGE FAJLOVE
app.use(express.static("public"));
// FLASH poruke
app.use(require('express-session')({ secret: "Passport do pobede", resave: false, saveUninitialized: false }));
var flash = require('connect-flash'); // za prikaz flash poruka niste ulogovani itd(kad se uradi i logovanje)
app.use(flash());
//  FLASH poruke vidljive svim metodama
app.use((req, res, next) => {
    res.locals.message = req.flash("success");
    res.locals.error = req.flash("error");
    next();

});
// ZA DELETE I PUT METODE
var methodOverride = require('method-override'); // za delete i put http metode
app.use(methodOverride("_method"));
// KONEKCIJA SA BAZOM
var mongoose = require('mongoose');
mongoose.connect("mongodb+srv://<username>:<password>@cluster0-hqhmi.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true }); // onlajn baza
mongoose.set('useCreateIndex', true);
var validator = require('validator');

// SEME
var Veterinar = require('./models/veterinar');
var Administrator = require('./models/administrator');
var Vlasnik = require('./models/vlasnik');
var Prodavac = require('./models/prodavac');
var Pitanje = require('./models/pitanje');
var Odgovor = require('./models/odgovor');
var Raspored = require('./models/raspored');
var Termin = require('./models/termin');
var Proizvod = require('./models/proizvod');
var Prodavnica = require('./models/prodavnica');
var Kupovina = require('./models/kupovina');

// PASSPORT VERZIJA
var passport = require('passport');
var localStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
const { find } = require("./models/vlasnik");
app.use(passport.initialize());
app.use(passport.session());
// PASSPORT SERIJALIZACIJA I DESERIJALIZACIJA USERA
passport.serializeUser(function (user, done) {
    return done(null, user);
});
passport.deserializeUser(function (user, done) {
    if (user != null)
        return done(null, user);
});
// PASSPORT LOKALNE STRATEGIJE
passport.use('veterinarlocal', new localStrategy({ usernameField: 'email' }, function (username, password, done) {
    Veterinar.findOne({ email: username }, async function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const t = await bcrypt.compare(password, user.password)
        if (!t) return done(null, false, { message: 'Incorrect password' });
        return done(null, user);
    });
}));
passport.use('vlasniklocal', new localStrategy({ usernameField: 'email' }, function (username, password, done) {
    Vlasnik.findOne({ email: username }, async function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const t = await bcrypt.compare(password, user.password)
        if (!t) return done(null, false, { message: 'Incorrect password' });
        return done(null, user);
    });
}));
passport.use('prodavaclocal', new localStrategy({ usernameField: 'email' }, function (username, password, done) {
    Prodavac.findOne({ email: username }, async function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const t = await bcrypt.compare(password, user.password)
        if (!t) return done(null, false, { message: 'Incorrect password' });
        return done(null, user);
    });
}));
passport.use('administratorlocal', new localStrategy({ usernameField: 'email' }, function (username, password, done) {
    Administrator.findOne({ email: username }, async function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const t = await bcrypt.compare(password, user.password)
        if (!t) return done(null, false, { message: 'Incorrect password' });
        return done(null, user);
    });
}));
// PASSPORT RUTE ZA LOGIN I REGISTER
app.get("/login", function (req, res) {
    if (req.user != undefined) {
        req.flash("error", "Vec ste ulogovani");
        res.redirect("/");
    }
    else res.render('login.ejs', { user: req.user });
});
app.post('/login', passport.authenticate(["vlasniklocal", "veterinarlocal", "prodavaclocal", "administratorlocal"], { successRedirect: "/", failureRedirect: "/login" }), (req, res) => { });

app.get('/logout', (req, res) => { req.logout(); req.flash("success", "Uspesna odjava"); res.redirect('/') });

app.get("/register", (req, res) => {
    if (req.user != undefined) {
        req.flash("error", "Vec ste ulogovani");
        res.redirect("/");
    }
    res.render("registration.ejs", { user: req.user });
});

app.post("/register", async function (req, res) {
    if (req.user != undefined) {
        req.flash("error", "Vec ste ulogovani");
        res.redirect("/");
    }
    var postojiemail = await Veterinar.findOne({ email: req.body.email });
    if (!postojiemail)
        postojiemail = await Vlasnik.findOne({ email: req.body.email });
    if (!postojiemail)
        postojiemail = await Administrator.findOne({ email: req.body.email });
    if (!postojiemail)
        postojiemail = await Prodavac.findOne({ email: req.body.email });
    var postojiusername = await Veterinar.findOne({ username: req.body.username });
    if (!postojiusername)
        postojiusername = await Vlasnik.findOne({ username: req.body.username });
    if (!postojiusername)
        postojiusername = await Administrator.findOne({ username: req.body.username });
    if (!postojiusername)
        postojiusername = await Prodavac.findOne({ username: req.body.username });

    if (!validator.isEmail(req.body.email) || postojiemail) {
        req.flash("error", "Email nije validan!");
        res.redirect("/register");
    }
    else {

        if (postojiusername) {
            req.flash("error", "Vec postoji korisnik sa tim username-om, izaberite drugi!");
            res.redirect("/register");
        }
        else {
            var pattern = /^06\d{7,8}$/;
            if (pattern.test(req.body.telefon) == false) {
                req.flash("error", "Pogresan format telefona!");
                res.redirect("/register");
            }
            else {
                var user = new Vlasnik({ tipkorisnika: req.body.tip, ime: req.body.ime, prezime: req.body.prezime, username: req.body.username, email: req.body.email, password: req.body.password, telefon: req.body.telefon });
                if (req.body.tip == "veterinar") {
                    var r = new Raspored();
                    for (var l = 0; l < 56; l++) {
                        if (l % 7 == 0) d = "Ponedeljak";
                        if (l % 7 == 1) d = "Utorak";
                        if (l % 7 == 2) d = "Sreda";
                        if (l % 7 == 3) d = "Cetvrtak";
                        if (l % 7 == 4) d = "Petak";
                        if (l % 7 == 5) d = "Subota";
                        if (l % 7 == 6) d = "Nedelja";
                        if (l >= 0 && l <= 6) s = 8;
                        if (l >= 7 && l <= 13) s = 9;
                        if (l >= 14 && l <= 20) s = 10;
                        if (l >= 21 && l <= 27) s = 11;
                        if (l >= 28 && l <= 34) s = 12;
                        if (l >= 35 && l <= 41) s = 13;
                        if (l >= 42 && l <= 48) s = 14;
                        if (l >= 49 && l <= 55) s = 15;
                        var s, d;
                        var t = new Termin({ sati: s, dan: d, popunjen: false });
                        await t.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: t._id });
                    }
                    r.od = 8;
                    r.do = 16;
                    await r.save();
                    user = new Veterinar({ tipkorisnika: req.body.tip, ime: req.body.ime, prezime: req.body.prezime, username: req.body.username, odobren: 0, email: req.body.email, password: req.body.password, idrasporeda: r._id, ambulanta: req.body.ambulanta, adresa: req.body.adresa, telefon: req.body.telefon });
                }
                if (req.body.tip == "administrator") {
                    user = new Administrator({ tipkorisnika: req.body.tip, ime: req.body.ime, prezime: req.body.prezime, username: req.body.username, odobren: 0, email: req.body.email, password: req.body.password, telefon: req.body.telefon });
                }
                if (req.body.tip == "prodavac") {
                    user = new Prodavac({ tipkorisnika: req.body.tip, ime: req.body.ime, prezime: req.body.prezime, username: req.body.username, odobren: 0, email: req.body.email, password: req.body.password, telefon: req.body.telefon });
                }
                    await user.save();
                    req.flash("success", "Uspesna registracija, sada se mozete ulogovati!");
                    res.redirect("/");
                }
            }
        }
});

app.get("/", function (req, res) {
    res.render("home.ejs", { user: req.user });
});

app.get("/showproducts", async function (req, res) {
    var psi = await Proizvod.find({ kategorija: "Psi" });
    var macke = await Proizvod.find({ kategorija: "Macke" });
    var ptice = await Proizvod.find({ kategorija: "Ptice" });
    var malezivotinje = await Proizvod.find({ kategorija: "Male Zivotinje" });
    var proizvodi = [];
    var proizvodiakcija = [];
    if (psi.length > 0) {
        if (psi.length == 1) {
            if (psi[0].akcija == false) {
                proizvodi.push(psi[0]);
            }
            else {
                proizvodiakcija.push(psi[0]);
            }
        }
        else {
            var x = await Proizvod.find({ kategorija: "Psi", akcija: false });
            if (x.length > 0) {
                let nadjen = false;
                while (!nadjen) {
                    var broj = Math.floor(Math.random() * psi.length);
                    if (psi[broj].akcija == false) {
                        proizvodi.push(psi[broj]);
                        nadjen = true;
                    }
                }
            }
            x = await Proizvod.find({ kategorija: "Psi", akcija: true });
            if (x.length > 0) {
                nadjen = false;
                while (!nadjen) {
                    var broj = Math.floor(Math.random() * psi.length);
                    if (psi[broj].akcija == true) {
                        proizvodiakcija.push(psi[broj]);
                        nadjen = true;
                    }
                }
            }
        }
    }
    if (macke.length > 0) {
        if (macke.length == 1) {
            if (macke[0].akcija == false) {
                proizvodi.push(macke[0]);
            }
            else {
                proizvodiakcija.push(macke[0]);
            }
        }
        else {
            var x = await Proizvod.find({ kategorija: "Macke", akcija: false });
            if (x.length > 0) {
                let nadjen = false;
                while (!nadjen) {
                    var broj = Math.floor(Math.random() * macke.length);
                    if (macke[broj].akcija == false) {
                        proizvodi.push(macke[broj]);
                        nadjen = true;
                    }
                }
            }
            var x = await Proizvod.find({ kategorija: "Macke", akcija: true });
            if (x.length > 0) {
                {
                    nadjen = false;
                    while (!nadjen) {
                        var broj = Math.floor(Math.random() * macke.length);
                        if (macke[broj].akcija == true) {
                            proizvodiakcija.push(macke[broj]);
                            nadjen = true;
                        }
                    }
                }
            }
        }
    }
    if (ptice.length > 0) {
        if (ptice.length == 1) {
            if (ptice[0].akcija == false) {
                proizvodi.push(ptice[0]);
            }
            else {
                proizvodiakcija.push(ptice[0]);
            }
        }
        else {
            var x = await Proizvod.find({ kategorija: "Ptice", akcija: false });
            if (x.length > 0) {
                let nadjen = false;
                while (!nadjen) {
                    var broj = Math.floor(Math.random() * ptice.length);
                    if (ptice[broj].akcija == false) {
                        proizvodi.push(ptice[broj]);
                        nadjen = true;
                    }
                }
            }
            var x = await Proizvod.find({ kategorija: "Ptice", akcija: true });
            if (x.length > 0) {
                nadjen = false;
                while (!nadjen) {
                    var broj = Math.floor(Math.random() * ptice.length);
                    if (ptice[broj].akcija == true) {
                        proizvodiakcija.push(ptice[broj]);
                        nadjen = true;
                    }
                }
            }
        }
    }
    if (malezivotinje.length > 0) {

        if (malezivotinje.length == 1) {
            if (malezivotinje[0].akcija == false) {
                proizvodi.push(malezivotinje[0]);
            }
            else {
                proizvodiakcija.push(malezivotinje[0]);
            }
        }
        else {
            var x = await Proizvod.find({ kategorija: "Male Zivotinje", akcija: false });
            if (x.length > 0) {
                let nadjen = false;
                while (!nadjen) {
                    var broj = Math.floor(Math.random() * malezivotinje.length);
                    if (malezivotinje[broj].akcija == false) {
                        proizvodi.push(malezivotinje[broj]);
                        nadjen = true;
                    }
                }
            }
            var x = await Proizvod.find({ kategorija: "Male Zivotinje", akcija: true });
            if (x.length > 0) {
                nadjen = false;
                while (!nadjen) {
                    var broj = Math.floor(Math.random() * malezivotinje.length);
                    if (malezivotinje[broj].akcija == true) {
                        proizvodiakcija.push(malezivotinje[broj]);
                        nadjen = true;
                    }
                }
            }
        }
    }
    res.render("showproducts.ejs", { proizvodi: proizvodi, proizvodiakcija: proizvodiakcija, user: req.user });
});
app.get("/products/:id", (req, res) => {
    Proizvod.findById(req.params.id, (err, proizvod) => {
        res.render("showproduct.ejs", { proizvod: proizvod, user: req.user });
    });
});
app.get("/products/show/:kategorija", async (req, res) => {

    var rezultattip = await Proizvod.find({ kategorija: req.params.kategorija });
    var x = await Prodavnica.find({});
    var broj = req.query.brojfilter;
    if (req.query.prodavnicafilter != undefined && req.query.prodavnicafilter != '0') {
        var proizvodiizprodavnice = await Prodavnica.findOne({ ime: req.query.prodavnicafilter });
        var rezultattip2 = [];
        for (var i = 0; i < rezultattip.length; i++) {
            if (proizvodiizprodavnice.proizvodi.indexOf(rezultattip[i]._id) > -1) {
                rezultattip2.push(rezultattip[i]);
            }
        }
        rezultattip = rezultattip2;
    }
    if (broj == undefined) {
        broj = 10;
    }
    if (broj == 6) {
        broj = rezultattip.length;
    }
    var sort = req.query.sortfilter;
    if (sort != undefined) {
        switch (sort) {
            case '0': {

                res.render("showproductscategory.ejs", {
                    proizvodi: rezultattip, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '1': {
                for (var i = 0; i < rezultattip.length; i++) {
                    var temp;
                    for (var j = i + 1; j < rezultattip.length; j++) {
                        if (rezultattip[i].cena > rezultattip[j].cena) {
                            temp = rezultattip[i];
                            rezultattip[i] = rezultattip[j];
                            rezultattip[j] = temp;
                        }
                    }
                }
                res.render("showproductscategory.ejs", {
                    proizvodi: rezultattip, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '2': {
                for (var i = 0; i < rezultattip.length; i++) {
                    var temp;
                    for (var j = i + 1; j < rezultattip.length; j++) {
                        if (rezultattip[i].cena < rezultattip[j].cena) {
                            temp = rezultattip[i];
                            rezultattip[i] = rezultattip[j];
                            rezultattip[j] = temp;
                        }
                    }
                }

                res.render("showproductscategory.ejs", {
                    proizvodi: rezultattip, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '3': {
                rezultattip.sort((a, b) => a.ime.localeCompare(b.ime));
                res.render("showproductscategory.ejs", {
                    proizvodi: rezultattip, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '4': {
                rezultattip.sort((a, b) => b.ime.localeCompare(a.ime));
                res.render("showproductscategory.ejs", {
                    proizvodi: rezultattip, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '5': {
                const sortedActivities = rezultattip.sort((a, b) => b.vremedodavanja - a.vremedodavanja);
                res.render("showproductscategory.ejs", {
                    proizvodi: sortedActivities, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '6': {
                const sortedActivities = rezultattip.sort((a, b) => a.vremedodavanja - b.vremedodavanja);
                res.render("showproductscategory.ejs", {
                    proizvodi: sortedActivities, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
        }
    }
    else {
        sort = 0;
        res.render("showproductscategory.ejs", {
            proizvodi: rezultattip, prodavnicee: x,
            user: req.user, kategorija: req.params.kategorija, broj: broj, sort: sort, prod: req.query.prodavnicafilter
        });
    }

});
app.get("/products/show/:kategorija/:tip", async (req, res) => {
    var rezultattip = await Proizvod.find({ kategorija: req.params.kategorija, tip: req.params.tip });
    var x = await Prodavnica.find({});
    var broj = req.query.brojfilter;
    if (req.query.prodavnicafilter != undefined && req.query.prodavnicafilter != '0') {
        var proizvodiizprodavnice = await Prodavnica.findOne({ ime: req.query.prodavnicafilter });
        var rezultattip2 = [];
        for (var i = 0; i < rezultattip.length; i++) {
            if (proizvodiizprodavnice.proizvodi.indexOf(rezultattip[i]._id) > -1) {
                rezultattip2.push(rezultattip[i]);
            }
        }
        rezultattip = rezultattip2;
    }
    if (broj == undefined) {
        broj = 10;
    }
    if (broj == 6) {
        broj = rezultattip.length;
    }
    var sort = req.query.sortfilter;
    if (sort != undefined) {
        switch (sort) {
            case '0': {

                res.render("showproductstype.ejs", {
                    proizvodi: rezultattip, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, tip: req.params.tip, broj: broj, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '1': {
                for (var i = 0; i < rezultattip.length; i++) {
                    var temp;
                    for (var j = i + 1; j < rezultattip.length; j++) {
                        if (rezultattip[i].cena > rezultattip[j].cena) {
                            temp = rezultattip[i];
                            rezultattip[i] = rezultattip[j];
                            rezultattip[j] = temp;
                        }
                    }
                }
                res.render("showproductstype.ejs", {
                    proizvodi: rezultattip, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, tip: req.params.tip, broj: broj, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '2': {
                for (var i = 0; i < rezultattip.length; i++) {
                    var temp;
                    for (var j = i + 1; j < rezultattip.length; j++) {
                        if (rezultattip[i].cena < rezultattip[j].cena) {
                            temp = rezultattip[i];
                            rezultattip[i] = rezultattip[j];
                            rezultattip[j] = temp;
                        }
                    }
                }

                res.render("showproductstype.ejs", {
                    proizvodi: rezultattip, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, tip: req.params.tip, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '3': {
                rezultattip.sort((a, b) => a.ime.localeCompare(b.ime));
                res.render("showproductstype.ejs", {
                    proizvodi: rezultattip, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, tip: req.params.tip, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '4': {
                rezultattip.sort((a, b) => b.ime.localeCompare(a.ime));
                res.render("showproductstype.ejs", {
                    proizvodi: rezultattip, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, broj: req.params.tip, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '5': {
                const sortedActivities = rezultattip.sort((a, b) => b.vremedodavanja - a.vremedodavanja);
                res.render("showproductstype.ejs", {
                    proizvodi: sortedActivities, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, broj: broj, tip: req.params.tip, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
            case '6': {
                const sortedActivities = rezultattip.sort((a, b) => a.vremedodavanja - b.vremedodavanja);
                res.render("showproductstype.ejs", {
                    proizvodi: sortedActivities, prodavnicee: x,
                    user: req.user, kategorija: req.params.kategorija, tip: req.params.tip, broj: broj, sort: sort, prod: req.query.prodavnicafilter
                }); break;
            }
        }
    }
    else {
        sort = 0;
        res.render("showproductstype.ejs", {
            proizvodi: rezultattip, prodavnicee: x,
            user: req.user, kategorija: req.params.kategorija, tip: req.params.tip, broj: broj, sort: sort, prod: req.query.prodavnicafilter
        });
    }
});
app.get('/showvets', async function (req, res) {
    var broj = req.params.broj;
    if (broj == undefined)
        broj = 10;
    veterinari = await Veterinar.find({});
    var vet = [];
    for (v of veterinari) {
        if (v.odobren == '1' && vet == undefined) vet = v;
        if (v.odobren == '1' && vet != undefined) vet = vet.concat(v);
    }
    if (broj == 6)
        broj = veterinari.length;
    res.render("showvets.ejs", { veterinari: vet, user: req.user, broj: broj });
});

app.get('/showvets/:broj', async function (req, res) {
    var broj = req.params.broj;
    if (broj == undefined)
        broj = 10;
    veterinari = await Veterinar.find({});
    var vet = [];
    for (v of veterinari) {
        if (v.odobren == '1' && vet == undefined) vet = v;
        if (v.odobren == '1' && vet != undefined) vet = vet.concat(v);
    }
    if (broj == 6)
        broj = veterinari.length;
    res.render("showvets.ejs", { veterinari: vet, user: req.user, broj: broj });
});

app.post('/showvets', async function (req, res) {
    veterinari = await Veterinar.find({});
    var vet = [];
    for (v of veterinari) {
        if (v.odobren == '1' && vet == undefined) vet = v;
        if (v.odobren == '1' && vet != undefined) vet = vet.concat(v);
    }
    broj = veterinari.length;
    res.redirect("/showvets/" + broj);
});

app.get('/showvets/calendar/:id', async function (req, res) {
    let ter = new Array(98);
    for (var w = 0; w < 98; w++)
        ter[w] = undefined;
    var danas = new Date();
    var d = danas.getDay();
    var dan = new Array(7);
    dan[0] = "Nedelja";
    dan[1] = "Ponedeljak";
    dan[2] = "Utorak";
    dan[3] = "Sreda";
    dan[4] = "Cetvrtak";
    dan[5] = "Petak";
    dan[6] = "Subota";

    if (req.params.id != undefined) {
        await Raspored.findById(req.params.id).populate('spisaktermina.t').exec(async (err, raspored) => {
            if (raspored.spisaktermina != undefined) {
                for (var e of raspored.spisaktermina) {
                    var k = e.t;
                    if (k && k.dan == dan[d]) ter[(k.sati - 8) * 7 + 0] = k;
                    if (k && k.dan == dan[(d + 1) % 7]) ter[(k.sati - 8) * 7 + 1] = k;
                    if (k && k.dan == dan[(d + 2) % 7]) ter[(k.sati - 8) * 7 + 2] = k;
                    if (k && k.dan == dan[(d + 3) % 7]) ter[(k.sati - 8) * 7 + 3] = k;
                    if (k && k.dan == dan[(d + 4) % 7]) ter[(k.sati - 8) * 7 + 4] = k;
                    if (k && k.dan == dan[(d + 5) % 7]) ter[(k.sati - 8) * 7 + 5] = k;
                    if (k && k.dan == dan[(d + 6) % 7]) ter[(k.sati - 8) * 7 + 6] = k;
                }
            }
            var vet = await Veterinar.findOne({ idrasporeda: req.params.id });
            res.render("calendar.ejs", { veterinar: vet, dan: dan, d, user: req.user, t: ter, idrasporeda: req.params.id, });
        });
    }
    else {
        var vet = await Veterinar.findOne({ idrasporeda: req.params.id });
        res.render("calendar.ejs", { veterinar: vet, dan: dan, d, user: req.user, t: ter, idrasporeda: req.params.id, });
    }
});

app.put("/rezervisi/:id/:idrasporeda", authRezervacija, async function (req, res) {
    var vlasnik = req.user;
    await Raspored.findById(req.params.idrasporeda).populate('spisaktermina.t').exec(async (err, raspored) => {
        if (raspored.spisaktermina != undefined) {
            var ter;
            for (var e of raspored.spisaktermina) {
                ter = e.t;
                if (ter && ter.dan == req.body.dan && ter.sati == req.body.vreme && ter.popunjen == false) {
                    ter.podaci.opis = req.body.opis;
                    ter.podaci.ime = vlasnik.ime;
                    ter.podaci.prezime = vlasnik.prezime;
                    ter.podaci.telefon = vlasnik.telefon;
                    vlasnik.zakazanitermini = vlasnik.zakazanitermini.concat(ter._id);
                    await Vlasnik.findByIdAndUpdate(req.params.id, vlasnik)
                    break;
                }
                if (ter && ter.dan == req.body.dan && ter.sati == req.body.vreme && ter.popunjen == true) {
                    break;
                }
            }
            if (ter.dan != req.body.dan || ter.sati != req.body.vreme) {
                req.flash("error", "Taj termin je van radnog vremena!");
                res.redirect('/showvets/calendar/' + req.params.idrasporeda);
            }
            else {
                if (ter.dan == req.body.dan && ter.sati == req.body.vreme && ter.popunjen == true) {
                    req.flash("error", "Taj termin je zauzet!");
                    res.redirect('/showvets/calendar/' + req.params.idrasporeda);
                }
                else {
                    ter.popunjen = true
                    await ter.save();

                    var user = await Vlasnik.findById(req.params.id);
                    req.login(user, function (err) {
                        if (err) return next(err)
                    });
                    req.flash("success", "Uspesna rezervacija!");
                    res.redirect('/showvets/calendar/' + req.params.idrasporeda);
                }
            }
        }
    });
});

app.put("/rezervisi/:idrasporeda", async function (req, res) {
    req.flash("error", "Ulogujte se kao vlasnik da biste rezervisali termin!");
    res.redirect('back');
});

app.get("/forum", async (req, res) => {

    await Pitanje.find({}).populate({ path: 'odgovori', populate: { path: 'idveterinara' } }).exec(async (err, Pitanja) => {

        if (Pitanja.length == 0)
            Pitanja = undefined;
        if (!err) {
            res.render("forum.ejs", { user: req.user, Pitanja: Pitanja });
        } else { console.log(err) }
    });

});

app.get("/profile", UlogovanOdobren, async function (req, res) {
    veterinari = await Veterinar.find({});
    prodavci = await Prodavac.find({});
    vlasnici = await Vlasnik.find({});
    administratori = await Administrator.find({});
    var nevet = [];
    var neprod = [];
    var neadm = [];
    if (req.user.tipkorisnika == 'administrator') {
        administratori = administratori.filter((a) => {
            return a.username != req.user.username;
        });

        for (v of veterinari) {
            if (v.odobren == '0' && nevet == undefined) nevet = v;
            if (v.odobren == '0' && nevet != undefined) nevet.push(v);
        }
        for (p of prodavci) {
            if (p.odobren == '0' && neprod == undefined) neprod = p;
            if (p.odobren == '0' && neprod != undefined) neprod.push(p);
        }
        for (a of administratori) {
            if (a.odobren == '0' && neadm == undefined) neadm = a;
            if (a.odobren == '0' && neadm != undefined) neadm.push(a);
        }
        res.render("profile_administrator.ejs", { vet: veterinari, prod: prodavci, vlasnici, adm: administratori, nevet, neprod, neadm, user: req.user });
    }
    if (req.user.tipkorisnika == 'prodavac') {

        await Prodavac.findOne({ email: req.user.email }).populate("prodavnice").exec(function (err, prodavac) {
            res.render("profile_prodavac.ejs", { user: req.user, prodavnice: prodavac.prodavnice });

        });
    }
    if (req.user.tipkorisnika == 'veterinar') {
        var ter = new Array(98);
        for (var w = 0; w < 98; w++)
            ter[w] = undefined;
        var danas = new Date();
        var d = danas.getDay();
        var dan = new Array(7);
        dan[0] = "Nedelja";
        dan[1] = "Ponedeljak";
        dan[2] = "Utorak";
        dan[3] = "Sreda";
        dan[4] = "Cetvrtak";
        dan[5] = "Petak";
        dan[6] = "Subota";

        if (req.user.idrasporeda != undefined) {
            await Raspored.findById(req.user.idrasporeda).populate('spisaktermina.t').exec(async (err, raspored) => {
                if (raspored.spisaktermina != undefined) {
                    for (var e of raspored.spisaktermina) {
                        var k = e.t;
                        if (k && k.dan == dan[d]) ter[(k.sati - 8) * 7 + 0] = k;
                        if (k && k.dan == dan[(d + 1) % 7]) ter[(k.sati - 8) * 7 + 1] = k;
                        if (k && k.dan == dan[(d + 2) % 7]) ter[(k.sati - 8) * 7 + 2] = k;
                        if (k && k.dan == dan[(d + 3) % 7]) ter[(k.sati - 8) * 7 + 3] = k;
                        if (k && k.dan == dan[(d + 4) % 7]) ter[(k.sati - 8) * 7 + 4] = k;
                        if (k && k.dan == dan[(d + 5) % 7]) ter[(k.sati - 8) * 7 + 5] = k;
                        if (k && k.dan == dan[(d + 6) % 7]) ter[(k.sati - 8) * 7 + 6] = k;
                    }
                }
                res.render("profile_veterinar.ejs", { user: req.user, dan, d, t: ter, idrasporeda: req.user.idrasporeda, raspored: raspored });
            });
        }
        else {
            res.render("profile_veterinar.ejs", { user: req.user, dan, d, t: ter, idrasporeda: req.user.idrasporeda, raspored: undefined });
        }
    }
    if (req.user.tipkorisnika == 'vlasnik') {
        var termini = req.user.zakazanitermini
        let p = [];
        let v = [];
        var rasp = undefined
        var rasporedi = await Raspored.find({})

        for (var t of termini) {
            var ter = await Termin.findById(t)

            for (var r of rasporedi) {
                var spisak = r.spisaktermina;
                var s
                for (s of spisak) {
                    if (s.t != null && s.t.equals(t))
                        break;
                }
                if (s.t != null && s.t.equals(t)) {
                    rasp = r;
                    break;
                }
            }
            if (rasp != undefined) {
                p.push(ter)
                var veterinar = await Veterinar.findOne({ idrasporeda: rasp._id })
                v.push(veterinar)
            }
        }
        let nizKupovinaProizvodi = [];

        await Vlasnik.findById(req.user._id).populate({ path: 'kupovine', populate: { path: 'proizvodi' } }).exec(async (err, vlasnik) => {
            if (p.length == 0) {
                p = undefined;
            }
            if (vlasnik.kupovine.length == 0) {
                nizKupovinaProizvodi = undefined;
            }
            else {
                nizKupovinaProizvodi.push(vlasnik.kupovine)
            }
            res.render("profile_vlasnik.ejs", { user: req.user, nizKupovinaProizvodi: nizKupovinaProizvodi, termini: p, veterinari: v });
        })
    }
});
// GET METODA ZA DODAVANJE NOVE PRODAVNICE
app.get("/profile/prodavac/prodavnica/new", authProdavac, async (req, res) => {
    res.render("addprodavnica.ejs", { user: req.user });
})
// POST METODA ZA CUVANJE NOVE PRODAVNICE
app.post("/profile/prodavac/prodavnica", authProdavac, async (req, res) => {
    console.log(req.body.ime);
    if (req.body.ime == "" || req.body.adresa == "" || req.body.ime == undefined || req.body.adresa == undefined) {
        req.flash("error", "Morate popuniti sva polja");
        res.redirect("/profile/prodavac/prodavnica/new");
    }
    else {
        await Prodavac.findById(req.user._id).populate("prodavnice").exec(async (err, prodavac) => {
            if (err) console.log(err);
            else {
                await Prodavnica.create({ "ime": req.body.ime, "adresa": req.body.adresa, "telefon": prodavac.telefon }, async function (err, prodavnica) {
                    if (err) {
                        console.log("Error");
                        req.flash("error", "Prodavnica nije sacuvana u bazi");
                    }
                    else {
                        prodavac.prodavnice.push(prodavnica);
                        await prodavac.save();
                        req.flash("success", "Prodavnica je uspesno dodata u bazu");
                        res.redirect('/profile');
                    }
                });
            }
        });
    }
})
// PRIKAZ PROIZVODA JEDNE PRODAVNICE
app.get("/profile/prodavac/prodavnica/:id/proizvodi", authProdavacProdavnica, async (req, res) => {
    if (Object.keys(req.query).length === 0 && req.query.constructor === Object) { res.locals.query = 0; }
    else {
        res.locals.query = 1;
    }
    await Proizvod.find({}, async (err, proizvods) => {
        var kategorija = req.query.kategorijafilter;
        var tip = req.query.tipfilter;
        var broj = req.query.brojfilter;
        if (broj == undefined) {
            broj = 10;
        }
        var sort = req.query.sortfilter;
        var rezultatkategorija = [];
        // FILTRIRANJE PO KATEGORIJI
        if (kategorija != undefined && kategorija != "0") {
            for (var i = 0; i < proizvods.length; i++) {
                if (proizvods[i].kategorija == kategorija) {
                    rezultatkategorija.push(proizvods[i]);
                }
            }
        }
        if (kategorija == undefined) {
            kategorija = 0;
            rezultatkategorija = proizvods;
        }
        // FILTRIRANJE PO TIPU
        var rezultattip = [];
        if (tip != undefined && tip != "0") {

            for (var i = 0; i < rezultatkategorija.length; i++) {
                if (rezultatkategorija[i].tip == tip) {
                    rezultattip.push(rezultatkategorija[i]);
                }
            }
        }
        if (tip == undefined) {
            tip = 0;
            rezultattip = rezultatkategorija;
        }
        var proizvodiizprodavnice = await Prodavnica.findOne({ _id: req.params.id });
        var ime = proizvodiizprodavnice;
        var rezultattip2 = [];
        for (var i = 0; i < rezultattip.length; i++) {
            if (proizvodiizprodavnice.proizvodi.indexOf(rezultattip[i]._id) > -1) {
                rezultattip2.push(rezultattip[i]);
            }
        }
        rezultattip = rezultattip2;
        //AKO JE PRIKAZI SVE
        if (broj == 6) {
            broj = rezultattip.length;
        }
        if (sort != undefined) {
            switch (sort) {
                case '0': {

                    res.render("profile_prodavac_prodavnica_proizvodi.ejs", { user: req.user, proizvodi: rezultattip, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnica: ime });
                    break;
                }
                case '1': {
                    for (var i = 0; i < rezultattip.length; i++) {
                        var temp;
                        for (var j = i + 1; j < rezultattip.length; j++) {
                            if (rezultattip[i].cena > rezultattip[j].cena) {
                                temp = rezultattip[i];
                                rezultattip[i] = rezultattip[j];
                                rezultattip[j] = temp;
                            }
                        }
                    }
                    console.log(rezultattip);
                    res.render("profile_prodavac_prodavnica_proizvodi.ejs", { user: req.user, proizvodi: rezultattip, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnica: ime });
                    break;
                }
                case '2': {
                    for (var i = 0; i < rezultattip.length; i++) {
                        var temp;
                        for (var j = i + 1; j < rezultattip.length; j++) {
                            if (rezultattip[i].cena < rezultattip[j].cena) {
                                temp = rezultattip[i];
                                rezultattip[i] = rezultattip[j];
                                rezultattip[j] = temp;
                            }
                        }
                    }

                    res.render("profile_prodavac_prodavnica_proizvodi.ejs", { user: req.user, proizvodi: rezultattip, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnica: ime });
                    break;
                }
                case '3': {
                    rezultattip.sort((a, b) => a.ime.localeCompare(b.ime));
                    res.render("profile_prodavac_prodavnica_proizvodi.ejs", { user: req.user, proizvodi: rezultattip, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnica: ime });
                    break;
                }
                case '4': {
                    rezultattip.sort((a, b) => b.ime.localeCompare(a.ime));
                    res.render("profile_prodavac_prodavnica_proizvodi.ejs", { user: req.user, proizvodi: rezultattip, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnica: ime });
                    break;
                }
                case '5': {
                    const sortedActivities = rezultattip.sort((a, b) => b.vremedodavanja - a.vremedodavanja);
                    res.render("profile_prodavac_prodavnica_proizvodi.ejs", { user: req.user, proizvodi: rezultattip, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnica: ime });
                    break;
                }
                case '6': {
                    const sortedActivities = rezultattip.sort((a, b) => a.vremedodavanja - b.vremedodavanja);
                    res.render("profile_prodavac_prodavnica_proizvodi.ejs", { user: req.user, proizvodi: rezultattip, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnica: ime });
                    break;
                }
            }
        }
        else {
            sort = 0;
            res.render("profile_prodavac_prodavnica_proizvodi.ejs", { user: req.user, proizvodi: rezultattip, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnica: ime });
        }
    });
})
//PRIKAZ STRANICE ZA EDITOVANJE PODATAKA O JEDNOJ PRODAVNICI
app.get("/profile/prodavac/prodavnica/:id/edit", authProdavacProdavnica, async (req, res) => {
    var prodavnica = await Prodavnica.findById(req.params.id);
    res.render("editprodavnica.ejs", { user: req.user, prodavnica: prodavnica });
});
// PROMENA PODATAKA O PRODAVNICI 
app.put("/profile/prodavac/prodavnica/:id", authProdavacProdavnica, async (req, res) => {
    function isBlank(str) {
        return (!str || /^\s*$/.test(str));
    }
    if (req.body.ime.length == 0 || req.body.adresa.length == 0) {
        req.flash("error", "Morate popuniti sva polja");
        res.redirect("/profile/prodavac/prodavnica/" + req.params.id + "/edit");
    }
    else {
        await Prodavnica.findByIdAndUpdate(req.params.id, { ime: req.body.ime, adresa: req.body.adresa }, { upsert: true, new: true }, async (err, camp) => {
            if (err) {
                req.flash("error", "Doslo je do greske prilikom cuvanja promena");
                res.redirect('/profile');
            }
            else {
                req.flash("success", "Uspesno azuriranje podataka");
                res.redirect('/profile');
            }

        });
    }
});
// DODAVANJE NOVOG PROIZVODA U PRODAVNICU
app.get("/prodavnica/:id/addproduct", authProdavacProdavnica, async (req, res) => {
    res.render("addproizvod.ejs", { user: req.user, prodavnica: req.params.id });
})
// POST METODA ZA DODAVANJE PROIZVODA U PRODAVNICU
app.post("/prodavnica/:id", authProdavacProdavnica, async (req, res) => {
    await Prodavnica.findById(req.params.id).populate("proizvodi").exec(async (err, prodavnica) => {
        if (err) console.log(err);
        else {
            if (req.body.ime == "" || req.body.kolicina == "" || req.body.cena == "" || (req.body.akcija == "on" && req.body.akcijskacena == "") ||
                req.body.opis == "" || req.body.url == "") {
                req.flash("error", " Niste popunili sva polja");
                res.redirect("/prodavnica/" + req.params.id + "/addproduct");
            }
            else {
                var currentDate = new Date(Date.now()).toISOString();
                var check;
                if (req.body.akcija == "on") {
                    check = true;
                    if (req.body.akcijskacena > req.body.cena) {
                        req.flash("error", "Akcijska cena mora biti manja od aktuelne cene");
                        res.redirect("/prodavnica/" + req.params.id + "/addproduct");
                    }
                    else {
                        await Proizvod.create({
                            "ime": req.body.ime, "kolicina": req.body.kolicina, "cena": req.body.cena, "akcija": check,
                            "akcijskacena": req.body.akcijskacena, "vremedodavanja": currentDate, "opis": req.body.opis, "kategorija": req.body.kategorija, "tip": req.body.tip, "url": req.body.url,
                        }, async function (err, proizvod) {
                            if (err) {
                                console.log("Error");
                                req.flash("error", "Proizvod nije sacuvan u bazi");
                            }
                            else {
                                prodavnica.proizvodi.push(proizvod);
                                await prodavnica.save();
                                req.flash("success", "Proizvod je uspesno dodat u bazu");
                                res.redirect('/profile/prodavac/prodavnica/' + req.params.id + '/proizvodi');
                            }
                        });
                    }
                }

                else {
                    check = false;
                    await Proizvod.create({
                        "ime": req.body.ime, "kolicina": req.body.kolicina, "cena": req.body.cena, "akcija": check,
                        "vremedodavanja": currentDate, "opis": req.body.opis, "kategorija": req.body.kategorija, "tip": req.body.tip, "url": req.body.url,
                    }, async function (err, proizvod) {
                        if (err) {
                            console.log("Error");
                            req.flash("error", "Proizvod nije sacuvan u bazi");
                        }
                        else {
                            prodavnica.proizvodi.push(proizvod);
                            await prodavnica.save();
                            req.flash("success", "Proizvod je uspesno dodat u bazu");
                            res.redirect('/profile/prodavac/prodavnica/' + req.params.id + '/proizvodi');
                        }
                    });
                }
            }
        }
    });
});
// GET METODA ZA PRIKAZ STRANICE ZA EDITOVANJE PROIZVODA
app.get("/profile/prodavac/prodavnica/:idprodavnica/proizvodi/:id/edit", authProdavacProdavnica1, async (req, res) => {
    var proizvod = await Proizvod.findById(req.params.id);
    res.render("editproizvod.ejs", { user: req.user, prodavnica: req.params.idprodavnica, proizvod: proizvod });
});
// PUT METODA ZA PROMENU PODATAKA O PROIZVODIMA
app.put("/profile/prodavac/prodavnica/:idprodavnica/proizvodi/:id", authProdavacProdavnica1, async (req, res) => {
    if (req.body.ime == "" || req.body.kolicina == "" || req.body.cena == "" || (req.body.akcija == "on" && req.body.akcijskacena == "") ||
        req.body.opis == "" || req.body.url == "") {
        req.flash("error", "Morate popuniti sva polja");
        res.redirect("/profile/prodavac/prodavnica/" + req.params.idprodavnica + "/proizvodi" + req.params.id + "/edit");
    }
    else {
        var currentDate = new Date(Date.now()).toISOString();
        var check;
        if (req.body.akcija == "on") {
            check = true;
            await Proizvod.findByIdAndUpdate(req.params.id, {
                "ime": req.body.ime, "kolicina": req.body.kolicina, "cena": req.body.cena, "akcija": check,
                "akcijskacena": req.body.akcijskacena, "vremedodavanja": currentDate, "opis": req.body.opis, "kategorija": req.body.kategorija, "tip": req.body.tip, "url": req.body.url
            }, { upsert: true, new: true },
                async (err, camp) => {
                    if (err) {
                        req.flash("error", "Doslo je do greske prilikom cuvanja promena");
                        res.redirect("/profile/prodavac/prodavnica/" + req.params.idprodavnica + "/proizvodi" + req.params.id + "/edit");
                    }
                    else {
                        req.flash("success", "Uspesno azuriranje podataka");
                        res.redirect('/profile/prodavac/prodavnica/' + req.params.idprodavnica + '/proizvodi');
                    }

                });
        }
        else {
            check = false;
            await Proizvod.findByIdAndUpdate(req.params.id, {
                $unset: { akcijskacena: "" },
                "ime": req.body.ime, "kolicina": req.body.kolicina, "cena": req.body.cena, "akcija": check,
                "vremedodavanja": currentDate, "opis": req.body.opis, "kategorija": req.body.kategorija, "tip": req.body.tip, "url": req.body.url
            }, { upsert: true, new: true },
                async (err, camp) => {
                    if (err) {
                        req.flash("error", "Doslo je do greske prilikom cuvanja promena");
                        res.redirect("/profile/prodavac/prodavnica/" + req.params.idprodavnica + "/proizvodi" + req.params.id + "/edit");
                    }
                    else {
                        req.flash("success", "Uspesno azuriranje podataka");
                        res.redirect('/profile/prodavac/prodavnica/' + req.params.idprodavnica + '/proizvodi');
                    }

                });
        }
    }
});
// BRISANJE JEDNOG PROIZVODA IZ JEDNE PRODAVNICE
app.delete("/profile/prodavac/prodavnica/:idprodavnica/proizvodi/:idproizvod", authProdavacProdavnica1, async function (req, res) {
    await Prodavnica.findByIdAndUpdate(req.params.idprodavnica, { $pull: { 'proizvodi': req.params.idproizvod } });
    await Proizvod.findByIdAndDelete(req.params.idproizvod, async (err, proizvod) => {
        if (err) {
            req.flash("error", "Proizvod nije obrisan iz prodavnice");
            res.redirect('/profile/prodavac/prodavnica/' + req.params.idprodavnica + '/proizvodi');
        }
        else {
            req.flash("success", "Proizvod je uspesno obrisan iz prodavnice");
            res.redirect('/profile/prodavac/prodavnica/' + req.params.idprodavnica + '/proizvodi');

        }
    });
})
// BRISANJE JEDNE PRODAVNICE
app.delete("/profile/prodavac/prodavnica/:id", authProdavacProdavnica, async (req, res) => {
    var prodavnica = await Prodavnica.findById(req.params.id);
    for (var i = 0; i < prodavnica.proizvodi.length; i++) {
        await Proizvod.findByIdAndDelete(prodavnica.proizvodi[i]);
    }
    await Prodavnica.findByIdAndDelete(req.params.id);
    await Prodavac.findByIdAndUpdate(req.user._id, { $pull: { 'prodavnice': req.params.id } }, async (err, proizvod) => {
        if (err) {
            req.flash("error", "Prdavnica nije uspesno obrisana");
            res.redirect('/profile');
        }
        else {
            req.flash("success", "Prodavnica je uspesno obrisana");
            res.redirect('/profile');

        }
    });
});

app.delete("/profile/veterinar/:id", authVeterinarAdministrator, async (req, res) => {
    var v = await Veterinar.findById(req.params.id);
    if (v) var r = await Raspored.findById(v.idrasporeda);
    else {
        req.flash("error", "Nije pronadjen veterinar");
        res.redirect("/profile");
    }
    var ter = r.spisaktermina;
    for (var p of ter) {
        var vlasnici = await Vlasnik.find({});
        for (var vlas of vlasnici) {
            await Vlasnik.findByIdAndUpdate(vlas._id, { $pull: { 'zakazanitermini': p.t } });
        }
        await Termin.findByIdAndDelete(p.t);
    }
    await Raspored.findByIdAndDelete(v.idrasporeda);
    await Veterinar.findByIdAndDelete(req.params.id);
    req.flash("success","Uspesno ste obrisali nalog veterinara");
    if (req.user._id===req.params.id) {
        req.logout();
        res.redirect("/");
    }
    else{
    res.redirect("/profile");
    }
});

app.delete("/profile/vlasnik/:id", authVlasnikAdministrator, async (req, res) => {
    var v = await Vlasnik.findById(req.params.id);
    var kup = v.kupovine;
    for (var k of kup) {
        await Kupovina.findByIdAndDelete(k);
    }
    var ter = v.zakazanitermini;
    for (var t of ter) {
        var termin = await Termin.findById(t);
        if (termin) {
            termin.podaci.opis = "";
            termin.podaci.ime = "";
            termin.podaci.prezime = "";
            termin.popunjen = false;
            await termin.save();
        }
    }
    await Vlasnik.findByIdAndDelete(req.params.id);
    req.flash("success","Uspesno ste obrisali nalog vlasnika");

    if (req.user._id===req.params.id) {
        req.logout();
        res.redirect("/");
    }
    else{
    res.redirect("/profile");
    }
});

app.delete("/profile/administrator/:id", authAdministrator, async (req, res) => {
    var administratori = await Administrator.find({});
    administratori = administratori.filter((a) => {
        return a.odobren == 1;
    });
    if (administratori.length <= 1) {
        req.flash("error", "Vi ste jedini odobren administrator, ne mozete obrisati nalog!");
        res.redirect("/profile");
    }
    await Administrator.findByIdAndDelete(req.params.id);
    req.flash("success","Uspesno ste obrisali nalog administratora");
    if (req.user._id===req.params.id) {
        req.logout();
        res.redirect("/");
    }
    else{
    res.redirect("/profile");
    }
});
// BRISANJE NALOGA PRODAVCA
app.delete("/profile/prodavac/:id", authProdavacAdministrator, async (req, res) => {

    var p = await Prodavac.findById(req.params.id);
    var prod = p.prodavnice;
    for (var t of prod) {
        var t1 = await Prodavnica.findById(t);
        var proizvodi = t1.proizvodi;
        for (var i of proizvodi) {
            await Proizvod.findByIdAndDelete(i);
        }
        await Prodavnica.findByIdAndDelete(t);
    }
    await Prodavac.findByIdAndDelete(req.params.id);
    req.flash("success","Uspesno ste obrisali nalog prodavca");
    if (req.user._id===req.params.id) {
        req.logout();
        res.redirect("/");
    }
    else{
    res.redirect("/profile");
    }
});

app.put("/profile/odobrivet/:id", authAdministrator, async (req, res) => {
    var x = await Veterinar.findById(req.params.id);
    x.odobren = "1";
    await Veterinar.findByIdAndUpdate(req.params.id, x);
    res.redirect("/profile");
});

app.put("/profile/odobriadm/:id", authAdministrator, async (req, res) => {
    var x = await Administrator.findById(req.params.id);
    x.odobren = "1";
    await Administrator.findByIdAndUpdate(req.params.id, x);
    res.redirect("/profile");
});

app.put("/profile/odobriprod/:id", authAdministrator, async (req, res) => {
    var x = await Prodavac.findById(req.params.id);
    x.odobren = "1";
    await Prodavac.findByIdAndUpdate(req.params.id, x);
    res.redirect("/profile");
});

app.put("/profile/administrator/edit/:id", authAdministratorIzmena, async (req, res) => {
    var x = req.user;
    var postojiemail = undefined;
    if (x.email != req.body.email) {
        postojiemail = await Veterinar.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Vlasnik.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Administrator.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Prodavac.findOne({ email: req.body.email });
    }
    var postojiusername = undefined;
    if (x.username != req.body.username) {
        postojiusername = await Veterinar.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Vlasnik.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Administrator.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Prodavac.findOne({ username: req.body.username });
    }

    if (!validator.isEmail(req.body.email) || postojiemail) {
        req.flash("error", "Email nije validan!");
        res.redirect("/profile");
    }
    else {
        if (postojiusername) {
            req.flash("error", "Vec postoji korisnik sa tim username-om, izaberite drugi!");
            res.redirect("/profile");
        }
        else {
            x = await Administrator.findById(req.params.id);
            x.ime = req.body.ime;
            x.prezime = req.body.prezime;
            x.username = req.body.username;
            x.email = req.body.email;
            x.telefon = req.body.telefon;
            const t = await bcrypt.compare(req.body.password, x.password);
            if (!t) {
                req.flash("error", "Uneli ste pogresnu sifru. Podaci nisu promenjeni!");
                res.redirect("/profile");
            }
            else {
                if (req.body.password2 != "") {
                    x.password = await bcrypt.hash(req.body.password2, 8);
                }
                await Administrator.findByIdAndUpdate(req.params.id, x);
                var user = await Administrator.findById(req.params.id);
                req.login(user, function (err) {
                    if (err) return next(err)
                });
                req.flash("success", "Uspesno ste izmenili podatke!");
                res.redirect("/profile");
            }
        }
    }
});

//fje za veterinara
app.put("/profile/veterinar/edit/:id", authVeterinarIzmena, async (req, res) => {
    var x = await Veterinar.findById(req.params.id);
    var postojiemail = undefined;
    if (x.email != req.body.email) {
        postojiemail = await Veterinar.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Vlasnik.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Administrator.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Prodavac.findOne({ email: req.body.email });
    }
    var postojiusername = undefined;
    if (x.username != req.body.username) {
        postojiusername = await Veterinar.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Vlasnik.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Administrator.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Prodavac.findOne({ username: req.body.username });
    }

    if (!validator.isEmail(req.body.email) || postojiemail) {
        req.flash("error", "Email nije validan!");
        res.redirect("/profile");
    }
    else {
        if (postojiusername) {
            req.flash("error", "Vec postoji korisnik sa tim username-om, izaberite drugi!");
            res.redirect("/profile");
        }
        else {
            x = await Veterinar.findById(req.params.id);
            x.ime = req.body.ime;
            x.prezime = req.body.prezime;
            x.username = req.body.username;
            x.email = req.body.email;
            x.telefon = req.body.telefon;
            x.ambulanta=req.body.ambulanta;
            x.adresa=req.body.adresa;
            const t = await bcrypt.compare(req.body.password, x.password);
            if (!t) {
                req.flash("error", "Uneli ste pogresnu sifru. Podaci nisu promenjeni!");
                res.redirect("/profile");
            }
            else {
                if (req.body.password2 != "") {
                    x.password = await bcrypt.hash(req.body.password2, 8);
                }
                await Veterinar.findByIdAndUpdate(req.params.id, x);
                var user = await Veterinar.findById(req.params.id);
                req.login(user, function (err) {
                    if (err) return next(err)
                });
                req.flash("success", "Uspesno ste izmenili podatke!");
                res.redirect("/profile");
            }
        }
    }
});

app.put('/promenitermin/:idrasporeda', authVeterinarIzmenaRasporeda, async (req, res) => {
    await Raspored.findById(req.params.idrasporeda).populate('spisaktermina.t').exec(async (err, raspored) => {
        if (raspored.spisaktermina != undefined) {
            var p = undefined;
            for (var e of raspored.spisaktermina) {
                var t = e.t;
                if (t != null && t.sati == req.body.vreme && t.dan == req.body.dan) {
                    p = t;
                    break;
                }
            }
            if (req.body.tip == 'Zakazi') {
                if (p == undefined) {
                    p = new Termin({ sati: req.body.vreme, dan: req.body.dan, popunjen: true });
                    await p.save();
                    var ras = await Raspored.findById(req.params.idrasporeda);
                    ras.spisaktermina = ras.spisaktermina.concat({ t: p._id });
                    await Raspored.findByIdAndUpdate(ras._id, ras);
                    req.flash("success", "Uspesno ste zakazali termin!");
                }
                else {
                    if (p.popunjen == false) {
                        p.popunjen = true;
                        p.podaci.ime = "";
                        p.podaci.prezime = "";
                        p.podaci.opis = "";
                        p.podaci.telefon = "";
                        await p.save();
                        req.flash("success", "Uspesno ste zakazali termin!");
                    }
                    else {
                        req.flash("error", "Termin je vec zauzet!");
                    }
                }
            }
            if (req.body.tip == 'Oslobodi') {
                if (p == undefined) {
                    p = new Termin({ sati: req.body.vreme, dan: req.body.dan, popunjen: false });
                    await p.save();
                    var ras = await Raspored.findById(req.params.idrasporeda);
                    ras.spisaktermina = ras.spisaktermina.concat({ t: p._id });
                    await Raspored.findByIdAndUpdate(ras._id, ras);
                    req.flash("success", "Uspesno ste oslobodili termin!");
                }
                else {
                    if (p.popunjen == false) {
                        req.flash("success", "Termin je vec slobodan!");
                    }
                    else {
                        p.popunjen = false; //p._id
                        var vlasnicii = await Vlasnik.find({});
                        var n = false;
                        for (var v of vlasnicii) {
                            var zak = v.zakazanitermini;
                            for (var z of zak) {
                                if (z.equals(p._id)) {
                                    n = true;
                                    break;
                                }
                            }
                            if (n == true) {
                                zak = zak.filter(x => !x.equals(p._id));
                                v.zakazanitermini = zak;
                                await Vlasnik.findByIdAndUpdate(v._id, v);
                                break;
                            }
                        }
                        p.podaci.ime = "";
                        p.podaci.prezime = "";
                        p.podaci.telefon = "";
                        p.podaci.opis = "";
                        await p.save();
                        req.flash("success", "Uspesno ste oslobodili termin!");
                    }
                }
            }
            if (req.body.tip == 'Neradan') {
                if (p == undefined) {
                    req.flash("success", "Ovaj termin je vec neradan!");
                }
                else {
                    if (p.popunjen == false) {
                        var ras = await Raspored.findById(req.params.idrasporeda);
                        ras.spisaktermina = await ras.spisaktermina.filter(x => x.t != null && !x.t.equals(p._id));
                        await Raspored.findByIdAndUpdate(ras._id, ras);
                        await Termin.findByIdAndDelete(p._id);
                        req.flash("success", "Uspesna promena!");
                    }
                    else {
                        var vlasnicii = await Vlasnik.find({});
                        var n = false;
                        for (var v of vlasnicii) {
                            var zak = v.zakazanitermini;
                            for (var z of zak) {
                                if (z.equals(p._id)) {
                                    n = true;
                                    break;
                                }
                            }
                            if (n == true) {
                                zak = await zak.filter(x => !x.equals(p._id));
                                v.zakazanitermini = zak;
                                await Vlasnik.findByIdAndUpdate(v._id, v);
                                break;
                            }
                        }
                        var ras = await Raspored.findById(req.params.idrasporeda);
                        ras.spisaktermina = await ras.spisaktermina.filter(x => x.t != null && !x.t.equals(p._id));
                        await Raspored.findByIdAndUpdate(ras._id, ras);
                        await Termin.findByIdAndDelete(p._id);
                        req.flash("success", "Uspesno ste otkazali termin!");
                    }
                }
            }
            res.redirect("/profile");
        }
    });
});

app.put("/profile/veterinar/radnovreme/:idrasporeda", authVeterinarIzmenaRasporeda, async (req, res) => {
    if (parseInt(req.body.od) >= parseInt(req.body.do)) {
        req.flash("error", "Neispravan unos!");
        res.redirect("/profile");
    }
    else {
        await Raspored.findById(req.params.idrasporeda).populate('spisaktermina.t').exec(async (err, r) => {
            var ter;
            if (parseInt(r.od) < parseInt(req.body.od)) {
                for (ter of r.spisaktermina) {
                    var termin = ter.t;
                    if (termin == null || parseInt(termin.sati) >= parseInt(req.body.od))
                        continue;
                    if (termin.popunjen == false) {
                        await Termin.findByIdAndDelete(termin._id);
                    }
                    else {
                        var vlasnicii = await Vlasnik.find({});
                        var n = false;
                        for (var v of vlasnicii) {
                            var zak = v.zakazanitermini;
                            for (var z of zak) {
                                if (z.equals(termin._id)) {
                                    n = true;
                                    break;
                                }
                            }
                            if (n == true) {
                                zak = await zak.filter(x => !x.equals(termin._id));
                                v.zakazanitermini = zak;
                                await Vlasnik.findByIdAndUpdate(v._id, v);
                                break;
                            }
                        }
                        var ras = await Raspored.findById(req.params.idrasporeda);
                        ras.spisaktermina = await ras.spisaktermina.filter(x => x.t != null && !x.t.equals(termin._id));
                        await Raspored.findByIdAndUpdate(ras._id, ras);
                        await Termin.findByIdAndDelete(termin._id);
                    }
                }
            }
            if (parseInt(r.od) > parseInt(req.body.od)) {
                for (var i = parseInt(req.body.od); i < parseInt(r.od); i++) {
                    var pon = false;
                    var uto = false;
                    var sre = false;
                    var cet = false;
                    var pet = false;
                    var sub = false;
                    var ned = false;
                    for (ter of r.spisaktermina) {
                        var termin = ter.t;
                        if (termin == null || parseInt(termin.sati) != i)
                            continue;
                        if (termin.dan == "Ponedeljak") pon = true;
                        if (termin.dan == "Utorak") uto = true;
                        if (termin.dan == "Sreda") sre = true;
                        if (termin.dan == "Cetvrtak") cet = true;
                        if (termin.dan == "Petak") pet = true;
                        if (termin.dan == "Subota") sub = true;
                        if (termin.dan == "Nedelja") ned = true;
                    }
                    if (pon == false) {
                        var p = new Termin({ sati: i, dan: "Ponedeljak", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (uto == false) {
                        var p = new Termin({ sati: i, dan: "Utorak", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (sre == false) {
                        var p = new Termin({ sati: i, dan: "Sreda", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (cet == false) {
                        var p = new Termin({ sati: i, dan: "Cetvrtak", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (pet == false) {
                        var p = new Termin({ sati: i, dan: "Petak", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (sub == false) {
                        var p = new Termin({ sati: i, dan: "Subota", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (ned == false) {
                        var p = new Termin({ sati: i, dan: "Nedelja", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                }
            }
            if (parseInt(r.do) > parseInt(req.body.do)) {
                for (ter of r.spisaktermina) {
                    var termin = ter.t;
                    if (termin == null || parseInt(termin.sati) <= parseInt(req.body.do) - 1)
                        continue;
                    if (termin.popunjen == false) {
                        await Termin.findByIdAndDelete(termin._id);
                    }
                    else {
                        var vlasnicii = await Vlasnik.find({});
                        var n = false;
                        for (var v of vlasnicii) {
                            var zak = v.zakazanitermini;
                            for (var z of zak) {
                                if (z.equals(termin._id)) {
                                    n = true;
                                    break;
                                }
                            }
                            if (n == true) {
                                zak = await zak.filter(x => !x.equals(termin._id));
                                v.zakazanitermini = zak;
                                await Vlasnik.findByIdAndUpdate(v._id, v);
                                break;
                            }
                        }
                        var ras = await Raspored.findById(req.params.idrasporeda);
                        ras.spisaktermina = await ras.spisaktermina.filter(x => x.t != null && !x.t.equals(termin._id));
                        await Raspored.findByIdAndUpdate(ras._id, ras);
                        await Termin.findByIdAndDelete(termin._id);
                    }
                }
            }
            if (parseInt(r.do) < parseInt(req.body.do)) {
                for (var i = parseInt(req.body.do) - 1; i > parseInt(r.do) - 1; i--) {
                    var pon = false;
                    var uto = false;
                    var sre = false;
                    var cet = false;
                    var pet = false;
                    var sub = false;
                    var ned = false;
                    for (ter of r.spisaktermina) {
                        var termin = ter.t;
                        if (termin == null || parseInt(termin.sati) != i)
                            continue;
                        if (termin.dan == "Ponedeljak") pon = true;
                        if (termin.dan == "Utorak") uto = true;
                        if (termin.dan == "Sreda") sre = true;
                        if (termin.dan == "Cetvrtak") cet = true;
                        if (termin.dan == "Petak") pet = true;
                        if (termin.dan == "Subota") sub = true;
                        if (termin.dan == "Nedelja") ned = true;
                    }
                    if (pon == false) {
                        var p = new Termin({ sati: i, dan: "Ponedeljak", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (uto == false) {
                        var p = new Termin({ sati: i, dan: "Utorak", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (sre == false) {
                        var p = new Termin({ sati: i, dan: "Sreda", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (cet == false) {
                        var p = new Termin({ sati: i, dan: "Cetvrtak", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (pet == false) {
                        var p = new Termin({ sati: i, dan: "Petak", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (sub == false) {
                        var p = new Termin({ sati: i, dan: "Subota", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                    if (ned == false) {
                        var p = new Termin({ sati: i, dan: "Nedelja", popunjen: false });
                        await p.save();
                        r.spisaktermina = r.spisaktermina.concat({ t: p._id });
                    }
                }
            }
            if (parseInt(r.od) != parseInt(req.body.od) || parseInt(r.do) != parseInt(req.body.do)) {
                r.od = req.body.od;
                r.do = req.body.do;
                await r.save();
            }

            res.redirect("/profile");
        });
    }
});

// PROMENA PODATAKA O PRODAVCU
app.put("/profile/prodavac/edit/:id", authProdavacIzmena, async (req, res) => {
    var x = await Prodavac.findById(req.params.id);
    var postojiemail = undefined;
    if (x.email != req.body.email) {
        postojiemail = await Veterinar.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Vlasnik.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Administrator.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Prodavac.findOne({ email: req.body.email });
    }
    var postojiusername = undefined;
    if (x.username != req.body.username) {
        postojiusername = await Veterinar.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Vlasnik.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Administrator.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Prodavac.findOne({ username: req.body.username });
    }

    if (!validator.isEmail(req.body.email) || postojiemail) {
        req.flash("error", "Email nije validan!");
        res.redirect("/profile");
    }
    else {
        if (postojiusername) {
            req.flash("error", "Vec postoji korisnik sa tim username-om, izaberite drugi!");
            res.redirect("/profile");
        }
        else {
            x = await Prodavac.findById(req.params.id);
            x.ime = req.body.ime;
            x.prezime = req.body.prezime;
            x.username = req.body.username;
            x.email = req.body.email;
            x.telefon = req.body.telefon;
            const t = await bcrypt.compare(req.body.password, x.password);
            if (!t) {
                req.flash("error", "Uneli ste pogresnu sifru. Podaci nisu promenjeni!");
                res.redirect("/profile");
            }
            else {
                if (req.body.password2 != "") {
                    x.password = await bcrypt.hash(req.body.password2, 8);
                }
                await Prodavac.findByIdAndUpdate(req.params.id, x);
                var prodavac = await Prodavac.findById(req.params.id);
                for (var i = 0; i < prodavac.prodavnice.length; i++) {
                    await Prodavnica.findByIdAndUpdate(prodavac.prodavnice[i], { telefon: prodavac.telefon });
                }
                var user = await Prodavac.findById(req.params.id);
                req.login(user, function (err) {
                    if (err) return next(err)
                });
                req.flash("success", "Uspesno ste izmenili podatke!");
                res.redirect("/profile");
            }
        }
    }
});
//PROMENA PODATAKA O VLASNIKU
app.put("/profile/vlasnik/edit/:id", authVlasnikIzmena, async (req, res) => {
    var x = await Vlasnik.findById(req.params.id);
    var postojiemail = undefined;
    if (x.email != req.body.email) {
        postojiemail = await Veterinar.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Vlasnik.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Administrator.findOne({ email: req.body.email });
        if (!postojiemail)
            postojiemail = await Prodavac.findOne({ email: req.body.email });
    }
    var postojiusername = undefined;
    if (x.username != req.body.username) {
        postojiusername = await Veterinar.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Vlasnik.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Administrator.findOne({ username: req.body.username });
        if (!postojiusername)
            postojiusername = await Prodavac.findOne({ username: req.body.username });
    }

    if (!validator.isEmail(req.body.email) || postojiemail) {
        req.flash("error", "Email nije validan!");
        res.redirect("/profile");
    }
    else {
        if (postojiusername) {
            req.flash("error", "Vec postoji korisnik sa tim username-om, izaberite drugi!");
            res.redirect("/profile");
        }
        else {
            x = await Vlasnik.findById(req.params.id);
            x.ime = req.body.ime;
            x.prezime = req.body.prezime;
            x.username = req.body.username;
            x.email = req.body.email;
            x.telefon = req.body.telefon;
            const t = await bcrypt.compare(req.body.password, x.password);
            if (!t) {
                req.flash("error", "Uneli ste pogresnu sifru. Podaci nisu promenjeni!");
                res.redirect("/profile");
            }
            else {
                if (req.body.password2 != "") {
                    x.password = await bcrypt.hash(req.body.password2, 8);
                }
                await Vlasnik.findByIdAndUpdate(req.params.id, x);
                var user = await Vlasnik.findById(req.params.id);
                req.login(user, function (err) {
                    if (err) return next(err)
                });
                req.flash("success", "Uspesno ste izmenili podatke!");
                res.redirect("/profile");
            }
        }
    }
});

app.put('/profile/vlasnik/:id/:idtermina', authVlasnikIzmena, async (req, res) => {
    var t = await Termin.findById(req.params.idtermina);
    t.podaci.ime = "";
    t.podaci.prezime = "";
    t.podaci.opis = "";
    t.podaci.telefon = "";
    t.popunjen = false;
    await Termin.findByIdAndUpdate(t._id, t);
    var vlasnik = await Vlasnik.findById(req.params.id);
    vlasnik.zakazanitermini = await vlasnik.zakazanitermini.filter(x => !x.equals(req.params.idtermina));
    await Vlasnik.findByIdAndUpdate(vlasnik._id, vlasnik);

    var user = await Vlasnik.findById(req.params.id);
    req.login(user, function (err) {
        if (err) return next(err)
    });
    res.redirect("/profile");
});

//Postavi pitanje
app.put('/forum/postavipitanje/:user', authVlasnikPitanje, async (req, res) => {
    var pitanje = new Pitanje();
    pitanje.korisnik = req.params.user;
    pitanje.sadrzajpitanja = req.body.text;
    pitanje.prikazano = false;

    await pitanje.save(async (err, result) => {
        var vlasnik = await Vlasnik.findById(req.params.user);


        if (vlasnik.Pitanje.push(result._id)) {
            await vlasnik.save()
            req.flash("success", "Uspesno postavljeno pitanje!");
        }
        else {
            req.flash("error", "Neuspesno postavljeno pitanje!");
        }
        res.redirect("/forum");
    })
});

// Odgovor na pitanje
app.put('/forum/odgovori/:user/:Pitanje', authVeterinarOdgovor, async (req, res) => {
    var pitanje = await Pitanje.findById(req.params.Pitanje)
    var odgovor = new Odgovor();
    odgovor.idveterinara = req.params.user;
    odgovor.sadrzajodgovora = req.body.text;
    
    var odg = null;
    await odgovor.save(async (err, odgo)=> {
        
    
        odg=odgo._id
        
        if (pitanje.odgovori.push(odg)) {
            await pitanje.save()
            req.flash("success", "Uspesno postavljen odgovor!");
        }
        else {
            req.flash("error", "Neuspesno postavljen odgovor!");
        }
        res.redirect("/forum");

    })
});
// Vlasnik brise pitanje
app.delete('/forum/izbrisipitanje/:user/:Pitanje', async (req, res) => {

    var vlasnik = req.user;
    var pitanje = await Pitanje.findById(req.params.Pitanje)
    for (var i = 0; i < pitanje.odgovori.length; i++) {
        await Odgovor.findByIdAndDelete(pitanje.odgovori[i])
    }
    await Vlasnik.findByIdAndUpdate(vlasnik._id, { $pull: { 'Pitanje': req.params.Pitanje } })
    await Pitanje.findByIdAndDelete(pitanje._id)


    res.redirect("/forum");
});
// Administrator brise pitanje
app.delete('/forum/izbrisipitanje/:Pitanje', authAdministrator, async (req, res) => {


    var pitanje = await Pitanje.findById(req.params.Pitanje)
    var vlasnik = await Vlasnik.findById(pitanje.korisnik)

    for (var i = 0; i < pitanje.odgovori.length; i++) {
        await Odgovor.findByIdAndDelete(pitanje.odgovori[i])
    }
    await Vlasnik.findByIdAndUpdate(vlasnik._id, { $pull: { 'Pitanje': req.params.Pitanje } })
    await Pitanje.findByIdAndDelete(pitanje._id)


    res.redirect("/forum");
});
// Veterinar ili adminstrator brise odgovor
app.delete('/forum/izbrisiodgovor/:Pitanje/:Odgovor', authBrisanjeOdgovora, async (req, res) => {

    var pitanje = await Pitanje.findById(req.params.Pitanje);
    await Pitanje.findByIdAndUpdate(pitanje._id, { $pull: { 'odgovori': req.params.Odgovor } });
    await Odgovor.findByIdAndDelete(req.params.Odgovor);
    res.redirect("/forum");
})

// PRETRAGA
app.get("/search", async (req, res) => {
    var prodavnicee = await Prodavnica.find({});
    var search = req.query.key;
    var kategorija = req.query.kategorijafilter;
    var tip = req.query.tipfilter;
    var broj = req.query.brojfilter;
    if (broj == undefined) {
        broj = 10;
    }
    var sort = req.query.sortfilter;
    if (search != undefined && search.indexOf("*") == -1) {
        await Proizvod.find({ ime: { $regex: new RegExp(".*" + search.toLowerCase() + ".*", 'i') } }, async (err, proizvods) => {
            var rezultatkategorija = [];


            // FILTRIRANJE PO KATEGORIJI
            if (kategorija != undefined && kategorija != "0") {
                for (var i = 0; i < proizvods.length; i++) {
                    if (proizvods[i].kategorija == kategorija) {
                        rezultatkategorija.push(proizvods[i]);
                    }
                }
            }
            if (kategorija == undefined) {
                kategorija = 0;
                rezultatkategorija = proizvods;
            }
            // FILTRIRANJE PO TIPU
            var rezultattip = [];
            if (tip != undefined && tip != "0") {

                for (var i = 0; i < rezultatkategorija.length; i++) {
                    if (rezultatkategorija[i].tip == tip) {
                        rezultattip.push(rezultatkategorija[i]);
                    }
                }
            }
            if (tip == undefined) {
                tip = 0;
                rezultattip = rezultatkategorija;
            }
            if (req.query.prodavnicafilter != undefined && req.query.prodavnicafilter != '0') {
                var proizvodiizprodavnice = await Prodavnica.findOne({ ime: req.query.prodavnicafilter });
                var rezultattip2 = [];
                for (var i = 0; i < rezultattip.length; i++) {
                    if (proizvodiizprodavnice.proizvodi.indexOf(rezultattip[i]._id) > -1) {
                        rezultattip2.push(rezultattip[i]);
                    }
                }
                rezultattip = rezultattip2;
            }
            //AKO JE PRIKAZI SVE
            if (broj == 6) {
                broj = rezultattip.length;
            }
            if (sort != undefined) {
                switch (sort) {
                    case '0': {

                        res.render("search.ejs", { user: req.user, proizvodi: rezultattip, kljuc: search, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnicee: prodavnicee, prod: req.query.prodavnicafilter });
                        break;
                    }
                    case '1': {
                        for (var i = 0; i < rezultattip.length; i++) {
                            var temp;
                            for (var j = i + 1; j < rezultattip.length; j++) {
                                if (rezultattip[i].cena > rezultattip[j].cena) {
                                    temp = rezultattip[i];
                                    rezultattip[i] = rezultattip[j];
                                    rezultattip[j] = temp;
                                }
                            }
                        }
                        console.log(rezultattip);
                        res.render("search.ejs", { user: req.user, proizvodi: rezultattip, kljuc: search, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnicee: prodavnicee, prod: req.query.prodavnicafilter });
                        break;
                    }
                    case '2': {
                        for (var i = 0; i < rezultattip.length; i++) {
                            var temp;
                            for (var j = i + 1; j < rezultattip.length; j++) {
                                if (rezultattip[i].cena < rezultattip[j].cena) {
                                    temp = rezultattip[i];
                                    rezultattip[i] = rezultattip[j];
                                    rezultattip[j] = temp;
                                }
                            }
                        }

                        res.render("search.ejs", { user: req.user, proizvodi: rezultattip, kljuc: search, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnicee: prodavnicee, prod: req.query.prodavnicafilter });
                        break;
                    }
                    case '3': {
                        rezultattip.sort((a, b) => a.ime.localeCompare(b.ime));
                        res.render("search.ejs", { user: req.user, proizvodi: rezultattip, kljuc: search, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnicee: prodavnicee, prod: req.query.prodavnicafilter });
                        break;
                    }
                    case '4': {
                        rezultattip.sort((a, b) => b.ime.localeCompare(a.ime));
                        res.render("search.ejs", { user: req.user, proizvodi: rezultattip, kljuc: search, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnicee: prodavnicee, prod: req.query.prodavnicafilter });
                        break;
                    }
                    case '5': {
                        const sortedActivities = rezultattip.sort((a, b) => b.vremedodavanja - a.vremedodavanja);
                        res.render("search.ejs", { user: req.user, proizvodi: sortedActivities, kljuc: search, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnicee: prodavnicee, prod: req.query.prodavnicafilter });
                        break;
                    }
                    case '6': {
                        const sortedActivities = rezultattip.sort((a, b) => a.vremedodavanja - b.vremedodavanja);
                        res.render("search.ejs", { user: req.user, proizvodi: sortedActivities, kljuc: search, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnicee: prodavnicee, prod: req.query.prodavnicafilter });
                        break;
                    }
                }
            }
            else {
                sort = 0;
                res.render("search.ejs", { user: req.user, proizvodi: rezultattip, kljuc: search, broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnicee: prodavnicee, prod: req.query.prodavnicafilter });
            }
        });
    }
    else {
        res.render("search.ejs", { user: req.user, proizvodi: [], kljuc: [], broj: broj, kategorija: kategorija, sort: sort, tip: tip, prodavnicee: prodavnicee, prod: req.query.prodavnicafilter });
    }
});
// KOLICA
app.get("/cart", async (req, res) => {
    res.render("cart.ejs", { user: req.user });
});
app.post("/cart", async (req, res) => {
    let user = req.user;
    if (req.body.podaci == undefined || req.body.podaci.length == 0) {
        res.write("Korpa je prazna");
        res.end();
    }
    else if (user == undefined) {
        // res.writeHead(301, { 'Location': 'http://localhost:3000/login' });   
        res.write("Niste ulogovani. Samo korisnici ulogovani kao Vlasnik mogu izvrsiti kupovinu");
        res.end();
    }
    else if (user.tipkorisnika != "vlasnik") {
        res.write("Samo korisnici ulogovani kao Vlasnik mogu izvrsiti kupovinu");
        res.end();
    }
    else {
        let poruka = "Neuspesna kupovina";
        var podaci = req.body.podaci;
        var kolicina = req.body.kolicina;
        let error = 0;
        for (let i = 0; i < podaci.length; i++) {
            var parsovan = JSON.parse(podaci[i]);
            let proizvod = await Proizvod.findById(parsovan._id);
            if (parseInt(proizvod.kolicina) >= parseInt(kolicina[i])) {
                let novakolicina = parseInt(proizvod.kolicina) - parseInt(kolicina[i]);
                await Proizvod.findByIdAndUpdate(parsovan._id, { kolicina: novakolicina });
            }
            else {
                error = 1;
                let novakolicina = parseInt(kolicina[i]) - parseInt(proizvod.kolicina);
                poruka = poruka + ",\n" + "Proizvod " + parsovan.ime + ": Nedostaje " + novakolicina;
            }
        }
        if (error == 1) {
            //res.writeHead(301, { 'Location': 'http://localhost:3000/cart' });
            res.write(poruka);
        }
        else {
            // res.writeHead(301, { 'Location': 'http://localhost:3000/showproducts' });
            var currentDate = new Date(Date.now());
            await Kupovina.create({
                "kupac": user._id, "datum": currentDate, "proizvodi": [], kolicina: []
            }, async function (err, kupovina) {
                var podaci = req.body.podaci;
                var kolicina = req.body.kolicina;
                for (let i = 0; i < podaci.length; i++) {
                    var parsovan = JSON.parse(podaci[i]);
                    kupovina.proizvodi.push(parsovan._id);
                    kupovina.kolicina.push(parseInt(kolicina[i]));
                    if (parsovan.akcija == true) {
                        kupovina.cene.push(parseInt(parsovan.akcijskacena));
                    }
                    else {
                        kupovina.cene.push(parseInt(parsovan.cena));
                    }
                }
                kupovina.racun = req.body.ukupno;
                await kupovina.save();
                var vlasnik = await Vlasnik.findById(kupovina.kupac);
                vlasnik.kupovine.push(kupovina._id);
                await vlasnik.save();
            });
            res.write("Uspesno izvrsena kupovina");
        }
        res.end();

    }
})
app.post("/cart/:id/:broj", async (req, res) => {
    req.flash("success", "Proizvod je uspesno dodat u korpu");
    if (req.params.broj == 1)
        res.redirect("back");
    else
        res.redirect("/products/" + req.params.id);

});
// PRODAVNICE U MREZI
app.get("/shop",async(req,res)=>{
    var prodavnice= await Prodavnica.find({});
    res.render("shop.ejs",{user:req.user,prodavnice:prodavnice});
})
cron.schedule("59 23 * * *", async function () {
    var danas = new Date();
    var d = danas.getDay();
    var dan = new Array(7);
    dan[0] = "Nedelja";
    dan[1] = "Ponedeljak";
    dan[2] = "Utorak";
    dan[3] = "Sreda";
    dan[4] = "Cetvrtak";
    dan[5] = "Petak";
    dan[6] = "Subota";

    console.log("Izvrsavanje fje");
    var ter = await Termin.find({});
    for (var t of ter) {
        if (t.dan == dan[d] && t.popunjen == true) {
            t.popunjen = false;
            await Termin.findByIdAndUpdate(t._id, t);
        }

    }
    console.log("Zavrsetak fje");
});

// STARTOVANJE SERVERA
app.listen(3000, function () {
    console.log("Listening on port 3000");
});