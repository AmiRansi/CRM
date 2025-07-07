document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("دسترسی فقط برای مدیر امکان‌پذیر است.");
    return location.href = "index.html";
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const table = document.getElementById("user-table");
  const form = document.getElementById("user-form");

  document.getElementById("show-user-form").onclick = () => {
    form.style.display = form.style.display === "none" ? "block" : "none";
  };

  form.onsubmit = e => {
    e.preventDefault();
    const username = form.username.value.trim();
    const fullname = form.fullname.value.trim();
    const password = form.password.value;
    const role = form.role.value;

    if (!username || !fullname || !password || !role) return alert("تمام فیلدها الزامی است.");

    if (users.find(u => u.username === username)) return alert("این نام کاربری قبلاً ثبت شده است.");

    users.push({ username, fullname, password, role });
    localStorage.setItem("users", JSON.stringify(users));
    form.reset();
    form.style.display = "none";
    renderUsers();
  };

  function renderUsers() {
    users = JSON.parse(localStorage.getItem("users")) || [];
    table.innerHTML = "";
    if (users.length === 0) {
      table.innerHTML = "<tr><td colspan='4'>کاربری ثبت نشده است.</td></tr>";
      return;
    }

    users.forEach((u, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.username}</td>
        <td>${u.fullname || "-"}</td>
        <td>${u.role}</td>
        <td>
          <button onclick="deleteUser(${i})">🗑 حذف</button>
        </td>
      `;
      table.appendChild(tr);
    });
  }

  window.deleteUser = index => {
    const target = users[index];
    if (confirm(`آیا از حذف ${target.username} مطمئن هستید؟`)) {
      users.splice(index, 1);
      localStorage.setItem("users", JSON.stringify(users));
      renderUsers();
    }
  };

  renderUsers();
});
