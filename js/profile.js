document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const clients = JSON.parse(localStorage.getItem("clients")) || [];
  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  const logs = JSON.parse(localStorage.getItem("logs")) || [];

  if (!user) return location.href = "login.html";

  $("#username-display").text(user.username);
  $("#role-display").text(user.role);
  $("#fullName").val(user.fullName || "");
  $("#email").val(user.email || "");
  $("#fullname-display").text(user.fullName || "-");
  $("#email-display").text(user.email || "-");
  $("#join-date-display").text(user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : "-");

  if (user.role === "admin") {
    document.getElementById("admin-backup").style.display = "block";
  }

  // ویرایش اطلاعات
  document.getElementById("edit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const index = users.findIndex(u => u.username === user.username);
    if (index === -1) return alert("کاربر یافت نشد!");
    users[index].fullName = fullName;
    users[index].email = email;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[index]));
    alert("✅ اطلاعات بروزرسانی شد");
    location.reload();
  });

  // تغییر رمز
  document.getElementById("password-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const oldPass = document.getElementById("old-password").value;
    const newPass = document.getElementById("new-password").value;
    const confirmPass = document.getElementById("confirm-password").value;
    if (newPass !== confirmPass) return alert("رمز جدید با تأیید آن مطابقت ندارد.");
    const index = users.findIndex(u => u.username === user.username);
    if (index === -1) return alert("کاربر یافت نشد!");
    if (users[index].password !== oldPass) return alert("رمز فعلی اشتباه است.");
    users[index].password = newPass;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[index]));
    alert("✅ رمز عبور با موفقیت تغییر یافت");
    e.target.reset();
  });

  // خروج از حساب
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    location.href = "login.html";
  });

  // 📥 توابع خروجی اکسل (فقط برای admin)
  function exportToExcel(data, filename) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, filename);
  }

  const exportBtns = {
    "export-users-btn": () => {
      const data = users.map(u => ({
        "نام کاربری": u.username,
        "نقش": u.role,
        "نام کامل": u.fullName || '',
        "ایمیل": u.email || '',
        "تاریخ ثبت": u.createdAt || ''
      }));
      exportToExcel(data, "بکاپ_کاربران.xlsx");
    },
    "export-clients-btn": () => {
      const data = clients.map(c => ({
        "شرکت": c.company,
        "خریدار": c.buyer,
        "شماره": c.mobile || '',
        "ایمیل": c.email || '',
        "صنعت": c.industry || '',
        "وضعیت": c.status || '',
        "ثبت توسط": c.createdBy,
        "تاریخ ثبت": c.createdAt || ''
      }));
      exportToExcel(data, "بکاپ_مشتریان.xlsx");
    },
    "export-reminders-btn": () => {
      const data = reminders.map(r => ({
        "عنوان": r.title,
        "توضیح": r.description,
        "تاریخ": r.date,
        "ساعت": r.time,
        "اولویت": r.priority,
        "دسته": r.category,
        "تکرار": r.repeat,
        "مشتری": r.client,
        "ثبت توسط": r.createdBy,
        "انجام‌شده": r.isDone ? "بله" : "خیر"
      }));
      exportToExcel(data, "بکاپ_یادآورها.xlsx");
    },
    "export-logs-btn": () => {
      const data = logs.map(l => ({
        "کاربر": l.user,
        "عملیات": l.action,
        "مشتری": l.company || '',
        "توضیح": l.description || '',
        "زمان": l.time || ''
      }));
      exportToExcel(data, "بکاپ_گزارش‌ها.xlsx");
    }
  };

  // اتصال دکمه‌ها
  Object.keys(exportBtns).forEach(id => {
    const btn = document.getElementById(id);
    if (btn && user.role === "admin") {
      btn.addEventListener("click", exportBtns[id]);
    }
  });
});