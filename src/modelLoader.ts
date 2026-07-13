import { Group } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const loader = new GLTFLoader()
loader.setDRACOLoader(dracoLoader)

export interface LoadProgress {
  loaded: number
  total: number
  percent: number
}

export async function loadModel(url: string, onProgress?: (progress: LoadProgress) => void): Promise<Group> {
  const gltf = await new Promise<GLTF>((resolve, reject) => {
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
