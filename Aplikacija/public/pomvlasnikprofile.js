var b1=document.getElementById("b1");
var b2=document.getElementById("b2");
var b3=document.getElementById("b3");
var btn1=document.getElementById("btn1");

var p1=document.getElementById("id1");
var p2=document.getElementById("id2");
var p3=document.getElementById("id3");
var p4=document.getElementById("id4");

b1.addEventListener("click", function(){
    btn1.style.display="block";
    p1.style.display="block";
    p2.style.display="none";
    p3.style.display="none";
    p4.style.display="none";
});

btn1.addEventListener("click", function(){
    btn1.style.display="none";
    p1.style.display="none";
    p2.style.display="block";
    p3.style.display="none";
    p4.style.display="none";
});

b3.addEventListener("click", function(){
    btn1.style.display="none";
    p1.style.display="none";
    p2.style.display="none";
    p3.style.display="block";
    p4.style.display="none";
})

b2.addEventListener("click", function(){
    btn1.style.display="none";
    p1.style.display="none";
    p2.style.display="none";
    p3.style.display="none";
    p4.style.display="block";
})
