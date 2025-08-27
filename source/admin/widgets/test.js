/*

onsole.log("✅ test-button.js loaded");

CMS.registerEditorComponent({
  id: "test-button-widget",
  label: "Test Button",
  fields: [],
  pattern: /^<test-button-widget>[\s\S]*<\/test-button-widget>$/ms,
  fromBlock: function(match) {
    return {};
  },
  toBlock: function(data) {
    return `<test-button-widget></test-button-widget>`;
  },
  toPreview: function(data) {
    return `<button onclick="alert('這是預覽')">預覽按鈕</button>`;
  },
  control: function(props) {
    // 創建容器
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "5px";

    // 創建按鈕
    const btn = document.createElement("button");
    btn.textContent = "點我 alert";
    btn.addEventListener("click", () => {
      alert("你點了按鈕！");
    });

    container.appendChild(btn);
    return container;
  }
});

*/


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

    // 工具列：上傳 & 下載按鈕
    const toolbar = document.createElement("div");
    toolbar.style.display = "flex";
    toolbar.style.gap = "5px";
    toolbar.style.marginBottom = "5px";

    // 上傳按鈕
    const uploadBtn = document.createElement("button");
    uploadBtn.textContent = "上傳 CSV";
    toolbar.appendChild(uploadBtn);

    // 隱藏 input
    const hiddenFileInput = document.createElement("input");
    hiddenFileInput.type = "file";
    hiddenFileInput.accept = ".csv";
    hiddenFileInput.style.display = "none";
    uploadBtn.addEventListener("click", () => hiddenFileInput.click());
    hiddenFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const content = evt.target.result;
        props.onChange(content);
        textarea.value = content;
        table.replaceData(csvToTableData(content));
      };
      reader.readAsText(file);
    });

    // 下載按鈕
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "下載 CSV";
    toolbar.appendChild(downloadBtn);
    downloadBtn.addEventListener("click", () => {
      const csvContent = props.value || "";
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "table.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    // 編輯 Tabulator 區
    const editEl = document.createElement("div");
    editEl.style.flex = "1";
    editEl.style.marginTop = "5px";

    // textarea 區同步
    const textarea = document.createElement("textarea");
    textarea.style.width = "100%";
    textarea.style.height = "150px";
    textarea.value = props.value || "";

    textarea.addEventListener("input", () => {
      const content = textarea.value;
      props.onChange(content);
      table.replaceData(csvToTableData(content));
    });

    container.appendChild(toolbar);
    container.appendChild(editEl);
    container.appendChild(hiddenFileInput);
    container.appendChild(textarea);

    // 將 CSV 文字轉成 Tabulator data
    function csvToTableData(csv) {
      const rows = csv.split("\n").map(r => r.split(","));
      const headers = rows[0];
      const data = rows.slice(1).map(r => {
        const obj = {};
        headers.forEach((h,i)=> obj[h]=r[i]||"");
        return obj;
      });
      table.setColumns(headers.map(h => ({title:h, field:h, editor:"input"})));
      return data;
    }

    // 建立 Tabulator
    const initialData = csvToTableData(props.value || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male");
    const headers = (props.value || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male").split("\n")[0].split(",");

    const table = new Tabulator(editEl, {
      data: initialData,
      columns: headers.map(h => ({title:h, field:h, editor:"input"})),
      layout:"fitColumns",
      reactiveData:true,
      movableColumns:true,
      resizableRows:true,
      height:"100%",
      cellEdited:function(cell){
        const updatedData = table.getData();
        const csvLines = [
          headers.join(","),
          ...updatedData.map(row => headers.map(h=>row[h]).join(","))
        ];
        const updatedCSV = csvLines.join("\n");
        props.onChange(updatedCSV);
        textarea.value = updatedCSV;
      }
    });

    return container;
  }
});
