// ===== csv-block.js =====
console.log("✅ csv-block.js 已載入！");

// 註冊一個自訂編輯器元件 (Markdown CSV 區塊)
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

// ===== csv-editor widget (Handsontable) =====
CMS.registerWidget("csv-editor", (opts) => {
  // 建立容器
  const container = document.createElement("div");
  container.style.height = "300px";
  container.style.overflow = "hidden";

  // 將 CSV 轉成二維陣列
  function parseCSV(str) {
    if (!str) return [[]];
    return str.trim().split("\n").map(r => r.split(","));
  }

  // 初始 Handsontable
  const hot = new Handsontable(container, {
    data: parseCSV(opts.value || ""),
    rowHeaders: true,
    colHeaders: true,
    contextMenu: true,
    licenseKey: "non-commercial-and-evaluation",
    stretchH: "all",
    afterChange: () => {
      const data = hot.getData();
      const csv = data.map(r => r.join(",")).join("\n");
      opts.onChange(csv);
    }
  });

  return {
    // 編輯器要 render 的元素
    render: (el) => {
      el.appendChild(container);
    },
    // 當 Decap CMS 要取得值
    getValue: () => {
      const data = hot.getData();
      return data.map(r => r.join(",")).join("\n");
    },
    // 當 Decap CMS 設定值 (例如從 markdown 載入)
    setValue: (val) => {
      hot.loadData(parseCSV(val || ""));
    }
  };
});
