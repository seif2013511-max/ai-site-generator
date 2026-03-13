async function generateSite() {
    const prompt = document.getElementById('userPrompt').value.trim();
    const btn = document.getElementById('genBtn');
    const iframe = document.getElementById('preview');
    const status = document.getElementById('status');
    const shareLinkDiv = document.getElementById('shareLink');
    const siteLinkAnchor = document.getElementById('siteLink');

    if (!prompt) {
        alert("اكتب وصف الأول يا سيف!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "جاري البناء... 🏗️";
    status.classList.remove('hidden');
    shareLinkDiv.classList.add('hidden');

    try {
        // --- التعديل السحري هنا ---
        // السطر ده بيقول للمتصفح: لو أنا شغال على جهازي كلم بورت 4000، 
        // ولو أنا أونلاين كلم السيرفر اللي أنا مرفوع عليه مباشرة
        const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:4000/api/generate'
            : '/api/generate';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        // -------------------------

        const data = await response.json();
        
        if (data.code) {
            let cleanCode = data.code.replace(/```html|```/g, "").trim();
            iframe.srcdoc = cleanCode;

            const blob = new Blob([cleanCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            if (shareLinkDiv && siteLinkAnchor) {
                siteLinkAnchor.href = url;
                shareLinkDiv.classList.remove('hidden');
            }
        } else if (data.error) {
            alert("خطأ من جوجل: " + data.error);
        } else {
            alert("السيرفر رد بس مفيش كود! جرب وصف تاني.");
        }
    } catch (e) {
        console.error(e);
        alert("فشل الاتصال بالسيرفر. تأكد من تشغيل السيرفر أونلاين أو محلياً.");
    } finally {
        btn.disabled = false;
        btn.innerText = "توليد الموقع الآن ✨";
        status.classList.add('hidden');
    }
}