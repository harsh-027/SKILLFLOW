const Groq = require("groq-sdk");

let groqClient;

function hasGroqConfig() {
  return Boolean(process.env.GROQ_API_KEY);
}

function getGroqModel() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

function getGroqClient() {
  if (!hasGroqConfig()) {
    return null;
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      maxRetries: 2,
      timeout: 20000,
    });
  }

  return groqClient;
}

module.exports = {
  getGroqClient,
  getGroqModel,
  hasGroqConfig,
};
