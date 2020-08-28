var checkbox = document.querySelector("#odaberi");

checkbox.addEventListener( 'change', function() {
    if(this.checked) {
        var x=document.getElementById("akcija").style.display="block";
    } else {
        var x=document.getElementById("akcija").style.display="none";
    }
});
$('form').submit(function(){
    var input = $('#test').val();
    if(input == ''){
         $('#test').val('empty');
    }    
});