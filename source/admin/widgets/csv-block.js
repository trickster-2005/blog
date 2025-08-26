CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [
    { name: "csv", label: "CSV Content", widget: "text" }
  ],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/m,
  fromBlock: function(match) {
    // 如果 Markdown 有內容就用它，否則填入預設資料
    const content = match[1].trim();
    return { csv: content || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male" };
  },
  toBlock: function(data) {
    return `<csv-table>\n${data.csv}\n</csv-table>`;
  },
  toPreview: function(data) {
    const rows = data.csv.split("\n").map(r => r.split(","));
    const htmlRows = rows.map(r => "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>");
    return `<table border="1" style="border-collapse: collapse;">${htmlRows.join("")}</table>`;
  },
  control: createClass({
    componentDidMount: function() {
      // 建立 Handsontable 容器
      const container = document.createElement("div");
      container.style.width = "100%";
      container.style.height = "300px";
      this.el.appendChild(container);

      // 使用 Markdown 或預設 CSV
      const csvData = this.props.value && this.props.value.trim()
        ? this.props.value
        : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";

      const data = csvData.split("\n").map(r => r.split(","));

      this.hot = new Handsontable(container, {
        data,
        rowHeaders: true,
        colHeaders: true,
        licenseKey: "non-commercial-and-evaluation",
        contextMenu: true,
        filters: true,
        columnSorting: true,
        stretchH: "all",
        afterChange: () => {
          const updatedCSV = this.hot.getData().map(r => r.join(",")).join("\n");
          this.props.onChange(updatedCSV);
        }
      });
    },
    render: function() {
      this.el = h('div', {className: this.props.classNameWrapper});
      return this.el;
    }
  })
});