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

  let clients = JSON.parse(localStorage.getItem("clients")) || [];

  showFormBtn.addEventListener("click", () => {
    form.classList.toggle("hidden");
  });
  

  // ایجاد لیست کاربران برای فیلتر
  const allUsers = [...new Set(clients.map(c => c.createdBy))];
  allUsers.forEach(user => {
    const opt = document.createElement("option");
    opt.value = user;
    opt.textContent = user;
    filterUser.appendChild(opt);
  });

  // افزودن مشتری جدید
  form.addEventListener("submit", e => {
    e.preventDefault();
    const company = document.getElementById("company").value.trim();
    const buyer = document.getElementById("buyer").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();
    const lead = document.getElementById("lead").value.trim();

    if (!company || !buyer) {
      alert("نام شرکت و خریدار الزامی است.");
      return;
    }

    const newClient = {
      company,
      buyer,
      phone,
      mobile,
      address,
      lead,
      email: prompt("ایمیل مشتری:") || "",
      industry: prompt("صنعت مشتری:") || "",
      website: prompt("وب‌سایت مشتری:") || "",
      status: prompt("وضعیت همکاری (فعال/غیرفعال):") || "فعال",
      rating: parseInt(prompt("امتیاز ارتباط (1 تا 5):") || "3"),
      createdAt: new Date().toLocaleDateString("fa-IR"),
      createdBy: currentUser.username
    };

    clients.push(newClient);
    localStorage.setItem("clients", JSON.stringify(clients));
    form.reset();
    alert("✅ مشتری ذخیره شد.");
    renderClients();
  });

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
      
        <p>👤 ${c.buyer}</p>
        <p>📱 ${c.mobile || "-"} | ☎️ ${c.phone || "-"}</p>
        <p>🌐 ${c.website || "-"}</p>
        <p>⭐ امتیاز ارتباط: ${"⭐".repeat(c.rating)}</p>
        <small>ثبت‌کننده: ${c.createdBy} | تاریخ: ${c.createdAt}</small>
      
        <div class="client-actions">
          <a href="client-details.html?company=${encodeURIComponent(c.company)}" class="btn details">جزئیات</a>
          <button class="btn edit" data-id="${c.company}">ویرایش</button>
          <button class="btn delete" data-id="${c.company}">حذف</button>
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
      if (confirm(`مطمئن هستید که "${id}" حذف شود؟`)) {
        clients = clients.filter(c => c.company !== id);
        localStorage.setItem("clients", JSON.stringify(clients));
        renderClients();
      }
    }
  });

  // ویرایش مشتری
  listContainer.addEventListener("click", e => {
    if (e.target.classList.contains("btn-edit")) {
      const id = e.target.dataset.id;
      const c = clients.find(c => c.company === id);
      if (!c) return;

      c.buyer = prompt("نام خریدار:", c.buyer) || c.buyer;
      c.email = prompt("ایمیل:", c.email || "") || c.email;
      c.industry = prompt("صنعت:", c.industry || "") || c.industry;
      c.website = prompt("وب‌سایت:", c.website || "") || c.website;
      c.status = prompt("وضعیت همکاری:", c.status || "فعال") || c.status;
      c.rating = parseInt(prompt("امتیاز از ۱ تا ۵:", c.rating || 3)) || 3;

      localStorage.setItem("clients", JSON.stringify(clients));
      renderClients();
    }
  });

  // 📥 درون‌ریزی از Excel
  document.getElementById("import-btn").addEventListener("click", () => {
    const fileInput = document.getElementById("import-file");
    const file = fileInput.files[0];
    if (!file) return alert("لطفاً یک فایل انتخاب کنید.");

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
          createdBy: currentUser.username
        });
        added++;
      });

      localStorage.setItem("clients", JSON.stringify(clients));
      renderClients();
      alert(`✅ ${added} مشتری افزوده شد.`);
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
      "امتیاز ارتباط": 4
    }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "مشتریان");
    XLSX.writeFile(wb, "قالب_مشتریان.xlsx");
  });

  // اجرای اولیه
  renderClients();
});
