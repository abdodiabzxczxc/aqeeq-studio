import re

with open("client/src/pages/AqeeqAdminDashboardPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Bulk Delete Modal
if "bulkDeleteConfirmOpen" not in content:
    content = content.replace(
        "const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);",
        "const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);\n  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);"
    )
    
    bulk_delete_html = """                        <Button
                          size="sm"
                          type="button"
                          variant="destructive"
                          onClick={() => setBulkDeleteConfirmOpen(true)}
                          className="rounded-xl h-8 text-[11px] font-bold gap-1 bg-red-600 hover:bg-red-700"
                        >
                          <span>حذف جماعي 🗑️</span>
                        </Button>

                        <Dialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
                          <DialogContent className="max-w-sm">
                            <DialogHeader>
                              <DialogTitle className="text-right">⚠️ تأكيد الحذف الجماعي</DialogTitle>
                              <DialogDescription className="text-right">
                                هل أنت متأكد من حذف {selectedLeadIds.length} طلب؟ هذا الإجراء لا يمكن التراجع عنه.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2 flex-row-reverse">
                              <Button variant="destructive" onClick={async () => {
                                for (const id of selectedLeadIds) {
                                  await deleteAdmissionMutation.mutateAsync({ id });
                                }
                                toast.success(`تم حذف ${selectedLeadIds.length} طلبات بنجاح`);
                                setSelectedLeadIds([]);
                                setBulkDeleteConfirmOpen(false);
                              }}>
                                نعم، احذف
                              </Button>
                              <Button variant="outline" onClick={() => setBulkDeleteConfirmOpen(false)}>
                                إلغاء
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <button"""
    content = content.replace("                        <button", bulk_delete_html, 1)

# 2. KPI text
# refetchInterval
if "refetchInterval: 15000" in content:
    content = content.replace("refetchInterval: 15000,", "refetchInterval: 30000,")
elif "refetchInterval: 30000" not in content:
    content = content.replace("enabled: Boolean(isAuthenticated && user?.role === \"admin\"),", "enabled: Boolean(isAuthenticated && user?.role === \"admin\"),\n    refetchInterval: 30000,")

# Total Views
content = content.replace(
    """                <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>تحديث لحظي مستمر</span>
                </div>""",
    """                <p className="text-[11px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                  <span>↑</span>
                  <span>حي ومحدث الآن</span>
                </p>"""
)
# Total Issues
content = content.replace(
    """<p className="mt-2 text-[11px] font-bold text-slate-400">عدد مجلة منشور بالأرشيف</p>""",
    """<p className="text-[11px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                  <span>↑</span>
                  <span>محدث الآن</span>
                </p>"""
)
# Total Albums
content = content.replace(
    """<p className="mt-2 text-[11px] font-bold text-slate-400">ألبوم فعالية ومناسبة</p>""",
    """<p className="text-[11px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                  <span>↑</span>
                  <span>محدث الآن</span>
                </p>"""
)
# Total Media
content = content.replace(
    """<p className="mt-2 text-[11px] font-bold text-slate-400">صورة وفيديو ومنشور</p>""",
    """<p className="text-[11px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                  <span>↑</span>
                  <span>محدث الآن</span>
                </p>"""
)

# 3. Mobile Bottom Nav
bottom_nav = """
      {/* Mobile Bottom Nav - Admin Dashboard */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 block lg:hidden border-t ${
        dark ? 'bg-[#0a0f14]/95 border-white/10' : 'bg-white/95 border-black/10'
      } backdrop-blur-xl`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          <button onClick={() => setActiveTab('radar')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold transition ${
            activeTab === 'radar' ? 'text-emerald-500 bg-emerald-500/10' : dark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <LayoutDashboard size={20} />
            <span>الرادار</span>
          </button>
          <button onClick={() => setActiveTab('admissions')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold transition ${
            activeTab === 'admissions' ? 'text-emerald-500 bg-emerald-500/10' : dark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <GraduationCap size={20} />
            <span>القبول</span>
          </button>
          <button onClick={() => setActiveTab('content')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold transition ${
            activeTab === 'content' ? 'text-emerald-500 bg-emerald-500/10' : dark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <Layers size={20} />
            <span>المحتوى</span>
          </button>
          <button onClick={() => setActiveTab('orchestration')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold transition ${
            activeTab === 'orchestration' ? 'text-emerald-500 bg-emerald-500/10' : dark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <Sliders size={20} />
            <span>الإعدادات</span>
          </button>
        </div>
      </div>
    </div>
"""
if "Mobile Bottom Nav" not in content:
    content = content.replace("    </div>\n  );\n}", bottom_nav + "  );\n}")


# 4. Accordion for Orchestration
if "ChevronDown" not in content:
    content = content.replace('Smartphone,\n} from "lucide-react";', 'Smartphone,\n  ChevronDown,\n} from "lucide-react";')

content = content.replace(
    'const [orchestrationSubTab, setOrchestrationSubTab] = useState<"hero" | "app" | "campuses" | "sections">("hero");',
    'const [orchestrationSubTab, setOrchestrationSubTab] = useState<"hero" | "app" | "campuses" | "sections" | null>("hero");'
)

# Remove the Subtabs Bar
subtabs_pattern = re.compile(r'\{\/\* Subtabs Bar \*\/\}.*?\{\/\* Subtab 1: HERO COVERS & THEMES \*\/\}\n\s*\{orchestrationSubTab === "hero" && \(', re.DOTALL)
content = re.sub(
    subtabs_pattern,
    r'''{/* Accordion 1: HERO COVERS & THEMES */}
            <div className="border rounded-2xl overflow-hidden mb-3">
              <button
                type="button"
                onClick={() => setOrchestrationSubTab(orchestrationSubTab === 'hero' ? null : 'hero')}
                className={`w-full flex items-center justify-between p-4 font-bold text-right transition ${dark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
              >
                <span>🎯 إعدادات الهيرو والأغطية</span>
                <ChevronDown className={`transition-transform ${orchestrationSubTab === 'hero' ? 'rotate-180' : ''}`} size={16} />
              </button>
              {orchestrationSubTab === "hero" && (
                <div className="p-4 border-t border-current/10">''',
    content
)

# Replace Subtab 2
subtab2_pattern = re.compile(r'\{\/\* Subtab 2: SMART APP SHOWCASE \*\/\}\n\s*\{orchestrationSubTab === "app" && \(')
content = re.sub(
    subtab2_pattern,
    r'''</div>
              )}
            </div>
            {/* Accordion 2: SMART APP SHOWCASE */}
            <div className="border rounded-2xl overflow-hidden mb-3">
              <button
                type="button"
                onClick={() => setOrchestrationSubTab(orchestrationSubTab === 'app' ? null : 'app')}
                className={`w-full flex items-center justify-between p-4 font-bold text-right transition ${dark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
              >
                <span>📱 تطبيق مدارس العقيق الذكي</span>
                <ChevronDown className={`transition-transform ${orchestrationSubTab === 'app' ? 'rotate-180' : ''}`} size={16} />
              </button>
              {orchestrationSubTab === "app" && (
                <div className="p-4 border-t border-current/10">''',
    content
)

# Replace Subtab 3
subtab3_pattern = re.compile(r'\{\/\* Subtab 3: CAMPUSES & CONTACTS \*\/\}\n\s*\{orchestrationSubTab === "campuses" && \(')
content = re.sub(
    subtab3_pattern,
    r'''</div>
              )}
            </div>
            {/* Accordion 3: CAMPUSES & CONTACTS */}
            <div className="border rounded-2xl overflow-hidden mb-3">
              <button
                type="button"
                onClick={() => setOrchestrationSubTab(orchestrationSubTab === 'campuses' ? null : 'campuses')}
                className={`w-full flex items-center justify-between p-4 font-bold text-right transition ${dark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
              >
                <span>🏛️ مجمعاتنا وهوية المدارس</span>
                <ChevronDown className={`transition-transform ${orchestrationSubTab === 'campuses' ? 'rotate-180' : ''}`} size={16} />
              </button>
              {orchestrationSubTab === "campuses" && (
                <div className="p-4 border-t border-current/10">''',
    content
)

# Replace Subtab 4
subtab4_pattern = re.compile(r'\{\/\* Subtab 4: SECTIONS, BENTO, SOCIAL, FOOTER \*\/\}\n\s*\{orchestrationSubTab === "sections" && \(')
content = re.sub(
    subtab4_pattern,
    r'''</div>
              )}
            </div>
            {/* Accordion 4: SECTIONS, BENTO, SOCIAL, FOOTER */}
            <div className="border rounded-2xl overflow-hidden mb-3">
              <button
                type="button"
                onClick={() => setOrchestrationSubTab(orchestrationSubTab === 'sections' ? null : 'sections')}
                className={`w-full flex items-center justify-between p-4 font-bold text-right transition ${dark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
              >
                <span>⚙️ باقي السكاشن والمحتوى</span>
                <ChevronDown className={`transition-transform ${orchestrationSubTab === 'sections' ? 'rotate-180' : ''}`} size={16} />
              </button>
              {orchestrationSubTab === "sections" && (
                <div className="p-4 border-t border-current/10">''',
    content
)

# Finally, add the closing divs for Accordion 4 right before the Bottom Save Bar
bottom_save_bar_pattern = re.compile(r'\{\/\* Bottom Save Bar \*\/\}')
content = re.sub(
    bottom_save_bar_pattern,
    r'''</div>
              )}
            </div>
            {/* Bottom Save Bar */}''',
    content
)

with open("client/src/pages/AqeeqAdminDashboardPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)

