const tocList = document.getElementById("tocList");
// Table of Contents name graber
document.querySelectorAll("main.content section").forEach((section) => {
  const heading = section.querySelector("h2");
  if (!heading) return;

  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = "#" + section.id;
  a.textContent = heading.textContent;
  li.appendChild(a);
  tocList.appendChild(li);
});

// auto open Collapsed Sections
function openSection(id) {
  if (!id) return;

  const details = document.querySelector("#" + id + " details");
  if (details) details.open = true;
}
tocList.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (link) openSection(link.getAttribute("href").slice(1));
});

window.addEventListener("hashchange", () =>
  openSection(location.hash.slice(1)),
);

// Sidebar show/hide toggle
const toggleBtn = document.getElementById("sidebarToggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("nav-closed");
});

// Report Original/Revised toggle
document.querySelectorAll(".toggle-opt").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    btn.parentElement.querySelectorAll(".toggle-opt").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
    btn
      .closest("section")
      .querySelectorAll(".report-version")
      .forEach((v) => {
        v.classList.toggle("active", v.id === targetId);
      });
  });
});

// Slide viewer (Statistics in the Wild)
document.querySelectorAll(".slides").forEach((viewer) => {
  const imgs = viewer.querySelectorAll(".slide-img");
  const counter = viewer.querySelector(".slide-counter");
  let i = 0;
  function show(n) {
    i = (n + imgs.length) % imgs.length; // wraps around both ends
    imgs.forEach((img, idx) => img.classList.toggle("active", idx === i));
    if (counter) counter.textContent = i + 1 + " / " + imgs.length;
  }
  viewer.querySelectorAll(".slide-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      show(btn.dataset.dir === "next" ? i + 1 : i - 1),
    );
  });
  show(0);
});
