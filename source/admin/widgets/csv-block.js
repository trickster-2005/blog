console.log("✅ csv-widget-basic 已載入！");

// 註冊 Widget
CMS.registerWidget("csv-widget", {
  init: function(opts) {
    // 建立 textarea
    const textarea = document.createElement("textarea");
    textarea.style.width = "100%";
    textarea.style.height = "200px";
    textarea.value = opts.value || "";

    // 當 textarea 內容改變時更新 field 值
    textarea.addEventListener("input", function() {
      opts.onChange(textarea.value);
    });

    return textarea;
  },

  // 讀取值
  value: function(el) {
    return el.value;
  },

  // 設定值
  setValue: function(el, val) {
    el.value = val || "";
  }
});