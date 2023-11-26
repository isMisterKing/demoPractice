const listArray = [
  {
    value: '1',
    label: '一年级',
  },
  {
    value: '2',
    label: '二年级',
  },
  {
    value: '3',
    label: '三年级',
  },
  {
    value: '4',
    label: '四年级',
  },
  {
    value: '5',
    label: '五年级',
  },
  {
    value: '6',
    label: '六年级',
  },
]

const groupBox = document.querySelector('.group-box')
let currentMoveItem = null // 当前拖动的节点

// 初始化渲染元素
listArray.forEach(item => {
  const { value, label } = item
  const newNode = document.createElement('div')
  newNode.innerText = label
  newNode.classList.add('item-box')
  newNode.setAttribute('draggable', true)
  newNode.setAttribute('id', value)
  groupBox.appendChild(newNode)
})

// 监听拖动开始事件
groupBox.addEventListener('dragstart', e => {
  currentMoveItem = e.target
  setTimeout(() => {
    currentMoveItem.classList.add('is-draggable')
  }, 0);
})

// 监听拖动结束事件
groupBox.addEventListener('dragend', () => {
  currentMoveItem.classList.remove('is-draggable')
  const arr = [...groupBox.children].map(item => listArray.find(o => o.value === item.getAttribute('id')))
  console.log('resultArray:', arr);
})

// 监听拖动进入事件
groupBox.addEventListener('dragenter', e => {
  const currentItem = e.target
  if (currentItem !== currentMoveItem && currentItem !== groupBox) {
    const childrenList = [...groupBox.children]
    const currentMoveItemIndex = childrenList.indexOf(currentMoveItem)
    const currentItemIndex = childrenList.indexOf(currentItem)

    if (currentMoveItemIndex < currentItemIndex) {
      groupBox.insertBefore(currentMoveItem, currentItem.nextSibling)
    } else {
      groupBox.insertBefore(currentMoveItem, currentItem)
    }
  }
})


