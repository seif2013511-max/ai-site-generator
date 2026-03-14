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
        const { prompt } = req.body;
        // تعديل لقراءة المفتاح سواء كان حروف كبيرة أو صغيرة للاحتياط
        const API_KEY = process.env.API_KEY || process.env.api_key;

        if (!API_KEY) {
            return res.status(500).json({ error: "المفتاح (API Key) غير موجود في إعدادات Vercel" });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await axios.post(url, {
            contents: [{ 
                parts: [{ 
                    text: `صمم صفحة ويب احترافية كاملة ومستجيبة باستخدام HTML و Tailwind CSS فقط بناءً على: ${prompt}. ابدأ الكود بـ <!DOCTYPE html> وأنهه بـ </html>. لا تكتب أي نصوص شرحية، أريد الكود فقط.` 
                }] 
            }]
        });

        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            let code = response.data.candidates[0].content.parts[0].text;
            // تنظيف الكود من علامات Markdown بشكل أدق
            code = code.replace(/```html|```/g, "").trim();
            return res.status(200).json({ code: code });
        } else {
            throw new Error("جوجل أرسلت رداً فارغاً، جرب وصفاً آخر");
        }

    } catch (err) {
        // استخراج رسالة الخطأ الحقيقية من جوجل
        const errorMessage = err.response?.data?.error?.message || err.message;
        console.error("Gemini API Error:", errorMessage);
        
        res.status(500).json({ 
            error: `فشل التوليد: ${errorMessage}`,
            suggestion: "تأكد من أن المفتاح مفعل وأنك لم تتجاوز حد الاستخدام المجاني."
        });
    }
};
