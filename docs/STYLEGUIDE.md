# Guia de Estilo (Style Guide)

Este documento define as diretrizes de design e estilo para o projeto Consultoria Financeira Premium.

## 🎨 Paleta de Cores

### Primárias (Dourado)
- **Gold 500:** `#D4AF37` (Ação principal, destaque)
- **Gold 400:** `#E5C158` (Hover, foco)
- **Gold 900:** `#8C7324` (Bordas sutis, fundo de destaque)

### Secundárias (Escuro)
- **Dark 950:** `#0A0A0A` (Fundo principal)
- **Dark 900:** `#121212` (Cards, seções)
- **Dark 800:** `#1E1E1E` (Inputs, bordas)
- **Dark 700:** `#2D2D2D` (Hover em inputs)

### Feedback
- **Verde:** Sucesso, confirmação.
- **Vermelho:** Erro, alerta.
- **Amarelo:** Aviso, atenção.

## ✒️ Tipografia

### Fontes
- **Serif:** `Playfair Display` (Títulos, destaques elegantes)
- **Sans-serif:** `Inter` (Texto corrido, UI, botões)

### Tamanhos
- **H1:** 3xl (Mobile) / 5xl (Desktop)
- **H2:** 2xl (Mobile) / 4xl (Desktop)
- **H3:** xl (Mobile) / 2xl (Desktop)
- **Body:** base (16px) ou lg (18px) para leitura confortável.

## 📐 Espaçamento e Layout

- **Container:** `max-w-4xl` centralizado (`mx-auto`).
- **Padding:** `p-6` (Mobile) / `p-12` (Desktop).
- **Gap:** `gap-4` ou `gap-6` entre elementos.
- **Border Radius:** `rounded-xl` ou `rounded-2xl` para suavizar as bordas.

## 🖱️ Interações

- **Hover:** Efeitos sutis de transição (`transition-colors`, `hover:bg-opacity-80`).
- **Foco:** Bordas douradas (`focus:border-gold-500`) para indicar campo ativo.
- **Animações:** `Framer Motion` para transições suaves (`opacity`, `y-axis`).

## 📱 Responsividade

- **Mobile First:** O design é pensado primeiro para telas pequenas e expandido para desktop.
- **Breakpoints:** `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
