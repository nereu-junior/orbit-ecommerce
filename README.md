# Orbit — E-commerce com HTML, CSS e JavaScript

Loja virtual **demonstrativa**, responsiva e sem frameworks. Excelente para estudar front-end e apresentar no portfólio.

## Como executar

1. Extraia o ZIP.
2. Abra a pasta `orbit-ecommerce` no **Visual Studio Code**.
3. Abra `index.html` no navegador. Não precisa instalar nada.
4. Opcionalmente, instale a extensão **Live Server** no VS Code e clique em **Go Live**.

## Funcionalidades

- Catálogo de 10 produtos com ilustrações SVG próprias e preços fictícios.
- Busca por nome, descrição e categoria (aceita pesquisas sem acentos).
- Filtro por categorias e ordenação por preço/nome.
- Lista de favoritos salva no `localStorage`.
- Carrinho lateral com adicionar/remover, quantidades e total automático.
- Frete demonstrativo: R$ 19,90 ou grátis a partir de R$ 299 de subtotal.
- Cupom **BEMVINDO10**: 10% de desconto demonstrativo nos produtos.
- Detalhes do produto em janela modal.
- Formulário para **simular** a finalização de um pedido.
- Layout responsivo para computadores, tablets e celulares.
- Acessibilidade básica: textos alternativos, rótulos, foco, Escape e navegação por teclado nos diálogos.

## Estrutura do projeto

```text
orbit-ecommerce/
├── index.html       # Estrutura e conteúdo da página
├── style.css        # Estilo visual e responsividade
├── script.js        # Produtos, filtros, favoritos, carrinho e pedido
├── assets/          # Ilustrações SVG locais (sem depender de internet)
└── README.md
```

## Como personalizar

- **Produtos e preços:** edite o array `PRODUCTS` no início de `script.js`.
- **Cores e tipografia:** edite as variáveis CSS no início de `style.css`.
- **Frete:** altere `SHIPPING_THRESHOLD` e `SHIPPING_FEE` em `script.js`.
- **Cupom:** altere o código `BEMVINDO10` e a lógica em `script.js`.

## Limitações importantes

Este projeto **não possui backend, banco de dados ou gateway de pagamento**. Carrinho e favoritos ficam apenas no navegador em `localStorage`. O formulário de checkout não transmite nem salva os dados informados; a confirmação e o número do pedido são fictícios. Para vender de verdade, é necessário desenvolver APIs seguras, validação no servidor, controle de estoque, pagamentos, segurança e políticas de privacidade.

Projeto criado para fins educacionais.
