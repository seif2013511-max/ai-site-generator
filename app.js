// متغير لتخزين الكود عشان يفتح في الصفحة الجديدة
let currentGeneratedCode = "";

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

    // تجهيز الواجهة
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
            currentGeneratedCode = data.code; 
            iframe.srcdoc = data.code; 

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

// التعديل هنا: برمجة الزرار ليدعم الـ Refresh باستخدام الـ Blob
const openBtn = document.getElementById('openNewTabBtn');
if (openBtn) {
    openBtn.addEventListener('click', () => {
        if (currentGeneratedCode) {
            // تحويل الكود لملف مؤقت في ذاكرة المتصفح
            const blob = new Blob([currentGeneratedCode], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            
            // فتح الرابط المؤقت في نافذة جديدة
            window.open(blobUrl, '_blank');
            
            // نصيحة: الروابط دي بتفضل في الذاكرة، بس للمعاينة هي مثالية
        }
    });
}

// ربط زرار التوليد الأساسي
document.getElementById('generateBtn').addEventListener('click', generateSite);
