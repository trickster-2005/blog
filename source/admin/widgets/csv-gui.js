console.log("✅ csv-test-interactive.js loaded");

CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [
    { name: "csv", label: "CSV Content", widget: "text" }
  ],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/ms,
  fromBlock: function(match) {
    const content = match && match[1] ? match[1].trim() : "";
    return { csv: content || "Name,Age,Gender\nAlice,23,Female" };
  },
  toBlock: function(data) {
    // 發佈文章時直接渲染 HTML 表格
    const csvContent = data.csv || "Name,Age,Gender\nAlice,23,Female";
    const rows = csvContent.split("\n").map(r => r.split(","));
    const colHeaders = rows[0];
    const htmlRows = rows.map((r, idx) => {
      if(idx===0) return "<tr>" + colHeaders.map(c => `<th>${c}</th>`).join("") + "</tr>";
      while(r.length < colHeaders.length) r.push("");
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    });
    return `<table border="1" style="border-collapse:collapse;width:100%;">${htmlRows.join("")}</table>`;
  },
  toPreview: function(data) {
    // 後台即時預覽直接渲染 HTML
    return CMS.widgets.get("csv-table").toBlock(data);
  },
  control: function(props) {
    const el = document.createElement("div");
    el.style.width = "100%";
    el.style.height = "300px";

    // 確保初始化時 DOM 已 attach
    requestAnimationFrame(() => {
      const csvData = props.value && props.value.trim()
        ? props.value.replace(/<[^>]+>/g,'')
        : "Name,Age,Gender\nAlice,23,Female";
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
        fixedRowsTop: 1
      });

      // 每次修改後更新 CSV
      hot.addHook("afterChange", (changes, source) => {
        if(source === "loadData") return;
        const updatedCSV = hot.getData().map(r => r.join(",")).join("\n");
        props.onChange(updatedCSV);
      });
    });

    return el;
  }
});
