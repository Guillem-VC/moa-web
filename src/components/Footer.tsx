'use client';

import { useState } from "react";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletterSubmit = async () => {
    const email = newsletterEmail.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      alert("Email no válido");
      return;
    }

    setNewsletterLoading(true);

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const json = await res.json()

    setNewsletterLoading(false);

    if (!json.ok) {
      console.error(json)
      alert("Error saving mail")
      return
    }

    if (json.alreadySubscribed) {
      alert("This email is already subscribed 👌")
      return
    }

    alert("Gracias por suscribirte! 🎉");
    localStorage.setItem("newsletter_popup_closed", "true");
    setNewsletterEmail(""); // ✅ neteja el camp si s'ha subscrit correctament
  };


  return (
    <footer className="bg-black text-gray-100 py-16">
      <div className="container mx-auto px-6">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-3xl font-semibold mb-4 text-white">Mōa</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Hold strong. Move free. Ropa deportiva diseñada para mujeres que no se detienen.
            </p>
          </div>

          {/* Links Tienda */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Tienda</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">Nueva colección</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Sujetadores</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Tops deportivos</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Mallas</a></li>
            </ul>
          </div>

          {/* Links Información */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Soporte</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/info/fit-finder" className="hover:text-white transition-colors">Guía de tallas</a></li>
              <li><a href="/info/shippings-returns" className="hover:text-white transition-colors">Envíos y devoluciones</a></li>
              <li><a href="/info/contact" className="hover:text-white transition-colors">Contacto</a></li>
              <li><a href="/info/faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Links Compañia */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Compañía</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/info/about" className="hover:text-white transition-colors">Sobre nosotros</a></li>
              <li><a href="/info/sustainability" className="hover:text-white transition-colors">Sostenibilidad</a></li>
              <li><a href="/info/legal-policy" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="/info/terms-of-service" className="hover:text-white transition-colors">Términos del servicio</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter centrat */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h4 className="font-semibold mb-4 text-white text-lg">Newsletter</h4>
          <p className="text-sm text-gray-300 mb-4">
            Suscríbete y sé el primero en saber de nosotr@s
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Tu email"
              className="flex-1 px-4 py-2 rounded-2xl bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 text-sm focus:outline-none focus:border-rose-500 transition-all"
            />
            <button
              onClick={handleNewsletterSubmit}
              disabled={newsletterLoading}
              className="px-6 py-2 bg-rose-600 text-white rounded-2xl text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {newsletterLoading ? "Enviando..." : "Unirme"}
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} <strong>Mōa</strong> — For women who lift more than weights.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
