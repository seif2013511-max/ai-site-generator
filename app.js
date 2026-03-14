async function generateSite() {
    const prompt = document.getElementById('userPrompt').value;
    const btn = document.getElementById('genBtn');
    const iframe = document.getElementById('preview');
    
    btn.disabled = true;
    btn.innerText = "جاري البناء... 🏗️";

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`سيرفر Vercel وقع: ${errorText}`);
        }

        const data = await response.json();
        iframe.srcdoc = data.code;

    } catch (e) {
        alert("فيه مشكلة: " + e.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "توليد الموقع الآن ✨";
    }
}
