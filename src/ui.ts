export interface UICallbacks {
  onLoad: (url: string) => void
  onReset: () => void
}

export function setupUI(callbacks: UICallbacks): void {
  const urlInput = document.getElementById('url-input') as HTMLInputElement
  const loadBtn = document.getElementById('load-btn') as HTMLButtonElement
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement

  loadBtn.addEventListener('click', () => {
    const url = urlInput.value.trim()
    if (url) {
      callbacks.onLoad(url)
    }
  })

  urlInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      loadBtn.click()
    }
  })

  resetBtn.addEventListener('click', () => {
    callbacks.onReset()
  })
}

export function setStatus(message: string): void {
  const statusEl = document.getElementById('status')
  if (statusEl) {
    statusEl.textContent = message
  }
}
