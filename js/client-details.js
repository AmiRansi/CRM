document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const companyName = decodeURIComponent(urlParams.get("company"));
  const clients = JSON.parse(localStorage.getItem("clients")) || [];
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "کاربر", role: "user" };

  const client = clients.find(c => c.company === companyName);
  if (!client) {
    alert("مشتری یافت نشد");
    window.location.href = "clients.html";
    return;
  }

  // نمایش اطلاعات مشتری
  const infoCompany = document.getElementById("info-company");
  const infoBuyer = document.getElementById("info-buyer");
  const infoEmail = document.getElementById("info-email");
  const infoIndustry = document.getElementById("info-industry");
  const infoWebsite = document.getElementById("info-website");
  const infoStatus = document.getElementById("info-status");
  const infoDate = document.getElementById("info-date");
  const infoRating = document.getElementById("info-rating");

  infoCompany.textContent = client.company || "نامشخص";
  infoBuyer.textContent = client.buyer || "نامشخص";
  infoEmail.textContent = client.email || "-";
  infoIndustry.textContent = client.industry || "-";
  infoWebsite.textContent = client.website || "-";
  infoStatus.textContent = client.status || "-";
  infoDate.textContent = client.createdAt || "-";
  infoRating.textContent = "⭐".repeat(client.rating || 0);

  // فرم ویرایش مشتری
  const editForm = document.getElementById("client-edit-form");
  const editCompany = document.getElementById("edit-company");
  const editBuyer = document.getElementById("edit-buyer");
  const editPhone = document.getElementById("edit-phone");
  const editMobile = document.getElementById("edit-mobile");
  const editEmail = document.getElementById("edit-email");
  const editIndustry = document.getElementById("edit-industry");
  const editWebsite = document.getElementById("edit-website");
  const editAddress = document.getElementById("edit-address");
  const editLead = document.getElementById("edit-lead");
  const editStatus = document.getElementById("edit-status");
  const editRating = document.getElementById("edit-rating");
  const formMessage = editForm.querySelector(".form-message");

  function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `form-message ${type} show`;
    setTimeout(() => element.classList.remove("show"), 3000);
  }

  document.querySelector(".btn-edit-client").addEventListener("click", () => {
    editCompany.value = client.company || "";
    editBuyer.value = client.buyer || "";
    editPhone.value = client.phone || "";
    editMobile.value = client.mobile || "";
    editEmail.value = client.email || "";
    editIndustry.value = client.industry || "";
    religiosos

System: editWebsite.value = client.website || "";
    editAddress.value = client.address || "";
    editLead.value = client.lead || "";
    editStatus.value = client.status || "فعال";
    editRating.value = client.rating || "5";
    editForm.classList.remove("hidden");
    window.scrollTo({ top: editForm.offsetTop, behavior: "smooth" });
  });

  document.querySelector(".btn-delete-client").addEventListener("click", () => {
    if (confirm(`مطمئن هستید که "${client.company}" حذف شود؟`)) {
      const clientIndex = clients.findIndex(c => c.company === companyName);
      clients.splice(clientIndex, 1);
      localStorage.setItem("clients", JSON.stringify(clients));
      showMessage(formMessage, `✅ مشتری "${client.company}" با موفقیت حذف شد.`, "success");
      setTimeout(() => (window.location.href = "clients.html"), 1500);
    }
  });

  editForm.addEventListener("submit", e => {
    e.preventDefault();
    const updatedClient = {
      id: client.id,
      company: editCompany.value.trim(),
      buyer: editBuyer.value.trim(),
      phone: editPhone.value.trim(),
      mobile: editMobile.value.trim(),
      email: editEmail.value.trim(),
      industry: editIndustry.value.trim(),
      website: editWebsite.value.trim(),
      address: editAddress.value.trim(),
      lead: editLead.value.trim(),
      status: editStatus.value,
      rating: parseInt(editRating.value) || client.rating || 0,
      createdAt: client.createdAt,
      createdBy: client.createdBy,
    };

    if (!updatedClient.company || !updatedClient.buyer) {
      showMessage(formMessage, "نام شرکت و خریدار الزامی است.", "error");
      return;
    }

    const clientIndex = clients.findIndex(c => c.id === client.id);
    clients[clientIndex] = updatedClient;
    localStorage.setItem("clients", JSON.stringify(clients));

    infoCompany.textContent = updatedClient.company || "نامشخص";
    infoBuyer.textContent = updatedClient.buyer || "نامشخص";
    infoEmail.textContent = updatedClient.email || "-";
    infoIndustry.textContent = updatedClient.industry || "-";
    infoWebsite.textContent = updatedClient.website || "-";
    infoStatus.textContent = updatedClient.status || "-";
    infoDate.textContent = updatedClient.createdAt || "-";
    infoRating.textContent = "⭐".repeat(updatedClient.rating || 0);

    showMessage(formMessage, `✅ مشتری "${updatedClient.company}" با موفقیت به‌روزرسانی شد.`, "success");
    editForm.reset();
    editForm.classList.add("hidden");
  });

  document.querySelector(".cancel-btn").addEventListener("click", () => {
    editForm.reset();
    editForm.classList.add("hidden");
    formMessage.textContent = "";
  });

  // گزارش‌ها
  const filteredLogs = logs.filter(l => l.company === companyName);
  const reportList = document.getElementById("report-list");
  reportList.innerHTML = "";
  if (filteredLogs.length === 0) {
    reportList.innerHTML = "<li>گزارشی برای این مشتری وجود ندارد.</li>";
  } else {
    filteredLogs.forEach(log => {
      const li = document.createElement("li");
      li.textContent = `${log.time || "نامشخص"} - ${log.description || "بدون توضیحات"}`;
      reportList.appendChild(li);
    });
  }

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

  // 📊 نمودار گزارش‌ها - اصلاح شده
  const today = new Date();
  const recentDates = [];
  
  // تولید تاریخ‌های ۷ روز اخیر با persianDate
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const shamsiDate = toJalaaliDate(date);
    recentDates.push(shamsiDate);
  }

  const countByDate = {};
  recentDates.forEach(date => {
    countByDate[date] = 0;
  });

  filteredLogs.forEach(log => {
    if (!log.time) return;
    const logDatePart = log.time.split(" - ")[0].trim();
    const normalizedLogDate = normalizeDate(convertHtmlDateToShamsi(logDatePart));
    
    recentDates.forEach(chartDate => {
      const normalizedChartDate = normalizeDate(chartDate);
      if (normalizedLogDate === normalizedChartDate) {
        countByDate[chartDate]++;
      }
    });
  });

  new Chart(document.getElementById("activityChart"), {
    type: "bar",
    data: {
      labels: recentDates,
      datasets: [{
        label: "تعداد گزارش‌ها",
        data: Object.values(countByDate),
        backgroundColor: "#ed1c22"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: { y: { beginAtZero: true } }
    }
  });

  // یادآورها
  const reminderList = document.getElementById("reminder-list");
  const reminderEditForm = document.getElementById("reminder-edit-form");
  const editReminderTitle = document.getElementById("edit-reminder-title");
  const editReminderDate = document.getElementById("edit-reminder-date");
  const editReminderDescription = document.getElementById("edit-reminder-description");
  const reminderFormMessage = reminderEditForm.querySelector(".form-message");
  let editingReminderIndex = null;

  // دکمه افزودن یادآور جدید
  const addReminderBtn = document.createElement("button");
  addReminderBtn.textContent = "➕ افزودن یادآور";
  addReminderBtn.className = "btn add-reminder-btn";
  addReminderBtn.style.marginBottom = "20px";
  reminderEditForm.parentNode.insertBefore(addReminderBtn, reminderEditForm);

  // فال‌بک برای تاریخ
  function getCurrentDate() {
    try {
      return new persianDate().format("YYYY/MM/DD, HH:mm");
    } catch (e) {
      console.warn("persianDate unavailable, using default Date:", e);
      return new Date().toISOString().slice(0, 16).replace("T", ", ");
    }
  }

  // اطمینان از وجود persianDatepicker
  try {
    $('#edit-reminder-date').persianDatepicker({ format: 'YYYY/MM/DD', initialValue: false });
  } catch (e) {
    console.warn("persianDatepicker failed to initialize:", e);
  }

  function renderReminders() {
    reminderList.innerHTML = "";
    const clientReminders = reminders.filter(r => r.client === companyName);
    if (!clientReminders.length) {
      reminderList.innerHTML = "<li>یادآوری برای این مشتری وجود ندارد.</li>";
      return;
    }

    clientReminders.forEach((r, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="reminder-header">
          <span><b>${r.title || "بدون عنوان"}</b> - <small>${r.date || "نامشخص"}</small></span>
          <div class="reminder-actions">
            ${r.user === currentUser.username || currentUser.role === "admin" ? `<button class="edit-reminder" data-index="${index}">✏️ ویرایش</button>` : ""}
            ${r.user === currentUser.username || currentUser.role === "admin" ? `<button class="delete-reminder" data-index="${index}">🗑️ حذف</button>` : ""}
          </div>
        </div>
        <div class="reminder-content">${r.description || "بدون توضیحات"}</div>
      `;
      reminderList.appendChild(li);
    });

    document.querySelectorAll(".delete-reminder").forEach(btn => {
      btn.onclick = e => {
        const i = e.target.dataset.index;
        if (confirm(`حذف یادآور "${clientReminders[i].title}"؟`)) {
          const globalIndex = reminders.findIndex(r => r.client === companyName && r.title === clientReminders[i].title && r.date === clientReminders[i].date);
          reminders.splice(globalIndex, 1);
          localStorage.setItem("reminders", JSON.stringify(reminders));
          showMessage(reminderFormMessage, "✅ یادآور با موفقیت حذف شد.", "success");
          renderReminders();
        }
      };
    });

    document.querySelectorAll(".edit-reminder").forEach(btn => {
      btn.onclick = e => {
        const i = e.target.dataset.index;
        editingReminderIndex = i;
        editReminderTitle.value = clientReminders[i].title || "";
        editReminderDate.value = clientReminders[i].date || "";
        editReminderDescription.value = clientReminders[i].description || "";
        reminderEditForm.classList.remove("hidden");
        window.scrollTo({ top: reminderEditForm.offsetTop, behavior: "smooth" });
      };
    });
  }

  addReminderBtn.addEventListener("click", () => {
    editingReminderIndex = null;
    editReminderTitle.value = "";
    editReminderDate.value = "";
    editReminderDescription.value = "";
    reminderEditForm.classList.remove("hidden");
    window.scrollTo({ top: reminderEditForm.offsetTop, behavior: "smooth" });
  });

  reminderEditForm.addEventListener("submit", e => {
    e.preventDefault();
    const updatedReminder = {
      client: companyName,
      title: editReminderTitle.value.trim(),
      date: editReminderDate.value.trim() || getCurrentDate(),
      description: editReminderDescription.value.trim(),
      user: currentUser.username
    };

    if (!updatedReminder.title || !updatedReminder.date) {
      showMessage(reminderFormMessage, "عنوان و تاریخ الزامی است.", "error");
      return;
    }

    try {
      if (editingReminderIndex !== null) {
        const clientReminders = reminders.filter(r => r.client === companyName);
        const globalIndex = reminders.findIndex(r => r.client === companyName && r.title === clientReminders[editingReminderIndex].title && r.date === clientReminders[editingReminderIndex].date);
        reminders[globalIndex] = updatedReminder;
        showMessage(reminderFormMessage, `✅ یادآور "${updatedReminder.title}" با موفقیت به‌روزرسانی شد.`, "success");
        editingReminderIndex = null;
      } else {
        reminders.push(updatedReminder);
        showMessage(reminderFormMessage, `✅ یادآور "${updatedReminder.title}" با موفقیت اضافه شد.`, "success");
      }

      localStorage.setItem("reminders", JSON.stringify(reminders));
      reminderEditForm.reset();
      reminderEditForm.classList.add("hidden");
      renderReminders();
    } catch (e) {
      console.error("خطا در ذخیره یادآور:", e);
      showMessage(reminderFormMessage, "❌ خطا در ذخیره یادآور. لطفاً دوباره تلاش کنید.", "error");
    }
  });

  document.querySelector("#reminder-edit-form .cancel-btn").addEventListener("click", () => {
    reminderEditForm.reset();
    reminderEditForm.classList.add("hidden");
    reminderFormMessage.textContent = "";
    editingReminderIndex = null;
  });

  renderReminders();

  // یادداشت داخلی
  const noteKey = `notes_${companyName}`;
  const noteArea = document.getElementById("internal-note");
  const noteList = document.getElementById("note-list");
  const noteFilterFrom = document.getElementById("note-filter-from");
  const noteFilterTo = document.getElementById("note-filter-to");
  const noteKeyword = document.getElementById("note-keyword");
  const saveNoteBtn = document.getElementById("save-note");
  const noteMessage = document.querySelector("#notes .form-message");
  let notes = JSON.parse(localStorage.getItem(noteKey)) || [];
  let editingNoteIndex = null;

  // دکمه افزودن یادداشت جدید
  const addNoteBtn = document.createElement("button");
  addNoteBtn.textContent = "➕ افزودن یادداشت";
  addNoteBtn.className = "btn add-note-btn";
  addNoteBtn.style.marginBottom = "20px";
  noteArea.parentNode.insertBefore(addNoteBtn, noteArea);

  try {
    $('#note-filter-from, #note-filter-to').persianDatepicker({ format: 'YYYY/MM/DD', initialValue: false });
  } catch (e) {
    console.warn("persianDatepicker failed to initialize:", e);
  }

  function renderNotes() {
    noteList.innerHTML = "";
    const from = noteFilterFrom.value;
    const to = noteFilterTo.value;
    const keyword = noteKeyword.value.trim().toLowerCase();

    const visibleNotes = notes.filter(n => {
      const isVisible = n.user === currentUser.username || currentUser.role === "admin";
      const date = n.date ? n.date.split(",")[0] : "";
      const inRange = (!from || date >= from) && (!to || date <= to);
      const hasKeyword = !keyword || (n.text && n.text.toLowerCase().includes(keyword));
      return isVisible && inRange && hasKeyword;
    });

    if (!visibleNotes.length) {
      noteList.innerHTML = "<li>یادداشتی برای شما وجود ندارد.</li>";
      return;
    }

    visibleNotes.forEach((n, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="note-header">
          <span><b>${n.user || "نامشخص"}</b> - <small>${n.date || "نامشخص"}</small></span>
          <div class="note-actions">
            ${n.user === currentUser.username ? `<button class="edit-note" data-index="${index}">✏️ ویرایش</button>` : ""}
            ${(n.user === currentUser.username || currentUser.role === "admin") ? `<button class="delete-note" data-index="${index}">🗑️ حذف</button>` : ""}
          </div>
        </div>
        <div class="note-content">${n.text || "بدون محتوا"}</div>
      `;
      noteList.appendChild(li);
    });

    document.querySelectorAll(".delete-note").forEach(btn => {
      btn.onclick = e => {
        const i = e.target.dataset.index;
        if (confirm("حذف یادداشت؟")) {
          notes.splice(i, 1);
          localStorage.setItem(noteKey, JSON.stringify(notes));
          showMessage(noteMessage, "✅ یادداشت با موفقیت حذف شد.", "success");
          renderNotes();
        }
      };
    });

    document.querySelectorAll(".edit-note").forEach(btn => {
      btn.onclick = e => {
        const i = e.target.dataset.index;
        editingNoteIndex = i;
        noteArea.value = notes[i].text || "";
        saveNoteBtn.textContent = "💾 به‌روزرسانی یادداشت";
        noteArea.focus();
        window.scrollTo({ top: noteArea.offsetTop, behavior: "smooth" });
      };
    });
  }

  addNoteBtn.addEventListener("click", () => {
    editingNoteIndex = null;
    noteArea.value = "";
    saveNoteBtn.textContent = "💾 ذخیره یادداشت";
    noteArea.focus();
    window.scrollTo({ top: noteArea.offsetTop, behavior: "smooth" });
  });

  saveNoteBtn.addEventListener("click", () => {
    const text = noteArea.value.trim();
    if (!text) {
      showMessage(noteMessage, "لطفاً متن یادداشت را وارد کنید.", "error");
      return;
    }

    try {
      if (editingNoteIndex !== null) {
        notes[editingNoteIndex].text = text;
        notes[editingNoteIndex].date = getCurrentDate();
        localStorage.setItem(noteKey, JSON.stringify(notes));
        showMessage(noteMessage, "✅ یادداشت با موفقیت به‌روزرسانی شد.", "success");
        editingNoteIndex = null;
        saveNoteBtn.textContent = "💾 ذخیره یادداشت";
      } else {
        const note = {
          user: currentUser.username || "کاربر",
          date: getCurrentDate(),
          text
        };
        notes.push(note);
        localStorage.setItem(noteKey, JSON.stringify(notes));
        showMessage(noteMessage, "✅ یادداشت با موفقیت ذخیره شد.", "success");
      }
      noteArea.value = "";
      renderNotes();
    } catch (e) {
      console.error("خطا در ذخیره یادداشت:", e);
      showMessage(noteMessage, "❌ خطا در ذخیره یادداشت. لطفاً دوباره تلاش کنید.", "error");
    }
  });

  document.getElementById("apply-note-filter").addEventListener("click", renderNotes);

  // تب‌بندی
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // فعال کردن تب گزارش‌ها به‌صورت پیش‌فرض
  const reportsTab = document.querySelector('.tab-btn[data-tab="reports"]');
  if (reportsTab) {
    reportsTab.classList.add("active");
    document.getElementById("reports").classList.add("active");
  }

  renderNotes();
});