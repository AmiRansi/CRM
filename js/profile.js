const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user) location.href = "index.html";

document.getElementById("profile-info").innerHTML = `
  <p><strong>نام کاربری:</strong> ${user.username}</p>
  <p><strong>نقش:</strong> ${user.role}</p>
`;
