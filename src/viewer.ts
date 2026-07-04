import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight } from 'three'

export interface ViewerInstance {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  resize: () => void
}

export function createViewer(container: HTMLElement): ViewerInstance {
  const scene = new Scene()

  const camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.set(5, 5, 5)
  camera.lookAt(0, 0, 0)

  const renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.toneMapping = 3
  renderer.toneMappingExposure = 1.2
  container.appendChild(renderer.domElement)

  const ambientLight = new AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new DirectionalLight(0xffffff, 1.5)
  directionalLight.position.set(5, 10, 7)
  scene.add(directionalLight)

  const fillLight = new DirectionalLight(0xffffff, 0.4)
  fillLight.position.set(-5, 0, 5)
  scene.add(fillLight)

  function resize() {
    const width = container.clientWidth
    const height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  window.addEventListener('resize', resize)

  return { scene, camera, renderer, resize }
}
