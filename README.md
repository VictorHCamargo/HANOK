# HANOK — Restaurante Coreano

Interface web de restaurante coreano com cardápio interativo, carrinho, reservas e área administrativa. Identidade visual em preto, branco e laranja.

## Estrutura

- `project/` — todo o código do site (HTML, CSS e JavaScript).
- `docs/` — reservado para a documentação do projeto.

## Como executar

1. Abra `project/index.html` no navegador ou execute um servidor local na raiz do repositório:
   ```bash
   python -m http.server 8000
   ```
2. Acesse `http://localhost:8000/project/`.
3. O site conta com páginas para login/cadastro, área do cliente, administração e identidade visual.

## Principais recursos

Cardápio com filtros e busca, carrinho e pedidos, simulação de reservas, login/cadastro demonstrativos, perfis de cliente e administrador, painel de gerenciamento, alternância claro/escuro e carrossel de imagens.

**Estado atual:** protótipo de frontend. O armazenamento é local ao navegador; **não existe backend, autenticação segura, MySQL nem processamento de pagamentos reais**. Fotos remotas (Unsplash) e fontes podem exigir internet.

## Histórico

Cada evolução entregue está registrada em um commit na branch `main`:

| Versão | Evolução |
| --- | --- |
| `v0.0-original` | HTML original recebido |
| `v0.1-site` | Site e painel inicial |
| `v0.2-admin` | Login, tema e administração |
| `v0.3-cardapio` | Fotos ampliadas e carrossel inicial |
| `v0.4-hero` | Carrossel como imagem de fundo |
| `v0.5-refinado` | Animações, contraste e revisão visual |

Consulte os commits na aba **Commits** do GitHub. Para recuperar uma versão: `git checkout <SHA-do-commit>` e retorne com `git switch main`.
