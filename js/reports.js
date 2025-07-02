document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) { alert("لطفاً وارد شوید."); location.href = "index.html"; return; }
  
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
      chartCanvas: $('#chart'),
      toggleBtn: $('#toggle-report-form'),
      manualBox: $('#manual-report-box'),
      clientSelect: $('#manual-client-select'),
      logTable: $('#log-table'),
      filterClient: $('#filter-client'),
      filterFrom: $('#filter-from'),
      filterTo: $('#filter-to'),
      filterKey: $('#filter-keyword'),
      pdfDiv: $('#pdf-content'),
      pdfTable: $('#pdf-table')
    };
  
    if (!perm.canFilter) elems.filterBox.hide();
    if (perm.canExport) elems.csvBtn.show(), elems.pdfBtn.show();
    if (perm.canChart) elems.chartBtn.show();
  
    elems.toggleBtn.on('click', () => elems.manualBox.toggle());
  
    const filteredClients = currentUser.role === "admin" ? clients : clients.filter(c => c.createdBy === currentUser.username);
    filteredClients.forEach(c => {
      elems.clientSelect.append(`<option value="${c.company}">${c.company}</option>`);
      elems.filterClient.append(`<option value="${c.company}">${c.company}</option>`);
    });
  
    $('#manual-date, #filter-from, #filter-to').pDatepicker({ format: 'YYYY/MM/DD', initialValue: false });
    $('#manual-time').timepicker({
      timeFormat: 'H:i', interval: 15, dropdown: true, dynamic: false, scrollbar: true,
      appendTo: 'body', orientation: 'RL'
    });
  
    $('#manual-report-form').on('submit', e => {
      e.preventDefault();
      const log = {
        user: currentUser.username, action: "add", targetType: "manual",
        description: `📌 ${$('#manual-title').val().trim()} | ${$('#manual-description').val().trim()}`,
        company: $('#manual-client-select').val(), time: `${$('#manual-date').val()} - ${$('#manual-time').val()}`
      };
      logs.push(log); localStorage.setItem("logs", JSON.stringify(logs));
      alert("✅ گزارش ذخیره شد."); e.target.reset(); elems.manualBox.hide(); renderLogs();
    });
  
    function applyFilter() {
      return logs.filter(l => {
        if (perm.canFilter) {
          const from = elems.filterFrom.val(), to = elems.filterTo.val(), client = elems.filterClient.val(), key = elems.filterKey.val().trim();
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
      if (!list.length) return elems.logTable.html(`<tr><td colspan="5">گزارشی ثبت نشده است.</td></tr>`);
      list.forEach(l => elems.logTable.append(
        `<tr><td>${l.user}</td><td>${l.action}</td><td>${l.company}</td><td>${l.description}</td><td>${l.time}</td></tr>`
      ));
    }
  
    $('#apply-filter').on('click', renderLogs);
  
    elems.csvBtn.on('click', () => {
      const arr = applyFilter().map(l => [l.user, l.action, l.company, l.description, l.time]);
      const csv = ['کاربر,عملیات,مشتری,توضیح,زمان', ...arr.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'reports.csv';
      a.click();
    });
  
    elems.pdfBtn.on('click', async () => {
      const list = applyFilter();
      const html = `
        <table style="width:100%; border-collapse:collapse; direction:rtl; font-family:Tahoma;">
          <thead>
            <tr><th style="border:1px solid #AAA;padding:8px">کاربر</th>
                <th style="border:1px solid #AAA;padding:8px">عملیات</th>
                <th style="border:1px solid #AAA;padding:8px">مشتری</th>
                <th style="border:1px solid #AAA;padding:8px">توضیح</th>
                <th style="border:1px solid #AAA;padding:8px">زمان</th></tr>
          </thead>
          <tbody>
            ${list.map(l=>`
              <tr>
                <td style="border:1px solid #AAA;padding:8px">${l.user}</td>
                <td style="border:1px solid #AAA;padding:8px">${l.action}</td>
                <td style="border:1px solid #AAA;padding:8px">${l.company}</td>
                <td style="border:1px solid #AAA;padding:8px">${l.description}</td>
                <td style="border:1px solid #AAA;padding:8px">${l.time}</td>
              </tr>`).join('')}
          </tbody>
        </table>`;
      elems.pdfTable.html(html);
      elems.pdfDiv.show();
      const canvas = await html2canvas(elems.pdfDiv[0], { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save('reports.pdf');
      elems.pdfDiv.hide();
    });
  
    elems.chartBtn.on('click', () => {
      const dataMap = {};
      applyFilter().forEach(l => {
        const d = l.time.split(' - ')[0];
        dataMap[d] = (dataMap[d] || 0) + 1;
      });
      const ctx = elems.chartCanvas.show()[0].getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(dataMap),
          datasets: [{
            label: 'تعداد گزارش‌ها',
            data: Object.values(dataMap),
            backgroundColor: '#0077cc'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    });
  
    renderLogs();
  });
  