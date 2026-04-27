// --- 1. متغيرات الجلسة ---
let currentGeneratedCode = "";
// شلنا sessionId القديم من هنا عشان ميبقاش ثابت

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
    
    if (quotaData.count === Math.floor(DAILY_LIMIT * ALERT_THRESHOLD)) {
        alert(`⚠️ يا سيف! استهلكت 80% من الكوتا (16/20).`);
    }
    console.log(`📊 الكوتا: ${quotaData.count}/${DAILY_LIMIT}`);
}

// --- الدالة المحسنة لتحميل الكود كملف HTML ---
function downloadSite() {
    if (!currentGeneratedCode) {
        alert("ولد الموقع الأول يا سيف! 🚀");
        return;
    }
    // توليد اسم ملف فريد وقت التحميل
    const fileId = Math.random().toString(36).substr(2, 5);
    const blob = new Blob([currentGeneratedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NovaCore_Project_${fileId}.html`; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function generateSite() {
    const promptInput = document.getElementById('promptInput');
    const btn = document.getElementById('generateBtn');
    const iframe = document.getElementById('previewIframe');
    const loader = document.getElementById('loader');
    const openNewTabBtn = document.getElementById('openNewTabBtn');
    const downloadBtn = document.getElementById('downloadBtn'); 
    const promptValue = promptInput.value;

    if (!promptValue) {
        alert("من فضلك اكتب وصف للموقع أولاً!");
        return;
    }

    btn.disabled = true;
    loader.classList.remove('hidden');
    btn.querySelector('span').innerText = "جاري البناء... 🏗️";
    
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
            
            // --- التعديل الجوهري هنا يا سيف ---
            // توليد ID جديد "خاص بهذا الموقع فقط"
            const newSiteId = "nova_" + Math.random().toString(36).substr(2, 9);
            
            currentGeneratedCode = data.code; 
            iframe.srcdoc = data.code; 

            // حفظ الكود بالـ ID الجديد عشان الرابط يفتح تصميم مختلف
            localStorage.setItem(newSiteId, data.code);
            
            // تحديث زرار "الفتح في نافذة جديدة" بالـ ID الجديد
            if (openNewTabBtn) {
                openNewTabBtn.onclick = () => {
                    window.open(`/preview.html?id=${newSiteId}`, '_blank');
                };
                openNewTabBtn.classList.remove('hidden');
            }
            
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

// ربط زر التحميل
const dlBtn = document.getElementById('downloadBtn');
if (dlBtn) {
    dlBtn.addEventListener('click', downloadSite);
}

document.getElementById('generateBtn').addEventListener('click', generateSite);
