console.log("✅ csv-block-no-react.js 已載入！");

CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [{ name: "csv", label: "CSV 內容", widget: "string" }], // 用 string 存 CSV
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: match => ({ csv: match[1] }),
  toBlock: obj => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: obj => {
    if (!obj.csv) return "<em>(空表格)</em>";
    const containerId = "csv-preview-" + Math.random().toString(36).substr(2, 9);
    setTimeout(() => initTable(containerId, obj.csv), 0); // 等 DOM 渲染再初始化 Handsontable
    return `<div id="${containerId}" style="height: 300px;"></div>`;
  }
});

function initTable(containerId, csvText) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const data = csvText.trim() ? csvText.trim().split("\n").map(r => r.split(",")) : [[]];

  new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: true,
    licenseKey: "non-commercial-and-evaluation",
    contextMenu: true,
    filters: true,
    columnSorting: true,
    stretchH: "all"
  });
}