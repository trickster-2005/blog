CMS.registerEditorComponent({
  id: 'csv-iframe',
  label: 'CSV Table',
  fields: [
    { name: 'csvData', label: 'CSV JSON', widget: 'text' }
  ],
  pattern: /^```csv-iframe\n([\s\S]+?)\n```$/,
  fromBlock: function(match) {
    return { csvData: match[1] };
  },
  toBlock: function(data) {
    return '```csv-iframe\n' + data.csvData + '\n```';
  },
  toPreview: function(data) {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.height = '320px';

    const iframe = document.createElement('iframe');
    iframe.src = '/admin/widgets/csv-editor.html';
    container.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow.postMessage({ type: 'init-csv', data: data.csvData }, "*");
    };

    // 接收 iframe 回傳資料並同步到 CMS
    window.addEventListener('message', e => {
      if (e.data.type === 'csv-save') {
        const field = container.closest('.nc-widget');
        if (field) {
          const input = field.querySelector('textarea, input');
          if (input) input.value = e.data.data;
        }
      }
    });

    return container;
  }
});
