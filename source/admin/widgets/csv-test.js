console.log("✅ csv-test.js loaded");

const React = CMS.React;

class CSVControl extends React.Component {
  componentDidMount() {
    // 建立 Handsontable 容器
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "400px";
    this.el.appendChild(container);

    // 取得 CSV 或預設值
    const csvData = this.props.value && this.props.value.trim()
      ? this.props.value
      : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";

    const data = csvData.split("\n").map(r => r.split(","));

    // 初始化 Handsontable
    this.hot = new Handsontable(container, {
      data,
      colHeaders: data[0] || ["Name", "Age", "Gender"],
      rowHeaders: true,
      licenseKey: "non-commercial-and-evaluation",
      contextMenu: true,
      manualColumnResize: true,
      manualRowResize: true,
      stretchH: 'all',
      filters: true,
      columnSorting: true,
      copyPaste: true,
      afterChange: (changes, source) => {
        if (source === "loadData") return;
        const updatedCSV = this.hot.getData().map(r => r.join(",")).join("\n");
        this.props.onChange(updatedCSV); // 更新 widget value
      }
    });
  }

  render() {
    // 外層容器
    this.el = React.createElement('div', { className: this.props.classNameWrapper });
    return this.el;
  }
}

// 註冊 Editor Component
CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [
    { name: "csv", label: "CSV Content", widget: "text" }
  ],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/ms,
  fromBlock: function(match) {
    const content = match[1].trim();
    return {
      csv: content || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male"
    };
  },
  toBlock: function(data) {
    // 儲存 HTML table 到文章
    const rows = data.csv.split("\n").map(r => r.split(","));
    const htmlRows = rows.map(r => "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>");
    const htmlTable = `<table border="1" style="border-collapse: collapse; width: 100%;">${htmlRows.join("")}</table>`;
    return `<csv-table>\n${data.csv}\n</csv-table>\n${htmlTable}`;
  },
  toPreview: function(data) {
    // 編輯器內預覽表格
    const rows = data.csv.split("\n").map(r => r.split(","));
    const htmlRows = rows.map(r => "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>");
    return `<table border="1" style="border-collapse: collapse; width: 100%;">${htmlRows.join("")}</table>`;
  },
  control: CSVControl
});
