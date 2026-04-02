/**
 * Nexus AI Ecosystem API Client
 * This client handles communication with other systems in the Nexus AI ecosystem.
 */

export class NexusAIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = '/api/v1/nexus') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Inject secrets into another system
   */
  async injectSecrets(targetSystem: string, secrets: Record<string, string>) {
    try {
      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: targetSystem,
          secrets: secrets,
          apiKey: this.apiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to inject secrets: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Nexus AI Injection Error:', error);
      throw error;
    }
  }
}
