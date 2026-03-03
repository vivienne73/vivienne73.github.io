const text = "soft pink personal space";
let i = 0;
function typing(){
  if(i < text.length){
    document.getElementById("typing").innerHTML += text.charAt(i);
    i++;
    setTimeout(typing,50);
  }
}
typing();

document.addEventListener("mousemove",function(e){
  const halo=document.querySelector(".halo");
  halo.style.left=e.clientX-150+"px";
  halo.style.top=e.clientY-150+"px";
});
