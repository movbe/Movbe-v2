/**
 * Optional Whisper Auto-Transcription for Layer 2 subtitles in /v/[shortId].
 * Runs when OPENAI_API_KEY is configured; returns null gracefully otherwise.
 */
export async function transcribeAudioNote(
  audioBuffer: Buffer,
  audioExt = 'webm'
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const form = new FormData()
    const blob = new Blob([new Uint8Array(audioBuffer)], {
      type: audioExt === 'm4a' ? 'audio/mp4' : `audio/${audioExt}`,
    })
    form.append('file', blob, `commentary.${audioExt}`)
    form.append('model', 'whisper-1')
    form.append('response_format', 'text')

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) return null
    const text = (await res.text()).trim()
    return text || null
  } catch {
    return null
  }
}
