# 🌐 دليل ربط Domain من name.com مع GitHub Pages

## المتطلبات:
- ✅ Domain: aitextdetector.free مسجل على name.com
- ✅ GitHub repository جاهز
- ✅ GitHub Pages مفعّل

---

## 📋 الخطوة 1: إعداد DNS في name.com

### 1. تسجيل الدخول:
- اذهب إلى: https://www.name.com
- سجّل دخول لحسابك

### 2. اذهب لإعدادات DNS:
```
My Account → My Domains → aitextdetector.free → Manage DNS Records
أو
Dashboard → aitextdetector.free → DNS Records
```

### 3. أضف السجلات التالية:

#### 🅰️ أضف 4 سجلات A Records:

انقر "Add Record" لكل واحد:

```
Type: A
Host: @ (أو فارغ)
Answer: 185.199.108.153
TTL: 300

Type: A
Host: @ (أو فارغ)
Answer: 185.199.109.153
TTL: 300

Type: A  
Host: @ (أو فارغ)
Answer: 185.199.110.153
TTL: 300

Type: A
Host: @ (أو فارغ)
Answer: 185.199.111.153
TTL: 300
```

#### 📝 أضف CNAME Record للـ www:

```
Type: CNAME
Host: www
Answer: YOUR_USERNAME.github.io.
TTL: 300
```
**⚠️ مهم:** استبدل `YOUR_USERNAME` باسم المستخدم GitHub الخاص بك

**مثال:** إذا username الخاص بك `johndoe`:
```
Answer: johndoe.github.io.
```

### 4. احفظ التغييرات
- اضغط "Save" أو "Update"

---

## 📋 الخطوة 2: إعداد Custom Domain في GitHub

### 1. اذهب لـ repository على GitHub:
```
https://github.com/YOUR_USERNAME/aitextdetector
```

### 2. افتح Settings:
- اضغط على tab "Settings" في الأعلى

### 3. اذهب لـ Pages:
- من القائمة الجانبية: "Pages"

### 4. أضف Custom Domain:
```
Custom domain: aitextdetector.free
```

### 5. اضغط "Save"

### 6. انتظر التحقق:
- سيظهر: "DNS check in progress..."
- انتظر 5-10 دقائق
- سينتهي ويظهر: ✅ "DNS check successful"

### 7. فعّل HTTPS:
- ✅ ضع علامة على: "Enforce HTTPS"
- قد يأخذ بضع دقائق

---

## 📋 الخطوة 3: إنشاء CNAME File

في repository، أنشئ ملف `CNAME` (بدون امتداد):

### المحتوى:
```
aitextdetector.free
```

### الطريقة:
1. في GitHub repository
2. "Add file" → "Create new file"
3. اسم الملف: `CNAME` (كل الأحرف uppercase)
4. المحتوى: `aitextdetector.free`
5. "Commit new file"

---

## ⏰ الخطوة 4: الانتظار (DNS Propagation)

### المدة:
- **Minimum:** 15-30 دقيقة
- **Usually:** 1-2 ساعة
- **Maximum:** 24-48 ساعة (نادر)

### كيف تتحقق:

#### طريقة 1: افتح الموقع
```
https://aitextdetector.free
```

#### طريقة 2: DNS Checker
```
https://dnschecker.org
Domain: aitextdetector.free
```

#### طريقة 3: Terminal Command
```bash
nslookup aitextdetector.free
```

---

## ✅ علامات النجاح

### يجب أن ترى:

1. **DNS Records صحيحة:**
```
aitextdetector.free → 185.199.108.153 (و 3 أخرى)
www.aitextdetector.free → YOUR_USERNAME.github.io
```

2. **GitHub Pages Status:**
```
✅ Your site is published at https://aitextdetector.free
```

3. **HTTPS Working:**
```
🔒 https://aitextdetector.free (secure)
```

4. **الموقع يعمل:**
```
افتح https://aitextdetector.free
التطبيق يظهر ✅
```

---

## 🐛 حل المشاكل (Troubleshooting)

### مشكلة 1: "DNS check failed"
**الحل:**
- تأكد من A records صحيحة (4 سجلات)
- تأكد من CNAME record صحيح
- انتظر 30 دقيقة إضافية

### مشكلة 2: "404 - There isn't a GitHub Pages site here"
**الحل:**
- تأكد من CNAME file موجود في repository
- تأكد من محتوى CNAME: `aitextdetector.free`
- تأكد من GitHub Pages enabled

### مشكلة 3: "Certificate error" أو HTTPS لا يعمل
**الحل:**
- انتظر 15-30 دقيقة بعد DNS propagation
- GitHub يصدر certificate تلقائياً
- حاول مرة أخرى بعد ساعة

### مشكلة 4: الموقع يفتح لكن يظهر خطأ
**الحل:**
- افتح Console: F12 → Console
- ابحث عن errors
- تأكد من protection.js و batch-processing.js موجودين

### مشكلة 5: "Domain already taken"
**الحل:**
- Domain مستخدم في repository آخر
- احذفه من Repository القديم أولاً
- ثم أضفه للجديد

---

## 📊 التحقق النهائي

### Checklist:

```
☐ name.com DNS records صحيحة (4 A + 1 CNAME)
☐ GitHub Pages enabled
☐ Custom domain: aitextdetector.free
☐ CNAME file موجود في repository
☐ HTTPS enforced ✅
☐ DNS propagation complete (check dnschecker.org)
☐ https://aitextdetector.free يفتح
☐ التطبيق يعمل بشكل صحيح
☐ Protection system active
☐ No console errors
```

---

## 🎯 الخطوة التالية بعد النجاح

### فوراً:
1. ✅ Test كل features
2. ✅ Test على mobile
3. ✅ Check console for errors
4. ✅ Test protection.js (حاول فتح على domain آخر)

### خلال ساعة:
1. ✅ Setup Google Analytics
2. ✅ Setup Google Search Console
3. ✅ Submit sitemap

### خلال يوم:
1. ✅ Launch on Product Hunt
2. ✅ Post on Reddit
3. ✅ Tweet announcement
4. ✅ Start marketing!

---

## 📞 مساعدة إضافية

### إذا واجهت مشاكل:

**GitHub Pages Help:**
https://docs.github.com/en/pages

**name.com Support:**
https://www.name.com/support

**DNS Propagation Checker:**
https://www.whatsmydns.net/#A/aitextdetector.free

**Community:**
- Stack Overflow
- GitHub Community
- Web Dev Discord

---

## 🎊 تهانينا عند النجاح!

عندما يعمل الموقع على `https://aitextdetector.free`:

```
🎉 أنت الآن LIVE!
🎯 ابدأ التسويق فوراً
📊 راقب Analytics
🚀 First mover advantage = yours!
```

---

<div align="center">

**© 2026 AITextDetector.free**

**من Local → GitHub → Domain → LIVE!**

**Good luck! 🚀💚**

</div>
