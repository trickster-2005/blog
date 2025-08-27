console.log("✅ csv-test.js loaded");

CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [{ name: "csv", label: "CSV Content", widget: "text" }],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/ms,
  fromBlock: function (match) {
    const content = match && match[1] ? match[1].trim() : "";
    return { csv: content || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male" };
  },
  toBlock: function (data) {
    const csvContent =
      data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const rows = csvContent.split("\n").map((r) => r.split(","));
    const colHeaders = rows[0] || ["Name", "Age", "Gender"];
    const htmlRows = rows.map((r, idx) => {
      if (idx === 0)
        return (
          "<tr>" + colHeaders.map((c) => `<th>${c}</th>`).join("") + "</tr>"
        );
      while (r.length < colHeaders.length) r.push("");
      return "<tr>" + r.map((c) => `<td>${c}</td>`).join("") + "</tr>";
    });
    const htmlTable = `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
      ${htmlRows.join("\n")}
    </table>`;
    return `<csv-table>\n${csvContent}\n</csv-table>\n${htmlTable}`;
  },
  toPreview: function (data) {
    const csvContent =
      data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const rows = csvContent.split("\n").map((r) => r.split(","));
    const colHeaders = rows[0] || ["Name", "Age", "Gender"];
    const htmlRows = rows.map((r, idx) => {
      if (idx === 0)
        return (
          "<tr>" + colHeaders.map((c) => `<th>${c}</th>`).join("") + "</tr>"
        );
      while (r.length < colHeaders.length) r.push("");
      return "<tr>" + r.map((c) => `<td>${c}</td>`).join("") + "</tr>";
    });
    return `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
    ${htmlRows.join("\n")}
  </table>`;
  },
  control: function (props) {
    const el = document.createElement("div");
    el.style.width = "100%";
    el.style.height = "400px";

    // 初始化 CSV
    const csvData =
      props.value && props.value.trim()
        ? props.value
        : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const data = csvData.split("\n").map((r) => r.split(","));

    // Handsontable
    const hot = new Handsontable(el, {
      data,
      rowHeaders: true,
      colHeaders: data[0],
      licenseKey: "non-commercial-and-evaluation",
      contextMenu: true,
      manualColumnResize: true,
      manualRowResize: true,
      stretchH: "all",
      filters: true,
      columnSorting: true,
      copyPaste: true,
      allowInsertColumn: true,
      allowRemoveColumn: true,
      manualColumnMove: true,
      fixedRowsTop: 1,
      fixedColumnsLeft: 0,
    });

    // 新增欄位
    const addColBtn = document.createElement("button");
    addColBtn.textContent = "+ Add Column";
    addColBtn.style.margin = "4px 0";
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

    // 刪除欄位（標題小 x）
    hot.updateSettings({
      colHeaders: function (col) {
        const name = this.getColHeader(col) || `Col ${col + 1}`;
        return `${name} <span style="color:red; cursor:pointer;" data-col="${col}">x</span>`;
      },
    });
    el.addEventListener("click", (e) => {
      if (e.target.dataset && e.target.dataset.col) {
        const col = parseInt(e.target.dataset.col);
        if (confirm(`Delete column "${hot.getColHeader(col)}"?`)) {
          hot.alter("remove_col", col);
        }
      }
    });

    // 同步 CSV
    hot.addHook("afterChange", (changes, source) => {
      if (source === "loadData") return;
      const updatedCSV = hot
        .getData()
        .map((r) => r.join(","))
        .join("\n");
      props.onChange(updatedCSV);
    });

    // inline 編輯欄位名稱
    hot.addHook("afterGetColHeader", function (col, TH) {
      TH.contentEditable = true;
      TH.addEventListener("blur", () => {
        const newName = TH.textContent.replace(/x$/, "").trim();
        const headers = hot.getColHeader();
        headers[col] = newName;
        hot.updateSettings({ colHeaders: headers });
      });
    });

    // 匯入 / 匯出 CSV
    const importBtn = document.createElement("button");
    importBtn.textContent = "Import CSV";
    importBtn.style.margin = "4px";
    importBtn.onclick = () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".csv";
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const text = evt.target.result;
          const rows = text.split("\n").map((r) => r.split(","));
          hot.loadData(rows);
        };
        reader.readAsText(file);
      };
      fileInput.click();
    };
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export CSV";
    exportBtn.style.margin = "4px";
    exportBtn.onclick = () => {
      const csvText = hot
        .getData()
        .map((r) => r.join(","))
        .join("\n");
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
  },
});
