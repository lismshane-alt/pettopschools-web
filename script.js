/* ==========================================================================
   Preschool Teacher Training Institute - Pop-Up Modal Logic (script.js)
   Vanilla JavaScript (ONLY for the lead-capture pop-up modal)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("leadModal");
  var closeBtn = document.getElementById("closeModalBtn");
  var openBtns = document.querySelectorAll("[data-open-modal]");

  // Only run modal logic if the modal exists on the current page (index.html)
  if (!modal) return;

  function openModal() {
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
  }

  // Automatically trigger the pop-up 3 seconds (3000ms) after entering index.html
  var autoPopupTimer = setTimeout(function () {
    openModal();
  }, 3000);

  // Also allow "Join Our Next Intake" buttons to open the modal immediately
  openBtns.forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      clearTimeout(autoPopupTimer);
      openModal();
    });
  });

  // Close modal when clicking the "X" button
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Close modal when clicking outside the modal box (on the dark overlay)
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Close modal when pressing the Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("is-visible")) {
      closeModal();
    }
  });
});
