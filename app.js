const packages = {
  starter: {
    label: "Selection 1",
    price: 25,
    photos: 25,
    locations: 1
  },
  classic: {
    label: "Selection 2",
    price: 50,
    photos: 50,
    locations: 1
  },
  signature: {
    label: "Selection 3",
    price: 100,
    photos: 100,
    locations: 2
  }
};

const form = document.querySelector("#bookingForm");
const message = document.querySelector("#formMessage");
const summaryPackage = document.querySelector("#summaryPackage");
const summaryIncludes = document.querySelector("#summaryIncludes");
const summaryTax = document.querySelector("#summaryTax");
const summaryShipping = document.querySelector("#summaryShipping");
const summaryTotal = document.querySelector("#summaryTotal");
const donateButton = document.querySelector("#donateButton");
const donationMessage = document.querySelector("#donationMessage");
const dateInput = document.querySelector("#sessionDate");
const shootStateInput = document.querySelector("#shootState");
const availabilityMessage = document.querySelector("#availabilityMessage");
const viewButtons = document.querySelectorAll(".view-button");
const bookingView = document.querySelector("#bookingForm");
const adminView = document.querySelector("#adminView");
const adminCodeForm = document.querySelector("#adminCodeForm");
const adminCodeInput = document.querySelector("#adminCode");
const adminCodeMessage = document.querySelector("#adminCodeMessage");
const adminContent = document.querySelector("#adminContent");
const bookingList = document.querySelector("#bookingList");
const emptyBookings = document.querySelector("#emptyBookings");
const clearBookings = document.querySelector("#clearBookings");
const lockAdmin = document.querySelector("#lockAdmin");
const bookingCount = document.querySelector("#bookingCount");
const photoCount = document.querySelector("#photoCount");
const locationCount = document.querySelector("#locationCount");
const adminRevenue = document.querySelector("#adminRevenue");
const pendingMoney = document.querySelector("#pendingMoney");
const readyMoney = document.querySelector("#readyMoney");
const movedMoney = document.querySelector("#movedMoney");
const cardTransferForm = document.querySelector("#cardTransferForm");
const cardHolderNameInput = document.querySelector("#cardHolderName");
const cardNumberInput = document.querySelector("#cardNumber");
const cardExpiryInput = document.querySelector("#cardExpiry");
const cardCvvInput = document.querySelector("#cardCvv");
const cardZipInput = document.querySelector("#cardZip");
const recordCardTransfer = document.querySelector("#recordCardTransfer");
const moneyMessage = document.querySelector("#moneyMessage");
const adminCode = "2014-2026";
const taxRate = 0.03;
const extraDonationAmount = 5;
const usbShippingFee = 10;
const storageKey = "outdoorPhotographyBookings";
const payoutStorageKey = "outdoorPhotographyPayouts";
let adminUnlocked = false;
let extraDonationSelected = false;

const today = new Date();
today.setHours(0, 0, 0, 0);
dateInput.min = today.toISOString().split("T")[0];

function selectedPackage() {
  const selected = form.elements.package.value;
  return packages[selected];
}

function selectedPayment() {
  return form.elements.payment.value;
}

function selectedDelivery() {
  return form.elements.delivery.value;
}

function selectedShootState() {
  return form.elements.shootState.value;
}

function updateSummary() {
  const pkg = selectedPackage();
  const cost = getPackageCost(pkg);
  summaryPackage.textContent = pkg.label;
  summaryIncludes.textContent = `${pkg.photos} photos, ${pkg.locations} location${pkg.locations > 1 ? "s" : ""}`;
  summaryTax.textContent = formatMoney(cost.tax);
  summaryShipping.textContent = formatMoney(cost.shippingFee);
  summaryTotal.textContent = formatMoney(cost.total);
  donateButton.classList.toggle("active", extraDonationSelected);
  donateButton.setAttribute("aria-pressed", String(extraDonationSelected));
  donateButton.textContent = extraDonationSelected ? "Remove $5 donation" : "Add $5 donation";
  donationMessage.textContent = `Optional extra donation to children's hospitals: ${formatMoney(cost.extraDonation)}`;
  updateAvailabilityMessage();
}

function showMessage(text, isSuccess = false) {
  message.textContent = text;
  message.classList.toggle("success", isSuccess);
}

function loadBookings() {
  try {
    const bookings = JSON.parse(localStorage.getItem(storageKey)) || [];
    return bookings.map(normalizeBooking);
  } catch {
    return [];
  }
}

function normalizeBooking(booking) {
  const subtotal = Number(booking.subtotal ?? booking.price) || 0;
  const tax = Number(booking.tax ?? calculateTax(subtotal)) || 0;
  const extraDonation = Number(booking.extraDonation) || 0;
  const shippingFee = Number(booking.shippingFee) || 0;
  const hasSavedTax = "subtotal" in booking || "tax" in booking;
  const total = hasSavedTax
    ? Number(booking.price ?? subtotal + tax + extraDonation + shippingFee) || 0
    : Math.round((subtotal + tax + extraDonation + shippingFee) * 100) / 100;

  return {
    ...booking,
    subtotal,
    tax,
    extraDonation,
    shippingFee,
    price: total,
    shootState: booking.shootState || "Arizona",
    deliveryMethod: booking.deliveryMethod || "Online gallery",
    photos: Number(booking.photos) || 0,
    locations: Number(booking.locations) || 0,
    moneyStatus: booking.moneyStatus || "pending",
    payoutId: booking.payoutId || ""
  };
}

function saveBookings(bookings) {
  localStorage.setItem(storageKey, JSON.stringify(bookings));
}

function loadPayouts() {
  try {
    return JSON.parse(localStorage.getItem(payoutStorageKey)) || [];
  } catch {
    return [];
  }
}

function savePayouts(payouts) {
  localStorage.setItem(payoutStorageKey, JSON.stringify(payouts));
}

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(amount) || 0);
}

function calculateTax(subtotal) {
  return Math.round((Number(subtotal) || 0) * taxRate * 100) / 100;
}

function getPackageCost(pkg) {
  const subtotal = Number(pkg.price) || 0;
  const tax = calculateTax(subtotal);
  const extraDonation = extraDonationSelected ? extraDonationAmount : 0;
  const shippingFee = selectedDelivery() === "USB drive shipped" ? usbShippingFee : 0;
  return {
    subtotal,
    tax,
    extraDonation,
    shippingFee,
    total: Math.round((subtotal + tax + extraDonation + shippingFee) * 100) / 100
  };
}

function getAvailabilityIssue(state, dateValue) {
  return "";
}

function updateAvailabilityMessage() {
  availabilityMessage.textContent = "Arizona is available year-round.";
  availabilityMessage.classList.add("success");
}

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function cardLastFour(value) {
  return onlyDigits(value).slice(-4);
}

function hasValidCardDetails() {
  const cardDigits = onlyDigits(cardNumberInput.value);
  const cvvDigits = onlyDigits(cardCvvInput.value);
  const zipDigits = onlyDigits(cardZipInput.value);
  const expiry = cardExpiryInput.value.trim();
  const hasExpiryShape = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);

  return (
    cardHolderNameInput.value.trim().length > 1 &&
    cardDigits.length >= 12 &&
    hasExpiryShape &&
    cvvDigits.length >= 3 &&
    zipDigits.length >= 5
  );
}

function getMoneyTotals(bookings, payouts) {
  return {
    pending: bookings
      .filter((booking) => booking.moneyStatus === "pending")
      .reduce((total, booking) => total + booking.price, 0),
    ready: bookings
      .filter((booking) => booking.moneyStatus === "ready")
      .reduce((total, booking) => total + booking.price, 0),
    moved: payouts.reduce((total, payout) => total + (Number(payout.amount) || 0), 0)
  };
}

function switchView(view) {
  const isAdmin = view === "admin";
  bookingView.classList.toggle("active", !isAdmin);
  adminView.classList.toggle("active", isAdmin);

  viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  if (isAdmin) {
    renderAdminArea();
  }
}

function renderAdminArea() {
  adminCodeForm.hidden = adminUnlocked;
  adminContent.hidden = !adminUnlocked;

  if (adminUnlocked) {
    renderBookings();
  } else {
    adminCodeInput.focus();
  }
}

function renderBookings() {
  const bookings = loadBookings();
  const payouts = loadPayouts();
  const totals = bookings.reduce(
    (sum, booking) => ({
      revenue: sum.revenue + booking.price,
      photos: sum.photos + booking.photos,
      locations: sum.locations + booking.locations
    }),
    { revenue: 0, photos: 0, locations: 0 }
  );
  const moneyTotals = getMoneyTotals(bookings, payouts);

  bookingCount.textContent = bookings.length;
  photoCount.textContent = totals.photos;
  locationCount.textContent = totals.locations;
  adminRevenue.textContent = formatMoney(totals.revenue);
  pendingMoney.textContent = formatMoney(moneyTotals.pending);
  readyMoney.textContent = formatMoney(moneyTotals.ready);
  movedMoney.textContent = formatMoney(moneyTotals.moved);
  recordCardTransfer.disabled = moneyTotals.ready === 0;
  clearBookings.disabled = bookings.length === 0;
  emptyBookings.hidden = bookings.length > 0;

  bookingList.innerHTML = bookings
    .map((booking) => {
      const notes = escapeText(booking.notes || "No location notes yet.");
      const isPending = booking.moneyStatus === "pending";
      const isReady = booking.moneyStatus === "ready";
      const statusClass = isPending ? "pending" : booking.moneyStatus === "moved" ? "moved" : "";
      const statusText = isPending ? "Waiting collection" : isReady ? "Ready for card" : "Moved to card";
      const actionButton = isPending
        ? `<button class="booking-action" type="button" data-money-action="collect" data-booking-id="${escapeText(booking.id)}">Collect ${formatMoney(booking.price)}</button>`
        : isReady
          ? `<button class="booking-action secondary" type="button" data-money-action="undo" data-booking-id="${escapeText(booking.id)}">Mark pending</button>`
          : "";

      return `
        <article class="booking-item">
          <div class="booking-row">
            <div>
              <h3>${escapeText(booking.name)}</h3>
              <p class="booking-notes">${notes}</p>
            </div>
            <div class="booking-money">
              <div class="booking-price">${formatMoney(escapeText(booking.price))}</div>
              <span class="status-pill ${statusClass}">${statusText}</span>
              ${actionButton}
            </div>
          </div>
          <div class="booking-meta">
            <div>
              <span>Session</span>
              <strong>${escapeText(booking.packageLabel)}</strong>
            </div>
            <div>
              <span>Date and time</span>
              <strong>${escapeText(booking.date)} at ${escapeText(booking.time)}</strong>
            </div>
            <div>
              <span>Payment</span>
              <strong>${escapeText(booking.payment)}</strong>
            </div>
            <div>
              <span>State</span>
              <strong>${escapeText(booking.shootState)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>${escapeText(booking.deliveryMethod)}</strong>
            </div>
            <div>
              <span>Includes</span>
              <strong>${escapeText(booking.photos)} photos</strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>${formatMoney(booking.tax)}</strong>
            </div>
            <div>
              <span>Extra donation</span>
              <strong>${formatMoney(booking.extraDonation)}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <strong>${formatMoney(booking.shippingFee)}</strong>
            </div>
            <div>
              <span>Locations</span>
              <strong>${escapeText(booking.locations)}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>${escapeText(booking.email)}</strong>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function updateBookingMoneyStatus(bookingId, moneyStatus) {
  const bookings = loadBookings().map((booking) =>
    booking.id === bookingId
      ? { ...booking, moneyStatus, payoutId: "" }
      : booking
  );

  saveBookings(bookings);
  renderBookings();
}

form.addEventListener("change", updateSummary);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    showMessage("Please fill in the required booking details.");
    return;
  }

  const pkg = selectedPackage();
  const name = form.elements.clientName.value.trim();
  const email = form.elements.clientEmail.value.trim();
  const date = form.elements.sessionDate.value;
  const time = form.elements.sessionTime.value;
  const payment = selectedPayment();
  const shootState = selectedShootState();
  const deliveryMethod = selectedDelivery();
  const notes = form.elements.locationNotes.value.trim();
  const bookings = loadBookings();
  const cost = getPackageCost(pkg);
  const availabilityIssue = getAvailabilityIssue(shootState, date);

  if (availabilityIssue) {
    showMessage(availabilityIssue);
    return;
  }

  bookings.unshift({
    id: crypto.randomUUID(),
    name,
    email,
    date,
    time,
    notes,
    payment,
    shootState,
    deliveryMethod,
    packageLabel: pkg.label,
    subtotal: cost.subtotal,
    tax: cost.tax,
    extraDonation: cost.extraDonation,
    shippingFee: cost.shippingFee,
    price: cost.total,
    photos: pkg.photos,
    locations: pkg.locations,
    moneyStatus: "pending",
    payoutId: "",
    createdAt: new Date().toISOString()
  });

  saveBookings(bookings);

  showMessage(
    `${name}, your outdoor ${pkg.label} session in ${shootState} is reserved for ${date} at ${time}. Delivery: ${deliveryMethod}. Shipping: ${formatMoney(cost.shippingFee)}. Tax: ${formatMoney(cost.tax)}. Extra donation: ${formatMoney(cost.extraDonation)}. Total: ${formatMoney(cost.total)}. Payment method: ${payment}.`,
    true
  );
  renderBookings();
});

donateButton.addEventListener("click", () => {
  extraDonationSelected = !extraDonationSelected;
  updateSummary();
});

shootStateInput.addEventListener("change", updateAvailabilityMessage);
dateInput.addEventListener("change", updateAvailabilityMessage);

bookingList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-money-action]");

  if (!button) {
    return;
  }

  const status = button.dataset.moneyAction === "collect" ? "ready" : "pending";
  updateBookingMoneyStatus(button.dataset.bookingId, status);
  moneyMessage.textContent = status === "ready" ? "Money marked collected." : "Money marked pending.";
  moneyMessage.classList.add("success");
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

adminCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (adminCodeInput.value.trim() !== adminCode) {
    adminCodeMessage.textContent = "That code did not match.";
    adminCodeMessage.classList.remove("success");
    adminCodeInput.select();
    return;
  }

  adminUnlocked = true;
  adminCodeForm.reset();
  adminCodeMessage.textContent = "";
  renderAdminArea();
});

lockAdmin.addEventListener("click", () => {
  adminUnlocked = false;
  renderAdminArea();
});

cardTransferForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const bookings = loadBookings();
  const readyBookings = bookings.filter((booking) => booking.moneyStatus === "ready");
  const amount = readyBookings.reduce((total, booking) => total + booking.price, 0);

  if (amount === 0) {
    moneyMessage.textContent = "No collected money ready for card.";
    moneyMessage.classList.remove("success");
    return;
  }

  const payoutId = crypto.randomUUID();
  const lastFour = cardLastFour(cardNumberInput.value);
  const cardLabel = lastFour ? `Card ending ${lastFour}` : "Card";

  if (!hasValidCardDetails()) {
    moneyMessage.textContent = "Please enter the card details.";
    moneyMessage.classList.remove("success");
    return;
  }

  const updatedBookings = bookings.map((booking) =>
    booking.moneyStatus === "ready"
      ? {
          ...booking,
          moneyStatus: "moved",
          payoutId,
          payoutCard: cardLabel,
          paidOutAt: new Date().toISOString()
        }
      : booking
  );
  const payouts = loadPayouts();

  payouts.unshift({
    id: payoutId,
    amount,
    cardLabel,
    cardholderName: cardHolderNameInput.value.trim(),
    createdAt: new Date().toISOString()
  });

  saveBookings(updatedBookings);
  savePayouts(payouts);
  cardTransferForm.reset();
  moneyMessage.textContent = `${formatMoney(amount)} recorded for ${cardLabel}.`;
  moneyMessage.classList.add("success");
  renderBookings();
});

cardNumberInput.addEventListener("input", () => {
  const digits = onlyDigits(cardNumberInput.value).slice(0, 16);
  cardNumberInput.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
});

cardExpiryInput.addEventListener("input", () => {
  const digits = onlyDigits(cardExpiryInput.value).slice(0, 4);
  cardExpiryInput.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
});

cardCvvInput.addEventListener("input", () => {
  cardCvvInput.value = onlyDigits(cardCvvInput.value).slice(0, 4);
});

clearBookings.addEventListener("click", () => {
  saveBookings([]);
  savePayouts([]);
  moneyMessage.textContent = "";
  renderBookings();
});

updateSummary();
renderBookings();
