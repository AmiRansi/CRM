function loadTodayNotifications() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  const isAdmin = user.role === "admin";

  const notifList = document.getElementById("notification-list");
  const notifCount = document.getElementById("notif-count");

  if (!notifList || !notifCount) return;

  notifList.innerHTML = "";
  let count = 0;

  // 📆 نرمال‌سازی تاریخ امروز
  const todayRaw = new Date().toLocaleDateString("fa-IR");
  const today = normalizePersianDate(todayRaw);

  reminders.forEach(r => {
    const reminderDate = normalizePersianDate(r.date);
    if (
      (isAdmin || r.createdBy === user.username) &&
      reminderDate === today
    ) {
      count++;

      // آیکون بر اساس اولویت
      let icon = "🟢";
      if (r.priority === "متوسط") icon = "🟡";
      if (r.priority === "زیاد") icon = "🔴";

      const li = document.createElement("li");
      li.textContent = `${icon} ${r.title} - ${r.time} (${r.client})`;
      notifList.appendChild(li);
    }
  });

  notifCount.textContent = count;

  // نمایش لینک مدیریت کاربران برای ادمین
  if (isAdmin) {
    const adminLink = document.getElementById("admin-users-link");
    if (adminLink) adminLink.style.display = "inline";
  }
}

function normalizePersianDate(dateStr) {
  return dateStr
    .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .split("/")
    .map(s => parseInt(s, 10).toString())
    .join("/");
}

// نمایش / مخفی‌سازی اعلان‌ها
function toggleNotifications() {
  const popup = document.getElementById("notification-popup");
  popup.style.display = popup.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", (e) => {
  const icon = document.getElementById("notification-icon");
  const popup = document.getElementById("notification-popup");
  if (!popup.contains(e.target) && !icon.contains(e.target)) {
    popup.style.display = "none";
  }
});
