document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const companyName = decodeURIComponent(urlParams.get("company"));
  const clients = JSON.parse(localStorage.getItem("clients")) || [];
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const client = clients.find(c => c.company === companyName);
  if (!client) return alert("مشتری یافت نشد");

  // نمایش اطلاعات مشتری
  document.getElementById("info-company").textContent = client.company;
  document.getElementById("info-buyer").textContent = client.buyer;
  document.getElementById("info-email").textContent = client.email || "-";
  document.getElementById("info-industry").textContent = client.industry || "-";
  document.getElementById("info-website").textContent = client.website || "-";
  document.getElementById("info-status").textContent = client.status || "-";
  document.getElementById("info-date").textContent = client.createdAt || "-";
  document.getElementById("info-rating").textContent = "⭐".repeat(client.rating || 0);

  // گزارش‌ها
  const filteredLogs = logs.filter(l => l.company === companyName);
  const reportList = document.getElementById("report-list");
  filteredLogs.forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.time} - ${log.description}`;
    reportList.appendChild(li);
  });

  // یادآورها
  const clientReminders = reminders.filter(r => r.client === companyName);
  const reminderList = document.getElementById("reminder-list");
  clientReminders.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.date} - ${r.title}`;
    reminderList.appendChild(li);
  });

  // نمودار گزارش‌ها
  const countByDate = {};
  filteredLogs.forEach(log => {
    const d = log.time.split(" - ")[0];
    countByDate[d] = (countByDate[d] || 0) + 1;
  });

  new Chart(document.getElementById("activityChart"), {
    type: "bar",
    data: {
      labels: Object.keys(countByDate),
      datasets: [{
        label: "تعداد گزارش‌ها",
        data: Object.values(countByDate),
        backgroundColor: "#007bff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: { y: { beginAtZero: true } }
    }
  });

  // یادداشت داخلی حرفه‌ای
  const noteKey = `notes_${companyName}`;
  const noteArea = document.getElementById("internal-note");
  const noteList = document.getElementById("note-list");
  const noteFilterFrom = document.getElementById("note-filter-from");
  const noteFilterTo = document.getElementById("note-filter-to");
  const noteKeyword = document.getElementById("note-keyword");
  let notes = JSON.parse(localStorage.getItem(noteKey)) || [];

  $('#note-filter-from, #note-filter-to').pDatepicker({ format: 'YYYY/MM/DD', initialValue: false });

  function renderNotes() {
    noteList.innerHTML = "";
    const from = noteFilterFrom.value;
    const to = noteFilterTo.value;
    const keyword = noteKeyword.value.trim();

    const visibleNotes = notes.filter(n => {
      const isVisible = n.user === currentUser.username || currentUser.role === "admin";
      const date = n.date.split(",")[0];
      const inRange = (!from || date >= from) && (!to || date <= to);
      const hasKeyword = !keyword || n.text.includes(keyword);
      return isVisible && inRange && hasKeyword;
    });

    if (!visibleNotes.length) {
      noteList.innerHTML = "<li>یادداشتی برای شما وجود ندارد.</li>";
      return;
    }

    visibleNotes.forEach((n, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div><b>${n.user}</b> - <small>${n.date}</small></div>
        <div>${n.text}</div>
        <div class="note-actions">
          ${n.user === currentUser.username ? `<button class="edit-note" data-index="${index}">✏️</button>` : ""}
          ${(n.user === currentUser.username || currentUser.role === "admin") ? `<button class="delete-note" data-index="${index}">🗑️</button>` : ""}
        </div>
        <hr>
      `;
      noteList.appendChild(li);
    });

    document.querySelectorAll(".delete-note").forEach(btn => {
      btn.onclick = e => {
        const i = e.target.dataset.index;
        if (confirm("حذف شود؟")) {
          notes.splice(i, 1);
          localStorage.setItem(noteKey, JSON.stringify(notes));
          renderNotes();
        }
      };
    });

    document.querySelectorAll(".edit-note").forEach(btn => {
      btn.onclick = e => {
        const i = e.target.dataset.index;
        const newText = prompt("ویرایش یادداشت:", notes[i].text);
        if (newText !== null && newText.trim()) {
          notes[i].text = newText.trim();
          localStorage.setItem(noteKey, JSON.stringify(notes));
          renderNotes();
        }
      };
    });
  }

  document.getElementById("save-note").addEventListener("click", () => {
    const text = noteArea.value.trim();
    if (!text) return;
    const note = {
      user: currentUser.username,
      date: new persianDate().format("YYYY/MM/DD, HH:mm"),
      text
    };
    notes.push(note);
    localStorage.setItem(noteKey, JSON.stringify(notes));
    noteArea.value = "";
    renderNotes();
  });

  document.getElementById("apply-note-filter").addEventListener("click", renderNotes);
  renderNotes();

  // تب‌بندی
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });
});
