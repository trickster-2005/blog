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

    const defaultColHeaders = ["Name", "Age", "Gender"];
    const defaultColumns = [
      { type: "text" },
      { type: "numeric" },
      { type: "dropdown", source: ["Male", "Female", "Other"] }
    ];

    React.useEffect(() => {
      if (!containerRef.current) return;

      const csvData = props.value && props.value.trim()
        ? props.value
        : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";

      const data = csvData.split("\n").map(r => r.split(","));

      hotRef.current = new Handsontable(containerRef.current, {
        data,
        colHeaders: defaultColHeaders,
        columns: defaultColumns,
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
          "redo",
          {
            name: "Add Column...",
            callback: function() {
              const colName = prompt("Enter column name:", "NewColumn");
              if (!colName) return;
              const colType = prompt("Enter type: text / numeric / dropdown / date", "text");
              let colDef = { type: "text" };
              if (colType === "numeric") colDef = { type: "numeric" };
              else if (colType === "dropdown") {
                const options = prompt("Enter dropdown options separated by commas", "Option1,Option2");
                colDef = { type: "dropdown", source: options.split(",") };
              }
              else if (colType === "date") colDef = { type: "date", dateFormat: "YYYY-MM-DD" };

              hotRef.current.alter("insert_col", hotRef.current.countCols());
              const idx = hotRef.current.countCols() - 1;

              // 更新列設定與欄位標題
              const cols = hotRef.current.getSettings().columns.slice();
              cols[idx] = colDef;
              hotRef.current.updateSettings({
                columns: cols,
                colHeaders: [...hotRef.current.getColHeader(), colName]
              });
            }
          }
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

    return h('div', { ref: containerRef, style: { width: "100%", height: "500px", overflow: "auto" } });
  }
});
