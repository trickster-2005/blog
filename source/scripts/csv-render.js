document.addEventListener("DOMContentLoaded", function() {
  // CSV 解析函式，支援雙引號包逗號
  function parseCSV(text) {
    const rows = [];
    const lines = text.split("\n");
    for (let line of lines) {
      const cells = [];
      let match;
      const regex = /"(.*?)"|([^,]+)/g; // 匹配引號內或普通欄位
      while ((match = regex.exec(line))) {
        cells.push(match[1] !== undefined ? match[1] : match[2]);
      }
      rows.push(cells);
    }
    return rows;
  }

  document.querySelectorAll("csv-table").forEach(el => {
    const csvContent = el.textContent.trim();
    const rows = parseCSV(csvContent);
    const htmlRows = rows.map((r, idx) => {
      if (idx === 0) return "<tr>" + r.map(c => `<th>${c}</th>`).join("") + "</tr>";
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    }).join("\n");

    const wrapper = document.createElement("div");
    wrapper.style.overflowX = "auto";   // 可水平滑動
    wrapper.style.width = "100%";
    wrapper.style.marginTop = "5px";

    const table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.textAlign = "left";
    table.innerHTML = htmlRows;

    wrapper.appendChild(table);
    el.replaceWith(wrapper);
  });
});