/*
const input = document.querySelector('.input')

if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded

    var parent = this.parentNode,
        parentComputedStyle = window.getComputedStyle(parent, null),
        parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
        parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
        overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
        overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
        overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
        alignWithTop = overTop && !overBottom

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop)
    }
  }
}

function insertText(text) {
    const sel = document.getSelection()
    if (sel.rangeCount) {
        const range = sel.getRangeAt(0)
        range.deleteContents()
        const textNode = document.createTextNode(text)
        range.insertNode(textNode)
        const scrollElement = document.createElement('span')
        textNode.after(scrollElement)
        scrollElement.scrollIntoViewIfNeeded()
        scrollElement.remove()
        sel.collapseToEnd()
    }
}

input.addEventListener('paste', (e) => {
    if (!e.isTrusted) return
    e.preventDefault()
    const { types } = e.clipboardData
    if (types.includes('Files')) {
        console.log(e.clipboardData.files)
    } else if (types.includes('text/plain')) {
        insertText(e.clipboardData.getData('text/plain'))
    }
})

input.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        e.preventDefault()
	insertText('\n\n')
    }
})
*/

const isTouch = () => (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)

const hoverable = [
  '.sidebar-button',
  '.menu-item'
]

const MOUSE_LEFT = 1
const MOUSE_MIDDLE = 2
const MOUSE_RIGHT = 3

let icons = []; {
  let iconsArray = [{
      width: 16,
      height: 16,
      viewBox: '0 0 16 16',
      path: 'M 7 0 L 7 7 L 0 7 L 0 9 L 7 9 L 7 16 L 9 16 L 9 9 L 16 9 L 16 7 L 9 7 L 9 0 L 7 0 z'
    },
    {
      width: 24,
      height: 24,
      viewBox: '0 0 32 32',
      path: 'M 16,0 A 8.0828812,8.1323626 0 0 0 7.9171188,8.1323619 8.0828812,8.1323626 0 0 0 16,16.264725 8.0828812,8.1323626 0 0 0 24.082881,8.1323619 8.0828812,8.1323626 0 0 0 16,0 Z M 9.5352739,16.682991 A 16.49742,16.598413 0 0 0 -4.9999999e-8,27.497022 24.74613,16.598413 0 0 0 16.905114,32 24.74613,16.598413 0 0 0 32,28.540039 16.49742,16.598413 0 0 0 22.206874,16.696228 8.24871,8.2992065 0 0 1 15.873705,19.682329 8.24871,8.2992065 0 0 1 9.5352739,16.682991 Z'
    }
  ]

  for (let i = 0; i < iconsArray.length; i++) {
    let icon = iconsArray[i];
    let xmlns = 'http://www.w3.org/2000/svg'
    let element = document.createElementNS(xmlns, 'svg')
    element.setAttribute('xmlns', xmlns)
    element.setAttribute('width', icon.width)
    element.setAttribute('height', icon.height)
    element.setAttribute('viewBox', icon.viewBox)
    let path = document.createElementNS(xmlns, 'path')
    path.setAttribute('fill', 'currentColor')
    path.setAttribute('d', icon.path)
    element.appendChild(path)
    icons.push(element)
  }
}

const overlay = document.querySelector('.overlay')

let base

const sidebarPinned = document.querySelector('.sidebar-pinned')

fetch('./base.json').then(async (res) => {
  base = await res.json()
  for (let user of base) {
    sidebarPinned.children[0].appendChild(createUser(user))
  }
})


function createUser(user) {
  let sidebarButton = document.createElement('div'),
    sidebarIcon = document.createElement(`${user.profileImage ? 'img' : 'div'}`)

  sidebarButton.classList.add('sidebar-button')
  sidebarButton.setAttribute('aria-label', user.isHidden ? 'Hidden Profile' : user.nickname)
  sidebarButton.dataset.id = user.id
  sidebarIcon.classList.add('sidebar-icon')
  if (user.isHidden) {
    sidebarButton.setAttribute('hidden-user', '')
    sidebarIcon.appendChild(icons[1].cloneNode(true))
  } else if (sidebarIcon.tagName === 'IMG') {
    sidebarIcon.setAttribute('src', user.profileImage)
  } else {
    let nickname = user.nickname.split(' ')
    sidebarIcon.textContent = generateInitials(nickname)
  }
  sidebarButton.appendChild(sidebarIcon)
  attachListeners(sidebarButton)
  return sidebarButton
}

function generateInitials(string) {
  return (string.shift().charAt(0) + string.pop().charAt(0)).toUpperCase()
}

function attachListeners(element) {
  function focused() {
    if (!isTouch()) {
      if (element.classList.contains('sidebar-button')) {
        let scrollTop = 0,
          current = element
        while (current.parentElement) {
          scrollTop += current.scrollTop
          current = current.parentElement
        }
        tooltip.style.top = `${element.offsetTop + element.offsetHeight / 2 - scrollTop}px`
        tooltipContent.textContent = `${element.ariaLabel}`
        tooltip.dataset.right = ''
        tooltip.classList.toggle('visible', true)
      }
    }
    element.classList.toggle('hover', true)
  }

  element.addEventListener('mouseenter', focused)

  let blurred = () => {
    !isTouch() && tooltip.classList.toggle('visible', false)
    element.classList.toggle('hover', false)
  }

  element.addEventListener('mouseleave', blurred)

  element.addEventListener('mouseup', (event) => {
    if (event.which === MOUSE_LEFT) {
      if (this.prevElement) {
        if (this.prevElement !== element) {
          this.prevElement.classList.toggle('active', false)
          element.classList.toggle('active', true)
        }
      } else {
        element.classList.toggle('active', true)
      }
      this.prevElement = element
    }
  })

  if (!element.closest('.context-menu'))
    element.addEventListener('contextmenu', contextMenu.bind(element))
}

const appElement = document.querySelector('.app')

const contextMenuElement = document.querySelector('.context-menu')

function contextMenu(event) {
  overlay.classList.toggle('active', true)
  contextMenuElement.classList.toggle('visible', true)
  contextMenuElement.classList.toggle('top', false)
  contextMenuElement.classList.toggle('bottom', false)
  contextMenuElement.classList.toggle('left', false)
  contextMenuElement.classList.toggle('right', false)
  let top, left
  if (event.clientY + contextMenuElement.offsetHeight > innerHeight) {
    top = innerHeight - contextMenuElement.offsetHeight
    contextMenuElement.classList.toggle('bottom', true)
  } else {
    top = event.clientY
    contextMenuElement.classList.toggle('top', true)
  }
  if (event.clientX + contextMenuElement.offsetWidth > innerWidth) {
    left = innerWidth - contextMenuElement.offsetWidth
    contextMenuElement.classList.toggle('right', true)
  } else {
    left = event.clientX
    contextMenuElement.classList.toggle('left', true)
  }
  contextMenuElement.style.top = `${top}px`
  contextMenuElement.style.left = `${left}px`
}

const hoverableElements = [...document.querySelectorAll(hoverable.join(', '))]

const tooltip = document.querySelector('.tooltip')
const tooltipContent = tooltip.querySelector('.tooltip-content')

for (let element of hoverableElements) {
  attachListeners(element)
}

addEventListener('contextmenu', (event) => event.preventDefault())

addEventListener('mousedown', (event) => {
  if (!contextMenuElement.classList.contains('visible') || (event.which === 1 && event.target.closest('.context-menu'))) return
  contextMenuElement.classList.toggle('visible', false)
})

addEventListener('mouseup', () => {
  if (contextMenuElement.classList.contains('visible') || !overlay.classList.contains('active')) return
  overlay.classList.toggle('active', false)
})

contextMenuElement.addEventListener('click', (event) => {
  const menuItem = event.target.closest('.menu-item')
  if (!menuItem) return
  overlay.classList.toggle('active', false)
  contextMenuElement.classList.toggle('visible', false)
})
