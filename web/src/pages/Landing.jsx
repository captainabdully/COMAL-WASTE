import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Heart, Mail, MapPin, Menu, Phone, Quote, Star, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import heroImage from '../../images/heroImage.jpeg';
import skrepachapImage from '../../images/skrepachap.jpeg';
import appLogo from '../../images/APP (1).png';
import heavyImage from '../../images/heavy.jpeg';
import lightImage from '../../images/light.jpeg';
import castImage from '../../images/cast.jpeg';
import mixerImage from '../../images/mixer.jpeg';
import skepa1Image from '../../images/skrepa1.jpeg';
import skepa2Image from '../../images/skrepa2.jpeg';
import skepa3Image from '../../images/skrepa3.jpeg';

// Brand glyphs were dropped from lucide-react, so these three are inlined (same 24px stroke style).
const Svg = ({ children }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const Linkedin = () => <Svg><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></Svg>;
const Instagram = () => <Svg><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></Svg>;
const Twitter = () => <Svg><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></Svg>;

const IMG = {
  hero: heroImage,
  solutions: skrepachapImage,
  heavy: heavyImage,
  light: lightImage,
  cast: castImage,
  mixer: mixerImage,
  p1: skepa1Image,
  p2: skepa2Image,
  p3: skepa3Image,
};

// Keep the background and alt text visible if an image cannot load.
const Photo = ({ src, alt, className = '' }) => (
  <img key={src} src={src} alt={alt} loading="lazy" className={`bg-gradient-to-br from-slate-200 to-slate-300 ${className}`} />
);

const links = [['Solutions', '#solutions'], ['Expertise', '#services'], ['Projects', '#realisations'], ['Contact', '#contact']];

const solutions = [
  ['01', 'Login OR create New Account', 'Create an account or log in to access your dashboard and manage your collections.'],
  ['02', 'Stay updated to daily prices', 'Prices per kilo are published every day for each dropping point and category, so you always know what you earn.'],
  ['03', 'Pick-up requests', 'Upload a photo of your scrap with the request so the team can confirm the load before they arrive.'],
  ['04', 'Process and follow-up', 'Follow every order from pending to completed, with rejection reasons and notes visible in your account.'],
];

const services = [
  ['Heavy metal', 'Structural steel, rails, machinery and thick plate.', IMG.heavy],
  ['Light metal', 'Sheet metal, cans, aluminium and thin offcuts.', IMG.light],
  ['Cast metal', 'Engine blocks, pipes, radiators and cast iron parts.', IMG.cast],
  ['Mixed scrap', 'Mixed loads — we sort and price what you bring.', IMG.mixer],
];

const stats = [['+10', 'Dropping points'], ['98%', 'Happy vendors'], ['+30%', 'Better payout'], ['100%', 'Recycled']];

const projects = [
  ['Tanzania Port Authority (TPA)', 'More than 1000 metric tonnes of scrap metal recovered in one day.', IMG.p1],
  ['Orxy Cylinder Project', 'Weekly collections of scrap metals.', IMG.p2],
  ['Bagamoyo Sugar', '100+ Metric tonnes of scrap metals collection, weighed on site.', IMG.p3],
];

const testimonials = [
  ['Selling scrap used to take a whole day. Now I submit the request and the team is at my gate the next morning.', 'Amina J.', 'Workshop owner'],
  ['The daily price list is clear and honest. I plan my loads around the best-paying dropping point.', 'Juma M.', 'Independent collector'],
  ['Photos, weights and status in one place — no more phone-tag about where my order is.', 'Neema K.', 'Demolition contractor'],
];

const faqs = [
  ['How do I request a pickup?', 'Create a free account, choose a dropping point and category, enter the quantity, add a photo and submit. You can track it from your account.'],
  ['Which metals do you accept?', 'Heavy, light, cast and mixed scrap. Today’s price for each category is shown per dropping point.'],
  ['Can I use the website and the mobile app?', 'Yes — they use the same account and the same data, so your orders appear on both.'],
];

const logo = (label, i) => (
  <svg key={i} viewBox="0 0 180 56" className="h-10 w-auto shrink-0" role="img" aria-label={label}>
    <rect x="2" y="12" width="32" height="32" rx="8" fill="currentColor" opacity=".9" />
    <text x="44" y="35" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="18" fontWeight="700" fill="currentColor">{label}</text>
  </svg>
);
const partners = ['EcoMetal', 'GreenCycle', 'SteelWorks', 'RecyPro', 'MetalHub', 'CircularCo'];
const approvals = ['TBS Certified', 'NEMC Approved', 'ISO 14001', 'Green Tanzania', 'Recycle Africa', 'Eco Label'];

export default function Landing() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [faq, setFaq] = useState(0);
  const [form, setForm] = useState({ first: '', last: '', email: '', qty: '', message: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const cta = user ? { to: '/app', label: 'Open my account' } : { to: '/sign-in', label: 'Request a pickup' };

  // There is no contact endpoint in the backend, so the form hands off to the user's mail client.
  const sendContact = (e) => {
    e.preventDefault();
    const body = `Name: ${form.first} ${form.last}\nEmail: ${form.email}\nEstimated quantity: ${form.qty}\n\n${form.message}`;
    window.location.href = `mailto:info@countrymaterial.com?subject=${encodeURIComponent('Skrepa Chap enquiry')}&body=${encodeURIComponent(body)}`;
  };

  const btn = 'inline-flex items-center justify-center gap-2 rounded-full bg-green-700 text-white font-semibold px-6 py-3 transition-all duration-300 hover:bg-green-800 hover:scale-105 hover:shadow-lg hover:shadow-green-700/30';
  const field = 'w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200';

  return (
    <div className="font-sans text-slate-900 bg-white selection:bg-green-100 selection:text-green-900 overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <img src={appLogo} alt="Skrepa Chap logo" className="w-10 h-10 rounded-xl object-contain" />
            <span className="text-xl font-bold tracking-tight">Skrepa Chap</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {links.map(([l, h]) => <a key={h} href={h} className="text-slate-600 hover:text-slate-900 transition-colors">{l}</a>)}
          </div>
          <div className="hidden md:flex items-center gap-3">
            {!user && <Link to="/sign-in" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3">Sign in</Link>}
            <Link to={cta.to} className={`${btn} text-sm`}>{cta.label}</Link>
          </div>
          <button className="md:hidden p-2" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </div>
        {open && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 px-5 py-4 flex flex-col gap-4">
            {links.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-900 font-medium">{l}</a>)}
            {!user && <Link to="/sign-in" className="text-slate-600 font-medium">Sign in</Link>}
            <Link to={cta.to} className={btn}>{cta.label}</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <header id="top" className="pt-32 pb-20 lg:pt-40">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block rounded-full bg-green-50 text-green-800 text-sm font-semibold px-4 py-1.5 mb-6">Scrap metal pickup, made simple</span>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">Sustainably <span className="text-green-700">Building the future!</span></h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl">See today’s prices, request a free pickup in minutes and track every order. Less hauling, better payouts, and a cleaner city — from any phone or computer.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={cta.to} className={btn}>{cta.label}<ArrowRight className="w-4 h-4" /></Link>
              <a href="#solutions" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">How it works</a>
            </div>
          
          </div>
          <div className="relative mx-6 lg:mx-0">
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-[2rem] bg-yellow-400" />
            <div className="absolute -bottom-8 -right-8 w-56 h-56 rounded-[2rem] bg-slate-900" />
            <Photo src={IMG.hero} alt="Sorted scrap metal" className="relative z-10 w-full aspect-[4/5] object-cover rounded-[2rem] shadow-2xl" />
          </div>
        </div>
      </header>

      {/* SOLUTIONS */}
      <section id="solutions" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute inset-y-8 -left-6 w-2/3 rounded-[2rem] bg-yellow-400" />
            <Photo src={IMG.solutions} alt="Skrepa Chap mobile app" className="relative z-10 block w-full h-auto rounded-[2rem] shadow-xl" />
          </div>
          <div>
            <p className="text-green-700 font-semibold mb-3">Solutions</p>
            <h2 className="text-4xl font-bold tracking-tight">Skrepa chap Mobile App!!</h2>
            <ol className="mt-10 space-y-8">
              {solutions.map(([n, t, d]) => (
                <li key={n} className="flex gap-6">
                  <span className="text-4xl font-bold text-yellow-400 leading-none">{n}</span>
                  <div><h3 className="text-xl font-semibold">{t}</h3><p className="mt-1 text-slate-600">{d}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* EXPERTISE */}
      <section id="services" className="py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="max-w-2xl mb-14">
            <p className="text-green-700 font-semibold mb-3">Expertise</p>
            <h2 className="text-4xl font-bold tracking-tight">Every kind of metal, priced by category</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(([t, d, img]) => (
              <article key={t} className="group relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-slate-900">
                <Photo src={img} alt={t} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 p-6 text-white"><h3 className="text-xl font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-200">{d}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100 border border-slate-100 rounded-[2rem] py-10 shadow-sm">
            {stats.map(([v, l]) => (
              <div key={l} className="text-center px-4 py-3"><p className="text-4xl lg:text-5xl font-bold text-green-700">{v}</p><p className="mt-2 text-slate-600">{l}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* RÉALISATIONS */}
      <section id="realisations" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="max-w-2xl mb-14">
            <p className="text-green-700 font-semibold mb-3">Projects</p>
            <h2 className="text-4xl font-bold tracking-tight">Recent collections</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map(([t, d, img]) => (
              <article key={t} className="group">
                <div className="overflow-hidden rounded-[2rem] aspect-[4/3] bg-slate-200">
                  <Photo src={img} alt={t} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{t}</h3><p className="text-slate-600">{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-4xl font-bold tracking-tight mb-14 max-w-2xl">What our vendors say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(([q, n, r]) => (
              <figure key={n} className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
                <Quote className="w-8 h-8 text-yellow-400" />
                <div className="flex gap-0.5 mt-4 text-yellow-400">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                <blockquote className="mt-4 text-slate-700">{q}</blockquote>
                <figcaption className="mt-6 font-semibold">{n}<span className="block text-sm font-normal text-slate-500">{r}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-4xl font-bold tracking-tight mb-10 text-center">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map(([q, a], i) => (
              <div key={q} className="rounded-[2rem] border border-slate-100 px-6">
                <button className="w-full flex items-center justify-between py-5 text-left font-semibold" aria-expanded={faq === i} onClick={() => setFaq(faq === i ? -1 : i)}>
                  {q}<ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${faq === i ? 'rotate-180' : ''}`} />
                </button>
                {faq === i && <p className="pb-5 text-slate-600">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative py-24 bg-slate-900 text-white overflow-hidden scroll-mt-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-700/30 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-yellow-400/20 blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tight">Let’s talk about your scrap</h2>
            <p className="mt-4 text-slate-300 max-w-md">Large load, regular contract or just a question? Tell us and we’ll get back to you.</p>
            <ul className="mt-10 space-y-6">
              {[[Phone, 'Phone', '+255 768 500 555'], [Mail, 'Email', 'info@countrymaterial.com'], [MapPin, 'Address', 'Country Material Limited, Tanzania']].map(([Icon, l, v]) => (
                <li key={l} className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                  <span><span className="block text-sm text-slate-400">{l}</span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={sendContact} className="bg-white text-slate-900 rounded-[2rem] p-8 shadow-2xl space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-medium">First name<input required className={`${field} mt-1`} value={form.first} onChange={set('first')} /></label>
              <label className="block text-sm font-medium">Last name<input required className={`${field} mt-1`} value={form.last} onChange={set('last')} /></label>
            </div>
            <label className="block text-sm font-medium">Email<input required type="email" className={`${field} mt-1`} value={form.email} onChange={set('email')} /></label>
            {/* <label className="block text-sm font-medium">Estimated quantity (kg)<input className={`${field} mt-1`} inputMode="decimal" value={form.qty} onChange={set('qty')} /></label> */}
            <label className="block text-sm font-medium">Message<textarea required rows={4} className={`${field} mt-1`} value={form.message} onChange={set('message')} /></label>
            <button type="submit" className={`${btn} w-full`}>Send message<ArrowRight className="w-4 h-4" /></button>
          </form>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-14 bg-white" aria-label="Approvals">
        <p className="text-center text-xs uppercase tracking-widest text-slate-400 mb-8">Approved by recycling experts</p>
        <div className="group relative overflow-hidden">
          <div className="absolute left-0 inset-y-0 w-32 z-10 bg-gradient-to-r from-white to-transparent" />
          <div className="absolute right-0 inset-y-0 w-32 z-10 bg-gradient-to-l from-white to-transparent" />
          <div className="flex w-max animate-scroll-left [&>*]:mr-16 group-hover:[animation-play-state:paused] text-slate-900 grayscale opacity-60">
            {[...approvals, ...approvals].map((a, i) => logo(a, i))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-5 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5"><img src={appLogo} alt="Skrepa Chap logo" className="w-10 h-10 rounded-xl object-contain" /><span className="text-xl font-bold">Skrepa Chap</span></div>
            <p className="mt-4 text-green-100 text-sm max-w-xs">Scrap metal pickup by Country Material Limited. Better prices, less hassle.</p>
            <div className="mt-5 flex gap-3">{[[Linkedin, 'LinkedIn'], [Instagram, 'Instagram'], [Twitter, 'Twitter']].map(([I, l]) => (
              <a key={l} href="#top" aria-label={l} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:scale-110"><I /></a>))}</div>
          </div>
          <div><h4 className="font-semibold mb-4">Expertise</h4><ul className="space-y-2 text-sm text-green-100">{['Heavy metal', 'Light metal', 'Cast metal', 'Mixed scrap'].map((l) => <li key={l}><a href="#services" className="hover:text-white">{l}</a></li>)}</ul></div>
          <div><h4 className="font-semibold mb-4">Company</h4><ul className="space-y-2 text-sm text-green-100"><li><a href="#solutions" className="hover:text-white">Solutions</a></li><li><a href="#realisations" className="hover:text-white">Projects</a></li><li><a href="#contact" className="hover:text-white">Contact</a></li><li><Link to="/sign-in" className="hover:text-white">Sign in</Link></li></ul></div>
          <div><h4 className="font-semibold mb-4">Legal</h4><ul className="space-y-2 text-sm text-green-100"><li><Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li><li><Link to="/terms" className="hover:text-white">Privacy Policy</Link></li></ul></div>
        </div>
        <div className="border-t border-white/20">
          <div className="max-w-7xl mx-auto px-5 py-6 flex flex-col sm:flex-row justify-between gap-2 text-sm text-green-100">
            <p>© {new Date().getFullYear()} Country Material Limited. All rights reserved.</p>
            <p className="flex items-center gap-1.5">Made with <Heart className="w-4 h-4 fill-current" /> in Tanzania</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
