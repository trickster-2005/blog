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
    
    // Markdown 存回 HTML 表格（發佈後可直接顯示）
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

    const csvData = props.value && props.value.trim()
      ? props.value.replace(/<[^>]+>/g,'') // 去除 HTML，還原 CSV
      : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
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

    // 同步 CSV（去除 HTML）
    hot.addHook("afterChange", (changes, source) => {
      if (source === "loadData") return;
      const updatedCSV = hot.getData().map(r => r.join(",")).join("\n");
      props.onChange(updatedCSV);
    });

    return el;
  }
});
