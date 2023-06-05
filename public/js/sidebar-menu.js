const sidebarHamburger = document.querySelector(".sidebar-hamburger"),
navBranding = document.querySelector(".nav-branding"),
sidebarMenu = document.querySelector(".sidebar-menu"),
content = document.querySelector(".content"),
dropdown = document.querySelectorAll(".dropdown-btn");

let index;

sidebarHamburger.addEventListener("click", () => {
  sidebarHamburger.classList.toggle("active")
  navBranding.classList.toggle("active")
  sidebarMenu.classList.toggle("active")
  content.classList.toggle("active")
})

for (index = 0; index < dropdown.length; index++) {
  dropdown[index].addEventListener("click", function() {
    this.classList.toggle("activate");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}