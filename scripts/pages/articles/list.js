if (localStorage.getItem("userId") == null) {
  location.replace("/login.html");
}
fetch("./scripts/components/header.html")
  .then((res) => res.text())
  .then((html) => (document.getElementById("header").innerHTML = html));
