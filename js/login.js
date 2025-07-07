document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  // اگر هنوز کاربری وجود ندارد، یک کاربر پیش‌فرض بساز
  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.length === 0) {
    users.push({ username: "admin", password: "1234", name: "مدیر", role: "admin" });
    localStorage.setItem("users", JSON.stringify(users));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = form.username.value.trim();
    const password = form.password.value.trim();

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return alert("نام کاربری یا رمز عبور اشتباه است!");

    localStorage.setItem("currentUser", JSON.stringify(user));
    location.href = "index.html";
  });
});
