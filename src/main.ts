import { Group, Mesh } from 'three'
import { createViewer, createFallbackModel, disposeModel, stripUserData, toggleGrid, downscaleTextures } from './viewer'
import { createControls } from './controls'
import { loadModel } from './modelLoader'
import { setupUI, setStatus, setModelInfo, setPropertyInfo, setPropertyOpen } from './ui'
import type { PropertyInfo } from './ui'

const container = document.getElementById('app')!
const { scene, camera, renderer } = createViewer(container, {
  onContextLost: () => {
    running = false
    cancelAnimationFrame(animFrameId)
    setStatus('WebGL context lost — rendering paused')
  },
  onContextRestored: () => {
    running = true
    setStatus('Rendering resumed')
    animate()
  },
})
const { controls, reset, toggleAutoRotate } = createControls(camera, renderer.domElement)

let currentModel: Group | null = null
let gridVisible = false
let autoRotateActive = false
let propertyOpen = false

const DEMO_PROPERTY: PropertyInfo = {
  title: 'Homely House',
  address: '123 Main Street, Springfield',
  price: '$450,000',
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1850,
  yearBuilt: 2019,
  description: 'A charming three-bedroom home with an open floor plan, modern kitchen, and a spacious backyard. Located in a quiet neighborhood close to schools and parks.',
}

function setModel(model: Group) {
  if (currentModel) {
    scene.remove(currentModel)
    disposeModel(currentModel)
  }
  currentModel = model
  stripUserData(model)
  scene.add(model)
  updateModelInfo(model)
}

function updateModelInfo(model: Group) {
  let triangles = 0
  let vertices = 0
  const materials = new Set<object>()

  model.traverse((child) => {
    if (child instanceof Mesh) {
      const geo = child.geometry
      if (geo.index) {
        triangles += geo.index.count / 3
      } else if (geo.attributes.position) {
        triangles += geo.attributes.position.count / 3
      }
      if (geo.attributes.position) {
        vertices += geo.attributes.position.count
      }
      const mat = child.material
      const mats = Array.isArray(mat) ? mat : [mat]
      for (const m of mats) materials.add(m)
    }
  })

  setModelInfo({ triangles: Math.round(triangles), vertices, materials: materials.size })
}

function updateGridButton() {
  const btn = document.getElementById('grid-btn')
  if (btn) btn.classList.toggle('active', gridVisible)
}

function updateAutoRotateButton() {
  const btn = document.getElementById('autorotate-btn')
  if (btn) btn.classList.toggle('active', autoRotateActive)
}

setupUI({
  onReset: () => {
    reset()
  },
  onToggleGrid: () => {
    gridVisible = !gridVisible
    toggleGrid(scene, gridVisible)
    updateGridButton()
    setStatus(gridVisible ? 'Grid visible' : 'Grid hidden')
  },
  onToggleAutoRotate: () => {
    autoRotateActive = toggleAutoRotate()
    updateAutoRotateButton()
    setStatus(autoRotateActive ? 'Auto-rotate on' : 'Auto-rotate off')
  },
  onToggleProperty: () => {
    propertyOpen = !propertyOpen
    setPropertyOpen(propertyOpen)
    setStatus(propertyOpen ? 'Property info open' : 'Property info closed')
  },
})

renderer.domElement.setAttribute('aria-label', '3D model viewer')

document.addEventListener('keydown', (event) => {
  if (event.key === 'r' || event.key === 'R') {
    reset()
    setStatus('Camera reset')
  }
  if (event.key === 'g' || event.key === 'G') {
    gridVisible = !gridVisible
    toggleGrid(scene, gridVisible)
    updateGridButton()
    setStatus(gridVisible ? 'Grid visible' : 'Grid hidden')
  }
  if (event.key === ' ') {
    event.preventDefault()
    autoRotateActive = toggleAutoRotate()
    updateAutoRotateButton()
    setStatus(autoRotateActive ? 'Auto-rotate on' : 'Auto-rotate off')
  }
})

async function loadDefaultModel() {
  try {
    setStatus('Loading model...')
    const model = await loadModel('/models/sample.gltf', (progress) => {
      setStatus(`Loading model... ${progress.percent}%`)
    })
    downscaleTextures(model)
    setModel(model)
    setPropertyInfo(DEMO_PROPERTY)
    setStatus('Demo model loaded')
  } catch {
    setModel(createFallbackModel())
    setPropertyInfo({ ...DEMO_PROPERTY, title: 'Property' })
    setStatus('Fallback model displayed')
  }
}

loadDefaultModel()

let animFrameId = 0
let running = true

function animate() {
  if (!running) return
  animFrameId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    running = false
    cancelAnimationFrame(animFrameId)
  } else {
    running = true
    animate()
  }
})

animate()

window.addEventListener('error', (event) => {
  setStatus('An unexpected error occurred')
  console.error(event.error ?? event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  setStatus('An unexpected error occurred')
  console.error(event.reason)
})
