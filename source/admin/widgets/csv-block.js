console.log("✅ csv-block-pure-js 已載入！");

// 1. 註冊 Markdown Block
CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "hidden" }],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: (match) => ({ csv: match[1] }),
  toBlock: (obj) => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: (obj) => {
    if (!obj.csv) return "<em>(空表格)</em>";
    const rows = obj.csv.trim().split("\n").map((r) => r.split(","));
    return `<table border="1" style="border-collapse: collapse;">
      ${rows
        .map(
          (r) =>
            `<tr>${r.map((c) => `<td style="padding:4px;">${c}</td>`).join("")}</tr>`
        )
        .join("")}
    </table>`;
  },
});

// 2. 註冊 Widget
CMS.registerWidget("csv-widget", {
  // widget init
  init: (opts) => {
    const container = document.createElement("div");
    container.style.height = "300px";
    container.style.border = "1px solid #ccc";

    // toolbar
    const toolbar = document.createElement("div");
    toolbar.style.marginBottom = "6px";

    const importBtn = document.createElement("button");
    importBtn.textContent = "匯入 CSV";
    importBtn.onclick = () => {
      const pasted = prompt("請貼上 CSV 內容：");
      if (!pasted) return;
      const parsed = Papa.parse(pasted, { skipEmptyLines: true });
      hot.loadData(parsed.data);
      updateValue();
    };

    const exportBtn = document.createElement("button");
    exportBtn.textContent = "匯出 CSV";
    exportBtn.style.marginLeft = "6px";
    exportBtn.onclick = () => {
      const data = hot.getData();
      const csv = Papa.unparse(data);
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "edited.csv";
      a.click();
      URL.revokeObjectURL(url);
    };

    toolbar.appendChild(importBtn);
    toolbar.appendChild(exportBtn);

    container.parentNode?.insertBefore(toolbar, container);

    // Handsontable 初始化
    const hot = new Handsontable(container, {
      data: opts.value ? opts.value.split("\n").map((r) => r.split(",")) : [[]],
      rowHeaders: true,
      colHeaders: true,
      licenseKey: "non-commercial-and-evaluation",
      contextMenu: true,
      filters: true,
      columnSorting: true,
      stretchH: "all",
      afterChange: updateValue,
    });

    function updateValue() {
      const data = hot.getData();
      const csv = data.map((r) => r.join(",")).join("\n");
      opts.onChange(csv);
    }

    return container;
  },

  // widget value getter
  value: (el) => el.__hot?.getData().map((r) => r.join(",")).join("\n") || "",

  // widget value setter
  setValue: (el, val) => {
    if (!el.__hot) return;
    el.__hot.loadData(val.split("\n").map((r) => r.split(",")));
  },
});
