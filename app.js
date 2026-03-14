let currentGeneratedCode = "";

// دالة العد التنازلي الجديدة
function startCooldown(seconds) {
    const btn = document.getElementById('generateBtn');
    const loader = document.getElementById('loader');
    let counter = seconds;

    btn.disabled = true;
    loader.classList.add('hidden'); // إخفاء اللودر لأننا بنعد تنازلي مش بنولد كود

    const interval = setInterval(() => {
        btn.querySelector('span').innerText = `انتظر ${counter} ثانية للراحة... ⏳`;
        counter--;

        if (counter < 0) {
            clearInterval(interval);
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

    if (!promptValue) {
        alert("من فضلك اكتب وصف للموقع أولاً!");
        return;
    }

    // تجهيز الواجهة لبدء التوليد
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

        // --- التعديل هنا لاكتشاف زحمة جوجل ---
        if (response.status === 429 || (data.error && data.error.toLowerCase().includes('quota'))) {
            startCooldown(15); // هينتظر 15 ثانية لو المحاولات خلصت
            return; // نوقف الدالة هنا عشان ميروحش للـ finally يفتح الزرار
        }

        if (!response.ok) {
            throw new Error(data.error || "خطأ في السيرفر");
        }

        if (data.code) {
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
        // نرجع الزرار لأصله "فقط" لو مفيش عد تنازلي شغال
        if (!btn.querySelector('span').innerText.includes('انتظر')) {
            btn.disabled = false;
            loader.classList.add('hidden');
            btn.querySelector('span').innerText = "توليد الموقع الآن ✨";
        }
    }
}

// فتح صفحة المعاينة
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        window.open('/preview.html', '_blank');
    });
}

// ربط وظيفة التوليد بالزر الأساسي
document.getElementById('generateBtn').addEventListener('click', generateSite);
