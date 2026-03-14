const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        const API_KEY = process.env.API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "API_KEY is missing in Vercel settings" });
        }

        // استخدام نموذج gemini-1.5-flash اللي أنت لسه سائل عليه وشغال
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: `صمم صفحة ويب كاملة بـ HTML و Tailwind CSS بناءً على الوصف التالي: "${prompt}". اكتب الكود فقط بدون مقدمات.` }] }]
        });

        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            let code = response.data.candidates[0].content.parts[0].text;
            code = code.replace(/```html|```/g, "").trim();
            return res.status(200).json({ code: code });
        } else {
            return res.status(500).json({ error: "النموذج لم يرسل كوداً صحيحاً" });
        }
    } catch (err) {
        console.error("Error details:", err.response ? err.response.data : err.message);
        return res.status(500).json({ error: "فشل الاتصال بجوجل: " + (err.response ? err.response.data.error.message : err.message) });
    }
};
