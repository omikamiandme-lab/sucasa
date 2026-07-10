import { Group } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

export interface LoadProgress {
  loaded: number
  total: number
  percent: number
}

export async function loadModel(url: string, onProgress?: (progress: LoadProgress) => void): Promise<Group> {
  const gltf = await new Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>((resolve, reject) => {
    loader.load(url, resolve, (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        })
      }
    }, reject)
  })
  return gltf.scene
}
