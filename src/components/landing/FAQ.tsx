import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como a IA cria minha rotina?",
    answer: "Nossa IA analisa suas respostas sobre horários fixos, picos de energia, compromissos e objetivos. Com base nisso, ela distribui blocos de foco e descanso de forma otimizada, respeitando seus limites e prioridades.",
  },
  {
    question: "Posso ajustar a rotina depois de gerada?",
    answer: "Sim! No plano gratuito você tem 3 ajustes por semana. No plano Pro, ajustes são ilimitados. Cada ajuste manual ensina a IA sobre suas preferências reais.",
  },
  {
    question: "O que acontece se minha semana for caótica?",
    answer: "Ative o 'Modo Semana Caótica'. A IA redistribui suas tarefas de forma realista, priorizando o essencial e eliminando o que pode esperar.",
  },
  {
    question: "Como funcionam os alertas?",
    answer: "Você recebe notificações antes de cada bloco começar. Pode escolher receber por push, email ou ambos. Os horários são baseados na sua rotina gerada.",
  },
  {
    question: "A rotina considera meus horários de trabalho?",
    answer: "Absolutamente. No questionário inicial você informa seus compromissos fixos (trabalho, aulas, etc.) e a IA trabalha em torno deles, nunca sobrepondo.",
  },
  {
    question: "Posso criar rotinas diferentes para trabalho e férias?",
    answer: "Sim! No plano Pro você pode criar rotinas alternativas para diferentes contextos da sua vida. Alterne entre elas com um clique.",
  },
  {
    question: "Como funciona o feedback?",
    answer: "Após cada dia, você pode marcar 'Funcionou' ou 'Não funcionou'. A IA usa esse feedback para ajustar automaticamente sua próxima rotina, aprendendo seus padrões reais.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, sem burocracia. Você pode cancelar seu plano a qualquer momento e continuar usando até o fim do período pago.",
  },
];

export function FAQ() {
  return (
    <section className="py-24">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Tudo que você precisa saber antes de começar.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-medium transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
