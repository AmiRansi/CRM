const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) location.href = "index.html";

let clients = JSON.parse(localStorage.getItem("clients")) || [];
let editingIndex = null;

const showFormBtn = document.getElementById("show-form-btn");
const clientForm = document.getElementById("client-form");
const searchInput = document.getElementById("search");
const filterUser = document.getElementById("filter-user");

showFormBtn.addEventListener("click", () => {
  clientForm.style.display = clientForm.style.display === "none" ? "block" : "none";
});

document.getElementById("client-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const company = document.getElementById("company").value.trim();
  const buyer = document.getElementById("buyer").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const address = document.getElementById("address").value.trim();
  const lead = document.getElementById("lead").value.trim();

  if (!company || !buyer) {
    alert("نام شرکت و خریدار الزامی است");
    return;
  }

  const newClient = {
    company,
    buyer,
    phone,
    mobile,
    address,
    lead,
    createdBy: currentUser.username
  };

  if (editingIndex !== null) {
    clients[editingIndex] = newClient;
    editingIndex = null;
  } else {
    clients.push(newClient);
  }

  localStorage.setItem("clients", JSON.stringify(clients));
  this.reset();
  clientForm.style.display = "none";
  showClients();
  loadUserFilterOptions();
});

function deleteClient(index) {
  const client = clients[index];
  if (currentUser.role !== "admin" && client.createdBy !== currentUser.username) {
    alert("اجازه حذف ندارید");
    return;
  }

  if (confirm("مطمئنی؟")) {
    clients.splice(index, 1);
    localStorage.setItem("clients", JSON.stringify(clients));
    showClients();
    loadUserFilterOptions();
  }
}

function editClient(index) {
  const client = clients[index];
  document.getElementById("company").value = client.company;
  document.getElementById("buyer").value = client.buyer;
  document.getElementById("phone").value = client.phone;
  document.getElementById("mobile").value = client.mobile;
  document.getElementById("address").value = client.address;
  document.getElementById("lead").value = client.lead;
  editingIndex = index;
  clientForm.style.display = "block";
}

function viewDetails(companyName) {
  localStorage.setItem("viewClient", companyName);
  location.href = "client-details.html";
}

function showClients() {
  const container = document.getElementById("client-list");
  container.innerHTML = "";

  let filtered = currentUser.role === "admin"
    ? clients
    : clients.filter(c => c.createdBy === currentUser.username);

  const search = searchInput.value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(c => c.company.toLowerCase().includes(search) || c.buyer.toLowerCase().includes(search));
  }

  const selectedUser = filterUser.value;
  if (selectedUser) {
    filtered = filtered.filter(c => c.createdBy === selectedUser);
  }

  filtered.forEach((client, index) => {
    const div = document.createElement("div");
    div.className = "client-card";
    div.innerHTML = `
      <strong>شرکت:</strong> ${client.company}<br>
      <strong>خریدار:</strong> ${client.buyer}<br>
      <button onclick="viewDetails('${client.company}')">📄 جزئیات</button>
      <button onclick="editClient(${index})">✏️ ویرایش</button>
      <button onclick="deleteClient(${index})">🗑 حذف</button>
      <hr>
    `;
    container.appendChild(div);
  });
}

function loadUserFilterOptions() {
  const users = [...new Set(clients.map(c => c.createdBy))];
  filterUser.innerHTML = `<option value="">همه کاربران</option>`;
  users.forEach(user => {
    const op = document.createElement("option");
    op.value = user;
    op.textContent = user;
    filterUser.appendChild(op);
  });
}

searchInput.addEventListener("input", showClients);
filterUser.addEventListener("change", showClients);

loadUserFilterOptions();
showClients();
