import failSound from './assets/fail.mp3'
import successSound from './assets/success.mp3'

export const createSuccessAudio = (): HTMLAudioElement | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const audio = new Audio(successSound)
  audio.volume = 0.8
  return audio
}

export const playSuccessAudio = (audio: HTMLAudioElement | null) => {
  if (!audio) {
    return
  }
  audio.currentTime = 0
  void audio.play()
}

export const playFailSound = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }
  const audio = new Audio(failSound)
  audio.volume = 0.8

  return new Promise((resolve) => {
    const cleanup = () => {
      audio.removeEventListener('ended', cleanup)
      audio.removeEventListener('error', cleanup)
      resolve()
    }
    audio.addEventListener('ended', cleanup, { once: true })
    audio.addEventListener('error', cleanup, { once: true })
    const playPromise = audio.play()
    if (!playPromise) {
      cleanup()
      return
    }
    playPromise.catch(() => cleanup())
  })
}
