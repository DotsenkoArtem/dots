"use strict";

window.addEventListener("load", () => {
  preloaderInit(350);
  // handleModals();
});

// P A G E   P R E L O A D E R   F U N C T I O N
function preloaderInit(transition) {
  preloader.style.transition = `opacity ${transition}ms`;
  preloader.classList.add("fade-out");
  setTimeout(function () {
    preloader.remove();
  }, transition);
}

// M O D A L   F U N C T I O N
// function handleModals() {
//   let modalBtns = document.querySelectorAll(".js-modal-trigger");

//   modalBtns.forEach((modalBtn) => {
//     // Продолжительность анимации
//     let duration;
//     let modal = document.querySelector(`#${modalBtn.dataset.target}`);
//     let modalClose = modal.querySelector(".modal__close");

//     let modalBackdrop = document.createElement("div");
//     modalBackdrop.className = "modal-backdrop";

//     modalBtn.addEventListener("click", openModal);
//     modalBackdrop.addEventListener("click", function () {
//       closeModal(modal, duration);
//     });
//     modalClose.addEventListener("click", function () {
//       closeModal(modal, duration);
//     });

//     // Open-close functions
//     function openModal() {
//       // Если в дата-атрибуте значение указано равным 0, то продолжительность анимации 0.
//       modalBtn.dataset.duration === "0"
//         ? (duration = 0)
//         : // В остальных случаях, если указано целочисленное значение, то берем его, если нет, то 350 по умолчанию.
//           (duration = +modalBtn.dataset.duration || 350); // В
//       modal.style.transition = `${duration}ms ease-out`;

//       modal.style.display = `flex`;
//       // Таймаут для того, чтобы отрабатывала анимация
//       setTimeout(() => {
//         modal.classList.add("shown");
//       }, 0);
//       modal.append(modalBackdrop);
//     }

//     function closeModal() {
//       modal.classList.remove("shown");
//       setTimeout(() => {
//         modal.style = ``;
//         modalBackdrop.remove();
//       }, duration);
//     }
//   });
// }

// ======================================================
