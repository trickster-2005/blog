(function() {
  // Control Component (後台欄位)
  function CSVControl({ value = [], onChange, forID, classNameWrapper }) {
    const container = document.createElement('div');
    container.id = forID;
    container.className = classNameWrapper;

    // 初始化資料
    let data = Array.isArray(value) ? value : [];

    const tableEl = document.createElement('table');
    tableEl.style.borderCollapse = 'collapse';
    tableEl.style.width = '100%';
    container.appendChild(tableEl);

    function renderTable() {
      tableEl.innerHTML = '';
      if (!data.length) return;

      const headerRow = document.createElement('tr');
      Object.keys(data[0]).forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        th.style.border = '1px solid #ccc';
        th.style.padding = '4px';
        headerRow.appendChild(th);
      });
      tableEl.appendChild(headerRow);

      data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        Object.keys(row).forEach(col => {
          const td = document.createElement('td');
          td.style.border = '1px solid #ccc';
          td.style.padding = '2px';

          const input = document.createElement('input');
          input.value = row[col];
          input.style.width = '100%';
          input.addEventListener('input', e => {
            data[rowIndex][col] = e.target.value;
            onChange(data);
          });

          td.appendChild(input);
          tr.appendChild(td);
        });
        tableEl.appendChild(tr);
      });
    }

    // 新增列
    const addRowBtn = document.createElement('button');
    addRowBtn.type = 'button';
    addRowBtn.textContent = '新增列';
    addRowBtn.addEventListener('click', () => {
      const newRow = {};
      if (data[0]) Object.keys(data[0]).forEach(k => (newRow[k] = ''));
      data.push(newRow);
      onChange(data);
      renderTable();
    });

    // 新增欄
    const addColBtn = document.createElement('button');
    addColBtn.type = 'button';
    addColBtn.textContent = '新增欄';
    addColBtn.addEventListener('click', () => {
      const colName = prompt('輸入欄位名稱');
      if (!colName) return;
      data.forEach(r => (r[colName] = ''));
      onChange(data);
      renderTable();
    });

    container.appendChild(addRowBtn);
    container.appendChild(addColBtn);

    renderTable();

    return container;
  }

  // Preview Component (前台只讀)
  function CSVPreview({ value = [] }) {
    const container = document.createElement('div');
    if (!value.length) {
      container.textContent = '無資料';
      return container;
    }

    const tableEl = document.createElement('table');
    tableEl.style.borderCollapse = 'collapse';
    tableEl.style.width = '100%';

    const headerRow = document.createElement('tr');
    Object.keys(value[0]).forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      th.style.border = '1px solid #ccc';
      th.style.padding = '4px';
      headerRow.appendChild(th);
    });
    tableEl.appendChild(headerRow);

    value.forEach(row => {
      const tr = document.createElement('tr');
      Object.keys(row).forEach(col => {
        const td = document.createElement('td');
        td.textContent = row[col];
        td.style.border = '1px solid #ccc';
        td.style.padding = '2px';
        tr.appendChild(td);
      });
      tableEl.appendChild(tr);
    });

    container.appendChild(tableEl);
    return container;
  }

  // 註冊 Widget
  CMS.registerWidget('csv', CSVControl, CSVPreview);

})();