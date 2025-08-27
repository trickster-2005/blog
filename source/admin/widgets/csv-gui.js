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
    return `<csv-table>\n${csvContent}\n</csv-table>\n${htmlTable}`;
  },
  toPreview: function(data) {
    return CMS.widgets.get("csv-table").toBlock(data);
  },
  control: function(props) {
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "400px";

    const csvData = props.value && props.value.trim() ? props.value : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const data = csvData.split("\n").map(r => r.split(","));

    const hot = new Handsontable(container, {
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
      props.onChange(hot.getData().map(r => r.join(",")).join("\n"));
    });

    // 欄位名稱 inline 編輯
    hot.addHook("afterGetColHeader", function(col, TH) {
      TH.contentEditable = true;
      TH.addEventListener("blur", () => {
        const newName = TH.textContent.replace(/x$/,"").trim();
        const headers = hot.getColHeader();
        headers[col] = newName;
        hot.updateSettings({ colHeaders: headers });
      });
    });

    // 新增欄位按鈕
    const addColBtn = document.createElement("button");
    addColBtn.textContent = "+ Add Column";
    addColBtn.style.margin = "4px";
    addColBtn.onclick = () => {
      const newColName = prompt("Enter new column name:", "New Column");
      if(!newColName) return;
      hot.alter("insert_col", hot.countCols());
      const colIndex = hot.countCols() - 1;
      const headers = hot.getColHeader();
      headers[colIndex] = newColName;
      hot.updateSettings({ colHeaders: headers });
    };

    // 匯入 / 匯出 CSV
    const importBtn = document.createElement("button");
    importBtn.textContent = "Import CSV";
    importBtn.style.margin = "4px";
    importBtn.onclick = () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".csv";
      fileInput.onchange = e => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = evt => hot.loadData(evt.target.result.split("\n").map(r=>r.split(",")));
        reader.readAsText(file);
      };
      fileInput.click();
    };
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export CSV";
    exportBtn.style.margin = "4px";
    exportBtn.onclick = () => {
      const csvText = hot.getData().map(r => r.join(",")).join("\n");
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "table.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    };

    // 插入按鈕
    container.insertAdjacentElement("beforebegin", addColBtn);
    container.insertAdjacentElement("beforebegin", importBtn);
    container.insertAdjacentElement("beforebegin", exportBtn);

    return container;
  }
});
