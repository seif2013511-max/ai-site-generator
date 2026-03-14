const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات CORS لضمان عمل الموقع
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        // هنا بننادي المفتاح اللي سميناه API_KEY في فيرسيل
        const API_KEY = process.env.API_KEY; 

        if (!API_KEY) {
            return res.status(500).json({ error: "المفتاح مفقود في إعدادات Vercel" });
        }

        // استخدام Gemini 1.5 Flash (المحرك لـ Gemini 3 Preview)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: `صمم صفحة ويب كاملة (HTML و Tailwind CSS) لـ: "${prompt}". اكتب الكود فقط.` }] }]
        });

        let code = response.data.candidates[0].content.parts[0].text;
        code = code.replace(/```html|```/g, "").trim();

        res.status(200).json({ code: code });
    } catch (err) {
        res.status(500).json({ error: "فشل الاتصال: تأكد من تفعيل API في جوجل" });
    }
};
