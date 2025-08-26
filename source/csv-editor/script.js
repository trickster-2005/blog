// ===== 工具 =====
function download(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== Handsontable 初始化 =====
const container = document.getElementById("hot");
const hot = new Handsontable(container, {
  data: [],
  colHeaders: true,
  rowHeaders: true,
  licenseKey: "non-commercial-and-evaluation",
  contextMenu: true,
  filters: true,
  columnSorting: true,
  stretchH: "all",
});

// ===== 匯入 CSV =====
const pasteDlg = document.getElementById("pasteDlg");
document.getElementById("pasteCsvBtn").addEventListener("click", () => pasteDlg.showModal());
document.getElementById("cancelDlg").addEventListener("click", () => pasteDlg.close());

document.getElementById("parsePasted").addEventListener("click", () => {
  const txt = document.getElementById("pasteArea").value || "";
  if (!txt.trim()) { pasteDlg.close(); return; }
  Papa.parse(txt, {
    header: true,
    skipEmptyLines: "greedy",
    complete: (res) => {
      hot.updateSettings({ data: res.data, colHeaders: res.meta.fields });
      pasteDlg.close();
    },
  });
});

// ===== 匯出 CSV =====
document.getElementById("exportCsv").addEventListener("click", () => {
  const data = hot.getSourceData();
  const headers = hot.getColHeader();
  const csv = Papa.unparse(data, { columns: headers });
  download("edited.csv", "\uFEFF" + csv, "text/csv;charset=utf-8");
});

// ===== 深色模式 =====
const darkBtn = document.getElementById("darkMode");
darkBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
