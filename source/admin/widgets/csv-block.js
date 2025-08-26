// csv-block.js (Decap CMS widget)
CMS.registerWidget("csv-block", function (opts) {
  return class CsvBlockControl extends CMS.Widget {
    constructor(config, onChange, widgetArgs) {
      super(config, onChange, widgetArgs);

      // 建立容器
      this.container = document.createElement("div");
      this.container.style.width = "100%";
      this.container.style.height = "400px";

      // 初始化表格
      const defaultData = [{ 年齡: 20, 日期: "2025-01-01", 類別: "其他", 備註: "示例" }];
      const defaultHeaders = ["年齡", "日期", "類別", "備註"];
      const defaultColumns = defaultHeaders.map((h) => ({ data: h, type: "text" }));

      this.hot = new Handsontable(this.container, {
        data: defaultData,
        columns: defaultColumns,
        colHeaders: defaultHeaders,
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
        height: "100%",
        stretchH: "all",
      });

      // 工具函數
      this.arrayToObjects = function (data, headers) {
        return data.map((r) => {
          const o = {};
          headers.forEach((h, i) => (o[h] = r[i] ?? ""));
          return o;
        });
      };

      this.loadDataWithHeaders = (rows, headers) => {
        const cols = headers.map((h) => ({ data: h, type: "text" }));
        this.hot.updateSettings({ data: rows, columns: cols, colHeaders: headers });
      };

      this.getCurrentDataObjects = () => {
        const headers = this.hot.getColHeader();
        const data = this.hot.getSourceData();
        const rows = data.map((r) => {
          const o = {};
          headers.forEach((h) => (o[h] = r?.[h] ?? ""));
          return o;
        });
        return { headers, rows };
      };

      // 監聽資料變動回傳到 CMS
      this.hot.addHook("afterChange", () => {
        const { rows } = this.getCurrentDataObjects();
        onChange(rows);
      });

      // 加入操作按鈕
      const controls = document.createElement("div");
      controls.style.marginTop = "5px";
      controls.innerHTML = `
        <input type="file" id="csvFileInput" style="display:none" />
        <button id="uploadCsvBtn">上傳 CSV</button>
        <button id="pasteCsvBtn">貼上 CSV</button>
        <button id="blankBtn">建立空白表格</button>
        <button id="addRowBtn">新增列</button>
        <button id="removeRowBtn">刪除列</button>
        <button id="addColBtn">新增欄位</button>
        <button id="removeColBtn">刪除欄位</button>
        <button id="exportCsvBtn">匯出 CSV</button>
        <button id="exportJsonBtn">匯出 JSON</button>
        <button id="darkModeBtn">深色模式</button>
      `;
      this.container.appendChild(controls);

      // 綁定按鈕事件
      const fileInput = controls.querySelector("#csvFileInput");
      controls.querySelector("#uploadCsvBtn").addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => {
        const f = e.target.files?.[0];
        if (f) {
          Papa.parse(f, {
            header: true,
            skipEmptyLines: "greedy",
            complete: (res) => {
              const headers = res.meta.fields || [];
              this.loadDataWithHeaders(res.data || [], headers);
              onChange(res.data || []);
            },
          });
        }
      });

      controls.querySelector("#pasteCsvBtn").addEventListener("click", () => {
        const txt = prompt("請貼上 CSV 文字：");
        if (txt) {
          Papa.parse(txt, {
            header: true,
            skipEmptyLines: "greedy",
            complete: (res) => {
              const headers = res.meta.fields || [];
              this.loadDataWithHeaders(res.data || [], headers);
              onChange(res.data || []);
            },
          });
        }
      });

      controls.querySelector("#blankBtn").addEventListener("click", () => {
        this.loadDataWithHeaders([], []);
        onChange([]);
      });

      controls.querySelector("#addRowBtn").addEventListener("click", () => {
        const newRow = {};
        this.hot.getColHeader().forEach((h) => (newRow[h] = ""));
        this.hot.updateSettings({ data: [...this.hot.getSourceData(), newRow] });
      });

      controls.querySelector("#removeRowBtn").addEventListener("click", () => {
        const data = this.hot.getSourceData();
        data.pop();
        this.hot.updateSettings({ data });
      });

      controls.querySelector("#addColBtn").addEventListener("click", () => {
        const colName = prompt("請輸入新欄位名稱：", `Column ${this.hot.countCols() + 1}`);
        if (!colName) return;
        const data = this.hot.getSourceData();
        data.forEach((row) => (row[colName] = ""));
        const headers = this.hot.getColHeader();
        const cols = this.hot.getSettings().columns;
        headers.push(colName);
        cols.push({ data: colName, type: "text" });
        this.hot.updateSettings({ colHeaders: headers, columns: cols, data });
      });

      controls.querySelector("#removeColBtn").addEventListener("click", () => {
        const data = this.hot.getSourceData();
        const headers = this.hot.getColHeader();
        const cols = this.hot.getSettings().columns;
        if (!headers.length) return;
        const colName = headers[headers.length - 1];
        data.forEach((row) => delete row[colName]);
        headers.pop();
        cols.pop();
        this.hot.updateSettings({ colHeaders: headers, columns: cols, data });
      });

      controls.querySelector("#exportCsvBtn").addEventListener("click", () => {
        const { headers, rows } = this.getCurrentDataObjects();
        const csv = Papa.unparse(rows, { columns: headers });
        const content = "\uFEFF" + csv;
        const ts = new Date().toISOString().slice(0, 19);
        const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `edited-${ts}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      });

      controls.querySelector("#exportJsonBtn").addEventListener("click", () => {
        const { rows } = this.getCurrentDataObjects();
        const ts = new Date().toISOString().slice(0, 19);
        const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `edited-${ts}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
      });

      controls.querySelector("#darkModeBtn").addEventListener("click", () => {
        document.body.classList.toggle("dark");
      });
    }

    getElement() {
      return this.container;
    }

    getValue() {
      return this.hot.getSourceData();
    }

    setValue(val) {
      if (Array.isArray(val)) {
        const headers = val.length ? Object.keys(val[0]) : [];
        const cols = headers.map((h) => ({ data: h, type: "text" }));
        this.hot.updateSettings({ data: val, columns: cols, colHeaders: headers });
      }
    }
  };
});
