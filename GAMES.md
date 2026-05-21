# Documentação dos Jogos

Referência de implementação para os 21 jogos do livro  
**"Divirta-se com 21 Jogos Lógicos no Mesmo Tabuleiro"** — Renato P. Ribas (CMS/Metamorfose, 2025)

---

## O Tabuleiro

Todos os jogos (exceto Jogo da Velha, que usa as células) compartilham o mesmo **tabuleiro de 9 pontos e 8 linhas**:

```
0 ——— 1 ——— 2        a3 ——— b3 ——— c3
|  ╲  |  ╱  |         |  ╲   |  ╱  |
3 ——— 4 ——— 5        a2 ——— b2 ——— c2
|  ╱  |  ╲  |         |  ╱   |  ╲  |
6 ——— 7 ——— 8        a1 ——— b1 ——— c1
```

### Índices e coordenadas

| Índice | Coord | Posição       |
|--------|-------|---------------|
| 0      | a3    | topo-esquerda |
| 1      | b3    | topo-centro   |
| 2      | c3    | topo-direita  |
| 3      | a2    | meio-esquerda |
| 4      | b2    | centro        |
| 5      | c2    | meio-direita  |
| 6      | a1    | baixo-esquerda|
| 7      | b1    | baixo-centro  |
| 8      | c1    | baixo-direita |

### As 8 linhas (WIN_LINES)

```javascript
[0,1,2], [3,4,5], [6,7,8],   // linhas horizontais
[0,3,6], [1,4,7], [2,5,8],   // linhas verticais
[0,4,8], [2,4,6],             // diagonais
```

### Adjacência Tapatan (vizinhos diretos por linha)

```javascript
0: [1,3,4]          // canto: linha, coluna, diagonal
1: [0,2,4]          // borda: linha, coluna
2: [1,4,5]          // canto
3: [0,4,6]          // borda
4: [0,1,2,3,5,6,7,8] // centro: conecta a todos
5: [2,4,8]          // borda
6: [3,4,7]          // canto
7: [4,6,8]          // borda
8: [4,5,7]          // canto
```

---

## Posição Inicial — Jogos de Movimentação

Usada pelos Jogos 2–10 (e Desafio 18):

```
P2  P1  P2        2  1  2
 .   .   .   →    0  0  0
P1  P2  P1        1  2  1
```

- **P1** em: `1, 6, 8` (b3, a1, c1)
- **P2** em: `0, 2, 7` (a3, c3, b1)
- **Vazios**: `3, 4, 5` (a2, b2, c2)

Array: `[2, 1, 2, 0, 0, 0, 1, 2, 1]`

**Regra de empate:** 120 meios-movimentos sem vitória = empate.

---

## Categoria 1 — Alinhamento: Apenas Colocação

### Jogo 1 — Jogo da Velha ✅ implementado

- **Origem:** Tradicional mundial
- **Peças por jogador:** 3 (sem limite pré-definido — coloca até encher)
- **Tabuleiro:** 3×3 com células (não pontos)
- **Mecânica:** Turno a turno, cada jogador coloca uma peça em qualquer célula vazia
- **Vitória:** Primeiro a alinhar 3 peças em linha, coluna ou diagonal
- **Empate:** Tabuleiro cheio sem vencedor

**Notas de implementação:**
- Board: `Array(9)`, índice = célula (não ponto)
- Move type: `number` (índice 0–8)
- `checkResult` usa as 8 `WIN_LINES`

---

## Categoria 2 — Alinhamento: Apenas Movimentação

Peças já posicionadas na posição inicial. Nenhuma colocação — só movimentação.

### Jogo 2 — Movimento Livre ✅ implementado

- **Origem:** —
- **Peças por jogador:** 3
- **Mecânica:** Mova qualquer uma das suas peças para **qualquer posição vazia** do tabuleiro
- **Vitória:** Primeiro a alinhar 3 peças em qualquer das 8 linhas
- **Empate:** 120 meios-movimentos

**Notas de implementação:**
- `getDestinations(pos, state)` → todos os índices com `board[i] === 0`
- Estende `MovementGameBase`

---

### Jogo 3 — Tapatan ✅ implementado

- **Origem:** Indonésia / Filipinas
- **Peças por jogador:** 3
- **Mecânica:** Mova qualquer peça para uma **posição vizinha vazia**, seguindo as linhas do tabuleiro
- **Vitória:** Primeiro a alinhar 3 peças em qualquer das 8 linhas
- **Empate:** 120 meios-movimentos

**Notas de implementação:**
- `getDestinations(pos, state)` → `ADJACENCY[pos]` (filtrando vazios)
- Estende `MovementGameBase`

---

### Jogo 4 — Shisima ✅ implementado

- **Origem:** Quênia
- **Peças por jogador:** 3
- **Mecânica:** Igual ao Tapatan — mova para posição vizinha vazia pelas linhas
- **Vitória:** Alinhar 3 peças em linha que **passe pelo centro (posição 4)**
- **Empate:** 120 meios-movimentos

**Diferença em relação ao Tapatan:** As únicas linhas vencedoras válidas são as que contêm o centro:
```javascript
const WIN_LINES_SHISIMA = [
  [3,4,5], [1,4,7],   // linhas horizontais/verticais pelo centro
  [0,4,8], [2,4,6],   // diagonais
];
```

**Notas de implementação:**
- Estende `MovementGameBase`, sobrescreve `checkResult` com `WIN_LINES_SHISIMA`
- `getDestinations` idêntico ao Tapatan (adjacência)

---

### Jogo 5 — Tsoro Yematatu ✅ implementado

- **Origem:** Zimbábue
- **Peças por jogador:** 3
- **Mecânica:** Em cada turno, a peça pode:
  1. Mover para posição vizinha vazia (como Tapatan), **OU**
  2. **Saltar** sobre uma peça (própria ou adversária) que esteja na mesma linha, pousando na posição imediatamente após — se ela estiver vazia
- **Vitória:** Alinhar 3 peças em qualquer das 8 linhas
- **Empate:** 120 meios-movimentos

**Lógica de salto:** Para cada linha que passa por `pos`, se a posição seguinte `mid` está ocupada e a posição após `land` está vazia → `land` é destino válido.

**Notas de implementação:**
- `getDestinations(pos, state)`:
  - Todos os vizinhos vazios (adjacência Tapatan)
  - Para cada linha, verificar saltos disponíveis
- As 8 linhas ordenadas: usar estrutura de "segmentos" para identificar o que está à frente de `pos`

---

## Categoria 3 — Alinhamento: Colocação e Movimentação

Dois estados de jogo: **fase de colocação** → **fase de movimentação**.

### Estado extra necessário em `getInitialState`

```javascript
{
  board: Array(9).fill(0),
  currentPlayer: 1,
  phase: 'placement',   // 'placement' | 'movement'
  placed: { 1: 0, 2: 0 }, // peças já colocadas por jogador
}
```

A transição `placement → movement` ocorre quando ambos os jogadores colocaram todas as suas peças.

### Jogo 6 — Colocação + Livre ✅ implementado

- **Origem:** —
- **Peças por jogador:** 3
- **Fase 1 (Colocação):** Turno a turno, cada jogador coloca uma peça em qualquer posição vazia (6 turnos no total)
- **Fase 2 (Movimentação):** Igual ao Movimento Livre — qualquer peça para qualquer vazio
- **Vitória:** Alinhar 3 na fase de colocação ou movimentação
- **Empate:** 120 meios-movimentos na fase de movimentação

**Notas de implementação:**
- Move type varia por fase: `number` (colocação) ou `{from, to}` (movimentação)
- Alternativa: usar sempre `{from: null, to: idx}` na colocação para unificar o tipo
- `interactionMode`: precisa de lógica bifásica — considerar `'placement-then-movement'` ou tratar no próprio jogo

---

### Jogo 7 — Achi (4 peças) ✅ implementado

- **Origem:** Gana
- **Peças por jogador:** 4 (8 peças no tabuleiro + 1 vazia durante movimentação!)
- **Fase 1:** Cada jogador coloca 4 peças alternadamente (8 turnos)
- **Fase 2:** Mova uma peça para posição **vizinha vazia** pelas linhas (adjacência Tapatan)
- **Vitória:** Primeiro a alinhar 3 peças em qualquer das 8 linhas
- **Empate:** 120 meios-movimentos

**Observação crítica:** Com 8 peças em 9 posições, a movimentação é extremamente restrita (só 1 vazio). O minimax precisa de heurística para não ser trivial.

---

### Jogo 8 — Achi (3 peças) ✅ implementado

- **Origem:** Gana
- **Peças por jogador:** 3
- **Fase 1:** Cada jogador coloca 3 peças (6 turnos)
- **Fase 2:** Mova para vizinho vazio (adjacência Tapatan)
- **Vitória:** Alinhar 3 em qualquer das 8 linhas
- **Empate:** 120 meios-movimentos

**Diferença do Jogo 7:** 3 peças deixa 3 vazios → movimentação mais fluida. Diferença do Tapatan: chegada à fase de movimentação depende do posicionamento escolhido.

---

### Jogo 9 — Colocação + Centro ✅ implementado

- **Origem:** —
- **Peças por jogador:** 3
- **Fase 1:** Colocação livre (igual ao Jogo 6)
- **Fase 2:** Movimentação livre (qualquer vazio)
- **Vitória:** Alinhar 3 em linha que **passe pelo centro**
- **Empate:** 120 meios-movimentos

WIN_LINES: `[3,4,5], [1,4,7], [0,4,8], [2,4,6]` (igual ao Shisima)

---

### Jogo 10 — Colocação + Salto ✅ implementado

- **Origem:** Zimbábue (estilo Tsoro)
- **Peças por jogador:** 3
- **Fase 1:** Colocação livre
- **Fase 2:** Movimentação com regras do Tsoro Yematatu (adjacente OU salto)
- **Vitória:** Alinhar 3 em qualquer das 8 linhas
- **Empate:** 120 meios-movimentos

---

## Categoria 4 — Bloqueio: Mu Torere

**Objetivo:** Bloquear o adversário — quem não conseguir mover **perde**.  
Não há alinhamento. `checkResult` verifica `getValidMoves(state).length === 0`.

> ⚠️ Os detalhes de posição inicial e regras exatas de movimento das variantes V1–V3 devem ser verificados no livro. As descrições abaixo são baseadas nas informações disponíveis.

### Posição inicial — Mu Torere

Peças alternadas nas 8 posições externas; **centro (4) vazio**:

```
P1  P2  P1        1  2  1
P2   .  P2   →    2  0  2
P1  P2  P1        1  2  1
```

- **P1** em: `0, 2, 6, 8` (cantos)
- **P2** em: `1, 3, 5, 7` (bordas)
- **Vazio**: `4` (centro)

---

### Jogo 11 — Mu Torere (V1 — Alternado) ✅ implementado

- **Origem:** Nova Zelândia (Maori)
- **Peças por jogador:** 4
- **Posição inicial:** Alternada (ver acima)
- **Mecânica:** Mova uma peça para posição **adjacente vazia**, pelas linhas do tabuleiro. O centro (4) pode ser alcançado de qualquer posição adjacente.
- **Vitória:** Adversário não consegue mover

> ⚠️ Verificar no livro: restrição adicional para mover ao centro (no Mu Torere original, só pode ir ao centro se tiver peça adversária adjacente).

---

### Jogo 12 — Mu Torere (V2 — Colocação + Movimentação) ✅ implementado

- **Origem:** Nova Zelândia (Maori)
- **Peças por jogador:** 4
- **Fase 1:** Colocação — jogadores posicionam as 4 peças alternadamente
- **Fase 2:** Movimentação com regras do V1
- **Vitória:** Adversário não consegue mover

---

### Jogo 13 — Mu Torere (V3 — Original) ✅ implementado

- **Origem:** Nova Zelândia (Maori)
- **Peças por jogador:** 4
- **Posição inicial:** P1 (branco) forma um Γ à direita, P2 (escuro) forma um L à esquerda, centro vazio:
  ```
  B B W     2  2  1
  B . W  →  2  0  1
  B W W     2  1  1
  ```
  P1 em: `2, 5, 7, 8` — P2 em: `0, 1, 3, 6`
- **Regra especial:** Nas **duas primeiras jogadas** de cada jogador, não é permitido mover ao centro
- **Mecânica:** Após as 4 primeiras jogadas, segue as regras do V1
- **Vitória:** Adversário não consegue mover

---

## Categoria 5 — Bloqueio: Amazonas

**Inspirado em:** Game of the Amazons (Argentina, 1988)  
**Objetivo:** Bloquear o adversário — quem não conseguir mover **perde**.

**Mecânica por turno:**
1. Mova uma peça ao longo de qualquer linha (como uma rainha no xadrez: múltiplos passos em linha reta, sem saltar peças)
2. A partir da **nova posição**, lance uma "flecha" (peça bloqueadora neutra) ao longo de qualquer linha, bloqueando aquela posição permanentemente

**Estado extra:**
```javascript
{
  board: Array(9).fill(0), // 0=vazio, 1=P1, 2=P2, 3=bloqueado
  currentPlayer: 1,
}
```

**Movimentação tipo rainha:** A partir de uma posição, percorrer cada linha possível passando por ela, acumulando posições vazias consecutivas (parar ao encontrar qualquer peça ou bloqueio).

> ⚠️ Verificar no livro: posições iniciais exatas de cada variante.

---

### Jogo 14 — Amazonas (V1 — 1 peça, dentro)

- **Peças por jogador:** 1
- **Posição inicial:** P1 em alguma posição pré-definida, P2 em outra
- **Mecânica:** Turno = mover rainha + lançar flecha
- **Vitória:** Adversário não consegue mover sua rainha

> ⚠️ Verificar posição inicial no livro.

---

### Jogo 15 — Amazonas (V2 — 2 peças, dentro)

- **Peças por jogador:** 2
- **Posição inicial:** 2 peças pré-posicionadas para cada jogador
- **Mecânica:** Escolher qual das 2 rainhas mover, depois lançar flecha
- **Vitória:** Adversário não consegue mover nenhuma de suas rainhas

---

### Jogo 16 — Amazonas (V3 — 1 peça, fora)

- **Peças por jogador:** 1
- **Posição inicial:** Peças fora do tabuleiro
- **1º turno especial:** Em vez de mover, cada jogador **coloca** sua peça em qualquer posição vazia
- **Turnos seguintes:** Igual ao V1
- **Vitória:** Adversário não consegue mover

---

### Jogo 17 — Amazonas (V4 — 2 peças, fora)

- **Peças por jogador:** 2
- **Posição inicial:** Fora do tabuleiro
- **Fase 1:** Cada jogador coloca suas 2 peças (alternando, 4 turnos)
- **Fase 2:** Igual ao V2
- **Vitória:** Adversário não consegue mover nenhuma rainha

---

## Categoria 6 — Desafios Individuais (1 jogador)

Puzzles de 1 jogador: mova as peças no **menor número de movimentos** possível para atingir o objetivo. Sem adversário — sem minimax. Implementação requer um **contador de movimentos** e verificação do estado-objetivo.

> Os jogos de desafio não têm modo vs. IA. Considerar: mostrar o número de movimentos feitos e, opcionalmente, o recorde mínimo conhecido.

---

### Jogo 18 — Desafio: Troca de Lado (Tapatan)

- **Posição inicial:**
  ```
  P1  P1  P1        1  1  1
   .   .   .   →    0  0  0
  P2  P2  P2        2  2  2
  ```
- **Objetivo:** Trocar os lados — P1 na linha de baixo, P2 na linha de cima:
  ```
  P2  P2  P2        2  2  2
   .   .   .   →    0  0  0
  P1  P1  P1        1  1  1
  ```
- **Movimentação:** Regras do Tapatan (adjacência pelas linhas)
- **Meta:** Atingir o estado-objetivo no menor número de movimentos

**Notas de implementação:**
- Não é um jogo 2-jogadores — considerar interface diferente
- `checkResult` verifica se `board === [2,2,2,0,0,0,1,1,1]`
- Pode incluir modo de dica com BFS para caminho ótimo

---

### Jogo 19 — Desafio: Cavalo ×1

- **Posição inicial:** 1 peça P1 e 1 peça P2 em posições específicas
- **Objetivo:** Trocar as posições das peças usando o movimento do Cavalo do xadrez
- **Movimento do Cavalo no tabuleiro 3×3:** (2+1 em L)

| De  | Destinos possíveis |
|-----|--------------------|
| 0   | 5, 7               |
| 1   | 6, 8               |
| 2   | 3, 7               |
| 3   | 2, 8               |
| 4   | (nenhum — cavalo não alcança centro em 3×3) |
| 5   | 0, 6               |
| 6   | 1, 5               |
| 7   | 0, 2               |
| 8   | 1, 3               |

> ⚠️ Verificar posições iniciais exatas no livro.

---

### Jogo 20 — Desafio: Cavalo ×2

- **Posição inicial:** 2 peças P1 e 2 peças P2
- **Objetivo:** Trocar os lados de todas as peças usando movimento de Cavalo
- **Movimentação:** Igual ao Jogo 19

---

### Jogo 21 — Desafio: Cavalo ×3

- **Posição inicial:** 3 peças P1 e 3 peças P2
- **Objetivo:** Trocar os lados de todas as peças usando movimento de Cavalo
- **Observação:** Com 6 peças + posição do centro inacessível ao cavalo, o puzzle tem restrições severas

---

## Resumo de Implementação

### Tipos de move por jogo

| Jogos      | Tipo de move             |
|------------|--------------------------|
| 1          | `number` (índice célula) |
| 2–5, 11–13 | `{from, to}`             |
| 6–10       | `{from: null, to}` (colocação) ou `{from, to}` (movimentação) |
| 14–17      | `{piece, to, arrowTo}` (mover rainha + lançar flecha) |
| 18–21      | `{from, to}` (1 jogador) |

### Condições de vitória por categoria

| Categoria        | Vitória                              |
|------------------|--------------------------------------|
| Alinhamento      | `checkResult` verifica `WIN_LINES`   |
| Shisima / +Centro| `checkResult` verifica só 4 linhas centrais |
| Bloqueio         | `getValidMoves(state).length === 0`  |
| Desafio          | `board` === estado-objetivo          |

### Classes base sugeridas

```
GameBase
├── TicTacToe                     (Jogo 1)
├── MovementGameBase              (Jogos 2–5) ✅
│   ├── MovimentoLivre            (Jogo 2)
│   ├── Tapatan                   (Jogo 3)
│   ├── Shisima                   (Jogo 4)
│   └── TsoroYematatu             (Jogo 5)
├── PlacementMovementBase         (Jogos 6–10) ✅
│   ├── ColMaisLivre              (Jogo 6)
│   ├── Achi4                     (Jogo 7)
│   ├── Achi3                     (Jogo 8)
│   ├── ColMaisCentro             (Jogo 9)
│   └── ColMaisSalto              (Jogo 10)
├── BlockingGameBase              (Jogos 11–13) ✅
│   ├── MuTorereV1                (Jogo 11)
│   ├── MuTorereV2                (Jogo 12 — placement phase + movement)
│   └── MuTorereV3                (Jogo 13 — restricted center moves)
└── AmazonasBase                  (Jogos 14–17, a implementar)
```

### Renderers sugeridos

```
TicTacToeBoard       → já existe em TicTacToe.js
TapatanBoardRenderer → já existe, reaproveitável para Jogos 2–13, 18–21
AmazonasRenderer     → novo (indicar bloqueios com cor diferente)
```

### Notas sobre heurística do Minimax

| Jogo | Observação |
|------|-----------|
| 1–3  | Evaluate = ±1000 terminal / 0 meio-jogo funciona bem |
| 4    | Idem |
| 7    | Com 8 peças em 9 posições, o fator de ramificação é mínimo — depth 9 é OK |
| 11–17| Bloqueio: considerar heurística de mobilidade (# moves disponíveis para cada jogador) |
