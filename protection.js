// Anti-Copy Protection System
(function() {
    'use strict';
    
    // 1. Domain Check - يعمل فقط على domain محدد
    const allowedDomains = ['aitextdetector.free', 'localhost', '127.0.0.1'];
    const currentDomain = window.location.hostname;
    
    if (!allowedDomains.some(domain => currentDomain.includes(domain))) {
        document.body.innerHTML = '<div style="text-align:center;padding:50px;"><h1>⚠️ Unauthorized Domain</h1><p>This tool only works on <a href="https://aitextdetector.free">aitextdetector.free</a></p></div>';
        throw new Error('Domain verification failed');
    }
    
    // 2. Disable Right Click (صعّب نسخ الكود)
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
            return true; // السماح في مربعات النص
        }
        e.preventDefault();
        return false;
    });
    
    // 3. Disable DevTools shortcuts
    document.addEventListener('keydown', function(e) {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
    });
    
    // 4. Detect DevTools (يكتشف إذا فُتح DevTools)
    const detectDevTools = () => {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            console.log('%c⚠️ Developer Tools Detected', 'color: red; font-size: 20px;');
            console.log('%cThis code is protected. Unauthorized copying is prohibited.', 'color: red;');
            console.log('%c© 2026 AITextDetector.free - All Rights Reserved', 'color: blue;');
        }
    };
    
    setInterval(detectDevTools, 1000);
    
    // 5. Watermark في Console
    console.log('%c🛡️ AITextDetector.free', 'color: #3498db; font-size: 24px; font-weight: bold;');
    console.log('%c© 2026 - Protected Code', 'color: #2c3e50; font-size: 14px;');
    console.log('%cUnauthorized copying is prohibited by law', 'color: #e74c3c; font-size: 12px;');
    console.log('%cVisit: https://aitextdetector.free', 'color: #27ae60; font-size: 14px;');
    
    // 6. Add invisible watermark to page
    const watermark = document.createElement('div');
    watermark.style.cssText = 'position:fixed;bottom:0;right:0;opacity:0.01;font-size:1px;pointer-events:none;';
    watermark.textContent = 'AITextDetector.free - Original at https://aitextdetector.free - © 2026';
    document.body.appendChild(watermark);
    
    // 7. Fingerprint - يحفظ domain الأصلي
    if (typeof(Storage) !== "undefined") {
        if (!localStorage.getItem('aitd_origin')) {
            localStorage.setItem('aitd_origin', window.location.href);
        }
    }
    
    // 8. Prevent iframe embedding على domains أخرى
    if (window.self !== window.top) {
        try {
            if (window.top.location.hostname !== currentDomain) {
                window.top.location = window.self.location;
            }
        } catch(e) {
            document.body.innerHTML = '<div style="text-align:center;padding:50px;"><h1>⚠️ Embedding Not Allowed</h1></div>';
        }
    }
    
    // 9. Track suspicious activity
    window.addEventListener('copy', function() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'suspicious_copy', {
                'event_category': 'security',
                'event_label': 'content_copied'
            });
        }
    });
    
    console.log('✅ Protection Active');
})();
