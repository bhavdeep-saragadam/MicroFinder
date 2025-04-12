import { CONFIG } from '../constants/config';

export interface MicrobeAnalysis {
  microbeName: string;
  classification: string;
  confidence: number;
  characteristics: string[];
  description: string;
}

const GEMINI_API_KEY = 'AIzaSyBvFwhiB2F9oA13a5v5pkYdszpcQItL73E';

export async function analyzeMicroscopeImage(base64Image: string): Promise<MicrobeAnalysis> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    console.log('Calling Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "You are a microbiologist analyzing microscope images. Analyze this image and respond ONLY with a JSON object in this exact format, no other text: {\"microbeName\": \"scientific name\", \"classification\": \"type\", \"confidence\": number between 0-1, \"characteristics\": [\"feature1\", \"feature2\"], \"description\": \"brief description\"}"
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }]
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Gemini API error: ${errorData?.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    console.log('Gemini response:', data);

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini');
    }

    const responseText = data.candidates[0].content.parts[0].text.trim()
      .replace(/```json\n?/, '')
      .replace(/```$/, '');
    console.log('Response text:', responseText);

    try {
      const result = JSON.parse(responseText);
      return {
        microbeName: result.microbeName || 'Unknown Microorganism',
        classification: result.classification || 'Unknown',
        confidence: result.confidence || 0.5,
        characteristics: result.characteristics || [],
        description: result.description || 'No description available',
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse Gemini response');
    }
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Analysis took too long. Please try again.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
} 