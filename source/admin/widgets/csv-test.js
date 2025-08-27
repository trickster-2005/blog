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
    container.style.flexDirection = "column";
    container.style.width = "100%";
    container.style.height = "400px";

    // ====== 工具列：上傳 / 下載 ======
    const toolbar = document.createElement("div");
    toolbar.style.marginBottom = "5px";

    // 上傳按鈕
    const uploadBtn = document.createElement("input");
    uploadBtn.type = "file";
    uploadBtn.accept = ".csv";
    uploadBtn.style.marginRight = "10px";
    toolbar.appendChild(uploadBtn);

    // 下載按鈕
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "下載 CSV";
    toolbar.appendChild(downloadBtn);

    container.appendChild(toolbar);

    // ====== 內容區：左右面板 ======
    const contentWrapper = document.createElement("div");
    contentWrapper.style.display = "flex";
    contentWrapper.style.flex = "1";

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

    contentWrapper.appendChild(editEl);
    contentWrapper.appendChild(previewEl);
    container.appendChild(contentWrapper);

    // ====== CSV 初始化 ======
    let csvData = props.value && props.value.trim()
      ? props.value
      : "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";

    let rows = csvData.split("\n").map(r => r.split(","));
    let headers = rows[0];
    let columns = headers.map(h => ({ title: h, field: h, editor: "input" }));
    let tableData = rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h,i)=> obj[h]=r[i]||"");
      return obj;
    });

    // ====== 建立 Tabulator ======
    const table = new Tabulator(editEl, {
      data: tableData,
      columns: columns,
      layout: "fitColumns",
      reactiveData: true,
      movableColumns: true,
      resizableRows: true,
      height: "100%",
      cellEdited: updateCSVAndPreview
    });

    // ====== 初始化右側預覽 ======
    updatePreview(csvData);

    // ====== 上傳功能 ======
    uploadBtn.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const text = evt.target.result.trim();
        rows = text.split("\n").map(r => r.split(","));
        headers = rows[0];
        columns = headers.map(h => ({ title: h, field: h, editor: "input" }));
        tableData = rows.slice(1).map(r => {
          const obj = {};
          headers.forEach((h,i)=>obj[h]=r[i]||"");
          return obj;
        });

        table.setColumns(columns);
        table.setData(tableData);
        props.onChange(text);
        updatePreview(text);
      };
      reader.readAsText(file);
    });

    // ====== 下載功能 ======
    downloadBtn.addEventListener("click", () => {
      const data = table.getData();
      const csvLines = [
        headers.join(","),
        ...data.map(row => headers.map(h => row[h]).join(","))
      ];
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "table.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    // ====== 工具函數 ======
    function updateCSVAndPreview() {
      const updatedData = table.getData();
      const csvLines = [
        headers.join(","),
        ...updatedData.map(row => headers.map(h => row[h]).join(","))
      ];
      const updatedCSV = csvLines.join("\n");
      props.onChange(updatedCSV);
      updatePreview(updatedCSV);
    }

    function updatePreview(csvText) {
      const previewRows = csvText.split("\n").map((r, idx) => {
        const cols = r.split(",");
        if(idx===0) return "<tr>" + cols.map(c=>`<th>${c}</th>`).join("") + "</tr>";
        while(cols.length < headers.length) cols.push("");
        return "<tr>" + cols.map(c=>`<td>${c}</td>`).join("") + "</tr>";
      }).join("\n");
      previewEl.innerHTML = `<table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
        ${previewRows}
      </table>`;
    }

    return container;
  }
});
