# Agenda de Faculdade

Um sistema web completo para organização acadêmica de estudantes universitários, desenvolvido com Python (Flask) no backend e JavaScript Vanilla (SPA) no frontend moderno.

## 🎯 Visão Geral

A **Agenda de Faculdade** é uma aplicação web que ajuda estudantes a organizar sua vida acadêmica de forma centralizada. O sistema permite gerenciar disciplinas, atividades, horários, faltas, notas e criar anotações em um único lugar seguro, com suporte a múltiplos usuários.

---

## 🏗️ Arquitetura do Sistema e Conexão entre Arquivos

O projeto segue a arquitetura **SPA (Single Page Application) com uma API RESTful**. O frontend é renderizado client-side através de JavaScript, que se comunica com o backend Flask via chamadas assíncronas (fetch) utilizando o formato JSON.

### Estrutura de Diretórios e a Função de Cada Arquivo

#### Backend (Python/Flask)
*   **`app.py`**: É o núcleo do servidor base. 
    *   **Função**: Inicializa a aplicação Flask, configura as extensões (CORS, SQLAlchemy, LoginManager) e define todas as rotas (endpoints) da API REST (`/api/auth/*`, `/api/subjects`, `/api/activities`, etc.). Também lida com a autenticação e verificação de sessões ativas (`current_user`).
*   **`models.py`**: Define as entidades do banco de dados (ORM).
    *   **Função**: Cada classe (ex: `User`, `Subject`, `Activity`) mapeia para uma tabela do banco. Arquivo fundamental, contendo métodos para lidar com senhas criptografadas (`set_password`, `check_password`) e métodos utilitários `to_dict()` fundamentais para traduzir o banco de dados em JSON compreensível pelo frontend.
*   **`database.py`**: O inicializador do banco.
    *   **Função**: Cria a instância global `db = SQLAlchemy()`. Ao manter isso em um arquivo separado de `app.py` e `models.py`, o sistema evita que importações circulares "quebrem" o Python na hora de rodar.
*   **`config.py`**: A ponte de configuração.
    *   **Função**: Carrega variáveis de ambiente, especificamente voltado pro uso avançado da nuvem do Neon.tech (PostgreSQL). Define diretrizes cruciais como `SQLALCHEMY_DATABASE_URI` e `SECRET_KEY`.

#### Frontend (HTML/JS/CSS)
*   **`templates/index.html`**: A página mestra que o usuário real acessa. Por ser SPA, o arquivo carrega todas as divisões básicas vazias (`#auth-screen`, `#app`, `#view-container`, `#modal-container`) e aguarda o JavaScript trabalhar.
*   **`static/css/style.css`**: Estiliza toda a interface com custom properties (`--variaveis`) suportando o sistema de mudança de temas.
*   **`static/js/app.js`**: O "cérebro" do frontend. Agrupa todo o comportamento do site.
    *   **Autenticação e Inicialização**: Funções `init()`, `checkAuth()`, `handleLogin()`, e `handleRegister()` configuram a sessão assim que o usuário entra, exibindo ou ocultando a tela de Login vs App.
    *   **Navegação Rápida**: `navigate()` muda a aba ou seção visível do usuário de forma fluída sem recarregar a página (comum em Dashboards).
    *   **Comunicação com a API**: 
        *   `fetchData()`: Faz um carregamento global e paralelo de Disicplinas, Falores, Notas e Horários e guarda no objeto JS `appState.data`.
        *   `saveItem()`, `deleteItem()`, `toggleActivity()`, `saveNote()`: Envia formulários modais e ações de interface como requests POST/PUT/DELETE diretas pro backend no arquivo `app.py`.
    *   **Renderização Dinâmica**: Os métodos com prefixo `render` (`renderDashboard()`, `renderSubjects()`, `renderCalendar()`, etc) leem os JSONs presentes em `appState.data` para injetar tags em HTML no miolo do `<div id="view-container">`.
    *   **Manipulação de UI**: Funções secundárias e de modais (ex: `openModal()`, `closeModal()`, `toggleTheme()`) apenas ocultam, exibem visuais ou setam varáveis na tela.

### 🔄 Fluxo de Conexão na Prática (Como eles se conversam)
1. **Ponto de Partida**: O usuário acessa a página base (servida pela rota `/` do `app.py`). O servidor devolve o arquivo HTML do `templates/index.html`.
2. **Processamento do Cliente**: O HTML importa imediatamente o arquivo `app.js`. Automaticamente a classe `appState.init()` é executada acionando `checkAuth()`. 
3. **Ponte Frontend <> Backend**: O `app.js` faz uma requisição fetch na rota `/api/auth/me`. O servidor em `app.py` confere a criptografia via Flask-Login (usando `models.py`). Se não há sessão logada, o `app.js` diz pro HTML mostrar o login.
4. **Requisição Segura**: Se validado, ou com o login recém-feito, o Javascript fará um `fetchData()`, conectando o arquivo `app.js` com TODAS as rotas de busca de `app.py` ao mesmo tempo.
5. **Acesso ao Banco e Render**: `app.py` busca os registros dos modelos (`models.py`), as linhas encontradas viram dicts e consequentemente convertidas pelo Flask pra JSONs que correm na internet até o `app.js`, que finaliza usando a função `renderDashboard()` para "pintar" o DOM, montando o sistema na tela.

---

## 🚀 Principais Funcionalidades

### 1. **Gestão de Disciplinas**
- Cadastro e organização de disciplinas do semestre.
- Definição de metas de frequência e notas, com cores personalizadas.

### 2. **Controle de Atividades e Trabalhos**
- Cadastro de tarefas, trabalhos e provas com datas de entrega.
- Checklists dinâmicos e descrição rica.

### 3. **Horário de Aulas & Calendário Integrado**
- Visualização em layout de grade semanal com controle de salas.
- Calendário mensal exibindo os destaques e as restrições por dia.

### 4. **Anotações, Faltas e Notas Inteligentes**
- Comparação automática com limite máximo configurado gerando alertas visuais (Dashboards).
- Sistema de notas adesivas com blocos de texto por disciplina ou atividade.
- Cálculo de média ponderada, com análise se a média do aluno está abaixo ou acima da idealizada.

## 🛠️ Tecnologias Utilizadas

**Backend:** Python 3.x, Flask, Flask-SQLAlchemy, Flask-Login, Neon.tech (PostgreSQL)
**Frontend:** HTML5, CSS3, JavaScript Vanilla (ES6+), Remix Icon.

## 🔧 Como Executar

### Pré-Requisitos
- Python 3.8+ e pip.
- Banco de dados suportado (Neon PostgreSQL recomendado se via `.env`).

### Passo a Passo de Instalação (Local)

1. Clone o repositório.
2. Crie e ative um ambiente virtual:
    ```bash
    python -m venv .venv
    # Windows
    .venv\Scripts\activate
    ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
4. Prepare o Banco Local (SQLite caso sem .ENV):
   ```bash
   python recreate_db.py
   ```
5. Execute a aplicação inicializando o Backend na porta 5000:
   ```bash
   python app.py
   ```
6. Acesse a aplicação completa no navegador: `http://localhost:5000`

---
**Desenvolvido com ❤️ para ajudar estudantes a alcançarem o sucesso acadêmico!**