const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { prompt, image } = req.body;
        const API_KEY = process.env.API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "API Key is missing" });
        }

        // رجعنا للموديل اللي كان شغال معاك في الـ AI Studio بس ضفنا دعم الصور
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
        
        let parts = [{ 
            text: `صمم صفحة ويب كاملة واحترافية باستخدام HTML و Tailwind CSS بناءً على الوصف التالي: ${prompt || 'صمم موقع احترافي'}. أخرج الكود فقط بدون أي نصوص أخرى أو علامات markdown.` 
        }];

        // إضافة الصورة لو وجدت
        if (image) {
            parts.push({
                inlineData: {
                    mimeType: "image/png",
                    data: image
                }
            });
        }
        
        const response = await axios.post(url, {
            contents: [{ parts: parts }]
        }, {
            timeout: 30000 
        });

        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            let code = response.data.candidates[0].content.parts[0].text;
            code = code.replace(/```html|```/g, "").trim();
            res.status(200).json({ code: code });
        } else {
            throw new Error("جوجل لم ترسل كوداً.");
        }

    } catch (err) {
        const statusCode = err.response?.status || 500;
        const msg = err.response?.data?.error?.message || err.message;
        console.error(`Error:`, msg);
        res.status(statusCode).json({ error: msg });
    }
};
