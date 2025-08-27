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
    return `<csv-table>\n${data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male"}\n</csv-table>`;
  },
  toPreview: function (data) {
    const csvContent = data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    const rows = csvContent.split("\n").map(r => r.split(","));
    const htmlRows = rows.map((r, idx) => {
      if (idx === 0) return "<tr>" + r.map(c => `<th>${c}</th>`).join("") + "</tr>";
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    });
    return `<table border="1" style="border-collapse: collapse; width:100%; text-align:left; margin-top:5px;">
      ${htmlRows.join("\n")}
    </table>`;
  },
  control: function (props) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.width = "100%";

    // 內容編輯區
    const textarea = document.createElement("textarea");
    textarea.style.flex = "1";
    textarea.style.width = "100%";
    textarea.style.height = "200px";
    textarea.value = props.value || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";

    textarea.addEventListener("input", () => {
      const lines = textarea.value.trim().split("\n").map(l => l.split(","));
      const colCount = lines[0].length;
      const valid = lines.every(l => l.length === colCount);
      if (!valid) {
        alert("CSV 格式錯誤：欄位數不一致");
      } else {
        props.onChange(textarea.value);
      }
    });

    container.appendChild(textarea);

    return container;
  }
});
