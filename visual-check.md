# Visual verification notes

- The public homepage renders successfully in Arabic RTL with the dark-and-gold identity.
- The hero now presents the product as **منصة إدارة الفعاليات** rather than a graduation-only system.
- The homepage includes generic messaging for guests, invitations, entry control, live dashboards, permissions, and reports.
- The signed-in preview shows the dashboard and scan-gate actions without visual layout errors.
- The database mismatch that caused the live attendee statistics query to fail was identified: `attendees.ceremonyId` was missing from the deployed table. The column was added non-destructively and verified with a grouped query.
- The saved homepage settings were updated from graduation-specific copy to general event-platform copy.

- The public event route `/event/1` is registered and reaches the loading state without a TypeScript or route compilation error; the preview capture showed the expected loading indicator while the public query was resolving.
- The homepage preview continues to render the general event-platform copy and the Arabic RTL layout correctly after the router update.

## 2026-08-16 — التحقق بعد تعميم منصة الفعاليات

- الصفحة الرئيسية تعرض هوية عامة بعنوان «منصة إدارة الفعاليات» مع RTL، ألوان ذهبية/داكنة، مؤشرات الضيوف والحضور والتذاكر، وأقسام المزايا العامة.
- المسار `/event/1` يعرض بيانات الفعالية الحالية، شعارها، نوعها، زر العودة، ومعاينة دعوة رقمية مرتبطة برابط الفعالية مع رمز QR فعلي للمشاركة.
- المعاينة العامة تظهر بتنسيق عربي واضح ومتجاوب، وتستخدم اللون المخصص للفعالية عند توفره.
- صفحة الفعالية الحالية ما زالت تعرض اسم «حفل تخرج مدارس العقيق 2026» لأن ذلك هو اسم البيانات المحفوظة لهذه الفعالية، بينما تجربة المنتج والواجهات الجديدة عامة وقابلة لإنشاء فعاليات أخرى.

## 2026-08-16 — القوالب وإدارة المقاعد

- الصفحة الرئيسية ما زالت تعرض المنتج كمنصة عامة لإدارة الفعاليات، مع الحفاظ على الهوية العربية الذهبية والداكنة.
- صفحة `/event/1` تعيد تحميل بيانات الفعالية العامة وتحتوي على معاينة الدعوة ورمز QR؛ اللقطة الأولى قد تظهر مؤشر التحميل لحظياً قبل اكتمال استعلام الفعالية.
- تمت إضافة اختيار قالب هوية فعلي بين «ملكي» و«هادئ» و«عصري»، مع حفظ القالب واللون والخط وعنوان الدعوة ونصها لكل فعالية.
- تمت إضافة محررات قابلة للإضافة والحذف للقطاعات والبوابات وقائمة المقاعد، مع ربط المقعد بالضيف عبر حقل رقم المقعد في نموذج الضيف.
- أعيدت اللقطة بعد اكتمال التحميل، وظهرت صفحة `/event/1` كاملة مع شارة «قالب ملكي»، العنوان، شعار الفعالية، رمز QR، المعاينة، والمزايا التشغيلية دون بقاء مؤشر التحميل.
