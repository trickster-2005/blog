console.log("✅ csv-block.js loaded");

// 從 URL 取得 CSV 資料，若無則使用預設
function getCSVFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("csv") || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
}

function initHandsontable() {
  const container = document.getElementById("hot");
  const csvData = getCSVFromURL();
  const data = csvData.trim().split("\n").map(r => r.split(","));

  console.log("Initial CSV data:", data);

  const hot = new Handsontable(container, {
    data: data,
    rowHeaders: true,
    colHeaders: true,
    licenseKey: "non-commercial-and-evaluation",
    contextMenu: true,
    filters: true,
    columnSorting: true,
    stretchH: "all",
    afterChange: () => {
      const updatedCSV = hot.getData().map(r => r.join(",")).join("\n");
      console.log("Updated CSV:", updatedCSV);

      // 可選：傳回父頁面
      if (window.parent && window.parent.updateCSV) {
        window.parent.updateCSV(updatedCSV);
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", initHandsontable);
