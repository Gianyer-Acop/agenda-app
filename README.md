# Agenda de Faculdade

Um sistema web completo para organização acadêmica de estudantes universitários, desenvolvido com Python Flask e tecnologias modernas.

## 🎯 Visão Geral

A **Agenda de Faculdade** é uma aplicação web que ajuda estudantes a organizar sua vida acadêmica de forma centralizada e intuitiva. O sistema permite gerenciar disciplinas, atividades, horários, faltas, notas e anotações em um único lugar.

## 🚀 Principais Funcionalidades

### 1. **Gestão de Disciplinas**
- Cadastro e organização de disciplinas do semestre
- Definição de metas de frequência (máximo de faltas permitidas)
- Definição de média alvo para aprovação
- Personalização com cores para identificação visual
- Anotações específicas por disciplina

### 2. **Controle de Atividades e Trabalhos**
- Cadastro de tarefas, trabalhos e provas com datas de entrega
- Classificação por tipo: Geral, Trabalho ou Prova
- Marcação de conclusão de atividades
- Descrição detalhada e notas adicionais
- Integração com calendário para visualização das entregas

### 3. **Horário de Aulas**
- Organização semanal das aulas por dia da semana
- Definição de horários de início e fim
- Localização da sala de aula
- Visualização em layout de grade semanal
- Vinculação com disciplinas cadastradas

### 4. **Controle de Faltas**
- Registro de faltas por disciplina
- Comparação automática com limite máximo configurado
- Alertas visuais quando limite de faltas é atingido
- Histórico de faltas por disciplina

### 5. **Gestão de Notas**
- Registro de notas de provas e avaliações
- Cálculo automático de médias ponderadas
- Comparação com média alvo configurada
- Alertas quando a média está abaixo do objetivo
- Histórico de todas as avaliações por disciplina

### 6. **Anotações e Comentários**
- Sistema de notas adesivas por disciplina ou atividade
- Editor de texto rico para anotações detalhadas
- Histórico de anotações organizado por data
- Integração direta com disciplinas e atividades

### 7. **Dashboard Inteligente**
- Visão geral do semestre com estatísticas resumidas
- Indicadores de progresso por disciplina
- Alertas de faltas e médias críticas
- Resumo de atividades pendentes e concluídas

### 8. **Calendário Integrado**
- Visualização mensal das atividades e entregas
- Destaque visual de dias com compromissos
- Detalhamento de atividades ao clicar nos dias
- Integração com o controle de atividades

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.x** - Linguagem principal
- **Flask** - Framework web
- **Flask-SQLAlchemy** - ORM para banco de dados
- **Flask-Login** - Autenticação de usuários
- **Flask-CORS** - Compartilhamento de recursos entre origens
- **SQLite** - Banco de dados relacional

### Frontend
- **HTML5** - Estrutura da página
- **CSS3** - Estilização com variáveis CSS para temas
- **JavaScript ES6+** - Lógica do cliente
- **Font Awesome/Remix Icon** - Ícones
- **Google Fonts (Inter)** - Tipografia

## 📁 Estrutura de Arquivos

```
Agenda de Faculdade/
├── app.py              # Aplicação Flask principal
├── database.py         # Configuração do banco de dados
├── models.py           # Modelos de dados (ORM)
├── requirements.txt    # Dependências Python
├── agenda.db          # Banco de dados SQLite (gerado)
├── static/            # Arquivos estáticos
│   ├── css/
│   │   └── style.css  # Estilos principais
│   └── js/
│       └── app.js     # Lógica frontend
└── templates/         # Templates HTML
    └── index.html     # Página principal
```

## 🏗️ Modelos de Dados

### Usuário (User)
- Identificação única
- Nome e e-mail
- Senha criptografada
- Sistema de login seguro

### Disciplina (Subject)
- Nome da disciplina
- Cor de identificação
- Limite máximo de faltas
- Média alvo para aprovação
- Anotações específicas

### Atividade (Activity)
- Título e descrição
- Data de entrega
- Tipo (Geral, Trabalho, Prova)
- Status de conclusão
- Vinculação com disciplina

### Horário (Schedule)
- Dia da semana
- Horário de início e fim
- Local da aula
- Vinculação com disciplina

### Falta (Absence)
- Data da falta
- Motivo (opcional)
- Vinculação com disciplina

### Nota (Grade)
- Descrição da avaliação
- Valor obtido e máximo
- Peso da avaliação
- Cálculo de média ponderada

### Anotação (Note)
- Título e conteúdo
- Data de criação
- Vinculação com disciplina ou atividade

## 🎨 Interface do Usuário

### Design Responsivo
- Layout adaptável para desktop e mobile
- Sidebar colapsável
- Navegação intuitiva por ícones
- Sistema de temas (claro, conforto, escuro)

### Experiência do Usuário
- Carregamento rápido
- Feedback visual imediato
- Alertas coloridos para situações críticas
- Navegação por abas organizadas

## 🔧 Como Executar

### Requisitos
- Python 3.6 ou superior
- pip (gerenciador de pacotes Python)

### Instalação
1. Clone o repositório
2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
3. Execute a aplicação:
   ```bash
   python app.py
   ```
4. Acesse no navegador: `http://localhost:5000`

## 📊 Principais Benefícios

### Para Estudantes
- **Organização Centralizada**: Tudo em um único lugar
- **Controle de Frequência**: Evita surpresas com faltas
- **Planejamento de Estudos**: Visualização clara de entregas
- **Acompanhamento de Desempenho**: Médias e metas em tempo real
- **Flexibilidade**: Ajuste às necessidades individuais

### Para Instituições
- **Modelo de Referência**: Sistema completo de gestão acadêmica
- **Arquitetura Escalável**: Fácil de expandir e adaptar
- **Código Limpo**: Boas práticas de desenvolvimento
- **Documentação Clara**: Fácil manutenção e evolução

## 🚀 Futuro Desenvolvimento

### Possíveis Melhorias
- Integração com calendários externos (Google Calendar)
- Envio de lembretes por e-mail
- Exportação de relatórios em PDF
- Sistema de backup em nuvem
- Aplicativo mobile nativo

## 📄 Licença

Este projeto é open source e está disponível sob a Licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests com melhorias, correções de bugs ou novas funcionalidades.

---

**Desenvolvido com ❤️ para ajudar estudantes a alcançarem o sucesso acadêmico!**