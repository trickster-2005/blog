document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll("csv-table").forEach(el => {
    const csvContent = el.textContent.trim();

    // CSV 解析，支援雙引號包覆含逗號的欄位
    function parseCSV(text) {
      const rows = [];
      const lines = text.split("\n");
      for (let line of lines) {
        const row = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            row.push(current.trim().replace(/^"(.*)"$/,'$1'));
            current = "";
          } else {
            current += char;
          }
        }
        row.push(current.trim().replace(/^"(.*)"$/,'$1'));
        rows.push(row);
      }
      return rows;
    }

    const rows = parseCSV(csvContent);
    const colHeaders = rows[0];
    const htmlRows = rows.map((r, idx) => {
      if(idx === 0) return "<tr>" + colHeaders.map(c => `<th>${c}</th>`).join("") + "</tr>";
      while(r.length < colHeaders.length) r.push("");
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    }).join("\n");

    // 建立容器，限制寬度，允許換行
    const wrapper = document.createElement("div");
    wrapper.style.overflowX = "auto";  // 超出寬度時可水平滾動
    wrapper.style.maxWidth = "100%";   // 不超出父容器寬度
    wrapper.style.overflowY = "auto";  // 垂直滾動
    wrapper.style.maxHeight = "400px";
    wrapper.style.marginBottom = "10px";

    const table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";        // 填滿容器
    table.style.tableLayout = "fixed"; // 固定表格佈局
    table.style.textAlign = "left";
    table.style.wordWrap = "break-word"; // 單元格文字自動換行
    table.innerHTML = htmlRows;

    wrapper.appendChild(table);
    el.replaceWith(wrapper);
  });
});
