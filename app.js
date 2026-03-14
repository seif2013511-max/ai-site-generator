async function generateSite() {
    const prompt = document.getElementById('userPrompt').value.trim();
    const btn = document.getElementById('genBtn');
    const iframe = document.getElementById('preview');
    
    if (!prompt) {
        alert("اكتب وصف للموقع الأول يا سيف!");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = "جاري البناء... 🏗️";

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();

        if (data.code) {
            iframe.srcdoc = data.code;
        } else {
            alert("السيرفر رد بس مفيش كود: " + (data.error || "خطأ غير معروف"));
        }
    } catch (error) {
        console.error(error);
        alert("فشل الاتصال بالسيرفر، تأكد من إعدادات Vercel");
    } finally {
        btn.disabled = false;
        btn.innerHTML = "توليد الموقع الآن ✨";
    }
}
