const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات الـ Header لضمان قبول البيانات
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        // هنا بننادي المفتاح اللي أنت لسه موريهولي في الصورة
        const API_KEY = process.env.API_KEY;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: `Write only pure HTML and Tailwind CSS code for: ${prompt}. No explanations.` }] }]
        });

        if (response.data && response.data.candidates) {
            let code = response.data.candidates[0].content.parts[0].text;
            code = code.replace(/```html|```/g, "").trim();
            return res.status(200).json({ code });
        } else {
            return res.status(500).json({ error: "Gemini error" });
        }
    } catch (err) {
        // ده هيطبع لك الخطأ الحقيقي في الـ Vercel Logs عشان نعرف فيه إيه
        return res.status(500).json({ error: err.message });
    }
};
