console.log("✅ csv-widget.js loaded");

CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [{ name: "csv", label: "CSV Content", widget: "text" }],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/ms,
  fromBlock: function (match) {
    const content = match && match[1] ? match[1].trim() : "";
    return { csv: content || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male" };
  },
  toBlock: function (data) {
    return `<csv-table>\n${
      data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male"
    }\n</csv-table>`;
  },
  toPreview: function (data) {
    const csvContent =
      data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const rows = csvContent.split("\n").map((r) => r.split(","));
    const htmlRows = rows.map((r, idx) => {
      if (idx === 0)
        return "<tr>" + r.map((c) => `<th>${c}</th>`).join("") + "</tr>";
      return "<tr>" + r.map((c) => `<td>${c}</td>`).join("") + "</tr>";
    });

    const buttonsHtml = `
      <button style="margin-right:5px; padding:5px 12px; border-radius:4px; cursor:pointer; margin-bottom:5px;">Download</button>
    `;

    return `${buttonsHtml}<br>
      <table border="1" style="border-collapse: collapse; width:100%; text-align:left; margin-top:5px;">
        ${htmlRows.join("\n")}
      </table>`;
  },
  control: function (props) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.width = "100%";

    // 工具列按鈕
    const toolbar = document.createElement("div");
    toolbar.style.marginBottom = "8px";

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download";
    downloadBtn.style.padding = "5px 12px";
    downloadBtn.style.borderRadius = "4px";
    downloadBtn.style.cursor = "pointer";

    toolbar.appendChild(downloadBtn);
    container.appendChild(toolbar);

    // 內容編輯區
    const textarea = document.createElement("textarea");
    textarea.style.flex = "1";
    textarea.style.width = "100%";
    textarea.style.height = "200px";
    textarea.value =
      props.value || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";

    textarea.addEventListener("input", () => {
      props.onChange(textarea.value);
    });

    container.appendChild(textarea);

    // 測試 Download
    downloadBtn.addEventListener("click", () => {
      const csvText = textarea.value;
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "table.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    return container;
  },
});
