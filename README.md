# DM122-PWA: GymLog App

Projeto final da disciplina **DM122 - Desenvolvimento Híbrido de Aplicativos Móveis**

Parte da Pós-Graduação em **Cloud Computing e Desenvolvimento Mobile**.

## 🚀 Visualização (Entrega do Trabalho)

O site está hospedado e pode ser acessado publicamente através do link abaixo, utilizando o GitHub Pages:

**🔗 Acessar o site:** **[[https://github.com/mcscorazza/DM122_PWA](https://github.com/mcscorazza/DM122_PWA)]**


## 📝 Sobre o Projeto

Este projeto é um Progressive Web App (PWA) completo, focado em ser um diário de treino de musculação (Gym Log). 
O objetivo é criar uma aplicação robusta que permita ao usuário gerenciar suas rotinas, catalogar exercícios e acompanhar seu progresso de treino, 
com foco total no funcionamento offline.
A aplicação é construída utilizando "Vanilla Stack" (HTML, CSS e JavaScript puros), sem frameworks, para demonstrar o domínio das Web APIs modernas, 
como Service Workers e IndexedDB.

## 📱Telas Principais 
Tela de Rotinas (Screen-1)
Tela de Treino (Screen-2)
Editor de Exercícios (Screen-4)

## ✨ Funcionalidades
O aplicativo permite ao usuário gerenciar seu ciclo de treino completo:
- **Gerenciamento de Rotinas (CRUD):** Crie, edite (título, descrição e ícone) e exclua rotinas de treino (ex: "Treino A", "Treino B").
- **Biblioteca de Exercícios (CRUD):** Crie, edite e exclua exercícios em uma biblioteca global, classificados por grupo muscular (Peito, Costas, etc.).
- **Montagem de Treinos:** Adicione exercícios da biblioteca a uma rotina específica.
- **Gerenciamento do Plano:** Edite o plano de um exercício dentro da rotina (séries, repetições e carga) a qualquer momento.
- **Execução de Treino:** Acompanhe seu progresso em tempo real, marcando séries individuais e exercícios inteiros como "concluídos".
- **Persistência de Estado:** O progresso do treino (quais séries/exercícios foram feitos) é salvo diretamente no IndexedDB, permitindo que o usuário pare e continue o treino quando quiser.
- **Reset de Progresso:** Um botão permite resetar o estado de "feito" de todos os exercícios para começar um novo ciclo.
- **100% Offline:** Como um PWA:
  - O **Service Worker** armazena o "App Shell" (HTML, CSS, JS, imagens) no cache.
  - O **IndexedDB** armazena todos os dados do usuário (rotinas, exercícios, planos, progresso).

## 🛠️ Tecnologias Utilizadas
Este projeto foi construído do zero utilizando tecnologias web modernas, sem o uso de frameworks de UI (como React ou Vue).
- **HTML5 Semântico:** Estrutura limpa e moderna, utilizando a tag `<dialog>` para todos os modais de interação (CRUDs e confirmações).
- **CSS3 Moderno:** Estilização responsiva utilizando Flexbox e variáveis CSS para um design consistente.
- **JavaScript (ES6+):** Código limpo e modularizado (ESM), utilizando Classes, async/await e manipulação direta do DOM.
- **Progressive Web App (PWA):**
  - **Service Worker:** Para cacheamento offline robusto (estratégia Cache-First para o App Shell e Stale-While-Revalidate para CDNs).
  - **Web App Manifest:** Permite a instalação do app no dispositivo (desktop ou mobile).
- **IndexedDB:** O banco de dados no lado do cliente, usado para armazenar todos os dados da aplicação.
- **Dexie.js:** Uma biblioteca (wrapper) que simplifica drasticamente as operações com IndexedDB, permitindo transações complexas para garantir a integridade dos dados (ex: exclusão em cascata).
- **Lucide Icons:** Biblioteca leve de ícones SVG.
- **GitHub Pages:** Utilizado para o deploy e hospedagem do PWA.

## 🚀 Como Executar Localmente
Como este projeto utiliza Módulos ES6 e um Service Worker, ele precisa ser servido através de um servidor HTTP (não funciona abrindo o index.html diretamente).
1. **Clone o repositório:**
```Bash
git clone https://github.com/mcscorazza/DM122_PWA.git
```

2. **Navegue até a pasta:**
```Bash
cd DM122_PWA
```

3. **Inicie um servidor local:**
   
   - **Usando a extensão Live Server (VS Code):** Clique com o botão direito no index.html e selecione "Open with Live Server".

   - **Usando Python** (se tiver instalado):
    ```Bash
    # Python 3.x
    python -m http.server
    ```

   - **Usando Node.js** (se tiver instalado):
    ```Bash
    # Instale o 'serve' globalmente (apenas uma vez)
    npm install -g serve
    # Rode o servidor
    serve .
    ```

4. **Abra no navegador:** Acesse o endereço fornecido (ex: `http://localhost:5500` ou `http://localhost:8000`).


## 👨‍💻 Autor

**Marcos Corazza**

* **LinkedIn:** `https://www.linkedin.com/in/corazza/`
* **GitHub:** `https://github.com/mcscorazza/`