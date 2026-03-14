const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات الـ CORS عشان المتصفح ميعملش بلوك
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        const API_KEY = process.env.API_KEY;

        // الرابط المباشر لجوجل جيمناي
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: `صمم صفحة ويب كاملة (HTML و Tailwind CSS) لـ: "${prompt}". اكتب الكود فقط بدون أي شرح.` }] }]
        });

        // سحب الكود وتنظيفه
        let code = response.data.candidates[0].content.parts[0].text;
        code = code.replace(/```html|```/g, "").trim();

        res.status(200).json({ code: code });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "خطأ في الاتصال بالذكاء الاصطناعي" });
    }
};
