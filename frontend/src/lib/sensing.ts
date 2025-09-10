export type SensingState = { enabled: boolean; lastSeenMs?: number }

export function isFaceDetectorAvailable(): boolean {
  return 'FaceDetector' in globalThis
}

export async function startSensing(onAway: ()=>void): Promise<() => void> {
  if (!isFaceDetectorAvailable()) return () => {}
  const detector = new (window as any).FaceDetector({ fastMode: true })
  let stopped = false
  async function tick() {
    if (stopped) return
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true })
      const track = s.getVideoTracks()[0]
      const imageCapture = new (window as any).ImageCapture(track)
      const bitmap = await imageCapture.grabFrame()
      const faces = await detector.detect(bitmap)
      track.stop()
      if (!faces || faces.length === 0) {
        onAway()
      }
    } catch {}
    setTimeout(tick, 60000)
  }
  tick()
  return () => { stopped = true }
}
