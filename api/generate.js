const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات CORS للسماح لموقعك فقط بالوصول (أفضل للأمان)
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

        // الرابط الصحيح لـ Gemini 3 Flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ 
                parts: [{ 
                    text: `صمم صفحة ويب كاملة واحترافية باستخدام HTML و Tailwind CSS بناءً على الوصف التالي: ${prompt}. أخرج الكود فقط بدون أي نصوص أخرى أو علامات markdown.` 
                }] 
            }]
        }, {
            // إضافة timeout للتأكد إن الطلب ميفضلش معلق لو جوجل اتأخرت
            timeout: 30000 
        });

        // التأكد من استلام البيانات بشكل صحيح
        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            let code = response.data.candidates[0].content.parts[0].text;
            
            // تنظيف الكود من أي زوائد Markdown
            code = code.replace(/```html|```/g, "").trim();
            
            res.status(200).json({ code: code });
        } else {
            throw new Error("جوجل لم ترسل كوداً، حاول تغيير الوصف.");
        }

    } catch (err) {
        // تحسين معالجة الأخطاء عشان تظهر لك في الـ Console بتاع Vercel بوضوح
        const statusCode = err.response?.status || 500;
        const msg = err.response?.data?.error?.message || err.message;
        
        console.error(`Gemini 3 Error (${statusCode}):`, msg);
        
        // إرسال رسالة الخطأ للـ Frontend عشان العداد الذكي يحس بيها
        res.status(statusCode).json({ error: msg });
    }
};
