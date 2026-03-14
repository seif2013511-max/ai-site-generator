const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        // السطر ده هو اللي بيخلي المفتاح مخفي وبناديه من Vercel
        const API_KEY = process.env.API_KEY; 

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: `Generate a full professional website code (HTML/Tailwind) for: ${prompt}. Return ONLY the code.` }] }]
        });

        let code = response.data.candidates[0].content.parts[0].text;
        code = code.replace(/```html|```/g, "").trim();

        res.status(200).json({ code: code });
    } catch (err) {
        res.status(500).json({ error: "خطأ في السيرفر أو المفتاح" });
    }
};
