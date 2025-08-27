console.log("✅ test-button.js loaded");

CMS.registerEditorComponent({
  id: "test-button-widget",
  label: "Test Button",
  fields: [],
  pattern: /^<test-button-widget>[\s\S]*<\/test-button-widget>$/ms,
  fromBlock: function(match) {
    return {};
  },
  toBlock: function(data) {
    return `<test-button-widget></test-button-widget>`;
  },
  toPreview: function(data) {
    return `<button onclick="alert('這是預覽')">預覽按鈕</button>`;
  },
  control: function(props) {
    // 創建容器
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "5px";

    // 創建按鈕
    const btn = document.createElement("button");
    btn.textContent = "點我 alert";
    btn.addEventListener("click", () => {
      alert("你點了按鈕！");
    });

    container.appendChild(btn);
    return container;
  }
});