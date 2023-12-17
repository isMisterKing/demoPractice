let compList = [
  {
    id: "comp_618bb1bclq7swkay",
    width: 300,
    height: 200,
    top: 400,
    left: 350,
  },
]
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
const defaultOption = {
  width: 300,
  height: 200,
  top: 100,
  left: 650,
}
let board = null
let selectCompList = []

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
const clickBody = () => {
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
  e.stopPropagation()
  const className = e.target.className
  if (className === 'hover-group') {
    selectComp(e)
  }
}

let mouseDownTarget = '' // 鼠标按下将要执行的操作 move:移动组件 resize:改变组件大小
let satartPosition = {} // 鼠标按下时的初始位置
let movePosition = {} // 鼠标按下后移动的位置

// 鼠标按下组件
const mousedownComp = e => {
  const className = e.target.className.split(' ')[0]
  if (className === 'hover-line' || className === 'hover-dot') {
    selectComp(e)
    satartPosition.x = e.x
    satartPosition.y = e.y
    mouseDownTarget = className === 'hover-line' ? 'move' : 'resize'
    document.addEventListener('mousemove', mouseMoveHandler)
  }
}
// 鼠标移动
const mouseMoveHandler = e => {
  movePosition.x = e.x - satartPosition.x
  movePosition.y = e.y - satartPosition.y
  let resultPositionMap = {}
  if (mouseDownTarget = 'move') {
    resultPositionMap = moveComp()
  } else {
    resultPositionMap = resizeComp()
  }
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', mouseMoveHandler)
    mouseDownTarget = ''
    satartPosition = {}
    movePosition = {}
    compList.forEach(comp => {
      if (resultPositionMap[comp.id]) {
        Object.keys(resultPositionMap[comp.id]).forEach(key => {
          comp[key] = resultPositionMap[comp.id][key]
        })
      }
    })
  })
}
// 移动组件位置
const moveComp = () => {
  const endCompMap = {}
  selectCompList.forEach(item => {
    const compId = item.id
    const startComp = compList.find(item => item.id === compId)
    const dom = document.querySelector(`#${compId}`)
    endCompMap[compId] = {
      top: startComp.top + movePosition.y,
      left: startComp.left + movePosition.x
    }
    dom.style.top = endCompMap[compId].top + 'px'
    dom.style.left = endCompMap[compId].left + 'px'
  })
  return endCompMap
}
// 改变组件大小
const resizeComp = () => {}

// 鼠标移入组件
const mouseenterComp = e => {
  const id = e.target.id
  const isExist = selectCompList.some(item => item.id === id)
  if (!isExist) {
    selectCompList.push({ id, isClick: false })
    e.target.firstElementChild.style.display = 'block'
  }
}
// 鼠标移出组件
const mouseleaveComp = e => {
  const id = e.target.id
  const isClick = selectCompList.find(item => item.id === id).isClick
  if (!isClick) {
    const index = selectCompList.findIndex(item => item.id === id)
    selectCompList.splice(index, 1)
    e.target.firstElementChild.style = ''
  }
}

// 清除已选中组件
const clearSelectComp = () => {
  selectCompList.forEach(item => {
    const dom = document.querySelector(`#${item.id}`)
    dom.firstElementChild.style = ''
  })
  selectCompList = []
}

// 选中组件
const selectComp = e => {
  const id = e.target.parentElement.id || e.target.parentElement.parentElement.id
  const isClick = selectCompList.some(item => item.id === id && item.isClick)
  if (!e.ctrlKey && !e.buttons && !isClick) { // 多选、鼠标按下、点击已选中项时，不清除其他已选中项
    clearSelectComp()
  }
  const isExist = selectCompList.some(item => item.id === id)
  if (!isExist) {
    selectCompList.push({ id, isClick: true})
    e.target.parentElement.firstElementChild.style.display = 'block'
  } else {
    selectCompList.find(item => item.id === id).isClick = true
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
  const compOption = JSON.parse(JSON.stringify(defaultOption))
  compOption.id = `comp_${randomIdAll()}`
  overlap(compOption)
  console.log(compOption.id, compOption);
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