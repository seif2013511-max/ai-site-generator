const axios = require('axios');

// لازم نستخدم module.exports عشان Vercel يتعرف على الوظيفة
module.exports = async (req, res) => {
    // إعدادات السماح بالاتصال (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { prompt } = req.body;
        const API_KEY = process.env.API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "API Key is missing in Vercel settings" });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: `صمم صفحة ويب كاملة باستخدام HTML و Tailwind CSS بناءً على الوصف التالي: ${prompt}. أخرج الكود فقط بدون أي نصوص أخرى.` }] }]
        });

        if (response.data && response.data.candidates) {
            let code = response.data.candidates[0].content.parts[0].text;
            // تنظيف الكود من علامات markdown لو وجدت
            code = code.replace(/```html|```/g, "").trim();
            res.status(200).json({ code: code });
        } else {
            throw new Error("Invalid response from Gemini API");
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ في توليد الكود، تأكد من إعدادات الـ API" });
    }
};
