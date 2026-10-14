import { Request, Response, Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db, DBHistoryItem, DBCard, DBPost, DBComment } from './db';

export const aiRouter = Router();

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to generate unique request ID
function generateRequestId(service: string): string {
  return `req_${service}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Helper to call Gemini models with fallback
async function callGeminiModel(
  aiClient: GoogleGenAI | null,
  models: string[],
  contents: any,
  config?: any
): Promise<{ text: string; modelUsed: string } | null> {
  if (!aiClient) return null;
  for (const model of models) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents,
        config,
      });
      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err) {
      console.warn(`[AI Route] Model ${model} call error, trying next:`, err);
      continue;
    }
  }
  return null;
}

// 1. CHAT AI SERVICE (/api/ai/chat)
aiRouter.post('/chat', async (req: Request, res: Response) => {
  const requestId = generateRequestId('chat');
  const { prompt, message, history, userId } = req.body;
  const p = (prompt || message || '').trim();

  if (!p) {
    return res.status(400).json({
      success: false,
      requestId,
      status: 'failed',
      error: 'Prompt is required for Chat AI',
    });
  }

  if (!ai) {
    const errorDetails = {
      message: 'Gemini API key is not configured on the server.',
      providerRequired: 'Google AI Studio / Gemini API',
      modelRequired: 'gemini-3.1-flash / gemini-2.5-flash',
      endpoint: '/api/ai/chat',
      envVarRequired: 'GEMINI_API_KEY',
    };
    db.addHistoryItem({
      id: `hist_${Date.now()}`,
      userId: userId || 'usr-guest',
      requestId,
      capability: 'chat',
      prompt: p,
      status: 'failed',
      createdAt: new Date().toISOString(),
      errorDetails,
      aiToolName: 'Gemini 3.1 Flash',
    });

    return res.status(503).json({
      success: false,
      requestId,
      status: 'failed',
      error: errorDetails.message,
      errorDetails,
    });
  }

  try {
    const chatModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-1.5-flash'];
    const result = await callGeminiModel(
      ai,
      chatModels,
      p,
      { systemInstruction: 'You are OTHERWISE AI, a warm, natural, creative assistant. Be direct, articulate, and conversational.' }
    );

    if (result) {
      const histItem: DBHistoryItem = {
        id: `hist_${Date.now()}`,
        userId: userId || 'usr-guest',
        requestId,
        capability: 'chat',
        prompt: p,
        status: 'completed',
        createdAt: new Date().toISOString(),
        resultText: result.text,
        mediaType: 'text',
        aiToolName: result.modelUsed,
      };
      db.addHistoryItem(histItem);

      return res.json({
        success: true,
        requestId,
        status: 'completed',
        text: result.text,
        model: result.modelUsed,
        capability: 'chat',
      });
    }

    throw new Error('All chat models failed to produce a response');
  } catch (err: any) {
    const errorDetails = {
      message: err.message || 'Failed to process chat response',
      providerRequired: 'Google AI Studio',
      modelRequired: 'gemini-3.1-flash',
      endpoint: '/api/ai/chat',
      envVarRequired: 'GEMINI_API_KEY',
    };
    db.addHistoryItem({
      id: `hist_${Date.now()}`,
      userId: userId || 'usr-guest',
      requestId,
      capability: 'chat',
      prompt: p,
      status: 'failed',
      createdAt: new Date().toISOString(),
      errorDetails,
      aiToolName: 'Gemini 3.1 Flash',
    });

    return res.status(500).json({
      success: false,
      requestId,
      status: 'failed',
      error: errorDetails.message,
      errorDetails,
    });
  }
});

// 2. IMAGE AI SERVICE (/api/ai/image)
aiRouter.post('/image', async (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    error: 'This feature is temporarily unavailable while we complete development.',
    isUnavailable: true,
  });
  const requestId = generateRequestId('image');
  const { prompt, aspectRatio, referenceImage, editInstruction, isVariation, userId } = req.body;
  let p = (prompt || editInstruction || '').trim();

  if (!p && !referenceImage) {
    return res.status(400).json({
      success: false,
      requestId,
      status: 'failed',
      error: 'Prompt or reference image is required for Image AI',
    });
  }

  if (isVariation) {
    p = `Stylistic visual variation of: ${p}`;
  }

  if (!ai) {
    const errorDetails = {
      message: 'Gemini Image Generation API key is not configured or quota limit reached.',
      providerRequired: 'Google AI Studio / Gemini Image API',
      modelRequired: 'gemini-3.1-flash-image / gemini-3.1-flash-lite-image',
      endpoint: '/api/ai/image',
      envVarRequired: 'GEMINI_API_KEY',
    };
    db.addHistoryItem({
      id: `hist_${Date.now()}`,
      userId: userId || 'usr-guest',
      requestId,
      capability: 'image',
      prompt: p,
      status: 'failed',
      createdAt: new Date().toISOString(),
      errorDetails,
      aiToolName: 'Gemini 3.1 Flash Image',
    });

    return res.status(503).json({
      success: false,
      requestId,
      status: 'failed',
      error: errorDetails.message,
      errorDetails,
    });
  }

  const aiClient = ai!;

  try {
    const imageModels = ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'];
    for (const model of imageModels) {
      try {
        const imageContents: any = { parts: [] };
        if (referenceImage && referenceImage.data) {
          imageContents.parts.push({
            inlineData: {
              data: referenceImage.data,
              mimeType: referenceImage.mimeType || 'image/png',
            },
          });
        }
        imageContents.parts.push({ text: p });

        const response: any = await aiClient.models.generateContent({
          model,
          contents: imageContents,
          config: {
            imageConfig: {
              aspectRatio: aspectRatio || '1:1',
            },
          },
        });

        let generatedImageUrl: string | null = null;
        let textFeedback = 'Image generated successfully.';

        if (response?.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            } else if (part.text) {
              textFeedback = part.text;
            }
          }
        }

        if (generatedImageUrl) {
          const imageData = {
            id: `img_${Date.now()}`,
            requestId,
            url: generatedImageUrl,
            prompt: p,
            aspectRatio: aspectRatio || '1:1',
            model,
            createdAt: new Date().toISOString(),
          };

          db.addHistoryItem({
            id: `hist_${Date.now()}`,
            userId: userId || 'usr-guest',
            requestId,
            capability: 'image',
            prompt: p,
            status: 'completed',
            createdAt: new Date().toISOString(),
            mediaType: 'image',
            mediaUrl: generatedImageUrl ?? undefined,
            imageData,
            aiToolName: `Gemini Image (${model})`,
          });

          return res.json({
            success: true,
            requestId,
            status: 'completed',
            imageUrl: generatedImageUrl,
            image: imageData,
            prompt: p,
            aspectRatio: aspectRatio || '1:1',
            model,
            text: textFeedback,
          });
        }
      } catch (err) {
        console.warn(`[Image AI] Model ${model} failed, trying next:`, err);
        continue;
      }
    }

    const errorDetails = {
      message: 'Direct image rendering with Gemini requires an image-generation enabled API key (paid tier / quota active) in Google AI Studio.',
      providerRequired: 'Google AI Studio Image Generation',
      modelRequired: 'gemini-3.1-flash-image',
      endpoint: '/api/ai/image',
      envVarRequired: 'GEMINI_API_KEY',
    };

    db.addHistoryItem({
      id: `hist_${Date.now()}`,
      userId: userId || 'usr-guest',
      requestId,
      capability: 'image',
      prompt: p,
      status: 'failed',
      createdAt: new Date().toISOString(),
      errorDetails,
      aiToolName: 'Gemini Image API',
    });

    return res.status(503).json({
      success: false,
      requestId,
      status: 'failed',
      error: errorDetails.message,
      errorDetails,
    });
  } catch (err: any) {
    const errorDetails = {
      message: err.message || 'Failed to generate image',
      providerRequired: 'Google AI Studio',
      modelRequired: 'gemini-3.1-flash-image',
      endpoint: '/api/ai/image',
      envVarRequired: 'GEMINI_API_KEY',
    };

    return res.status(500).json({
      success: false,
      requestId,
      status: 'failed',
      error: errorDetails.message,
      errorDetails,
    });
  }
});

// 3. SONG / MUSIC AI SERVICE (/api/ai/song)
aiRouter.post('/song', async (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    error: 'This feature is temporarily unavailable while we complete development.',
    isUnavailable: true,
  });
  const requestId = generateRequestId('song');
  const { prompt, genre, mood, bpm, vocalStyle, vocalType, lyrics, duration, userId } = req.body;
  const p = (prompt || 'Original Music Track').trim();
  const requestedDuration = Number(duration) || 30;

  if (!p) {
    return res.status(400).json({ success: false, requestId, error: 'Song prompt is required' });
  }

  // Check Suno API first if key configured
  const sunoApiKey = process.env.SUNO_API_KEY;
  if (sunoApiKey) {
    try {
      const sunoBaseUrl = process.env.SUNO_API_URL || 'https://api.sunoaiapi.com';
      const isInstrumental = vocalType === 'instrumental';
      const tags = [
        genre && genre !== 'Auto' ? genre : null,
        mood && mood !== 'Auto' ? mood : null,
        bpm ? `${bpm} bpm` : null,
        vocalStyle && vocalStyle !== 'Auto' ? vocalStyle : null,
      ].filter(Boolean).join(', ');

      const sunoRes = await fetch(`${sunoBaseUrl}/api/v1/gateway/generate/music`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sunoApiKey}`,
        },
        body: JSON.stringify({
          prompt: lyrics?.trim() ? lyrics.trim() : p,
          tags,
          title: p.slice(0, 40),
          make_instrumental: isInstrumental,
          wait_audio: false,
        }),
      });

      if (sunoRes.ok) {
        const data: any = await sunoRes.json();
        const taskId = data?.data?.task_id || data?.task_id || data?.id;
        if (taskId) {
          for (let attempt = 0; attempt < 10; attempt++) {
            await new Promise((r) => setTimeout(r, 4000));
            const pollRes = await fetch(`${sunoBaseUrl}/api/v1/gateway/query?task_id=${taskId}`, {
              headers: { 'Authorization': `Bearer ${sunoApiKey}` },
            });
            if (!pollRes.ok) continue;
            const pollData: any = await pollRes.json();
            const clips = pollData?.data?.clips || pollData?.clips || [];
            if (clips.length > 0 && clips[0].audio_url) {
              const songData = {
                requestId,
                title: p.slice(0, 32),
                genre: genre && genre !== 'Auto' ? genre : 'Contemporary',
                mood: mood && mood !== 'Auto' ? mood : 'Dynamic',
                bpm: bpm || 120,
                vocalStyle: vocalStyle || 'Expressive',
                vocalType: vocalType || 'vocal',
                instruments: ['Suno Arrangement Stems', 'Melody', 'Bassline', 'Rhythm Section'],
                lyrics: [{ section: 'Full Song', lines: [p] }],
                musicGenerationPrompt: p,
                coverArtConcept: `Album artwork for ${p}`,
                audioUrl: clips[0].audio_url,
                duration: clips[0].duration || requestedDuration,
                provider: 'Suno v3.5',
              };

              db.addHistoryItem({
                id: `hist_${Date.now()}`,
                userId: userId || 'usr-guest',
                requestId,
                capability: 'song',
                prompt: p,
                status: 'completed',
                createdAt: new Date().toISOString(),
                mediaType: 'audio',
                mediaUrl: songData.audioUrl,
                audioData: songData,
                aiToolName: 'Suno v3.5',
              });

              return res.json({
                success: true,
                requestId,
                status: 'completed',
                song: songData,
                text: `### 🎵 ${songData.title}\n**Genre**: ${songData.genre} · **Tempo**: ${songData.bpm} BPM\n\nFull song synthesized with Suno v3.5.`,
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Suno API attempt failed:', e);
    }
  }

  // Next try Google Lyria
  if (!ai) {
    const errorDetails = {
      message: 'Neither GEMINI_API_KEY nor SUNO_API_KEY is configured on the server.',
      providerRequired: 'Google AI Studio / Suno API',
      modelRequired: 'lyria-3.5 / Suno v3.5',
      endpoint: '/api/ai/song',
      envVarRequired: 'GEMINI_API_KEY or SUNO_API_KEY',
    };
    return res.status(503).json({ success: false, requestId, error: errorDetails.message, errorDetails });
  }

  try {
    let finalTitle = p.slice(0, 32);
    let finalGenre = genre && genre !== 'Auto' ? genre : 'Cinematic';
    let finalMood = mood && mood !== 'Auto' ? mood : 'Atmospheric';
    let finalBpm = bpm || 120;
    let finalVocalStyle = vocalStyle && vocalStyle !== 'Auto' ? vocalStyle : 'Expressive Vocals';
    let lyricsArr = [
      { section: 'Verse 1', lines: [`Verse based on ${p}`, 'Carrying the sound into the open air'] },
      { section: 'Chorus', lines: ['Building the melody higher and strong', 'Singing the words to our story and song'] },
    ];
    let instruments = ['Rhythm Section', 'Harmonic Pads', 'Lead Instrument', 'Bass'];

    // 1. Compose lyrics strictly with Gemini
    try {
      const lyricsPrompt = `You are a master composer and lyricist. Compose a complete song strictly according to:
Prompt: "${p}"
${genre && genre !== 'Auto' ? `Genre: ${genre}` : ''}
${mood && mood !== 'Auto' ? `Mood: ${mood}` : ''}
${vocalStyle && vocalStyle !== 'Auto' ? `Vocal Style: ${vocalStyle}` : ''}
Vocal Type: ${vocalType === 'instrumental' ? 'Instrumental Only' : 'Vocals'}
${lyrics ? `User Lyrics: "${lyrics}"` : ''}

Return JSON with:
{
  "title": "Short title",
  "genre": "Genre",
  "mood": "Mood",
  "bpm": 120,
  "vocalStyle": "Style",
  "instruments": ["instrument 1", "instrument 2"],
  "lyrics": [
    { "section": "Verse 1", "lines": ["line 1", "line 2"] },
    { "section": "Chorus", "lines": ["line 1", "line 2"] }
  ]
}
Return ONLY valid JSON.`;

      const genRes = await callGeminiModel(ai, ['gemini-3.8-flash', 'gemini-3.1-flash-lite'], lyricsPrompt);
      if (genRes?.text) {
        const clean = genRes!.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (parsed.title) finalTitle = parsed.title;
        if (parsed.genre) finalGenre = parsed.genre;
        if (parsed.mood) finalMood = parsed.mood;
        if (parsed.bpm) finalBpm = parsed.bpm;
        if (parsed.vocalStyle) finalVocalStyle = parsed.vocalStyle;
        if (Array.isArray(parsed.instruments)) instruments = parsed.instruments;
        if (Array.isArray(parsed.lyrics)) lyricsArr = parsed.lyrics;
      }
    } catch (e) {
      console.warn('Gemini lyrics generation warning:', e);
    }

    // 2. Try Lyria Audio Models
    let audioUrl = '';
    const lyriaModels = ['lyria-3.5', 'lyria-3-pro-preview', 'lyria-3-clip-preview'];
    if (ai) {
      const lyriaAi = ai!;
      for (const model of lyriaModels) {
        try {
          const stream = await lyriaAi.models.generateContentStream({
            model,
            contents: `Generate audio for a ${vocalType === 'instrumental' ? 'instrumental' : 'vocal'} music track based strictly on user prompt: "${p}". Title: "${finalTitle}". Style: ${finalGenre}, Mood: ${finalMood}, BPM: ${finalBpm}.`,
          });

          let audioBase64 = '';
          let mimeType = 'audio/wav';

          for await (const chunk of stream) {
            const parts = chunk.candidates?.[0]?.content?.parts;
            if (!parts) continue;
            for (const part of parts as any[]) {
              if (part?.inlineData?.data) {
                if (!audioBase64 && part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
                audioBase64 += part.inlineData.data;
              }
            }
          }

          if (audioBase64) {
            audioUrl = `data:${mimeType};base64,${audioBase64}`;
            break;
          }
        } catch (err: any) {
          console.warn(`[Song AI] Model ${model} stream error:`, err.status, err.message);
          break;
        }
      }
    }

    const songData = {
      requestId,
      title: finalTitle,
      genre: finalGenre,
      mood: finalMood,
      bpm: finalBpm,
      vocalStyle: finalVocalStyle,
      vocalType: vocalType || 'vocal',
      instruments,
      lyrics: lyricsArr,
      musicGenerationPrompt: p,
      coverArtConcept: `Album artwork for ${finalTitle}: ${finalGenre} aesthetic`,
      audioUrl: audioUrl || undefined,
      duration: requestedDuration,
      provider: audioUrl ? 'Google Lyria 3.5' : 'None',
      requiresBilling: !audioUrl,
    };

    if (audioUrl) {
      db.addHistoryItem({
        id: `hist_${Date.now()}`,
        userId: userId || 'usr-guest',
        requestId,
        capability: 'song',
        prompt: p,
        status: 'completed',
        createdAt: new Date().toISOString(),
        mediaType: 'audio',
        mediaUrl: audioUrl,
        audioData: songData,
        aiToolName: 'Google Lyria 3.5',
      });

      return res.json({
        success: true,
        requestId,
        status: 'completed',
        song: songData,
        text: `### 🎵 ${songData.title}\n**Genre**: ${songData.genre} · **Tempo**: ${songData.bpm} BPM · **Mood**: ${songData.mood}\n**Vocals**: ${songData.vocalStyle}`,
      });
    }

    // Transparent billing error when audio quota is unavailable
    const errorDetails = {
      message: 'Google Lyria 3.5 audio generation requires an active billing project in Google AI Studio (Quota 429: Resource Exhausted). You can also configure a SUNO_API_KEY on the server for Suno music generation.',
      providerRequired: 'Google AI Studio / Suno API',
      modelRequired: 'lyria-3.5 / Suno v3.5',
      endpoint: '/api/ai/song',
      envVarRequired: 'GEMINI_API_KEY (with billing) or SUNO_API_KEY',
    };

    return res.status(503).json({
      success: false,
      requestId,
      status: 'failed',
      song: songData,
      requiresBilling: true,
      error: errorDetails.message,
      errorDetails,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, requestId, error: err.message });
  }
});

// 4. VIDEO AI SERVICE (/api/ai/video)
aiRouter.post('/video', async (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    error: 'This feature is temporarily unavailable while we complete development.',
    isUnavailable: true,
  });
  const requestId = generateRequestId('video');
  const { prompt, aspectRatio, duration, resolution, cameraMovement, visualStyle, referenceImage, userId } = req.body;
  const p = (prompt || 'Cinematic video sequence').trim();
  const validAspect = aspectRatio === '9:16' ? '9:16' : '16:9';
  const reqDuration = Number(duration) || 6;
  const validDuration = [4, 6, 8].includes(reqDuration) ? reqDuration : (reqDuration <= 5 ? 4 : reqDuration <= 7 ? 6 : 8);

  if (!ai) {
    const errorDetails = {
      message: 'Google Veo 3.1 Video API key is not configured on the server.',
      providerRequired: 'Google AI Studio / Veo 3.1 API',
      modelRequired: 'veo-3.1-fast-generate-preview',
      endpoint: '/api/ai/video',
      envVarRequired: 'GEMINI_API_KEY',
    };
    return res.status(503).json({ success: false, requestId, error: errorDetails.message, errorDetails });
  }

  try {
    let title = p.slice(0, 32);
    let storyboard = [
      { sceneNumber: 1, shotType: 'Wide Establishing Shot', cameraMovement: cameraMovement || 'Slow Pan', visualAction: `Opening scene of ${p}`, lighting: 'Atmospheric', dialogueAudio: 'Foley', videoDiffusionPrompt: p },
      { sceneNumber: 2, shotType: 'Medium Tracking Shot', cameraMovement: cameraMovement || 'Dolly In', visualAction: `Development of ${p}`, lighting: 'High contrast', dialogueAudio: 'Ambient hum', videoDiffusionPrompt: p },
      { sceneNumber: 3, shotType: 'Close-Up Shot', cameraMovement: cameraMovement || 'Static', visualAction: `Climax of ${p}`, lighting: 'Luminescent glow', dialogueAudio: 'Key sound effect', videoDiffusionPrompt: p },
      { sceneNumber: 4, shotType: 'Hero Conclusion Shot', cameraMovement: cameraMovement || 'Crane Up', visualAction: `Resolution of ${p}`, lighting: 'Golden reflections', dialogueAudio: 'Outro theme', videoDiffusionPrompt: p },
    ];

    // 1. Generate Storyboard with Gemini
    try {
      const storyboardPrompt = `You are a film director. Create a 4-scene video storyboard based strictly on: "${p}".
Aspect Ratio: ${validAspect}
Duration: ${validDuration}s
Style: ${visualStyle || 'Cinematic'}

Return JSON:
{
  "title": "Short title",
  "storyboard": [
    { "sceneNumber": 1, "shotType": "Wide Shot", "cameraMovement": "Pan", "visualAction": "Action", "lighting": "Lighting", "dialogueAudio": "Audio", "videoDiffusionPrompt": "Prompt" },
    { "sceneNumber": 2, "shotType": "Medium Shot", "cameraMovement": "Dolly", "visualAction": "Action", "lighting": "Lighting", "dialogueAudio": "Audio", "videoDiffusionPrompt": "Prompt" },
    { "sceneNumber": 3, "shotType": "Close-Up", "cameraMovement": "Focus", "visualAction": "Action", "lighting": "Lighting", "dialogueAudio": "Audio", "videoDiffusionPrompt": "Prompt" },
    { "sceneNumber": 4, "shotType": "Hero Shot", "cameraMovement": "Zoom", "visualAction": "Action", "lighting": "Lighting", "dialogueAudio": "Audio", "videoDiffusionPrompt": "Prompt" }
  ]
}
Return ONLY valid JSON.`;

      const sbRes = await callGeminiModel(ai, ['gemini-3.8-flash', 'gemini-3.1-flash-lite'], storyboardPrompt);
      if (sbRes?.text) {
        const clean = sbRes!.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (parsed.title) title = parsed.title;
        if (Array.isArray(parsed.storyboard)) storyboard = parsed.storyboard;
      }
    } catch (e) {
      console.warn('[Video AI] Storyboard generation warning:', e);
    }

    // 2. Real Google Veo 3.1 Operation
    let videoUrl = '';
    const veoModels = ['veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview', 'veo-3.1-lite-generate-preview'];

    if (ai) {
      const aiClient = ai!;
      for (const model of veoModels) {
        try {
          const videoParams: any = {
            model,
            prompt: `${p}. Visual style: ${visualStyle || 'Cinematic'}. Camera movement: ${cameraMovement || 'Dynamic Motion'}.`,
            config: {
              durationSeconds: validDuration,
              aspectRatio: validAspect,
            },
          };

          if (referenceImage && referenceImage.data) {
            videoParams.image = {
              imageBytes: referenceImage.data,
              mimeType: referenceImage.mimeType || 'image/png',
            };
          }

          const operation: any = await (aiClient.models as any).generateVideos(videoParams);
          if (operation) {
            let currentOp = operation;
            let pollCount = 0;
            while (!currentOp.done && pollCount < 15) {
              await new Promise((resolve) => setTimeout(resolve, 4000));
              currentOp = await (aiClient.operations as any).getVideosOperation({ operation: currentOp });
              pollCount++;
            }

            if (currentOp.done && currentOp.response?.generatedVideos?.[0]) {
              const gen = currentOp.response.generatedVideos[0];
              if (gen.video?.uri) {
                videoUrl = gen.video.uri;
                break;
              } else if (gen.video?.videoBytes) {
                const mime = gen.video.mimeType || 'video/mp4';
                videoUrl = `data:${mime};base64,${gen.video.videoBytes}`;
                break;
              }
            }
          }
        } catch (err: any) {
          console.warn(`[Video AI] Model ${model} error:`, err.status, err.message);
          break;
        }
      }
    }

    const videoData = {
      id: `vid_${Date.now()}`,
      requestId,
      url: videoUrl || undefined,
      title,
      prompt: p,
      aspectRatio: validAspect,
      duration: validDuration,
      model: 'Google Veo 3.1',
      resolution: resolution || '720p',
      visualStyle: visualStyle || 'Cinematic',
      cameraMovement: cameraMovement || 'Dynamic',
      storyboard,
      requiresBilling: !videoUrl,
      createdAt: new Date().toISOString(),
    };

    if (videoUrl) {
      db.addHistoryItem({
        id: `hist_${Date.now()}`,
        userId: userId || 'usr-guest',
        requestId,
        capability: 'video',
        prompt: p,
        status: 'completed',
        createdAt: new Date().toISOString(),
        mediaType: 'video',
        mediaUrl: videoUrl,
        videoData,
        aiToolName: 'Google Veo 3.1',
      });

      return res.json({
        success: true,
        requestId,
        status: 'completed',
        video: videoData,
        text: `### 🎬 ${videoData.title}\n**Model**: Google Veo 3.1 · **Aspect Ratio**: ${videoData.aspectRatio} · **Duration**: ${videoData.duration}s`,
      });
    }

    // Transparent billing requirement
    const errorDetails = {
      message: 'Google Veo 3.1 video generation requires an active billing project in Google AI Studio (Quota 429: Resource Exhausted). Please enable Pay-as-you-go billing in your Google AI Studio project to generate MP4 videos.',
      providerRequired: 'Google AI Studio / Veo 3.1 API',
      modelRequired: 'veo-3.1-fast-generate-preview',
      endpoint: '/api/ai/video',
      envVarRequired: 'GEMINI_API_KEY (with billing)',
    };

    return res.status(503).json({
      success: false,
      requestId,
      status: 'failed',
      video: videoData,
      requiresBilling: true,
      error: errorDetails.message,
      errorDetails,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, requestId, error: err.message });
  }
});

// 5. WRITING / CONTENT AI SERVICE (/api/ai/writing)
aiRouter.post('/writing', async (req: Request, res: Response) => {
  const requestId = generateRequestId('write');
  const { prompt, tone, length, action, userId } = req.body;
  const p = (prompt || '').trim();

  if (!p) {
    return res.status(400).json({ success: false, requestId, status: 'failed', error: 'Prompt is required' });
  }

  if (!ai) {
    return res.status(503).json({
      success: false,
      requestId,
      status: 'failed',
      error: 'Gemini API key is not configured on server.',
    });
  }

  try {
    const systemPrompt = `You are a master content writer. Tone: ${tone || 'engaging'}, Length: ${length || 'medium'}, Action: ${action || 'compose'}. Provide polished, captivating writing with zero fluff.`;
    const result = await callGeminiModel(ai, ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'], p, { systemInstruction: systemPrompt });

    if (result) {
      db.addHistoryItem({
        id: `hist_${Date.now()}`,
        userId: userId || 'usr-guest',
        requestId,
        capability: 'write',
        prompt: p,
        status: 'completed',
        createdAt: new Date().toISOString(),
        resultText: result.text,
        mediaType: 'text',
        aiToolName: 'Gemini Writing Engine',
      });

      return res.json({ success: true, requestId, status: 'completed', text: result.text, capability: 'write' });
    }
    throw new Error('Writing generation failed');
  } catch (err: any) {
    return res.status(500).json({ success: false, requestId, status: 'failed', error: err.message });
  }
});

// 6. CODING AI SERVICE (/api/ai/coding)
aiRouter.post('/coding', async (req: Request, res: Response) => {
  const requestId = generateRequestId('code');
  const { prompt, language, userId } = req.body;
  const p = (prompt || '').trim();

  if (!p) {
    return res.status(400).json({ success: false, requestId, status: 'failed', error: 'Prompt is required' });
  }

  if (!ai) {
    return res.status(503).json({ success: false, requestId, status: 'failed', error: 'Gemini API key is not configured.' });
  }

  try {
    const systemPrompt = `You are an expert senior software engineer. Provide type-safe, runnable, secure, clean code in ${language || 'TypeScript/React'} with clear structure.`;
    const result = await callGeminiModel(ai, ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'], p, { systemInstruction: systemPrompt, temperature: 0.2 });

    if (result) {
      db.addHistoryItem({
        id: `hist_${Date.now()}`,
        userId: userId || 'usr-guest',
        requestId,
        capability: 'code',
        prompt: p,
        status: 'completed',
        createdAt: new Date().toISOString(),
        resultText: result.text,
        mediaType: 'code',
        aiToolName: 'Gemini Code Architect',
      });

      return res.json({ success: true, requestId, status: 'completed', text: result.text, capability: 'code' });
    }
    throw new Error('Code generation failed');
  } catch (err: any) {
    return res.status(500).json({ success: false, requestId, status: 'failed', error: err.message });
  }
});

// 7. RESEARCH / STUDY AI SERVICE (/api/ai/research)
aiRouter.post('/research', async (req: Request, res: Response) => {
  const requestId = generateRequestId('research');
  const { prompt, userId } = req.body;
  const p = (prompt || '').trim();

  if (!p) {
    return res.status(400).json({ success: false, requestId, status: 'failed', error: 'Prompt is required' });
  }

  if (!ai) {
    return res.status(503).json({ success: false, requestId, status: 'failed', error: 'Gemini API key is not configured.' });
  }

  try {
    const systemPrompt = `You are a research scientist and educator. Break down complex topics with crystal clarity, rigorous findings, and intuitive takeaways.`;
    const result = await callGeminiModel(ai, ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'], p, { systemInstruction: systemPrompt });

    if (result) {
      db.addHistoryItem({
        id: `hist_${Date.now()}`,
        userId: userId || 'usr-guest',
        requestId,
        capability: 'research',
        prompt: p,
        status: 'completed',
        createdAt: new Date().toISOString(),
        resultText: result.text,
        mediaType: 'text',
        aiToolName: 'Gemini Research Intelligence',
      });

      return res.json({ success: true, requestId, status: 'completed', text: result.text, capability: 'research' });
    }
    throw new Error('Research analysis failed');
  } catch (err: any) {
    return res.status(500).json({ success: false, requestId, status: 'failed', error: err.message });
  }
});

// 8. FILE / DOCUMENT AI SERVICE (/api/ai/file)
aiRouter.post('/file', async (req: Request, res: Response) => {
  const requestId = generateRequestId('file');
  const { prompt, file, userId } = req.body;
  const p = (prompt || 'Analyze this document').trim();

  if (!file || !file.data) {
    return res.status(400).json({ success: false, requestId, status: 'failed', error: 'File data is required' });
  }

  if (!ai) {
    return res.status(503).json({ success: false, requestId, status: 'failed', error: 'Gemini API key is not configured.' });
  }

  try {
    const contents = [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: file.mimeType || 'text/plain', data: file.data } },
          { text: p },
        ],
      },
    ];

    const result = await callGeminiModel(ai, ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'], contents);

    if (result) {
      db.addHistoryItem({
        id: `hist_${Date.now()}`,
        userId: userId || 'usr-guest',
        requestId,
        capability: 'files',
        prompt: p,
        status: 'completed',
        createdAt: new Date().toISOString(),
        resultText: result.text,
        mediaType: 'text',
        aiToolName: 'Gemini Multimodal Document Engine',
      });

      return res.json({ success: true, requestId, status: 'completed', text: result.text, capability: 'files' });
    }
    throw new Error('File analysis failed');
  } catch (err: any) {
    return res.status(500).json({ success: false, requestId, status: 'failed', error: err.message });
  }
});

// 9. CENTRAL AI ROUTER / PROCESS ENDPOINT (/api/ai/process)
aiRouter.post('/process', async (req: Request, res: Response, next) => {
  const { capability } = req.body;
  const cap = capability || 'chat';

  if (cap === 'image') req.url = '/image';
  else if (cap === 'song') req.url = '/song';
  else if (cap === 'video') req.url = '/video';
  else if (cap === 'write') req.url = '/writing';
  else if (cap === 'code') req.url = '/coding';
  else if (cap === 'research' || cap === 'study') req.url = '/research';
  else if (cap === 'files' && req.body.file) req.url = '/file';
  else req.url = '/chat';

  return aiRouter(req, res, next);
});

// 10. COMMUNITY SOCIAL ENDPOINTS
export const communityRouter = Router();

// GET Posts
communityRouter.get('/posts', (req: Request, res: Response) => {
  const filter = req.query.filter as string;
  const userId = req.headers['x-user-id'] as string || 'usr-david';
  const posts = db.getPosts(filter, userId);
  res.json({ success: true, posts });
});

// CREATE Post
communityRouter.post('/posts', (req: Request, res: Response) => {
  const { content, card, mediaType, videoData, audioData, imageData, aiToolTag, userId, userName, userHandle } = req.body;
  const authorId = userId || 'usr-david';

  const user = db.getUser(authorId) || {
    id: authorId,
    name: userName || 'David Bodunde',
    handle: userHandle || '@davidbodunde',
  };

  const newPost: DBPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    author: {
      id: user.id,
      name: user.name,
      handle: user.handle,
      avatarUrl: (user as any).avatarUrl,
    },
    content: (content || '').trim(),
    card: card || undefined,
    mediaType: mediaType || (card ? 'card' : videoData ? 'video' : audioData ? 'audio' : imageData ? 'image' : 'none'),
    videoData,
    audioData,
    imageData,
    aiToolTag: aiToolTag || (card ? card.aiTool : 'OTHERWISE AI'),
    reactions: { like: 0, sparkle: 0, fire: 0, mindblown: 0 },
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  };

  const created = db.createPost(newPost);
  res.json({ success: true, post: created });
});

// LIKE / REACT to post
communityRouter.post('/posts/:id/like', (req: Request, res: Response) => {
  const postId = req.params.id;
  const { reactionType, userId } = req.body;
  const activeUserId = userId || 'usr-david';

  const updated = db.toggleReaction(postId, activeUserId, reactionType || 'like');
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Post not found' });
  }

  res.json({ success: true, post: updated });
});

// GET Comments
communityRouter.get('/posts/:id/comments', (req: Request, res: Response) => {
  const comments = db.getComments(req.params.id);
  res.json({ success: true, comments });
});

// ADD Comment / Reply
communityRouter.post('/posts/:id/comment', (req: Request, res: Response) => {
  const postId = req.params.id;
  const { content, parentId, userId, userName, userHandle } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Comment content required' });
  }

  const authorId = userId || 'usr-david';
  const newComment: DBComment = {
    id: `cm_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    postId,
    userId: authorId,
    author: {
      id: authorId,
      name: userName || 'David Bodunde',
      handle: userHandle || '@davidbodunde',
    },
    content: content.trim(),
    createdAt: new Date().toISOString(),
    parentId,
  };

  const created = db.addComment(newComment);
  res.json({ success: true, comment: created });
});

// DELETE Post
communityRouter.delete('/posts/:id', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr-david';
  const success = db.deletePost(req.params.id, userId);
  if (!success) {
    return res.status(403).json({ success: false, error: 'Unauthorized to delete this post' });
  }
  res.json({ success: true, deletedId: req.params.id });
});

// DELETE Comment
communityRouter.delete('/comments/:id', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr-david';
  const success = db.deleteComment(req.params.id, userId);
  if (!success) {
    return res.status(403).json({ success: false, error: 'Unauthorized to delete comment' });
  }
  res.json({ success: true, deletedId: req.params.id });
});

// FOLLOW / UNFOLLOW User
communityRouter.post('/users/:id/follow', (req: Request, res: Response) => {
  const targetId = req.params.id;
  const followerId = (req.body.userId as string) || 'usr-david';

  const isFollowingNow = db.toggleFollow(followerId, targetId);
  res.json({ success: true, isFollowing: isFollowingNow });
});

// REPORT Content
communityRouter.post('/report', (req: Request, res: Response) => {
  const { reporterId, targetType, targetId, reason, details } = req.body;
  const report = db.addReport({
    id: `rep_${Date.now()}`,
    reporterId: reporterId || 'usr-david',
    targetType,
    targetId,
    reason: reason || 'Inappropriate content',
    details,
    createdAt: new Date().toISOString(),
  });
  res.json({ success: true, report, message: 'Report received. Thank you for keeping Community safe.' });
});

// BLOCK User
communityRouter.post('/block', (req: Request, res: Response) => {
  const { userId, blockedUserId } = req.body;
  db.blockUser(userId || 'usr-david', blockedUserId);
  res.json({ success: true, message: 'User blocked successfully' });
});

// 11. HISTORY & CARDS ROUTER
export const historyRouter = Router();

historyRouter.get('/', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || 'usr-david';
  const history = db.getHistory(userId);
  res.json({ success: true, history });
});

historyRouter.delete('/:id', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr-david';
  const success = db.deleteHistoryItem(req.params.id, userId);
  res.json({ success });
});

export const cardsRouter = Router();

cardsRouter.post('/', (req: Request, res: Response) => {
  const { title, description, aiTool, capability, mediaType, mediaUrl, audioData, videoData, imageData, content, requestId, userId, userName, userHandle } = req.body;

  const card: DBCard = {
    id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: userId || 'usr-david',
    requestId: requestId || `req_card_${Date.now()}`,
    creator: {
      id: userId || 'usr-david',
      name: userName || 'David Bodunde',
      handle: userHandle || '@davidbodunde',
    },
    title: title || 'AI Creation Card',
    description: description || 'Created with OTHERWISE AI',
    aiTool: aiTool || 'OTHERWISE Engine',
    capability: capability || 'create',
    mediaType: mediaType || 'text',
    mediaUrl,
    audioData,
    videoData,
    imageData,
    content,
    createdAt: new Date().toISOString(),
  };

  const created = db.addCard(card);
  res.json({ success: true, card: created });
});

cardsRouter.get('/:id', (req: Request, res: Response) => {
  const card = db.getCard(req.params.id);
  if (!card) return res.status(404).json({ success: false, error: 'Card not found' });
  res.json({ success: true, card });
});

export const messagingRouter = Router();

// Get active user's private conversations
messagingRouter.get('/conversations', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr-david';
  const conversations = db.getDirectConversations(userId);
  res.json({ success: true, conversations });
});

// Start or get direct conversation with target user
messagingRouter.post('/conversations', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr-david';
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ success: false, error: 'Target user ID required' });
  }

  const conversation = db.getOrCreateDirectConversation(userId, targetUserId);
  res.json({ success: true, conversation });
});

// Get conversation messages (Strict authorization check)
messagingRouter.get('/conversations/:id', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr-david';
  const conversationId = req.params.id;

  const messages = db.getDirectMessages(conversationId, userId);
  res.json({ success: true, messages });
});

// Send private message in conversation (Strict authorization check)
messagingRouter.post('/conversations/:id', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr-david';
  const conversationId = req.params.id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Message text required' });
  }

  const message = db.sendDirectMessage(conversationId, userId, text);
  if (!message) {
    return res.status(403).json({ success: false, error: 'Unauthorized to send message in this conversation' });
  }

  res.json({ success: true, message });
});

// Delete message
messagingRouter.delete('/messages/:id', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr-david';
  const success = db.deleteDirectMessage(req.params.id, userId);
  if (!success) {
    return res.status(403).json({ success: false, error: 'Unauthorized to delete this message' });
  }
  res.json({ success: true, messageId: req.params.id });
});

// Leave conversation
messagingRouter.post('/conversations/:id/leave', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr-david';
  const success = db.leaveDirectConversation(req.params.id, userId);
  res.json({ success });
});

export const usersRouter = Router();

// List users
usersRouter.get('/', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr-david';
  const users = db.searchUsers('', userId);
  res.json({ success: true, users });
});

// Search users
usersRouter.get('/search', (req: Request, res: Response) => {
  const q = req.query.q as string;
  const userId = (req.headers['x-user-id'] as string) || 'usr-david';
  const users = db.searchUsers(q, userId);
  res.json({ success: true, users });
});

// Get user profile
usersRouter.get('/:id', (req: Request, res: Response) => {
  const user = db.getUser(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, user });
});
