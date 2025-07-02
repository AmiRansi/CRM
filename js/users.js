const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "admin") {
  alert("دسترسی غیرمجاز!");
  location.href = "reminders.html";
}

function addUser() {
  const u = document.getElementById("new-user").value.trim();
  const p = document.getElementById("new-pass").value.trim();
  const r = document.getElementById("new-role").value;

  alert(`کاربر جدید "${u}" با نقش "${r}" (فقط شبیه‌سازی – ذخیره دائمی نیست)`);
}
