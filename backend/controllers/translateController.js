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

module.exports = { translateText }; 