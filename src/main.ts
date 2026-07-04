import { Group } from 'three'
import { createViewer } from './viewer'
import { createControls } from './controls'
import { loadModel } from './modelLoader'
import { setupUI, setStatus } from './ui'

const container = document.getElementById('app')!
const { scene, camera, renderer } = createViewer(container)
const { controls, reset } = createControls(camera, renderer.domElement)

let currentModel: Group | null = null

function setModel(model: Group) {
  if (currentModel) {
    scene.remove(currentModel)
  }
  currentModel = model
  scene.add(model)
}

setupUI({
  onLoad: async (url) => {
    setStatus('Loading model...')
    try {
      const model = await loadModel(url)
      setModel(model)
      reset()
      setStatus('Model loaded')
    } catch {
      setStatus('Failed to load model')
    }
  },
  onReset: () => {
    reset()
  },
})

async function loadDefaultModel() {
  try {
    const model = await loadModel('/models/sample.glb')
    setModel(model)
    setStatus('Demo model loaded')
  } catch {
    setStatus('No demo model found — paste a URL to load')
  }
}

loadDefaultModel()

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

animate()
