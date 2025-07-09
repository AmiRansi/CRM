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

  // 🔧 تابع تبدیل اعداد فارسی به انگلیسی
  function convertPersianToEnglish(str) {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    for (let i = 0; i < persianNumbers.length; i++) {
      str = str.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
    }
    return str;
  }

  // 🔧 تابع نرمال‌سازی تاریخ
  function normalizeDate(dateStr) {
    if (!dateStr) return '';
    let normalized = convertPersianToEnglish(dateStr);
    if (normalized.includes('-')) {
      normalized = normalized.replace(/-/g, '/');
    }
    return normalized.split('/')
      .map(part => parseInt(part, 10).toString())
      .join('/');
  }

  // 🔧 تابع تبدیل تاریخ میلادی به شمسی با persianDate
  function toJalaaliDate(date) {
    if (typeof persianDate !== 'undefined') {
      return new persianDate(date).format('YYYY/M/D');
    }
    return date.toLocaleDateString("fa-IR", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$2/$1');
  }

  // 🔧 تابع تبدیل تاریخ HTML input به شمسی
  function convertHtmlDateToShamsi(htmlDate) {
    if (!htmlDate || !htmlDate.includes('-')) return htmlDate;
    try {
      const date = new Date(htmlDate);
      return toJalaaliDate(date);
    } catch (e) {
      return htmlDate;
    }
  }

  // 📈 نمودار گزارش‌های ۷ روز اخیر
  const today = new Date();
  const recentDates = [];
  
  // تولید تاریخ‌های ۷ روز اخیر با persianDate
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const shamsiDate = toJalaaliDate(date);
    recentDates.push(shamsiDate);
  }

  const chartData = {};
  recentDates.forEach(date => {
    chartData[date] = 0;
  });

  // شمارش گزارش‌ها
  logs.forEach(log => {
    if (!log.time) return;
    
    const logDatePart = log.time.split(" - ")[0].trim();
    const normalizedLogDate = normalizeDate(convertHtmlDateToShamsi(logDatePart));
    
    recentDates.forEach(chartDate => {
      const normalizedChartDate = normalizeDate(chartDate);
      if (normalizedLogDate === normalizedChartDate) {
        if (isAdmin || log.user === user.username) {
          chartData[chartDate]++;
        }
      }
    });
  });

  // رسم نمودار
  new Chart($("#weekly-chart")[0], {
    type: "line",
    data: {
      labels: recentDates, // مستقیماً از recentDates استفاده می‌کنیم
      datasets: [{
        label: "تعداد گزارش‌ها",
        data: Object.values(chartData),
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

  // 🔔 یادآوری‌های امروز
  const todayPersian = toJalaaliDate(today);
  const normalizedToday = normalizeDate(todayPersian);
  const todayList = $("#today-reminders");

  const todayReminders = reminders.filter(reminder => {
    const userMatch = isAdmin || reminder.createdBy === user.username;
    if (!userMatch) return false;
    
    const reminderDate = convertHtmlDateToShamsi(reminder.date);
    const normalizedReminderDate = normalizeDate(reminderDate);
    
    return normalizedReminderDate === normalizedToday;
  });

  todayList.empty();
  if (todayReminders.length === 0) {
    todayList.html("<li>یادآوری مهمی برای امروز وجود ندارد.</li>");
  } else {
    todayReminders.forEach(r => {
      const li = $("<li>")
        .addClass("info-list-item")
        .text(`${r.time} - ${r.title} (${r.client})`);
      todayList.append(li);
    });
  }

  // 🔔 اعلان‌ها در نوار بالایی
  const notifList = $("#notification-list");
  const notifCount = $("#notif-count");
  
  if (notifList.length && notifCount.length) {
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
  }

  // 👑 آمارهای مدیریتی فقط برای admin
  if (isAdmin) {
    const topClients = {};
    clients.forEach(c => {
      if (c.createdBy) {
        topClients[c.createdBy] = (topClients[c.createdBy] || 0) + 1;
      }
    });
    
    const bestClientUser = Object.entries(topClients)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (bestClientUser) {
      $("#top-client-user").text(`${bestClientUser[0]} (${bestClientUser[1]})`);
      $("#top-client-user-box").show();
    }

    const topLogs = {};
    logs.forEach(l => {
      if (l.user) {
        topLogs[l.user] = (topLogs[l.user] || 0) + 1;
      }
    });
    
    const bestLogUser = Object.entries(topLogs)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (bestLogUser) {
      $("#top-log-user").text(`${bestLogUser[0]} (${bestLogUser[1]})`);
      $("#top-log-user-box").show();
    }

    const activeUsers = [...new Set(logs.map(l => l.user).filter(u => u))];
    $("#active-users").text(activeUsers.length);
    $("#active-user-box").show();
  }
});

// 📦 توابع کمکی برای اعلان‌ها
function toggleNotifications() {
  const box = document.getElementById("notification-popup");
  if (box) {
    box.style.display = box.style.display === "block" ? "none" : "block";
  }
}

// 📦 بستن باکس اعلان با کلیک بیرون
document.addEventListener("click", e => {
  const popup = document.getElementById("notification-popup");
  const icon = document.getElementById("notification-icon");
  
  if (popup && icon && 
      !popup.contains(e.target) && 
      !icon.contains(e.target)) {
    popup.style.display = "none";
  }
});