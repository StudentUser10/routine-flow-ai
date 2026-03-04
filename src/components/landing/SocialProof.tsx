import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "Eu tentei tudo. O RotinAI foi o único que se adaptou à minha vida, não o contrário.",
    name: "Camila R.",
    detail: "34 anos, mãe de dois filhos e gestora de marketing",
  },
  {
    text: "Na primeira semana já percebi que tava gastando energia decidindo o que fazer, não fazendo. O app tirou isso de mim.",
    name: "Bruno T.",
    detail: "28 anos, desenvolvedor freelancer",
  },
  {
    text: "Achei que era mais um app. Me surpreendi quando a IA ajustou minha rotina sozinha depois que perdi dois dias por causa de viagem.",
    name: "Fernanda L.",
    detail: "41 anos, empresária",
  },
];

const stats = [
  { value: "+4.200", label: "pessoas usando" },
  { value: "2 min", label: "para criar sua rotina" },
  { value: "94%", label: "voltam na 2ª semana" },
];

export function SocialProof() {
  return (
    <section className="py-20 sm:py-24 bg-card/50">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3">
              Quem usa, <span className="text-primary">não volta atrás.</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Resultados reais de pessoas reais.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 rounded-xl bg-card border border-border"
              >
                <div className="font-display font-bold text-2xl sm:text-3xl text-primary">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <div className="flex gap-3 mb-3">
                  <Quote className="w-5 h-5 text-primary/40 flex-shrink-0 mt-1" />
                  <p className="text-foreground/90 text-base italic">
                    {testimonial.text}
                  </p>
                </div>
                <div className="pl-8">
                  <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">{testimonial.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
