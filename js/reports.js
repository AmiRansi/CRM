document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("لطفاً وارد شوید.");
    location.href = "index.html";
    return;
  }

  const roles = {
    user: { canExport: false, canFilter: true, canChart: false },
    manager: { canExport: true, canFilter: true, canChart: true },
    admin: { canExport: true, canFilter: true, canChart: true }
  };
  const perm = roles[currentUser.role] || roles.user;

  let logs = JSON.parse(localStorage.getItem("logs")) || [];
  const clients = JSON.parse(localStorage.getItem("clients")) || [];

  const elems = {
    filterBox: $('#filter-box'),
    csvBtn: $('#csv-btn'),
    pdfBtn: $('#pdf-btn'),
    chartBtn: $('#chart-btn'),
    chartMode: $('#chart-mode'),
    chartSettings: $('#chart-settings'),
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
  if (perm.canChart) elems.chartBtn.show();

  elems.toggleBtn.on('click', () => elems.manualBox.toggle());

  const filteredClients = currentUser.role === "admin"
    ? clients
    : clients.filter(c => c.createdBy === currentUser.username);
  filteredClients.forEach(c => {
    elems.clientSelect.append(`<option value="${c.company}">${c.company}</option>`);
    elems.filterClient.append(`<option value="${c.company}">${c.company}</option>`);
  });

  $('#manual-date, #filter-from, #filter-to').pDatepicker({
    format: 'YYYY/MM/DD',
    initialValue: false
  });
  $('#manual-time').timepicker({
    timeFormat: 'H:i',
    interval: 15,
    dropdown: true,
    dynamic: false,
    scrollbar: true,
    appendTo: 'body',
    orientation: 'RL'
  });

  $('#manual-report-form').on('submit', e => {
    e.preventDefault();
    const log = {
      user: currentUser.username,
      action: "add",
      targetType: "manual",
      description: `📌 ${$('#manual-title').val().trim()} | ${$('#manual-description').val().trim()}`,
      company: $('#manual-client-select').val(),
      time: `${$('#manual-date').val()} - ${$('#manual-time').val()}`
    };
    logs.push(log);
    localStorage.setItem("logs", JSON.stringify(logs));
    alert("✅ گزارش ذخیره شد.");
    e.target.reset();
    elems.manualBox.hide();
    renderLogs();
  });

  function applyFilter() {
    return logs.filter(l => {
      if (perm && perm.canFilter) {
        const from = elems.filterFrom.val(),
          to = elems.filterTo.val(),
          client = elems.filterClient.val(),
          key = elems.filterKey.val().trim();
        const d = l.time.split(' - ')[0];
        if (from && d < from) return false;
        if (to && d > to) return false;
        if (client && l.company !== client) return false;
        if (key && !l.description.includes(key) && !l.company.includes(key)) return false;
      }
      return currentUser.role === "admin" || l.user === currentUser.username;
    });
  }

  function renderLogs() {
    elems.logTable.empty();
    const list = applyFilter();
    if (!list.length) {
      elems.logTable.html(`<tr><td colspan="5">گزارشی ثبت نشده است.</td></tr>`);
      return;
    }
    list.forEach(l => {
      elems.logTable.append(
        `<tr><td>${l.user}</td><td>${l.action}</td><td>${l.company}</td><td>${l.description}</td><td>${l.time}</td></tr>`
      );
    });
  }

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
    content.innerHTML = `<h2 style="text-align:center;">گزارش‌ها</h2>`;
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = `<thead>
      <tr>
        <th style="border:1px solid #000;padding:4px;">کاربر</th>
        <th style="border:1px solid #000;padding:4px;">عملیات</th>
        <th style="border:1px solid #000;padding:4px;">مشتری</th>
        <th style="border:1px solid #000;padding:4px;">توضیحات</th>
        <th style="border:1px solid #000;padding:4px;">زمان</th>
      </tr>
    </thead>`;
    const tbody = document.createElement('tbody');
    applyFilter().forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="border:1px solid #000;padding:4px;">${log.user}</td>
        <td style="border:1px solid #000;padding:4px;">${log.action}</td>
        <td style="border:1px solid #000;padding:4px;">${log.company}</td>
        <td style="border:1px solid #000;padding:4px;">${log.description}</td>
        <td style="border:1px solid #000;padding:4px;">${log.time}</td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    content.appendChild(table);

    const canvas = elems.chartCanvas[0];
    if (canvas && canvas.toDataURL) {
      const img = new Image();
      img.src = canvas.toDataURL("image/png");
      img.style.marginTop = "20px";
      img.style.maxWidth = "100%";
      content.appendChild(img);
    }

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
      elems.chartSettings.hide();
      if (chartInstance) chartInstance.destroy();
    } else {
      elems.chartContainer.show();
      elems.chartSettings.show();

      const mode = elems.chartMode.val();
      let labels = [], values = [], labelText = "";

      const data = applyFilter();
      if (mode === "date") {
        const map = {};
        data.forEach(l => {
          const d = l.time.split(" - ")[0];
          map[d] = (map[d] || 0) + 1;
        });
        labels = Object.keys(map);
        values = Object.values(map);
        labelText = "تعداد گزارش‌ها بر اساس تاریخ";
      } else if (mode === "user") {
        const map = {};
        data.forEach(l => {
          const user = l.user;
          map[user] = (map[user] || 0) + 1;
        });
        labels = Object.keys(map);
        values = Object.values(map);
        labelText = "تعداد گزارش‌ها بر اساس کاربران";
      }

      if (chartInstance) chartInstance.destroy();
      const ctx = elems.chartCanvas[0].getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: labelText,
            data: values,
            backgroundColor: "#0077cc"
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
    }
  });

  elems.chartMode.on("change", () => {
    if (elems.chartContainer.is(":visible")) {
      elems.chartBtn.click();
      setTimeout(() => elems.chartBtn.click(), 100);
    }
  });

  renderLogs();
});
