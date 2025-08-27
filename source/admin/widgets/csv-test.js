console.log("✅ csv-widget.js loaded");

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
    return `<csv-table>\n${data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male"}\n</csv-table>`;
  },
  toPreview: function(data) {
    const csvContent = data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const rows = csvContent.split("\n").map(r => r.split(","));
    const htmlRows = rows.map((r, idx) => {
      if(idx===0) return "<tr>" + r.map(c => `<th>${c}</th>`).join("") + "</tr>";
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    });
    return `<table border="1" style="border-collapse: collapse; width:100%; text-align:left; margin-bottom:10px;">
      ${htmlRows.join("\n")}
    </table>`;
  },
  control: function(props) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.width = "100%";
    container.style.height = "400px";

    // ===== 工具列 =====
    const toolbar = document.createElement("div");
    toolbar.style.marginBottom = "5px";

    const uploadBtn = document.createElement("input");
    uploadBtn.type = "file";
    uploadBtn.accept = ".csv";
    uploadBtn.style.marginRight = "10px";
    uploadBtn.style.padding = "4px 8px";
    toolbar.appendChild(uploadBtn);

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "下載 CSV";
    downloadBtn.style.padding = "4px 8px";
    toolbar.appendChild(downloadBtn);

    container.appendChild(toolbar);

    // ===== 內容區 =====
    const contentWrapper = document.createElement("div");
    contentWrapper.style.display = "flex";
    contentWrapper.style.flex = "1";

    const editEl = document.createElement("div");
    editEl.style.flex = "1";
    editEl.style.marginRight = "10px";

    const previewEl = document.createElement("div");
    previewEl.style.flex = "1";
    previewEl.style.overflow = "auto";
    previewEl.style.border = "1px solid #ccc";
    previewEl.style.padding = "5px";

    contentWrapper.appendChild(editEl);
    contentWrapper.appendChild(previewEl);
    container.appendChild(contentWrapper);

    // ===== CSV 初始化 =====
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

    // ===== 建立 Tabulator =====
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

    updatePreview(csvData);

    // ===== 上傳功能 =====
    uploadBtn.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const text = evt.target.result.trim();
        const lines = text.split("\n").map(r => r.split(","));

        if(lines.length === 0 || lines[0].length === 0) {
          alert("CSV 格式錯誤：空檔案或無標題列");
          return;
        }

        const colCount = lines[0].length;
        if(!lines.every(l => l.length === colCount)) {
          alert("CSV 格式錯誤：欄位數不一致");
          return;
        }

        // 更新表格
        headers = lines[0];
        columns = headers.map(h => ({ title: h, field: h, editor: "input" }));
        tableData = lines.slice(1).map(r => {
          const obj = {};
          headers.forEach((h,i)=> obj[h]=r[i]||"");
          return obj;
        });

        table.setColumns(columns);
        table.setData(tableData);
        props.onChange(text);
        updatePreview(text);
      };
      reader.readAsText(file);
    });

    // ===== 下載功能 =====
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
      previewEl.innerHTML = `<table border="1" style="border-collapse: collapse; width:100%; text-align:left; margin-top:5px;">
        ${previewRows}
      </table>`;
    }

    return container;
  }
});
