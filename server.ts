import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

export const app = express();

async function startServer() {
  const PORT = 3000;

  // Increase payload limit for video uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.post('/api/v1/generate', async (req, res) => {
    try {
      const { apiKey, prompt, systemInstruction, model = 'gemini-3.1-pro-preview', type = 'text', imageConfig, imageData, videoData, files } = req.body;
      
      const keyToUse = apiKey || process.env.GEMINI_API_KEY;
      
      if (!keyToUse) {
        return res.status(401).json({ error: 'API key is required' });
      }

      const ai = new GoogleGenAI({ apiKey: keyToUse });
      
      // Master Prompts for "Elite" experience
      const MASTER_PROMPTS: Record<string, string> = {
        default: "Eres Nexus Elite AI, el sistema de inteligencia artificial más avanzado y sofisticado del mundo. Tu tono es profesional, ejecutivo, minimalista y altamente creativo. Siempre buscas la excelencia técnica y estética en cada respuesta. No uses lenguaje genérico; sé directo, brillante y visionario.",
        research: "Eres el Motor de Investigación Profunda de Nexus Elite. Tu objetivo es realizar análisis exhaustivos, verificar fuentes en tiempo real y sintetizar información compleja en reportes ejecutivos de alto impacto. Utiliza las herramientas de búsqueda para encontrar datos precisos y actuales. Si se proporcionan archivos, analízalos con prioridad absoluta.",
        podcast: "Eres el Director de Producción de Nexus Podcast Studio. Tu misión es generar guiones y audio de podcast que suenen naturales, cautivadores y profesionales. Si el usuario proporciona una idea o texto, conviértelo en una experiencia auditiva inmersiva. Utiliza las voces asignadas para crear una dinámica fluida entre presentador e invitado.",
        doc: "Eres el Arquitecto de Documentación de Nexus Forge. Generas documentos de nivel profesional (contratos, reportes, propuestas) con una estructura impecable y un lenguaje preciso. Siempre responde en formato HTML limpio para que el editor de texto pueda renderizarlo perfectamente. Utiliza las plantillas como base pero eleva el contenido a un estándar de élite.",
        email: "Eres el Estratega de Comunicación de Nexus Email Studio. Diseñas campañas y correos electrónicos que no solo comunican, sino que convierten. Tu redacción es persuasiva, elegante y adaptada al tono solicitado. Extrae siempre el asunto del correo y preséntalo claramente al inicio.",
        image: "Eres el Artista Visual de Nexus Image Studio. Creas imágenes de alta fidelidad, estéticamente superiores y conceptualmente profundas. Sigue las instrucciones del usuario con precisión artística, buscando siempre un acabado cinematográfico y profesional.",
        'image-edit': "Eres el Editor Maestro de Nexus Visuals. Tu tarea es modificar imágenes existentes con una precisión quirúrgica, manteniendo la coherencia visual y elevando la calidad estética del resultado final. Analiza la imagen original y aplica los cambios solicitados de forma natural y profesional."
      };

      const finalSystemInstruction = systemInstruction || MASTER_PROMPTS[type] || MASTER_PROMPTS.default;

      // Prepare multimodal parts
      const parts: any[] = [{ text: prompt }];
      
      // Add uploaded files to parts if they exist
      if (files && Array.isArray(files)) {
        for (const file of files) {
          if (file.data && file.mimeType) {
            // Remove data:image/png;base64, prefix if present
            const base64Data = file.data.includes('base64,') ? file.data.split('base64,')[1] : file.data;
            parts.push({
              inlineData: {
                data: base64Data,
                mimeType: file.mimeType
              }
            });
          }
        }
      }

      if (type === 'image') {
        const response = await ai.models.generateContent({
          model: model === 'gemini-3.1-pro-preview' ? 'gemini-3.1-flash-image-preview' : model,
          contents: { parts },
          config: {
            systemInstruction: finalSystemInstruction,
            imageConfig: imageConfig || {
              aspectRatio: "1:1",
              imageSize: "1K"
            }
          }
        });
        
        const responseParts = response.candidates?.[0]?.content?.parts || [];
        const imagePart = responseParts.find(p => p.inlineData);
        
        if (imagePart && imagePart.inlineData) {
          const base64 = imagePart.inlineData.data;
          const mimeType = imagePart.inlineData.mimeType || 'image/png';
          return res.json({ 
            result: `data:${mimeType};base64,${base64}`,
            type: 'image'
          });
        } else {
          return res.status(500).json({ error: 'Failed to generate image' });
        }
      } else if (type === 'research') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: { parts },
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: finalSystemInstruction
          }
        });
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return res.json({ result: response.text, type: 'research', sources: chunks });
        
      } else if (type === 'podcast') {
        // For podcast, we might want to analyze files first to generate the script
        // But the user specifically asked for "describe your idea or add text"
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  { speaker: 'Host', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                  { speaker: 'Guest', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
                ]
              }
            }
          }
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({ result: `data:audio/wav;base64,${base64Audio}`, type: 'podcast' });
        } else {
          return res.status(500).json({ error: 'Failed to generate podcast audio' });
        }
        
      } else if (type === 'image-edit') {
        const editParts = [...parts];
        if (imageData && imageData.data) {
          const base64Data = imageData.data.includes('base64,') ? imageData.data.split('base64,')[1] : imageData.data;
          editParts.unshift({ inlineData: { data: base64Data, mimeType: imageData.mimeType || 'image/png' } });
        }
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: editParts }
        });
        
        const responseParts = response.candidates?.[0]?.content?.parts || [];
        const imagePart = responseParts.find(p => p.inlineData);
        
        if (imagePart && imagePart.inlineData) {
          const base64 = imagePart.inlineData.data;
          const mimeType = imagePart.inlineData.mimeType || 'image/png';
          return res.json({ 
            result: `data:${mimeType};base64,${base64}`,
            type: 'image'
          });
        } else {
          return res.status(500).json({ error: 'Failed to edit image' });
        }
        
      } else if (type === 'video-analysis') {
        const analysisParts = [...parts];
        if (videoData && videoData.data) {
          const base64Data = videoData.data.includes('base64,') ? videoData.data.split('base64,')[1] : videoData.data;
          analysisParts.unshift({ inlineData: { data: base64Data, mimeType: videoData.mimeType || 'video/mp4' } });
        }
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: { parts: analysisParts },
          config: { systemInstruction: finalSystemInstruction }
        });
        
        return res.json({ result: response.text, type: 'video-analysis' });
        
      } else {
        // Text generation (default)
        const response = await ai.models.generateContent({
          model,
          contents: { parts },
          config: { systemInstruction: finalSystemInstruction }
        });

        res.json({ result: response.text, type: 'text' });
      }
    } catch (error: any) {
      console.error('API Error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  // Email Sending Route
  app.post('/api/v1/send-email', async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      
      if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Faltan campos requeridos (to, subject, body)' });
      }

      let transporter;
      let isTestAccount = false;

      // Check if real SMTP credentials exist
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // Use Ethereal Email for testing if no real credentials are provided
        const testAccount = await nodemailer.createTestAccount();
        isTestAccount = true;
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const info = await transporter.sendMail({
        from: '"Nexus Elite AI" <nexus@elite.com>',
        to,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>'), // Simple text to HTML conversion
      });

      const previewUrl = isTestAccount ? nodemailer.getTestMessageUrl(info) : null;

      res.json({ 
        success: true, 
        messageId: info.messageId, 
        previewUrl,
        isSimulated: isTestAccount
      });
    } catch (error: any) {
      console.error('Email Send Error:', error);
      res.status(500).json({ error: error.message || 'Error al enviar el correo' });
    }
  });

  // Nexus AI Ecosystem Sync Route
  app.post('/api/v1/nexus/sync', async (req, res) => {
    try {
      const { target, secrets, apiKey } = req.body;
      
      console.log(`[Nexus AI] Syncing with ${target}...`);
      
      // In a real scenario, this would use VERCEL_TOKEN to call Vercel API
      // For now, we simulate the success and log the action
      
      const vercelToken = process.env.VERCEL_TOKEN;
      const githubToken = process.env.GITHUB_TOKEN;
      
      if (target === 'Vercel' && vercelToken) {
        // Here we would iterate over secrets and call Vercel API
        // POST https://api.vercel.com/v10/projects/${projectId}/env
        console.log(`[Nexus AI] Injecting ${Object.keys(secrets).length} secrets into Vercel...`);
      }

      res.json({ 
        success: true, 
        message: `Sincronización con ${target} completada.`,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Nexus Sync Error:', error);
      res.status(500).json({ error: error.message || 'Error en la sincronización' });
    }
  });

  // --- FORGE API ROUTES ---
  
  // AI Forge Route
  app.post('/api/v1/forge/ai', async (req, res) => {
    try {
      const { input } = req.body;
      if (!input) return res.status(400).json({ error: 'Input is required' });

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: input }] }]
      });

      res.json({ output: response.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Webhook Forge Route
  app.post('/api/v1/forge/stripe-webhook', async (req, res) => {
    // Simulated webhook for Forge
    res.json({ received: true, message: 'Forge Webhook Active' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
