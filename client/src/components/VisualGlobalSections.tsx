import VisualSections from "@/components/VisualSections";
import { useVisualEditorState } from "@/components/VisualEditor";

/** يضمن أن كل مسار يدعمه المحرر يملك مساحة لإضافة أقسام من المكتبة حتى لو لم يكن له قالب مخصص. */
export default function VisualGlobalSections() {
  const { pagePath } = useVisualEditorState();
  if (!pagePath) return null;
  return <VisualSections pagePath={pagePath} anchorId="global-page-end" />;
}
