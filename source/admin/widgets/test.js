// only button

console.log("✅ csv-test.js loaded");

CMS.registerEditorComponent({
  id: "csv-button-test",
  label: "CSV Button Test",
  fields: [],
  pattern: /^<csv-button-test>$/ms,
  fromBlock: function(match) {
    return {};
  },
  toBlock: function(data) {
    return `<csv-button-test></csv-button-test>`;
  },
  toPreview: function(data) {
    return `<div>CSV Button Preview</div>`;
  },
  control: function(props) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.margin = "10px 0";

    // ====== 按鈕 ======
    const button = document.createElement("button");
    button.textContent = "點我測試";
    button.style.padding = "5px 10px";
    button.addEventListener("click", () => {
      alert("按鈕互動成功！");
    });

    container.appendChild(button);

    return container;
  }
});
