CMS.registerEditorComponent({
  id: "csvblock",
  label: "CSV 表格",
  fields: [
    { name: "csv", label: "CSV 內容", widget: "text" }
  ],
  pattern: /^```csv\n([\s\S]*?)\n```$/,
  fromBlock: match => ({ csv: match[1] }),
  toBlock: obj => "```csv\n" + (obj.csv || "") + "\n```",
  toPreview: obj => {
    if (!obj.csv) return "<em>(空表格)</em>";
    const rows = obj.csv.trim().split("\n").map(r => r.split(","));
    return `<table border="1">
      ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}
    </table>`;
  }
});

// ✅ 加一個按鈕，打開 /csv-editor/ 並帶資料
document.addEventListener("DOMContentLoaded", () => {
  const toolbar = document.querySelector(".nc-visual-editor-toolbar");
  if (toolbar) {
    const btn = document.createElement("button");
    btn.innerText = "用 CSV 編輯器開啟";
    btn.onclick = () => {
      const csvData = prompt("這裡理論上可以帶現有 CSV → 編輯器"); 
      window.open("/csv-editor/?data=" + encodeURIComponent(csvData));
    };
    toolbar.appendChild(btn);
  }
});