const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        const API_KEY = process.env.API_KEY;

        if (!API_KEY) throw new Error("API_KEY_MISSING");

        // استخدام Gemini 1.5 Flash (اللي هو الموديل اللي ورا Gemini 3 Preview)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: `Generate a full single-page website using HTML and Tailwind CSS for: ${prompt}. Return ONLY the code.` }] }]
        }, { timeout: 15000 }); // مهلة 15 ثانية

        const code = response.data.candidates[0].content.parts[0].text.replace(/```html|```/g, "").trim();
        res.status(200).json({ code });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || "Internal Server Error" });
    }
};
