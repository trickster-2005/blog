console.log("✅ csv-test.js loaded");

CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [
    { name: "csv", label: "CSV Content", widget: "text" }
  ],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/ms,
  fromBlock: function(match) {
    const content = match && match[1] ? match[1].trim() : "";
    return { csv: content || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male" };
  },
  toBlock: function(data) {
    const csvContent = data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const rows = csvContent.split("\n").map(r => r.split(","));
    const colHeaders = rows[0] || ["Name","Age","Gender"];
    const htmlRows = rows.map((r, idx) => {
      if(idx===0) return "<tr>" + colHeaders.map(c => `<th>${c}</th>`).join("") + "</tr>";
      while(r.length < colHeaders.length) r.push("");
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    });
    const htmlTable = `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
      ${htmlRows.join("\n")}
    </table>`;
    // Markdown 存回 HTML 表格
    return htmlTable;
  },
  toPreview: function(data) {
    // 後台即時預覽直接使用 HTML 表格
    return CMS.widgets.get("csv-table").toBlock(data);
  },
  control: function(props) {
    const el = document.createElement("div");
    el.style.width = "100%";
    el.style.height = "400px";

    // CSV 初始化（解析 HTML table 或直接用 CSV）
    let csvData = "";
    if (props.value && props.value.trim()) {
      if (props.value.includes("<table")) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(props.value, "text/html");
        const rows = Array.from(doc.querySelectorAll("tr"));
        const dataArray = rows.map(tr => Array.from(tr.children).map(td => td.textContent.trim()));
        csvData = dataArray.map(r => r.join(",")).join("\n");
      } else {
        csvData = props.value;
      }
    } else {
      csvData = "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    }

    const data = csvData.split("\n").map(r => r.split(","));

    const hot = new Handsontable(el, {
      data,
      rowHeaders: true,
      colHeaders: data[0],
      licenseKey: "non-commercial-and-evaluation",
      contextMenu: true,
      manualColumnResize: true,
      manualRowResize: true,
      stretchH: 'all',
      filters: true,
      columnSorting: true,
      copyPaste: true,
      allowInsertColumn: true,
      allowRemoveColumn: true,
      manualColumnMove: true,
      fixedRowsTop: 1,
      fixedColumnsLeft: 0
    });

    // 同步 CSV
    hot.addHook("afterChange", (changes, source) => {
      if (source === "loadData") return;
      const updatedCSV = hot.getData().map(r => r.join(",")).join("\n");
      props.onChange(updatedCSV);
    });

    // 新增欄位
    const addColBtn = document.createElement("button");
    addColBtn.textContent = "+ Add Column";
    addColBtn.style.margin = "4px 4px 0 0";
    addColBtn.onclick = () => {
      const newColName = prompt("Enter new column name:", "New Column");
      if (!newColName) return;
      hot.alter("insert_col", hot.countCols());
      const colIndex = hot.countCols() - 1;
      const headers = hot.getColHeader();
      headers[colIndex] = newColName;
      hot.updateSettings({ colHeaders: headers });
    };
    el.insertAdjacentElement("beforebegin", addColBtn);

    // 匯入 / 匯出 CSV
    const importBtn = document.createElement("button");
    importBtn.textContent = "Import CSV";
    importBtn.style.margin = "4px 4px 0 0";
    importBtn.onclick = () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".csv";
      fileInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
          const text = evt.target.result;
          const rows = text.split("\n").map(r => r.split(","));
          hot.loadData(rows);
        };
        reader.readAsText(file);
      };
      fileInput.click();
    };
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export CSV";
    exportBtn.style.margin = "4px 4px 0 0";
    exportBtn.onclick = () => {
      const csvText = hot.getData().map(r => r.join(",")).join("\n");
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "table.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    };
    el.insertAdjacentElement("beforebegin", importBtn);
    el.insertAdjacentElement("beforebegin", exportBtn);

    return el;
  }
});
