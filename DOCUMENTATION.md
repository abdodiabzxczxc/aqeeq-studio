# توثيق مشروع استوديو العقيق (Al-Aqeeq Studio Documentation)

مشروع **«استوديو العقيق» (Al-Aqeeq Studio)** هو منصة رقمية متكاملة ومستقلة بالكامل لنشر وإدارة محتوى مدارس العقيق: مجلة العقيق، ألبومات الفعاليات، والأخبار والعروض، مع مشغل فيديو موحد ودعم كامل للهوية البصرية والمحرر المرئي الشامل.

---

## 1. الهيكلية المعمارية (Architecture Overview)

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Radix UI + Framer Motion.
- **Backend**: Express + tRPC v11 + Drizzle ORM + MySQL.
- **Auth**: نظام مصادقة محلي ومستقل بالكامل (Username/Password) مشفّر بـ `scrypt` وجلسات JWT موثقة بـ `JWT_SECRET` مخزنة في HTTP-only cookies (`app_session_id`).
- **Media & Storage**: تخزين محلي مباشر للملفات المرفوعة مع دعم كامل لعرض ملفات وصور وفيديوهات Google Drive بدقة عالية.

---

## 2. المسارات والصفحات (Routes & Navigation)

| المسار | الوصف | نوع الوصول |
| :--- | :--- | :--- |
| `/` | الصفحة الرئيسية لاستوديو العقيق (Studio Home) | عام |
| `/login` | صفحة تسجيل الدخول المستقلة للمدير والمشرفين | عام |
| `/journal` | رف مجلة العقيق والأعداد المنشورة والكتيبات الشهرية | عام |
| `/journal/:slug` | قارئ المجلة التفاعلي (Flipbook + Scroll) | عام |
| `/journal/manage` | استوديو إدارة المجلة واستيراد PDF و Drive | إداري (`admin`) |
| `/albums` | معرض ألبومات الفعاليات وصور وفيديوهات المدرسة | عام |
| `/albums/:slug` | قارئ الألبوم (Spread / Scroll / Gallery) مع تنزيل ZIP | عام |
| `/albums/manage` | استوديو الألبومات ورفع الصور وسحب الترتيب | إداري (`admin`) |
| `/offers` | خلاصة الأخبار والعروض التفاعلية | عام |
| `/offers/manage` | استوديو الأخبار والعروض ومزامنة مجلدات Drive | إداري (`admin`) |
| `/dashboard` | لوحة التحكم المركزية | إداري / موظفين |

---

## 3. مشغل الفيديو الموحد (`AqeeqVideoPlayer`)

تم توحيد تشغيل جميع الفيديوهات في مكوّن واحد مشترك `AqeeqVideoPlayer.tsx` يضمن:
- استخراج رابط الصورة المصغرة عالية الدقة تلقائيًا من Drive عبر `https://lh3.googleusercontent.com/d/{id}=w1600`.
- استخدام رابط المعاينة الرسمي مع إخفاء الأشرطة الخارجية `?rm=minimal`.
- نافذة عرض سريعة (Watch Modal) مع عنوان الفيديو وأزرار المشاركة.
- رسائل خطأ باللغة العربية مع زر «إعادة المحاولة» و«الفتح في Google Drive».

---

## 4. متغيرات البيئة (Environment Variables)

| اسم المتغير | إلزامي؟ | الوصف | مثال |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | اختياري | بيئة التشغيل (`production` أو `development`) | `production` |
| `PORT` | اختياري | منفذ تشغيل الخادم (يحدده Render تلقائيًا) | `3000` |
| `DATABASE_URL` | **نعم** | رابط اتصال قاعدة بيانات MySQL / TiDB / PlanetScale | `mysql://user:pass@host:3306/aqeeq_db` |
| `JWT_SECRET` | **نعم** | مفتاح سري عشوائي لتوقيع جلسات المستخدمين (32+ محرف) | `aqeeq_jwt_secret_super_secure_key_2026` |
| `ADMIN_USERNAME` | اختياري | اسم مستخدم حساب المدير الافتراضي (الافتراضي: `admin`) | `admin` |
| `ADMIN_PASSWORD` | اختياري | كلمة مرور المدير الافتراضي (الافتراضي: `aqeeq2026`) | `aqeeq2026` |
| `ADMIN_NAME` | اختياري | الاسم الظاهر للمدير | `مدير استوديو العقيق` |
| `ADMIN_EMAIL` | اختياري | البريد الإلكتروني للمدير | `admin@alaqeeq.edu.sa` |

---

## 5. دليل النشر على منصة Render (Render Deployment Guide)

1. أنشئ خدمة **Web Service** جديدة على [Render](https://render.com).
2. اختر بيئة **Node.js**.
3. حدد إعدادات البناء والتشغيل:
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `pnpm start`
4. أضف متغيرات البيئة من قسم **Environment Variables**:
   - `DATABASE_URL`: أدخل رابط قاعدة بيانات MySQL الخاصة بك.
   - `JWT_SECRET`: أدخل نصًا عشوائيًا قويًا لتأمين الجلسات.
   - `ADMIN_USERNAME`: `admin` (أو اسم المستخدم الذي تفضله).
   - `ADMIN_PASSWORD`: كلمة مرور قوية لحساب المدير.
5. اضغط **Deploy Web Service**.

---

## 6. أوامر التطوير والتشغيل (Development Commands)

- **تشغيل بيئة التطوير**: `pnpm run dev`
- **التحقق من الأنواع البرمجية (TypeScript Check)**: `pnpm run check`
- **تشغيل الاختبارات الآلية (Vitest)**: `pnpm test`
- **بناء المشروع للإنتاج**: `pnpm run build`
- **تشغيل خادم الإنتاج**: `pnpm start`
