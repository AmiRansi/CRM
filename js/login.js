const users = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "ali", password: "1234", role: "user" },
    { username: "sara", password: "abcd", role: "user" }
  ];
  
  document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
  
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      window.location.href = "reminders.html";
    } else {
      alert("نام کاربری یا رمز عبور اشتباه است.");
    }
  });
  