'use client';

import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background text-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-3xl font-semibold mb-4 text-foreground">
              Mōa
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Hold strong. Move free. Ropa deportiva diseñada para mujeres que no se detienen.
            </p>
          </div>

          {/* Links Tienda */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Tienda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Nueva colección</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Sujetadores</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Tops deportivos</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Calcetines</a>
              </li>
            </ul>
          </div>

          {/* Links Información */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Información</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/about" className="hover:text-foreground transition-colors">Sobre nosotros</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Sostenibilidad</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Envíos y devoluciones</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Suscríbete y recibe un 10% en tu primera compra
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Tu email"
                className="flex-1 px-4 py-2 rounded-2xl bg-background/10 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/70 transition-all"
              />
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-2xl text-sm font-medium hover:bg-primary/90 transition-colors">
                Unirme
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Mōa. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
