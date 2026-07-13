export interface ModelInfo {
  triangles: number
  vertices: number
  materials: number
}

export interface PropertyInfo {
  title: string
  address: string
  price: string
  bedrooms: number
  bathrooms: number
  sqft: number
  yearBuilt: number
  description: string
}

export interface UICallbacks {
  onReset: () => void
  onToggleGrid: () => void
  onToggleAutoRotate: () => void
  onToggleProperty: () => void
}

const propPanel = document.getElementById('prop-panel')!

export function setupUI(callbacks: UICallbacks) {
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement
  const gridBtn = document.getElementById('grid-btn') as HTMLButtonElement
  const autoRotateBtn = document.getElementById('autorotate-btn') as HTMLButtonElement
  const propBtn = document.getElementById('prop-btn') as HTMLButtonElement
  const propClose = document.getElementById('prop-close') as HTMLButtonElement

  resetBtn.addEventListener('click', () => callbacks.onReset())
  gridBtn.addEventListener('click', () => callbacks.onToggleGrid())
  autoRotateBtn.addEventListener('click', () => callbacks.onToggleAutoRotate())
  propBtn.addEventListener('click', () => callbacks.onToggleProperty())
  propClose.addEventListener('click', () => {
    propPanel.classList.remove('open')
    propBtn.classList.remove('active')
  })
}

export function setPropertyOpen(open: boolean) {
  const btn = document.getElementById('prop-btn')
  if (open) {
    propPanel.classList.add('open')
    btn?.classList.add('active')
  } else {
    propPanel.classList.remove('open')
    btn?.classList.remove('active')
  }
}

export function setPropertyInfo(info: PropertyInfo) {
  setText('prop-title', info.title)
  setText('prop-address', info.address)
  setText('prop-price', info.price)
  setText('prop-bedrooms', String(info.bedrooms))
  setText('prop-bathrooms', String(info.bathrooms))
  setText('prop-sqft', info.sqft.toLocaleString())
  setText('prop-year', String(info.yearBuilt))
  setText('prop-description', info.description)
}

function setText(id: string, text: string) {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}

export function setStatus(message: string): void {
  const statusEl = document.getElementById('status')
  if (statusEl) {
    statusEl.textContent = message
  }
}

export function setModelInfo(info: ModelInfo): void {
  const el = document.getElementById('model-info')
  if (el) {
    el.textContent = `${info.triangles.toLocaleString()} tris · ${info.vertices.toLocaleString()} verts · ${info.materials} materials`
  }
}

export function clearModelInfo(): void {
  const el = document.getElementById('model-info')
  if (el) {
    el.textContent = ''
  }
}
