document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll("csv-table").forEach(el => {
    const csvContent = el.textContent.trim();
    const rows = csvContent.split("\n").map(r => r.split(","));
    const colHeaders = rows[0];
    const htmlRows = rows.map((r, idx) => {
      if(idx===0) return "<tr>" + colHeaders.map(c => `<th>${c}</th>`).join("") + "</tr>";
      while(r.length < colHeaders.length) r.push("");
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    }).join("\n");
    const table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.textAlign = "left";
    table.innerHTML = htmlRows;
    el.replaceWith(table);
  });
});