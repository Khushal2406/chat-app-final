const axios = require("axios");

const translateText = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      console.log("Missing required parameters:", { text, targetLanguage });
      return res.status(400).json({ message: "Text and target language are required" });
    }

    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
      console.error("Google Translate API key is not configured");
      return res.status(500).json({ message: "Translation service is not configured" });
    }

    console.log("Translation request received:", {
      text: text.substring(0, 50) + "...", // Log first 50 chars for privacy
      targetLanguage,
      apiKeyPresent: !!process.env.GOOGLE_TRANSLATE_API_KEY
    });

    // Using Google Cloud Translation API
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: targetLanguage,
      }
    );

    console.log("Translation API response received:", {
      status: response.status,
      hasData: !!response.data,
      hasTranslations: !!response.data?.data?.translations
    });

    if (!response.data.data?.translations?.[0]?.translatedText) {
      console.error("Invalid translation response:", response.data);
      throw new Error("No translation received from API");
    }

    const translatedText = response.data.data.translations[0].translatedText;
    console.log("Translation successful:", {
      originalLength: text.length,
      translatedLength: translatedText.length
    });

    res.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });

    res.status(500).json({ 
      message: "Error translating text",
      error: error.response?.data || error.message 
    });
  }
};

const translateBatch = async (req, res) => {
  try {
    const { texts, targetLanguage } = req.body;

    if (!texts || !Array.isArray(texts) || !targetLanguage) {
      console.log("Missing required parameters:", { texts, targetLanguage });
      return res.status(400).json({ message: "Texts array and target language are required" });
    }

    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
      console.error("Google Translate API key is not configured");
      return res.status(500).json({ message: "Translation service is not configured" });
    }

    console.log("Batch translation request received:", {
      textCount: texts.length,
      targetLanguage,
      apiKeyPresent: !!process.env.GOOGLE_TRANSLATE_API_KEY
    });

    // Using Google Cloud Translation API for batch translation
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: texts,
        target: targetLanguage,
      }
    );

    console.log("Batch translation API response received:", {
      status: response.status,
      hasData: !!response.data,
      hasTranslations: !!response.data?.data?.translations
    });

    if (!response.data.data?.translations) {
      console.error("Invalid batch translation response:", response.data);
      throw new Error("No translations received from API");
    }

    const translations = response.data.data.translations.map(t => t.translatedText);
    console.log("Batch translation successful:", {
      originalCount: texts.length,
      translatedCount: translations.length
    });

    res.json({ translations });
  } catch (error) {
    console.error("Batch translation error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });

    res.status(500).json({ 
      message: "Error translating texts",
      error: error.response?.data || error.message 
    });
  }
};

module.exports = { translateText, translateBatch }; 