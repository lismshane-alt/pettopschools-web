/* ==========================================================================
   PETTOP LONDON – INTERNATIONAL NETWORK
   Vanilla JavaScript (script.js)
   1. Hero Background Video Unmute/Mute Toggle
   2. Kids' Assessment Slider Controls
   3. Deferred 12-Second Lead-Capture Modal (#LeadModal)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ------------------------------------------------------------------------
     1. Hero Background Video Sound Toggle ("Unmute Video")
     ------------------------------------------------------------------------ */
  var heroVideo = document.getElementById("heroBgVideo");
  var soundToggleBtn = document.getElementById("heroSoundToggle");
  var soundIcon = document.getElementById("heroSoundIcon");
  var soundLabel = document.getElementById("heroSoundLabel");

  if (heroVideo && soundToggleBtn) {
    soundToggleBtn.addEventListener("click", function () {
      if (heroVideo.muted) {
        heroVideo.muted = false;
        heroVideo.play().catch(function () {});
        soundToggleBtn.classList.add("is-unmuted");
        soundToggleBtn.setAttribute("aria-pressed", "true");
        if (soundIcon) soundIcon.textContent = "🔊";
        if (soundLabel) soundLabel.textContent = "Mute Video";
      } else {
        heroVideo.muted = true;
        soundToggleBtn.classList.remove("is-unmuted");
        soundToggleBtn.setAttribute("aria-pressed", "false");
        if (soundIcon) soundIcon.textContent = "🔇";
        if (soundLabel) soundLabel.textContent = "Unmute Video";
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. The Proof of Progress — Kids' Assessment Slider Navigation
     ------------------------------------------------------------------------ */
  var slider = document.getElementById("assessmentSlider");
  var prevBtn = document.getElementById("slidePrevBtn");
  var nextBtn = document.getElementById("slideNextBtn");

  if (slider && prevBtn && nextBtn) {
    var getScrollStep = function () {
      var firstCard = slider.querySelector(".assessment-card");
      return firstCard ? firstCard.offsetWidth + 24 : 340;
    };

    prevBtn.addEventListener("click", function () {
      slider.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
    });

    nextBtn.addEventListener("click", function () {
      slider.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------------------
     3. Lead-Capture Pop-Up Modal (#LeadModal) — Deferred to 12 Seconds
     ------------------------------------------------------------------------ */
  var modal = document.getElementById("LeadModal") || document.getElementById("leadModal");
  var closeBtn = document.getElementById("closeModalBtn");
  var openBtns = document.querySelectorAll("[data-open-modal]");

  if (!modal) return;

  function openModal() {
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
  }

  // Defer automatic pop-up to 12 seconds (12000ms) so visitors experience the hero video first
  var autoPopupTimer = setTimeout(function () {
    openModal();
  }, 12000);

  // Immediately open modal if user clicks any "Join Our Next Intake" button
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