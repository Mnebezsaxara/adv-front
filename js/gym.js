var carousel = document.getElementById("gymCarousel");
var textItems = document.querySelectorAll(".carousel-text-item");

carousel.addEventListener("slide.bs.carousel", function (event) {
  textItems.forEach(function (item) {
    item.classList.remove("active");
  });

  var slideIndex = event.to;
  document
    .getElementById("textSlide" + (slideIndex + 1))
    .classList.add("active");
});

document
  .querySelectorAll(".custom-video-container")
  .forEach((container, index) => {
    const video = container.querySelector("video");
    const button = container.querySelector("button");

    button.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        button.classList.add("paused");
      } else {
        video.pause();
        button.classList.remove("paused");
      }
    });

    video.addEventListener("play", () => button.classList.add("paused"));
    video.addEventListener("pause", () => button.classList.remove("paused"));
  });

document
  .getElementById("hamburger-menu")
  .addEventListener("click", function () {
    const navbarLinks = document.getElementById("navbar-links");

    // Toggle active class for animation
    navbarLinks.classList.toggle("active");
    this.classList.toggle("open"); // Toggle "open" class for hamburger
  });

ymaps.ready(function () {
  var map = new ymaps.Map("yandex-map", {
    center: [42.313467, 69.621923],
    zoom: 16,
    controls: [],
  });

  map.controls.add("zoomControl", {
    size: "small",
  });

  var placemark = new ymaps.Placemark([42.313467, 69.621923], {
    balloonContent: "<strong>Beket Batyra 86 </strong><br>Shymkent",
  });

  map.behaviors.enable("drag");
  map.behaviors.disable(["scrollZoom", "rightMouseButtonMagnifier"]);

  map.geoObjects.add(placemark);
});

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("paymentModal");
  const closeBtn = document.querySelector(".close");
  const subscribeButtons = document.querySelectorAll(".subscribe-btn");
  const paymentForm = document.getElementById("paymentForm");
  const studentCheckbox = document.getElementById("studentDiscount");

  let currentPlan = null;
  let currentPrice = 0;

  // Add at the top of the file
  function isAuthenticated() {
    return localStorage.getItem("user") !== null;
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }

  // Update the subscribe button click handler
  subscribeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (!isAuthenticated()) {
        alert("Пожалуйста, войдите в систему для оформления абонемента");
        window.location.href = "/adv-front/form.html"; // Updated path to login page
        return;
      }

      currentPlan = this.dataset.plan;
      currentPrice = parseInt(this.dataset.price);
      updatePriceSummary();
      modal.style.display = "block";
    });
  });

  // Close modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Update price when student discount is toggled
  studentCheckbox.addEventListener("change", updatePriceSummary);

  function updatePriceSummary() {
    const subtotal = currentPrice;
    const discount = studentCheckbox.checked ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;

    document.getElementById(
      "subtotal"
    ).textContent = `${subtotal.toLocaleString()} ₸`;
    document.getElementById(
      "discount"
    ).textContent = `${discount.toLocaleString()} ₸`;
    document.getElementById(
      "total"
    ).textContent = `${total.toLocaleString()} ₸`;
  }

  // Update the payment form submission
  paymentForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!isAuthenticated()) {
      alert("Необходимо войти в систему");
      window.location.href = "/adv-front/form.html"; // Updated path to login page
      return;
    }

    const user = getCurrentUser();
    const totalText = document.getElementById("total").textContent;
    const total = parseInt(totalText.replace(/[^\d]/g, ""));

    const payload = {
      cartItems: [
        {
          id: currentPlan,
          name: getPlanName(currentPlan),
          price: total,
          quantity: 1,
        },
      ],
      customer: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      payment: {
        amount: total,
        currency: "KZT",
        isStudentDiscount: studentCheckbox.checked,
      },
      bookingId: generateBookingId(),
    };

    try {
      const response = await fetch("http://localhost:8081/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (responseData.status === "success") {
        alert(
          "Оплата прошла успешно! Проверьте вашу почту для получения чека."
        );
        modal.style.display = "none";
        paymentForm.reset();
      } else {
        throw new Error(responseData.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error details:", error);
      alert("Ошибка обработки оплаты: " + error.message);
    }
  });

  // Helper function to get plan name
  function getPlanName(planId) {
    const planNames = {
      "day-pass": "Дневной тариф",
      "basic-monthly": "1 месяц 12 посещений",
      unlimited: "1 месяц безлимит",
      "six-month": "6 месяцев безлимит",
      annual: "1 год безлимит",
      "women-annual": "Женский безлимит на год",
    };
    return planNames[planId] || "Unknown Plan";
  }

  // Helper function to generate booking ID
  function generateBookingId() {
    return "BK-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  }
});
