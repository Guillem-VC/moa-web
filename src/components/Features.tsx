import { Truck, RefreshCw, Shield, Leaf } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Envío Gratis",
    description: "En pedidos superiores a 80€",
  },
  {
    icon: RefreshCw,
    title: "Devolución Fácil",
    description: "30 días para cambios",
  },
  {
    icon: Shield,
    title: "Pago Seguro",
    description: "Transacciones protegidas por Stripe",
  },
  {
    icon: Leaf,
    title: "Sostenible",
    description: "Materiales eco-friendly",
  },
];

const Features = () => {
  return (
    <section className="py-16 bg-[#f3e9dc] border-y border-black/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {features.map((feature) => (
            <div key={feature.title} className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-md mb-4 group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                <feature.icon className="h-6 w-6 text-rose-600" />
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">
                {feature.title}
              </h3>

              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
