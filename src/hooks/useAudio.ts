import { useCallback, useEffect, useRef } from 'react'
import { createSuccessAudio, playFailSound, playSuccessAudio } from '../audio'

const useAudio = () => {
  const successAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    successAudioRef.current = createSuccessAudio()
    return () => {
      successAudioRef.current?.pause()
      successAudioRef.current = null
    }
  }, [])

  const playSuccessSound = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    playSuccessAudio(successAudioRef.current)
  }, [])

  const playFail = useCallback(() => playFailSound(), [])

  return { playSuccessSound, playFailSound: playFail }
}

export default useAudio
