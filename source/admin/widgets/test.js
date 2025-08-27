console.log("✅ csv-test-with-download.js loaded");

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
    // 發佈時存 CSV
    return `<csv-table>\n${data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male"}\n</csv-table>`;
  },
  toPreview: function(data) {
    const csvContent = data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const rows = csvContent.split("\n").map(r => r.split(","));
    const htmlRows = rows.map((r, idx) => {
      if(idx===0) return "<tr>" + r.map(c=>`<th>${c}</th>`).join("") + "</tr>";
      while(r.length < rows[0].length) r.push("");
      return "<tr>" + r.map(c=>`<td>${c}</td>`).join("") + "</tr>";
    }).join("\n");
    return `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
      ${htmlRows}
    </table>`;
  },
  control: function(props) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.height = "400px";

    // toolbar 放最上面
    const toolbar = document.createElement("div");
    toolbar.style.marginBottom = "5px";
    toolbar.style.display = "flex";
    toolbar.style.gap = "5px";

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "下載 CSV";
    downloadBtn.addEventListener("click", () => {
      const csvData = table.getData();
      const headers = table.getColumns().map(c => c.getField());
      const csvLines = [
        headers.join(","),
        ...csvData.map(row => headers.map(h => row[h]).join(","))
      ];
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
    toolbar.appendChild(downloadBtn);
    container.appendChild(toolbar);

    // Tabulator 編輯區
    const editEl = document.createElement("div");
    editEl.style.flex = "1";
    container.appendChild(editEl);

    const csvData = props.value && props.value.trim()
      ? props.value
      : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";

    const rows = csvData.split("\n").map(r => r.split(","));
    const headers = rows[0];
    const columns = headers.map(h => ({ title: h, field: h, editor: "input" }));
    const tableData = rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h,i)=> obj[h]=r[i]||"");
      return obj;
    });

    const table = new Tabulator(editEl, {
      data: tableData,
      columns: columns,
      layout: "fitColumns",
      reactiveData: true,
      movableColumns: true,
      resizableRows: true,
      height: "100%",
      cellEdited: function(cell) {
        const updatedData = table.getData();
        const csvLines = [
          headers.join(","),
          ...updatedData.map(row => headers.map(h => row[h]).join(","))
        ];
        props.onChange(csvLines.join("\n"));
      }
    });

    return container;
  }
});
