console.log("✅ csv-widget-handsontable 基本版已載入！");

CMS.registerWidget("csv-widget", {
  init: function(opts) {
    // 建立容器
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "300px";

    // 將初始 CSV 轉成二維陣列
    function parseCSV(csv) {
      if (!csv) return [[]];
      return csv.split("\n").map(row => row.split(","));
    }

    // 將二維陣列轉回 CSV
    function toCSV(data) {
      return data.map(row => row.join(",")).join("\n");
    }

    // 建立 Handsontable
    const hot = new Handsontable(container, {
      data: parseCSV(opts.value),
      rowHeaders: true,
      colHeaders: true,
      width: "100%",
      height: "300",
      stretchH: "all",
      afterChange: function(changes, source) {
        if (source === 'loadData') return; // 避免初始化觸發
        opts.onChange(toCSV(hot.getData()));
      }
    });

    return container;
  },

  value: function(el) {
    // 從 Handsontable 取值
    const hotInstance = Handsontable.getInstance(el);
    return hotInstance ? hotInstance.getData().map(row => row.join(",")).join("\n") : "";
  },

  setValue: function(el, val) {
    const hotInstance = Handsontable.getInstance(el);
    if (hotInstance) {
      const data = val ? val.split("\n").map(row => row.split(",")) : [[]];
      hotInstance.loadData(data);
    }
  }
  
});