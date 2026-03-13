async function generateSite() {
    const prompt = document.getElementById('userPrompt').value.trim();
    const btn = document.getElementById('genBtn');
    const iframe = document.getElementById('preview');
    const status = document.getElementById('status');
    
    if (!prompt) {
        alert("من فضلك اكتب وصف الموقع أولاً!");
        return;
    }

    // تجهيز الواجهة
    btn.disabled = true;
    btn.innerHTML = "جاري البناء... 🏗️";
    status.innerHTML = `<div class="flex items-center justify-center space-x-2 text-blue-600">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>جاري التصميم.. من فضلك انتظر</span>
    </div>`;

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();

        if (response.ok && data.code) {
            iframe.srcdoc = data.code;
            status.innerHTML = `<span class="text-green-600">✅ تم توليد الموقع بنجاح!</span>`;
        } else {
            throw new Error(data.error || "فشل في الحصول على الكود");
        }
    } catch (error) {
        console.error("Error details:", error);
        status.innerHTML = `<span class="text-red-600">❌ فشل الاتصال بالسيرفر. تأكد من إعدادات API_KEY</span>`;
        alert("حدث خطأ: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = "توليد الموقع الآن ✨";
    }
}
