console.log("✅ csv-test-debug.js loaded");

CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [
    { name: "csv", label: "CSV Content", widget: "text" }
  ],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/ms,
  fromBlock: function(match) {
    const content = match && match[1] ? match[1].trim() : "";
    console.log("[fromBlock] match:", match);
    return { csv: content || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male" };
  },
  toBlock: function(data) {
    const csvContent = data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    console.log("[toBlock] csvContent:", csvContent);

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
    
    // 儲存 CSV，但也附 HTML 預覽方便 debug
    return csvContent;
  },
  toPreview: function(data) {
    // 後台即時預覽 HTML 表格
    const csvContent = data.csv || "";
    const rows = csvContent.split("\n").map(r => r.split(","));
    if(!rows.length) return "<p>Empty CSV</p>";
    const colHeaders = rows[0];
    const htmlRows = rows.map((r, idx) => {
      if(idx===0) return "<tr>" + colHeaders.map(c => `<th>${c}</th>`).join("") + "</tr>";
      while(r.length < colHeaders.length) r.push("");
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    });
    const htmlTable = `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
      ${htmlRows.join("\n")}
    </table>`;
    console.log("[toPreview] htmlTable:", htmlTable);
    return htmlTable;
  },
  control: function(props) {
    console.log("[control] props.value:", props.value);

    const el = document.createElement("div");
    el.style.width = "100%";
    el.style.height = "400px";

    // 從 CSV 初始化
    const csvData = props.value && props.value.trim() ? props.value : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    console.log("[control] csvData:", csvData);

    const data = csvData.split("\n").map(r => r.split(","));
    console.log("[control] data array:", data);

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
      fixedRowsTop: 1
    });

    // 同步 CSV
    hot.addHook("afterChange", (changes, source) => {
      if (source === "loadData") return;
      const updatedCSV = hot.getData().map(r => r.join(",")).join("\n");
      console.log("[afterChange] updatedCSV:", updatedCSV);
      props.onChange(updatedCSV);
    });

    return el;
  }
});
