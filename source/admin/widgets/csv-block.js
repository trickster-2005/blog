CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [
    {
      name: "csv",
      label: "CSV Content",
      widget: "text"
    }
  ],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/m,
  fromBlock: function(match) {
    return { csv: match[1].trim() };
  },
  toBlock: function(data) {
    return `<csv-table>\n${data.csv}\n</csv-table>`;
  },
  toPreview: function(data) {
    // 將 CSV 字串渲染成 HTML table
    const rows = data.csv.split("\n").map(r => r.split(","));
    const htmlRows = rows.map(r => "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>");
    return `<table border="1" style="border-collapse: collapse;">${htmlRows.join("")}</table>`;
  },
  control: CMS.createClass({
    componentDidMount: function() {
      // 建立 Handsontable
      const container = document.createElement("div");
      container.style.width = "100%";
      container.style.height = "300px";
      this.el.appendChild(container);

      const data = (this.props.value || "").split("\n").map(r => r.split(","));

      this.hot = new Handsontable(container, {
        data: data,
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