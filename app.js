let currentGeneratedCode = "";
let isCooldownActive = false; 

// دالة العد التنازلي (حائط الصد ضد زحمة الطلبات)
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
            btn.querySelector('span').innerText = "ابدأ بناء مشروعك الآن ✨";
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

    // تجهيز الواجهة للبدء
    btn.disabled = true;
    loader.classList.remove('hidden');
    btn.querySelector('span').innerText = "جاري البناء بواسطة Gemini 3... 🏗️";
    if (openNewTabBtn) openNewTabBtn.classList.add('hidden');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptValue })
        });

        // رادار الأخطاء المطور لنموذج Gemini 3
        if (response.status === 429 || response.status === 503) {
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
            iframe.srcdoc = data.code; 

            // تخزين البيانات للمعاينة والاستقلالية
            localStorage.setItem('nova_preview_code', data.code);
            localStorage.setItem('nova_preview_title', "NovaBuilder 🚀");

            if (openNewTabBtn) {
                openNewTabBtn.classList.remove('hidden');
            }
        } else {
            throw new Error("لم يتم استلام كود، حاول مجدداً.");
        }

    } catch (e) {
        console.error("Error details:", e);
        if (!isCooldownActive) alert("عذراً، حدث خطأ: " + e.message);
    } finally {
        if (!isCooldownActive) {
            btn.disabled = false;
            loader.classList.add('hidden');
            btn.querySelector('span').innerText = "ابدأ بناء مشروعك الآن ✨";
        }
    }
}

// دالة تحميل الكود كملف خارجي (هدية إضافية لمشروعك)
function downloadProject() {
    if (!currentGeneratedCode) return;
    const blob = new Blob([currentGeneratedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NovaBuilder_Project.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// فتح صفحة المعاينة المستقلة
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        const newWin = window.open('/preview.html', '_blank');
        newWin.onload = () => {
            newWin.sessionStorage.setItem('
