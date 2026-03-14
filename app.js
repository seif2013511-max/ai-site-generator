let currentGeneratedCode = "";

async function generateSite() {
    const promptInput = document.getElementById('promptInput');
    const btn = document.getElementById('generateBtn');
    const iframe = document.getElementById('previewIframe');
    const loader = document.getElementById('loader');
    const openNewTabBtn = document.getElementById('openNewTabBtn');
    
    const promptValue = promptInput.value;

    if (!promptValue) {
        alert("من فضلك اكتب وصف للموقع أولاً!");
        return;
    }

    btn.disabled = true;
    loader.classList.remove('hidden');
    btn.querySelector('span').innerText = "جاري البناء... 🏗️";
    
    if (openNewTabBtn) openNewTabBtn.classList.add('hidden');

    try {
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
        
        if (data.code) {
            currentGeneratedCode = data.code; 
            iframe.srcdoc = data.code; 

            // تخزين الكود فوراً في متصفح المستخدم
            localStorage.setItem('nova_preview_code', data.code);

            if (openNewTabBtn) {
                openNewTabBtn.classList.remove('hidden');
            }
        } else {
            throw new Error("لم يتم استلام كود من الذكاء الاصطناعي");
        }

    } catch (e) {
        console.error("Error details:", e);
        alert("فيه مشكلة حصلت: " + e.message);
    } finally {
        btn.disabled = false;
        loader.classList.add('hidden');
        btn.querySelector('span').innerText = "توليد الموقع الآن ✨";
    }
}

// التعديل الجوهري لفتح صفحة مستقلة تماماً
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        if (currentGeneratedCode) {
            // هنفتح ملف اسمه preview.html إحنا هنكريه دلوقتي
            window.open('/preview.html', '_blank');
        }
    });
}

document.getElementById('generateBtn').addEventListener('click', generateSite);
