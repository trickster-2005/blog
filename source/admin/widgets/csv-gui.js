(function() {
  // 註冊 Editor Component
  CMS.registerEditorComponent({
    id: 'csv-table',
    label: 'CSV Table',
    fields: [
      { name: 'data', label: 'CSV Data', widget: 'text' } // 存儲 CSV 文字
    ],
    // Markdown pattern，用 ```csv 包起來
    pattern: /^```csv\n([\s\S]*?)\n```$/,
    fromBlock: function(match) {
      return { data: match[1] };
    },
    toBlock: function(obj) {
      return '```csv\n' + obj.data + '\n```';
    },
    toPreview: function(obj) {
      // 生成可互動的表格容器
      const container = document.createElement('div');
      container.style.border = '1px solid #ccc';
      container.style.padding = '5px';
      container.style.margin = '5px 0';
      container.className = 'csv-preview';

      let data = [];

      // 解析 CSV 文字
      if (obj.data.trim()) {
        const lines = obj.data.split('\n');
        const headers = lines[0].split(',');
        data = lines.slice(1).map(line => {
          const row = {};
          line.split(',').forEach((cell, idx) => {
            row[headers[idx]] = cell;
          });
          return row;
        });
      }

      function renderTable() {
        container.innerHTML = '';

        if (!data.length) {
          container.textContent = '無資料';
          return;
        }

        // header
        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        const trHead = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
          const th = document.createElement('th');
          th.textContent = key;
          th.style.border = '1px solid #ccc';
          th.style.padding = '2px';
          trHead.appendChild(th);
        });
        table.appendChild(trHead);

        // rows
        data.forEach((row, i) => {
          const tr = document.createElement('tr');
          Object.keys(row).forEach(key => {
            const td = document.createElement('td');
            td.style.border = '1px solid #ccc';
            td.style.padding = '2px';

            const input = document.createElement('input');
            input.value = row[key];
            input.style.width = '100%';
            input.addEventListener('input', e => {
              data[i][key] = e.target.value;
              // 更新原始文字
              obj.data = [Object.keys(data[0]).join(','), ...data.map(r => Object.values(r).join(','))].join('\n');
            });

            td.appendChild(input);
            tr.appendChild(td);
          });
          table.appendChild(tr);
        });

        container.appendChild(table);

        // 新增列
        const addRowBtn = document.createElement('button');
        addRowBtn.textContent = '新增列';
        addRowBtn.type = 'button';
        addRowBtn.style.margin = '5px';
        addRowBtn.addEventListener('click', () => {
          const newRow = {};
          Object.keys(data[0]).forEach(k => newRow[k] = '');
          data.push(newRow);
          obj.data = [Object.keys(data[0]).join(','), ...data.map(r => Object.values(r).join(','))].join('\n');
          renderTable();
        });

        // 新增欄
        const addColBtn = document.createElement('button');
        addColBtn.textContent = '新增欄';
        addColBtn.type = 'button';
        addColBtn.style.margin = '5px';
        addColBtn.addEventListener('click', () => {
          const colName = prompt('輸入欄位名稱');
          if (!colName) return;
          data.forEach(r => r[colName] = '');
          obj.data = [Object.keys(data[0]).join(','), ...data.map(r => Object.values(r).join(','))].join('\n');
          renderTable();
        });

        container.appendChild(addRowBtn);
        container.appendChild(addColBtn);
      }

      renderTable();
      return container;
    }
  });
})();