import { PerspectiveCamera, Vector3 } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const DEFAULT_POSITION = new Vector3(5, 5, 5)
const DEFAULT_TARGET = new Vector3(0, 0, 0)

export interface ControlsInstance {
  controls: OrbitControls
  reset: () => void
  toggleAutoRotate: () => boolean
  dispose: () => void
}

export function createControls(camera: PerspectiveCamera, domElement: HTMLCanvasElement): ControlsInstance {
  const controls = new OrbitControls(camera, domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 1
  controls.maxDistance = 50
  controls.target.copy(DEFAULT_TARGET)
  controls.update()

  function reset() {
    camera.position.copy(DEFAULT_POSITION)
    controls.target.copy(DEFAULT_TARGET)
    controls.update()
  }

  function toggleAutoRotate(): boolean {
    controls.autoRotate = !controls.autoRotate
    controls.autoRotateSpeed = 4
    return controls.autoRotate
  }

  function dispose() {
    controls.dispose()
  }

  return { controls, reset, toggleAutoRotate, dispose }
}
