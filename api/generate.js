async function generateSite() {
    const prompt = document.getElementById('userPrompt').value.trim();
    const btn = document.getElementById('genBtn');
    const iframe = document.getElementById('preview');
    
    if (!prompt) return alert("اكتب وصف الأول!");

    btn.disabled = true;
    btn.innerText = "جاري البناء... 🏗️";

    try {
        // نكلم الرابط النسبي عشان يشتغل على Vercel صح
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();
        if (data.code) {
            iframe.srcdoc = data.code;
        } else {
            alert("خطأ: " + (data.error || "فشل التوليد"));
        }
    } catch (e) {
        console.error(e);
        alert("تأكد من إعدادات Vercel و API_KEY");
    } finally {
        btn.disabled = false;
        btn.innerText = "توليد الموقع الآن ✨";
    }
}
