console.log("✅ csv-test.js loaded");

const { h } = CMS; // React.createElement

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
    return `<csv-table>\n${data.csv}\n</csv-table>`;
  },
  toPreview: function(data) {
    const rows = data.csv.split("\n").map(r => r.split(","));
    const htmlRows = rows.map(r => "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>");
    return `<table border="1" style="border-collapse: collapse; width: 100%;">${htmlRows.join("")}</table>`;
  },
  control: function(props) {
    const containerRef = React.useRef(null);
    const hotRef = React.useRef(null);

    React.useEffect(() => {
      if (!containerRef.current) return;

      const csvData = props.value && props.value.trim()
        ? props.value
        : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";

      const data = csvData.split("\n").map(r => r.split(","));

      const colHeaders = ["Name", "Age", "Gender"];
      const columns = [
        { type: "text" },
        { type: "numeric" },
        { type: "dropdown", source: ["Male", "Female", "Other"] }
      ];

      hotRef.current = new Handsontable(containerRef.current, {
        data,
        colHeaders,
        columns,
        rowHeaders: true,
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
          if (source === "loadData") return;
          const updatedCSV = hotRef.current.getData().map(r => r.join(",")).join("\n");
          props.onChange(updatedCSV);
        }
      });
    }, []);

    return h('div', { ref: containerRef, style: { width: "100%", height: "350px" } });
  }
});
