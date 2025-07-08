document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("لطفاً وارد شوید.");
    location.href = "index.html";
    return;
  }

  const form = document.getElementById("client-form");
  const listContainer = document.getElementById("client-list");
  const searchInput = document.getElementById("search");
  const filterUser = document.getElementById("filter-user");
  const showFormBtn = document.getElementById("show-form-btn");
  const formMessage = document.createElement("div"); // پیام موفقیت/خطا
  formMessage.className = "form-message";
  form.appendChild(formMessage);

  let clients = JSON.parse(localStorage.getItem("clients")) || [];
  let formMode = "add"; // حالت فرم: add یا edit
  let editingClientId = null; // شناسه مشتری در حال ویرایش

  // تولید ID یکتا
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // اضافه کردن ID به مشتریان موجود (اگر نداشته باشند)
  clients = clients.map(client => ({
    ...client,
    id: client.id || generateId(),
  }));
  localStorage.setItem("clients", JSON.stringify(clients));

  showFormBtn.addEventListener("click", () => {
    form.classList.toggle("hidden");
    formMode = "add"; // بازگشت به حالت افزودن
    editingClientId = null;
    form.reset();
    formMessage.textContent = "";
  });

  // ایجاد لیست کاربران برای فیلتر
  const allUsers = [...new Set(clients.map(c => c.createdBy))];
  allUsers.forEach(user => {
    const opt = document.createElement("option");
    opt.value = user;
    opt.textContent = user;
    filterUser.appendChild(opt);
  });

  // مدیریت submit فرم
  form.addEventListener("submit", e => {
    e.preventDefault();
    const company = document.getElementById("company").value.trim();
    const buyer = document.getElementById("buyer").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();
    const lead = document.getElementById("lead").value.trim();
    const email = document.getElementById("email").value.trim();
    const industry = document.getElementById("industry").value.trim();
    const website = document.getElementById("website").value.trim();
    const status = document.getElementById("status").value;
    const rating = parseInt(document.getElementById("rating").value) || 3;

    if (!company || !buyer) {
      showMessage("نام شرکت و خریدار الزامی است.", "error");
      return;
    }

    if (formMode === "add") {
      // افزودن مشتری جدید
      const newClient = {
        id: generateId(),
        company,
        buyer,
        phone,
        mobile,
        address,
        lead,
        email,
        industry,
        website,
        status,
        rating,
        createdAt: new Date().toLocaleDateString("fa-IR"),
        createdBy: currentUser.username,
      };

      clients.push(newClient);
      localStorage.setItem("clients", JSON.stringify(clients));
      showMessage("✅ مشتری با موفقیت ذخیره شد.", "success");
    } else if (formMode === "edit" && editingClientId) {
      // به‌روزرسانی مشتری موجود
      const updatedClient = {
        id: editingClientId,
        company,
        buyer,
        phone,
        mobile,
        address,
        lead,
        email,
        industry,
        website,
        status,
        rating,
        createdAt: clients.find(c => c.id === editingClientId).createdAt,
        createdBy: clients.find(c => c.id === editingClientId).createdBy,
      };

      clients = clients.map(client => (client.id === editingClientId ? updatedClient : client));
      localStorage.setItem("clients", JSON.stringify(clients));
      showMessage(`✅ مشتری "${company}" با موفقیت ویرایش شد.`, "success");
    }

    form.reset();
    form.classList.add("hidden");
    formMode = "add"; // بازگشت به حالت افزودن
    editingClientId = null;
    renderClients();
  });

  // نمایش پیام موفقیت/خطا
  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `form-message ${type} show`;
    setTimeout(() => formMessage.classList.remove("show"), 3000);
  }

  // نمایش لیست مشتریان
  function renderClients() {
    listContainer.innerHTML = "";
    const keyword = searchInput.value.trim().toLowerCase();
    const userFilter = filterUser.value;

    const filtered = clients.filter(c => {
      const matchUser = !userFilter || c.createdBy === userFilter;
      const matchKeyword = !keyword || c.company.toLowerCase().includes(keyword);
      return matchUser && matchKeyword;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = "<p>مشتری یافت نشد.</p>";
      return;
    }

    filtered.forEach(c => {
      const div = document.createElement("div");
      div.className = "client-card";
      div.innerHTML = `
        <div class="client-header">
          <h4>${c.company}</h4>
          <span class="status-tag ${c.status === "فعال" ? "status-active" : "status-inactive"}">
            ${c.status}
          </span>
        </div>
        <div class="client-info">
          <p> ${c.buyer}</p>
          <p> ${c.mobile || "-"} | ☎️ ${c.phone || "-"}</p>
          <p> ${c.website || "-"}</p>
          <p> امتیاز ارتباط: ${"⭐".repeat(c.rating)}</p>
        </div>
        <div class="client-meta">
          <small>ثبت‌کننده: ${c.createdBy} | تاریخ: ${c.createdAt}</small>
        </div>
        <div class="client-actions">
          <a href="client-details.html?company=${encodeURIComponent(c.company)}" class="btn details">جزئیات</a>
          <button class="btn btn-edit" data-id="${c.id}">ویرایش</button>
          <button class="btn btn-delete" data-id="${c.id}">حذف</button>
        </div>
      `;
      listContainer.appendChild(div);
    });
  }

  searchInput.addEventListener("input", renderClients);
  filterUser.addEventListener("change", renderClients);

  // حذف مشتری
  listContainer.addEventListener("click", e => {
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      const client = clients.find(c => c.id === id);
      if (!client) return;

      if (confirm(`مطمئن هستید که "${client.company}" حذف شود؟`)) {
        clients = clients.filter(c => c.id !== id);
        localStorage.setItem("clients", JSON.stringify(clients));
        showMessage(`✅ مشتری "${client.company}" با موفقیت حذف شد.`, "success");
        renderClients();
      }
    }
  });

  // ویرایش مشتری
  listContainer.addEventListener("click", e => {
    if (e.target.classList.contains("btn-edit")) {
      const id = e.target.dataset.id;
      const c = clients.find(c => c.id === id);
      if (!c) return;

      // پر کردن فرم با داده‌های مشتری
      document.getElementById("company").value = c.company;
      document.getElementById("buyer").value = c.buyer;
      document.getElementById("phone").value = c.phone || "";
      document.getElementById("mobile").value = c.mobile || "";
      document.getElementById("address").value = c.address || "";
      document.getElementById("lead").value = c.lead || "";
      document.getElementById("email").value = c.email || "";
      document.getElementById("industry").value = c.industry || "";
      document.getElementById("website").value = c.website || "";
      document.getElementById("status").value = c.status;
      document.getElementById("rating").value = c.rating;

      formMode = "edit";
      editingClientId = id;
      form.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // 📥 درون‌ریزی از Excel
  document.getElementById("import-btn").addEventListener("click", () => {
    const fileInput = document.getElementById("import-file");
    const file = fileInput.files[0];
    if (!file) {
      showMessage("لطفاً یک فایل انتخاب کنید.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      let added = 0;
      rows.forEach(row => {
        if (!row["شرکت"] || !row["خریدار"]) return;
        const exists = clients.find(c => c.company === row["شرکت"]);
        if (exists) return;

        clients.push({
          id: generateId(),
          company: row["شرکت"],
          buyer: row["خریدار"],
          phone: row["شماره ثابت"] || "",
          mobile: row["شماره همراه"] || "",
          address: row["آدرس"] || "",
          lead: row["سرنخ"] || "",
          email: row["ایمیل"] || "",
          industry: row["صنعت"] || "",
          website: row["وب‌سایت"] || "",
          status: row["وضعیت"] || "فعال",
          rating: parseInt(row["امتیاز ارتباط"] || "3"),
          createdAt: new Date().toLocaleDateString("fa-IR"),
          createdBy: currentUser.username,
        });
        added++;
      });

      localStorage.setItem("clients", JSON.stringify(clients));
      renderClients();
      showMessage(`✅ ${added} مشتری با موفقیت افزوده شد.`, "success");
      fileInput.value = "";
    };
    reader.readAsArrayBuffer(file);
  });

  // 📄 دانلود قالب اکسل
  document.getElementById("download-template").addEventListener("click", () => {
    const sample = [{
      "شرکت": "شرکت نمونه",
      "خریدار": "علی رضایی",
      "شماره ثابت": "021111111",
      "شماره همراه": "09120000000",
      "آدرس": "تهران",
      "سرنخ": "تبلیغات",
      "ایمیل": "example@example.com",
      "صنعت": "فناوری",
      "وب‌سایت": "www.example.com",
      "وضعیت": "فعال",
      "امتیاز ارتباط": 4,
    }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "مشتریان");
    XLSX.writeFile(wb, "قالب_مشتریان.xlsx");
  });

  // اجرای اولیه
  renderClients();
});