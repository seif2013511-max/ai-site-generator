let currentGeneratedCode = "";
let isCooldownActive = false; 

// دالة العد التنازلي
function startCooldown(seconds) {
    const btn = document.getElementById('generateBtn');
    const loader = document.getElementById('loader');
    let counter = seconds;
    isCooldownActive = true;

    if (btn) btn.disabled = true;
    if (loader) loader.classList.add('hidden');

    const interval = setInterval(() => {
        if (btn) btn.querySelector('span').innerText = `جوجل مشغولة.. انتظر ${counter} ثانية ⏳`;
        counter--;

        if (counter < 0) {
            clearInterval(interval);
            isCooldownActive = false;
            if (btn) {
                btn.disabled = false;
                btn.querySelector('span').innerText = "ابدأ بناء مشروعك الآن ✨";
            }
        }
    }, 1000);
}

async function generateSite() {
    const promptInput = document.getElementById('promptInput');
    const btn = document.getElementById('generateBtn');
    const iframe = document.getElementById('previewIframe');
    const loader = document.getElementById('loader');
    const openNewTabBtn = document.getElementById('openNewTabBtn');
    
    if (!promptInput || !btn) return; // حماية في حال عدم وجود العناصر

    const promptValue = promptInput.value;

    if (!promptValue || isCooldownActive) return;

    btn.disabled = true;
    if (loader) loader.classList.remove('hidden');
    btn.querySelector('span').innerText = "جاري البناء... 🏗️";
    
    if (openNewTabBtn) openNewTabBtn.classList.add('hidden');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptValue })
        });

        // لقط الأخطاء لتشغيل العداد
        if (response.status === 429) {
            startCooldown(30); 
            return; 
        }

        const data = await response.json();

        if (!response.ok || (data.error && data.error.toLowerCase().includes('quota'))) {
            startCooldown(30); 
            return; 
        }

        if (data.code) {
            currentGeneratedCode = data.code; 
            if (iframe) iframe.srcdoc = data.code; 

            localStorage.setItem('nova_preview_code', data.code);
            localStorage.setItem('nova_preview_title', "NovaBuilder 🚀");

            if (openNewTabBtn) openNewTabBtn.classList.remove('hidden');
        }

    } catch (e) {
        console.error("Error details:", e);
        if (!isCooldownActive) alert("حدث خطأ: " + e.message);
    } finally {
        if (!isCooldownActive) {
            btn.disabled = false;
            if (loader) loader.classList.add('hidden');
            btn.querySelector('span').innerText = "ابدأ بناء مشروعك الآن ✨";
        }
    }
}

// تأكد من أن الـ ID هنا هو 'generateBtn' كما في ملف الـ HTML الخاص بك
const mainBtn = document.getElementById('generateBtn');
if (mainBtn) {
    mainBtn.addEventListener('click', generateSite);
}

// زر المعاينة المستقلة
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        const newWin = window.open('/preview.html', '_blank');
        newWin.onload = () => {
            newWin.sessionStorage.setItem('current_page_code', currentGeneratedCode);
        };
    });
}
