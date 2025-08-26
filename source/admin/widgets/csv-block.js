console.log("✅ csv-block-no-react.js 已載入！");

CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "csv-editor-no-react" }],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: match => ({ csv: match[1] }),
  toBlock: obj => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: obj => {
    if (!obj.csv) return "<em>(空表格)</em>";
    const rows = obj.csv.trim().split("\n").map(r => r.split(","));
    return `<table border="1" style="border-collapse: collapse;">
      ${rows.map(r => `<tr>${r.map(c => `<td style="padding:4px;">${c}</td>`).join("")}</tr>`).join("")}
    </table>`;
  }
});

// ===== Handsontable CSV Editor Widget (純 JS) =====
CMS.registerWidget("csv-editor-no-react", class {
  constructor({ onChange, value }) {
    this.onChange = onChange;
    this.value = value || "";
    this.container = document.createElement("div");
    this.toolbar = document.createElement("div");
    this.hot = null;

    this.initToolbar();
    this.initTable();
  }

  initToolbar() {
    this.toolbar.style.marginBottom = "8px";

    const importBtn = document.createElement("button");
    importBtn.textContent = "匯入 CSV";
    importBtn.addEventListener("click", () => this.importCSV());

    const exportBtn = document.createElement("button");
    exportBtn.textContent = "匯出 CSV";
    exportBtn.style.marginLeft = "6px";
    exportBtn.addEventListener("click", () => this.exportCSV());

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "深色模式";
    toggleBtn.style.marginLeft = "6px";
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      toggleBtn.textContent = document.body.classList.contains("dark") ? "亮色模式" : "深色模式";
    });

    this.toolbar.append(importBtn, exportBtn, toggleBtn);
  }

  initTable() {
    this.hotContainer = document.createElement("div");
    this.hotContainer.style.height = "300px";

    this.container.append(this.toolbar, this.hotContainer);

    const data = this.parseCSV(this.value);

    this.hot = new Handsontable(this.hotContainer, {
      data: data,
      rowHeaders: true,
      colHeaders: true,
      licenseKey: "non-commercial-and-evaluation",
      contextMenu: true,
      filters: true,
      columnSorting: true,
      stretchH: "all",
      afterChange: () => this.updateValue()
    });
  }

  parseCSV(str) {
    if (!str) return [[]];
    return str.trim().split("\n").map(r => r.split(","));
  }

  updateValue() {
    const data = this.hot.getData();
    const csv = data.map(r => r.join(",")).join("\n");
    this.value = csv;
    if (typeof this.onChange === "function") this.onChange(csv);
  }

  importCSV() {
    const pasted = prompt("請貼上 CSV 內容：");
    if (!pasted) return;

    Papa.parse(pasted, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (res) => {
        const data = res.data.map(r => Object.values(r));
        const headers = res.meta.fields;
        this.hot.updateSettings({ data: data, colHeaders: headers });
        this.updateValue();
      }
    });
  }

  exportCSV() {
    const data = this.hot.getData();
    const headers = this.hot.getColHeader();
    const csv = Papa.unparse(data, { columns: headers });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edited.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  focus() {
    if (this.hot) this.hot.selectCell(0, 0);
  }

  getElement() {
    return this.container;
  }
});