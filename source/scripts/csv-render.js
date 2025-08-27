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

    // 建立可滾動容器
    const wrapper = document.createElement("div");
    wrapper.style.overflowX = "auto";  // 水平滾動
    wrapper.style.overflowY = "auto";  // 垂直滾動
    wrapper.style.maxHeight = "400px"; // 最大高度，可調整
    wrapper.style.marginBottom = "10px"; 
    wrapper.style.width = "100%";

    const table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.width = "max-content"; // 寬度依內容延伸
    table.style.minWidth = "100%";      // 至少撐滿容器
    table.style.textAlign = "left";
    table.innerHTML = htmlRows;

    // 限制 table 最大寬度 = 父元素寬度 * 1.5
    const parentWidth = el.parentElement ? el.parentElement.offsetWidth : 1000; // fallback
    const maxWidth = parentWidth * 1.8;
    table.style.maxWidth = maxWidth + "px";

    // debug log
    console.log("📐 parentWidth:", parentWidth, "→ table.maxWidth:", maxWidth);

    wrapper.appendChild(table);
    el.replaceWith(wrapper);
  });
});
