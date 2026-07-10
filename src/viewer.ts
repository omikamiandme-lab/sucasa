import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Group, Mesh, BoxGeometry, MeshStandardMaterial, GridHelper, PlaneGeometry, Texture } from 'three'

export interface ViewerInstance {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  resize: () => void
}

export interface ViewerOptions {
  onContextLost?: () => void
  onContextRestored?: () => void
}

function disposeMaterial(mat: unknown) {
  if (!mat) return
  const materials = Array.isArray(mat) ? mat : [mat]
  for (const m of materials) {
    for (const key in m) {
      const value = (m as Record<string, unknown>)[key]
      if (value && typeof value === 'object' && 'isTexture' in value && typeof (value as Record<string, unknown>).dispose === 'function') {
        ;(value as unknown as { dispose: () => void }).dispose()
      }
    }
    m.dispose()
  }
}

export function disposeModel(model: Group) {
  model.traverse((child) => {
    if (child instanceof Mesh) {
      child.geometry.dispose()
      disposeMaterial(child.material)
    }
  })
}

export function stripUserData(model: Group) {
  model.traverse((child) => {
    child.userData = {}
  })
}

export function createFallbackModel(): Group {
  const group = new Group()

  const baseGeo = new BoxGeometry(2, 1.5, 1.5)
  const baseMat = new MeshStandardMaterial({ color: 0x8B7355, flatShading: true })
  const base = new Mesh(baseGeo, baseMat)
  base.position.y = 0.75
  group.add(base)

  const roofGeo = new BoxGeometry(2.2, 0.6, 1.7)
  const roofMat = new MeshStandardMaterial({ color: 0xA0522D, flatShading: true })
  const roof = new Mesh(roofGeo, roofMat)
  roof.position.y = 1.8
  roof.rotation.z = 0.15
  group.add(roof)

  const doorGeo = new BoxGeometry(0.4, 0.6, 0.1)
  const doorMat = new MeshStandardMaterial({ color: 0x5D3A1A, flatShading: true })
  const door = new Mesh(doorGeo, doorMat)
  door.position.set(0, 0.5, 0.76)
  group.add(door)

  return group
}

let gridHelper: GridHelper | null = null
let groundPlane: Mesh | null = null

export function toggleGrid(scene: Scene, visible: boolean) {
  if (visible) {
    if (!gridHelper) {
      gridHelper = new GridHelper(20, 20, 0x888888, 0x444444)
      gridHelper.position.y = -0.01
    }
    if (!groundPlane) {
      const geo = new PlaneGeometry(20, 20)
      const mat = new MeshStandardMaterial({ color: 0x333333, transparent: true, opacity: 0.4, side: 2 })
      groundPlane = new Mesh(geo, mat)
      groundPlane.rotation.x = -Math.PI / 2
      groundPlane.position.y = -0.01
    }
    scene.add(gridHelper)
    scene.add(groundPlane)
  } else {
    if (gridHelper) scene.remove(gridHelper)
    if (groundPlane) scene.remove(groundPlane)
  }
}

const MAX_TEXTURE_SIZE = 2048

function downscaleTexture(texture: Texture) {
  if (!texture.image || texture.image.width <= MAX_TEXTURE_SIZE && texture.image.height <= MAX_TEXTURE_SIZE) return

  const img = texture.image
  const maxDim = Math.max(img.width, img.height)
  const scale = MAX_TEXTURE_SIZE / maxDim
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)

  texture.image = canvas
  texture.needsUpdate = true
}

export function downscaleTextures(model: Group) {
  model.traverse((child) => {
    if (child instanceof Mesh) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      for (const mat of materials) {
        const textureProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'displacementMap', 'alphaMap'] as const
        for (const prop of textureProps) {
          const tex = (mat as Record<string, unknown>)[prop]
          if (tex instanceof Texture) downscaleTexture(tex)
        }
      }
    }
  })
}

export function createViewer(container: HTMLElement, options?: ViewerOptions): ViewerInstance {
  const scene = new Scene()

  const camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.set(5, 5, 5)
  camera.lookAt(0, 0, 0)

  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = 3
  renderer.toneMappingExposure = 1.2
  container.appendChild(renderer.domElement)

  const canvas = renderer.domElement

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    options?.onContextLost?.()
  })

  canvas.addEventListener('webglcontextrestored', () => {
    options?.onContextRestored?.()
  })

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
