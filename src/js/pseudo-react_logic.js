// pseudo-react logic
function toggleMode() {
  const mode = localStorage.getItem("mode") === "argentina" ? "brasil" : "argentina";
  document.body.setAttribute("data-mode", mode);
  localStorage.setItem("mode", mode);
}
