export interface ModelInfo {
  triangles: number
  vertices: number
  materials: number
}

export interface UICallbacks {
  onReset: () => void
  onToggleGrid: () => void
  onToggleAutoRotate: () => void
}

export function setupUI(callbacks: UICallbacks) {
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement
  const gridBtn = document.getElementById('grid-btn') as HTMLButtonElement
  const autoRotateBtn = document.getElementById('autorotate-btn') as HTMLButtonElement

  resetBtn.addEventListener('click', () => callbacks.onReset())
  gridBtn.addEventListener('click', () => callbacks.onToggleGrid())
  autoRotateBtn.addEventListener('click', () => callbacks.onToggleAutoRotate())
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
