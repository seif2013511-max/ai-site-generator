async function generateSite() {
    // 1. ربط العناصر بالأسماء الصحيحة الموجودة في ملف index.html
    const promptInput = document.getElementById('promptInput');
    const btn = document.getElementById('generateBtn');
    const iframe = document.getElementById('previewIframe');
    const loader = document.getElementById('loader');
    
    const promptValue = promptInput.value;

    if (!promptValue) {
        alert("من فضلك اكتب وصف للموقع أولاً!");
        return;
    }

    // 2. تجهيز شكل الزرار أثناء التحميل
    btn.disabled = true;
    loader.classList.remove('hidden'); // إظهار الأنميشن
    btn.querySelector('span').innerText = "جاري البناء... 🏗️";

    try {
        // 3. إرسال الطلب للسيرفر (Vercel Function)
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptValue })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "خطأ في السيرفر");
        }

        const data = await response.json();
        
        // 4. عرض الكود الناتج داخل الـ iframe
        if (data.code) {
            iframe.srcdoc = data.code;
        } else {
            throw new Error("لم يتم استلام كود من الذكاء الاصطناعي");
        }

    } catch (e) {
        console.error("Error details:", e);
        alert("فيه مشكلة حصلت: " + e.message);
    } finally {
        // 5. إعادة الزرار لحالته الطبيعية
        btn.disabled = false;
        loader.classList.add('hidden'); // إخفاء الأنميشن
        btn.querySelector('span').innerText = "توليد الموقع الآن ✨";
    }
}

// ربط الوظيفة بالزرار عند الضغط عليه
document.getElementById('generateBtn').addEventListener('click', generateSite);
