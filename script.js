const WHATSAPP_NUMBER = "6281918992022";

const packages = {
  silver: { label: "Silver", price: 2_000_000, normal: 2_500_000 },
  bronze: { label: "Bronze", price: 2_500_000, normal: 3_000_000 },
  gold: { label: "Gold", price: 3_500_000, normal: 4_500_000 },
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function formatIDR(amount) {
  return rupiah.format(amount).replace(/\s/g, " ");
}

function setTodayAsMinDate() {
  const today = new Date();
  const iso = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
    .toISOString()
    .split("T")[0];

  $$('input[type="date"]').forEach((input) => {
    input.min = iso;
  });
}

function initHeader() {
  const header = $("[data-header]");
  const toggle = $("[data-nav-toggle]");
  const menu = $("[data-nav-menu]");

  const syncHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  toggle?.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu?.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  $$('a[href^="#"]', menu).forEach((link) => {
    link.addEventListener("click", () => {
      toggle?.setAttribute("aria-expanded", "false");
      menu?.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    });
  });
}

function initRevealAnimations() {
  const revealEls = $$(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function getSelectedAreaText(select) {
  const option = select?.selectedOptions?.[0];
  return option ? option.textContent.trim() : "Belum dipilih";
}

function getDeliveryFee() {
  const areaSelect = $("[data-area-select]");
  const option = areaSelect?.selectedOptions?.[0];
  return Number(option?.dataset.fee || 0);
}

function getSelectedAddons() {
  return $$('input[name="addons"]:checked').map((checkbox) => ({
    label: checkbox.dataset.addonLabel || checkbox.value,
    price: Number(checkbox.dataset.addonPrice || 0),
  }));
}

function calculateTotal() {
  const packageSelect = $("[data-package-select]");
  const totalEl = $("[data-total]");
  const noteEl = $("[data-total-note]");
  const packageKey = packageSelect?.value || "gold";
  const selectedPackage = packages[packageKey] || packages.gold;
  const deliveryFee = getDeliveryFee();
  const addonsTotal = getSelectedAddons().reduce((sum, addon) => sum + addon.price, 0);
  const total = selectedPackage.price + deliveryFee + addonsTotal;

  if (totalEl) totalEl.textContent = formatIDR(total);

  const areaSelect = $("[data-area-select]");
  const areaValue = areaSelect?.value;
  let note = "Belum termasuk penyesuaian untuk area lain, overtime, atau request khusus.";

  if (areaValue === "other") {
    note = "Area lain belum dihitung biaya transportnya. Tim akan konfirmasi via WhatsApp.";
  } else if (packageKey === "silver" && areaValue !== "zone1") {
    note = "Untuk Silver di luar area utama, biaya tambahan akan dikonfirmasi admin.";
  }

  if (noteEl) noteEl.textContent = note;
  return { total, selectedPackage, deliveryFee, addonsTotal, note };
}

function setSelectedPackage(packageKey, shouldScroll = false) {
  if (!packages[packageKey]) return;

  const packageSelect = $("[data-package-select]");
  if (packageSelect) packageSelect.value = packageKey;

  $$('[data-package-card]').forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.packageCard === packageKey);
  });

  calculateTotal();

  if (shouldScroll) {
    const booking = $("#booking");
    booking?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => packageSelect?.focus(), 650);
  }
}

function initPackageSelectors() {
  $$('[data-select-package]').forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedPackage(button.dataset.selectPackage, true);
    });
  });

  $("[data-package-select]")?.addEventListener("change", (event) => {
    setSelectedPackage(event.target.value, false);
  });

  $("[data-area-select]")?.addEventListener("change", calculateTotal);
  $$('input[name="addons"]').forEach((checkbox) => checkbox.addEventListener("change", calculateTotal));

  setSelectedPackage($("[data-package-select]")?.value || "gold", false);
}

function initQuickForm() {
  const quickForm = $("[data-quick-form]");
  const bookingForm = $("[data-booking-form]");
  if (!quickForm || !bookingForm) return;

  quickForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(quickForm);
    const quickDate = formData.get("quickDate");
    const quickArea = String(formData.get("quickArea") || "");
    const quickPackage = String(formData.get("quickPackage") || "gold").toLowerCase();

    const dateInput = $('input[name="date"]', bookingForm);
    const areaSelect = $('[data-area-select]', bookingForm);

    if (dateInput && quickDate) dateInput.value = quickDate;

    if (areaSelect) {
      if (quickArea.includes("Denpasar")) areaSelect.value = "zone1";
      else if (quickArea.includes("Uluwatu")) areaSelect.value = "zone2";
      else if (quickArea.includes("Singaraja")) areaSelect.value = "zone3";
    }

    setSelectedPackage(quickPackage, true);
    showToast("Tanggal dan paket sudah dipindahkan ke form booking.");
  });
}

function buildWhatsAppMessage(form) {
  const data = new FormData(form);
  const packageKey = data.get("package") || "gold";
  const selectedPackage = packages[packageKey] || packages.gold;
  const areaText = getSelectedAreaText($("[data-area-select]"));
  const selectedAddons = getSelectedAddons();
  const { total, note } = calculateTotal();

  const addonsText = selectedAddons.length
    ? selectedAddons.map((addon) => `- ${addon.label} (${formatIDR(addon.price)})`).join("\n")
    : "Tidak ada add-ons";

  const message = `Halo Voicehub.id, saya ingin cek availability Wedding Audio Guestbook Rental.\n\n` +
    `Nama: ${data.get("name") || "-"}\n` +
    `WhatsApp: ${data.get("phone") || "-"}\n` +
    `Tanggal acara: ${data.get("date") || "-"}\n` +
    `Venue/Lokasi: ${data.get("venue") || "-"}\n` +
    `Jumlah tamu: ${data.get("guests") || "-"}\n\n` +
    `Paket: ${selectedPackage.label} (${formatIDR(selectedPackage.price)})\n` +
    `Area: ${areaText}\n` +
    `Add-ons:\n${addonsText}\n\n` +
    `Estimasi total: ${formatIDR(total)}\n` +
    `Catatan sistem: ${note}\n` +
    `Catatan saya: ${data.get("notes") || "-"}\n\n` +
    `Mohon info availability dan next step booking. Terima kasih.`;

  return message;
}

function initBookingForm() {
  const form = $("[data-booking-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const message = buildWhatsAppMessage(form);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    showToast("Inquiry WhatsApp sedang dibuka.");
  });

  $("[data-reset-form]")?.addEventListener("click", () => {
    form.reset();
    setSelectedPackage("gold", false);
    calculateTotal();
    showToast("Form di-reset ke pilihan default Gold.");
  });
}

function initCopyButtons() {
  $$('[data-copy]').forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        showToast("Nomor rekening berhasil disalin.");
      } catch {
        const temp = document.createElement("textarea");
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
        showToast("Nomor rekening berhasil disalin.");
      }
    });
  });
}

function initLightbox() {
  const modal = $("[data-lightbox-modal]");
  const modalImage = $("[data-lightbox-image]");
  const close = $("[data-lightbox-close]");
  if (!modal || !modalImage) return;

  const openModal = (src, alt) => {
    modalImage.src = src;
    modalImage.alt = alt || "Preview galeri";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    close?.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modalImage.src = "";
    document.body.style.overflow = "";
  };

  $$('[data-lightbox]').forEach((button) => {
    button.addEventListener("click", () => {
      const img = $("img", button);
      openModal(button.dataset.lightbox, img?.alt);
    });
  });

  close?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
}

function showToast(message) {
  let toast = $("[data-toast]");
  if (!toast) {
    toast = document.createElement("div");
    toast.dataset.toast = "";
    toast.setAttribute("role", "status");
    toast.style.position = "fixed";
    toast.style.left = "50%";
    toast.style.bottom = "5.5rem";
    toast.style.transform = "translate(-50%, 16px)";
    toast.style.zIndex = "120";
    toast.style.padding = ".85rem 1rem";
    toast.style.borderRadius = "999px";
    toast.style.color = "#fff";
    toast.style.background = "#32115f";
    toast.style.boxShadow = "0 16px 40px rgba(30, 18, 48, .22)";
    toast.style.fontWeight = "800";
    toast.style.opacity = "0";
    toast.style.transition = "opacity .2s ease, transform .2s ease";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translate(-50%, 0)";

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, 16px)";
  }, 2800);
}

function init() {
  setTodayAsMinDate();
  initHeader();
  initRevealAnimations();
  initPackageSelectors();
  initQuickForm();
  initBookingForm();
  initCopyButtons();
  initLightbox();
  calculateTotal();
}

document.addEventListener("DOMContentLoaded", init);
