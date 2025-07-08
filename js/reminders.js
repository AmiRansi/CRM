document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return location.href = "index.html";

  let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  let clients = JSON.parse(localStorage.getItem("clients")) || [];

  const form = document.getElementById("reminder-form");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const clientSelect = document.getElementById("client-select");
  const listContainer = document.getElementById("reminder-list");
  const showFormBtn = document.getElementById("show-reminder-form");
  const formSection = document.querySelector(".form-section");
  const addClientBtn = document.getElementById("add-client-btn");
  const filterStatus = document.getElementById("filter-status");
  const filterPriority = document.getElementById("filter-priority");
  const filterCategory = document.getElementById("filter-category");
  const filterClient = document.getElementById("filter-client");
  const filterClientSearch = document.getElementById("filter-client-search");
  const filterUser = document.getElementById("filter-user");
  const sortType = document.getElementById("sort-type");

  let editIndex = -1;

  // نمایش فرم با کلیک روی دکمه
  showFormBtn.addEventListener("click", () => {
    formSection.classList.remove("hidden");
    formSection.classList.add("show");
  });

  // افزودن مشتری جدید
  addClientBtn.addEventListener("click", () => {
    const company = prompt("نام شرکت مشتری را وارد کنید:");
    if (company && company.trim()) {
      const newClient = {
        company: company.trim(),
        createdBy: currentUser.username,
      };
      clients.push(newClient);
      localStorage.setItem("clients", JSON.stringify(clients));
      loadClientsAndUsers();
      clientSelect.value = company.trim();
    }
  });

  // جستجوی مشتریان
  filterClientSearch.addEventListener("input", () => {
    const searchTerm = filterClientSearch.value.trim().toLowerCase();
    loadClientsAndUsers(searchTerm);
  });

  // به‌روزرسانی لیست یادآوری‌ها پس از انتخاب مشتری
  filterClient.addEventListener("change", () => {
    render();
  });

  function getNowShamsiTime() {
    const d = new Date();
    const fa = new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" });
    return fa.format(d).replace(",", " - ");
  }

  function loadClientsAndUsers(searchTerm = "") {
    const filteredClients = currentUser.role === "admin"
      ? clients
      : clients.filter(c => c.createdBy === currentUser.username);

    // فیلتر کردن مشتریان بر اساس جستجو
    const searchedClients = searchTerm
      ? filteredClients.filter(c => c.company.toLowerCase().includes(searchTerm))
      : filteredClients;

    clientSelect.innerHTML = "<option value=''>انتخاب مشتری</option>";
    filterClient.innerHTML = "<option value=''>مشتری: همه</option>";
    const usersSet = new Set();

    searchedClients.forEach(c => {
      const o1 = document.createElement("option");
      o1.value = c.company;
      o1.textContent = c.company;
      clientSelect.appendChild(o1);

      const o2 = o1.cloneNode(true);
      filterClient.appendChild(o2);

      usersSet.add(c.createdBy);
    });

    if (currentUser.role === "admin") {
      filterUser.style.display = "inline";
      filterUser.innerHTML = "<option value=''>ثبت‌کننده: همه</option>";
      const usernames = new Set(reminders.map(r => r.createdBy));
      usernames.forEach(user => {
        const o = document.createElement("option");
        o.value = user;
        o.textContent = user;
        filterUser.appendChild(o);
      });
    }
  }

  function render() {
    listContainer.innerHTML = "";
    let data = currentUser.role === "admin"
      ? reminders
      : reminders.filter(r => r.createdBy === currentUser.username);

    const status = filterStatus.value;
    const priority = filterPriority.value;
    const category = filterCategory.value;
    const client = filterClient.value;
    const user = filterUser.value;

    if (status === "done") data = data.filter(r => r.isDone);
    else if (status === "undone") data = data.filter(r => !r.isDone);

    if (priority) data = data.filter(r => r.priority === priority);
    if (category) data = data.filter(r => r.category === category);
    if (client) data = data.filter(r => r.client === client);
    if (user && currentUser.role === "admin") data = data.filter(r => r.createdBy === user);

    const sort = sortType?.value;
    if (sort === "date-asc") {
      data.sort((a, b) => new Date(a.date.replace(/\//g, "-") + "T" + a.time) - new Date(b.date.replace(/\//g, "-") + "T" + b.time));
    } else if (sort === "date-desc") {
      data.sort((a, b) => new Date(b.date.replace(/\//g, "-") + "T" + b.time) - new Date(a.date.replace(/\//g, "-") + "T" + a.time));
    } else if (sort === "priority-high") {
      const p = { "زیاد": 1, "متوسط": 2, "کم": 3 };
      data.sort((a, b) => p[a.priority] - p[b.priority]);
    } else if (sort === "priority-low") {
      const p = { "کم": 1, "متوسط": 2, "زیاد": 3 };
      data.sort((a, b) => p[a.priority] - p[b.priority]);
    }

    if (!data.length) {
      listContainer.innerHTML = "<p>موردی یافت نشد.</p>";
      return;
    }

    data.forEach((r, i) => {
      const div = document.createElement("div");
      div.classList.add("reminder-card");
      if (r.isDone) {
        div.classList.add("status-done");
      } else {
        div.classList.add("status-undone");
      }

      const priorityClassMap = {
        "کم": "priority-low",
        "متوسط": "priority-medium",
        "زیاد": "priority-high"
      };
      if (priorityClassMap[r.priority]) {
        const priorityBar = document.createElement("div");
        priorityBar.classList.add("priority-bar", priorityClassMap[r.priority]);
        div.appendChild(priorityBar);
      }

      const repeatMap = {
        none: "بدون تکرار",
        daily: "روزانه",
        weekly: "هفتگی",
        monthly: "ماهانه"
      };

      div.innerHTML = `
        <div class="header">
          <strong>${r.title}</strong> <span class="status-icon">${r.isDone ? '✅' : '❌'}</span>
        </div>
        ${r.description ? `<p>${r.description}</p>` : ''}
        <span class="client-info">مشتری: ${r.client}</span><br>
        <div class="details">
          <span>اولویت: <strong>${r.priority}</strong></span>
          <span>دسته: <strong>${r.category}</strong></span>
          <span>تکرار: <strong>${repeatMap[r.repeat] || "نامشخص"}</strong></span>
          <span>تاریخ: ${r.date} | ساعت: ${r.time}</span>
          <span>ثبت‌کننده: ${r.createdBy}</span>
          <span><strong>ثبت شده در:</strong> ${r.createdAt || "-"}</span>
        </div>
        <div class="action-buttons">
          <button onclick="toggleDone(${i})" class="done">${r.isDone ? "↩ بازگردانی" : "✅ انجام شد"}</button>
          <button onclick="editReminder(${i})" class="edit">✏️ ویرایش</button>
          <button onclick="deleteReminder(${i})" class="delete">🗑 حذف</button>
        </div>
      `;
      listContainer.appendChild(div);
    });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const title = form.title.value.trim();
    const date = dateInput.value.trim();
    const time = timeInput.value.trim();
    const client = clientSelect.value;
    const desc = form.description.value.trim();
    const priority = form.priority.value;
    const category = form.category.value;
    const repeat = form.repeat.value;

    if (!title || !date || !time || !client || !priority || !category || !repeat) {
      const message = document.querySelector(".form-message");
      message.textContent = "همه فیلدها الزامی هستند.";
      message.classList.add("show", "error");
      setTimeout(() => message.classList.remove("show"), 3000);
      return;
    }

    const now = getNowShamsiTime();

    if (editIndex > -1) {
      reminders[editIndex] = {
        ...reminders[editIndex],
        title,
        description: desc,
        date,
        time,
        client,
        priority,
        category,
        repeat
      };
      editIndex = -1;
    } else {
      reminders.push({
        title,
        description: desc,
        date,
        time,
        client,
        createdBy: currentUser.username,
        isDone: false,
        priority,
        category,
        repeat,
        createdAt: now
      });
    }

    localStorage.setItem("reminders", JSON.stringify(reminders));
    const message = document.querySelector(".form-message");
    message.textContent = "یادآوری با موفقیت ثبت شد!";
    message.classList.add("show", "success");
    setTimeout(() => message.classList.remove("show"), 3000);
    form.reset();
    render();
  });

  window.toggleDone = function (index) {
    const r = reminders[index];
    if (currentUser.role !== "admin" && r.createdBy !== currentUser.username) {
      alert("شما اجازه تغییر وضعیت این یادآوری را ندارید.");
      return;
    }
    reminders[index].isDone = !r.isDone;
    localStorage.setItem("reminders", JSON.stringify(reminders));
    render();
  };

  window.editReminder = function (index) {
    const r = reminders[index];
    if (currentUser.role !== "admin" && r.createdBy !== currentUser.username) {
      alert("شما اجازه ویرایش این یادآوری را ندارید.");
      return;
    }

    form.title.value = r.title;
    form.description.value = r.description;
    form.date.value = r.date;
    form.time.value = r.time;
    form["client-select"].value = r.client;
    form.priority.value = r.priority;
    form.category.value = r.category;
    form.repeat.value = r.repeat;

    editIndex = index;
    formSection.classList.remove("hidden");
    formSection.classList.add("show");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.deleteReminder = function (index) {
    const r = reminders[index];
    if (currentUser.role !== "admin" && r.createdBy !== currentUser.username) {
      alert("شما اجازه حذف این یادآوری را ندارید.");
      return;
    }

    if (confirm(`آیا از حذف "${r.title}" مطمئن هستید؟`)) {
      reminders.splice(index, 1);
      localStorage.setItem("reminders", JSON.stringify(reminders));
      render();
    }
  };

  window.applyFilters = function () {
    render();
  };

  window.clearFilters = function () {
    filterStatus.value = "";
    filterPriority.value = "";
    filterCategory.value = "";
    filterClient.value = "";
    filterClientSearch.value = "";
    filterUser.value = "";
    sortType.value = "";
    loadClientsAndUsers();
    render();
  };

  sortType.addEventListener("change", render);

  loadClientsAndUsers();
  render();

  function checkUpcomingReminders() {
    const now = new Date();
    const sound = document.getElementById("reminder-sound");

    reminders.forEach((r) => {
      if (r.isDone) return;
      if (currentUser.role !== "admin" && r.createdBy !== currentUser.username) return;

      const [y, m, d] = r.date.split("/").map(Number);
      const [hour, min] = r.time.split(":").map(Number);
      const reminderTime = new Date(y, m - 1, d, hour, min);
      const diff = (reminderTime - now) / 1000;

      if (diff > 0 && diff <= 300 && !r._notified) {
        alert(`⏰ یادآوری نزدیک: ${r.title}`);
        sound.play().catch(() => {});
        r._notified = true;
      }
    });
  }

  setInterval(checkUpcomingReminders, 30000);
});