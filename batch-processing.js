// Batch Processing Functions with Multi-Format Support
let batchFiles = [];
let batchResults = [];

// Configure PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#27ae60';
    e.currentTarget.style.background = '#ecf0f1';
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#3498db';
    e.currentTarget.style.background = 'white';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#3498db';
    e.currentTarget.style.background = 'white';

    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length === 0) return;

    if (files.length > 50) {
        alert(typeof currentLang !== 'undefined' && currentLang === 'ar' ?
            'الحد الأقصى 50 ملف' : 'Maximum 50 files allowed');
        return;
    }

    batchFiles = [];
    const container = document.getElementById('filesListContainer');
    container.innerHTML = '';

    const validExtensions = ['.txt', '.docx', '.pdf', '.html', '.htm'];

    Array.from(files).forEach((file, index) => {
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(ext)) {
            return;
        }

        batchFiles.push(file);

        const fileIcon = getFileIcon(ext);
        const fileItem = document.createElement('div');
        fileItem.style.cssText = 'padding: 10px; margin: 5px 0; background: white; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;';
        fileItem.innerHTML = `
            <div>
                <strong>${fileIcon} ${file.name}</strong>
                <span style="color: #95a5a6; margin-left: 10px;">(${(file.size / 1024).toFixed(1)} KB)</span>
                <span style="color: #3498db; margin-left: 5px; font-size: 0.8em;">${ext.toUpperCase()}</span>
            </div>
            <span style="color: #f39c12;" data-en="⏳ Pending" data-ar="⏳ قيد الانتظار">⏳ Pending</span>
        `;
        container.appendChild(fileItem);
    });

    document.getElementById('filesList').style.display = 'block';
    document.getElementById('filesCount').textContent = batchFiles.length;
    document.getElementById('processBatchBtn').disabled = batchFiles.length === 0;
}

function getFileIcon(ext) {
    const icons = {
        '.txt': '📄',
        '.docx': '📘',
        '.pdf': '📕',
        '.html': '🌐',
        '.htm': '🌐'
    };
    return icons[ext] || '📄';
}

function clearBatchFiles() {
    batchFiles = [];
    batchResults = [];
    document.getElementById('filesList').style.display = 'none';
    document.getElementById('batchResults').style.display = 'none';
    document.getElementById('filesListContainer').innerHTML = '';
    document.getElementById('processBatchBtn').disabled = true;
    document.getElementById('fileInput').value = '';
}

async function processBatchFiles() {
    if (batchFiles.length === 0) return;

    const btn = document.getElementById('processBatchBtn');
    btn.disabled = true;
    btn.innerHTML = '<span data-en="🔄 Processing..." data-ar="🔄 جاري المعالجة...">🔄 Processing...</span>';

    batchResults = [];
    const container = document.getElementById('filesListContainer');
    const items = container.children;

    for (let i = 0; i < batchFiles.length; i++) {
        const file = batchFiles[i];
        const item = items[i];


        item.querySelector('span:last-child').innerHTML = '<span style="color: #3498db;" data-en="🔄 Processing..." data-ar="🔄 جاري المعالجة...">🔄 Processing...</span>';

        try {
            const text = await readFileContent(file);

            if (!text || text.trim().split(/\s+/).length < 50) {
                batchResults.push({
                    filename: file.name,
                    status: 'error',
                    error: typeof currentLang !== 'undefined' && currentLang === 'ar' ?
                        'النص قصير جداً (الحد الأدنى 50 كلمة)' : 'Text too short (min 50 words)'
                });
                item.querySelector('span:last-child').innerHTML = '<span style="color: #e74c3c;" data-en="❌ Error" data-ar="❌ خطأ">❌ Error</span>';
                continue;
            }

            const analyzer = new AdvancedTextAnalyzer(text, 'auto');
            const ensemble = new AIDetectionEnsemble(analyzer, 'medium');
            const prediction = ensemble.predict();

            batchResults.push({
                filename: file.name,
                status: 'success',
                classification: prediction.classification,
                aiScore: prediction.aiScore.toFixed(2),
                humanScore: prediction.humanScore.toFixed(2),
                confidence: prediction.confidence.toFixed(2),
                wordCount: analyzer.tokens.length
            });

            item.querySelector('span:last-child').innerHTML = '<span style="color: #27ae60;" data-en="✅ Done" data-ar="✅ تم">✅ Done</span>';
        } catch (error) {
            console.error('File processing error:', error);
            batchResults.push({
                filename: file.name,
                status: 'error',
                error: error.message || 'Processing failed'
            });
            item.querySelector('span:last-child').innerHTML = '<span style="color: #e74c3c;" data-en="❌ Error" data-ar="❌ حطأ">❌ Error</span>';
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    displayBatchResults();
    btn.innerHTML = '<span data-en="✅ Complete" data-ar="✅ اكتمل">✅ Complete</span>';
    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<span data-en="🚀 Process All Files" data-ar="🚀 معالجة جميع الملفات">🚀 Process All Files</span>';
    }, 2000);
}

// Main file content reader - routes to appropriate parser
async function readFileContent(file) {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    switch (ext) {
        case '.txt':
            return await readTextFile(file);
        case '.pdf':
            return await readPDFContent(file);
        case '.docx':
            return await readDOCXContent(file);
        case '.html':
        case '.htm':
            return await readHTMLContent(file);
        default:
            throw new Error('Unsupported file type: ' + ext);
    }
}

// Read plain text file
async function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read text file'));
        reader.readAsText(file);
    });
}

// Read PDF file using pdf.js
async function readPDFContent(file) {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF.js library not loaded');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;

                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }

                resolve(fullText.trim());
            } catch (err) {
                reject(new Error('Failed to parse PDF: ' + err.message));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsArrayBuffer(file);
    });
}

// Read DOCX file using mammoth.js
async function readDOCXContent(file) {
    if (typeof mammoth === 'undefined') {
        throw new Error('Mammoth.js library not loaded');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                resolve(result.value.trim());
            } catch (err) {
                reject(new Error('Failed to parse DOCX: ' + err.message));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read DOCX file'));
        reader.readAsArrayBuffer(file);
    });
}

// Read HTML file using DOMParser
async function readHTMLContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(e.target.result, 'text/html');

                // Remove script and style elements
                doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());

                // Get text content from body
                const text = doc.body ? doc.body.textContent : doc.documentElement.textContent;
                resolve(text.replace(/\s+/g, ' ').trim());
            } catch (err) {
                reject(new Error('Failed to parse HTML: ' + err.message));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read HTML file'));
        reader.readAsText(file);
    });
}

function displayBatchResults() {
    const resultsDiv = document.getElementById('batchResults');
    const summaryDiv = document.getElementById('batchSummary');
    const tableDiv = document.getElementById('batchTable');

    const total = batchResults.length;
    const aiGenerated = batchResults.filter(r => r.classification === 'AI_GENERATED').length;
    const humanWritten = batchResults.filter(r => r.classification === 'HUMAN_WRITTEN').length;
    const mixed = batchResults.filter(r => r.classification === 'MIXED').length;
    const errors = batchResults.filter(r => r.status === 'error').length;

    const isAr = typeof currentLang !== 'undefined' && currentLang === 'ar';

    summaryDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; text-align: center;">
            <div style="padding: 15px; background: #ecf0f1; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #3498db;">${total}</div>
                <div style="color: #7f8c8d;">${isAr ? 'إجمالي الملفات' : 'Total Files'}</div>
            </div>
            <div style="padding: 15px; background: #e74c3c15; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #e74c3c;">${aiGenerated}</div>
                <div style="color: #7f8c8d;">${isAr ? 'AI مولد' : 'AI Generated'}</div>
            </div>
            <div style="padding: 15px; background: #27ae6015; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #27ae60;">${humanWritten}</div>
                <div style="color: #7f8c8d;">${isAr ? 'بشري' : 'Human'}</div>
            </div>
            <div style="padding: 15px; background: #f39c1215; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #f39c12;">${mixed}</div>
                <div style="color: #7f8c8d;">${isAr ? 'مختلط' : 'Mixed'}</div>
            </div>
            ${errors > 0 ? `
            <div style="padding: 15px; background: #95a5a615; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #95a5a6;">${errors}</div>
                <div style="color: #7f8c8d;">${isAr ? 'أخطاء' : 'Errors'}</div>
            </div>
            ` : ''}
        </div>
    `;

    const rows = batchResults.map((result, index) => {
        if (result.status === 'error') {
            return `
                <tr style="background: #fff;">
                    <td style="padding: 12px; border: 1px solid #ecf0f1;">${index + 1}</td>
                    <td style="padding: 12px; border: 1px solid #ecf0f1;">${result.filename}</td>
                    <td colspan="5" style="padding: 12px; text-align: center; color: #e74c3c; border: 1px solid #ecf0f1;">❌ ${result.error}</td>
                </tr>
            `;
        }

        const classColor = result.classification === 'HUMAN_WRITTEN' ? '#27ae60' :
            result.classification === 'AI_GENERATED' ? '#e74c3c' : '#f39c12';
        const classText = result.classification === 'HUMAN_WRITTEN' ? (isAr ? 'بشري' : 'Human') :
            result.classification === 'AI_GENERATED' ? 'AI' : (isAr ? 'مختلط' : 'Mixed');

        return `
            <tr style="background: #fff;">
                <td style="padding: 12px; border: 1px solid #ecf0f1;">${index + 1}</td>
                <td style="padding: 12px; border: 1px solid #ecf0f1; font-weight: 500;">${result.filename}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ecf0f1;">
                    <span style="background: ${classColor}; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold;">
                        ${classText}
                    </span>
                </td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ecf0f1; font-weight: bold; color: #e74c3c;">${result.aiScore}%</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ecf0f1; font-weight: bold; color: #27ae60;">${result.humanScore}%</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ecf0f1;">${result.confidence}%</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ecf0f1;">${result.wordCount}</td>
            </tr>
        `;
    }).join('');

    tableDiv.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #3498db; color: white;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #2980b9;">#</th>
                    <th style="padding: 12px; text-align: left; border: 1px solid #2980b9;">${isAr ? 'اسم الملف' : 'Filename'}</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #2980b9;">${isAr ? 'التصنيف' : 'Classification'}</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #2980b9;">AI %</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #2980b9;">${isAr ? 'بشري' : 'Human'} %</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #2980b9;">${isAr ? 'الثقة' : 'Confidence'} %</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #2980b9;">${isAr ? 'الكلمات' : 'Words'}</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;

    resultsDiv.style.display = 'block';
}

function exportBatchPDF() {
    const element = document.getElementById('batchResults');
    const isAr = typeof currentLang !== 'undefined' && currentLang === 'ar';

    // Create a wrapper with proper styling for PDF
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'background: white; padding: 20px; direction: ' + (isAr ? 'rtl' : 'ltr') + ';';
    wrapper.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #3498db;">
            <h1 style="color: #3498db; margin: 0;">🔬 ${isAr ? 'تقرير كشف النصوص المولدة بالذكاء الاصطناعي' : 'AI Text Detection Report'}</h1>
            <p style="color: #666; margin: 10px 0 0 0;">${isAr ? 'تم إنشاؤه بواسطة' : 'Generated by'} aitextdetector.free</p>
            <p style="color: #999; margin: 5px 0 0 0; font-size: 0.9em;">${new Date().toLocaleString(isAr ? 'ar-SA' : 'en-US')}</p>
        </div>
        ${element.innerHTML}
        <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; color: #999; font-size: 0.8em;">
            © 2026 aitextdetector.free - ${isAr ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}
        </div>
    `;

    document.body.appendChild(wrapper);

    html2pdf().from(wrapper).set({
        margin: 10,
        filename: `Batch_Report_${Date.now()}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: 'l', unit: 'mm', format: 'a4' }
    }).save().then(() => {
        document.body.removeChild(wrapper);
    });
}

function exportBatchCSV() {
    const isAr = typeof currentLang !== 'undefined' && currentLang === 'ar';
    let csv = '\uFEFF'; // BOM for UTF-8
    csv += isAr ?
        'اسم الملف,التصنيف,نسبة AI,نسبة البشري,الثقة,عدد الكلمات\n' :
        'Filename,Classification,AI Score %,Human Score %,Confidence %,Word Count\n';

    batchResults.forEach(result => {
        if (result.status === 'success') {
            csv += `"${result.filename}",${result.classification},${result.aiScore},${result.humanScore},${result.confidence},${result.wordCount}\n`;
        }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch_results_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function exportBatchExcel() {
    // Export as CSV which can be opened directly in Excel
    exportBatchCSV();
}

