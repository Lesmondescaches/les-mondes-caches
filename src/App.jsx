import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin, Sparkles, Settings, X, Plus, Trash2, ArrowLeft, Check, Users, Calendar,
  Clock, Coins, Loader2, Leaf, Mail, Phone, ChevronDown, ChevronUp, Download,
  CalendarPlus, Star, ScrollText, Lock, Upload
} from "lucide-react";
import { supabase } from "./supabaseClient";

function LogoMonde({ className = "" }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 200" className={className} role="img" aria-label="Logo Les Mondes Cachés : une bulle paisible au clair de lune">
      <defs>
        <clipPath id="lmc-bubble-clip">
          <path d="M100,14 C138,10 186,42 190,96 C193,148 154,192 101,190 C54,188 10,152 12,98 C14,46 58,16 100,14 Z" />
        </clipPath>
      </defs>

      {/* halo doux derrière la bulle */}
      <circle cx="100" cy="100" r="94" fill="#E8B94A" opacity="0.1" />

      {/* fond + scène, découpés proprement par la forme de la bulle */}
      <g clipPath="url(#lmc-bubble-clip)">
        <rect x="0" y="0" width="200" height="200" fill="#2C4A5E" />

        {/* étoiles, discrètes */}
        <circle cx="140" cy="42" r="1.6" fill="#F7ECD8" opacity="0.85" />
        <circle cx="62" cy="36" r="1.3" fill="#F7ECD8" opacity="0.7" />
        <circle cx="150" cy="80" r="1.2" fill="#F7ECD8" opacity="0.6" />
        <circle cx="45" cy="65" r="1" fill="#F7ECD8" opacity="0.55" />

        {/* lune */}
        <circle cx="118" cy="62" r="20" fill="#F7ECD8" opacity="0.95" />
        <circle cx="126" cy="55" r="18" fill="#2C4A5E" opacity="0.95" />

        {/* collines, ligne unique et apaisée */}
        <path d="M14,138 C45,120 70,132 95,120 C122,107 150,124 189,110 L189,190 L14,190 Z" fill="#1E3A3A" opacity="0.9" />
        <path d="M14,150 C48,136 78,148 108,136 C136,125 160,138 189,128" fill="none" stroke="#0F241F" strokeWidth="1.4" opacity="0.4" />
      </g>

      {/* contour de la bulle, tracé à la main (deux passages, comme un croquis) */}
      <path
        d="M100,14 C138,10 186,42 190,96 C193,148 154,192 101,190 C54,188 10,152 12,98 C14,46 58,16 100,14 Z"
        fill="none"
        stroke="#2B4433"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M101,16 C140,13 184,44 188,97 C191,147 153,189 100,188 C56,186 12,151 14,99 C16,48 60,18 101,16 Z"
        fill="none"
        stroke="#2B4433"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        transform="rotate(1.5 100 100)"
      />

      {/* reflet de la bulle */}
      <ellipse cx="58" cy="46" rx="28" ry="16" fill="#FFFFFF" opacity="0.12" transform="rotate(-25 58 46)" />
    </svg>
  );
}

const FONT_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Quicksand:wght@400;500;600;700&family=Fraunces:ital,wght@0,400;1,400;1,500&display=swap');
.lmc-display { font-family: 'Caveat', cursive; }
.lmc-body { font-family: 'Quicksand', sans-serif; }
.lmc-story { font-family: 'Fraunces', serif; font-style: italic; font-weight: 450; }

@keyframes lmc-firefly {
  0%   { transform: translate(0,0) scale(0.8); opacity: 0.25; }
  25%  { transform: translate(6px,-10px) scale(1.1); opacity: 0.9; }
  50%  { transform: translate(-4px,-4px) scale(0.9); opacity: 0.4; }
  75%  { transform: translate(8px,6px) scale(1.15); opacity: 1; }
  100% { transform: translate(0,0) scale(0.8); opacity: 0.25; }
}
.lmc-firefly {
  position: absolute;
  border-radius: 9999px;
  background: radial-gradient(circle, #FCE8A8 0%, #E8B94A 55%, rgba(232,185,74,0) 75%);
  filter: blur(0.3px);
  animation: lmc-firefly 5.5s ease-in-out infinite;
  pointer-events: none;
}
.lmc-grain {
  background-image: radial-gradient(rgba(90,70,45,0.05) 1px, transparent 1px);
  background-size: 14px 14px;
}
.lmc-input{width:100%;border:1px solid #DCC79C;border-radius:14px;padding:10px 14px;background:#FFFDF7;color:#2B4433;outline:none;font-family:'Quicksand',sans-serif;font-weight:500;}
.lmc-input:focus{border-color:#E8B94A;box-shadow:0 0 0 3px rgba(232,185,74,0.25);}
`;

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_CONFIG = {
  titre: "L'Atelier des Mondes Cachés",
  description:
    "Un temps suspendu pour explorer, imaginer et découvrir — chez vous ou près de chez vous.",
  prix: 25,
  lienPaiement: "",
  logoImage: "",
  ageRange: "4 - 10 ans",
  duree: "2h",
  contactEmail: "",
  contactTel: "",
  emailjsServiceId: "service_wx1z7m1",
  emailjsPublicKey: "feN2CqnAJEyty4ZgA",
  emailjsTemplateParent: "template_z09d89r",
  emailjsTemplateAdmin: "template_z09d89r",
  conditions:
    "Annulation possible jusqu'à 48h avant l'atelier. En cas de pluie, l'atelier est maintenu en intérieur ou reporté selon les cas.",
  motAccueil:
    "Ici commence chaque histoire : une tente plantée sous les arbres, et un monde qui s'entrouvre.",
  messageAucunCreneau:
    "Aucun créneau n'est ouvert pour le moment. Reviens un peu plus tard, un nouveau monde va s'ouvrir.",
  noticeRetractation:
    "Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux prestations de loisirs fournies à une date déterminée. En confirmant, tu acceptes cette condition ainsi que nos conditions générales de vente.",
  mentionsLegales:
    "MENTIONS LÉGALES\n\nÉditeur du site : [Ton nom et prénom]\nStatut : [à compléter, ex. micro-entreprise]\nSIRET : [à compléter]\nAdresse : [à compléter]\nEmail : [à compléter]\nTéléphone : [à compléter]\n\n" +
    "CONDITIONS GÉNÉRALES DE VENTE\n\nArticle 1 — Prix : les tarifs affichés sont ceux en vigueur au moment de la réservation.\n" +
    "Article 2 — Réservation : la réservation est confirmée dès validation du formulaire en ligne, dans la limite des places disponibles.\n" +
    "Article 3 — Paiement : le règlement s'effectue via un lien de paiement sécurisé externe.\n" +
    "Article 4 — Annulation : [à compléter — délai et conditions de remboursement].\n" +
    "Article 5 — Droit de rétractation : conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux prestations de loisirs fournies à une date déterminée.\n" +
    "Article 6 — Droit à l'image : aucune photo d'un enfant n'est publiée sans l'accord préalable d'un parent ou représentant légal.\n\n" +
    "POLITIQUE DE CONFIDENTIALITÉ\n\nLes informations recueillies (nom, email, téléphone, nombre d'enfants) servent uniquement à la gestion des réservations. Elles ne sont jamais transmises à des tiers, hormis le prestataire de paiement pour le règlement. Tu peux demander l'accès, la rectification ou la suppression de tes données à tout moment en écrivant à [email de contact].",
  temoignages: [],
  faq: [
    { id: uid(), q: "Que faut-il prévoir pour l'atelier ?", r: "Une tenue confortable adaptée à la météo, et beaucoup de curiosité !" },
    { id: uid(), q: "Les parents peuvent-ils rester ?", r: "Oui, vous êtes les bienvenus pour observer ou participer, selon votre préférence." },
  ],
};

function Firefly({ top, left, delay, size = 8 }) {
  return (
    <span className="lmc-firefly" style={{ top, left, width: size, height: size, animationDelay: delay }} />
  );
}

function VineDivider() {
  return (
    <svg width="100%" height="20" viewBox="0 0 400 20" preserveAspectRatio="none" className="opacity-70">
      <path d="M0 10 Q 50 0 100 10 T 200 10 T 300 10 T 400 10" fill="none" stroke="#8AA06A" strokeWidth="2" />
      <circle cx="100" cy="10" r="2.5" fill="#6E8F52" />
      <circle cx="200" cy="10" r="2.5" fill="#6E8F52" />
      <circle cx="300" cy="10" r="2.5" fill="#6E8F52" />
    </svg>
  );
}

function LeafCorner({ className = "", flip = false }) {
  return (
    <svg
      width="30" height="30" viewBox="0 0 34 34"
      className={className}
      style={flip ? { transform: "scaleX(-1) scaleY(-1)" } : undefined}
      aria-hidden="true"
    >
      <path d="M2 32 C 2 18, 18 2, 32 2" fill="none" stroke="#8AA06A" strokeWidth="2" opacity="0.55" />
      <circle cx="32" cy="2" r="2" fill="#6E8F52" opacity="0.8" />
      <path d="M8 27 C 10 22, 14 18, 19 16" fill="none" stroke="#A9C48A" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function MotAccueil({ texte }) {
  if (!texte) return null;
  return (
    <div
      className="rounded-2xl border relative overflow-hidden text-center px-8 py-12 sm:py-14"
      style={{ borderColor: "#DCC79C", background: "linear-gradient(180deg,#FBF3E3 0%,#F3E3CB 100%)" }}
    >
      <Firefly top="20%" left="10%" delay="0.3s" size={6} />
      <Firefly top="70%" left="88%" delay="1.6s" size={6} />

      <div className="flex items-center justify-center gap-3 mb-4 opacity-80">
        <span style={{ width: 28, height: 1, background: "#C9A24B" }} />
        <Leaf size={16} style={{ color: "#6E8F52" }} />
        <span style={{ width: 28, height: 1, background: "#C9A24B" }} />
      </div>

      <p className="lmc-display text-3xl sm:text-4xl leading-snug max-w-xl mx-auto" style={{ color: "#2B4433" }}>
        {texte}
      </p>
    </div>
  );
}

function buildICS(session, ville, config) {
  const start = new Date(`${session.date}T${session.heure}:00`);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:${uid()}@lesmondescaches`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${config.titre} - ${ville.nom}`,
    `LOCATION:${ville.nom}`,
    `DESCRIPTION:${config.description.replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return ics;
}

export default function LesMondesCaches() {
  const [loading, setLoading] = useState(true);
  const [paiementConfirme, setPaiementConfirme] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("merci") === "1") {
      setPaiementConfirme(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [villes, setVilles] = useState([]);
  const [reservations, setReservations] = useState([]);
const [voirCorbeille, setVoirCorbeille] = useState(false);

  const [view, setView] = useState("parent");
  const [session, setSession] = useState(null);
  const [emailSaisi, setEmailSaisi] = useState("");
  const [motDePasseSaisi, setMotDePasseSaisi] = useState("");
  const [erreurAuth, setErreurAuth] = useState("");
  const [connexionEnCours, setConnexionEnCours] = useState(false);
  const [selectedVille, setSelectedVille] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [step, setStep] = useState("choix");
  const [form, setForm] = useState({ nom: "", email: "", tel: "", nbEnfants: 1, piege: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  const estConnecte = !!session;

  const seConnecter = async () => {
    setConnexionEnCours(true);
    setErreurAuth("");
    const { error: err } = await supabase.auth.signInWithPassword({
      email: emailSaisi.trim(),
      password: motDePasseSaisi,
    });
    setConnexionEnCours(false);
    if (err) {
      setErreurAuth("Email ou mot de passe incorrect.");
      return;
    }
    setEmailSaisi("");
    setMotDePasseSaisi("");
    setView("admin");
  };

  const seDeconnecter = async () => {
    await supabase.auth.signOut();
    setView("parent");
  };

  const changerMotDePasse = async (nouveauMdp) => {
    const { error: err } = await supabase.auth.updateUser({ password: nouveauMdp });
    return err;
  };

  const loadReservations = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("reservations")
        .select("*")
        .order("cree_le", { ascending: false });
      if (err) throw err;
      setReservations(data || []);
    } catch (e) {
      console.error("Erreur de chargement des réservations:", e);
    }
  }, []);
const supprimerReservation = async (id) => {
  try {
    const { error: err } = await supabase.from("reservations").update({ supprime: true }).eq("id", id);
    if (err) throw err;
    loadReservations();
  } catch (e) {
    console.error("Erreur suppression réservation:", e);
  }
};

const restaurerReservation = async (id) => {
  try {
    const { error: err } = await supabase.from("reservations").update({ supprime: false }).eq("id", id);
    if (err) throw err;
    loadReservations();
  } catch (e) {
    console.error("Erreur restauration réservation:", e);
  }
};

  useEffect(() => {
    if (view === "admin" && estConnecte) loadReservations();
  }, [view, estConnecte, loadReservations]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("kv_store")
        .select("key, value")
        .in("key", ["config", "villes"]);
      if (err) throw err;
      const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]));
      setConfig(map.config ? { ...DEFAULT_CONFIG, ...JSON.parse(map.config) } : DEFAULT_CONFIG);
      setVilles(map.villes ? JSON.parse(map.villes) : []);
    } catch (e) {
      console.error("Erreur de chargement Supabase:", e);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persistConfig = async (next) => {
    setConfig(next);
    try {
      const { error: err } = await supabase.from("kv_store").upsert({ key: "config", value: JSON.stringify(next) });
      if (err) throw err;
    } catch (e) {
      console.error("Erreur Supabase config:", e);
      setError(`Échec de l'enregistrement (config) : ${e?.message || e}`);
    }
  };
  const persistVilles = async (next) => {
    setVilles(next);
    try {
      const { error: err } = await supabase.from("kv_store").upsert({ key: "villes", value: JSON.stringify(next) });
      if (err) throw err;
    } catch (e) {
      console.error("Erreur Supabase villes:", e);
      setError(`Échec de l'enregistrement (villes) : ${e?.message || e}`);
    }
  };

  const envoyerEmails = async (r) => {
    if (!config.emailjsServiceId || !config.emailjsPublicKey || !window.emailjs) return;
    const params = {
      to_email: r.email,
      parent_nom: r.nom,
      atelier_titre: config.titre,
      ville: r.villeNom,
      date: r.date,
      heure: r.heure,
      nb_enfants: r.nbEnfants,
      statut: r.enAttente ? "Liste d'attente" : "Confirmée",
    };
    try {
      if (config.emailjsTemplateParent) {
        await window.emailjs.send(config.emailjsServiceId, config.emailjsTemplateParent, params, { publicKey: config.emailjsPublicKey });
      }
    } catch (e) {
      console.error("Erreur envoi email parent:", e);
    }
    try {
      if (config.emailjsTemplateAdmin && config.contactEmail) {
        await window.emailjs.send(config.emailjsServiceId, config.emailjsTemplateAdmin, { ...params, to_email: config.contactEmail }, { publicKey: config.emailjsPublicKey });

      }
    } catch (e) {
      console.error("Erreur envoi email admin:", e);
    }
  };

  const insertReservation = async (r) => {
    try {
      const { error: err } = await supabase.from("reservations").insert({
        ville_id: r.villeId,
        ville_nom: r.villeNom,
        session_id: r.sessionId,
        date: r.date,
        heure: r.heure,
        nom: r.nom,
        email: r.email,
        tel: r.tel || null,
        nb_enfants: Number(r.nbEnfants) || 1,
        en_attente: r.enAttente,
      });
      if (err) throw err;
      await envoyerEmails(r);
    } catch (e) {
      console.error("Erreur Supabase reservations:", e);
      setError(`Échec de l'enregistrement (réservation) : ${e?.message || e}`);
    }
  };

  const addVille = (nom) => {
    if (!nom.trim()) return;
    persistVilles([...villes, { id: uid(), nom: nom.trim(), sessions: [] }]);
  };
  const removeVille = (villeId) => persistVilles(villes.filter((v) => v.id !== villeId));

  const addSession = (villeId, date, heure, placesTotal, note) => {
    const next = villes.map((v) =>
      v.id === villeId
        ? {
            ...v,
            sessions: [
              ...v.sessions,
              { id: uid(), date, heure, placesTotal: Number(placesTotal), placesRestantes: Number(placesTotal), note: note || "" },
            ],
          }
        : v
    );
    persistVilles(next);
  };
  const removeSession = (villeId, sessionId) => {
    const next = villes.map((v) =>
      v.id === villeId ? { ...v, sessions: v.sessions.filter((s) => s.id !== sessionId) } : v
    );
    persistVilles(next);
  };

  const startBooking = (ville, session) => {
    setSelectedVille(ville);
    setSelectedSession(session);
    setStep("formulaire");
  };

  const confirmBooking = async () => {
    if (!form.nom.trim() || !form.email.trim()) {
      setError("Merci de renseigner au moins ton nom et ton email.");
      return;
    }
    if (form.piege) {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setStep("confirmation");
      }, 600);
      return;
    }
    const dernier = Number(localStorage.getItem("lmc_derniere_resa") || 0);
    if (Date.now() - dernier < 60000) {
      setError("Merci de patienter un instant avant de réserver à nouveau.");
      return;
    }
    setSaving(true);
    setError("");
    const enAttente = selectedSession.placesRestantes <= 0;
    const nextVilles = villes.map((v) =>
      v.id === selectedVille.id
        ? {
            ...v,
            sessions: v.sessions.map((s) =>
              s.id === selectedSession.id && !enAttente
                ? { ...s, placesRestantes: Math.max(0, s.placesRestantes - Number(form.nbEnfants || 1)) }
                : s
            ),
          }
        : v
    );
    const reservation = {
      id: uid(),
      villeId: selectedVille.id,
      villeNom: selectedVille.nom,
      sessionId: selectedSession.id,
      date: selectedSession.date,
      heure: selectedSession.heure,
      enAttente,
      ...form,
      creeLe: new Date().toISOString(),
    };
    await persistVilles(nextVilles);
    await insertReservation(reservation);
    localStorage.setItem("lmc_derniere_resa", String(Date.now()));
    setSaving(false);
    setStep("confirmation");
  };

  const resetParcours = () => {
    setSelectedVille(null);
    setSelectedSession(null);
    setForm({ nom: "", email: "", tel: "", nbEnfants: 1, piege: "" });
    setStep("choix");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg,#3D3168 0%,#24422F 60%,#16241B 100%)" }}>
        <style>{FONT_STYLE}</style>
        <Loader2 className="animate-spin text-[#E8B94A]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen lmc-body lmc-grain" style={{ background: "#F3E3CB" }}>
      <style>{FONT_STYLE}</style>

      <header className="relative overflow-hidden text-[#F7ECD8]" style={{ background: "linear-gradient(180deg,#3D3168 0%,#2C4A36 65%,#1B2E20 100%)" }}>
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          {[...Array(22)].map((_, i) => (
            <span key={i} style={{ position: "absolute", top: `${(i * 37) % 45}%`, left: `${(i * 53) % 100}%`, width: 2, height: 2, borderRadius: 9999, background: "#F7ECD8", opacity: 0.4 + ((i % 3) * 0.15) }} />
          ))}
        </div>
        <Firefly top="16%" left="7%" delay="0s" size={7} />
        <Firefly top="52%" left="12%" delay="1.2s" size={9} />
        <Firefly top="28%" left="90%" delay="2.1s" size={8} />
        <Firefly top="66%" left="82%" delay="0.6s" size={6} />
        <Firefly top="40%" left="48%" delay="1.8s" size={7} />
        <Firefly top="78%" left="35%" delay="2.6s" size={6} />

        <button
          onClick={() => {
            if (view === "admin") {
              seDeconnecter();
            } else if (!estConnecte) {
              setErreurAuth("");
              setEmailSaisi("");
              setMotDePasseSaisi("");
              setView("admin-lock");
            } else {
              setView("admin");
            }
          }}
          className="absolute top-5 right-5 z-10 text-[#F7ECD8]/70 hover:text-[#E8B94A] transition-colors"
          aria-label="Gérer l'atelier"
        >
          <Settings size={20} />
        </button>

        <div className="relative max-w-3xl mx-auto px-6 pt-12 pb-10 sm:pt-14 flex flex-col items-center text-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 mb-4 drop-shadow-[0_0_25px_rgba(232,185,74,0.4)]">
            {config.logoImage ? (
              <img
                src={config.logoImage}
                alt="Photo/logo de Les Mondes Cachés"
                className="w-full h-full rounded-full object-cover"
                style={{ border: "3px solid #2B4433" }}
              />
            ) : (
              <LogoMonde />
            )}
          </div>
          <h1 className="lmc-display text-6xl sm:text-7xl leading-none mb-2" style={{ color: "#F7ECD8" }}>Les Mondes Cachés</h1>
          <div className="flex items-center gap-2 text-[#E8B94A] text-xs tracking-[0.2em] uppercase mb-5">
            <Sparkles size={13} /><span>Ateliers pour petits explorateurs</span><Sparkles size={13} />
          </div>
          <p className="lmc-body font-semibold text-lg sm:text-xl text-[#F7ECD8] mb-1">{config.titre}</p>
          <p className="lmc-story text-[#CFC6E8] text-base sm:text-lg max-w-md leading-relaxed mb-5">{config.description}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {config.ageRange && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "rgba(247,236,216,0.12)", color: "#F7ECD8", border: "1px solid rgba(232,185,74,0.4)" }}>
                <Users size={12} /> {config.ageRange}
              </span>
            )}
            {config.duree && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "rgba(247,236,216,0.12)", color: "#F7ECD8", border: "1px solid rgba(232,185,74,0.4)" }}>
                <Clock size={12} /> {config.duree}
              </span>
            )}
            {config.prix ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "rgba(247,236,216,0.12)", color: "#F7ECD8", border: "1px solid rgba(232,185,74,0.4)" }}>
                <Coins size={12} /> {config.prix} € / enfant
              </span>
            ) : null}
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-3xl mx-auto px-6 mt-4">
          <div className="bg-[#F6E2C4] border border-[#D99B4E] text-[#7A4A26] text-sm rounded-lg px-4 py-3 flex justify-between items-center font-medium">
            <span>{error}</span>
            <button onClick={() => setError("")}><X size={16} /></button>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-10">
        {view === "admin-lock" ? (
          <AdminLogin
            email={emailSaisi}
            setEmail={setEmailSaisi}
            motDePasse={motDePasseSaisi}
            setMotDePasse={setMotDePasseSaisi}
            erreur={erreurAuth}
            enCours={connexionEnCours}
            onValider={seConnecter}
            onAnnuler={() => setView("parent")}
          />
        ) : view === "admin" ? (
          <AdminPanel
            config={config} villes={villes} reservations={reservations}
            onSaveConfig={persistConfig} onAddVille={addVille} onRemoveVille={removeVille}
            onAddSession={addSession} onRemoveSession={removeSession} onClose={seDeconnecter} onChangePassword={changerMotDePasse}
          onSupprimerReservation={supprimerReservation}
onRestaurerReservation={restaurerReservation}
voirCorbeille={voirCorbeille}
onToggleCorbeille={() => setVoirCorbeille(!voirCorbeille)}
/>
        ) : view === "legal" ? (
          <LegalPage texte={config.mentionsLegales} onBack={() => setView("parent")} />
        ) : paiementConfirme ? (
          <MerciPaiement onRetour={() => setPaiementConfirme(false)} />
        ) : (
          <ParentFlow
            config={config} villes={villes} step={step} selectedVille={selectedVille} selectedSession={selectedSession}
            form={form} setForm={setForm} saving={saving} openFaq={openFaq} setOpenFaq={setOpenFaq}
            onSelectVille={setSelectedVille} onStartBooking={startBooking} onConfirm={confirmBooking}
            onReset={resetParcours} onBack={() => setStep("choix")}
          />
        )}
      </main>

      <footer className="text-center text-[#8A7A56] text-xs py-8 flex flex-col items-center gap-2">
        <Leaf size={14} className="text-[#6E8F52]" />
        <span>Les Mondes Cachés — un atelier à la fois, un monde différent à chaque fois.</span>
        {(config.contactEmail || config.contactTel) && (
          <div className="flex items-center gap-4 mt-1">
            {config.contactEmail && <span className="flex items-center gap-1"><Mail size={12} /> {config.contactEmail}</span>}
            {config.contactTel && <span className="flex items-center gap-1"><Phone size={12} /> {config.contactTel}</span>}
          </div>
        )}
        <button onClick={() => setView("legal")} className="underline underline-offset-4 mt-1 hover:text-[#5C4A3A]">
          Mentions légales &amp; CGV
        </button>
      </footer>
    </div>
  );
}

function LegalPage({ texte, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#5C4A3A] mb-6 hover:text-[#2B4433] font-medium">
        <ArrowLeft size={16} /> Retour
      </button>
      <h2 className="lmc-display text-4xl mb-5" style={{ color: "#2B4433" }}>Mentions légales &amp; CGV</h2>
      <div className="rounded-2xl border p-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "#5C4A3A" }}>
          {texte || "Cette page n'a pas encore été renseignée."}
        </p>
      </div>
    </div>
  );
}

function MerciPaiement({ onRetour }) {
  return (
    <div className="text-center py-10">
      <div className="w-16 h-16 rounded-full text-[#F7ECD8] flex items-center justify-center mx-auto mb-6" style={{ background: "#2B4433" }}>
        <Check size={28} />
      </div>
      <h2 className="lmc-display text-4xl mb-2" style={{ color: "#2B4433" }}>Merci !</h2>
      <p className="text-[#5C4A3A] mb-6 max-w-md mx-auto font-medium">
        Ton paiement a bien été pris en compte. On a hâte de vous accueillir !
      </p>
      <button onClick={onRetour} className="text-sm text-[#5C4A3A] underline underline-offset-4 font-medium">
        Retour à l'accueil
      </button>
    </div>
  );
}

function AdminLogin({ email, setEmail, motDePasse, setMotDePasse, erreur, enCours, onValider, onAnnuler }) {
  return (
    <div className="max-w-sm mx-auto text-center py-8">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: "#2B4433", color: "#F7ECD8" }}
      >
        <Lock size={22} />
      </div>
      <h2 className="lmc-display text-3xl mb-2" style={{ color: "#2B4433" }}>Accès réservé</h2>
      <p className="text-sm mb-5" style={{ color: "#8A7A56" }}>Connecte-toi pour gérer l'atelier.</p>
      <div className="space-y-3 text-left">
        <input
          type="email"
          className="lmc-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onValider()}
          placeholder="Ton email"
          autoFocus
        />
        <input
          type="password"
          className="lmc-input"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onValider()}
          placeholder="Ton mot de passe"
        />
      </div>
      {erreur && <p className="text-sm mt-2 font-medium" style={{ color: "#B5744A" }}>{erreur}</p>}
      <div className="flex gap-2 mt-5">
        <button onClick={onAnnuler} className="flex-1 text-sm font-medium py-2.5 rounded-full border" style={{ borderColor: "#DCC79C", color: "#5C4A3A" }}>
          Annuler
        </button>
        <button onClick={onValider} disabled={enCours} className="flex-1 text-sm font-semibold py-2.5 rounded-full disabled:opacity-60" style={{ background: "#2B4433", color: "#F7ECD8" }}>
          {enCours ? "Connexion…" : "Se connecter"}
        </button>
      </div>
    </div>
  );
}


function SectionTitle({ children, icon }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <h2 className="lmc-display text-4xl" style={{ color: "#2B4433" }}>{children}</h2>
      {icon}
    </div>
  );
}

function RedirectionPaiement({ lien }) {
  const [secondes, setSecondes] = useState(3);
  useEffect(() => {
    if (secondes <= 0) {
      window.location.href = lien;
      return;
    }
    const t = setTimeout(() => setSecondes((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondes, lien]);
  return (
    <p className="text-xs mt-1" style={{ color: "#8A7A56" }}>
      Redirection automatique vers le paiement dans {secondes}s…
    </p>
  );
}

function ParentFlow({
  config, villes, step, selectedVille, selectedSession, form, setForm, saving, openFaq, setOpenFaq,
  onSelectVille, onStartBooking, onConfirm, onReset, onBack,
}) {
  const villesAvecSessions = villes.filter((v) => v.sessions.length > 0);

  const prochains = villes
    .flatMap((v) => v.sessions.map((s) => ({ ...s, villeNom: v.nom, ville: v })))
    .filter((s) => s.placesRestantes > 0)
    .sort((a, b) => (a.date + a.heure).localeCompare(b.date + b.heure))
    .slice(0, 3);

  if (step === "confirmation") {
    const icsUrl = selectedSession
      ? `data:text/calendar;charset=utf-8,${encodeURIComponent(buildICS(selectedSession, selectedVille, config))}`
      : null;
    const enAttente = selectedSession?.placesRestantes <= 0;
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full text-[#F7ECD8] flex items-center justify-center mx-auto mb-6" style={{ background: "#2B4433" }}>
          <Check size={28} />
        </div>
        <h2 className="lmc-display text-4xl mb-2" style={{ color: "#2B4433" }}>
          {enAttente ? "Tu es sur la liste d'attente" : "Réservation enregistrée"}
        </h2>
        <p className="text-[#5C4A3A] mb-6 max-w-md mx-auto font-medium">
          {enAttente
            ? `On te recontacte à ${form.email} si une place se libère pour le ${selectedSession?.date} à ${selectedSession?.heure} (${selectedVille?.nom}).`
            : `Une place t'attend à ${selectedSession?.date} à ${selectedSession?.heure} (${selectedVille?.nom}). Un e-mail de confirmation sera envoyé à ${form.email}.`}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!enAttente && config.lienPaiement && (
            <a href={config.lienPaiement} className="inline-flex items-center gap-2 text-[#2B2118] font-semibold px-6 py-3 rounded-full transition-colors" style={{ background: "#E8B94A" }}>
              <Coins size={18} /> Régler l'atelier maintenant
            </a>
          )}
          {!enAttente && icsUrl && (
            <a href={icsUrl} download="atelier-mondes-caches.ics" className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-colors" style={{ background: "#2B4433", color: "#F7ECD8" }}>
              <CalendarPlus size={18} /> Ajouter au calendrier
            </a>
          )}
        </div>
        {!enAttente && config.lienPaiement && <RedirectionPaiement lien={config.lienPaiement} />}
        <div>
          <button onClick={onReset} className="mt-8 text-sm text-[#5C4A3A] underline underline-offset-4 font-medium">Réserver un autre créneau</button>
        </div>
      </div>
    );
  }

  if (step === "formulaire" && selectedVille && selectedSession) {
    const complet = selectedSession.placesRestantes <= 0;
    return (
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#5C4A3A] mb-6 hover:text-[#2B4433] font-medium">
          <ArrowLeft size={16} /> Retour
        </button>
        <div className="bg-[#FBF3E3] rounded-2xl border border-[#DCC79C] p-6 mb-6 relative overflow-hidden">
          <LeafCorner className="absolute top-2 right-2" />
          <div className="flex items-center gap-2 font-semibold mb-1" style={{ color: "#2B4433" }}>
            <MapPin size={16} /> {selectedVille.nom}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#5C4A3A] font-medium">
            <span className="flex items-center gap-1"><Calendar size={14} /> {selectedSession.date}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {selectedSession.heure}</span>
            <span className="flex items-center gap-1"><Users size={14} /> {complet ? "Complet" : `${selectedSession.placesRestantes} place(s) restante(s)`}</span>
          </div>
          {selectedSession.note && <p className="mt-2 text-sm italic" style={{ color: "#8A7A56" }}>{selectedSession.note}</p>}
          {config.prix ? <div className="mt-2 text-sm text-[#8A7A56] font-medium">Tarif : {config.prix} € / enfant</div> : null}
          {complet && (
            <div className="mt-3 text-sm font-semibold px-3 py-2 rounded-lg inline-block" style={{ background: "#F3E3CB", color: "#8A5A26" }}>
              Ce créneau est complet — inscris-toi sur la liste d'attente ci-dessous.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Field label="Ton nom"><input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="lmc-input" placeholder="Prénom et nom" /></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="lmc-input" placeholder="ton@email.fr" /></Field>
          <Field label="Téléphone (optionnel)"><input value={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} className="lmc-input" placeholder="06 12 34 56 78" /></Field>
          {!complet && (
            <Field label="Nombre d'enfants">
              <input type="number" min={1} max={selectedSession.placesRestantes} value={form.nbEnfants} onChange={(e) => setForm({ ...form, nbEnfants: e.target.value })} className="lmc-input" />
            </Field>
          )}
          <input
            type="text"
            name="site_web"
            value={form.piege}
            onChange={(e) => setForm({ ...form, piege: e.target.value })}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
          />
        </div>

        {!complet && config.noticeRetractation && (
          <p className="mt-4 text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "#8A7A56" }}>
            {config.noticeRetractation}
          </p>
        )}

        <button onClick={onConfirm} disabled={saving} className="mt-4 w-full font-semibold py-3 rounded-full transition-colors disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: complet ? "#8A5A26" : "#2B4433", color: "#F7ECD8" }}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : null}
          {complet ? "Rejoindre la liste d'attente" : "Confirmer la réservation"}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Mot d'accueil, modifiable selon la saison */}
      <div className="mb-10">
        <MotAccueil texte={config.motAccueil} />
      </div>

      {prochains.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-[#E8B94A]" />
            <h3 className="lmc-display text-3xl" style={{ color: "#2B4433" }}>Les prochains départs</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {prochains.map((s) => (
              <button key={s.id} onClick={() => onStartBooking(s.ville, s)} className="text-left p-4 rounded-2xl border transition-all hover:shadow-md" style={{ background: "#2B4433", borderColor: "#2B4433", color: "#F7ECD8" }}>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8B94A] mb-1"><MapPin size={12} /> {s.villeNom}</div>
                <div className="flex items-center gap-1.5 text-sm font-medium"><Calendar size={13} /> {s.date}</div>
                <div className="flex items-center gap-1.5 text-sm font-medium mb-1"><Clock size={13} /> {s.heure}</div>
                <div className="text-xs" style={{ color: "#CFE0C8" }}>{s.placesRestantes} place(s) restante(s)</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <VineDivider />

      <div className="mt-6">
        <SectionTitle>Choisis ta ville ou village</SectionTitle>
        {villesAvecSessions.length === 0 ? (
          <p className="text-[#8A7A56] font-medium">{config.messageAucunCreneau}</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {villesAvecSessions.map((ville) => {
              const active = selectedVille?.id === ville.id;
              const dispo = ville.sessions.filter((s) => s.placesRestantes > 0).length;
              return (
                <button key={ville.id} onClick={() => onSelectVille(active ? null : ville)} className="text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden" style={active ? { borderColor: "#2B4433", background: "#2B4433", color: "#F7ECD8" } : { borderColor: "#DCC79C", background: "#FBF3E3", color: "#2B4433" }}>
                  <LeafCorner className="absolute bottom-1 left-1 opacity-70" flip />
                  <div className="flex items-center gap-2 font-semibold"><MapPin size={16} /> {ville.nom}</div>
                  <div className="text-sm mt-1 font-medium" style={{ color: active ? "#CFE0C8" : "#8A7A56" }}>
                    {dispo > 0 ? `${dispo} créneau(x) disponible(s)` : "Complet — liste d'attente"}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedVille && (
          <div className="mt-8">
            <VineDivider />
            <h3 className="lmc-display text-3xl mt-2 mb-4" style={{ color: "#2B4433" }}>Créneaux à {selectedVille.nom}</h3>
            <div className="space-y-3">
              {selectedVille.sessions.map((session) => {
                const complet = session.placesRestantes <= 0;
                return (
                  <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border" style={{ borderColor: "#DCC79C", background: "#FBF3E3" }}>
                    <div>
                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium" style={{ color: "#2B4433" }}>
                        <span className="flex items-center gap-1"><Calendar size={14} /> {session.date}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {session.heure}</span>
                        <span className="flex items-center gap-1" style={{ color: complet ? "#B5744A" : "#8A7A56" }}><Users size={14} /> {complet ? "Complet" : `${session.placesRestantes} place(s)`}</span>
                      </div>
                      {session.note && <p className="text-xs italic mt-1" style={{ color: "#8A7A56" }}>{session.note}</p>}
                    </div>
                    <button onClick={() => onStartBooking(selectedVille, session)} className="text-sm font-semibold px-4 py-2 rounded-full transition-colors" style={{ background: complet ? "#E4D4B8" : "#E8B94A", color: "#2B2118" }}>
                      {complet ? "Liste d'attente" : "Réserver"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {config.temoignages?.length > 0 && (
        <div className="mt-12">
          <VineDivider />
          <div className="flex items-center gap-2 mt-4 mb-4">
            <Star size={16} className="text-[#E8B94A]" />
            <h3 className="lmc-display text-3xl" style={{ color: "#2B4433" }}>Elles et ils y étaient</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {config.temoignages.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl relative" style={{ background: "#FBF3E3", border: "1px solid #DCC79C" }}>
                <LeafCorner className="absolute top-1 right-1 opacity-60" />
                <p className="text-sm italic" style={{ color: "#5C4A3A" }}>« {t.texte} »</p>
                <p className="text-xs font-semibold mt-2" style={{ color: "#2B4433" }}>— {t.nom}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {config.faq?.length > 0 && (
        <div className="mt-12">
          <VineDivider />
          <h3 className="lmc-display text-3xl mt-4 mb-4" style={{ color: "#2B4433" }}>Questions fréquentes</h3>
          <div className="space-y-2">
            {config.faq.map((f, i) => (
              <div key={f.id} className="rounded-xl border overflow-hidden" style={{ borderColor: "#DCC79C", background: "#FBF3E3" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-sm" style={{ color: "#2B4433" }}>
                  {f.q}
                  {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openFaq === i && <div className="px-4 pb-3 text-sm" style={{ color: "#5C4A3A" }}>{f.r}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {config.conditions && (
        <div className="mt-10 flex items-start gap-2 text-xs" style={{ color: "#8A7A56" }}>
          <ScrollText size={14} className="mt-0.5 shrink-0" />
          <p>{config.conditions}</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1" style={{ color: "#5C4A3A" }}>{label}</span>
      {children}
    </label>
  );
}

function exportCSV(reservations) {
  const header = "Nom,Email,Telephone,Ville,Date,Heure,Enfants,Statut\n";
  const rows = reservations
    .map((r) =>
      [r.nom, r.email, r.tel || "", r.ville_nom, r.date, r.heure, r.nb_enfants, r.en_attente ? "Liste d'attente" : "Confirmee"]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reservations-mondes-caches.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function AdminPanel({ config, villes, reservations, onSaveConfig, onAddVille, onRemoveVille, onAddSession, onRemoveSession, onClose, onChangePassword, onSupprimerReservation, onRestaurerReservation, voirCorbeille, onToggleCorbeille }) {
 
  const [titre, setTitre] = useState(config.titre);
  const [description, setDescription] = useState(config.description);
  const [prix, setPrix] = useState(config.prix);
  const [lienPaiement, setLienPaiement] = useState(config.lienPaiement);
  const [logoImage, setLogoImage] = useState(config.logoImage || "");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoErreur, setLogoErreur] = useState("");
  const [ageRange, setAgeRange] = useState(config.ageRange || "");
  const [duree, setDuree] = useState(config.duree || "");
  const [contactEmail, setContactEmail] = useState(config.contactEmail || "");
  const [contactTel, setContactTel] = useState(config.contactTel || "");
  const [emailjsServiceId, setEmailjsServiceId] = useState(config.emailjsServiceId || "");
  const [emailjsPublicKey, setEmailjsPublicKey] = useState(config.emailjsPublicKey || "");
  const [emailjsTemplateParent, setEmailjsTemplateParent] = useState(config.emailjsTemplateParent || "");
  const [emailjsTemplateAdmin, setEmailjsTemplateAdmin] = useState(config.emailjsTemplateAdmin || "");
  const [conditions, setConditions] = useState(config.conditions || "");
  const [motAccueil, setMotAccueil] = useState(config.motAccueil || "");
  const [messageAucunCreneau, setMessageAucunCreneau] = useState(config.messageAucunCreneau || "");
  const [noticeRetractation, setNoticeRetractation] = useState(config.noticeRetractation || "");
  const [mentionsLegales, setMentionsLegales] = useState(config.mentionsLegales || "");
  const [temoignages, setTemoignages] = useState(config.temoignages || []);
  const [faq, setFaq] = useState(config.faq || []);
  const [nouveauTemoin, setNouveauTemoin] = useState({ nom: "", texte: "" });
  const [nouvelleFaq, setNouvelleFaq] = useState({ q: "", r: "" });
  const [nouvelleVille, setNouvelleVille] = useState("");
  const [sessionForms, setSessionForms] = useState({});
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [mdpEnCours, setMdpEnCours] = useState(false);
  const [mdpMessage, setMdpMessage] = useState("");
  const [mdpErreur, setMdpErreur] = useState("");

  const soumettreNouveauMdp = async () => {
    setMdpMessage("");
    setMdpErreur("");
    if (nouveauMdp.trim().length < 6) {
      setMdpErreur("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    setMdpEnCours(true);
    const err = await onChangePassword(nouveauMdp.trim());
    setMdpEnCours(false);
    if (err) {
      setMdpErreur(`Échec : ${err.message || err}`);
      return;
    }
    setMdpMessage("Mot de passe mis à jour avec succès.");
    setNouveauMdp("");
  };


  const saveAll = (overrides = {}) => {
    onSaveConfig({
      titre, description, prix: Number(prix) || 0, lienPaiement: lienPaiement.trim(), logoImage,
      ageRange, duree, contactEmail, contactTel, conditions, motAccueil, messageAucunCreneau, noticeRetractation, mentionsLegales, temoignages, faq,
      emailjsServiceId: emailjsServiceId.trim(), emailjsPublicKey: emailjsPublicKey.trim(), emailjsTemplateParent: emailjsTemplateParent.trim(), emailjsTemplateAdmin: emailjsTemplateAdmin.trim(),
      ...overrides,
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoErreur("Ce fichier n'est pas une image.");
      return;
    }
    setLogoErreur("");
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 500;
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round(height * (maxSize / width));
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round(width * (maxSize / height));
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setLogoImage(dataUrl);
        setLogoUploading(false);
      };
      img.onerror = () => {
        setLogoErreur("Impossible de lire cette image, réessaie avec un autre fichier.");
        setLogoUploading(false);
      };
      img.src = ev.target.result;
    };
    reader.onerror = () => {
      setLogoErreur("Impossible de lire ce fichier.");
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const updateSessionForm = (villeId, field, value) => setSessionForms((prev) => ({ ...prev, [villeId]: { ...prev[villeId], [field]: value } }));
  const submitSession = (villeId) => {
    const f = sessionForms[villeId] || {};
    if (!f.date || !f.heure || !f.places) return;
    onAddSession(villeId, f.date, f.heure, f.places, f.note);
    setSessionForms((prev) => ({ ...prev, [villeId]: { date: "", heure: "", places: "", note: "" } }));
  };

  const addTemoin = () => {
    if (!nouveauTemoin.nom.trim() || !nouveauTemoin.texte.trim()) return;
    const next = [...temoignages, { id: uid(), ...nouveauTemoin }];
    setTemoignages(next);
    setNouveauTemoin({ nom: "", texte: "" });
    saveAll({ temoignages: next });
  };
  const removeTemoin = (id) => {
    const next = temoignages.filter((t) => t.id !== id);
    setTemoignages(next);
    saveAll({ temoignages: next });
  };
  const addFaqItem = () => {
    if (!nouvelleFaq.q.trim() || !nouvelleFaq.r.trim()) return;
    const next = [...faq, { id: uid(), q: nouvelleFaq.q, r: nouvelleFaq.r }];
    setFaq(next);
    setNouvelleFaq({ q: "", r: "" });
    saveAll({ faq: next });
  };
  const removeFaqItem = (id) => {
    const next = faq.filter((f) => f.id !== id);
    setFaq(next);
    saveAll({ faq: next });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="lmc-display text-4xl" style={{ color: "#2B4433" }}>Gérer l'atelier</h2>
        <button onClick={onClose} className="text-[#5C4A3A] hover:text-[#2B4433] flex items-center gap-1 text-sm font-medium"><X size={16} /> Fermer</button>
      </div>

      <section className="rounded-2xl border p-6 mb-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "#2B4433" }}>
          <Lock size={16} /> Changer mon mot de passe
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            className="lmc-input"
            placeholder="Nouveau mot de passe (6 caractères minimum)"
            value={nouveauMdp}
            onChange={(e) => setNouveauMdp(e.target.value)}
          />
          <button
            onClick={soumettreNouveauMdp}
            disabled={mdpEnCours}
            className="shrink-0 text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-60"
            style={{ background: "#2B4433", color: "#F7ECD8" }}
          >
            {mdpEnCours ? "..." : "Mettre à jour"}
          </button>
        </div>
        {mdpMessage && <p className="text-xs mt-2 font-medium" style={{ color: "#2B4433" }}>{mdpMessage}</p>}
        {mdpErreur && <p className="text-xs mt-2 font-medium" style={{ color: "#B5744A" }}>{mdpErreur}</p>}
      </section>

      <section className="rounded-2xl border p-6 mb-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "#2B4433" }}>
          <Mail size={16} /> Emails automatiques
        </h3>
        <p className="text-xs mb-4" style={{ color: "#8A7A56" }}>
          Renseigne ici les identifiants de ton compte EmailJS (voir le guide) pour qu'un
          email de confirmation soit envoyé au parent, et un email de notification à toi,
          à chaque nouvelle réservation. Tant que ces champs sont vides, aucun email n'est
          envoyé.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Service ID EmailJS"><input className="lmc-input" value={emailjsServiceId} onChange={(e) => setEmailjsServiceId(e.target.value)} placeholder="service_xxxxx" /></Field>
            <Field label="Public Key EmailJS"><input className="lmc-input" value={emailjsPublicKey} onChange={(e) => setEmailjsPublicKey(e.target.value)} placeholder="xxxxxxxxxxxxx" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Template ID (email au parent)"><input className="lmc-input" value={emailjsTemplateParent} onChange={(e) => setEmailjsTemplateParent(e.target.value)} placeholder="template_xxxxx" /></Field>
            <Field label="Template ID (email à toi)"><input className="lmc-input" value={emailjsTemplateAdmin} onChange={(e) => setEmailjsTemplateAdmin(e.target.value)} placeholder="template_xxxxx" /></Field>
          </div>
          <p className="text-xs" style={{ color: "#8A7A56" }}>
            L'email de notification pour toi sera envoyé à l'adresse renseignée dans
            "Email de contact" ci-dessous.
          </p>
          <button onClick={() => saveAll()} className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors" style={{ background: "#2B4433", color: "#F7ECD8" }}>Enregistrer</button>
        </div>
      </section>

      <section className="rounded-2xl border p-6 mb-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <h3 className="font-semibold mb-4" style={{ color: "#2B4433" }}>Informations générales</h3>
        <div className="space-y-4">
          <Field label="Nom de l'atelier"><input className="lmc-input" value={titre} onChange={(e) => setTitre(e.target.value)} /></Field>
          <Field label="Photo ou logo (dans la bulle en haut du site)">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0" style={{ border: "2px solid #DCC79C", background: "#F3E3CB" }}>
                {logoImage ? (
                  <img src={logoImage} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <LogoMonde />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold px-4 py-2 rounded-full cursor-pointer inline-flex items-center gap-2 w-fit" style={{ background: "#2B4433", color: "#F7ECD8" }}>
                  <Upload size={14} />
                  {logoUploading ? "Traitement..." : "Choisir une photo"}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={logoUploading} />
                </label>
                {logoImage && (
                  <button onClick={() => setLogoImage("")} className="text-xs underline underline-offset-4 text-left" style={{ color: "#8A7A56" }}>
                    Retirer et revenir à l'illustration par défaut
                  </button>
                )}
              </div>
            </div>
            {logoErreur && <p className="text-xs mt-1 font-medium" style={{ color: "#B5744A" }}>{logoErreur}</p>}
          </Field>
          <Field label="Description"><textarea className="lmc-input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tranche d'âge"><input className="lmc-input" value={ageRange} onChange={(e) => setAgeRange(e.target.value)} placeholder="4 - 10 ans" /></Field>
            <Field label="Durée"><input className="lmc-input" value={duree} onChange={(e) => setDuree(e.target.value)} placeholder="2h" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tarif par enfant (€)"><input type="number" className="lmc-input" value={prix} onChange={(e) => setPrix(e.target.value)} /></Field>
            <Field label="Lien de paiement"><input className="lmc-input" value={lienPaiement} onChange={(e) => setLienPaiement(e.target.value)} placeholder="https://..." /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email de contact"><input className="lmc-input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@..." /></Field>
            <Field label="Téléphone de contact"><input className="lmc-input" value={contactTel} onChange={(e) => setContactTel(e.target.value)} placeholder="06 12 34 56 78" /></Field>
          </div>
          <p className="text-xs leading-relaxed rounded-lg px-3 py-2" style={{ background: "#F3E3CB", color: "#5C4A3A" }}>
            🔒 L'accès à ces réglages est désormais protégé par un vrai email + mot de passe
            (géré depuis ton tableau de bord Supabase &gt; Authentication &gt; Users). Pour le
            changer, rends-toi directement là-bas.
          </p>
          <Field label="Conditions (annulation, météo…)"><textarea className="lmc-input" rows={2} value={conditions} onChange={(e) => setConditions(e.target.value)} /></Field>
          <Field label="Mot d'accueil (modifiable selon la saison, l'humeur…)">
            <textarea className="lmc-input" rows={2} value={motAccueil} onChange={(e) => setMotAccueil(e.target.value)} placeholder="Une phrase chaleureuse affichée sur la page d'accueil" />
          </Field>
          <Field label="Message affiché quand aucun créneau n'est ouvert">
            <textarea className="lmc-input" rows={2} value={messageAucunCreneau} onChange={(e) => setMessageAucunCreneau(e.target.value)} placeholder="Ex : Les Mondes Cachés arrivent bientôt, suis-moi pour ne rien manquer 🌿" />
          </Field>
          <button onClick={() => saveAll()} className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors" style={{ background: "#2B4433", color: "#F7ECD8" }}>Enregistrer</button>
        </div>
      </section>

      <section className="rounded-2xl border p-6 mb-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <h3 className="font-semibold mb-4" style={{ color: "#2B4433" }}>Mentions légales, CGV &amp; confidentialité</h3>
        <div className="space-y-4">
          <Field label="Mention affichée avant la validation d'une réservation">
            <textarea className="lmc-input" rows={3} value={noticeRetractation} onChange={(e) => setNoticeRetractation(e.target.value)} placeholder="Ex : mention sur le droit de rétractation" />
          </Field>
          <Field label={'Page "Mentions légales & CGV" (accessible depuis le pied de page du site)'}>
            <textarea className="lmc-input" rows={8} value={mentionsLegales} onChange={(e) => setMentionsLegales(e.target.value)} placeholder="Colle ou écris ici tes mentions légales, CGV et politique de confidentialité" />
          </Field>
          <button onClick={() => saveAll()} className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors" style={{ background: "#2B4433", color: "#F7ECD8" }}>Enregistrer</button>
        </div>
      </section>

      <section className="rounded-2xl border p-6 mb-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <h3 className="font-semibold mb-4" style={{ color: "#2B4433" }}>Villes / villages</h3>
        <div className="flex gap-2 mb-4">
          <input className="lmc-input" placeholder="Ajouter une ville ou un village" value={nouvelleVille} onChange={(e) => setNouvelleVille(e.target.value)} />
          <button onClick={() => { onAddVille(nouvelleVille); setNouvelleVille(""); }} className="shrink-0 px-4 rounded-full transition-colors" style={{ background: "#E8B94A", color: "#2B2118" }}><Plus size={18} /></button>
        </div>
        <div className="space-y-6">
          {villes.map((ville) => (
            <div key={ville.id} className="rounded-xl p-4 border" style={{ borderColor: "#DCC79C" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-semibold" style={{ color: "#2B4433" }}><MapPin size={16} /> {ville.nom}</div>
                <button onClick={() => onRemoveVille(ville.id)} className="text-[#B5744A] hover:text-[#8A4A26]"><Trash2 size={16} /></button>
              </div>
              <div className="space-y-2 mb-3">
                {ville.sessions.map((s) => (
                  <div key={s.id} className="text-sm rounded-lg px-3 py-2 font-medium" style={{ background: "#F3E3CB", color: "#2B4433" }}>
                    <div className="flex items-center justify-between">
                      <span>{s.date} · {s.heure} · {s.placesRestantes}/{s.placesTotal} place(s)</span>
                      <button onClick={() => onRemoveSession(ville.id, s.id)} className="text-[#B5744A] hover:text-[#8A4A26]"><Trash2 size={14} /></button>
                    </div>
                    {s.note && <div className="text-xs italic mt-0.5" style={{ color: "#8A7A56" }}>{s.note}</div>}
                  </div>
                ))}
                {ville.sessions.length === 0 && <p className="text-xs text-[#8A7A56] italic">Aucun créneau pour l'instant.</p>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input type="date" className="lmc-input text-sm" value={sessionForms[ville.id]?.date || ""} onChange={(e) => updateSessionForm(ville.id, "date", e.target.value)} />
                <input type="time" className="lmc-input text-sm" value={sessionForms[ville.id]?.heure || ""} onChange={(e) => updateSessionForm(ville.id, "heure", e.target.value)} />
                <input type="number" min={1} placeholder="Places" className="lmc-input text-sm" value={sessionForms[ville.id]?.places || ""} onChange={(e) => updateSessionForm(ville.id, "places", e.target.value)} />
                <button onClick={() => submitSession(ville.id)} className="text-sm rounded-lg font-semibold transition-colors" style={{ background: "#2B4433", color: "#F7ECD8" }}>Ajouter</button>
              </div>
              <input className="lmc-input text-sm mt-2" placeholder="Note (ex : prévoir tenue de pluie) — optionnel" value={sessionForms[ville.id]?.note || ""} onChange={(e) => updateSessionForm(ville.id, "note", e.target.value)} />
            </div>
          ))}
          {villes.length === 0 && <p className="text-sm text-[#8A7A56] italic">Ajoute une première ville pour commencer.</p>}
        </div>
      </section>

      <section className="rounded-2xl border p-6 mb-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <h3 className="font-semibold mb-4" style={{ color: "#2B4433" }}>Témoignages</h3>
        <div className="space-y-2 mb-4">
          {temoignages.map((t) => (
            <div key={t.id} className="flex items-center justify-between text-sm rounded-lg px-3 py-2" style={{ background: "#F3E3CB", color: "#2B4433" }}>
              <span><strong>{t.nom}</strong> — {t.texte}</span>
              <button onClick={() => removeTemoin(t.id)} className="text-[#B5744A] hover:text-[#8A4A26]"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <input className="lmc-input" placeholder="Nom du parent" value={nouveauTemoin.nom} onChange={(e) => setNouveauTemoin({ ...nouveauTemoin, nom: e.target.value })} />
          <input className="lmc-input" placeholder="Ce qu'ils/elles ont dit" value={nouveauTemoin.texte} onChange={(e) => setNouveauTemoin({ ...nouveauTemoin, texte: e.target.value })} />
        </div>
        <button onClick={addTemoin} className="text-sm font-semibold px-4 py-2 rounded-full" style={{ background: "#E8B94A", color: "#2B2118" }}>Ajouter le témoignage</button>
      </section>

      <section className="rounded-2xl border p-6 mb-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <h3 className="font-semibold mb-4" style={{ color: "#2B4433" }}>Questions fréquentes</h3>
        <div className="space-y-2 mb-4">
          {faq.map((f) => (
            <div key={f.id} className="flex items-center justify-between text-sm rounded-lg px-3 py-2" style={{ background: "#F3E3CB", color: "#2B4433" }}>
              <span><strong>{f.q}</strong> — {f.r}</span>
              <button onClick={() => removeFaqItem(f.id)} className="text-[#B5744A] hover:text-[#8A4A26]"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <input className="lmc-input" placeholder="Question" value={nouvelleFaq.q} onChange={(e) => setNouvelleFaq({ ...nouvelleFaq, q: e.target.value })} />
          <input className="lmc-input" placeholder="Réponse" value={nouvelleFaq.r} onChange={(e) => setNouvelleFaq({ ...nouvelleFaq, r: e.target.value })} />
        </div>
        <button onClick={addFaqItem} className="text-sm font-semibold px-4 py-2 rounded-full" style={{ background: "#E8B94A", color: "#2B2118" }}>Ajouter la question</button>
      </section>

      <section className="rounded-2xl border p-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2" style={{ color: "#2B4433" }}>
            <Lock size={16} /> Réservations ({reservations.length})
          </h3>
          {reservations.length > 0 && (
            <button onClick={() => exportCSV(reservations)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#2B4433", color: "#F7ECD8" }}>
              <Download size={13} /> Exporter en CSV
            </button>
          )}
        <button onClick={onToggleCorbeille} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#DCC79C", color: "#2B4433" }}>
  {voirCorbeille ? "Retour à la liste" : "Voir la corbeille"}
</button>
</div>
        <p className="text-xs mb-3" style={{ color: "#8A7A56" }}>
          Cette liste n'est visible que parce que tu es connecté·e — elle est invisible pour
          tout le monde d'autre.
        </p>
        {reservations.length === 0 ? (
          <p className="text-sm text-[#8A7A56] italic">Aucune réservation pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {reservations.filter((r) => !r.supprime === voirCorbeille).map((r) => (

              <div key={r.id} className="text-sm rounded-lg px-3 py-2 flex flex-wrap gap-x-4 gap-y-1 border" style={{ borderColor: "#DCC79C" }}>
                <span className="font-semibold" style={{ color: "#2B4433" }}>{r.nom}</span>
                <span className="font-medium" style={{ color: "#5C4A3A" }}>{r.ville_nom}</span>
                <span className="font-medium" style={{ color: "#5C4A3A" }}>{r.date} · {r.heure}</span>
                <span style={{ color: "#8A7A56" }}>{r.nb_enfants} enfant(s)</span>
                <span style={{ color: "#8A7A56" }}>{r.email}</span>
                {r.tel && <span style={{ color: "#8A7A56" }}>{r.tel}</span>}
                {r.en_attente && <span className="font-semibold" style={{ color: "#B5744A" }}>Liste d'attente</span>}
             {voirCorbeille ? (
  <button onClick={() => onRestaurerReservation(r.id)} className="text-xs underline" style={{ color: "#2B4433" }}>Restaurer</button>
) : (
  <button onClick={() => onSupprimerReservation(r.id)} className="text-xs underline" style={{ color: "#B5744A" }}>Supprimer</button>
)}
 </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
