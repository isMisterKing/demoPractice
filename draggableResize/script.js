const DEFAULT_COMP_CONTENT = `
  <div class="hover-group">
    <div class="hover-line top"></div>
    <div class="hover-line right"></div>
    <div class="hover-line bottom"></div>
    <div class="hover-line left"></div>
    <div class="hover-dot left-top"></div>
    <div class="hover-dot top"></div>
    <div class="hover-dot right-top"></div>
    <div class="hover-dot right"></div>
    <div class="hover-dot right-bottom"></div>
    <div class="hover-dot bottom"></div>
    <div class="hover-dot left-bottom"></div>
    <div class="hover-dot left"></div>
  </div>
  <div class="default-component"></div>
`
const DEFAULT_OPTION = {
  width: 300,
  height: 200,
  top: 100,
  left: 650,
}
const MIN_SIZE = 30

let compList = []
let board = null
let selectCompList = []
let isTriggerMouseup = false

// 生成随机ID
const randomIdAll = () => {
  const randomId = () => {
    let array = new Uint32Array(1)
    let cryptoObj = window.crypto || window.msCrypto
    return cryptoObj.getRandomValues(array)[0]
  }
  const randomIdByTime = () => {
    const timestamp = new Date().getTime()
    return timestamp.toString(36)
  }
  return (randomId() | 0).toString(16).substring(1) + randomIdByTime()
}

// 绑定事件
const addEvent = () => {
  document.addEventListener('click', clickBody)

  const menuDom = document.querySelector('#menu')
  menuDom.addEventListener('click', clickMenu)
}

// 点击body
const clickBody = e => {
  if (isTriggerMouseup) {
    return
  }
  clearSelectComp()
}

// 点击菜单
const clickMenu = e => {
  switch (e.target.className.split(' ')[1]) {
    case 'add':
      addComp()
      break;
    case 'save':
      saveComp()
      break;
    default:
      break
  }
}

// 点击组件
const clickComp = e => {
  if (isTriggerMouseup) {
    return
  }
  e.stopPropagation()
  const className = e.target.className
  if (className === 'hover-group') {
    selectComp(e)
  }
}

let mouseDownTarget = '' // 鼠标按下将要执行的操作 move:移动组件 resize:改变组件大小
let satartPosition = {} // 鼠标按下时的初始位置
let movePosition = {} // 鼠标按下后移动的位置
let mouseDownCompId = '' // 当前鼠标按下的组件id
let resultPositionMap = {}

// 鼠标按下组件
const mousedownComp = e => {
  const className = e.target.className.split(' ')[0]
  if (className === 'hover-line' || className === 'hover-dot') {
    satartPosition.x = e.x
    satartPosition.y = e.y
    if (className === 'hover-line') {
      mouseDownTarget = 'move'
    } else {
      mouseDownTarget = 'resize-' + e.target.className.split(' ')[1]
    }
    mouseDownCompId = e.target.parentElement.parentElement.id
    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mouseup', mouseUpHandler)
  }
}
// 鼠标移动
const mouseMoveHandler = e => {
  movePosition.x = e.x - satartPosition.x
  movePosition.y = e.y - satartPosition.y
  if (mouseDownTarget === 'move') {
    moveComp()
  } else {
    resizeComp()
  }
}
// 鼠标抬起
const mouseUpHandler = e => {
  // 移除事件监听及清空鼠标按下时存储的配置项
  document.removeEventListener('mousemove', mouseMoveHandler)
  document.removeEventListener('mouseup', mouseUpHandler)
  mouseDownTarget = ''
  satartPosition = {}
  movePosition = {}

  // 将鼠标移动后的组件信息存储到compList中
  compList.forEach(comp => {
    if (resultPositionMap[comp.id]) {
      Object.keys(resultPositionMap[comp.id]).forEach(key => {
        comp[key] = resultPositionMap[comp.id][key]
      })
    }
  })
  resultPositionMap = {}

  // 鼠标抬起时，如果鼠标位置在组件之外并且组件未被选中，则清除组件的悬浮样式
  const className = e.target.className
  const isCurrentComp = className === 'hover-group' || className.includes('hover-line') || className.includes('hover-dot')
  const isExist = selectCompList.includes(mouseDownCompId)
  if (!isCurrentComp && !isExist) {
    const dom = document.querySelector(`#${mouseDownCompId}`)
    if (dom) {
      dom.firstElementChild.style = ''
    }
  }
  mouseDownCompId = ''

  // 解决mouseup事件后会立即执行click的问题
  isTriggerMouseup = true
  setTimeout(() => {
    isTriggerMouseup = false 
  }, 100);
}
// 移动组件位置
const moveComp = () => {
  const moveCompHandler = compId => {
    const startComp = compList.find(item => item.id === compId)

    // 更新样式(组件位置)
    const dom = document.querySelector(`#${compId}`)
    dom.style.top = startComp.top + movePosition.y + 'px'
    dom.style.left = startComp.left + movePosition.x + 'px'

    // 将更新后的值存储起来
    resultPositionMap[compId] = {
      top: startComp.top + movePosition.y,
      left: startComp.left + movePosition.x
    }
  }
  const isExist = selectCompList.includes(mouseDownCompId)
  if (isExist) { // 如果当前组件处于选中状态，则移动所有被选中的组件
    selectCompList.forEach(compId => {
      moveCompHandler(compId)
    })
  } else {
    moveCompHandler(mouseDownCompId)
  }
}
// 改变组件大小
const resizeComp = () => {
  // 组件初始宽高和位置
  const startComp = compList.find(item => item.id === mouseDownCompId)
  const { top, left, width, height } = startComp
  const bottom = top + height
  const right = left + width

  const resultPosition = {}

  // 实现等比缩放效果：宽高分别计算各自的缩放比，然后统一使用最大的那个缩放比进行计算
  let scaleX = 1
  let scaleY = 1

  switch (mouseDownTarget) {
    case 'resize-left-top':
      const leftTopMap = {
        left: left + movePosition.x,
        top: top + movePosition.y,
        width: width - movePosition.x,
        height: height - movePosition.y
      }
      scaleX = leftTopMap.width / width
      scaleY = leftTopMap.height / height
      resultPosition.width = width * Math.max(scaleX, scaleY)
      resultPosition.height = height * Math.max(scaleX, scaleY)
      if (resultPosition.width <= MIN_SIZE) {
        resultPosition.width = MIN_SIZE
        resultPosition.height = height * (MIN_SIZE / width)
      }
      if (resultPosition.height <= MIN_SIZE) {
        resultPosition.height = MIN_SIZE
        resultPosition.width = width * (MIN_SIZE / height)
      }
      resultPosition.top = bottom - resultPosition.height
      resultPosition.left = right - resultPosition.width
      break
    case 'resize-top':
      resultPosition.height = height - movePosition.y
      if (resultPosition.height <= MIN_SIZE) {
        resultPosition.height = MIN_SIZE
      }
      resultPosition.top = bottom - resultPosition.height
      break
    case 'resize-right-top':
      const rightTopMap = {
        right: right + movePosition.x,
        top: top + movePosition.y,
        width: width + movePosition.x,
        height: height - movePosition.y
      }
      scaleX = rightTopMap.width / width
      scaleY = rightTopMap.height / height
      resultPosition.width = width * Math.max(scaleX, scaleY)
      resultPosition.height = height * Math.max(scaleX, scaleY)
      if (resultPosition.width <= MIN_SIZE) {
        resultPosition.width = MIN_SIZE
        resultPosition.height = height * (MIN_SIZE / width)
      }
      if (resultPosition.height <= MIN_SIZE) {
        resultPosition.width = width * (MIN_SIZE / height)
        resultPosition.height = MIN_SIZE
      }
      resultPosition.top = bottom - resultPosition.height
      break
    case 'resize-right':
      resultPosition.width = width + movePosition.x
      if (resultPosition.width <= MIN_SIZE) {
        resultPosition.width = MIN_SIZE
      }
      break
    case 'resize-right-bottom':
      const rightBottomMap = {
        right: right + movePosition.x,
        bottom: bottom + movePosition.y,
        width: width + movePosition.x,
        height: height + movePosition.y
      }
      scaleX = rightBottomMap.width / width
      scaleY = rightBottomMap.height / height
      resultPosition.width = width * Math.max(scaleX, scaleY)
      resultPosition.height = height * Math.max(scaleX, scaleY)
      if (resultPosition.width <= MIN_SIZE) {
        resultPosition.width = MIN_SIZE
        resultPosition.height = height * (MIN_SIZE / width)
      }
      if (resultPosition.height <= MIN_SIZE) {
        resultPosition.width = width * (MIN_SIZE / height)
        resultPosition.height = MIN_SIZE
      }
      break
    case 'resize-bottom':
      resultPosition.height = height + movePosition.y
      if (resultPosition.height <= MIN_SIZE) {
        resultPosition.height = MIN_SIZE
      }
      break
    case 'resize-left-bottom':
      const leftBottomMap = {
        right: right + movePosition.x,
        bottom: bottom + movePosition.y,
        width: width - movePosition.x,
        height: height + movePosition.y
      }
      scaleX = leftBottomMap.width / width
      scaleY = leftBottomMap.height / height
      resultPosition.width = width * Math.max(scaleX, scaleY)
      resultPosition.height = height * Math.max(scaleX, scaleY)
      if (resultPosition.width <= MIN_SIZE) {
        resultPosition.width = MIN_SIZE
        resultPosition.height = height * (MIN_SIZE / width)
      } 
      if (resultPosition.height <= MIN_SIZE) {
        resultPosition.width = width * (MIN_SIZE / height)
        resultPosition.height = MIN_SIZE
      }
      resultPosition.left = right - resultPosition.width
      break
    case 'resize-left':
      resultPosition.width = width - movePosition.x
      if (resultPosition.width <= MIN_SIZE) {
        resultPosition.width = MIN_SIZE
      }
      resultPosition.left = right - resultPosition.width
      break
    default:
      break
  }

  // 更新样式
  const dom = document.querySelector(`#${mouseDownCompId}`)
  Object.keys(resultPosition).forEach(key => {
    dom.style[key] = resultPosition[key] + 'px'
  })

  // 将更新后的值存储起来
  resultPositionMap[mouseDownCompId] = resultPosition
}

// 鼠标移入组件
const mouseenterComp = e => {
  const id = e.target.id
  const isExist = selectCompList.includes(id)
  // 当前组件未被选中且鼠标未处于mousedown，则显示悬浮样式
  if (!isExist && !e.buttons) {
    e.target.firstElementChild.style.display = 'block'
  }
}
// 鼠标移出组件
const mouseleaveComp = e => {
  const id = e.target.id
  const isExist = selectCompList.includes(id)
  // 当前组件未被选中且鼠标未处于mousedown，则清除悬浮样式
  if (!isExist && !e.buttons) {
    e.target.firstElementChild.style = ''
  }
}

// 清除已选中组件
const clearSelectComp = () => {
  selectCompList.forEach(id => {
    const dom = document.querySelector(`#${id}`)
    dom.classList.remove('select')
    dom.firstElementChild.style = ''
  })
  selectCompList = []
}

// 选中组件
const selectComp = e => {
  const id = e.target.parentElement.id
  const isExist = selectCompList.includes(id)
  if (!isExist) {
    if (!e.ctrlKey) { // 单选时需要清除其他已选中项
      clearSelectComp()
    }
    selectCompList.push(id)
    e.target.parentElement.classList.add('select')
    e.target.parentElement.firstElementChild.style.display = 'block'
  }
}

// 判断组件位置是否重叠
const overlap = compOption => {
  const isOverlpa = compList.some(opt => opt.top === compOption.top && opt.left === compOption.left)
  if (isOverlpa) {
    compOption.top = compOption.top + 10
    compOption.left = compOption.left + 10
    overlap(compOption)
  }
}

// 在html创建一个组件
const createComp = compOption => {
  const newComp = document.createElement('div')
  Object.keys(compOption).forEach(key => {
    if (key === 'id') {
      newComp.setAttribute('id', compOption.id)
    } else {
      newComp.style[key] = compOption[key] + 'px'
    }
  })
  newComp.classList.add('component-wrapper')
  newComp.innerHTML = DEFAULT_COMP_CONTENT
  newComp.addEventListener('click', clickComp)
  newComp.addEventListener('mouseenter', mouseenterComp)
  newComp.addEventListener('mouseleave', mouseleaveComp)
  newComp.addEventListener('mousedown', mousedownComp)
  board.appendChild(newComp)
}

// 新增组件
const addComp = () => {
  const compOption = JSON.parse(JSON.stringify(DEFAULT_OPTION))
  compOption.id = `comp_${randomIdAll()}`
  overlap(compOption)
  compList.push(compOption)

  createComp(compOption)
}

// 保存组件
const saveComp = () => {
  localStorage.setItem('compList', JSON.stringify(compList))
}

// 初始化看板历史组件
const initBoardComp = () => {
  const historyCompList = localStorage.getItem('compList')
  if (historyCompList) {
    compList = JSON.parse(historyCompList)
  }
  compList.forEach(compOption => {
    createComp(compOption)
  })
}

// mounted
window.onload = () => {
  board = document.querySelector('#board')
  addEvent()
  initBoardComp()
}