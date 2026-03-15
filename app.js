let currentGeneratedCode = "";

// --- إعدادات العداد الذكي بناءً على كوتا Gemini 3 Flash ---
const DAILY_LIMIT = 20; // الحد اليومي بتاعك هو 20 طلب
const ALERT_THRESHOLD = 0.8; // تنبيه عند 80% (يعني لما يوصل لـ 16 طلب)

function updateQuotaCounter() {
    const today = new Date().toLocaleDateString();
    // بنسحب البيانات من localStorage أو بنبدأ من جديد لو مفيش
    let quotaData = JSON.parse(localStorage.getItem('nova_quota')) || { date: today, count: 0 };

    // لو التاريخ اتغير (يوم جديد)، بنصفر العداد تلقائياً
    if (quotaData.date !== today) {
        quotaData = { date: today, count: 0 };
    }

    quotaData.count++;
    localStorage.setItem('nova_quota', JSON.stringify(quotaData));

    // حساب الطلبات الفاضلة
    const remaining = DAILY_LIMIT - quotaData.count;

    // 1. تنبيه الـ 80% (يظهر مرة واحدة عند الطلب رقم 16)
    if (quotaData.count === Math.floor(DAILY_LIMIT * ALERT_THRESHOLD)) {
        alert(`⚠️ يا سيف! أنت استهلكت 80% من الكوتا (16/20). فاضل لك 4 طلبات بس النهاردة!`);
    }

    // 2. تنبيه لو الكوتا خلصت خالص
    if (quotaData.count >= DAILY_LIMIT) {
        alert("🚨 الكوتا خلصت يا بطل! استنى لبكرة أو غير الـ API Key.");
    }

    console.log(`📊 استهلاك الكوتا: ${quotaData.count}/${DAILY_LIMIT} | المتبقي: ${remaining}`);
}
// --------------------------------------------------------

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
            // تحديث العداد فور نجاح الطلب
            updateQuotaCounter();

            currentGeneratedCode = data.code; 
            iframe.srcdoc = data.code; 

            localStorage.setItem('nova_preview_code', data.code);
            localStorage.setItem('nova_preview_title', "NovaBuilder 🚀");

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

const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        window.open('/preview.html', '_blank');
    });
}

document.getElementById('generateBtn').addEventListener('click', generateSite);
