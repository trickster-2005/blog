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
    return htmlTable;
  },
  toPreview: function(data) {
    return CMS.widgets.get("csv-table").toBlock(data);
  },
  control: function(props) {
    const el = document.createElement("div");
    el.style.width = "100%";
    el.style.height = "400px";

    // CSV 轉 Array
    const csvData = props.value && props.value.trim()
      ? props.value.replace(/<[^>]+>/g,'')
      : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const rows = csvData.split("\n").map(r => r.split(","));
    const headers = rows[0];

    // Tabulator 的欄位設定
    const columns = headers.map(h => ({ title: h, field: h, editor: "input" }));

    // Tabulator 的資料
    const tableData = rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");
      return obj;
    });

    // 建立 Tabulator
    const table = new Tabulator(el, {
      data: tableData,
      columns: columns,
      layout: "fitColumns",
      reactiveData: true, // 自動更新 data
      movableColumns: true,
      resizableRows: true,
      height: "100%",
      cellEdited: function(cell) {
        // 更新 CSV
        const updatedData = table.getData();
        const csvLines = [
          headers.join(","),
          ...updatedData.map(row => headers.map(h => row[h]).join(","))
        ];
        props.onChange(csvLines.join("\n"));
      }
    });

    return el;
  }
});
