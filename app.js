// --- 1. توليد معرف فريد لكل جلسة عشان المشاريع متدخلش في بعضها ---
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
            updateQuotaCounter();
            currentGeneratedCode = data.code; 
            iframe.srcdoc = data.code; 

            // --- 2. التخزين باستخدام المعرف الفريد للجلسة الحالية فقط ---
            localStorage.setItem(sessionId, data.code);
            
            if (openNewTabBtn) {
                openNewTabBtn.classList.remove('hidden');
            }
        }
    } catch (e) {
        alert("فيه مشكلة حصلت: " + e.message);
    } finally {
        btn.disabled = false;
        loader.classList.add('hidden');
        btn.querySelector('span').innerText = "توليد الموقع الآن ✨";
    }
}

// --- 3. تعديل زر الفتح عشان يبعت الـ ID في الرابط ---
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        // بنفتح صفحة المعاينة وبنبعتلها الـ ID بتاع المشروع ده مخصوص
        window.open(`/preview.html?id=${sessionId}`, '_blank');
    });
}

document.getElementById('generateBtn').addEventListener('click', generateSite);
