(function () {

  // prevent multiple injection
  if (window.injectedAlready) return;
  window.injectedAlready = true;

  const btnYes = document.createElement("button");
  btnYes.innerText = "YES";
  btnYes.style.position = "fixed";
  btnYes.style.bottom = "20px";
  btnYes.style.right = "80px";
  btnYes.style.padding = "10px 18px";
  btnYes.style.borderRadius = "30px";
  btnYes.style.fontSize = "20px";

  const btnMinus = document.createElement("button");
  btnMinus.innerText = "-5";
  btnMinus.style.position = "fixed";
  btnMinus.style.bottom = "20px";
  btnMinus.style.right = "20px";
  btnMinus.style.padding = "10px 18px";
  btnMinus.style.borderRadius = "30px";
  btnMinus.style.fontSize = "20px";

  btnYes.onclick = () => alert("YES clicked");
  btnMinus.onclick = () => alert("-5 clicked");

  document.body.appendChild(btnYes);
  document.body.appendChild(btnMinus);

})();