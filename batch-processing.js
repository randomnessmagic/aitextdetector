// Batch Processing Functions
let batchFiles = [];
let batchResults = [];

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
        alert('Maximum 50 files allowed');
        return;
    }
    
    batchFiles = [];
    const container = document.getElementById('filesListContainer');
    container.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        const validTypes = ['.txt'];
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!ext.endsWith('.txt')) {
            return;
        }
        
        batchFiles.push(file);
        
        const fileItem = document.createElement('div');
        fileItem.style.cssText = 'padding: 10px; margin: 5px 0; background: white; border-radius: 6px; display: flex; justify-content: space-between;';
        fileItem.innerHTML = `
            <div>
                <strong>📄 ${file.name}</strong>
                <span style="color: #95a5a6; margin-left: 10px;">(${(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <span style="color: #f39c12;">⏳ Pending</span>
        `;
        container.appendChild(fileItem);
    });
    
    document.getElementById('filesList').style.display = 'block';
    document.getElementById('filesCount').textContent = batchFiles.length;
    document.getElementById('processBatchBtn').disabled = batchFiles.length === 0;
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
    btn.textContent = 'Processing...';
    
    batchResults = [];
    const container = document.getElementById('filesListContainer');
    const items = container.children;
    
    for (let i = 0; i < batchFiles.length; i++) {
        const file = batchFiles[i];
        const item = items[i];
        
        item.querySelector('span:last-child').innerHTML = '<span style="color: #3498db;">🔄 Processing...</span>';
        
        try {
            const text = await readFileContent(file);
            
            if (text.split(/\s+/).length < 50) {
                batchResults.push({
                    filename: file.name,
                    status: 'error',
                    error: 'Text too short (min 50 words)'
                });
                item.querySelector('span:last-child').innerHTML = '<span style="color: #e74c3c;">❌ Error</span>';
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
            
            item.querySelector('span:last-child').innerHTML = '<span style="color: #27ae60;">✅ Done</span>';
        } catch (error) {
            batchResults.push({
                filename: file.name,
                status: 'error',
                error: error.message || 'Processing failed'
            });
            item.querySelector('span:last-child').innerHTML = '<span style="color: #e74c3c;">❌ Error</span>';
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    displayBatchResults();
    btn.textContent = '✅ Complete';
}

async function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
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
    
    summaryDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; text-align: center;">
            <div style="padding: 15px; background: #ecf0f1; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #3498db;">${total}</div>
                <div style="color: #7f8c8d;">Total Files</div>
            </div>
            <div style="padding: 15px; background: #e74c3c15; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #e74c3c;">${aiGenerated}</div>
                <div style="color: #7f8c8d;">AI Generated</div>
            </div>
            <div style="padding: 15px; background: #27ae6015; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #27ae60;">${humanWritten}</div>
                <div style="color: #7f8c8d;">Human</div>
            </div>
            <div style="padding: 15px; background: #f39c1215; border-radius: 8px;">
                <div style="font-size: 2em; font-weight: bold; color: #f39c12;">${mixed}</div>
                <div style="color: #7f8c8d;">Mixed</div>
            </div>
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
        const classText = result.classification === 'HUMAN_WRITTEN' ? 'Human' :
                        result.classification === 'AI_GENERATED' ? 'AI' : 'Mixed';
        
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
                    <th style="padding: 12px; text-align: left; border: 1px solid #2980b9;">Filename</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #2980b9;">Classification</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #2980b9;">AI %</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #2980b9;">Human %</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #2980b9;">Confidence %</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #2980b9;">Words</th>
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
    html2pdf().from(element).set({
        margin: 10,
        filename: `Batch_Report_${Date.now()}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'p', unit: 'mm', format: 'a4' }
    }).save();
}

function exportBatchCSV() {
    let csv = 'Filename,Classification,AI Score %,Human Score %,Confidence %,Word Count\n';
    
    batchResults.forEach(result => {
        if (result.status === 'success') {
            csv += `"${result.filename}",${result.classification},${result.aiScore},${result.humanScore},${result.confidence},${result.wordCount}\n`;
        }
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch_results_${Date.now()}.csv`;
    link.click();
}

function exportBatchExcel() {
    exportBatchCSV();
}
