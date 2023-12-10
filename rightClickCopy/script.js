const TABLE_DATA = [
  {
    date: '2016-05-02',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1518 弄'
  }, {
    date: '2016-05-04',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1517 弄'
  }, {
    date: '2016-05-01',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1519 弄'
  }, {
    date: '2016-05-03',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1516 弄'
  }
];

let tableWrapper = null
let tips = null
let bodyWrapper = null

// 渲染表头
function initTableHead(column) {
  const headDom = document.createElement('tr')
  column.forEach(item => {
    const th = document.createElement('th')
    th.innerHTML = item
    headDom.appendChild(th)
  })
  tableWrapper.appendChild(headDom)
}

// 渲染表格
function initTable(tableData) {
  tableWrapper = document.querySelector('#tableWrapper');
  tableWrapper.setAttribute('cellspacing', '0')
  tableData.forEach((row, index) => {
    if (!index) {
      initTableHead(Object.keys(row))
    }
    const rowDom = document.createElement('tr')
    Object.keys(row).forEach((key) => {
      const td = document.createElement('td')
      td.innerHTML = row[key]
      rowDom.appendChild(td)
    })
    tableWrapper.appendChild(rowDom)
  })
}

// 移除tips
function removeTips() {
  if (tips) {
    bodyWrapper.removeChild(tips)
    tips = null
  }
}

// copy
function copyText(text) {
  navigator.clipboard.writeText(text);
}

// 给tips绑定事件
function addEventTips(clickCellText) {
  tips.addEventListener('contextmenu', e => e.preventDefault())
  tips.addEventListener('selectstart', e => e.preventDefault())
  tips.addEventListener('click', () => {
    copyText(clickCellText)
  })
}

// 绑定事件
function addEventAll() {
  // 禁用默认事件
  tableWrapper.addEventListener('contextmenu', e => e.preventDefault())
  tableWrapper.addEventListener('selectstart', e => e.preventDefault())

  // 鼠标右击事件
  tableWrapper.addEventListener('mousedown', e => {
    if (e.button === 2 && e.target.nodeName === 'TD') {
      // 移除旧的tips
      removeTips()
      // 创建新的tips
      tips = document.createElement('div')
      tips.setAttribute('id', 'tableContextMenu')
      tips.innerText = '复制'
      bodyWrapper.insertBefore(tips, tableWrapper)
      const { x, y } = e
      tips.style.top = y + 'px'
      tips.style.left = x + 'px'
      // 绑定tips事件
      addEventTips(e.target.innerText)
    }
  })
  // 鼠标点击事件
  document.addEventListener('click', e => {
    removeTips()
  })
}

window.onload = () => {
  bodyWrapper = document.querySelector('body')
  initTable(TABLE_DATA)
  addEventAll()
}