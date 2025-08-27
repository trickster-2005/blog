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
    // 發佈時存 CSV
    return `<csv-table>\n${data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male"}\n</csv-table>`;
  },
  toPreview: function(data) {
    // 後台預覽直接生成 HTML table
    const csvContent = data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const rows = csvContent.split("\n").map(r => r.split(","));
    const colHeaders = rows[0] || ["Name","Age","Gender"];
    const htmlRows = rows.map((r, idx) => {
      if(idx===0) return "<tr>" + colHeaders.map(c => `<th>${c}</th>`).join("") + "</tr>";
      while(r.length < colHeaders.length) r.push("");
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    });
    return `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
      ${htmlRows.join("\n")}
    </table>`;
  },
  control: function(props) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.width = "100%";
    container.style.height = "400px";

    // 左側 Tabulator 編輯
    const editEl = document.createElement("div");
    editEl.style.flex = "1";
    editEl.style.marginRight = "10px";

    // 右側 HTML 預覽
    const previewEl = document.createElement("div");
    previewEl.style.flex = "1";
    previewEl.style.overflow = "auto";
    previewEl.style.border = "1px solid #ccc";
    previewEl.style.padding = "5px";

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
        const updatedCSV = csvLines.join("\n");
        props.onChange(updatedCSV);

        // 同步更新右側 HTML 預覽
        const htmlRows = updatedCSV.split("\n").map((r, idx) => {
          const cols = r.split(",");
          if(idx===0) return "<tr>" + cols.map(c=>`<th>${c}</th>`).join("") + "</tr>";
          while(cols.length < headers.length) cols.push("");
          return "<tr>" + cols.map(c=>`<td>${c}</td>`).join("") + "</tr>";
        }).join("\n");
        previewEl.innerHTML = `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
          ${htmlRows}
        </table>`;
      }
    });

    // 初始化右側預覽
    const initialHTML = rows.map((r, idx) => {
      if(idx===0) return "<tr>" + r.map(c=>`<th>${c}</th>`).join("") + "</tr>";
      while(r.length < headers.length) r.push("");
      return "<tr>" + r.map(c=>`<td>${c}</td>`).join("") + "</tr>";
    }).join("\n");
    previewEl.innerHTML = `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
      ${initialHTML}
    </table>`;

    container.appendChild(editEl);
    container.appendChild(previewEl);
    return container;
  }
});
