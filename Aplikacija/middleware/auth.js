var passport = require('passport');
var localStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');

const jwt = require('jsonwebtoken');
const Odgovor = require('../models/odgovor');

const authVlasnik = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'vlasnik') {
            return next();
        }
        else {
            req.flash("error", "Niste ulogovani kao vlasnik, nemate pristup stranici!");
            res.redirect("/");
        }
    }
    else {
        req.flash("error", "Ulogujte se kao vlasnik da biste pristupili stranici!");
        res.redirect('/login');
    }
};

const authVeterinar = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'veterinar' && req.user.odobren == 1) { return next(); }
        if (req.user.tipkorisnika == 'veterinar' && req.user.odobren == 0) {
            req.flash("error", "Jos uvek niste odobreni od administratora, kada budete odobreni imacete mogucnost pristupa stranici!");
            res.redirect("/");
        }
        else {
            req.flash("error", "Niste ulogovani kao veterinar, nemate pristup stranici!");
            res.redirect("/");
        }
    }
    else {
        req.flash("error", "Ulogujte se kao veterinar da biste pristupili stranici!");
        res.redirect('/login');
    }
};

const authAdministrator = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'administrator' && req.user.odobren == 1) { return next(); }
        if (req.user.tipkorisnika == 'administrator' && req.user.odobren == 0) {
            req.flash("error", "Jos uvek niste odobreni od administratora, kada budete odobreni imacete mogucnost pristupa stranici!");
            res.redirect("/");
        }
        else {
            req.flash("error", "Niste ulogovani kao administrator, nemate pristup stranici!");
            res.redirect("/");
        }
    }
    else {
        req.flash("error", "Ulogujte se kao administrator da biste pristupili stranici!");
        res.redirect('/login');
    }
};

const authProdavac = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'prodavac' && req.user.odobren == 1) { return next(); }
        if (req.user.tipkorisnika == 'prodavac' && req.user.odobren == 0) {
            req.flash("error", "Jos uvek niste odobreni od administratora, kada budete odobreni imacete mogucnost pristupa stranici!");
            res.redirect("/");
        }
        else {
            req.flash("error", "Niste ulogovani kao prodavac, nemate pristup stranici!");
            res.redirect("/");
        }
    }
    else {
        req.flash("error", "Ulogujte se kao prodavac da biste pristupili stranici!");
        res.redirect('/login');
    }
};

const authVlasnikVeterinar = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'veterinar' && req.user.odobren == 1) { return next(); }
        if (req.user.tipkorisnika == 'vlasnik') { return next(); }
        if (req.user.tipkorisnika == 'veterinar' && req.user.odobren == 0) {
            req.flash("error", "Jos uvek niste odobreni od administratora, kada budete odobreni imacete mogucnost pristupa stranici!");
            res.redirect("/");
        }
        req.flash("error", "Niste ulogovani kao vlasnik ili veterinar, nemate pristup stranici!");
        res.redirect("/");
    }
    else {
        req.flash("error", "Ulogujte se kao vlasnik ili veterinar da biste pristupili stranici!");
        res.redirect('/login');
    }
};

const UlogovanOdobren = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'vlasnik') { return next(); }
        if (req.user.odobren == 1) { return next(); }
        else {
            req.flash("error", "Jos uvek niste odobreni od administratora, kada budete odobreni imacete mogucnost pristupa stranici!");
            res.redirect("/");
        }
    }
    else{
    req.flash("error", "Ulogujte se da biste pristupili stranici!");
    res.redirect('/login');
    }
}

const Ulogovan = async (req, res, next) => {
    if (req.isAuthenticated()) { return next(); }
    req.flash("error", "Izlogovani ste");
    res.redirect('/login');
}

const authRezervacija = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'vlasnik' && req.user._id===req.params.id) { return next(); }

        req.flash("error", "Nemate dozvolu da izvrsite ovu rezervaciju!");
        res.redirect('back');
    }
    else {
        req.flash("error", "Nemate dozvolu da izvrsite ovu rezervaciju, niste ulogovani!");
        res.redirect('/login');
    }
}

const authProdavacProdavnica = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'prodavac' && req.user.odobren == 1) {
            var prodavnice = req.user.prodavnice;
            var t = false;
            for (var p of prodavnice) {
                if (p===req.params.id) { t = true; break; }
            }
            if (t) { return next(); }
            else {
                req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
                res.redirect('back');
            }
        }
        else {
            req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
            res.redirect('back');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao prodavac da biste pristupili stranici!");
        res.redirect('/login');
    }
}

const authProdavacProdavnica1 = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'prodavac' && req.user.odobren == 1) {
            var prodavnice = req.user.prodavnice;
            var t = false;
            for (var p of prodavnice) {
                if (p===req.params.idprodavnica) { t = true; break; }
            }
            if (t) { return next(); }
            else {
                req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
                res.redirect('back');
            }
        }
        else {
            req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
            res.redirect('back');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao prodavac da biste pristupili stranici!");
        res.redirect('/login');
    }
}

const authAdministratorIzmena = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'administrator' && req.user.odobren == 1 && req.user._id===req.params.id) {
            return next();
        }
        else {
            req.flash("error", "Nemate dozvolu da menjate podatke!");
            res.redirect('back');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao administrator da biste izmenili podatke!");
        res.redirect('/login');
    }
}

const authVeterinarIzmena = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'veterinar' && req.user.odobren == 1 && req.user._id===req.params.id) {
            return next();
        }
        else {
            req.flash("error", "Nemate dozvolu da menjate podatke!");
            res.redirect('back');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao veterinar da biste izmenili podatke!");
        res.redirect('/login');
    }
}

const authProdavacIzmena = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'prodavac' && req.user.odobren == 1 && req.user._id===req.params.id) {
            return next();
        }
        else {
            req.flash("error", "Nemate dozvolu da menjate podatke!");
            res.redirect('back');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao prodavac da biste izmenili podatke!");
        res.redirect('/login');
    }
}

const authVlasnikIzmena = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'vlasnik' && req.user._id===req.params.id) {
            return next();
        }
        else {
            req.flash("error", "Nemate dozvolu da menjate podatke!");
            res.redirect('back');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao vlasnik da biste izmenili podatke!");
        res.redirect('/login');
    }
}

const authVeterinarAdministrator = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'administrator' && req.user.odobren == 1) { return next(); }
        if (req.user.tipkorisnika == 'veterinar' && req.user.odobren == 1 && req.user._id===req.params.id) { return next(); }
        req.flash("error", "Nemate pristup stranici!");
        res.redirect("back");
    }
    else {
        req.flash("error", "Ulogujte se kao veterinar ili administrator da biste pristupili stranici!");
        res.redirect('/login');
    }
};

const authProdavacAdministrator = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'administrator' && req.user.odobren == 1) { return next(); }
        if (req.user.tipkorisnika == 'prodavac' && req.user.odobren == 1 && req.user._id===req.params.id) { return next(); }
        req.flash("error", "Nemate pristup stranici!");
        res.redirect("back");
    }
    else {
        req.flash("error", "Ulogujte se kao prodavac ili administrator da biste pristupili stranici!");
        res.redirect('/login');
    }
};

const authVlasnikAdministrator = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'administrator' && req.user.odobren == 1) { return next(); }
        if (req.user.tipkorisnika == 'vlasnik' && req.user._id===req.params.id) { return next(); }
        req.flash("error", "Nemate pristup stranici!");
        res.redirect("back");
    }
    else {
        req.flash("error", "Ulogujte se kao vlasnik ili administrator da biste pristupili stranici!");
        res.redirect('/login');
    }
};

const authVeterinarIzmenaRasporeda = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'veterinar' && req.user.odobren == 1 && req.user.idrasporeda===req.params.idrasporeda) { return next(); }
        else {
            req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
            res.redirect('back');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao veterinar da biste izmenili raspored!");
        res.redirect('/login');
    }
}

const authVeterinarOdgovor = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'veterinar' && req.user.odobren == 1 && req.user._id===req.params.user) { return next(); }
        else {
            req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
            res.redirect('/');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao veterinar da biste odgovorili na pitanje!");
        res.redirect('/login');
    }
}

const authVlasnikPitanje = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'vlasnik' && req.user._id===req.params.user) { return next(); }
        else {
            req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
            res.redirect('/');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao vlasnik da biste postavili pitanje!");
        res.redirect('/login');
    }
}

const authVlasnikBrisePitanje = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'vlasnik' && req.user._id===req.params.user) {
            var pitanja = req.user.Pitanje;
            var t = false;
            for (var p of pitanja) {
                if (p===req.params.Pitanje) { t = true; break; }
            }
            if (t) { return next(); }
            else {
                req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
                res.redirect('/');
            }
        }
        else {
            req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
            res.redirect('/');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao vlasnik da biste obrisali pitanje!");
        res.redirect('/login');
    }
}

const authBrisanjeOdgovora = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.tipkorisnika == 'administrator' && req.user.odobren == 1) { return next(); }
        if (req.user.tipkorisnika == 'veterinar' && req.user.odobren == 1) {
            var odgovor = await Odgovor.findById(req.params.Odgovor);
            if (odgovor.idveterinara.equals(req.user._id)) { return next(); }
            else {
                req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
                res.redirect('/');
            }
        }
        else {
            req.flash("error", "Nemate dozvolu da pristupite ovoj stranici!");
            res.redirect('/');
        }
    }
    else {
        req.flash("error", "Ulogujte se kao administrator da biste brisali odgovore!");
        res.redirect('/login');
    }
}

module.exports = {
    fja0: UlogovanOdobren,
    fja1: authVlasnik,
    fja2: authVeterinar,
    fja3: authAdministrator,
    fja4: authProdavac,
    fja5: authVlasnikVeterinar,
    fja6: Ulogovan,
    fja7: authRezervacija,
    fja8: authProdavacProdavnica,
    fja9: authProdavacProdavnica1,
    fja10: authAdministratorIzmena,
    fja11: authVeterinarIzmena,
    fja12: authProdavacIzmena,
    fja13: authVlasnikIzmena,
    fja14: authVeterinarAdministrator,
    fja15: authProdavacAdministrator,
    fja16: authVlasnikAdministrator,
    fja17: authVeterinarIzmenaRasporeda,
    fja18: authVeterinarOdgovor,
    fja19: authVlasnikPitanje,
    fja20: authVlasnikBrisePitanje,
    fja21: authBrisanjeOdgovora
};