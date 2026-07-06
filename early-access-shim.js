/**
 * Defines window.startEarlyAccess (and related handlers) before ES modules load.
 * Inline onclick handlers need these globals immediately; the module replaces
 * them once Firebase + early-access.js finish initializing.
 */
(function () {
  var queued = [];
  var ready = false;
  var impl = {};

  function hideEaSteps() {
    ["ea-step-type", "ea-step-form", "ea-step-proof", "ea-step-done"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }

  function openEarlyAccessFallback(source, presetType) {
    var modal = document.getElementById("ea-modal");
    if (!modal) return;
    hideEaSteps();
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    var stepForm = document.getElementById("ea-step-form");
    var stepType = document.getElementById("ea-step-type");
    if (presetType && stepForm) {
      stepForm.style.display = "block";
    } else if (stepType) {
      stepType.style.display = "block";
    }
    var emailFromHero =
      source === "hero"
        ? document.getElementById("hero-email")
        : document.getElementById("waitlist-email");
    var eaEmail = document.getElementById("ea-email");
    if (emailFromHero && eaEmail && emailFromHero.value.trim()) {
      eaEmail.value = emailFromHero.value.trim().toLowerCase();
    }
  }

  function stub(name) {
    window[name] = function () {
      if (ready && typeof impl[name] === "function") {
        return impl[name].apply(window, arguments);
      }
      var args = arguments;
      var item = { name: name, args: args };
      if (name === "startEarlyAccess") {
        item.timer = setTimeout(function () {
          if (!ready) openEarlyAccessFallback(args[0], args[1]);
        }, 300);
      }
      queued.push(item);
    };
  }

  stub("startEarlyAccess");
  stub("submitEarlyAccessForm");

  window.closeEarlyAccessModal = function () {
    if (ready && typeof impl.closeEarlyAccessModal === "function") {
      return impl.closeEarlyAccessModal.apply(window, arguments);
    }
    var modal = document.getElementById("ea-modal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
    hideEaSteps();
    var stepType = document.getElementById("ea-step-type");
    if (stepType) stepType.style.display = "block";
  };

  window.pickEarlyAccessType = function (type) {
    if (ready && typeof impl.pickEarlyAccessType === "function") {
      return impl.pickEarlyAccessType(type);
    }
    openEarlyAccessFallback(null, type);
  };

  window.registerEarlyAccessHandlers = function (handlers) {
    impl = handlers || {};
    ready = true;
    window.startEarlyAccess = impl.startEarlyAccess;
    window.closeEarlyAccessModal = impl.closeEarlyAccessModal;
    window.pickEarlyAccessType = impl.pickEarlyAccessType;
    window.submitEarlyAccessForm = impl.submitEarlyAccessForm;

    queued.forEach(function (item) {
      if (item.timer) clearTimeout(item.timer);
      var fn = impl[item.name];
      if (typeof fn === "function") {
        fn.apply(window, item.args);
      }
    });
    queued = [];
  };
})();
