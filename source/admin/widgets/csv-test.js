console.log("✅ csv-block.js loaded");

CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [
    { name: "csv", label: "CSV Content", widget: "text" } // Markdown 存 CSV 純文字
  ],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/ms,
  fromBlock: function(match) {
    const content = match[1].trim();
    return {
      csv: content || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male"
    };
  },
  toBlock: function(data) {
    return `<csv-table>\n${data.csv}\n</csv-table>`;
  },
  toPreview: function(data) {
    const rows = data.csv.split("\n").map(r => r.split(","));
    const htmlRows = rows.map(r => "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>");
    return `<table border="1" style="border-collapse: collapse; width: 100%;">${htmlRows.join("")}</table>`;
  },
  control: CMS.createClass({
    componentDidMount: function() {
      // 建立 Handsontable 容器
      const container = document.createElement("div");
      container.style.width = "100%";
      container.style.height = "300px";
      this.el.appendChild(container);

      // CSV -> 2D Array
      const csvData = this.props.value && this.props.value.trim()
        ? this.props.value
        : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";

      const data = csvData.split("\n").map(r => r.split(","));

      // 初始化 Handsontable
      this.hot = new Handsontable(container, {
        data,
        rowHeaders: true,
        colHeaders: true,
        licenseKey: "non-commercial-and-evaluation",
        contextMenu: [
          "row_above",
          "row_below",
          "remove_row",
          "col_left",
          "col_right",
          "remove_col",
          "undo",
          "redo"
        ],
        filters: true,
        columnSorting: true,
        stretchH: "all",
        manualColumnResize: true,
        manualRowResize: true,
        afterChange: (changes, source) => {
          if (source === "loadData") return; // 避免循環
          const updatedCSV = this.hot.getData().map(r => r.join(",")).join("\n");
          this.props.onChange(updatedCSV);
        }
      });
    },
    render: function() {
      this.el = CMS.h('div', { className: this.props.classNameWrapper });
      return this.el;
    }
  })
});