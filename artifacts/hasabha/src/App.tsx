import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Calculator, CalendarDays, Check, Menu, Percent, Tag, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  calculateAge,
  calculateDiscount,
  calculatePercentageChange,
  calculatePercentageOf,
  calculateValueForPercentage,
} from '@/lib/calculations';
import { parseLocalizedNumber } from '@/lib/input';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const metadata = {
  home: { title: 'حاسبها: حاسبات عربية للنسبة والعمر والخصم', description: 'اختر من حاسبات حاسبها العربية للنسبة المئوية والعمر والخصم. أدخل قيمك واحصل على نتيجة فورية، من دون إنشاء حساب أو حفظ الأرقام والتواريخ.' },
  percentage: { title: 'حاسبة النسبة المئوية والتغير بين رقمين | حاسبها', description: 'احسب نسبة رقم من رقم، أو اعرف العدد الذي تمثل نسبة محددة جزءًا منه، أو احسب نسبة الزيادة والنقصان بين قيمتين مع رسائل واضحة عند القسمة على صفر.' },
  age: { title: 'حاسبة العمر بالسنوات والأشهر والأيام | حاسبها', description: 'أدخل تاريخ الميلاد لمعرفة العمر بالسنوات والأشهر والأيام. يتحقق حاسبها من صحة التاريخ ويرفض التواريخ المستقبلية مع مراعاة أطوال الأشهر والسنوات الكبيسة.' },
  discount: { title: 'حاسبة الخصم والسعر النهائي وقيمة التوفير | حاسبها', description: 'احسب قيمة الخصم والسعر النهائي بعد التخفيض بسهولة. أدخل السعر ونسبة الخصم واختر عملتك بنفسك، أو اعرض النتيجة من دون افتراض عملة.' },
  privacy: { title: 'سياسة الخصوصية في حاسبها والتعامل مع المدخلات', description: 'اقرأ سياسة الخصوصية الأولية لموقع حاسبها، وما يحدث للمدخلات الرقمية وتواريخ الميلاد، وكيف تعمل الحاسبات من دون تسجيل أو حفظ بيانات الحساب.' },
  contact: { title: 'التواصل مع حاسبها للملاحظات والاستفسارات الرسمية', description: 'استخدم صفحة التواصل للاطلاع على قناة التواصل الرسمية بموقع حاسبها. ستضاف القناة المعتمدة هنا قبل نشر الموقع، من دون وضع بيانات تواصل غير مؤكدة.' },
};

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (selector: string, key: string, value: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    const configuredSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL?.trim();
    if (configuredSiteUrl) {
      const parsedSiteUrl = new URL(configuredSiteUrl);
      if (
        !['http:', 'https:'].includes(parsedSiteUrl.protocol) ||
        parsedSiteUrl.pathname !== '/' ||
        parsedSiteUrl.search ||
        parsedSiteUrl.hash ||
        parsedSiteUrl.username ||
        parsedSiteUrl.password
      ) {
        throw new Error('VITE_PUBLIC_SITE_URL يجب أن يكون عنوان الموقع الأساسي فقط.');
      }
      const canonicalUrl = `${parsedSiteUrl.origin}${window.location.pathname}`;
      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
      setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    }
  }, [title, description]);
}

const navItems = [
  { href: '/', label: 'الرئيسية' },
  { href: '/percentage', label: 'النسبة المئوية' },
  { href: '/age', label: 'العمر' },
  { href: '/discount', label: 'الخصم' },
];

function Header() {
  const [path] = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="حاسبها — الصفحة الرئيسية" data-testid="link-brand">
          <span className="brand-mark" aria-hidden="true">ح</span>
          <span>حاسبها</span>
        </Link>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link" aria-current={path === item.href ? 'page' : undefined} data-testid={`link-nav-${item.href === '/' ? 'home' : item.href.slice(1)}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="mobile-toggle" type="button" aria-label={open ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)} data-testid="button-mobile-menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="mobile-menu" id="mobile-navigation" aria-label="التنقل الرئيسي">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link" aria-current={path === item.href ? 'page' : undefined} data-testid={`link-mobile-${item.href === '/' ? 'home' : item.href.slice(1)}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span>حاسبها — أرقام واضحة، وخصوصية محترمة.</span>
        <nav className="footer-links" aria-label="روابط إضافية">
          <Link href="/privacy" data-testid="link-footer-privacy">الخصوصية</Link>
          <Link href="/contact" data-testid="link-footer-contact">تواصل معنا</Link>
        </nav>
      </div>
    </footer>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="site-shell" dir="rtl"><Header /><main className="page-main">{children}</main><AdPlaceholder /><Footer /></div>;
}

function AdPlaceholder() {
  return (
    <aside className="ad-placeholder container" aria-label="مساحة إعلانية اختيارية غير مفعّلة" data-ad-enabled="false">
      <span>مساحة إعلانية اختيارية — غير مفعّلة</span>
    </aside>
  );
}

function HomePage() {
  usePageMeta(metadata.home.title, metadata.home.description);
  const tools = [
    { href: '/percentage', title: 'حاسبة النسبة المئوية', description: 'اعرف قيمة النسبة، أو النسبة التي تمثلها قيمة، أو التغير بين رقمين.', icon: <Percent size={21} /> },
    { href: '/age', title: 'حاسبة العمر', description: 'العمر بالسنوات والأشهر والأيام، انطلاقاً من تاريخ الميلاد.', icon: <CalendarDays size={21} /> },
    { href: '/discount', title: 'حاسبة الخصم', description: 'احسب قيمة التوفير والسعر النهائي بعد التخفيض.', icon: <Tag size={21} /> },
  ];
  return (
    <>
      <section className="home-hero container">
        <span className="eyebrow">حسابات يومك، بلا تعقيد</span>
        <h1 className="hero-title">كل ما تحتاجه من حسابات،<br /><span>في مكان واحد.</span></h1>
        <p className="hero-copy">أدوات صغيرة لقرارات يومية أوضح. أدخل أرقامك، احصل على النتيجة، وانتهى الأمر — لا حسابات ولا حفظ للمدخلات.</p>
      </section>
      <section className="tool-section container" aria-labelledby="tools-heading">
        <div className="section-head">
          <h2 id="tools-heading">اختر الحاسبة المناسبة</h2>
          <p>ثلاث أدوات، وإجابة مباشرة.</p>
        </div>
        <div className="tool-grid grid grid-cols-1 md:grid-cols-3">
          {tools.map((tool) => (
            <Link href={tool.href} key={tool.href} className="tool-card" data-testid={`card-tool-${tool.href.slice(1)}`}>
              <span className="tool-icon" aria-hidden="true">{tool.icon}</span>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <span className="card-arrow" aria-hidden="true"><ArrowLeft size={18} /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function Breadcrumb({ current }: { current: string }) {
  return <nav className="breadcrumb" aria-label="مسار التنقل"><Link href="/">الرئيسية</Link><span aria-hidden="true">/</span><span aria-current="page">{current}</span></nav>;
}

function PageHeading({ title, description }: { title: string; description: string }) {
  return <div className="page-heading"><h1>{title}</h1><p>{description}</p></div>;
}

function NumberField({ id, label, value, onChange, placeholder, hint }: {
  id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; hint?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <span className="field-hint">{hint}</span>}
      <input className="input" id={id} name={id} type="text" inputMode="decimal" dir="ltr" autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} data-testid={`input-${id}`} />
    </div>
  );
}

function DateField({ id, label, value, onChange, max, hint }: {
  id: string; label: string; value: string; onChange: (value: string) => void; max?: string; hint?: string;
}) {
  return (
    <div className="field full">
      <label htmlFor={id}>{label}</label>
      {hint && <span className="field-hint">{hint}</span>}
      <input className="input" id={id} name={id} type="date" value={value} max={max} onChange={(event) => onChange(event.target.value)} data-testid={`input-${id}`} />
    </div>
  );
}

type Result = { caption: string; value: string; detail?: string } | null;

function ErrorMessage({ children }: { children: string }) {
  return <div className="form-error" role="alert" data-testid="status-calculation-error"><AlertCircle size={18} aria-hidden="true" /><span>{children}</span></div>;
}

function ResultBox({ result }: { result: Result }) {
  if (!result) return null;
  return <div className="result-panel" role="status" aria-live="polite" data-testid="result-calculation"><div className="result-caption">{result.caption}</div><div className="result-value">{result.value}</div>{result.detail && <div className="result-detail">{result.detail}</div>}</div>;
}

function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('ar', { maximumFractionDigits, minimumFractionDigits: 0 }).format(value);
}

type PercentageMode = 'of' | 'value' | 'change';
const percentageModes: { id: PercentageMode; label: string }[] = [
  { id: 'of', label: 'نسبة من عدد' },
  { id: 'value', label: 'العدد الأصلي' },
  { id: 'change', label: 'نسبة التغير' },
];

function PercentagePage() {
  usePageMeta(metadata.percentage.title, metadata.percentage.description);
  const [mode, setMode] = useState<PercentageMode>('of');
  const [percent, setPercent] = useState('');
  const [total, setTotal] = useState('');
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState('');

  const changeMode = (next: PercentageMode) => { setMode(next); setError(''); setResult(null); };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setResult(null);
    try {
      if (mode === 'of') {
        const p = parseLocalizedNumber(percent, 'النسبة المئوية');
        const base = parseLocalizedNumber(total, 'العدد');
        const answer = calculatePercentageOf(p, base);
        setResult({ caption: `${formatNumber(p)}٪ من ${formatNumber(base)} تساوي`, value: formatNumber(answer) });
      } else if (mode === 'value') {
        const amount = parseLocalizedNumber(value, 'القيمة');
        const p = parseLocalizedNumber(percent, 'النسبة المئوية');
        const answer = calculateValueForPercentage(amount, p);
        setResult({ caption: `${formatNumber(amount)} هي ${formatNumber(p)}٪ من`, value: formatNumber(answer) });
      } else {
        const start = parseLocalizedNumber(from, 'القيمة قبل التغيير');
        const end = parseLocalizedNumber(to, 'القيمة بعد التغيير');
        const answer = calculatePercentageChange(start, end);
        const direction = answer > 0 ? 'زيادة' : answer < 0 ? 'انخفاض' : 'من دون تغيير';
        setResult({ caption: `نسبة التغير هي ${direction}`, value: `${formatNumber(Math.abs(answer))}٪` });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'تعذر إجراء العملية. تحقق من القيم وحاول مرة أخرى.');
    }
  };

  return (
    <div className="container tool-page">
      <Breadcrumb current="النسبة المئوية" />
      <PageHeading title="حاسبة النسبة المئوية" description="ثلاث طرق لحساب النسبة، اختر ما يناسب سؤالك." />
      <section className="calculator-card" aria-label="حاسبة النسبة المئوية">
        <div className="mode-list" role="group" aria-label="نوع حساب النسبة">
          {percentageModes.map((item) => <button type="button" className="mode-button" key={item.id} aria-pressed={mode === item.id} onClick={() => changeMode(item.id)} data-testid={`button-mode-${item.id}`}>{item.label}</button>)}
        </div>
        <form onSubmit={submit} noValidate>
          <div className="fields grid grid-cols-1 sm:grid-cols-2">
            {mode === 'of' && <>
              <NumberField id="percent" label="النسبة المئوية" value={percent} onChange={setPercent} placeholder="مثال: 15" />
              <NumberField id="total" label="العدد" value={total} onChange={setTotal} placeholder="مثال: ٢٠٠" />
            </>}
            {mode === 'value' && <>
              <NumberField id="value" label="القيمة التي تعرفها" value={value} onChange={setValue} placeholder="مثال: ٣٠" />
              <NumberField id="percent" label="تمثل هذه القيمة نسبة" value={percent} onChange={setPercent} placeholder="مثال: 15" />
            </>}
            {mode === 'change' && <>
              <NumberField id="from" label="القيمة قبل التغيير" value={from} onChange={setFrom} placeholder="مثال: ٨٠" />
              <NumberField id="to" label="القيمة بعد التغيير" value={to} onChange={setTo} placeholder="مثال: ٩٢" />
            </>}
          </div>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <button className="submit-button" type="submit" data-testid="button-submit-percentage"><Calculator size={18} aria-hidden="true" />احسب النتيجة</button>
          <ResultBox result={result} />
        </form>
      </section>
      <aside className="info-strip"><Check size={18} aria-hidden="true" /><span>تُعرض النتيجة بعد إدخال القيم والضغط على «احسب النتيجة». لا يتم حفظ ما تدخله.</span></aside>
    </div>
  );
}

function getLocalISODate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function AgePage() {
  usePageMeta(metadata.age.title, metadata.age.description);
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setResult(null);
    try {
      if (!birthDate) throw new Error('يرجى اختيار تاريخ الميلاد.');
      const chosen = new Date(`${birthDate}T00:00:00`);
      if (!Number.isFinite(chosen.getTime())) throw new Error('تاريخ الميلاد غير صالح. يرجى اختياره من التقويم.');
      if (chosen > new Date()) throw new Error('تاريخ الميلاد لا يمكن أن يكون في المستقبل.');
      const age = calculateAge(birthDate);
      setResult({
        caption: 'عمرك حتى اليوم',
        value: `${formatNumber(age.years, 0)} سنة`,
        detail: `${formatNumber(age.months, 0)} شهر و${formatNumber(age.days, 0)} يوم`,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'تعذر حساب العمر. تحقق من التاريخ وحاول مرة أخرى.');
    }
  };
  return (
    <div className="container tool-page">
      <Breadcrumb current="العمر" />
      <PageHeading title="حاسبة العمر" description="أدخل تاريخ ميلادك لمعرفة عمرك بالسنوات والأشهر والأيام." />
      <section className="calculator-card" aria-label="حاسبة العمر">
        <form onSubmit={submit} noValidate>
          <div className="fields grid grid-cols-1 sm:grid-cols-2">
            <DateField id="birth-date" label="تاريخ الميلاد" value={birthDate} onChange={setBirthDate} max={getLocalISODate()} hint="اختر اليوم والشهر والسنة." />
          </div>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <button className="submit-button" type="submit" data-testid="button-submit-age"><Calculator size={18} aria-hidden="true" />احسب عمري</button>
          <ResultBox result={result} />
        </form>
      </section>
      <aside className="info-strip"><CalendarDays size={18} aria-hidden="true" /><span>يعتمد الحساب على تاريخ اليوم في جهازك. لا نحتفظ بتاريخ الميلاد أو بأي مدخلات.</span></aside>
    </div>
  );
}

const currencies = [
  { value: 'none', label: 'بلا عملة' },
  { value: 'SAR', label: 'ريال سعودي (ر.س)' },
  { value: 'AED', label: 'درهم إماراتي (د.إ)' },
  { value: 'KWD', label: 'دينار كويتي (د.ك)' },
  { value: 'USD', label: 'دولار أمريكي ($)' },
  { value: 'EUR', label: 'يورو (€)' },
];

function DiscountPage() {
  usePageMeta(metadata.discount.title, metadata.discount.description);
  const [price, setPrice] = useState('');
  const [percent, setPercent] = useState('');
  const [currency, setCurrency] = useState('none');
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState('');
  const formatPrice = (amount: number) => currency === 'none'
    ? formatNumber(amount)
    : new Intl.NumberFormat('ar', { style: 'currency', currency }).format(amount);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setResult(null);
    try {
      const original = parseLocalizedNumber(price, 'السعر الأصلي');
      const discountPercent = parseLocalizedNumber(percent, 'نسبة الخصم');
      if (original < 0) throw new Error('السعر لا يمكن أن يكون أقل من صفر.');
      if (discountPercent < 0 || discountPercent > 100) throw new Error('يجب أن تكون نسبة الخصم بين ٠ و١٠٠.');
      const answer = calculateDiscount(original, discountPercent);
      setResult({
        caption: 'السعر بعد الخصم',
        value: formatPrice(answer.finalPrice),
        detail: `وفّرت ${formatPrice(answer.discountAmount)} · قبل الخصم ${formatPrice(original)}`,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'تعذر حساب الخصم. تحقق من القيم وحاول مرة أخرى.');
    }
  };
  return (
    <div className="container tool-page">
      <Breadcrumb current="الخصم" />
      <PageHeading title="حاسبة الخصم" description="احسب السعر الجديد ومقدار التوفير قبل إتمام الشراء." />
      <section className="calculator-card" aria-label="حاسبة الخصم">
        <form onSubmit={submit} noValidate>
          <div className="fields grid grid-cols-1 sm:grid-cols-2">
            <NumberField id="price" label="السعر قبل الخصم" value={price} onChange={setPrice} placeholder="مثال: 250" />
            <NumberField id="discount-percent" label="نسبة الخصم" value={percent} onChange={setPercent} placeholder="مثال: 20" />
            <div className="field full">
              <label htmlFor="currency">العملة (اختياري)</label>
              <span className="field-hint">الافتراضي هو عرض النتيجة بلا عملة.</span>
              <select id="currency" className="select" value={currency} onChange={(event) => setCurrency(event.target.value)} data-testid="select-currency">
                {currencies.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
          </div>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <button className="submit-button" type="submit" data-testid="button-submit-discount"><Calculator size={18} aria-hidden="true" />احسب السعر</button>
          <ResultBox result={result} />
        </form>
      </section>
      <aside className="info-strip"><Tag size={18} aria-hidden="true" /><span>تظهر قيمة التوفير والسعر بعد الخصم. يمكنك تغيير العملة قبل الحساب أو إبقاؤها بلا عملة.</span></aside>
    </div>
  );
}

function PrivacyPage() {
  usePageMeta(metadata.privacy.title, metadata.privacy.description);
  return (
    <article className="container text-page">
      <Breadcrumb current="سياسة الخصوصية" />
      <h1>سياسة الخصوصية</h1>
      <p className="text-intro">هذه نسخة أولية قابلة للمراجعة والتحرير قبل النشر. هدف حاسبها أن يتيح حسابات سريعة من دون حساب مستخدم أو حفظ للمدخلات.</p>
      <section className="policy-block"><h2>المدخلات والحساب</h2><p>تُجرى العمليات الحسابية في متصفحك. لا يطلب الموقع إنشاء حساب، ولا يتعمد حفظ تواريخ الميلاد أو الأسعار أو أي أرقام تدخلها في الحاسبات.</p></section>
      <section className="policy-block"><h2>التخزين والتتبع</h2><p>لا تتضمن هذه النسخة وظيفة لحفظ النتائج أو استخدام التحليلات أو الإعلانات المفعّلة. قد تتغير هذه السياسة إذا أضيفت خدمات جديدة، وسيُحدّث هذا النص ليوضح ذلك قبل تفعيلها.</p></section>
      <section className="policy-block"><h2>مسؤولية الاستخدام</h2><p>النتائج تقديرية للاستخدام اليومي، ويُنصح بمراجعة الأرقام المهمة مع الجهة المختصة قبل اتخاذ قرار مالي أو رسمي.</p></section>
      <section className="policy-block"><h2>التعديلات والاستفسارات</h2><p>هذا النص نقطة بداية تحريرية وليس استشارة قانونية. تُراجع السياسة وتُحدّث عند الحاجة، ويمكن الرجوع إلى صفحة التواصل لمعرفة القناة الرسمية عند توفرها.</p></section>
    </article>
  );
}

function ContactPage() {
  usePageMeta(metadata.contact.title, metadata.contact.description);
  return (
    <article className="container text-page">
      <Breadcrumb current="تواصل معنا" />
      <h1>تواصل معنا</h1>
      <p className="text-intro">نرحب بملاحظاتك حول تجربة حاسبها أو اقتراحاتك لتحسين الحاسبات.</p>
      <section className="policy-block"><h2>كيف ترسل ملاحظتك؟</h2><p>لم تُضف إلى هذه الصفحة بيانات تواصل غير مؤكدة. ستظهر هنا قناة التواصل الرسمية عند اعتمادها ونشرها.</p></section>
      <section className="policy-block"><h2>ما الذي يفيدنا؟</h2><p>إذا واجهت نتيجة غير متوقعة، اذكر اسم الحاسبة والخطوات التي أدت إلى المشكلة. تجنب إرسال معلومات شخصية أو أرقام لا ترغب في مشاركتها.</p></section>
    </article>
  );
}

function NotFound() {
  usePageMeta('الصفحة غير موجودة — حاسبها', 'الصفحة التي تبحث عنها غير متاحة. ارجع إلى حاسبها لاختيار إحدى الحاسبات اليومية.');
  return <div className="container not-found"><h1>هذه الصفحة غير متاحة</h1><p>قد يكون الرابط غير صحيح أو أن الصفحة نُقلت.</p><Link href="/" className="back-home" data-testid="link-back-home">العودة إلى الرئيسية</Link></div>;
}

function Router() {
  return (
    <Shell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/percentage" component={PercentagePage} />
          <Route path="/age" component={AgePage} />
          <Route path="/discount" component={DiscountPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/contact" component={ContactPage} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Shell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
