// ===== CSV Block Markdown Component =====
console.log("✅ csv-block.js 已經載入！");

// 把 Decap 內建的 React 引出來
const React = CMS.React;
const ReactDOM = CMS.ReactDOM;

CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "csv-editor" }],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: match => ({ csv: match[1] }),
  toBlock: obj => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: obj => {
    if (!obj.csv) return "<em>(空表格)</em>";
    const rows = obj.csv.trim().split("\n").map(r => r.split(","));
    return `<table border="1">
      ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}
    </table>`;
  }
});

// ===== Handsontable CSV Editor Widget =====
CMS.registerWidget("csv-editor", class extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.state = { dark: false };
  }

  componentDidMount() {
    this.initTable(this.props.value || "");
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value && this.hot) {
      this.hot.loadData(this.parseCSV(this.props.value || ""));
    }
  }

  initTable(initialCSV) {
    this.hot = new Handsontable(this.containerRef.current, {
      data: this.parseCSV(initialCSV),
      rowHeaders: true,
      colHeaders: true,
      licenseKey: "non-commercial-and-evaluation",
      contextMenu: true,
      filters: true,
      columnSorting: true,
      stretchH: "all",
      afterChange: () => {
        const data = this.hot.getData();
        const csv = data.map(r => r.join(",")).join("\n");
        this.props.onChange(csv);
      }
    });
  }

  parseCSV(str) {
    if (!str) return [[]];
    return str.trim().split("\n").map(r => r.split(","));
  }

  exportCSV = () => {
    const data = this.hot.getSourceData();
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

  importCSV = () => {
    const pasted = prompt("請貼上 CSV 內容：");
    if (!pasted) return;
    Papa.parse(pasted, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (res) => {
        this.hot.updateSettings({ data: res.data, colHeaders: res.meta.fields });
      }
    });
  }

  toggleDark = () => {
    this.setState({ dark: !this.state.dark });
    document.body.classList.toggle("dark");
  }

  render() {
    return React.createElement("div", null,
      // toolbar
      React.createElement("div", { style: { marginBottom: "8px" } },
        React.createElement("button", { onClick: this.importCSV }, "匯入 CSV"),
        React.createElement("button", { onClick: this.exportCSV, style: { marginLeft: "6px" } }, "匯出 CSV"),
        React.createElement("button", { onClick: this.toggleDark, style: { marginLeft: "6px" } }, this.state.dark ? "亮色模式" : "深色模式")
      ),
      // table
      React.createElement("div", { ref: this.containerRef, style: { height: "300px" } })
    );
  }
});
