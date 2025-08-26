// ===== csv-block.js =====
console.log("✅ csv-block.js 已載入！");

// --- Markdown 區塊元件 ---
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
    return `
      <table border="1" style="border-collapse: collapse;">
        ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}
      </table>
    `;
  }
});

// --- Handsontable CSV 編輯器 Widget (React) ---
const React = CMS.React;

class CsvEditorControl extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.hot = null;
  }

  componentDidMount() {
    this.initTable(this.props.value || "");
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value && this.hot) {
      this.hot.loadData(this.parseCSV(this.props.value || ""));
    }
  }

  parseCSV(str) {
    if (!str) return [[]];
    return str.trim().split("\n").map(r => r.split(","));
  }

  initTable(initialCSV) {
    this.hot = new Handsontable(this.containerRef.current, {
      data: this.parseCSV(initialCSV),
      rowHeaders: true,
      colHeaders: true,
      contextMenu: true,
      stretchH: "all",
      licenseKey: "non-commercial-and-evaluation",
      afterChange: () => {
        if (!this.hot) return;
        const data = this.hot.getData();
        const csv = data.map(r => r.join(",")).join("\n");
        console.log("🔄 CSV 更新:", csv);
        this.props.onChange(csv);
      }
    });
  }

  render() {
    return React.createElement("div", {
      ref: this.containerRef,
      style: { height: "300px" }
    });
  }
}

CMS.registerWidget("csv-editor", CsvEditorControl);
