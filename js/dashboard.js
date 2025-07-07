document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return location.href = "login.html";

  $("#user-name").text(user.username);
  $("#user-role").text(user.role);

  const clients = JSON.parse(localStorage.getItem("clients")) || [];
  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  const isAdmin = user.role === "admin";

  const userClients = isAdmin ? clients : clients.filter(c => c.createdBy === user.username);
  const userReminders = isAdmin ? reminders : reminders.filter(r => r.createdBy === user.username);
  const userLogs = isAdmin ? logs : logs.filter(l => l.user === user.username);

  $("#clients-count").text(userClients.length);
  $("#reminders-count").text(userReminders.length);
  $("#logs-count").text(userLogs.length);

  // 🔧 نرمال‌سازی تاریخ شمسی
  function normalizePersianDate(dateStr) {
    return dateStr
      .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)) // تبدیل اعداد فارسی به انگلیسی
      .split('/')
      .map(s => parseInt(s, 10).toString()) // حذف صفرهای پیشوند
      .join('/');
  }

  // 📈 نمودار گزارش‌های ۷ روز اخیر
  const recentDates = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString("fa-IR");
  }).reverse();

  const chartMap = {};
  recentDates.forEach(date => chartMap[date] = 0);

  logs.forEach(log => {
    if (!log.time) return;
    const rawDate = log.time.split(" - ")[0].trim();
    const normalizedLogDate = normalizePersianDate(rawDate);

    for (let key of Object.keys(chartMap)) {
      if (normalizePersianDate(key) === normalizedLogDate) {
        if (isAdmin || log.user === user.username) {
          chartMap[key]++;
        }
      }
    }
  });

  new Chart($("#weekly-chart")[0], {
    type: "line",
    data: {
      labels: Object.keys(chartMap),
      datasets: [{
        label: "تعداد گزارش‌ها",
        data: Object.values(chartMap),
        borderColor: "#ed1c22",
        backgroundColor: "rgba(237,28,34,0.1)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // 🔔 یادآوری‌های مهم امروز
  const today = new Date().toLocaleDateString("fa-IR");
  const normalizedToday = normalizePersianDate(today);
  const todayList = $("#today-reminders");

  const todayReminders = reminders.filter(r =>
    (isAdmin || r.createdBy === user.username) &&
    normalizePersianDate(r.date) === normalizePersianDate(today)
  );
  

  if (todayReminders.length === 0) {
    todayList.html("<li>یادآوری مهمی برای امروز وجود ندارد.</li>");
  } else {
    todayReminders.forEach(r => {
      $("<li>").addClass("info-list-item").text(`${r.time} - ${r.title} (${r.client})`).appendTo(todayList);
    });
  }

  // 🔔 اعلان‌ها در نوار بالایی
  const notifList = $("#notification-list");
  const notifCount = $("#notif-count");
  notifList.empty();
  let notifCounter = 0;
  
  todayReminders.forEach(r => {
    notifCounter++;
    let icon = "🟢";
    if (r.priority === "متوسط") icon = "🟡";
    if (r.priority === "زیاد") icon = "🔴";
    
    $("<li>")
      .text(`${icon} ${r.title} - ${r.time}`)
      .appendTo(notifList);
  });
  notifCount.text(notifCounter);
  

  // 👑 آمارهای مدیریتی فقط برای admin
  if (isAdmin) {
    // بیشترین ثبت مشتری
    const topClients = {};
    clients.forEach(c => {
      topClients[c.createdBy] = (topClients[c.createdBy] || 0) + 1;
    });
    const bestClientUser = Object.entries(topClients).sort((a, b) => b[1] - a[1])[0];
    if (bestClientUser) {
      $("#top-client-user").text(`${bestClientUser[0]} (${bestClientUser[1]})`);
      $("#top-client-user-box").show();
    }

    // بیشترین ثبت گزارش
    const topLogs = {};
    logs.forEach(l => {
      topLogs[l.user] = (topLogs[l.user] || 0) + 1;
    });
    const bestLogUser = Object.entries(topLogs).sort((a, b) => b[1] - a[1])[0];
    if (bestLogUser) {
      $("#top-log-user").text(`${bestLogUser[0]} (${bestLogUser[1]})`);
      $("#top-log-user-box").show();
    }

    // تعداد کاربران فعال هفته
    const activeUsers = [...new Set(logs.map(l => l.user))];
    $("#active-users").text(activeUsers.length);
    $("#active-user-box").show();
  }
});

// 📦 تابع باز/بستن اعلان‌ها
function toggleNotifications() {
  const box = document.getElementById("notification-popup");
  box.style.display = box.style.display === "block" ? "none" : "block";
}

// 📦 بستن باکس اعلان با کلیک بیرون
document.addEventListener("click", e => {
  const popup = document.getElementById("notification-popup");
  const icon = document.getElementById("notification-icon");
  if (!popup.contains(e.target) && !icon.contains(e.target)) {
    popup.style.display = "none";
  }
});
