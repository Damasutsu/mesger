const isTouch = () => (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)

const hoverable = [
  '.sidebar-button',
  '.menu-item'
]

const MOUSE_LEFT = 1
const MOUSE_MIDDLE = 2
const MOUSE_RIGHT = 3

let icons = [];
{
  let iconsArray = [
  {
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
  }]

  for (let i = 0; i < iconsArray.length; i++)
  {
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

let base

const sidebarPinned = document.querySelector('.sidebar-pinned')

fetch('./base.json').then(async (res) =>
{
  base = await res.json()
  for (let user of base)
  {
    sidebarPinned.appendChild(createUser(user))
  }
})


function createUser(user)
{
  let sidebarButton = document.createElement('div'),
    sidebarIcon = document.createElement('div')

  sidebarButton.classList.add('sidebar-button')
  sidebarButton.setAttribute('aria-label', user.isHidden ? 'Hidden Profile' : user.nickname)
  sidebarButton.dataset.id = user.id
  sidebarIcon.classList.add('sidebar-icon')
  if (user.isHidden)
  {
    sidebarButton.setAttribute('hidden-user', '')
    sidebarIcon.appendChild(icons[1].cloneNode(true))
  }
  else
  {
    let nickname = user.nickname.split(' ')
    sidebarIcon.textContent = generateInitials(nickname)
  }
  sidebarButton.appendChild(sidebarIcon)
  attachListeners(sidebarButton)
  return sidebarButton
}

function generateInitials(string)
{
  return (string.shift().charAt(0) + string.pop().charAt(0)).toUpperCase()
}

function attachListeners(element)
{
  function focused(e)
  {
    if (isTouch())
    {
      element.focused = true
    }
    if (element.classList.contains('sidebar-button'))
    {
      tooltip.style.top = `${element.offsetTop + element.offsetHeight / 2 - element.parentElement.scrollTop}px`
      tooltipContent.textContent = `${element.ariaLabel}`
      tooltip.dataset.right = ''
      tooltip.classList.toggle('visible', true)
    }
    element.classList.toggle(e.type === 'mouseenter' ? 'hover' : 'focused', true)
  }

  element.addEventListener('mouseenter', focused)
  element.addEventListener('focus', focused)

  let blurred = (e) =>
  {
    element.focused = false
    tooltip.classList.toggle('visible', false)
    element.classList.toggle(e.type === 'mouseleave' ? 'hover' : 'focused', false)
  }

  element.addEventListener('mouseleave', blurred)
  element.addEventListener('blur', blurred)

  element.addEventListener('mouseup', (e) =>
  {
    if (e.which === MOUSE_LEFT)
    {
      if (element.focused)
      {
        element.focused = false
        e.preventDefault()
        return
      }
      if (this.prevElement)
      {
        if (this.prevElement !== element)
        {
          this.prevElement.classList.toggle('active', false)
          element.classList.toggle('active', true)
        }
      }
      else
      {
        element.classList.toggle('active', true)
      }
      element.dispatchEvent(new MouseEvent('mouseleave'))
      this.prevElement = element
    }
  })

  if (!element.closest('.context-menu'))
    element.addEventListener('contextmenu', contextMenu.bind(element))
}

const wrapperElement = document.querySelector('.wrapper')

const contextMenuElement = document.querySelector('.context-menu')

function contextMenu(e)
{
  contextMenuElement.focus(
  {
    preventScroll: true
  });
  contextMenuElement.style.top = `${this.offsetTop + this.offsetHeight / 2 - this.parentElement.scrollTop}px`
  contextMenuElement.style.left = `${e.clientX}px`
}

const hoverableElements = [...document.querySelectorAll(hoverable.join(', '))]

const tooltip = document.querySelector('.tooltip')
const tooltipContent = tooltip.querySelector('.tooltip-content')

for (let element of hoverableElements)
{
  attachListeners(element)
}

addEventListener('contextmenu', (event) => event.preventDefault())