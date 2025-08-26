// ===== csv-block.js =====
console.log("✅ csv-block.js 已載入！");

// --- Markdown 區塊元件 ---
CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "csv-editor" }],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: match => ({ csv: match[1] }),
  toBlock: obj => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: obj => {
    if (!obj.csv) return "<em>(空表格)</em>";
    const rows = obj.csv.trim().split("\n").map(r => r.split(","));
    return `
      <table border="1" style="border-collapse: collapse;">
        ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}
      </table>
    `;
  }
});

// --- Handsontable CSV 編輯器 ---
CMS.registerWidget("csv-editor", (opts) => {
  const container = document.createElement("div");
  container.style.height = "300px";
  container.style.overflow = "hidden";

  let hot = null; // 預先宣告

  function parseCSV(str) {
    if (!str) return [[]];
    return str.trim().split("\n").map(r => r.split(","));
  }

  // 初始化 Handsontable
  hot = new Handsontable(container, {
    data: parseCSV(opts.value || ""),
    rowHeaders: true,
    colHeaders: true,
    contextMenu: true,
    licenseKey: "non-commercial-and-evaluation",
    stretchH: "all",
    afterChange: () => {
      if (!hot) return; // 防止初始化階段呼叫
      const data = hot.getData();
      const csv = data.map(r => r.join(",")).join("\n");
      console.log("🔄 CSV 更新:", csv); // 控制台輸出
      opts.onChange(csv);
    }
  });

  return {
    render: (el) => {
      el.appendChild(container);
    },
    getValue: () => {
      if (!hot) return "";
      const data = hot.getData();
      return data.map(r => r.join(",")).join("\n");
    },
    setValue: (val) => {
      if (hot) hot.loadData(parseCSV(val || ""));
    }
  };
});
