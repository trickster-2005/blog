// ===== CSV Block Markdown Component =====
console.log("✅ csv-block-pure-js.js 已載入！");

CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "csv-widget" }],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: function(match) { return { csv: match[1] }; },
  toBlock: function(obj) { return "```csv\n" + (obj.csv || "") + "\n```"; },
  toPreview: function(obj) {
    if (!obj.csv) return "<em>(空表格)</em>";
    const rows = obj.csv.trim().split("\n").map(r => r.split(","));
    return `<table border="1" style="border-collapse: collapse;">
      ${rows.map(r => `<tr>${r.map(c => `<td style="padding:4px;">${c}</td>`).join("")}</tr>`).join("")}
    </table>`;
  }
});

// ===== Handsontable CSV Widget =====
var CSVWidgetControl = createClass({
  getInitialState: function() {
    return { dark: false };
  },

  componentDidMount: function() {
    this.container = document.createElement("div");
    this.toolbar = document.createElement("div");
    this.toolbar.style.marginBottom = "8px";

    // 匯入按鈕
    var importBtn = document.createElement("button");
    importBtn.textContent = "匯入 CSV";
    importBtn.addEventListener("click", this.importCSV.bind(this));

    // 匯出按鈕
    var exportBtn = document.createElement("button");
    exportBtn.textContent = "匯出 CSV";
    exportBtn.style.marginLeft = "6px";
    exportBtn.addEventListener("click", this.exportCSV.bind(this));

    // 深色模式切換
    var toggleBtn = document.createElement("button");
    toggleBtn.textContent = "深色模式";
    toggleBtn.style.marginLeft = "6px";
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      toggleBtn.textContent = document.body.classList.contains("dark") ? "亮色模式" : "深色模式";
    });

    this.toolbar.append(importBtn, exportBtn, toggleBtn);
    this.container.append(this.toolbar);

    // Handsontable 容器
    this.tableDiv = document.createElement("div");
    this.tableDiv.style.height = "300px";
    this.container.append(this.tableDiv);

    // 初始化 Handsontable
    var data = this.parseCSV(this.props.value || "");
    this.hot = new Handsontable(this.tableDiv, {
      data: data,
      rowHeaders: true,
      colHeaders: true,
      licenseKey: "non-commercial-and-evaluation",
      contextMenu: true,
      filters: true,
      columnSorting: true,
      stretchH: "all",
      afterChange: () => { this.updateValue(); }
    });
  },

  parseCSV: function(str) {
    if (!str) return [[]];
    return str.trim().split("\n").map(r => r.split(","));
  },

  updateValue: function() {
    var data = this.hot.getData();
    var csv = data.map(r => r.join(",")).join("\n");
    if (typeof this.props.onChange === "function") {
      this.props.onChange(csv);
    }
  },

  importCSV: function() {
    var pasted = prompt("請貼上 CSV 內容：");
    if (!pasted) return;
    var self = this;
    Papa.parse(pasted, {
      header: true,
      skipEmptyLines: "greedy",
      complete: function(res) {
        var data = res.data.map(r => Object.values(r));
        var headers = res.meta.fields;
        self.hot.updateSettings({ data: data, colHeaders: headers });
        self.updateValue();
      }
    });
  },

  exportCSV: function() {
    var data = this.hot.getData();
    var headers = this.hot.getColHeader();
    var csv = Papa.unparse(data, { columns: headers });
    var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "edited.csv";
    a.click();
    URL.revokeObjectURL(url);
  },

  render: function() {
    return h("div", { ref: el => el && el.appendChild(this.container) });
  }
});

CMS.registerWidget("csv-widget", CSVWidgetControl);
