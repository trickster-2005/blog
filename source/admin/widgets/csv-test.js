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
    return {
      csv: content || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male"
    };
  },
  toBlock: function(data) {
    // 存回 CMS 的純 CSV
    return data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
  },
  toPreview: function(data) {
    // 後台即時預覽 HTML
    const csvContent = data.csv || "";
    const rows = csvContent.split("\n").map(r => r.split(","));
    if (!rows.length) return "<em>Empty Table</em>";

    const colHeaders = rows[0];
    const htmlRows = rows.map((r, idx) => {
      if (idx === 0) return "<tr>" + colHeaders.map(c => `<th>${c}</th>`).join("") + "</tr>";
      while (r.length < colHeaders.length) r.push("");
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    });
    return `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
      ${htmlRows.join("\n")}
    </table>`;
  },
  control: function(props) {
    const el = document.createElement("div");
    el.style.width = "100%";
    el.style.height = "400px";

    // 取得 CSV 資料，初始化 Handsontable
    const csvData = props.value && props.value.trim() ? props.value : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const data = csvData.split("\n").map(r => r.split(","));

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
      fixedColumnsLeft: 0
    });

    // 同步 CSV 回 CMS
    hot.addHook("afterChange", (changes, source) => {
      if (source === "loadData") return;
      const updatedCSV = hot.getData().map(r => r.join(",")).join("\n");
      props.onChange(updatedCSV);
    });

    // 匯入 CSV
    const importBtn = document.createElement("button");
    importBtn.textContent = "Import CSV";
    importBtn.style.margin = "4px";
    importBtn.onclick = () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".csv";
      fileInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
          const rows = evt.target.result.split("\n").map(r => r.split(","));
          hot.loadData(rows);
        };
        reader.readAsText(file);
      };
      fileInput.click();
    };

    // 匯出 CSV
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

    el.insertAdjacentElement("beforebegin", importBtn);
    el.insertAdjacentElement("beforebegin", exportBtn);

    return el;
  }
});
