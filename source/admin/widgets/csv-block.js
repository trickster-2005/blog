// ====== csv-block.js ======
CMS.registerWidget('csv-block', class {
  constructor(config, onChange) {
    this.onChange = onChange;
    this.container = document.createElement('div');
    this.container.style.width = '100%';
    this.container.style.height = '400px';
    this.container.style.position = 'relative';

    // ====== 建立工具列 ======
    const toolbar = document.createElement('div');
    toolbar.style.marginBottom = '8px';
    toolbar.style.display = 'flex';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.gap = '4px';

    const makeButton = (text, callback) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.type = 'button';
      btn.addEventListener('click', callback);
      return btn;
    };

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,text/csv';
    fileInput.style.display = 'none';

    const uploadBtn = makeButton('上傳 CSV', () => fileInput.click());
    toolbar.appendChild(uploadBtn);
    toolbar.appendChild(fileInput);

    const pasteBtn = makeButton('貼上 CSV', () => pasteDlg.showModal());
    toolbar.appendChild(pasteBtn);

    const addRowBtn = makeButton('新增列', () => this.addRow());
    const removeRowBtn = makeButton('刪除列', () => this.removeRow());
    const addColBtn = makeButton('新增欄', () => this.addCol());
    const removeColBtn = makeButton('刪除欄', () => this.removeCol());
    toolbar.appendChild(addRowBtn);
    toolbar.appendChild(removeRowBtn);
    toolbar.appendChild(addColBtn);
    toolbar.appendChild(removeColBtn);

    const exportCsvBtn = makeButton('匯出 CSV', () => this.exportCsv());
    const exportJsonBtn = makeButton('匯出 JSON', () => this.exportJson());
    toolbar.appendChild(exportCsvBtn);
    toolbar.appendChild(exportJsonBtn);

    const darkBtn = makeButton('深色模式', () => {
      this.container.classList.toggle('dark');
      darkBtn.textContent = this.container.classList.contains('dark') ? '淺色模式' : '深色模式';
    });
    toolbar.appendChild(darkBtn);

    this.container.appendChild(toolbar);

    // ====== 建立 Handsontable container ======
    this.hotDiv = document.createElement('div');
    this.hotDiv.style.width = '100%';
    this.hotDiv.style.height = 'calc(100% - 40px)';
    this.container.appendChild(this.hotDiv);

    // ====== 建立貼上對話框 ======
    const pasteDlg = document.createElement('dialog');
    pasteDlg.style.width = '500px';
    pasteDlg.style.padding = '10px';
    pasteDlg.innerHTML = `
      <div>
        <textarea id="pasteArea" style="width:100%;height:150px"></textarea>
        <div style="margin-top:4px">
          <button id="parsePasted" type="button">匯入</button>
          <button id="cancelDlg" type="button">取消</button>
        </div>
      </div>
    `;
    pasteDlg.querySelector('#cancelDlg').addEventListener('click', () => pasteDlg.close());
    pasteDlg.querySelector('#parsePasted').addEventListener('click', () => {
      const txt = pasteDlg.querySelector('#pasteArea').value || '';
      if (!txt.trim()) { pasteDlg.close(); return; }
      Papa.parse(txt, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          const fields = res.meta.fields || [];
          this.loadDataWithHeaders(res.data || [], fields);
          pasteDlg.close();
        },
      });
    });
    this.container.appendChild(pasteDlg);

    fileInput.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      if (f) this.parseCSVFile(f);
      fileInput.value = '';
    });

    // ====== 初始化表格 ======
    const defaultSheet = this.buildDefaultSheet();
    this.headers = defaultSheet.headers;
    this.columns = defaultSheet.columns;
    this.data = defaultSheet.data;

    this.hot = new Handsontable(this.hotDiv, {
      data: this.data,
      columns: this.columns,
      colHeaders: this.headers,
      rowHeaders: true,
      licenseKey: 'non-commercial-and-evaluation',
      contextMenu: true,
      dropdownMenu: true,
      filters: true,
      columnSorting: true,
      manualColumnResize: true,
      manualRowResize: true,
      manualColumnMove: true,
      manualRowMove: true,
      autoWrapRow: false,
      undo: true,
      copyPaste: true,
      height: '100%',
      stretchH: 'all',
    });
  }

  getElement() { return this.container; }
  getValue() { return this.getCurrentDataObjects().rows || []; }

  buildDefaultSheet() {
    const headers = ['年齡','日期','類別','備註'];
    return {
      headers,
      columns: headers.map(h => ({ data: h, type: 'text' })),
      data: [
        { 年齡: 20, 日期:'2025-01-01', 類別:'其他', 備註:'示例' },
        { 年齡: 100, 日期:'2025-01-01', 類別:'其他', 備註:'示例' },
      ]
    };
  }

  inferColumns(headers) {
    return headers.map(h => ({ data:h, type:'text' }));
  }

  loadDataWithHeaders(objs, headersIn) {
    const cols = this.inferColumns(headersIn);
    this.hot.updateSettings({ data: objs, columns: cols, colHeaders: headersIn });
  }

  parseCSVFile(file) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const fields = res.meta.fields || [];
        this.loadDataWithHeaders(res.data || [], fields);
      },
    });
  }

  getCurrentDataObjects() {
    const headers = this.hot.getColHeader();
    const data = this.hot.getSourceData();
    const rows = data.map(r => {
      const o = {};
      headers.forEach(h => o[h] = r?.[h] ?? '');
      return o;
    });
    return { headers, rows };
  }

  addRow() {
    const newRow = {};
    this.hot.getColHeader().forEach(h => newRow[h]='');
    this.hot.updateSettings({ data: [...this.hot.getSourceData(), newRow] });
  }

  removeRow() {
    const data = this.hot.getSourceData();
    const sel = this.hot.getSelectedLast();
    const rowIndex = sel ? sel[0] : data.length-1;
    data.splice(rowIndex,1);
    this.hot.updateSettings({ data });
  }

  addCol() {
    const colName = prompt('請輸入新欄位名稱', `Column ${this.hot.countCols()+1}`);
    if (!colName) return;
    const headers = this.hot.getColHeader();
    const cols = this.hot.getSettings().columns;
    const data = this.hot.getSourceData();
    data.forEach(r => r[colName]='');
    headers.push(colName);
    cols.push({ data: colName, type:'text' });
    this.hot.updateSettings({ colHeaders: headers, columns: cols, data });
  }

  removeCol() {
    const sel = this.hot.getSelectedLast();
    const colIndex = sel ? sel[1] : this.hot.countCols()-1;
    if (colIndex<0) return;
    const headers = this.hot.getColHeader();
    const cols = this.hot.getSettings().columns;
    const data = this.hot.getSourceData();
    data.forEach(r => delete r[headers[colIndex]]);
    headers.splice(colIndex,1);
    cols.splice(colIndex,1);
    this.hot.updateSettings({ colHeaders: headers, columns: cols, data });
  }

  exportCsv() {
    const { headers, rows } = this.getCurrentDataObjects();
    const csv = Papa.unparse(rows,{columns:headers});
    const content = '\uFEFF'+csv;
    const ts = new Date().toISOString().replace(/[:T]/g,'-').slice(0,19);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
    a.download = `edited-${ts}.csv`;
    a.click();
  }

  exportJson() {
    const { rows } = this.getCurrentDataObjects();
    const ts = new Date().toISOString().replace(/[:T]/g,'-').slice(0,19);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(rows,null,2)],{type:'application/json;charset=utf-8'}));
    a.download = `edited-${ts}.json`;
    a.click();
  }

});
