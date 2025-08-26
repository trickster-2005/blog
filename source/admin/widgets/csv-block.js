console.log("✅ csv-block.js loaded");

// 定義 CSV Widget
class CSVWidget {
  constructor({ el, value, onChange }) {
    this.el = el;
    this.value = value || "Name,Age,Gender\nAlice,23,Female\nBob,30,Male";
    this.onChange = onChange;

    // 建立 Handsontable 容器
    this.container = document.createElement("div");
    this.container.style.width = "100%";
    this.container.style.height = "300px"; // 可自訂高度
    this.el.appendChild(this.container);

    this.initTable();
  }

  initTable() {
    const data = this.value.trim().split("\n").map(r => r.split(","));
    this.hot = new Handsontable(this.container, {
      data,
      rowHeaders: true,
      colHeaders: true,
      licenseKey: "non-commercial-and-evaluation",
      contextMenu: true,
      filters: true,
      columnSorting: true,
      stretchH: "all",
      afterChange: () => this.updateValue()
    });
  }

  updateValue() {
    const updatedCSV = this.hot.getData().map(r => r.join(",")).join("\n");
    if (this.onChange) this.onChange(updatedCSV);
  }

  // CMS widget API
  getValue() {
    return this.hot.getData().map(r => r.join(",")).join("\n");
  }

  setValue(value) {
    this.hot.loadData(value.trim().split("\n").map(r => r.split(",")));
  }
}

// 註冊 CMS Widget
CMS.registerWidget("csv-block", CSVWidget, {
  // 對應 Markdown field 的序列化
  toString: widgetValue => widgetValue || "",
  fromString: str => str || ""
});
