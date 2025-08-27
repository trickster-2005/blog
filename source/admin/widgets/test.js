console.log("✅ test-buttons.js loaded");

CMS.registerEditorComponent({
  id: "test-buttons",
  label: "Test Buttons",
  fields: [],
  fromBlock: function(match) { return {}; },
  toBlock: function(data) { return "<test-buttons></test-buttons>"; },
  toPreview: function(data) {
    return `<button>按鈕1 (Preview)</button>
            <button>按鈕2 (Preview)</button>`;
  },
  control: function(props) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.gap = "5px";

    const btn1 = document.createElement("button");
    btn1.textContent = "按鈕1";
    btn1.addEventListener("click", () => alert("你按了按鈕1"));

    const btn2 = document.createElement("button");
    btn2.textContent = "按鈕2";
    btn2.addEventListener("click", () => alert("你按了按鈕2"));

    container.appendChild(btn1);
    container.appendChild(btn2);

    return container;
  }
});
