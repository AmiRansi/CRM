document.addEventListener("DOMContentLoaded", () => {
  console.log("navbar.js loaded for page:", window.location.pathname);

  // لود اطلاعات کاربر
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "کاربر", role: "user" };
  const currentUserElement = document.getElementById("current-user");
  if (currentUserElement) {
    currentUserElement.textContent = currentUser.username;
  } else {
    console.error("Element #current-user not found in DOM");
  }

  // نمایش لینک مدیریت کاربران برای ادمین
  if (currentUser.role === "admin") {
    const adminLink = document.getElementById("admin-users-link");
    if (adminLink) {
      adminLink.style.display = "inline-block";
    } else {
      console.error("Element #admin-users-link not found in DOM");
    }
  }

  // لود اعلانات امروز
  window.loadTodayNotifications = function () {
    console.log("loadTodayNotifications called");
    const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    const isAdmin = currentUser.role === "admin";
    const notifList = document.getElementById("notification-list");
    const notifCount = document.getElementById("notif-count");

    if (!notifList || !notifCount) {
      console.error("Notification elements not found:", { notifList, notifCount });
      return;
    }

    notifList.innerHTML = "";
    let count = 0;

    // 📆 تاریخ امروز (بدون persianDate برای ساده‌سازی)
    const today = new Date().toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).replace(/[\u06F0-\u06F9]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
    const normalizedToday = normalizePersianDate(today);
    console.log("Normalized today:", normalizedToday);

    reminders.forEach((r, index) => {
      if (!r.date) {
        console.warn(`Reminder at index ${index} has no date:`, r);
        return;
      }
      const reminderDate = normalizePersianDate(r.date);
      console.log(`Reminder ${index} date:`, reminderDate);

      if ((isAdmin || r.createdBy === currentUser.username) && reminderDate === normalizedToday) {
        count++;
        let icon = "🟢";
        if (r.priority === "متوسط") icon = "🟡";
        if (r.priority === "زیاد") icon = "🔴";

        const li = document.createElement("li");
        li.innerHTML = `
          <div class="notif-header">
            <span><b>${icon} ${r.title || "بدون عنوان"}</b> - <small>${r.time || "نامشخص"} (${r.client || "نامشخص"})</small></span>
          </div>
          <div class="notif-content">${r.description || "بدون توضیحات"}</div>
        `;
        notifList.appendChild(li);
      }
    });

    notifCount.textContent = count;
    notifCount.style.display = count > 0 ? "inline-block" : "none";

    if (count === 0) {
      notifList.innerHTML = '<li style="text-align: center; padding: 15px;">هیچ اعلانی برای امروز وجود ندارد.</li>';
    }
    console.log("Notifications count:", count);
  };

  function normalizePersianDate(dateStr) {
    if (!dateStr) {
      console.warn("Invalid date string:", dateStr);
      return "";
    }
    return dateStr
      .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .split("/")
      .map(s => parseInt(s, 10).toString().padStart(2, "0"))
      .join("/");
  }

  // نمایش / مخفی‌سازی اعلان‌ها
  window.toggleNotifications = function () {
    const popup = document.getElementById("notification-popup");
    if (popup) {
      popup.classList.toggle("hidden");
      console.log("Notification popup toggled:", !popup.classList.contains("hidden"));
    } else {
      console.error("Element #notification-popup not found in DOM");
    }
  };

  // اتصال رویداد به notification-icon
  const notificationIcon = document.getElementById("notification-icon");
  if (notificationIcon) {
    notificationIcon.addEventListener("click", window.toggleNotifications);
    console.log("Notification icon click event attached");
  } else {
    console.error("Element #notification-icon not found in DOM");
  }

  // بستن popup با دکمه
  const closePopup = document.querySelector(".close-popup");
  if (closePopup) {
    closePopup.addEventListener("click", () => {
      const popup = document.getElementById("notification-popup");
      if (popup) {
        popup.classList.add("hidden");
        console.log("Notification popup closed via close button");
      }
    });
  } else {
    console.error("Element .close-popup not found in DOM");
  }

  // بستن popup با کلیک خارج
  document.addEventListener("click", (e) => {
    const icon = document.getElementById("notification-icon");
    const popup = document.getElementById("notification-popup");
    if (popup && icon && !popup.contains(e.target) && !icon.contains(e.target)) {
      popup.classList.add("hidden");
      console.log("Notification popup closed via outside click");
    }
  });

  // دکمه خروج
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("آیا مطمئن هستید که می‌خواهید خارج شوید؟")) {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
      }
    });
  } else {
    console.error("Element .logout-btn not found in DOM");
  }

  // منوی همبرگری
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("hidden");
      hamburger.textContent = navLinks.classList.contains("hidden") ? "☰" : "✕";
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          navLinks.classList.add("hidden");
          hamburger.textContent = "☰";
        }
      });
    });
  } else {
    console.error("Hamburger or nav-links not found:", { hamburger, navLinks });
  }

  // اجرای اولیه
  try {
    window.loadTodayNotifications();
  } catch (e) {
    console.error("Error in loadTodayNotifications:", e);
  }
});