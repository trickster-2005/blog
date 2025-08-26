// 確保 CMS 已經載入
(function() {
  if (typeof CMS === 'undefined') {
    console.error('Decap CMS not loaded');
    return;
  }

  CMS.registerEditorComponent({
    id: "alert-box",
    label: "Alert Box",
    fields: [
      { name: 'title', label: 'Title', widget: 'string' },
      { name: 'content', label: 'Content', widget: 'markdown' }
    ],
    pattern: /^:::alert\s+(.*?)\s+(.*?):::/ms,
    fromBlock: function(match) {
      return {
        title: match[1],
        content: match[2]
      };
    },
    toBlock: function(data) {
      return `:::alert
${data.title}
${data.content}
:::`;
    },
    toPreview: function(data) {
      return CMS.h('div', {style: {border: '1px solid red', padding: '8px'}},
        CMS.h('strong', {}, data.title),
        CMS.h('p', {}, data.content)
      );
    }
  });
})();
