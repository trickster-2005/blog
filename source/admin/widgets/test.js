console.log("✅ csv-test-testbuttons.js loaded");

CMS.registerEditorComponent({
  id: "csv-test-buttons",
  label: "CSV Test Buttons",
  fields: [
    { name: "csv", label: "CSV Content", widget: "text" }
  ],
  pattern: /^<csv-test-buttons>([\s\S]*?)<\/csv-test-buttons>$/ms,
  fromBlock: function(match) {
    const content = match && match[1] ? match[1].trim() : "";
    return { csv: content || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male" };
  },
  toBlock: function(data) {
    return `<csv-test-buttons>\n${data.csv || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male"}\n</csv-test-buttons>`;
  },
  toPreview: function(data) {
    const rows = (data.csv || "").split("\n").map(r => r.split(","));
    const htmlRows = rows.map((r, idx) => {
      if (idx === 0) return "<tr>" + r.map(c => `<th>${c}</th>`).join("") + "</tr>";
      while (r.length < rows[0].length) r.push("");
      return "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
    });
    return `<table border="1" style="border-collapse: collapse; width:100%;">${htmlRows.join("")}</table>`;
  },
  control: function(props) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.width = "100%";
    container.style.height = "400px";

    // toolbar 容器
    const toolbar = document.createElement("div");
    toolbar.style.display = "flex";
    toolbar.style.gap = "5px";
    toolbar.style.marginBottom = "5px";

    // 上傳按鈕
    const uploadBtn = document.createElement("button");
    uploadBtn.textContent = "上傳 CSV";
    toolbar.appendChild(uploadBtn);

    // hidden file input
    const hiddenFileInput = document.createElement("input");
    hiddenFileInput.type = "file";
    hiddenFileInput.accept = ".csv";
    hiddenFileInput.style.display = "none";
    uploadBtn.addEventListener("click", () => hiddenFileInput.click());
    hiddenFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        props.onChange(evt.target.result);
      };
      reader.readAsText(file);
    });

    // 下載按鈕
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "下載 CSV";
    toolbar.appendChild(downloadBtn);
    downloadBtn.addEventListener("click", () => {
      const csvContent = props.value || "";
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "table.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    // 編輯 textarea
    const textarea = document.createElement("textarea");
    textarea.style.flex = "1";
    textarea.style.width = "100%";
    textarea.value = props.value || "";
    textarea.addEventListener("input", () => {
      props.onChange(textarea.value);
    });

    container.appendChild(toolbar);
    container.appendChild(hiddenFileInput);
    container.appendChild(textarea);
    return container;
  }
});