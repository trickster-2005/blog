import Handsontable from "handsontable";
import Papa from "papaparse";

CMS.registerWidget("csv-block", class {
  constructor({ onChange, value }) {
    this.value = value || [];
    this.onChange = onChange;

    // 建立主要容器
    this.container = document.createElement("div");
    this.container.style.width = "100%";

    // 工具列容器
    this.toolbar = document.createElement("div");
    this.toolbar.style.marginBottom = "10px";
    this.container.appendChild(this.toolbar);

    // 建立 Handsontable 容器
    this.hotContainer = document.createElement("div");
    this.hotContainer.style.width = "100%";
    this.hotContainer.style.height = "300px";
    this.hotContainer.style.border = "1px solid #ccc";
    this.container.appendChild(this.hotContainer);

    // ====== 初始化 Handsontable ======
    const defaultData = Array.isArray(this.value) && this.value.length ? this.value : [
      { 年齡: 20, 日期: "2025-01-01", 類別: "其他", 備註: "示例" },
      { 年齡: 100, 日期: "2025-01-01", 類別: "其他", 備註: "示例" },
    ];
    const headers = Object.keys(defaultData[0] || {});
    const columns = this.inferColumns(headers);

    this.hot = new Handsontable(this.hotContainer, {
      data: defaultData,
      columns,
      colHeaders: headers,
      rowHeaders: true,
      licenseKey: "non-commercial-and-evaluation",
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
      stretchH: "all",
    });

    // ====== 建立按鈕 ======
    this.createToolbarButtons();
  }

  // 渲染
  render() {
    return this.container;
  }

  getValue() {
    return this.hot.getSourceData();
  }

  // ====== 工具函數 ======
  download(filename, content, mime = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  arrayToObjects(data, headers) {
    return data.map((r) => {
      const o = {};
      headers.forEach((h, i) => (o[h] = r[i] ?? ""));
      return o;
    });
  }

  inferColumns(headers) {
    const genderList = ["在地知識", "學名", "大眾用語"];
    const isAge = (h) => /^(年齡|年龄|age)$/i.test(h.trim());
    const isDate = (h) => /^(日期|date)$/i.test(h.trim());
    const isGender = (h) => /^(類別|類别|gender)$/i.test(h.trim());

    return headers.map((h) => {
      if (isAge(h)) {
        return {
          data: h,
          type: "numeric",
          validator: (v, cb) => cb(v === "" || Number.isInteger(Number(v)) && Number(v) > 0),
          allowInvalid: false,
        };
      }
      if (isDate(h)) {
        return {
          data: h,
          type: "date",
          dateFormat: "YYYY-MM-DD",
          correctFormat: true,
          validator: (v, cb) => cb(v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v)),
          allowInvalid: false,
        };
      }
      if (isGender(h)) {
        return {
          data: h,
          type: "dropdown",
          source: genderList,
          strict: false,
          allowInvalid: false,
        };
      }
      return { data: h, type: "text" };
    });
  }

  loadDataWithHeaders(rows, headers) {
    const columns = this.inferColumns(headers);
    this.hot.updateSettings({
      data: rows,
      columns,
      colHeaders: headers,
    });
  }

  createToolbarButtons() {
    // ====== CSV 上傳 ======
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".csv,text/csv";
    fileInput.style.display = "none";
    this.toolbar.appendChild(fileInput);

    const uploadBtn = document.createElement("button");
    uploadBtn.textContent = "上傳 CSV";
    uploadBtn.className = "btn";
    uploadBtn.onclick = () => fileInput.click();
    this.toolbar.appendChild(uploadBtn);

    fileInput.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      if (f) this.parseCSVFile(f);
      fileInput.value = "";
    });

    // ====== 貼上 CSV ======
    const pasteBtn = document.createElement("button");
    pasteBtn.textContent = "貼上 CSV";
    pasteBtn.className = "btn";
    pasteBtn.onclick = () => {
      const txt = prompt("貼上 CSV 內容");
      if (!txt) return;
      Papa.parse(txt, {
        header: true,
        skipEmptyLines: "greedy",
        complete: (res) => {
          const fields = res.meta.fields || [];
          const rows = res.data || [];
          this.loadDataWithHeaders(rows, fields);
        },
      });
    };
    this.toolbar.appendChild(pasteBtn);

    // ====== 增刪列 ======
    const addRowBtn = document.createElement("button");
    addRowBtn.textContent = "新增列";
    addRowBtn.className = "btn";
    addRowBtn.onclick = () => {
      const newRow = {};
      this.hot.getColHeader().forEach(h => newRow[h] = "");
      this.hot.updateSettings({ data: [...this.hot.getSourceData(), newRow] });
    };
    this.toolbar.appendChild(addRowBtn);

    const removeRowBtn = document.createElement("button");
    removeRowBtn.textContent = "刪除列";
    removeRowBtn.className = "btn";
    removeRowBtn.onclick = () => {
      const data = this.hot.getSourceData();
      const sel = this.hot.getSelectedLast();
      const rowIndex = sel ? sel[0] : data.length - 1;
      data.splice(rowIndex, 1);
      this.hot.updateSettings({ data });
    };
    this.toolbar.appendChild(removeRowBtn);

    // ====== 增刪欄 ======
    const addColBtn = document.createElement("button");
    addColBtn.textContent = "新增欄位";
    addColBtn.className = "btn";
    addColBtn.onclick = () => {
      const colName = prompt("請輸入新欄位名稱", `Column ${this.hot.countCols() + 1}`);
      if (!colName) return;
      const dataType = prompt("請選擇資料類型：text / numeric / date / dropdown", "text");
      if (!dataType) return;
      const defaultValue = prompt("預設值（可留空）", "") || "";

      const headers = this.hot.getColHeader();
      const cols = this.hot.getSettings().columns;
      const data = this.hot.getSourceData();
      data.forEach((row) => row[colName] = defaultValue);

      let colSetting = { data: colName, type: dataType };
      if (dataType === "dropdown") { colSetting.source = []; colSetting.strict = false; }
      if (dataType === "numeric") { colSetting.validator = (v, cb) => cb(v === "" || Number.isFinite(Number(v))); }
      if (dataType === "date") {
        colSetting.dateFormat = "YYYY-MM-DD";
        colSetting.correctFormat = true;
        colSetting.validator = (v, cb) => cb(v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v));
      }

      headers.push(colName);
      cols.push(colSetting);
      this.hot.updateSettings({ colHeaders: headers, columns: cols, data });
    };
    this.toolbar.appendChild(addColBtn);

    const removeColBtn = document.createElement("button");
    removeColBtn.textContent = "刪除欄位";
    removeColBtn.className = "btn";
    removeColBtn.onclick = () => {
      const sel = this.hot.getSelectedLast();
      const colIndex = sel ? sel[1] : this.hot.countCols() - 1;
      if (colIndex < 0) return;
      const headers = this.hot.getColHeader();
      const cols = this.hot.getSettings().columns;
      const data = this.hot.getSourceData();
      data.forEach(row => delete row[headers[colIndex]]);
      headers.splice(colIndex, 1);
      cols.splice(colIndex, 1);
      this.hot.updateSettings({ colHeaders: headers, columns: cols, data });
    };
    this.toolbar.appendChild(removeColBtn);

    // ====== 匯出 CSV / JSON ======
    const exportCsvBtn = document.createElement("button");
    exportCsvBtn.textContent = "匯出 CSV";
    exportCsvBtn.className = "btn";
    exportCsvBtn.onclick = () => {
      const headers = this.hot.getColHeader();
      const data = this.hot.getSourceData();
      const csv = Papa.unparse(data, { columns: headers });
      const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
      this.download(`edited-${ts}.csv`, "\uFEFF" + csv, "text/csv;charset=utf-8");
    };
    this.toolbar.appendChild(exportCsvBtn);

    const exportJsonBtn = document.createElement("button");
    exportJsonBtn.textContent = "匯出 JSON";
    exportJsonBtn.className = "btn";
    exportJsonBtn.onclick = () => {
      const data = this.hot.getSourceData();
      const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
      this.download(`edited-${ts}.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
    };
    this.toolbar.appendChild(exportJsonBtn);

    // ====== 深色模式 ======
    const darkModeBtn = document.createElement("button");
    darkModeBtn.textContent = "深色模式";
    darkModeBtn.className = "btn";
    darkModeBtn.onclick = () => {
      this.container.classList.toggle("dark");
      darkModeBtn.textContent = this.container.classList.contains("dark") ? "淺色模式" : "深色模式";
    };
    this.toolbar.appendChild(darkModeBtn);
  }

  parseCSVFile(file) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (res) => {
        const fields = res.meta.fields || [];
        const rows = res.data || [];
        this.loadDataWithHeaders(rows, fields);
      },
      error: (err) => alert("解析錯誤：" + err.message),
    });
  }
});
