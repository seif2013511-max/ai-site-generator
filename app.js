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

        // --- التعديل الجوهري هنا ---
        // بنشيك على حالة الاستجابة "قبل" ما نحاول نحولها لـ JSON
        if (response.status === 429) {
            startCooldown(30);
            return;
        }

        const data = await response.json();

        // لو فيه خطأ داخل الـ JSON نفسه (زي الـ Quota)
        if (!response.ok || (data.error && data.error.toLowerCase().includes('quota'))) {
            startCooldown(30); 
            return; 
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
        // لو الخطأ مش كول داون، بننبه المستخدم
        if (!isCooldownActive) alert("فيه مشكلة حصلت: " + e.message);
    } finally {
        if (!isCooldownActive) {
            btn.disabled = false;
            loader.classList.add('hidden');
            btn.querySelector('span').innerText = "توليد الموقع الآن ✨";
        }
    }
}

// فتح صفحة المعاينة ودعم المشاريع اللانهائية
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        const newWin = window.open('/preview.html', '_blank');
        newWin.onload = () => {
            newWin.sessionStorage.setItem('current_page_code', currentGeneratedCode);
        };
    });
}

document.getElementById('generateBtn').addEventListener('click', generateSite);
