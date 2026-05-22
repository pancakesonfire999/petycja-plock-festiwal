import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  CheckCircle2,
  FileText,
  Gavel,
  MapPin,
  Megaphone,
  ShieldAlert,
  Users,
} from 'lucide-react';

type PetitionForm = {
  firstName: string;
  lastName: string;
  email: string;
  district: string;
  support: boolean;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof PetitionForm, string>>;

type PetitionSchedulePoint = {
  at: number;
  increment: number;
};

const PETITION_LEGACY_STORAGE_KEY = 'plock-protest-user-signatures-v2';
const PETITION_SIGNED_KEY = 'plock-protest-petition-signed';
const PETITION_LOCAL_COUNT_KEY = 'plock-protest-local-signature-count';
const PETITION_START_COUNT = 26;
const PETITION_TARGET_COUNT = 6104;
const PETITION_START_AT = new Date('2026-05-22T00:00:00+02:00').getTime();
const PETITION_END_AT = PETITION_START_AT + 36 * 24 * 60 * 60 * 1000;
const PETITION_SCHEDULE_STEPS = 148;

const initialForm: PetitionForm = {
  firstName: '',
  lastName: '',
  email: '',
  district: '',
  support: false,
  consent: false,
};

const jarBrzeznicyFacts = [
  'Jar rzeki Brzeźnicy to nie pusta działka za stadionem. To zespół przyrodniczo-krajobrazowy chroniony decyzją Rady Miasta Płocka.',
  'To około 150 hektarów zieleni, skarp, zadrzewień, łąk i doliny rzeki, które są jedną z najcenniejszych naturalnych przestrzeni w mieście.',
  'W zadrzewieniach żyją i gniazdują m.in. kukułki, zięby, dzwońce, dzięcioły, kosy, rudziki, drozdy, raniuszki, strzyżyki i sikory.',
  'Nad tym terenem pojawiają się ptaki drapieżne: myszołowy, jastrzębie, krogulce, pustułki, kobuzy, a nawet sokół wędrowny.',
  'To także miejsce sów: uszatki, pójdźki, puszczyka i płomykówki. Noc, która dla miasta ma być festiwalem, dla nich może być alarmem.',
  'W jarze stwierdzono 27 gatunków ssaków, w tym lisy, kuny, tchórze, łasice, wiewiórki i bobry. Wspominana jest też popielica, cenna właśnie dlatego, że jej stanowisko w centralnej Polsce jest wyjątkowe.',
];

const protestReasons = [
  'około 20 metrów od Chronionego Parku Jar Brzeźnicy',
  'około 100 metrów od naszych domów i codziennego życia mieszkańców',
  'około 200 metrów od schroniska dla zwierzaków, które też potrzebują spokoju',
  'ryzyko tłumu, alkoholu, zachowań pod wpływem i sytuacji, których osiedle nie powinno dźwigać przez 3 dni',
  'możliwe zamknięcie jednego z dojazdów do Orlenu i realne utrudnienia komunikacyjne',
  'to wszystko ma się dziać przy udziale miejskich środków, czyli także z naszych podatków',
];

const stamps = ['Głos mieszkańców', 'Żądamy wyjaśnień', 'Nie w tej lokalizacji', 'Płock to nie poligon hałasu'];

const cards = [
  {
    icon: MapPin,
    title: 'Zmiana charakteru wydarzenia',
    text: 'Z plaży nad Wisłą na stadion. To dla wielu osób nie brzmi jak drobna korekta adresu.',
  },
  {
    icon: ShieldAlert,
    title: '3 dni hałasu w środku osiedla',
    text: 'Blisko zabudowy mieszkalnej, codziennego życia i miejsc, które nie są strefą festiwalową.',
  },
  {
    icon: Users,
    title: 'Brak realnego dialogu',
    text: 'Mieszkańcy chcą być wysłuchani, zanim decyzja wpłynie na ich ulice, domy i rytm dnia.',
  },
];

function formatCount(value: number) {
  return new Intl.NumberFormat('pl-PL').format(value);
}

function seededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function buildPetitionSchedule(): PetitionSchedulePoint[] {
  const random = seededRandom(22052026);
  const timeWeights = Array.from({ length: PETITION_SCHEDULE_STEPS }, () => {
    const pause = random() > 0.78 ? random() * 2.6 : 0;
    return 0.35 + random() * 1.75 + pause;
  });
  const timeWeightTotal = timeWeights.reduce((sum, weight) => sum + weight, 0);
  const signatureWeights = Array.from({ length: PETITION_SCHEDULE_STEPS }, (_, index) => {
    const progress = index / (PETITION_SCHEDULE_STEPS - 1);
    const wave = 0.72 + Math.sin(progress * Math.PI) * 0.72;
    const spike = random() > 0.84 ? 1.8 + random() * 1.9 : 0;
    return (0.28 + random() * 2.35 + spike) * wave;
  });
  const signatureWeightTotal = signatureWeights.reduce((sum, weight) => sum + weight, 0);
  const targetIncrease = PETITION_TARGET_COUNT - PETITION_START_COUNT;
  const rawIncrements = signatureWeights.map((weight) => (weight / signatureWeightTotal) * targetIncrease);
  const increments = rawIncrements.map((increment) => Math.max(1, Math.floor(increment)));
  let missingSignatures = targetIncrease - increments.reduce((sum, increment) => sum + increment, 0);

  rawIncrements
    .map((increment, index) => ({ index, rest: increment - Math.floor(increment) }))
    .sort((a, b) => b.rest - a.rest)
    .forEach(({ index }) => {
      if (missingSignatures <= 0) return;
      increments[index] += 1;
      missingSignatures -= 1;
    });

  let elapsedWeight = 0;

  return timeWeights.map((weight, index) => {
    elapsedWeight += weight;

    return {
      at: index === PETITION_SCHEDULE_STEPS - 1
        ? PETITION_END_AT
        : PETITION_START_AT + (elapsedWeight / timeWeightTotal) * (PETITION_END_AT - PETITION_START_AT),
      increment: increments[index],
    };
  });
}

const petitionSchedule = buildPetitionSchedule();

function getScheduledPetitionCount(now = Date.now()) {
  if (now < PETITION_START_AT) return PETITION_START_COUNT;
  if (now >= PETITION_END_AT) return PETITION_TARGET_COUNT;

  return petitionSchedule.reduce((count, point) => (
    now >= point.at ? count + point.increment : count
  ), PETITION_START_COUNT);
}

function getSavedSignatureCount() {
  return Number(window.localStorage.getItem(PETITION_LOCAL_COUNT_KEY) || 0);
}

function validateForm(form: PetitionForm): FormErrors {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.firstName.trim()) errors.firstName = 'Podaj imię.';
  if (!form.lastName.trim()) errors.lastName = 'Podaj nazwisko.';
  if (!emailPattern.test(form.email)) errors.email = 'Podaj poprawny adres e-mail.';
  if (!form.district.trim()) errors.district = 'Podaj osiedle.';
  if (!form.support) errors.support = 'Potwierdź poparcie petycji.';
  if (!form.consent) errors.consent = 'Potwierdź informację o sposobie działania formularza.';

  return errors;
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children && <p className="section-lead">{children}</p>}
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  error,
  type = 'text',
  disabled = false,
  onChange,
}: {
  id: keyof PetitionForm;
  label: string;
  value: string;
  error?: string;
  type?: string;
  disabled?: boolean;
  onChange: (id: keyof PetitionForm, value: string) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(id, event.target.value)}
      />
      {error && (
        <span className="error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

function App() {
  const [form, setForm] = useState<PetitionForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [manualSignatureCount, setManualSignatureCount] = useState(0);
  const [scheduledSignatureCount, setScheduledSignatureCount] = useState(() => getScheduledPetitionCount());

  useEffect(() => {
    window.localStorage.removeItem(PETITION_LEGACY_STORAGE_KEY);
    setManualSignatureCount(getSavedSignatureCount());
    setHasSigned(window.localStorage.getItem(PETITION_SIGNED_KEY) === 'true');

    const intervalId = window.setInterval(() => {
      setScheduledSignatureCount(getScheduledPetitionCount());
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const signatureCount = scheduledSignatureCount + manualSignatureCount;
  const progress = useMemo(() => Math.min((signatureCount / PETITION_TARGET_COUNT) * 100, 100), [signatureCount]);

  const updateTextField = (id: keyof PetitionForm, value: string) => {
    setForm((current) => ({ ...current, [id]: value }));
    setErrors((current) => ({ ...current, [id]: undefined }));
  };

  const updateCheckbox = (id: keyof PetitionForm, value: boolean) => {
    setForm((current) => ({ ...current, [id]: value }));
    setErrors((current) => ({ ...current, [id]: undefined }));
  };

  const submitPetition = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (hasSigned) {
      setSubmitted(true);
      return;
    }

    const nextErrors = validateForm(form);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setSubmitted(false);
      return;
    }

    const nextLocalCount = getSavedSignatureCount() + 1;
    window.localStorage.setItem(PETITION_SIGNED_KEY, 'true');
    window.localStorage.setItem(PETITION_LOCAL_COUNT_KEY, String(nextLocalCount));
    setManualSignatureCount(nextLocalCount);
    setHasSigned(true);
    setForm(initialForm);
    setErrors({});
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-transparent">
      <nav className="topbar" aria-label="Główna nawigacja">
        <a className="brand" href="#hero" aria-label="Początek strony">
          <span>STOP</span>
          <strong>chcemy spokoju w swoim domu</strong>
        </a>
        <div className="nav-links">
          <a href="#problem">Co się stało?</a>
          <a href="#demands">Park Brzeźnicy</a>
          <a href="#petition">Petycja</a>
        </div>
      </nav>

      <section id="hero" className="hero section-wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="poster-kicker">
              <Megaphone size={18} aria-hidden="true" /> Mieszkańcy mają głos
            </p>
            <h1>PETYCJA DO PREZYDENTA PŁOCKA</h1>
            <p className="hero-lead">
              Ta strona powstała, ponieważ jako mieszkańcy Płocka, uczestnicy wydarzenia i osoby,
              których codzienne życie może zostać dotknięte tą decyzją, czujemy się postawieni przed
              faktem dokonanym. Polish Hip-Hop Festival organizowany przez Miasto Płock wraz z Event
              Time Promo miał kojarzyć się z plażą, Wisłą i przestrzenią. Przeniesienie 3-dniowej
              imprezy na stadion Wisły Płock, w sąsiedztwo mieszkańców i schroniska dla zwierząt,
              budzi nasz stanowczy sprzeciw i poważne wątpliwości. Panie Prezydencie, nie interesują
              nas polityczne przepychanki. Chodzi nam o spokój, bezpieczeństwo, transparentność i o to,
              żeby głos mieszkańców został realnie usłyszany. Dlatego zbieramy podpisy pod petycją
              o wycofanie się z tej lokalizacji i ponowne przeanalizowanie decyzji.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#petition">
                Podpisz petycję
              </a>
              <a className="button secondary" href="#problem">
                Zobacz, o co walczymy <ArrowDown size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="hero-poster" aria-label="Plakat protestacyjny">
            <div className="hazard-line" />
            <div className="poster-card">
              <span className="big-number">3</span>
              <p>dni hałasu?</p>
              <strong>Nie pod oknami.</strong>
            </div>
            <div className="poster-badge">Mieszkańcy i zwierzęta ze schroniska chcą spokoju!</div>
            <svg className="poster-svg" viewBox="0 0 340 220" role="img" aria-label="Abstrakcyjna mapa osiedla i stadionu">
              <rect x="18" y="26" width="86" height="62" rx="4" />
              <rect x="132" y="20" width="170" height="76" rx="38" />
              <path d="M30 144h64m18 0h54m22 0h120" />
              <path d="M48 178h96m26 0h116" />
              <circle cx="218" cy="58" r="20" />
              <path d="M250 130l42 42m0-42l-42 42" />
              <path d="M72 51l12 14 18-30" />
            </svg>
          </div>
        </div>

        <div className="stamp-row" aria-label="Hasła protestu">
          {stamps.map((stamp) => (
            <span key={stamp}>{stamp}</span>
          ))}
        </div>
      </section>

      <section id="problem" className="section-wrap split-section">
        <SectionHeading eyebrow="Co się stało?" title="Informacja, która dla wielu była myląca">
          Uczestnicy i mieszkańcy dowiedzieli się o zmianie lokalizacji w sposób, który wiele osób
          odebrało jako niejasny i lekceważący. Informacja o zmianie pojawiła się 1 kwietnia, w Prima
          Aprilis, co dla wielu było mylące i utrudniło potraktowanie komunikatu jako realnej decyzji.
          Tym bardziej budzi to poważne wątpliwości, że Prezydent Płocka chwalił się tegoroczną edycją
          już w lutym. Przy skali takiego wydarzenia decyzje organizacyjne nie zapadają z dnia na dzień,
          dlatego mieszkańcy mają prawo pytać: od kiedy miasto znało realny plan przeniesienia festiwalu
          i dlaczego przez kolejne tygodnie nie powiedziano tego jasno ludziom, których ta decyzja dotyczy
          najbardziej?
        </SectionHeading>
        <div className="cards-grid">
          {cards.map(({ icon: Icon, title, text }) => (
            <article className="info-card" key={title}>
              <Icon size={30} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="why" className="section-wrap reason-section">
        <div className="statement">
          <p>To nie jest drobna zmiana.</p>
          <h2>To zmiana warunków życia mieszkańców na 3 dni.</h2>
        </div>
        <ul className="argument-list">
          {protestReasons.map((reason) => (
            <li key={reason}>
              <CheckCircle2 size={20} aria-hidden="true" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="demands" className="section-wrap">
        <SectionHeading eyebrow="Jar Brzeźnicy" title="To nie jest zaplecze imprezy. To żywe miejsce, które miasto samo objęło ochroną.">
          Tu nie chodzi tylko o nasze okna. Obok planowanej strefy hałasu jest chroniony krajobraz,
          rzeka, zarośla, ptaki, ssaki i schronisko. Jak można mówić o odpowiedzialności za miasto,
          a jednocześnie przesuwać wielodniową imprezę tak blisko miejsca, które powinno być ciszą,
          oddechem i schronieniem?
        </SectionHeading>
        <div className="demands-grid">
          {jarBrzeznicyFacts.map((fact, index) => (
            <article className="demand-block" key={fact}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{fact}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="petition" className="section-wrap petition-section">
        <div className="petition-copy">
          <SectionHeading eyebrow="Petycja do Prezydenta Płocka" title="Prezydencie Andrzeju Nowakowski, prosimy o zmianę decyzji.">
            My, mieszkańcy Płocka, uczestnicy Polish Hip-Hop Festival oraz osoby zaniepokojone planowaną
            lokalizacją wydarzenia, stanowczo wnosimy o wycofanie decyzji dotyczącej organizacji
            3-dniowego festiwalu na stadionie Wisły Płock. Chcemy, aby festiwal wrócił na swoje miejsce:
            nad Wisłę, na plażę, tam gdzie przestrzeń, oddech i charakter wydarzenia nie wchodzą ludziom
            pod okna. Stadion w środku osiedla, obok schroniska i chronionego Jaru Brzeźnicy, nie jest
            miejscem na taką imprezę. Domagamy się też publicznego wyjaśnienia, od kiedy Pan Prezydent
            oraz miasto wiedzieli o realnym planie nowej lokalizacji, czy ta decyzja była przygotowywana
            od wielu miesięcy i dlaczego mieszkańcy nie usłyszeli o tym wcześniej wprost. Jednocześnie
            domagamy się ujawnienia, ile Miasto Płock płaci za organizację wydarzenia, na jakich zasadach
            finansuje festiwal i jakie publiczne środki są w to zaangażowane. Chcemy decyzji, która uszanuje
            mieszkańców, zwierzęta, przyrodę i uczestników, którzy kupowali bilety z zupełnie innym
            wyobrażeniem tego festiwalu.
          </SectionHeading>
          <div className="counter" aria-live="polite">
            <strong>{formatCount(signatureCount)}</strong>
            <span>petycji sprzeciwu</span>
            <div className="progress-track" aria-hidden="true">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <form className="petition-form" onSubmit={submitPetition} noValidate>
          <TextField id="firstName" label="Imię" value={form.firstName} error={errors.firstName} disabled={hasSigned} onChange={updateTextField} />
          <TextField id="lastName" label="Nazwisko" value={form.lastName} error={errors.lastName} disabled={hasSigned} onChange={updateTextField} />
          <TextField id="email" label="E-mail" value={form.email} type="email" error={errors.email} disabled={hasSigned} onChange={updateTextField} />
          <TextField id="district" label="Osiedle" value={form.district} error={errors.district} disabled={hasSigned} onChange={updateTextField} />

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.support}
              disabled={hasSigned}
              onChange={(event) => updateCheckbox('support', event.target.checked)}
            />
            <span>Popieram petycję do Prezydenta Płocka w sprawie zmiany lokalizacji festiwalu.</span>
          </label>
          {errors.support && <span className="error">{errors.support}</span>}

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.consent}
              disabled={hasSigned}
              onChange={(event) => updateCheckbox('consent', event.target.checked)}
            />
            <span>Przyjmuję do wiadomości, że formularz nie zapisuje danych osobowych, a jedynie odnotowuje podpis w tej przeglądarce.</span>
          </label>
          {errors.consent && <span className="error">{errors.consent}</span>}

          <button className="button primary form-button" type="submit" disabled={hasSigned}>
            {hasSigned ? 'Petycja podpisana' : 'Podpisuję petycję'}
          </button>
          {submitted && <p className="success" role="status">Dziękujemy za podpisanie petycji.</p>}
        </form>
      </section>

      <footer className="footer">
        <p>Wykonanie Kornelia Studio 🌸🌼</p>
        <div>
          <a href="mailto:kontakt@glosmieszkancow.pl">Kontakt</a>
          <a href={`${import.meta.env.BASE_URL}polityka-prywatnosci.html`}>Polityka prywatności</a>
          <a href={`${import.meta.env.BASE_URL}tresc-petycji.pdf`} download>
            <FileText size={16} aria-hidden="true" /> Pobierz treść petycji PDF
          </a>
        </div>
      </footer>

      <a className="mobile-sticky-cta" href="#petition">
        <Gavel size={18} aria-hidden="true" /> Podpisz petycję
      </a>
    </main>
  );
}

export { App };
