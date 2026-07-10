import { Group } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

function isRelative(url: string): boolean {
  return url.startsWith('/') || url.startsWith('./') || url.startsWith('../')
}

function isAllowedScheme(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export async function loadModel(url: string): Promise<Group> {
  if (!isRelative(url) && !isAllowedScheme(url)) {
    throw new Error('Invalid model URL — only http/https or relative URLs are allowed')
  }
  const gltf = await loader.loadAsync(url)
  return gltf.scene
}
