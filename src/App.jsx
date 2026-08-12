import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin, Sparkles, Settings, X, Plus, Trash2, ArrowLeft, Check, Users, Calendar,
  Clock, Coins, Loader2, Leaf, Mail, Phone, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download,
  CalendarPlus, Star, ScrollText, Lock, Upload, ShoppingBag, Minus, Tag, Compass, BookOpen, Gift
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
const formatPrix = (n) => `${Number(n).toFixed(2).replace(".", ",")} €`;
const getImages = (p) => (p.images && p.images.length ? p.images : p.image ? [p.image] : []);
const stockLimite = (p) => p.stock !== undefined && p.stock !== null && p.stock !== "";
const telephoneValide = (tel) => /^0\d{9}$/.test((tel || "").replace(/[\s.\-]/g, ""));
const enRupture = (p) => stockLimite(p) && Number(p.stock) <= 0;

const DEFAULT_CONFIG = {
  eyebrowAtelier: "Atelier immersif",
  titre: "Une histoire à vivre en famille",
  description:
    "Un temps suspendu pour explorer, imaginer et découvrir — chez vous ou près de chez vous.",
  prix: 25,
  lienPaiement: "",
  logoImage: "",
  ageRange: "4 - 10 ans",
  duree: "2h",
  contactEmail: "",
  contactTel: "",
  paypalEmail: "",
  fraisPort: 4.9,
  emailjsServiceId: "service_r1002kb",
  emailjsPublicKey: "feN2CqnAJEyty4ZgA",
  emailjsTemplateParent: "template_z09d89r",
  emailjsTemplateListeAttente: "",
  emailjsTemplateAdmin: "template_z09d89r",
  emailjsTemplateCommandeParent: "",
  emailjsTemplateCommandeAdmin: "",
  conditions:
    "Annulation possible jusqu'à 48h avant l'atelier. En cas de pluie, l'atelier est maintenu en intérieur ou reporté selon les cas.",
  reglementAtelier:
    "Pour préserver la magie de l'histoire et du décor, les photos et vidéos ne sont pas autorisées pendant l'atelier. Merci de mettre votre téléphone en silencieux le temps de l'immersion.",
  motAccueil:
    "Ici commence chaque histoire : une tente plantée sous les arbres, et un monde qui s'entrouvre.",
  etapeAvantTitre: "Avant",
  etapeAvant:
    "On se retrouve, on écoute les premières consignes, et on découvre le nouveau monde ensemble.",
  etapePendantTitre: "Pendant",
  etapePendant:
    "L'histoire se vit, se joue, se chuchote — chaque enfant devient acteur de son monde.",
  etapeApresTitre: "Après",
  etapeApres:
    "Chaque explorateur repart avec un petit souvenir de son passage dans ce monde.",
  motAccueilBoutique:
    "Livrets, boîtes surprises et objets à glisser dans une poche, une chambre, une histoire.",
  messageAucunCreneau:
    "Aucun créneau n'est ouvert pour le moment. Revenez un peu plus tard, un nouveau monde va s'ouvrir.",
  noticeRetractation:
    "Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux prestations de loisirs fournies à une date déterminée. En confirmant, vous acceptez cette condition ainsi que nos conditions générales de vente.",
  noticeRetractationBoutique:
    "Conformément aux articles L221-18 et suivants du Code de la consommation, vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de motif. En confirmant, vous acceptez cette condition ainsi que nos conditions générales de vente.",
  mentionsLegales:
    "MENTIONS LÉGALES\n\nÉditeur du site : [Ton nom et prénom]\nStatut : [à compléter, ex. micro-entreprise]\nSIRET : [à compléter]\nAdresse : [à compléter]\nEmail : [à compléter]\nTéléphone : [à compléter]\n\n" +
    "CONDITIONS GÉNÉRALES DE VENTE — ATELIERS\n\nArticle 1 — Prix : les tarifs affichés sont ceux en vigueur au moment de la réservation.\n" +
    "Article 2 — Réservation : la réservation est confirmée dès validation du formulaire en ligne, dans la limite des places disponibles.\n" +
    "Article 3 — Paiement : le règlement s'effectue via un lien de paiement sécurisé externe.\n" +
    "Article 4 — Annulation : [à compléter — délai et conditions de remboursement].\n" +
    "Article 5 — Droit de rétractation : conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux prestations de loisirs fournies à une date déterminée.\n" +
    "Article 6 — Droit à l'image : aucune photo d'un enfant n'est publiée sans l'accord préalable d'un parent ou représentant légal.\n\n" +
    "CONDITIONS GÉNÉRALES DE VENTE — BOUTIQUE\n\nArticle 1 — Prix : les tarifs affichés sont ceux en vigueur au moment de la commande, frais de port [à compléter].\n" +
    "Article 2 — Commande : la commande est enregistrée dès réception du paiement.\n" +
    "Article 3 — Expédition : délai indicatif d'expédition [à compléter, ex. sous 5 à 10 jours ouvrés].\n" +
    "Article 4 — Droit de rétractation : conformément aux articles L221-18 et suivants du Code de la consommation, vous disposez de 14 jours à compter de la réception de votre commande pour vous rétracter, sans justification. L'article doit être retourné dans son état d'origine ; les frais de retour restent à la charge du client sauf mention contraire.\n" +
    "Article 5 — Articles défectueux ou endommagés : contacte-nous à [email de contact] avec une photo de l'article concerné.\n\n" +
    "POLITIQUE DE CONFIDENTIALITÉ\n\nLes informations recueillies (nom, email, téléphone, adresse, nombre d'enfants) servent uniquement à la gestion des réservations et commandes. Elles ne sont jamais transmises à des tiers, hormis le prestataire de paiement pour le règlement. Vous pouvez demander l'accès, la rectification ou la suppression de vos données à tout moment en écrivant à [email de contact].",
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

function EtapesAtelier({ avantTitre, avant, pendantTitre, pendant, apresTitre, apres }) {
  if (!avant && !pendant && !apres) return null;
  const etapes = [
    { icon: Compass, label: avantTitre || "Avant", texte: avant },
    { icon: BookOpen, label: pendantTitre || "Pendant", texte: pendant },
    { icon: Gift, label: apresTitre || "Après", texte: apres },
  ].filter((e) => e.texte);
  if (etapes.length === 0) return null;
  return (
    <div className="mb-10">
      <h3 className="lmc-display text-3xl mb-4 text-center" style={{ color: "#2B4433" }}>Comment se déroule l'atelier</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {etapes.map((e, i) => (
          <div key={i} className="rounded-2xl border p-5 text-center" style={{ borderColor: "#DCC79C", background: "#FBF3E3" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#2B4433", color: "#F7ECD8" }}>
              <e.icon size={18} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#E8B94A" }}>{e.label}</p>
            <p className="text-sm leading-relaxed" style={{ color: "#5C4A3A" }}>{e.texte}</p>
          </div>
        ))}
      </div>
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
  const [commandeConfirmee, setCommandeConfirmee] = useState(false);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("merci") === "1") {
    setPaiementConfirme(true);
    window.history.replaceState({}, "", window.location.pathname);

    const pendingRaw = localStorage.getItem("lmc_reservations_pending");
    if (pendingRaw) {
      (async () => {
        try {
          const file = JSON.parse(pendingRaw);
          for (const reservation of file) {
            await insertReservation(reservation);
            if (!reservation.enAttente) {
              await decrementerPlaceSession(reservation.villeId, reservation.sessionId, reservation.nbEnfants);
            }
          }
          localStorage.removeItem("lmc_reservations_pending");
        } catch (e) {
          console.error("Erreur finalisation réservation après paiement:", e);
        }
      })();
    }
  }
  if (params.get("commande") === "1") {
    setCommandeConfirmee(true);
    window.history.replaceState({}, "", window.location.pathname);

    const pendingCommande = localStorage.getItem("lmc_commande_pending");
    if (pendingCommande) {
      try {
        const commande = JSON.parse(pendingCommande);
        insertCommande(commande).then(() => {
          envoyerEmailCommande(commande);
          decrementerStock(commande.articles);
          localStorage.removeItem("lmc_commande_pending");
          const idsPayes = (commande.articles || []).map((a) => a.id);
          setPanier((prev) => prev.filter((i) => !idsPayes.includes(i.id)));
        });
      } catch (e) {
        console.error("Erreur finalisation commande après paiement:", e);
      }
    }
  }
}, []);



  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [villes, setVilles] = useState([]);
  const [reservations, setReservations] = useState([]);
const [voirCorbeille, setVoirCorbeille] = useState(false);
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState([]);
  const [panierOuvert, setPanierOuvert] = useState(false);
  const [produitDetail, setProduitDetail] = useState(null);
  const [commandeModalOuvert, setCommandeModalOuvert] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [voirCorbeilleCommandes, setVoirCorbeilleCommandes] = useState(false);
  const [avisPublics, setAvisPublics] = useState([]);
  const [avisAdmin, setAvisAdmin] = useState([]);

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

  const loadCommandes = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("commandes")
        .select("*")
        .order("cree_le", { ascending: false });
      if (err) throw err;
      setCommandes(data || []);
    } catch (e) {
      console.error("Erreur de chargement des commandes:", e);
    }
  }, []);
  const supprimerCommande = async (id) => {
    try {
      const { error: err } = await supabase.from("commandes").update({ supprime: true }).eq("id", id);
      if (err) throw err;
      loadCommandes();
    } catch (e) {
      console.error("Erreur suppression commande:", e);
    }
  };
  const restaurerCommande = async (id) => {
    try {
      const { error: err } = await supabase.from("commandes").update({ supprime: false }).eq("id", id);
      if (err) throw err;
      loadCommandes();
    } catch (e) {
      console.error("Erreur restauration commande:", e);
    }
  };

  const loadAvisAdmin = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("avis")
        .select("*")
        .eq("supprime", false)
        .order("cree_le", { ascending: false });
      if (err) throw err;
      setAvisAdmin(data || []);
    } catch (e) {
      console.error("Erreur de chargement des avis (admin):", e);
    }
  }, []);
  const validerAvis = async (id) => {
    try {
      const { error: err } = await supabase.from("avis").update({ valide: true }).eq("id", id);
      if (err) throw err;
      loadAvisAdmin();
      loadAvisPublics();
    } catch (e) {
      console.error("Erreur validation avis:", e);
    }
  };
  const depublierAvis = async (id) => {
    try {
      const { error: err } = await supabase.from("avis").update({ valide: false }).eq("id", id);
      if (err) throw err;
      loadAvisAdmin();
      loadAvisPublics();
    } catch (e) {
      console.error("Erreur dépublication avis:", e);
    }
  };
  const supprimerAvis = async (id) => {
    try {
      const { error: err } = await supabase.from("avis").update({ supprime: true }).eq("id", id);
      if (err) throw err;
      loadAvisAdmin();
      loadAvisPublics();
    } catch (e) {
      console.error("Erreur suppression avis:", e);
    }
  };
  const envoyerAvis = async (a) => {
    try {
      const { error: err } = await supabase.from("avis").insert({
        prenom: a.prenom,
        age: a.age || null,
        texte: a.texte,
      });
      if (err) throw err;
      return { ok: true };
    } catch (e) {
      console.error("Erreur envoi avis:", e);
      return { ok: false, message: e?.message || String(e) };
    }
  };

  useEffect(() => {
    if (view === "admin" && estConnecte) { loadReservations(); loadCommandes(); loadAvisAdmin(); }
  }, [view, estConnecte, loadReservations, loadCommandes, loadAvisAdmin]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("kv_store")
        .select("key, value")
        .in("key", ["config", "villes", "produits"]);
      if (err) throw err;
      const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]));
      setConfig(map.config ? { ...DEFAULT_CONFIG, ...JSON.parse(map.config) } : DEFAULT_CONFIG);
      setVilles(map.villes ? JSON.parse(map.villes) : []);
      setProduits(map.produits ? JSON.parse(map.produits) : []);
    } catch (e) {
      console.error("Erreur de chargement Supabase:", e);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAvisPublics = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("avis")
        .select("*")
        .eq("valide", true)
        .eq("supprime", false)
        .order("cree_le", { ascending: false });
      if (err) throw err;
      setAvisPublics(data || []);
    } catch (e) {
      console.error("Erreur de chargement des avis:", e);
    }
  }, []);

  useEffect(() => {
    loadAvisPublics();
  }, [loadAvisPublics]);

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

  const persistProduits = async (next) => {
    setProduits(next);
    try {
      const { error: err } = await supabase.from("kv_store").upsert({ key: "produits", value: JSON.stringify(next) });
      if (err) throw err;
    } catch (e) {
      console.error("Erreur Supabase produits:", e);
      setError(`Échec de l'enregistrement (boutique) : ${e?.message || e}`);
    }
  };
  const saveProduit = (produit) => {
    const existe = produits.some((p) => p.id === produit.id);
    const next = existe ? produits.map((p) => (p.id === produit.id ? produit : p)) : [...produits, produit];
    persistProduits(next);
  };
  const removeProduit = (id) => persistProduits(produits.filter((p) => p.id !== id));

  const decrementerStock = async (articles) => {
    if (!articles || articles.length === 0) return;
    try {
      const { data, error: err } = await supabase.from("kv_store").select("value").eq("key", "produits").single();
      if (err) throw err;
      const liste = data?.value ? JSON.parse(data.value) : [];
      const maj = liste.map((p) => {
        const achat = articles.find((a) => a.id === p.id);
        if (!achat || !stockLimite(p)) return p;
        return { ...p, stock: Math.max(0, Number(p.stock) - achat.qte) };
      });
      const { error: err2 } = await supabase.from("kv_store").upsert({ key: "produits", value: JSON.stringify(maj) });
      if (err2) throw err2;
      setProduits(maj);
    } catch (e) {
      console.error("Erreur décrément stock:", e);
    }
  };

  const decrementerPlaceSession = async (villeId, sessionId, nbEnfants) => {
    try {
      const { data, error: err } = await supabase.from("kv_store").select("value").eq("key", "villes").single();
      if (err) throw err;
      const liste = data?.value ? JSON.parse(data.value) : [];
      const maj = liste.map((v) =>
        v.id === villeId
          ? {
              ...v,
              sessions: v.sessions.map((s) =>
                s.id === sessionId
                  ? { ...s, placesRestantes: Math.max(0, s.placesRestantes - Number(nbEnfants || 1)) }
                  : s
              ),
            }
          : v
      );
      const { error: err2 } = await supabase.from("kv_store").upsert({ key: "villes", value: JSON.stringify(maj) });
      if (err2) throw err2;
      setVilles(maj);
    } catch (e) {
      console.error("Erreur décrément places:", e);
    }
  };

  const ajouterAuPanier = (produit, qte = 1) => {
    setPanier((prev) => {
      const trouve = prev.find((i) => i.id === produit.id);
      const dejaDansPanier = trouve ? trouve.qte : 0;
      const plafond = stockLimite(produit) ? Math.max(0, Number(produit.stock) - dejaDansPanier) : qte;
      const qteAjoutee = Math.min(qte, plafond);
      if (qteAjoutee <= 0) return prev;
      if (trouve) return prev.map((i) => (i.id === produit.id ? { ...i, qte: i.qte + qteAjoutee } : i));
      return [...prev, { ...produit, qte: qteAjoutee }];
    });
    setPanierOuvert(true);
  };
  const retirerDuPanier = (id) => setPanier((prev) => prev.filter((i) => i.id !== id));
  const changerQtePanier = (id, qte) =>
    setPanier((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const plafond = stockLimite(i) ? Number(i.stock) : Infinity;
        return { ...i, qte: Math.max(1, Math.min(qte, plafond)) };
      })
    );

  const envoyerEmails = async (r) => {
    if (!config.emailjsServiceId || !config.emailjsPublicKey || !window.emailjs) return;
    const params = {
      to_email: r.email,
      parent_nom: r.nom,
      parent_tel: r.tel || "",
      atelier_titre: config.titre,
      ville: r.villeNom,
      date: r.date,
      heure: r.heure,
      nb_enfants: r.nbEnfants,
      statut: r.enAttente ? "Liste d'attente" : "Confirmée",
    };
    try {
      const templateClient = r.enAttente && config.emailjsTemplateListeAttente ? config.emailjsTemplateListeAttente : config.emailjsTemplateParent;
      if (templateClient) {
        await window.emailjs.send(config.emailjsServiceId, templateClient, params, { publicKey: config.emailjsPublicKey });
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

  const insertCommande = async (c) => {
    try {
      const { error: err } = await supabase.from("commandes").insert({
        nom: c.nom,
        email: c.email,
        tel: c.tel || null,
        adresse: c.adresse,
        articles: c.articles,
        frais_port: c.fraisPort || 0,
        total: c.total,
      });
      if (err) throw err;
    } catch (e) {
      console.error("Erreur Supabase commandes:", e);
      setError(`Échec de l'enregistrement (commande) : ${e?.message || e}`);
    }
  };

  const envoyerEmailCommande = async (c) => {
    if (!config.emailjsServiceId || !config.emailjsPublicKey || !window.emailjs) return;
    const params = {
      to_email: c.email,
      parent_nom: c.nom,
      articles_liste: c.articles.map((a) => `${a.titre} x${a.qte}`).join(", "),
      total: formatPrix(c.total),
      adresse: c.adresse,
    };
    try {
      if (config.emailjsTemplateCommandeParent) {
        await window.emailjs.send(config.emailjsServiceId, config.emailjsTemplateCommandeParent, params, { publicKey: config.emailjsPublicKey });
      }
    } catch (e) {
      console.error("Erreur envoi email commande (client):", e);
    }
    try {
      if (config.emailjsTemplateCommandeAdmin && config.contactEmail) {
        await window.emailjs.send(config.emailjsServiceId, config.emailjsTemplateCommandeAdmin, { ...params, to_email: config.contactEmail }, { publicKey: config.emailjsPublicKey });
      }
    } catch (e) {
      console.error("Erreur envoi email commande (admin):", e);
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
  const ajusterPlacesSession = (villeId, sessionId, delta) => {
    const next = villes.map((v) =>
      v.id === villeId
        ? {
            ...v,
            sessions: v.sessions.map((s) =>
              s.id === sessionId
                ? { ...s, placesRestantes: Math.max(0, Math.min(s.placesTotal, s.placesRestantes + delta)) }
                : s
            ),
          }
        : v
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
      setError("Merci de renseigner au moins votre nom et votre email.");
      return;
    }
    if (!form.tel.trim()) {
      setError("Le téléphone est obligatoire, pour pouvoir vous transmettre le lieu exact de l'atelier.");
      return;
    }
    if (!telephoneValide(form.tel)) {
      setError("Le numéro de téléphone ne semble pas valide — merci de vérifier (10 chiffres, sans lettre).");
      return;
    }
    if (selectedSession.placesRestantes > 0 && Number(form.nbEnfants || 1) > selectedSession.placesRestantes) {
      setError(`Il ne reste que ${selectedSession.placesRestantes} place(s) pour ce créneau — merci de réduire le nombre d'enfants, ou de nous contacter directement.`);
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

    if (enAttente) {
      // Pas de place disponible : on enregistre directement l'inscription en liste
      // d'attente, sans jamais rediriger vers un paiement (rien à payer tant qu'aucune
      // place ne s'est libérée).
      await insertReservation(reservation);
      localStorage.setItem("lmc_derniere_resa", String(Date.now()));
      setSaving(false);
      setStep("confirmation");
      return;
    }

    const dejaEnFile = JSON.parse(localStorage.getItem("lmc_reservations_pending") || "[]");
    dejaEnFile.push(reservation);
    localStorage.setItem("lmc_reservations_pending", JSON.stringify(dejaEnFile));

    localStorage.setItem("lmc_derniere_resa", String(Date.now()));
    window.location.href = config.lienPaiement || window.location.href;
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

        {(view === "parent" || view === "boutique") && (
          <button
            onClick={() => setPanierOuvert(true)}
            className="absolute top-5 right-16 z-10 text-[#F7ECD8]/70 hover:text-[#E8B94A] transition-colors"
            aria-label="Voir le panier"
          >
            <ShoppingBag size={20} />
            {panier.length > 0 && (
              <span
                className="absolute -top-2 -right-2 text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
                style={{ background: "#E8B94A", color: "#2B2118" }}
              >
                {panier.reduce((s, i) => s + i.qte, 0)}
              </span>
            )}
          </button>
        )}

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

          {view === "boutique" ? (
            <>
              <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#F3D089" }}>
                <Sparkles size={13} /><span>La boutique</span><Sparkles size={13} />
              </div>
              <p className="lmc-story text-[#CFC6E8] text-base sm:text-lg max-w-md leading-relaxed mb-5">
                {config.motAccueilBoutique}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#F3D089" }}>
                <Sparkles size={13} /><span>{config.eyebrowAtelier}</span><Sparkles size={13} />
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
            </>
          )}

          {(view === "parent" || view === "boutique") && (
            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={() => setView("parent")}
                className="text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                style={view === "parent" ? { background: "#E8B94A", color: "#2B2118" } : { background: "rgba(247,236,216,0.12)", color: "#F7ECD8", border: "1px solid rgba(232,185,74,0.4)" }}
              >
                Ateliers
              </button>
              <button
                onClick={() => setView("boutique")}
                className="text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                style={view === "boutique" ? { background: "#E8B94A", color: "#2B2118" } : { background: "rgba(247,236,216,0.12)", color: "#F7ECD8", border: "1px solid rgba(232,185,74,0.4)" }}
              >
                Boutique
              </button>
            </div>
          )}
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
            config={config} villes={villes} reservations={reservations} produits={produits} commandes={commandes}
            onSaveConfig={persistConfig} onAddVille={addVille} onRemoveVille={removeVille}
            onAddSession={addSession} onRemoveSession={removeSession} onAjusterPlaces={ajusterPlacesSession} onClose={seDeconnecter} onChangePassword={changerMotDePasse}
          onSupprimerReservation={supprimerReservation}
onRestaurerReservation={restaurerReservation}
voirCorbeille={voirCorbeille}
onToggleCorbeille={() => setVoirCorbeille(!voirCorbeille)}
onSaveProduit={saveProduit}
onRemoveProduit={removeProduit}
onSupprimerCommande={supprimerCommande}
onRestaurerCommande={restaurerCommande}
voirCorbeilleCommandes={voirCorbeilleCommandes}
onToggleCorbeilleCommandes={() => setVoirCorbeilleCommandes(!voirCorbeilleCommandes)}
avisAdmin={avisAdmin}
onValiderAvis={validerAvis}
onDepublierAvis={depublierAvis}
onSupprimerAvis={supprimerAvis}
/>
        ) : view === "legal" ? (
          <LegalPage texte={config.mentionsLegales} onBack={() => setView("parent")} />
        ) : view === "boutique" ? (
          commandeConfirmee ? (
            <MerciCommande onRetour={() => setCommandeConfirmee(false)} articlesRestants={panier.length} />
          ) : (
            <BoutiquePage produits={produits} onOpenProduit={setProduitDetail} onAjouterPanier={ajouterAuPanier} />
          )
        ) : paiementConfirme ? (
          <MerciPaiement onRetour={() => setPaiementConfirme(false)} />
        ) : (
          <ParentFlow
            config={config} villes={villes} step={step} selectedVille={selectedVille} selectedSession={selectedSession}
            form={form} setForm={setForm} saving={saving} openFaq={openFaq} setOpenFaq={setOpenFaq}
            onSelectVille={setSelectedVille} onStartBooking={startBooking} onConfirm={confirmBooking}
            onReset={resetParcours} onBack={() => setStep("choix")}
            avisPublics={avisPublics} onEnvoyerAvis={envoyerAvis}
          />
        )}
      </main>

      {produitDetail && (
        <ProduitModal
          produit={produitDetail}
          onClose={() => setProduitDetail(null)}
          onAjouter={(qte) => { ajouterAuPanier(produitDetail, qte); setProduitDetail(null); }}
        />
      )}

      <PanierDrawer
        ouvert={panierOuvert}
        panier={panier}
        fraisPort={config.fraisPort}
        onFermer={() => setPanierOuvert(false)}
        onChangerQte={changerQtePanier}
        onRetirer={retirerDuPanier}
        onCommander={() => { setPanierOuvert(false); setCommandeModalOuvert(true); }}
      />

      {commandeModalOuvert && (
        <CommandeModal
          panier={panier}
          fraisPort={config.fraisPort}
          noticeRetractation={config.noticeRetractationBoutique}
          paypalEmail={config.paypalEmail}
          onClose={() => setCommandeModalOuvert(false)}
        />
      )}

      <footer className="text-center text-[#8A7A56] text-xs py-8 flex flex-col items-center gap-2">
        <Leaf size={14} className="text-[#6E8F52]" />
        <span>Les Mondes Cachés — un atelier à la fois, un monde différent à chaque fois.</span>
        {(config.contactEmail || config.contactTel) && (
          <div className="flex items-center gap-4 mt-1">
            {config.contactEmail && (
              <a href={`mailto:${config.contactEmail}`} className="flex items-center gap-1 hover:text-[#5C4A3A] underline underline-offset-4">
                <Mail size={12} /> {config.contactEmail}
              </a>
            )}
            {config.contactTel && (
              <a href={`tel:${config.contactTel.replace(/\s/g, "")}`} className="flex items-center gap-1 hover:text-[#5C4A3A] underline underline-offset-4">
                <Phone size={12} /> {config.contactTel}
              </a>
            )}
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
        Votre paiement a bien été pris en compte. On a hâte de vous accueillir !
      </p> <p className="text-xs mt-4" style={{ color: "#5C4A3A" }}>
  Un email de confirmation vous a été envoyé. Pensez à vérifier vos courriers indésirables/spams si vous ne le voyez pas d'ici quelques minutes.
</p>

      <button onClick={onRetour} className="text-sm text-[#5C4A3A] underline underline-offset-4 font-medium">
        Retour à l'accueil
      </button>
    </div>
  );
}

function MerciCommande({ onRetour, articlesRestants = 0 }) {
  return (
    <div className="text-center py-10">
      <div className="w-16 h-16 rounded-full text-[#F7ECD8] flex items-center justify-center mx-auto mb-6" style={{ background: "#2B4433" }}>
        <Check size={28} />
      </div>
      <h2 className="lmc-display text-4xl mb-2" style={{ color: "#2B4433" }}>Merci pour votre commande !</h2>
      <p className="text-[#5C4A3A] mb-6 max-w-md mx-auto font-medium">
        Votre paiement a bien été pris en compte, votre commande est enregistrée et sera préparée avec soin.
      </p>
      <p className="text-xs mt-4" style={{ color: "#5C4A3A" }}>
        Un email de confirmation vous a été envoyé. Pensez à vérifier vos courriers indésirables/spams si vous ne le voyez pas d'ici quelques minutes.
      </p>
      {articlesRestants > 0 && (
        <p className="text-xs mt-3 font-semibold rounded-lg inline-block px-3 py-2" style={{ background: "#F3E3CB", color: "#8A5A26" }}>
          Il vous reste {articlesRestants} article{articlesRestants > 1 ? "s" : ""} dans votre panier à régler séparément.
        </p>
      )}
      <div>
        <button onClick={onRetour} className="text-sm text-[#5C4A3A] underline underline-offset-4 font-medium mt-6">
          Retour à la boutique
        </button>
      </div>
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

function AvisSection({ avisPublics, onEnvoyerAvis }) {
  const [ouvert, setOuvert] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [age, setAge] = useState("");
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");

  const soumettre = async () => {
    if (!prenom.trim() || !texte.trim()) {
      setErreur("Merci de renseigner au moins un prénom et un petit mot.");
      return;
    }
    setErreur("");
    setEnvoi(true);
    const resultat = await onEnvoyerAvis({ prenom: prenom.trim(), age: age.trim(), texte: texte.trim() });
    setEnvoi(false);
    if (resultat.ok) {
      setEnvoye(true);
      setPrenom(""); setAge(""); setTexte("");
    } else {
      setErreur(`Erreur technique (à montrer à l'administratrice) : ${resultat.message}`);
    }
  };

  return (
    <div>
      {avisPublics.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {avisPublics.map((a) => (
            <div key={a.id} className="p-4 rounded-2xl relative" style={{ background: "#FBF3E3", border: "1px solid #DCC79C" }}>
              <LeafCorner className="absolute top-1 right-1 opacity-60" />
              <p className="text-sm italic" style={{ color: "#5C4A3A" }}>« {a.texte} »</p>
              <p className="text-xs font-semibold mt-2" style={{ color: "#2B4433" }}>— {a.prenom}{a.age ? `, ${a.age}` : ""}</p>
            </div>
          ))}
        </div>
      )}

      {envoye ? (
        <p className="text-sm font-medium rounded-xl px-4 py-3" style={{ background: "#FBF3E3", color: "#2B4433" }}>
          Merci ! Votre avis sera visible sur le site une fois validé. 🌿
        </p>
      ) : ouvert ? (
        <div className="rounded-2xl border p-5" style={{ borderColor: "#DCC79C", background: "#FBF3E3" }}>
          <p className="text-xs mb-3" style={{ color: "#8A7A56" }}>
            Ce que votre enfant a dit après l'atelier (ou votre propre avis, si vous préférez).
          </p>
          <div className="space-y-3">
            <Field label="Prénom (de l'enfant, ou le vôtre)"><input className="lmc-input" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Ex. Emma" /></Field>
            <Field label="Âge (optionnel)"><input className="lmc-input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex. 6 ans" /></Field>
            <Field label="Le petit mot"><textarea className="lmc-input" rows={3} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Ce qu'il/elle a préféré, ce qu'il/elle a ressenti…" /></Field>
          </div>
          {erreur && <p className="text-xs mt-2 font-medium" style={{ color: "#B5744A" }}>{erreur}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={() => setOuvert(false)} className="text-sm font-medium px-4 py-2 rounded-full border" style={{ borderColor: "#DCC79C", color: "#5C4A3A" }}>Annuler</button>
            <button onClick={soumettre} disabled={envoi} className="text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-60" style={{ background: "#2B4433", color: "#F7ECD8" }}>
              {envoi ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOuvert(true)} className="text-sm font-semibold px-5 py-2.5 rounded-full" style={{ background: "#E8B94A", color: "#2B2118" }}>
          Partager un avis
        </button>
      )}
    </div>
  );
}

function ParentFlow({
  config, villes, step, selectedVille, selectedSession, form, setForm, saving, openFaq, setOpenFaq,
  onSelectVille, onStartBooking, onConfirm, onReset, onBack, avisPublics, onEnvoyerAvis,
}) {
  const villesAvecSessions = villes.filter((v) => v.sessions.length > 0);

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
          {enAttente ? "Vous êtes sur la liste d'attente" : "Réservation enregistrée"}
        </h2>
        <p className="text-[#5C4A3A] mb-6 max-w-md mx-auto font-medium">
          {enAttente
            ? `Nous vous recontacterons à ${form.email} si une place se libère pour le ${selectedSession?.date} à ${selectedSession?.heure} (${selectedVille?.nom}).`
            : `Une place vous attend à ${selectedSession?.date} à ${selectedSession?.heure} (${selectedVille?.nom}). Un e-mail de confirmation sera envoyé à ${form.email}.`}
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
          <Field label="Votre nom"><input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="lmc-input" placeholder="Prénom et nom" /></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="lmc-input" placeholder="votre@email.fr" /></Field>
          <Field label="Téléphone">
            <input
              type="tel"
              value={form.tel}
              onChange={(e) => setForm({ ...form, tel: e.target.value })}
              className="lmc-input"
              placeholder="06 12 34 56 78"
              style={form.tel.trim() && !telephoneValide(form.tel) ? { borderColor: "#B5744A", boxShadow: "0 0 0 2px rgba(181,116,74,0.2)" } : undefined}
            />
            {form.tel.trim() && !telephoneValide(form.tel) && (
              <p className="text-xs mt-1 font-medium" style={{ color: "#B5744A" }}>
                Ce numéro ne semble pas valide (10 chiffres attendus, sans lettre).
              </p>
            )}
          </Field>
          <Field label="Nombre d'enfants">
            <input
              type="number"
              min={1}
              max={complet ? selectedSession.placesTotal : selectedSession.placesRestantes}
              value={form.nbEnfants}
              onChange={(e) => setForm({ ...form, nbEnfants: e.target.value })}
              className="lmc-input"
            />
          </Field>
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

        {config.reglementAtelier && (
          <div className="mt-4 flex items-start gap-2 text-xs rounded-lg px-3 py-2.5" style={{ background: "#F3E3CB", color: "#5C4A3A" }}>
            <ScrollText size={14} className="mt-0.5 shrink-0" />
            <p className="leading-relaxed">{config.reglementAtelier}</p>
          </div>
        )}

        <div className="mt-4 rounded-lg px-3 py-2.5 text-sm font-semibold text-center" style={{ background: "#F3D089", color: "#2B2118" }}>
          {complet
            ? `Vous vous inscrivez en liste d'attente pour ${form.nbEnfants || 1} enfant${Number(form.nbEnfants) > 1 ? "s" : ""} — vérifiez ce nombre avant de confirmer.`
            : `Vous réservez pour ${form.nbEnfants || 1} enfant${Number(form.nbEnfants) > 1 ? "s" : ""} — vérifiez ce nombre avant de confirmer.`}
        </div>

        <button onClick={onConfirm} disabled={saving} className="mt-4 w-full font-semibold py-3 rounded-full transition-colors disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: complet ? "#8A5A26" : "#2B4433", color: "#F7ECD8" }}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : null}
          {complet ? "Rejoindre la liste d'attente" : "Confirmer la réservation"}
        </button>
      </div>
    );
  }

  const villeUnique = villesAvecSessions.length === 1 ? villesAvecSessions[0] : null;

  return (
    <div>
      {/* Mot d'accueil, modifiable selon la saison */}
      <div className="mb-10">
        <MotAccueil texte={config.motAccueil} />
      </div>

      <EtapesAtelier
        avantTitre={config.etapeAvantTitre} avant={config.etapeAvant}
        pendantTitre={config.etapePendantTitre} pendant={config.etapePendant}
        apresTitre={config.etapeApresTitre} apres={config.etapeApres}
      />

      <div className="mt-6">
        {villeUnique ? (
          <>
            <SectionTitle>Créneaux à {villeUnique.nom}</SectionTitle>
            <div className="space-y-3">
              {villeUnique.sessions.map((session) => {
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
                    <button onClick={() => onStartBooking(villeUnique, session)} className="text-sm font-semibold px-4 py-2 rounded-full transition-colors" style={{ background: complet ? "#E4D4B8" : "#E8B94A", color: "#2B2118" }}>
                      {complet ? "Liste d'attente" : "Réserver"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <SectionTitle>Choisissez votre ville ou village</SectionTitle>
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
          </>
        )}
      </div>

      <div className="mt-12">
        <VineDivider />
        <div className="flex items-center gap-2 mt-4 mb-4">
          <Star size={16} className="text-[#E8B94A]" />
          <h3 className="lmc-display text-3xl" style={{ color: "#2B4433" }}>Ce qu'ils en disent</h3>
        </div>
        <AvisSection avisPublics={avisPublics} onEnvoyerAvis={onEnvoyerAvis} />
      </div>

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

/* ---------- Boutique (vitrine) ---------- */

function BoutiquePage({ produits, onOpenProduit, onAjouterPanier }) {
  const [filtre, setFiltre] = useState("tous");
  const categories = Array.from(new Set(produits.map((p) => p.categorie).filter(Boolean)));
  const visibles = filtre === "tous" ? produits : produits.filter((p) => p.categorie === filtre);

  return (
    <div>
      <SectionTitle icon={<ShoppingBag size={20} style={{ color: "#E8B94A" }} />}>La boutique</SectionTitle>

      {produits.length === 0 ? (
        <p className="text-[#8A7A56] font-medium">La boutique arrive bientôt — revenez un peu plus tard.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFiltre("tous")}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              style={filtre === "tous" ? { background: "#2B4433", color: "#F7ECD8" } : { background: "#F3E3CB", color: "#5C4A3A" }}
            >
              Tout
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFiltre(c)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                style={filtre === c ? { background: "#2B4433", color: "#F7ECD8" } : { background: "#F3E3CB", color: "#5C4A3A" }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {visibles.map((p) => {
              const imgs = getImages(p);
              return (
                <div key={p.id} className="rounded-2xl border overflow-hidden relative" style={{ borderColor: "#DCC79C", background: "#FBF3E3" }}>
                  <LeafCorner className="absolute top-2 right-2 opacity-70 z-10" />
                  <div className="h-44 w-full overflow-hidden relative" style={{ background: "#F3E3CB" }}>
                    {imgs[0] ? (
                      <img src={imgs[0]} alt={p.titre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles size={26} style={{ color: "#DCC79C" }} />
                      </div>
                    )}
                    {p.badge && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(43,68,51,0.85)", color: "#F7ECD8" }}>
                        {p.badge}
                      </span>
                    )}
                    {imgs.length > 1 && (
                      <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(43,68,51,0.75)", color: "#F7ECD8" }}>
                        1/{imgs.length}
                      </span>
                    )}
                    {enRupture(p) && (
                      <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(181,116,74,0.9)", color: "#F7ECD8" }}>
                        Rupture de stock
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {p.categorie && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#8A7A56" }}>
                        <Tag size={10} /> {p.categorie}
                      </span>
                    )}
                    <h3 className="font-semibold text-base mb-1" style={{ color: "#2B4433" }}>{p.titre}</h3>
                    <p className="text-sm mb-3" style={{ color: "#8A7A56" }}>{p.resume}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold" style={{ color: "#2B4433" }}>{formatPrix(p.prix)}</span>
                      <div className="flex gap-2">
                        <button onClick={() => onOpenProduit(p)} className="text-xs font-semibold px-3 py-2 rounded-full border" style={{ borderColor: "#DCC79C", color: "#5C4A3A" }}>
                          Découvrir
                        </button>
                        <button
                          onClick={() => onAjouterPanier(p, 1)}
                          disabled={enRupture(p)}
                          className="text-xs font-semibold px-3 py-2 rounded-full disabled:opacity-40"
                          style={{ background: "#E8B94A", color: "#2B2118" }}
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ProduitModal({ produit, onClose, onAjouter }) {
  const [qte, setQte] = useState(1);
  const images = getImages(produit);
  const [index, setIndex] = useState(0);
  const [touchDepart, setTouchDepart] = useState(null);
  const precedente = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const suivante = () => setIndex((i) => (i + 1) % images.length);
  const onTouchStart = (e) => setTouchDepart(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchDepart === null) return;
    const delta = e.changedTouches[0].clientX - touchDepart;
    if (delta > 40) precedente();
    else if (delta < -40) suivante();
    setTouchDepart(null);
  };
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(27,20,10,0.55)" }} onClick={onClose}>
      <div className="rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto relative" style={{ background: "#FBF3E3" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10" style={{ background: "rgba(43,68,51,0.85)", color: "#F7ECD8" }} aria-label="Fermer">
          <X size={16} />
        </button>
        <div
          className="w-full overflow-hidden relative"
          style={{ background: "#F3E3CB", height: "min(60vh, 420px)" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.length > 0 ? (
            <img src={images[index]} alt={produit.titre} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Sparkles size={32} style={{ color: "#DCC79C" }} /></div>
          )}
          {images.length > 1 && (
            <>
              <button onClick={precedente} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(43,68,51,0.75)", color: "#F7ECD8" }} aria-label="Photo précédente">
                <ChevronLeft size={16} />
              </button>
              <button onClick={suivante} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(43,68,51,0.75)", color: "#F7ECD8" }} aria-label="Photo suivante">
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setIndex(i)}
                    style={{ width: 6, height: 6, borderRadius: 9999, cursor: "pointer", background: i === index ? "#E8B94A" : "rgba(43,68,51,0.3)" }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="p-6">
          {produit.categorie && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#8A7A56" }}>
              <Tag size={10} /> {produit.categorie}
            </span>
          )}
          <h2 className="lmc-display text-3xl mb-2" style={{ color: "#2B4433" }}>{produit.titre}</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#5C4A3A" }}>{produit.description || produit.resume}</p>
          {enRupture(produit) ? (
            <p className="text-sm font-semibold mb-4" style={{ color: "#B5744A" }}>Rupture de stock — de retour bientôt.</p>
          ) : stockLimite(produit) && Number(produit.stock) <= 5 ? (
            <p className="text-xs mb-4" style={{ color: "#8A7A56" }}>Plus que {produit.stock} en stock</p>
          ) : null}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xl font-bold" style={{ color: "#2B4433" }}>{formatPrix(produit.prix)}</span>
            {!enRupture(produit) && (
              <div className="flex items-center gap-2">
                <button onClick={() => setQte((q) => Math.max(1, q - 1))} className="w-7 h-7 rounded-full border flex items-center justify-center" style={{ borderColor: "#DCC79C" }}><Minus size={14} /></button>
                <span className="font-semibold w-4 text-center">{qte}</span>
                <button
                  onClick={() => setQte((q) => (stockLimite(produit) ? Math.min(Number(produit.stock), q + 1) : q + 1))}
                  className="w-7 h-7 rounded-full border flex items-center justify-center"
                  style={{ borderColor: "#DCC79C" }}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => onAjouter(qte)}
            disabled={enRupture(produit)}
            className="w-full font-semibold py-3 rounded-full transition-colors disabled:opacity-40"
            style={{ background: "#2B4433", color: "#F7ECD8" }}
          >
            {enRupture(produit) ? "Rupture de stock" : "Ajouter au panier"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PanierDrawer({ ouvert, panier, fraisPort, onFermer, onChangerQte, onRetirer, onCommander }) {
  const sousTotal = panier.reduce((s, i) => s + i.qte * i.prix, 0);
  const total = panier.length > 0 ? sousTotal + (fraisPort || 0) : 0;
  return (
    <>
      <div
        className="fixed inset-0 z-30 transition-opacity"
        style={{ background: "rgba(27,20,10,0.5)", opacity: ouvert ? 1 : 0, pointerEvents: ouvert ? "auto" : "none" }}
        onClick={onFermer}
      />
      <aside
        className="fixed top-0 right-0 h-full z-40 flex flex-col transition-transform"
        style={{ width: "min(380px, 92vw)", background: "#FBF3E3", transform: ouvert ? "translateX(0)" : "translateX(105%)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#DCC79C" }}>
          <h3 className="lmc-display text-2xl" style={{ color: "#2B4433" }}>Votre panier</h3>
          <button onClick={onFermer} aria-label="Fermer le panier"><X size={18} style={{ color: "#5C4A3A" }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {panier.length === 0 ? (
            <p className="text-sm" style={{ color: "#8A7A56" }}>Votre panier est vide pour l'instant.</p>
          ) : (
            <div className="space-y-4">
              {panier.map((i) => (
                <div key={i.id} className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: "#F3E3CB" }}>
                    {getImages(i)[0] ? <img src={getImages(i)[0]} alt="" className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: "#2B4433" }}>{i.titre}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => onChangerQte(i.id, i.qte - 1)} className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ borderColor: "#DCC79C" }}><Minus size={12} /></button>
                      <span className="text-sm w-4 text-center">{i.qte}</span>
                      <button onClick={() => onChangerQte(i.id, i.qte + 1)} className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ borderColor: "#DCC79C" }}><Plus size={12} /></button>
                      <button onClick={() => onRetirer(i.id)} className="ml-auto text-xs" style={{ color: "#B5744A" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "#2B4433" }}>{formatPrix(i.prix * i.qte)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t" style={{ borderColor: "#DCC79C" }}>
          {panier.length > 0 && (
            <>
              <div className="flex justify-between text-sm mb-1" style={{ color: "#5C4A3A" }}>
                <span>Sous-total</span><span>{formatPrix(sousTotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3" style={{ color: "#5C4A3A" }}>
                <span>Livraison</span><span>{formatPrix(fraisPort || 0)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-sm font-semibold mb-3" style={{ color: "#2B4433" }}>
            <span>Total</span><span>{formatPrix(total)}</span>
          </div>
          <button
            onClick={onCommander}
            disabled={panier.length === 0}
            className="w-full text-center text-sm font-semibold py-2.5 rounded-full disabled:opacity-50"
            style={{ background: "#E8B94A", color: "#2B2118" }}
          >
            Valider ma commande
          </button>
        </div>
      </aside>
    </>
  );
}

function ChampAdresse({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [chargement, setChargement] = useState(false);
  const timeoutRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (val.trim().length < 4) {
      setSuggestions([]);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      setChargement(true);
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=5`);
        const data = await res.json();
        setSuggestions(data.features || []);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setChargement(false);
      }
    }, 350);
  };

  const choisir = (feature) => {
    onChange(feature.properties.label);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <textarea
        className="lmc-input"
        rows={2}
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setSuggestions([]), 150)}
        placeholder="Commencez à taper votre adresse…"
      />
      {chargement && <p className="text-[10px] mt-1" style={{ color: "#8A7A56" }}>Recherche…</p>}
      {suggestions.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg border overflow-hidden shadow-lg" style={{ background: "#FFFDF7", borderColor: "#DCC79C" }}>
          {suggestions.map((f) => (
            <button
              key={f.properties.id}
              type="button"
              onMouseDown={() => choisir(f)}
              className="block w-full text-left px-3 py-2 text-sm border-b last:border-b-0"
              style={{ color: "#2B4433", borderColor: "#F3E3CB" }}
            >
              {f.properties.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CommandeModal({ panier, fraisPort, noticeRetractation, paypalEmail, onClose }) {
  const [etape, setEtape] = useState("formulaire");
  const [form, setForm] = useState({ nom: "", email: "", tel: "", adresse: "" });
  const [erreur, setErreur] = useState("");
  const sousTotal = panier.reduce((s, i) => s + i.qte * i.prix, 0);
  const total = sousTotal + (fraisPort || 0);

  const continuer = () => {
    if (!form.nom.trim() || !form.email.trim() || !form.adresse.trim()) {
      setErreur("Merci de renseigner au moins votre nom, votre email et votre adresse d'envoi.");
      return;
    }
    setErreur("");
    setEtape("paiement");
  };

  const payerLePanier = () => {
    const commande = {
      nom: form.nom,
      email: form.email,
      tel: form.tel,
      adresse: form.adresse,
      articles: panier.map((i) => ({ id: i.id, titre: i.titre, prix: i.prix, qte: i.qte })),
      fraisPort: fraisPort || 0,
      total,
    };
    localStorage.setItem("lmc_commande_pending", JSON.stringify(commande));

    const f = document.createElement("form");
    f.method = "post";
    f.action = "https://www.paypal.com/cgi-bin/webscr";
    f.target = "_top";
    const champ = (name, value) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      f.appendChild(input);
    };
    champ("cmd", "_cart");
    champ("upload", "1");
    champ("business", paypalEmail);
    champ("currency_code", "EUR");
    champ("return", `${window.location.origin}/?commande=1`);
    champ("cancel_return", `${window.location.origin}/`);
    champ("rm", "1");
    panier.forEach((item, idx) => {
      const n = idx + 1;
      champ(`item_name_${n}`, item.titre);
      champ(`amount_${n}`, item.prix.toFixed(2));
      champ(`quantity_${n}`, item.qte);
    });
    if (fraisPort > 0) {
      const n = panier.length + 1;
      champ(`item_name_${n}`, "Frais de livraison");
      champ(`amount_${n}`, fraisPort.toFixed(2));
      champ(`quantity_${n}`, 1);
    }
    document.body.appendChild(f);
    f.submit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(27,20,10,0.55)" }} onClick={onClose}>
      <div className="rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 relative" style={{ background: "#FBF3E3" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(43,68,51,0.85)", color: "#F7ECD8" }} aria-label="Fermer"><X size={16} /></button>

        {etape === "formulaire" ? (
          <>
            <h3 className="lmc-display text-2xl mb-1" style={{ color: "#2B4433" }}>Vos coordonnées</h3>
            <p className="text-xs mb-4" style={{ color: "#8A7A56" }}>Pour vous envoyer votre commande et vous confirmer sa réception.</p>
            <div className="space-y-3">
              <Field label="Votre nom"><input className="lmc-input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Prénom et nom" /></Field>
              <Field label="Email"><input type="email" className="lmc-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="votre@email.fr" /></Field>
              <Field label="Téléphone (optionnel)"><input className="lmc-input" value={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} placeholder="06 12 34 56 78" /></Field>
              <Field label="Adresse d'envoi"><ChampAdresse value={form.adresse} onChange={(val) => setForm((f) => ({ ...f, adresse: val }))} /></Field>
            </div>
            {erreur && <p className="text-xs mt-2 font-medium" style={{ color: "#B5744A" }}>{erreur}</p>}
            {noticeRetractation && <p className="text-xs mt-4 leading-relaxed" style={{ color: "#8A7A56" }}>{noticeRetractation}</p>}
            <button onClick={continuer} className="w-full mt-4 font-semibold py-3 rounded-full transition-colors" style={{ background: "#2B4433", color: "#F7ECD8" }}>
              Continuer vers le paiement
            </button>
          </>
        ) : (
          <>
            <h3 className="lmc-display text-2xl mb-1" style={{ color: "#2B4433" }}>Paiement</h3>
            <div className="rounded-xl px-4 py-3 mb-4" style={{ background: "#F3E3CB" }}>
              {panier.map((i) => (
                <div key={i.id} className="flex justify-between text-sm mb-1" style={{ color: "#5C4A3A" }}>
                  <span>{i.titre} × {i.qte}</span>
                  <span>{formatPrix(i.prix * i.qte)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm mb-1" style={{ color: "#5C4A3A" }}>
                <span>Livraison</span>
                <span>{formatPrix(fraisPort || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold mt-2 pt-2" style={{ color: "#2B4433", borderTop: "1px solid #DCC79C" }}>
                <span>Total</span>
                <span>{formatPrix(total)}</span>
              </div>
            </div>

            {paypalEmail ? (
              <button onClick={payerLePanier} className="w-full text-center text-sm font-semibold py-3 rounded-full" style={{ background: "#E8B94A", color: "#2B2118" }}>
                Payer {formatPrix(total)} avec PayPal
              </button>
            ) : (
              <p className="text-xs" style={{ color: "#B5744A" }}>
                Le paiement du panier n'est pas encore configuré — contactez-nous pour finaliser votre commande.
              </p>
            )}
            <p className="text-xs mt-3" style={{ color: "#8A7A56" }}>
              Vous serez redirigé·e vers PayPal pour régler l'ensemble de votre panier en un seul paiement, puis ramené·e ici pour la confirmation.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function compressImage(file, maxSize = 900, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) { height = Math.round(height * (maxSize / width)); width = maxSize; }
        else if (height >= width && height > maxSize) { width = Math.round(width * (maxSize / height)); height = maxSize; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(null);
      img.src = ev.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function ProduitForm({ produit, onCancel, onSave }) {
  const [form, setForm] = useState(() => ({
    ...produit,
    images: produit.images && produit.images.length ? produit.images : produit.image ? [produit.image] : [],
  }));
  const [uploading, setUploading] = useState(false);
  const [erreur, setErreur] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const nonImages = files.some((f) => !f.type.startsWith("image/"));
    if (nonImages) setErreur("Certains fichiers ne sont pas des images et ont été ignorés.");
    else setErreur("");
    setUploading(true);
    const resultats = await Promise.all(
      files.filter((f) => f.type.startsWith("image/")).map((f) => compressImage(f))
    );
    const valides = resultats.filter(Boolean);
    setForm((f) => ({ ...f, images: [...(f.images || []), ...valides] }));
    setUploading(false);
    e.target.value = "";
  };

  const retirerPhoto = (idx) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(27,20,10,0.55)" }} onClick={onCancel}>
      <div className="rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6" style={{ background: "#FBF3E3" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="lmc-display text-2xl mb-4" style={{ color: "#2B4433" }}>{produit.titre ? "Modifier l'article" : "Nouvel article"}</h3>
        <div className="space-y-3">
          <Field label="Titre"><input className="lmc-input" value={form.titre} onChange={set("titre")} /></Field>
          <Field label="Catégorie"><input className="lmc-input" value={form.categorie} onChange={set("categorie")} placeholder="Ex. Livret, Boîte surprise, Bijou..." /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prix (€)"><input type="number" step="0.5" className="lmc-input" value={form.prix} onChange={(e) => setForm((f) => ({ ...f, prix: parseFloat(e.target.value) || 0 }))} /></Field>
            <Field label="Badge (optionnel)"><input className="lmc-input" value={form.badge} onChange={set("badge")} placeholder="Ex. Nouveauté" /></Field>
          </div>
          <Field label="Stock disponible (laisse vide si illimité)">
            <input type="number" min="0" className="lmc-input" value={form.stock ?? ""} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0 }))} placeholder="Ex. 5" />
          </Field>
          <Field label="Résumé court (carte produit)"><input className="lmc-input" value={form.resume} onChange={set("resume")} /></Field>
          <Field label="Description complète"><textarea className="lmc-input" rows={3} value={form.description} onChange={set("description")} /></Field>
          <Field label="Photos (plusieurs possibles — le client pourra les faire défiler)">
            <div className="flex flex-wrap gap-2 mb-3">
              {(form.images || []).map((src, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0" style={{ border: "2px solid #DCC79C" }}>
                  <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => retirerPhoto(idx)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(27,20,10,0.75)", color: "#F7ECD8" }}
                    aria-label="Retirer cette photo"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              <label
                className="w-16 h-16 rounded-lg cursor-pointer flex items-center justify-center shrink-0"
                style={{ border: "2px dashed #DCC79C", color: "#8A7A56" }}
              >
                <Plus size={20} />
                <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" disabled={uploading} />
              </label>
            </div>
            {uploading && <p className="text-xs font-medium" style={{ color: "#8A7A56" }}>Traitement des photos…</p>}
            {erreur && <p className="text-xs mt-1 font-medium" style={{ color: "#B5744A" }}>{erreur}</p>}
          </Field>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} className="flex-1 text-sm font-semibold py-2.5 rounded-full border" style={{ borderColor: "#DCC79C", color: "#5C4A3A" }}>Annuler</button>
          <button onClick={() => form.titre.trim() && onSave(form)} className="flex-1 text-sm font-semibold py-2.5 rounded-full" style={{ background: "#2B4433", color: "#F7ECD8" }}>Enregistrer</button>
        </div>
      </div>
    </div>
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

function exportCommandesCSV(commandes) {
  const header = "Nom,Email,Telephone,Adresse,Articles,Total\n";
  const rows = commandes
    .map((c) =>
      [
        c.nom,
        c.email,
        c.tel || "",
        c.adresse || "",
        (c.articles || []).map((a) => `${a.titre} x${a.qte}`).join(" / "),
        formatPrix(c.total),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "commandes-mondes-caches.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function AdminPanel({
  config, villes, reservations, produits, commandes,
  onSaveConfig, onAddVille, onRemoveVille, onAddSession, onRemoveSession, onAjusterPlaces, onClose, onChangePassword,
  onSupprimerReservation, onRestaurerReservation, voirCorbeille, onToggleCorbeille,
  onSaveProduit, onRemoveProduit,
  onSupprimerCommande, onRestaurerCommande, voirCorbeilleCommandes, onToggleCorbeilleCommandes,
  avisAdmin, onValiderAvis, onDepublierAvis, onSupprimerAvis,
}) {
 
  const [eyebrowAtelier, setEyebrowAtelier] = useState(config.eyebrowAtelier || "");
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
  const [paypalEmail, setPaypalEmail] = useState(config.paypalEmail || "");
  const [fraisPort, setFraisPort] = useState(config.fraisPort ?? 4.9);
  const [emailjsServiceId, setEmailjsServiceId] = useState(config.emailjsServiceId || "");
  const [emailjsPublicKey, setEmailjsPublicKey] = useState(config.emailjsPublicKey || "");
  const [emailjsTemplateParent, setEmailjsTemplateParent] = useState(config.emailjsTemplateParent || "");
  const [emailjsTemplateListeAttente, setEmailjsTemplateListeAttente] = useState(config.emailjsTemplateListeAttente || "");
  const [emailjsTemplateAdmin, setEmailjsTemplateAdmin] = useState(config.emailjsTemplateAdmin || "");
  const [emailjsTemplateCommandeParent, setEmailjsTemplateCommandeParent] = useState(config.emailjsTemplateCommandeParent || "");
  const [emailjsTemplateCommandeAdmin, setEmailjsTemplateCommandeAdmin] = useState(config.emailjsTemplateCommandeAdmin || "");
  const [conditions, setConditions] = useState(config.conditions || "");
  const [motAccueil, setMotAccueil] = useState(config.motAccueil || "");
  const [etapeAvantTitre, setEtapeAvantTitre] = useState(config.etapeAvantTitre || "");
  const [etapeAvant, setEtapeAvant] = useState(config.etapeAvant || "");
  const [etapePendantTitre, setEtapePendantTitre] = useState(config.etapePendantTitre || "");
  const [etapePendant, setEtapePendant] = useState(config.etapePendant || "");
  const [etapeApresTitre, setEtapeApresTitre] = useState(config.etapeApresTitre || "");
  const [etapeApres, setEtapeApres] = useState(config.etapeApres || "");
  const [motAccueilBoutique, setMotAccueilBoutique] = useState(config.motAccueilBoutique || "");
  const [messageAucunCreneau, setMessageAucunCreneau] = useState(config.messageAucunCreneau || "");
  const [noticeRetractation, setNoticeRetractation] = useState(config.noticeRetractation || "");
  const [noticeRetractationBoutique, setNoticeRetractationBoutique] = useState(config.noticeRetractationBoutique || "");
  const [reglementAtelier, setReglementAtelier] = useState(config.reglementAtelier || "");
  const [mentionsLegales, setMentionsLegales] = useState(config.mentionsLegales || "");
  const [faq, setFaq] = useState(config.faq || []);
  const [nouvelleFaq, setNouvelleFaq] = useState({ q: "", r: "" });
  const [nouvelleVille, setNouvelleVille] = useState("");
  const [sessionForms, setSessionForms] = useState({});
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [mdpEnCours, setMdpEnCours] = useState(false);
  const [mdpMessage, setMdpMessage] = useState("");
  const [mdpErreur, setMdpErreur] = useState("");
  const [produitEnEdition, setProduitEnEdition] = useState(null);

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
      eyebrowAtelier, titre, description, prix: Number(prix) || 0, lienPaiement: lienPaiement.trim(), logoImage,
      ageRange, duree, contactEmail, contactTel, paypalEmail: paypalEmail.trim(), fraisPort: Number(fraisPort) || 0, conditions, motAccueil, etapeAvantTitre, etapeAvant, etapePendantTitre, etapePendant, etapeApresTitre, etapeApres, motAccueilBoutique, messageAucunCreneau, noticeRetractation, noticeRetractationBoutique, reglementAtelier, mentionsLegales, faq,
      emailjsServiceId: emailjsServiceId.trim(), emailjsPublicKey: emailjsPublicKey.trim(), emailjsTemplateParent: emailjsTemplateParent.trim(), emailjsTemplateListeAttente: emailjsTemplateListeAttente.trim(), emailjsTemplateAdmin: emailjsTemplateAdmin.trim(),
      emailjsTemplateCommandeParent: emailjsTemplateCommandeParent.trim(), emailjsTemplateCommandeAdmin: emailjsTemplateCommandeAdmin.trim(),
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
          à chaque nouvelle réservation ou commande. Tant que ces champs sont vides, aucun
          email n'est envoyé.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Service ID EmailJS"><input className="lmc-input" value={emailjsServiceId} onChange={(e) => setEmailjsServiceId(e.target.value)} placeholder="service_xxxxx" /></Field>
            <Field label="Public Key EmailJS"><input className="lmc-input" value={emailjsPublicKey} onChange={(e) => setEmailjsPublicKey(e.target.value)} placeholder="xxxxxxxxxxxxx" /></Field>
          </div>
          <p className="text-xs font-semibold" style={{ color: "#2B4433" }}>Ateliers</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Template ID (email au parent — réservation confirmée)"><input className="lmc-input" value={emailjsTemplateParent} onChange={(e) => setEmailjsTemplateParent(e.target.value)} placeholder="template_xxxxx" /></Field>
            <Field label="Template ID (email à toi)"><input className="lmc-input" value={emailjsTemplateAdmin} onChange={(e) => setEmailjsTemplateAdmin(e.target.value)} placeholder="template_xxxxx" /></Field>
          </div>
          <Field label="Template ID (email au parent — liste d'attente, laisser vide pour réutiliser le template ci-dessus)">
            <input className="lmc-input" value={emailjsTemplateListeAttente} onChange={(e) => setEmailjsTemplateListeAttente(e.target.value)} placeholder="template_xxxxx" />
          </Field>
          <p className="text-xs font-semibold" style={{ color: "#2B4433" }}>Boutique</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Template ID (email au client)"><input className="lmc-input" value={emailjsTemplateCommandeParent} onChange={(e) => setEmailjsTemplateCommandeParent(e.target.value)} placeholder="template_xxxxx" /></Field>
            <Field label="Template ID (email à toi)"><input className="lmc-input" value={emailjsTemplateCommandeAdmin} onChange={(e) => setEmailjsTemplateCommandeAdmin(e.target.value)} placeholder="template_xxxxx" /></Field>
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
          <Field label="Petit texte au-dessus du titre (bandeau)"><input className="lmc-input" value={eyebrowAtelier} onChange={(e) => setEyebrowAtelier(e.target.value)} placeholder="Ex. Atelier immersif" /></Field>
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
          <Field label="Mot d'accueil de l'atelier (modifiable selon la saison, l'humeur…)">
            <textarea className="lmc-input" rows={2} value={motAccueil} onChange={(e) => setMotAccueil(e.target.value)} placeholder="Une phrase chaleureuse affichée sur la page d'accueil" />
          </Field>
          <p className="text-xs font-semibold" style={{ color: "#2B4433" }}>« Comment se déroule l'atelier » — reste volontairement suggestif, sans détailler l'histoire ou le décor</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <input className="lmc-input text-sm font-semibold" value={etapeAvantTitre} onChange={(e) => setEtapeAvantTitre(e.target.value)} placeholder="Titre (ex. Avant)" />
              <Field label="Texte"><textarea className="lmc-input text-sm" rows={3} value={etapeAvant} onChange={(e) => setEtapeAvant(e.target.value)} /></Field>
            </div>
            <div className="space-y-1">
              <input className="lmc-input text-sm font-semibold" value={etapePendantTitre} onChange={(e) => setEtapePendantTitre(e.target.value)} placeholder="Titre (ex. Pendant)" />
              <Field label="Texte"><textarea className="lmc-input text-sm" rows={3} value={etapePendant} onChange={(e) => setEtapePendant(e.target.value)} /></Field>
            </div>
            <div className="space-y-1">
              <input className="lmc-input text-sm font-semibold" value={etapeApresTitre} onChange={(e) => setEtapeApresTitre(e.target.value)} placeholder="Titre (ex. Après)" />
              <Field label="Texte"><textarea className="lmc-input text-sm" rows={3} value={etapeApres} onChange={(e) => setEtapeApres(e.target.value)} /></Field>
            </div>
          </div>
          <Field label="Mot d'accueil de la boutique">
            <textarea className="lmc-input" rows={2} value={motAccueilBoutique} onChange={(e) => setMotAccueilBoutique(e.target.value)} placeholder="Une phrase affichée en haut de la boutique" />
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
          <Field label="Mention affichée avant la validation d'une réservation d'atelier">
            <textarea className="lmc-input" rows={3} value={noticeRetractation} onChange={(e) => setNoticeRetractation(e.target.value)} placeholder="Ex : mention sur le droit de rétractation" />
          </Field>
          <Field label="Mention affichée avant le paiement d'une commande boutique">
            <textarea className="lmc-input" rows={3} value={noticeRetractationBoutique} onChange={(e) => setNoticeRetractationBoutique(e.target.value)} placeholder="Ex : délai de rétractation de 14 jours pour les objets" />
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
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span>{s.date} · {s.heure}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onAjusterPlaces(ville.id, s.id, -1)} disabled={s.placesRestantes <= 0} className="w-6 h-6 rounded-full border flex items-center justify-center disabled:opacity-30" style={{ borderColor: "#DCC79C" }} aria-label="Retirer une place disponible"><Minus size={12} /></button>
                        <span className="min-w-[64px] text-center">{s.placesRestantes}/{s.placesTotal} place(s)</span>
                        <button onClick={() => onAjusterPlaces(ville.id, s.id, 1)} disabled={s.placesRestantes >= s.placesTotal} className="w-6 h-6 rounded-full border flex items-center justify-center disabled:opacity-30" style={{ borderColor: "#DCC79C" }} aria-label="Libérer une place (ex. après une annulation)"><Plus size={12} /></button>
                        <button onClick={() => onRemoveSession(ville.id, s.id)} className="text-[#B5744A] hover:text-[#8A4A26]"><Trash2 size={14} /></button>
                      </div>
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
        <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "#2B4433" }}>
          <Coins size={16} /> Paiement du panier boutique
        </h3>
        <p className="text-xs mb-4" style={{ color: "#8A7A56" }}>
          Renseigne ici l'adresse email de ton compte PayPal (celle avec laquelle tu reçois
          déjà les paiements des ateliers). Quand un client valide un panier avec plusieurs
          articles à des prix différents, PayPal calcule automatiquement le total et le client
          ne paie qu'une seule fois — plus besoin de créer un bouton par article.
        </p>
        <Field label="Email de ton compte PayPal">
          <input className="lmc-input" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="tonadresse@paypal.com" />
        </Field>
        <Field label="Frais de livraison appliqués au panier (€) — à la charge du client">
          <input type="number" step="0.1" className="lmc-input" value={fraisPort} onChange={(e) => setFraisPort(parseFloat(e.target.value) || 0)} />
        </Field>
        <button onClick={() => saveAll()} className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors mt-3" style={{ background: "#2B4433", color: "#F7ECD8" }}>Enregistrer</button>
      </section>

      <section className="rounded-2xl border p-6 mb-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2" style={{ color: "#2B4433" }}>
            <ShoppingBag size={16} /> Boutique — Articles
          </h3>
          <button
            onClick={() => setProduitEnEdition({ id: uid(), titre: "", categorie: "", prix: 10, badge: "", stock: "", resume: "", description: "", images: [] })}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "#E8B94A", color: "#2B2118" }}
          >
            <Plus size={13} /> Ajouter un article
          </button>
        </div>
        {produits.length === 0 ? (
          <p className="text-sm text-[#8A7A56] italic">Aucun article pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {produits.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm rounded-lg px-3 py-2" style={{ background: "#F3E3CB", color: "#2B4433" }}>
                <span><strong>{p.titre}</strong> {p.categorie ? `— ${p.categorie}` : ""} — {formatPrix(p.prix)}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setProduitEnEdition(p)} className="text-xs underline" style={{ color: "#2B4433" }}>Modifier</button>
                  <button onClick={() => onRemoveProduit(p.id)} className="text-[#B5744A] hover:text-[#8A4A26]"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {produitEnEdition && (
        <ProduitForm
          produit={produitEnEdition}
          onCancel={() => setProduitEnEdition(null)}
          onSave={(p) => { onSaveProduit(p); setProduitEnEdition(null); }}
        />
      )}

      <section className="rounded-2xl border p-6 mb-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <h3 className="font-semibold mb-2" style={{ color: "#2B4433" }}>Avis des familles</h3>
        <p className="text-xs mb-4" style={{ color: "#8A7A56" }}>
          Les parents peuvent partager un avis (celui de leur enfant, ou le leur) directement
          depuis le site. Rien n'est visible publiquement tant que tu ne l'as pas validé ici.
        </p>

        <p className="text-xs font-semibold mb-2" style={{ color: "#2B4433" }}>En attente de validation</p>
        {avisAdmin.filter((a) => !a.valide).length === 0 ? (
          <p className="text-sm text-[#8A7A56] italic mb-4">Aucun avis en attente.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {avisAdmin.filter((a) => !a.valide).map((a) => (
              <div key={a.id} className="text-sm rounded-lg px-3 py-2" style={{ background: "#F3E3CB", color: "#2B4433" }}>
                <p>« {a.texte} » <span className="font-semibold">— {a.prenom}{a.age ? `, ${a.age}` : ""}</span></p>
                <div className="flex items-center gap-3 mt-1.5">
                  <button onClick={() => onValiderAvis(a.id)} className="text-xs font-semibold underline" style={{ color: "#2B4433" }}>Publier</button>
                  <button onClick={() => onSupprimerAvis(a.id)} className="text-xs underline" style={{ color: "#B5744A" }}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs font-semibold mb-2" style={{ color: "#2B4433" }}>Publiés sur le site</p>
        {avisAdmin.filter((a) => a.valide).length === 0 ? (
          <p className="text-sm text-[#8A7A56] italic">Aucun avis publié pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {avisAdmin.filter((a) => a.valide).map((a) => (
              <div key={a.id} className="text-sm rounded-lg px-3 py-2" style={{ background: "#F3E3CB", color: "#2B4433" }}>
                <p>« {a.texte} » <span className="font-semibold">— {a.prenom}{a.age ? `, ${a.age}` : ""}</span></p>
                <div className="flex items-center gap-3 mt-1.5">
                  <button onClick={() => onDepublierAvis(a.id)} className="text-xs font-semibold underline" style={{ color: "#8A5A26" }}>Retirer du site</button>
                  <button onClick={() => onSupprimerAvis(a.id)} className="text-xs underline" style={{ color: "#B5744A" }}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border p-6 mb-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <h3 className="font-semibold mb-4" style={{ color: "#2B4433" }}>Règlement de l'atelier</h3>
        <Field label="Mention affichée avant la confirmation d'une réservation (photos/vidéos, téléphones…)">
          <textarea className="lmc-input" rows={3} value={reglementAtelier} onChange={(e) => setReglementAtelier(e.target.value)} placeholder="Ex : pas de photo/vidéo pendant l'atelier, téléphones en silencieux" />
        </Field>
        <button onClick={() => saveAll()} className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors mt-3" style={{ background: "#2B4433", color: "#F7ECD8" }}>Enregistrer</button>
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
            {reservations.filter((r) => (r.supprime || false) === voirCorbeille).map((r) => (


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

      <section className="rounded-2xl border p-6" style={{ background: "#FBF3E3", borderColor: "#DCC79C" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2" style={{ color: "#2B4433" }}>
            <ShoppingBag size={16} /> Commandes boutique ({commandes.length})
          </h3>
          {commandes.length > 0 && (
            <button onClick={() => exportCommandesCSV(commandes)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#2B4433", color: "#F7ECD8" }}>
              <Download size={13} /> Exporter en CSV
            </button>
          )}
          <button onClick={onToggleCorbeilleCommandes} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#DCC79C", color: "#2B4433" }}>
            {voirCorbeilleCommandes ? "Retour à la liste" : "Voir la corbeille"}
          </button>
        </div>
        <p className="text-xs mb-3" style={{ color: "#8A7A56" }}>
          Une commande apparaît ici une fois que le client est revenu sur le site après son
          paiement PayPal. Pense à vérifier aussi tes notifications PayPal en cas de doute.
        </p>
        {commandes.length === 0 ? (
          <p className="text-sm text-[#8A7A56] italic">Aucune commande pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {commandes.filter((c) => (c.supprime || false) === voirCorbeilleCommandes).map((c) => (
              <div key={c.id} className="text-sm rounded-lg px-3 py-2 flex flex-wrap gap-x-4 gap-y-1 border" style={{ borderColor: "#DCC79C" }}>
                <span className="font-semibold" style={{ color: "#2B4433" }}>{c.nom}</span>
                <span className="font-medium" style={{ color: "#5C4A3A" }}>{(c.articles || []).map((a) => `${a.titre} x${a.qte}`).join(", ")}</span>
                <span className="font-medium" style={{ color: "#5C4A3A" }}>
                  {formatPrix(c.total)}{c.frais_port ? ` (dont ${formatPrix(c.frais_port)} livraison)` : ""}
                </span>
                <span style={{ color: "#8A7A56" }}>{c.email}</span>
                {c.tel && <span style={{ color: "#8A7A56" }}>{c.tel}</span>}
                {c.adresse && <span style={{ color: "#8A7A56" }}>{c.adresse}</span>}
                {voirCorbeilleCommandes ? (
                  <button onClick={() => onRestaurerCommande(c.id)} className="text-xs underline" style={{ color: "#2B4433" }}>Restaurer</button>
                ) : (
                  <button onClick={() => onSupprimerCommande(c.id)} className="text-xs underline" style={{ color: "#B5744A" }}>Supprimer</button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
