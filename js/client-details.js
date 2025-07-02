const clientName = localStorage.getItem("viewClient");
const clients = JSON.parse(localStorage.getItem("clients")) || [];
const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

const client = clients.find(c => c.company === clientName);
const container = document.getElementById("client-info");
const reminderBox = document.getElementById("reminder-list");

if (!client) {
  container.innerHTML = "<p>مشتری یافت نشد.</p>";
} else {
  container.innerHTML = `
    <strong>شرکت:</strong> ${client.company}<br>
    <strong>نام خریدار:</strong> ${client.buyer}<br>
    <strong>تلفن:</strong> ${client.phone}<br>
    <strong>همراه:</strong> ${client.mobile}<br>
    <strong>آدرس:</strong> ${client.address}<br>
    <strong>سرنخ:</strong> ${client.lead}<br>
    <strong>ایجاد شده توسط:</strong> ${client.createdBy}
  `;
}

const relatedReminders = reminders.filter(r => r.client === clientName);
if (relatedReminders.length === 0) {
  reminderBox.innerHTML = "<p>یادآوری‌ای برای این مشتری ثبت نشده است.</p>";
} else {
  relatedReminders.forEach(r => {
    const div = document.createElement("div");
    div.className = "reminder-card";
    div.innerHTML = `
      <strong>عنوان:</strong> ${r.title}<br>
      <strong>توضیحات:</strong> ${r.description || "-"}<br>
      <strong>تاریخ:</strong> ${r.date} - ${r.time}<br>
      <strong>ایجادشده توسط:</strong> ${r.createdBy}
      <hr>
    `;
    reminderBox.appendChild(div);
  });
}
