console.log("✅ csv-widget.js loaded");

CMS.registerEditorComponent({
  id: "csv-table",
  label: "CSV Table",
  fields: [{ name: "csv", label: "CSV Content", widget: "text" }],
  pattern: /^<csv-table>([\s\S]*?)<\/csv-table>$/ms,
  fromBlock: function(match) {
    const content = match && match[1] ? match[1].trim() : "";
    return { csv: content || "Name,Age,Note\nAlice,23,\"Likes apples, bananas\"\nBob,30,\"Enjoys running, swimming\"" };
  },
  toBlock: function(data) {
    return `<csv-table>\n${data.csv || "Name,Age,Note\nAlice,23,\"Likes apples, bananas\"\nBob,30,\"Enjoys running, swimming\""}\n</csv-table>`;
  },
  toPreview: function(data) {
    const csvContent = data.csv || "Name,Age,Note\nAlice,23,\"Likes apples, bananas\"\nBob,30,\"Enjoys running, swimming\"";

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

    const rows = parseCSV(csvContent);
    const htmlRows = rows.map((r, idx) => {
      if (idx === 0) return "<tr>" + r.map(c => `<th>${c}</th>`).join("") + "</tr>";
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    });

    // 包一個可水平滑動容器
    return `<div style="overflow-x:auto; width:100%; margin-top:5px;">
      <table border="1" style="border-collapse: collapse; width:100%; text-align:left;">
        ${htmlRows.join("\n")}
      </table>
    </div>`;
  },
  control: function(props) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.width = "100%";

    // 編輯區使用 textarea 直接修改 CSV 文字
    const textarea = document.createElement("textarea");
    textarea.style.flex = "1";
    textarea.style.width = "100%";
    textarea.style.height = "200px";
    textarea.value = props.value || "Name,Age,Note\nAlice,23,\"Likes apples, bananas\"\nBob,30,\"Enjoys running, swimming\"";

    // 文字變動時直接更新
    textarea.addEventListener("input", () => {
      props.onChange(textarea.value);
    });

    container.appendChild(textarea);
    return container;
  }
});
