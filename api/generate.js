const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { prompt } = req.body;
        // هنا السيرفر بيسحب المفتاح اللي أنت لسه حاطه في إعدادات Vercel
        const API_KEY = process.env.API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "API Key is missing in Vercel settings" });
        }

        // استخدام Gemini 1.5 Flash لأنه الأكثر استقراراً للمهام البرمجية
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ 
                parts: [{ 
                    text: `صمم صفحة ويب كاملة واحترافية باستخدام HTML و Tailwind CSS بناءً على الوصف التالي: ${prompt}. أخرج الكود فقط بدون أي نصوص أخرى أو علامات markdown.` 
                }] 
            }]
        });

        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            let code = response.data.candidates[0].content.parts[0].text;
            
            // تنظيف الكود من علامات مارك داون لضمان اشتغال المعاينة فوراً
            code = code.replace(/```html|```/g, "").trim();
            res.status(200).json({ code: code });
        } else {
            throw new Error("جوجل لم ترسل كوداً، حاول تغيير الوصف.");
        }

    } catch (err) {
        // لقط كود الخطأ (مثل 429 للزحمة) لإرساله لملف app.js
        const statusCode = err.response?.status || 500;
        const msg = err.response?.data?.error?.message || err.message;
        
        console.error(`Gemini Error (${statusCode}):`, msg);
        
        // إرجاع الحالة الحقيقية لتفعيل العداد التنازلي في الواجهة
        res.status(statusCode).json({ error: msg });
    }
};
