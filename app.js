// متغير لتخزين الكود عشان يفتح في الصفحة الجديدة
let currentGeneratedCode = "";

async function generateSite() {
    const promptInput = document.getElementById('promptInput');
    const btn = document.getElementById('generateBtn');
    const iframe = document.getElementById('previewIframe');
    const loader = document.getElementById('loader');
    
    // تأكدنا إن الزرار ده موجود في الـ HTML قبل ما نطلبه
    const openNewTabBtn = document.getElementById('openNewTabBtn');
    
    const promptValue = promptInput.value;

    if (!promptValue) {
        alert("من فضلك اكتب وصف للموقع أولاً!");
        return;
    }

    // تجهيز الواجهة
    btn.disabled = true;
    loader.classList.remove('hidden');
    btn.querySelector('span').innerText = "جاري البناء... 🏗️";
    
    // إخفاء زر المعاينة لو كان ظاهر من محاولة سابقة
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
            currentGeneratedCode = data.code; // حفظ الكود
            iframe.srcdoc = data.code; // عرض في المعاينة

            // إظهار زر "مشاهدة الموقع بملء الشاشة"
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

// برمجة زرار الفتح في صفحة جديدة (Window Open)
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        const win = window.open();
        win.document.write(currentGeneratedCode);
        win.document.close();
    });
}

// ربط زرار التوليد الأساسي
document.getElementById('generateBtn').addEventListener('click', generateSite);
