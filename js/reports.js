document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return location.href = "index.html";

  const roles = {
    user: { canExport: false, canFilter: true, canChart: false },
    manager: { canExport: true, canFilter: true, canChart: true },
    admin: { canExport: true, canFilter: true, canChart: true }
  };
  const perm = roles[currentUser.role] || roles.user;

  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  const clients = JSON.parse(localStorage.getItem("clients")) || [];

  const elems = {
    filterBox: $('#filter-box'),
    csvBtn: $('#csv-btn'),
    pdfBtn: $('#pdf-btn'),
    chartBtn: $('#chart-btn'),
    chartType: $('#chart-type'),
    chartOptions: $('#chart-options'),
    chartContainer: $('#chart-container'),
    chartCanvas: $('#chart'),
    toggleBtn: $('#toggle-report-form'),
    manualBox: $('#manual-report-box'),
    clientSelect: $('#manual-client-select'),
    logTable: $('#log-table'),
    filterClient: $('#filter-client'),
    filterFrom: $('#filter-from'),
    filterTo: $('#filter-to'),
    filterKey: $('#filter-keyword')
  };

  if (!perm.canFilter) elems.filterBox.hide();
  if (perm.canExport) elems.csvBtn.show(), elems.pdfBtn.show();
  if (perm.canChart) elems.chartBtn.show(), elems.chartOptions.show();

  $('#manual-date, #filter-from, #filter-to').pDatepicker({ format: 'YYYY/MM/DD', initialValue: false });
  $('#manual-time').timepicker({ timeFormat: 'H:i', interval: 15 });

  elems.toggleBtn.on('click', () => elems.manualBox.toggle());

  const userClients = currentUser.role === "admin" ? clients : clients.filter(c => c.createdBy === currentUser.username);
  userClients.forEach(c => {
    elems.clientSelect.append(`<option value="${c.company}">${c.company}</option>`);
    elems.filterClient.append(`<option value="${c.company}">${c.company}</option>`);
  });

  $('#manual-report-form').on('submit', e => {
    e.preventDefault();
    const log = {
      user: currentUser.username,
      action: "add",
      company: $('#manual-client-select').val(),
      description: `📌 ${$('#manual-title').val()} | ${$('#manual-description').val()}`,
      time: `${$('#manual-date').val()} - ${$('#manual-time').val()}`
    };
    logs.push(log);
    localStorage.setItem("logs", JSON.stringify(logs));
    alert("✅ گزارش ذخیره شد.");
    e.target.reset();
    elems.manualBox.hide();
    renderLogs();
  });

  const applyFilter = () => logs.filter(l => {
    if (perm.canFilter) {
      const from = elems.filterFrom.val();
      const to = elems.filterTo.val();
      const client = elems.filterClient.val();
      const keyword = elems.filterKey.val().trim();
      const date = l.time.split(' - ')[0];
      if (from && date < from) return false;
      if (to && date > to) return false;
      if (client && l.company !== client) return false;
      if (keyword && !l.description.includes(keyword)) return false;
    }
    return currentUser.role === "admin" || l.user === currentUser.username;
  });

  const renderLogs = () => {
    const list = applyFilter();
    elems.logTable.empty();
    if (!list.length) return elems.logTable.html(`<tr><td colspan="5">هیچ گزارشی یافت نشد.</td></tr>`);
    list.forEach(log => {
      elems.logTable.append(`<tr>
        <td>${log.user}</td><td>${log.action}</td><td>${log.company}</td><td>${log.description}</td><td>${log.time}</td>
      </tr>`);
    });
  };

  $('#apply-filter').on('click', renderLogs);

  elems.csvBtn.on('click', () => {
    const arr = applyFilter().map(l => [l.user, l.action, l.company, l.description, l.time]);
    const csv = ['کاربر,عملیات,مشتری,توضیحات,زمان', ...arr.map(r => r.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'گزارشات.csv';
    a.click();
  });

  elems.pdfBtn.on('click', () => {
    const content = document.createElement('div');
    content.innerHTML = `<h2 style="text-align:center;">گزارش‌ها</h2>` + $('#report-content').html() + elems.chartContainer.html();
    html2pdf().set({
      margin: 0.5,
      filename: 'گزارشات.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).from(content).save();
  });

  let chartInstance = null;

  elems.chartBtn.on('click', () => {
    if (elems.chartContainer.is(":visible")) {
      elems.chartContainer.hide();
      if (chartInstance) chartInstance.destroy();
      return;
    }

    const type = elems.chartType.val();
    const list = applyFilter();
    const dataMap = {};

    list.forEach(l => {
      const key = (type === "user") ? l.user : l.time.split(' - ')[0];
      dataMap[key] = (dataMap[key] || 0) + 1;
    });

    const labels = Object.keys(dataMap);
    const values = Object.values(dataMap);

    if (chartInstance) chartInstance.destroy();

    const ctx = elems.chartCanvas[0].getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: (type === "user") ? 'تعداد گزارش به ازای کاربران' : 'تعداد گزارش‌ها به ازای تاریخ',
          data: values,
          backgroundColor: '#00aaff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    elems.chartContainer.show();
  });

  renderLogs();
});
