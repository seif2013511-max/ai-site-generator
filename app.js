// --- 1. توليد معرف فريد لكل جلسة ---
const sessionId = "nova_" + Math.random().toString(36).substr(2, 9);
let currentGeneratedCode = "";

const DAILY_LIMIT = 20; 
const ALERT_THRESHOLD = 0.8; 

function updateQuotaCounter() {
    const today = new Date().toLocaleDateString();
    let quotaData = JSON.parse(localStorage.getItem('nova_quota')) || { date: today, count: 0 };

    if (quotaData.date !== today) {
        quotaData = { date: today, count: 0 };
    }

    quotaData.count++;
    localStorage.setItem('nova_quota', JSON.stringify(quotaData));
    const remaining = DAILY_LIMIT - quotaData.count;

    if (quotaData.count === Math.floor(DAILY_LIMIT * ALERT_THRESHOLD)) {
        alert(`⚠️ يا سيف! استهلكت 80% من الكوتا (16/20).`);
    }
    console.log(`📊 الكوتا: ${quotaData.count}/${DAILY_LIMIT}`);
}

// --- الدالة الجديدة لتحميل الكود كملف HTML ---
function downloadSite() {
    if (!currentGeneratedCode) {
        alert("ولد الموقع الأول يا سيف! 🚀");
        return;
    }
    // إنشاء ملف وهمي في ذاكرة المتصفح
    const blob = new Blob([currentGeneratedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NovaCore_Project_${sessionId}.html`; // اسم الملف المحمل
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // تنظيف الذاكرة
}

async function generateSite() {
    const promptInput = document.getElementById('promptInput');
    const btn = document.getElementById('generateBtn');
    const iframe = document.getElementById('previewIframe');
    const loader = document.getElementById('loader');
    const openNewTabBtn = document.getElementById('openNewTabBtn');
    const downloadBtn = document.getElementById('downloadBtn'); // الزرار الجديد
    const promptValue = promptInput.value;

    if (!promptValue) {
        alert("من فضلك اكتب وصف للموقع أولاً!");
        return;
    }

    btn.disabled = true;
    loader.classList.remove('hidden');
    btn.querySelector('span').innerText = "جاري البناء... 🏗️";
    
    // إخفاء الأزرار أثناء التحميل الجديد
    if (openNewTabBtn) openNewTabBtn.classList.add('hidden');
    if (downloadBtn) downloadBtn.classList.add('hidden');

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
            updateQuotaCounter();
            currentGeneratedCode = data.code; 
            iframe.srcdoc = data.code; 

            localStorage.setItem(sessionId, data.code);
            
            // إظهار الأزرار بعد نجاح التوليد
            if (openNewTabBtn) openNewTabBtn.classList.remove('hidden');
            if (downloadBtn) downloadBtn.classList.remove('hidden');
        }
    } catch (e) {
        alert("فيه مشكلة حصلت: " + e.message);
    } finally {
        btn.disabled = false;
        loader.classList.add('hidden');
        btn.querySelector('span').innerText = "توليد الموقع الآن ✨";
    }
}

// ربط زر الفتح
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        window.open(`/preview.html?id=${sessionId}`, '_blank');
    });
}

// ربط زر التحميل الجديد
const dlBtn = document.getElementById('downloadBtn');
if (dlBtn) {
    dlBtn.addEventListener('click', downloadSite);
}

document.getElementById('generateBtn').addEventListener('click', generateSite);
