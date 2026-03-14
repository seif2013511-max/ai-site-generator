let currentGeneratedCode = "";
let isCooldownActive = false; 

function startCooldown(seconds) {
    const btn = document.getElementById('generateBtn');
    const loader = document.getElementById('loader');
    let counter = seconds;
    isCooldownActive = true;

    btn.disabled = true;
    loader.classList.add('hidden');

    const interval = setInterval(() => {
        btn.querySelector('span').innerText = `جوجل مشغولة.. انتظر ${counter} ثانية ⏳`;
        counter--;

        if (counter < 0) {
            clearInterval(interval);
            isCooldownActive = false;
            btn.disabled = false;
            btn.querySelector('span').innerText = "توليد الموقع الآن ✨";
        }
    }, 1000);
}

async function generateSite() {
    const promptInput = document.getElementById('promptInput');
    const btn = document.getElementById('generateBtn');
    const iframe = document.getElementById('previewIframe');
    const loader = document.getElementById('loader');
    const openNewTabBtn = document.getElementById('openNewTabBtn');
    
    const promptValue = promptInput.value;

    if (!promptValue || isCooldownActive) return;

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

        const data = await response.json();

        if (response.status === 429 || (data.error && data.error.toLowerCase().includes('quota'))) {
            startCooldown(30); 
            return; 
        }

        if (!response.ok) {
            throw new Error(data.error || "خطأ في السيرفر");
        }

        if (data.code) {
            currentGeneratedCode = data.code; 
            iframe.srcdoc = data.code; 

            // بنشيل الـ LocalStorage هنا لأننا هنستخدم طريقة "الإرسال المباشر" للنافذة
            if (openNewTabBtn) {
                openNewTabBtn.classList.remove('hidden');
            }
        } else {
            throw new Error("لم يتم استلام كود من الذكاء الاصطناعي");
        }

    } catch (e) {
        console.error("Error details:", e);
        if (!isCooldownActive) alert("فيه مشكلة حصلت: " + e.message);
    } finally {
        if (!isCooldownActive) {
            btn.disabled = false;
            loader.classList.add('hidden');
            btn.querySelector('span').innerText = "توليد الموقع الآن ✨";
        }
    }
}

// --- التعديل السحري هنا ---
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        // بدلاً من فتح صفحة preview.html، هنفتح نافذة ونحقن فيها الكود فوراً
        const newWindow = window.open('', '_blank');
        newWindow.document.write(currentGeneratedCode);
        newWindow.document.title = "NovaBuilder Preview 🚀";
        newWindow.document.close(); // مهم جداً عشان المتصفح يفهم إن الصفحة خلصت
    });
}

document.getElementById('generateBtn').addEventListener('click', generateSite);
