// --- 1. متغيرات الجلسة ---
let currentGeneratedCode = "";
let selectedImageBase64 = null; // متغير جديد لحفظ الصورة

const DAILY_LIMIT = 20; 
const ALERT_THRESHOLD = 0.8; 

// --- إدارة الكوتا ---
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
}

// --- معالجة الصور (الجديد) ---
const imageInput = document.getElementById('imageInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const removeImageBtn = document.getElementById('removeImage');

if (imageInput) {
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                selectedImageBase64 = event.target.result.split(',')[1]; // استخراج الـ Base64 فقط
                imagePreview.src = event.target.result;
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
}

if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
        selectedImageBase64 = null;
        imageInput.value = "";
        imagePreviewContainer.classList.add('hidden');
    });
}

// --- تحميل الملف HTML ---
function downloadSite() {
    if (!currentGeneratedCode) {
        alert("ولد الموقع الأول يا سيف! 🚀");
        return;
    }
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

// --- الدالة الأساسية للتوليد ---
async function generateSite() {
    const promptInput = document.getElementById('promptInput');
    const btn = document.getElementById('generateBtn');
    const iframe = document.getElementById('previewIframe');
    const loader = document.getElementById('loader');
    const openNewTabBtn = document.getElementById('openNewTabBtn');
    const downloadBtn = document.getElementById('downloadBtn'); 
    const promptValue = promptInput.value;

    if (!promptValue && !selectedImageBase64) {
        alert("اكتب وصف أو ارفع صورة يا سيف عشان نبدأ!");
        return;
    }

    btn.disabled = true;
    loader.classList.remove('hidden');
    btn.querySelector('span').innerText = "جاري التحليل والبناء... 🏗️";
    
    if (openNewTabBtn) openNewTabBtn.classList.add('hidden');
    if (downloadBtn) downloadBtn.classList.add('hidden');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: promptValue,
                image: selectedImageBase64 // بنبعت الصورة هنا لو موجودة
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "خطأ في السيرفر");
        }

        const data = await response.json();
        
        if (data.code) {
            updateQuotaCounter();
            const newSiteId = "nova_" + Math.random().toString(36).substr(2, 9);
            currentGeneratedCode = data.code; 
            iframe.srcdoc = data.code; 

            localStorage.setItem(newSiteId, data.code);
            
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

// ربط الأزرار
const dlBtn = document.getElementById('downloadBtn');
if (dlBtn) dlBtn.addEventListener('click', downloadSite);

document.getElementById('generateBtn').addEventListener('click', generateSite);
