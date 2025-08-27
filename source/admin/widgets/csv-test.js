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

    const buttonsHtml = `
      <button style="margin-right:5px; padding:5px 12px; border-radius:4px; cursor:pointer;" onclick="alert('Upload button clicked')">Upload</button>
      <button style="padding:5px 12px; border-radius:4px; cursor:pointer;" onclick="alert('Download button clicked')">Download</button>
    `;

    return `${buttonsHtml}<br><br>
      <table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
        ${htmlRows.join("\n")}
      </table>`;
  },
  control: function(props) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.width = "100%";

    // 工具列按鈕
    const toolbar = document.createElement("div");
    toolbar.style.marginBottom = "8px";

    const uploadBtn = document.createElement("button");
    uploadBtn.textContent = "Upload";
    uploadBtn.style.marginRight = "5px";
    uploadBtn.style.padding = "5px 12px";
    uploadBtn.style.borderRadius = "4px";
    uploadBtn.style.cursor = "pointer";

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download";
    downloadBtn.style.padding = "5px 12px";
    downloadBtn.style.borderRadius = "4px";
    downloadBtn.style.cursor = "pointer";

    toolbar.appendChild(uploadBtn);
    toolbar.appendChild(downloadBtn);
    container.appendChild(toolbar);

    // 內容編輯區
    const textarea = document.createElement("textarea");
    textarea.style.flex = "1";
    textarea.style.width = "100%";
    textarea.style.height = "200px";
    textarea.value = props.value || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";

    textarea.addEventListener("input", () => {
      props.onChange(textarea.value);
    });

    container.appendChild(textarea);

    // 上傳功能
    uploadBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv";
      input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
          const text = evt.target.result.trim();
          const lines = text.split("\n").map(l => l.split(","));
          const colCount = lines[0].length;

          // 驗證每列欄位數
          const valid = lines.every(l => l.length === colCount);
          if(!valid) {
            alert("CSV 格式錯誤：欄位數不一致");
            return;
          }

          textarea.value = text;
          props.onChange(text);
        };
        reader.readAsText(file);
      });
      input.click();
    });

    // 測試 Download
    downloadBtn.addEventListener("click", () => alert("Download button clicked"));

    return container;
  }
});
