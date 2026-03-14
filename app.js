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

            // بنخزن الكود في localStorage عشان preview.html يسحبه أول مرة
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

// --- التعديل هنا لضمان استقلالية النوافذ ---
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        // بنفتح النافذة
        const newWin = window.open('/preview.html', '_blank');
        
        // بمجرد ما النافذة تفتح، بنبعتلها الكود الحالي 
        // عشان تسجله عندها في الـ Session الخاص بيها هي بس
        newWin.onload = () => {
            newWin.sessionStorage.setItem('current_page_code', currentGeneratedCode);
        };
    });
}

document.getElementById('generateBtn').addEventListener('click', generateSite);
