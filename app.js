let currentGeneratedCode = "";
let isCooldownActive = false; 

// دالة العد التنازلي المطورة
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

        // التعديل هنا: بنلقط الـ 429 والـ 500 وأي quota عشان نشغل العداد فوراً
        if (!response.ok || response.status === 429 || (data.error && data.error.toLowerCase().includes('quota'))) {
            startCooldown(30); 
            return; 
        }

        if (data.code) {
            currentGeneratedCode = data.code; 
            iframe.srcdoc = data.code; 

            // تخزين الكود للنافذة اللي هتفتح (مهم للمعاينة)
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
        if (!isCooldownActive) alert("فيه مشكلة حصلت: " + e.message);
    } finally {
        if (!isCooldownActive) {
            btn.disabled = false;
            loader.classList.add('hidden');
            btn.querySelector('span').innerText = "توليد الموقع الآن ✨";
        }
    }
}

// فتح صفحة المعاينة (دعم المشاريع اللانهائية)
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        const newWin = window.open('/preview.html', '_blank');
        
        // ده السطر اللي بيخلي كل نافذة مستقلة "بالكود بتاعها"
        newWin.onload = () => {
            newWin.sessionStorage.setItem('current_page_code', currentGeneratedCode);
        };
    });
}

document.getElementById('generateBtn').addEventListener('click', generateSite);

// --- فكرة إضافية: لو عايز تضيف زرار تحميل الملف بره ---
function downloadCode() {
    if (!currentGeneratedCode) return;
    const blob = new Blob([currentGeneratedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NovaBuilder_Site.html';
    a.click();
}
