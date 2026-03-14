const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات السماح بمرور البيانات
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        const API_KEY = process.env.API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "المفتاح API_KEY مش موجود في إعدادات Vercel" });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: `صمم صفحة ويب كاملة (HTML و Tailwind CSS) بناءً على الوصف التالي: "${prompt}". اكتب الكود فقط بدون مقدمات أو شرح، وابدأ بـ <!DOCTYPE html>.` }] }]
        });

        if (response.data && response.data.candidates) {
            let code = response.data.candidates[0].content.parts[0].text;
            // تنظيف الكود من أي علامات Markdown
            code = code.replace(/```html|```/g, "").trim();
            return res.status(200).json({ code: code });
        } else {
            return res.status(500).json({ error: "فشل الذكاء الاصطناعي في الرد" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "حدث خطأ في الاتصال بجوجل" });
    }
};
