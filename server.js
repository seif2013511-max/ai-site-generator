const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// المفتاح الخاص بك
const API_KEY = "AIzaSyC9wAfiOYZMMVcNAxVOi9S5rT6Fa2Jh8bs";

app.post('/api/generate', async (req, res) => {
    try {
        // استخدام موديل Gemini 3 Flash Preview كما طلبت
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
        
        console.log("📤 جاري معالجة الطلب عبر الموديل السحابي...");

        const response = await axios.post(url, {
            contents: [{
                parts: [{ text: `صمم صفحة ويب HTML و Tailwind CSS كاملة لـ: "${req.body.prompt}". اكتب الكود فقط بدون أي شرح، وابدأ بـ <!DOCTYPE html>.` }]
            }]
        });

        if (response.data && response.data.candidates) {
            let code = response.data.candidates[0].content.parts[0].text;
            // تنظيف الكود لضمان المعاينة السليمة
            code = code.replace(/```html|```/g, "").trim();
            res.json({ code: code });
        } else {
            res.status(500).json({ error: "جوجل لم يرسل الكود المطلوب" });
        }
    } catch (err) {
        console.log("--- خطأ جوجل ---");
        console.log(err.response ? err.response.data : err.message);
        
        // التعامل مع زحمة المحاولات (Quota)
        if (err.response && err.response.status === 429) {
            return res.status(429).json({ error: "تجاوزت حد المحاولات المسموح به، انتظر دقيقة وجرب ثانية." });
        }
        
        res.status(500).json({ error: "فشل الاتصال بجوجل" });
    }
});

// تأكيد مسار الصفحة الرئيسية للرفع
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// التعديل المهم: قبول البورت الديناميكي من السيرفر السحابي
const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\x1b[32m✅ السيرفر جاهز للعمل للأبد!\x1b[0m`);
    console.log(`\x1b[36m🔗 البورت الحالي: ${PORT}\x1b[0m`);
});