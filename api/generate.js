const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // بنستلم الـ prompt والـ image من req.body
        const { prompt, image } = req.body;
        const API_KEY = process.env.API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "API Key is missing in Vercel settings" });
        }

        // الرابط الصحيح لـ Gemini 1.5 Flash (الأفضل حالياً للصور والأكواد)
        // ملاحظة: موديل Gemini 3 Flash اللي في الصورة عندك بيستخدم نفس الهيكل ده
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        // تجهيز الـ parts
        let parts = [{ 
            text: `صمم صفحة ويب كاملة واحترافية باستخدام HTML و Tailwind CSS بناءً على الوصف التالي: ${prompt || 'صمم موقع احترافي'}. أخرج الكود فقط بدون أي نصوص أخرى أو علامات markdown.` 
        }];

        // لو فيه صورة مبعوثة، بنضيفها كـ inlineData عشان Gemini يشوفها
        if (image) {
            parts.push({
                inlineData: {
                    mimeType: "image/png", // أو الـ type المناسب
                    data: image // كود الـ Base64 اللي جاي من app.js
                }
            });
        }
        
        const response = await axios.post(url, {
            contents: [{ parts: parts }]
        }, {
            timeout: 30000 
        });

        // التأكد من استلام البيانات
        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            let code = response.data.candidates[0].content.parts[0].text;
            
            // تنظيف الكود من Markdown
            code = code.replace(/```html|```/g, "").trim();
            
            res.status(200).json({ code: code });
        } else {
            throw new Error("جوجل لم ترسل كوداً، حاول تغيير الوصف أو الصورة.");
        }

    } catch (err) {
        const statusCode = err.response?.status || 500;
        const msg = err.response?.data?.error?.message || err.message;
        
        console.error(`Gemini API Error (${statusCode}):`, msg);
        res.status(statusCode).json({ error: msg });
    }
};
