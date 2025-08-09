export class OllamaService {
  constructor() {
    this.endpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'mistral:7b';
  }
  
  async isAvailable() {
    try {
      const response = await fetch(`${this.endpoint}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch (error) {
      console.log('Ollama not available:', error);
      return false;
    }
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            num_predict: options.max_tokens || 500,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'Analysis completed successfully.';
    } catch (error) {
      console.error('Error calling Ollama:', error);
      throw new Error('Failed to generate AI analysis');
    }
  }

  async listModels() {
    try {
      const response = await fetch(`${this.endpoint}/api/tags`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((model) => model.name) || [];
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }
}

export const ollamaService = new OllamaService();