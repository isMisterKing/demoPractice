const tabSize = 20;
const DEFAULT_PROJECT_DOM = `
    <div class="file-title"></div>
    <div class="file-group"></div>
  `
const projectData = [
  {
    projectName: 'test-file1',
    children: [
      {
        fileName: '文件0',
        level: '1',
        type: 'folder',
        children: [
          {
            fileName: '文件1',
            level: '1-1',
            type: 'folder',
            children: [
              {
                fileName: '文件2',
                level: '1-1-1',
                type: 'text'
              },
              {
                fileName: '文件3',
                level: '1-1-2',
                type: 'folder',
                children: [
                  {
                    fileName: '文件4',
                    level: '1-1-2-1',
                    type: 'text'
                  }
                ]
              },
            ]
          },
          {
            fileName: '文件4',
            level: '1-2',
            type: 'text'
          }
        ]
      },
      {
        fileName: '文件5',
        level: '2',
        type: 'text'
      },
      {
        fileName: '文件6',
        level: '3',
        type: 'folder',
        children: [
          {
            fileName: '文件7',
            level: '3-1',
            type: 'text'
          },
          {
            fileName: '文件8',
            level: '3-2',
            type: 'text'
          },
          {
            fileName: '文件9',
            level: '3-3',
            type: 'folder',
            children: [
              {
                fileName: '文件10',
                level: '3-3-1',
                type: 'text'
              },
            ]
          },
        ]
      },
    ]
  },
  {
    projectName: 'test-file2',
    children: [
      {
        fileName: '文件0',
        level: '1',
        type: 'folder',
        children: [
          {
            fileName: '文件1',
            level: '1-1',
            type: 'folder',
            children: [
              {
                fileName: '文件2',
                level: '1-1-1',
                type: 'text'
              },
              {
                fileName: '文件3',
                level: '1-1-2',
                type: 'folder',
                children: [
                  {
                    fileName: '文件4',
                    level: '1-1-2-1',
                    type: 'text'
                  }
                ]
              },
            ]
          },
          {
            fileName: '文件4',
            level: '1-2',
            type: 'text'
          }
        ]
      },
      {
        fileName: '文件5',
        level: '2',
        type: 'text'
      },
      {
        fileName: '文件6',
        level: '3',
        type: 'folder',
        children: [
          {
            fileName: '文件7',
            level: '3-1',
            type: 'text'
          },
          {
            fileName: '文件8',
            level: '3-2',
            type: 'text'
          },
          {
            fileName: '文件9',
            level: '3-3',
            type: 'folder',
            children: [
              {
                fileName: '文件10',
                level: '3-3-1',
                type: 'text'
              },
            ]
          },
        ]
      },
    ]
  },
];
let projectMap = {};
let lastClickFile = {
  name: '', 
  level: ''
};

// 点击项目文件列表
const clickProjectFile = e => {
  const currentFile = e.target;
  let fileProject = currentFile.parentNode;
  if (currentFile.className === 'file-title') { // 点击项目列表
    currentPorject = projectMap[currentFile.innerText];
    currentPorject.isSelect = !currentPorject.isSelect;
    
    const fileGroup = fileProject.lastElementChild;
    fileGroup.style.display = currentPorject.isSelect ? 'block' : 'none';
  } else { // 点击项目中文件列表
    let level = '';
    if (currentFile.className === 'file-list') {
      fileProject = fileProject.parentNode;
      level = currentFile.getAttribute('level');
    }
    if (currentFile.nodeName === 'SPAN') {
      fileProject = fileProject.parentNode.parentNode;
      level = currentFile.parentNode.getAttribute('level');
    }
    const projectName = fileProject.firstElementChild.innerText;
    lastClickFile.name = projectName;
    lastClickFile.level = level;
    createProjectTree();
  }
};

/**
 * 获取文件列表（递归）
 * @param {*} arr 单个项目下的文件夹列表
 * @param {*} level 需要更新的isSelect状态的文件夹的层级
 * @returns {Array}
 */
const getFileList = (arr, level) => {
  const resultList = []
  if (arr && arr.length) {
    arr.forEach(item => {
      const { children, ...other} = item;
      if (level && level === item.level) {
        item.isSelect = !item.isSelect;
      }
      resultList.push(other);
      if (children && children.length && item.isSelect) {
        resultList.push(...getFileList(children, level));
      }
    })
  }
  return resultList;
};

// 设置文件的tab缩进
const setFileListTabSize = (fileListDom, level) => {
  const tabLevel = level.split('-').length;
  for (let i = 1; i < tabLevel; i++) {
    const newDom = document.createElement('div');
    newDom.classList.add('tab-line');
    newDom.style.left = `${i * tabSize + 2}px`;
    fileListDom.appendChild(newDom);
  }
  fileListDom.firstElementChild.style.left = `${tabLevel * tabSize}px`
}

// 渲染文件树dom
const createProjectTree = () => {
  const fileTree = document.querySelector('.file-tree');
  fileTree.innerHTML = '';
  Object.values(projectMap).forEach(pro => {
    const { projectName, isSelect, children } = pro;
    // 先渲染项目对应的dom节点
    const projectDom = document.createElement('div');
    projectDom.setAttribute('id', `project_${projectName}`);
    projectDom.classList.add('file-project');
    projectDom.innerHTML = DEFAULT_PROJECT_DOM;
    projectDom.firstElementChild.innerText = projectName;
    projectDom.addEventListener('click', clickProjectFile);
    projectDom.addEventListener('selectstart', e => {
      e.preventDefault();
    })

    const fileGroupDom = projectDom.querySelector('.file-group');
    fileGroupDom.style.display = isSelect ? 'block' : 'none'; // 设置项目下的子节点是否显示或隐藏

    // 获取项目下子节点的列表（将层级数据进行拉平，如果父级文件夹的isSelect是false，则在拉平数据时该父级下的children就不会生成）
    let fileList = [];
    if (lastClickFile.name && lastClickFile.name === projectName) { // 更新最后一次点击的文件夹的isSelect的状态
      fileList = getFileList(children, lastClickFile.level);
    } else {
      fileList = getFileList(children);
    }
    // 渲染项目下的子节点，fileList是经过拉平的数据
    fileList.forEach(list => {
      const { fileName, level } = list;
      const fileListDom = document.createElement('div');
      fileListDom.classList.add('file-list');
      fileListDom.setAttribute('level', level);
      fileListDom.innerHTML = `<span>${fileName}</span>`;
      setFileListTabSize(fileListDom, level);

      fileGroupDom.appendChild(fileListDom);
    })
    fileTree.appendChild(projectDom);
  })
}

// 文件排序（将文件夹置于其他文件的前面）
const fileListSort = arr => {
  const folder = [];
  const other = [];
  arr.forEach(item => {
    let { type, children } = item;
    item.isSelect = false;
    if (children) {
      children = fileListSort(children);
    }
    if (type === 'folder') {
      folder.push(item);
    } else {
      other.push(item);
    }
  })
  return [...folder, ...other];
};

// 初始化项目文件数据
const initProjectData = arr => {
  const obj = {};
  arr.forEach(pro => {
    const { projectName, children } = pro;
    if (!obj[projectName]) {
      obj[projectName] = {
        projectName,
        isSelect: false,
        children: fileListSort(children)
      }
    }
  })
  return obj;
}


window.onload = () => {
  projectMap = initProjectData(projectData)
  createProjectTree();
}