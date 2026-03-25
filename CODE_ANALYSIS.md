# Análise Técnica do Código - Agenda de Faculdade

Este documento fornece uma análise detalhada da arquitetura e funcionalidades do código-fonte da Agenda de Faculdade, focando nas camadas frontend (JavaScript) e backend (Python/Flask).

## 🏗️ Arquitetura Geral

O sistema segue um padrão **API RESTful** com frontend SPA (Single Page Application):

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Frontend      │   <--------->   │   Backend       │
│   (JavaScript)  │                 │   (Python)      │
│                 │                 │                 │
│ • app.js        │                 │ • app.py        │
│ • style.css     │                 │ • models.py     │
│ • index.html    │                 │ • database.py   │
└─────────────────┘                 └─────────────────┘
```

## 🎨 Frontend - JavaScript (app.js)

### Estrutura Principal

O frontend é controlado por um **objeto singleton** `appState` que gerencia todo o estado da aplicação.

#### 1. **Inicialização e Autenticação**

```javascript
async init() {
    // Define tema baseado no localStorage
    document.documentElement.setAttribute('data-theme', this.theme);
    
    // Verifica se usuário está logado
    await this.checkAuth();
    
    if (this.user) {
        this.showApp();  // Mostra interface principal
    } else {
        this.showAuth(); // Mostra tela de login
    }
}
```

**Funções Principais:**
- `checkAuth()`: Verifica autenticação via API
- `showApp()/showAuth()`: Alterna entre telas
- `toggleAuthMode()`: Alterna entre login/cadastro

#### 2. **Gestão de Estado**

```javascript
const appState = {
    user: null,                    // Dados do usuário logado
    currentView: 'dashboard',      // Página atual
    theme: localStorage.getItem('theme') || 'light',
    data: {                       // Dados da aplicação
        subjects: [],
        activities: [],
        schedules: [],
        absences: [],
        grades: []
    }
}
```

**Padrão de Dados:**
- **Centralizado**: Todos os dados ficam no objeto `appState.data`
- **Sincronizado**: Dados são atualizados via chamadas API
- **Reativo**: Alterações no estado atualizam a UI automaticamente

#### 3. **Renderização de Views**

O sistema utiliza **renderização client-side** com templates HTML inline:

```javascript
renderView() {
    const container = document.getElementById('view-container');
    if (this.currentView === 'dashboard') this.renderDashboard(container);
    else if (this.currentView === 'subjects') this.renderSubjects(container);
    // ... outras views
}
```

**Views Principais:**
- **Dashboard**: Visão geral com estatísticas
- **Subjects**: Gerenciamento de disciplinas
- **Activities**: Controle de tarefas e trabalhos
- **Schedules**: Horário de aulas semanal
- **Calendar**: Calendário mensal interativo

#### 4. **Comunicação com Backend**

Todas as operações utilizam **fetch API** para chamadas REST:

```javascript
async fetchData() {
    const [subjects, activities, schedules, absences, grades] = await Promise.all([
        fetch('/api/subjects').then(r => r.json()),
        fetch('/api/activities').then(r => r.json()),
        // ... outras chamadas
    ]);
    this.data.subjects = subjects;
    // ... atualiza estado
    this.renderView();
}
```

**Padrões de Comunicação:**
- **GET**: Busca de dados
- **POST**: Criação de registros
- **PUT**: Atualização de registros
- **DELETE**: Exclusão de registros
- **Headers**: `Content-Type: application/json`

#### 5. **Gerenciamento de Modais**

Sistema de modais modais para CRUD:

```javascript
openModal(type, extraId = null, editId = null) {
    // Gera formulário baseado no tipo
    if (type === 'subject') {
        body.innerHTML = `
            <form onsubmit="event.preventDefault(); appState.saveItem('subjects');">
                <input type="text" id="m-name" required>
                <input type="number" id="m-abs" value="0">
                <!-- ... campos do formulário -->
            </form>
        `;
    }
    // ... outros tipos
}
```

**Tipos de Modais:**
- `subject`: Cadastro/edição de disciplinas
- `activity`: Cadastro/edição de atividades
- `schedule`: Cadastro de horários
- `absence`: Registro de faltas
- `grade`: Registro de notas
- `notes`: Sistema de anotações

#### 6. **Funcionalidades Específicas**

##### Dashboard Inteligente
```javascript
renderDashboard(container) {
    // Calcula estatísticas
    const totalActs = this.data.activities.length;
    const completedActs = this.data.activities.filter(a => a.status === 'completed').length;
    
    // Gera cards por disciplina
    const subjectDetails = this.data.subjects.map(sub => {
        const subAbsences = this.data.absences.filter(a => a.subject_id === sub.id).length;
        const subGrades = this.data.grades.filter(g => g.subject_id === sub.id);
        // ... cálculo de médias e alertas
    });
}
```

##### Calendário Interativo
```javascript
renderCalendar(container) {
    // Gera calendário mensal
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dayActivities = this.data.activities.filter(a => a.due_date === dateStr);
        // ... renderiza dia com atividades
    }
}
```

##### Sistema de Anotações
```javascript
async openNotes(parentType, parentId) {
    // Busca notas relacionadas
    const res = await fetch(`/api/notes?parent_type=${parentType}&parent_id=${parentId}`);
    const notes = await res.json();
    
    // Renderiza lista de notas
    body.innerHTML = this._renderNotesList(notes, parentType, parentId);
}
```

## 🔧 Backend - Python/Flask (app.py)

### Estrutura de Rotas

O backend segue o padrão **RESTful** com rotas organizadas por recurso:

```python
# Rotas de Autenticação
@app.route('/api/auth/register', methods=['POST'])
@app.route('/api/auth/login', methods=['POST'])
@app.route('/api/auth/logout', methods=['POST'])
@app.route('/api/auth/me', methods=['GET'])

# Rotas de Dados (CRUD)
@app.route('/api/subjects', methods=['GET', 'POST'])
@app.route('/api/subjects/<int:id>', methods=['PUT', 'DELETE'])
# ... similar para activities, schedules, absences, grades, notes
```

### 1. **Autenticação e Segurança**

#### Sistema de Login
```python
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    login_id = data.get('login')  # pode ser email ou nome
    password = data.get('password')
    
    # Busca por email ou nome
    user = User.query.filter(or_(User.email == login_id, User.name == login_id)).first()
    
    if user and user.check_password(password):
        login_user(user)
        return jsonify(user.to_dict())
    return jsonify({'error': 'Usuário ou senha incorretos'}), 401
```

**Características:**
- **Multi-login**: Permite login por email ou nome
- **Segurança**: Senhas criptografadas com `werkzeug.security`
- **Sessão**: Flask-Login para gerenciamento de sessões
- **Proteção**: Decorador `@login_required` nas rotas protegidas

#### Registro de Usuários
```python
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'E-mail já cadastrado'}), 400
    
    user = User(name=data['name'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return jsonify(user.to_dict()), 201
```

### 2. **Modelo de Dados (models.py)**

#### Relacionamento entre Entidades
```python
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    max_absences = db.Column(db.Integer, default=0)
    target_grade = db.Column(db.Float, default=6.0)
    
    # Relacionamentos
    activities = db.relationship('Activity', backref='subject', lazy=True, cascade="all, delete-orphan")
    schedules = db.relationship('Schedule', backref='subject', lazy=True, cascade="all, delete-orphan")
    absences = db.relationship('Absence', backref='subject', lazy=True, cascade="all, delete-orphan")
    grades = db.relationship('Grade', backref='subject', lazy=True, cascade="all, delete-orphan")
```

**Padrões de Relacionamento:**
- **One-to-Many**: User → Subjects, Subjects → Activities, etc.
- **Cascade Delete**: Exclusão em cascata quando disciplina é removida
- **Lazy Loading**: Carregamento sob demanda para melhor performance

#### Conversão para JSON
```python
def to_dict(self):
    return {
        "id": self.id,
        "user_id": self.user_id,
        "name": self.name,
        "max_absences": self.max_absences,
        "target_grade": self.target_grade,
        "color": self.color,
        "notes": self.notes or ""
    }
```

### 3. **Operações CRUD Genéricas**

#### Helper Functions
```python
def get_all_scoped(model):
    items = model.query.filter_by(user_id=current_user.id).all()
    return jsonify([item.to_dict() for item in items])

def delete_scoped(model, item_id):
    item = model.query.filter_by(id=item_id, user_id=current_user.id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True})
```

**Características:**
- **Escopo por Usuário**: Todas as operações são filtradas por `user_id`
- **Segurança**: Impede acesso a dados de outros usuários
- **Consistência**: Uso de transações SQLAlchemy
- **Erros**: Tratamento adequado com `first_or_404()`

### 4. **Rotas Específicas**

#### Controle de Atividades
```python
@app.route('/api/activities/<int:id>', methods=['PUT'])
@login_required
def update_activity(id):
    item = Activity.query.filter_by(id=id, user_id=current_user.id).first_or_404()
    data = request.json
    for key, value in data.items():
        if key != 'user_id': setattr(item, key, value)
    db.session.commit()
    return jsonify(item.to_dict())
```

#### Sistema de Notas
```python
@app.route('/api/notes', methods=['GET'])
@login_required
def get_notes():
    parent_type = request.args.get('parent_type')
    parent_id = request.args.get('parent_id')
    query = Note.query.filter_by(user_id=current_user.id)
    if parent_type: query = query.filter_by(parent_type=parent_type)
    if parent_id: query = query.filter_by(parent_id=int(parent_id))
    return jsonify([n.to_dict() for n in query.order_by(Note.id.desc()).all()])
```

**Features Avançadas:**
- **Filtros**: Consultas com parâmetros de filtro
- **Ordenação**: Resultados ordenados por data de criação
- **Validação**: Verificação de propriedade do recurso
- **Resposta JSON**: Formato padronizado

### 5. **Configuração do Banco de Dados (database.py)**

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
```

**Uso no app.py:**
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'agenda.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()
```

## 🔄 Fluxo de Dados

### 1. **Ciclo de Vida de uma Operação**

```
Frontend (JavaScript)          Backend (Python)
       ↓                              ↓
1. Usuário clica em "Nova Disciplina"
       ↓                              ↓
2. openModal('subject')         [N/A]
       ↓                              ↓
3. Renderiza formulário          [N/A]
       ↓                              ↓
4. Usuário preenche e submete
       ↓                              ↓
5. saveItem('subjects')         @app.route('/api/subjects')
       ↓                              ↓
6. fetch('/api/subjects', {      def add_subject():
   method: 'POST',                  data = request.json
   body: JSON.stringify(data)       item = Subject(**data, user_id=current_user.id)
})                                  db.session.add(item)
       ↓                              ↓
7. Resposta 201 Created         db.session.commit()
       ↓                              ↓
8. closeModal()                return jsonify(item.to_dict()), 201
       ↓                              ↓
9. fetchData()                 [N/A]
       ↓                              ↓
10. Atualiza estado local      [N/A]
       ↓                              ↓
11. Re-renderiza interface     [N/A]
```

### 2. **Autenticação**

```
Login Flow:
1. Frontend → POST /api/auth/login
2. Backend → Verifica credenciais
3. Backend → Cria sessão Flask-Login
4. Backend → Retorna dados do usuário
5. Frontend → Armazena dados e mostra app
```

### 3. **Proteção de Dados**

```
Segurança por Escopo:
1. Cada requisição verifica @login_required
2. current_user.id é comparado com user_id do recurso
3. Operações são filtradas por usuário
4. Impede acesso cruzado entre usuários
```

## 📊 Performance e Boas Práticas

### Frontend
- **Lazy Loading**: Dados carregados sob demanda
- **Batch Requests**: Múltiplas consultas simultâneas com `Promise.all()`
- **State Management**: Estado centralizado evita chamadas desnecessárias
- **Template Caching**: HTML gerado client-side reduz carga do servidor

### Backend
- **ORM**: SQLAlchemy para abstração de banco de dados
- **Transactions**: Operações atômicas com commit/rollback
- **Validation**: Validação server-side para segurança
- **Error Handling**: Respostas JSON padronizadas

## 🔍 Pontos Fortes da Arquitetura

1. **Separação de Concerns**: Frontend/backend bem definidos
2. **Segurança**: Autenticação robusta e escopo por usuário
3. **Escalabilidade**: API RESTful permite fácil expansão
4. **Manutenção**: Código organizado e documentado
5. **Performance**: Carregamento eficiente e cache inteligente
6. **User Experience**: Interface responsiva e feedback imediato

Esta arquitetura demonstra boas práticas de desenvolvimento web moderno, combinando simplicidade com robustez para criar uma aplicação acadêmica completa e segura.