// File: src/config/anthropic.config.ts

import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Use environment variable for API key
});

// You can add more configuration options here if needed