import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { platformCopy } from '@/constants/platformCopy';
import { useLanguage } from '@/hooks/useLanguage';

export type LegalDoc = 'privacy' | 'terms' | 'disclaimer';

const TERMS_BODY = {
  en: 'Use this website for general information only. Confirm requirements and deadlines directly with the responsible institution or official authority; no content or listing guarantees an admission, scholarship, visa, or humanitarian outcome.',
  fa: 'از این وب‌سایت فقط به‌عنوان منبع اطلاعات عمومی استفاده کنید. شرایط و مهلت‌ها را مستقیماً از مؤسسه یا مرجع رسمی تأیید کنید؛ هیچ محتوا یا فهرستی نتیجهٔ پذیرش، بورسیه، ویزا یا امور بشردوستانه را تضمین نمی‌کند.',
};

export default function LegalDialog({ doc, onClose }: { doc: LegalDoc | null; onClose: () => void }) {
  const { language } = useLanguage();
  const copy = platformCopy[language];
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (doc && !dialog.open) dialog.showModal();
    if (!doc && dialog.open) dialog.close();
  }, [doc]);

  const title =
    doc === 'privacy' ? copy.footer.privacy : doc === 'terms' ? copy.footer.terms : doc === 'disclaimer' ? copy.footer.disclaimer : '';
  const paragraphs: string[] =
    doc === 'privacy'
      ? [copy.common.privacy]
      : doc === 'terms'
        ? [TERMS_BODY[language]]
        : doc === 'disclaimer'
          ? [copy.common.genericGuidance, copy.common.decisionNotice]
          : [];

  return (
    <dialog
      className="legal-dialog"
      ref={dialogRef}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="legal-dialog-title"
    >
      {doc && (
        <>
          <div className="legal-dialog__head">
            <div>
              <p className="pathway-eyebrow">{copy.brand}</p>
              <h2 id="legal-dialog-title">{title}</h2>
            </div>
            <button className="opp-icon-button" type="button" onClick={onClose} aria-label={language === 'fa' ? 'بستن' : 'Close'} autoFocus>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="legal-dialog__body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="legal-dialog__foot">
            <button className="pathway-button" type="button" onClick={onClose}>
              {language === 'fa' ? 'بستن' : 'Close'}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
