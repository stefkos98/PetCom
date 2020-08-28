var sel=document.getElementById("korisnik");
var p=document.getElementById("veterinarid");

sel.addEventListener("change", function(){
    if(sel.value=="veterinar")
    {
        p.style.display="block";
    }
    else
    {
        p.style.display="none";
    }
});