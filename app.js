// متغير عالمي لتخزين الكود المولد لفتحه في نافذة جديدة
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

    // 1. تجهيز الواجهة لبدء التوليد
    btn.disabled = true;
    loader.classList.remove('hidden'); 
    btn.querySelector('span').innerText = "جاري البناء... 🏗️";
    // إخفاء زر ملء الشاشة عند بدء توليد جديد
    openNewTabBtn.classList.add('hidden');

    try {
        // 2. طلب الكود من السيرفر
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
            // 3. تخزين الكود وعرضه في المعاينة
            currentGeneratedCode = data.code;
            iframe.srcdoc = data.code;

            // 4. إظهار زر "مشاهدة الموقع بملء الشاشة"
            openNewTabBtn.classList.remove('hidden');
        } else {
            throw new Error("لم يتم استلام كود من الذكاء الاصطناعي");
        }

    } catch (e) {
        console.error("Error details:", e);
        alert("فيه مشكلة حصلت: " + e.message);
    } finally {
        // 5. إعادة الزرار لحالته الطبيعية
        btn.disabled = false;
        loader.classList.add('hidden'); 
        btn.querySelector('span').innerText = "توليد الموقع الآن ✨";
    }
}

// برمجة زر "مشاهدة الموقع بملء الشاشة" لفتح نافذة جديدة
document.getElementById('openNewTabBtn').addEventListener('click', () => {
    if (currentGeneratedCode) {
        const newWindow = window.open();
        newWindow.document.write(currentGeneratedCode);
        newWindow.document.close();
    }
});

// ربط وظيفة التوليد بالزرار الأساسي
document.getElementById('generateBtn').addEventListener('click', generateSite);
