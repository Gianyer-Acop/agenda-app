const appState = {
    user: null,
    currentView: 'dashboard',
    theme: localStorage.getItem('theme') || 'light',
    data: {
        subjects: [],
        activities: [],
        schedules: [],
        absences: [],
        grades: []
    },

    async init() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // 1. Check if user is logged in
        await this.checkAuth();

        if (this.user) {
            this.showApp();
        } else {
            this.showAuth();
        }

        // Restore sidebar state (desktop only)
        if (window.innerWidth > 768 && localStorage.getItem('sidebarCollapsed') === 'true') {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.add('collapsed');
            const icon = document.getElementById('toggle-icon');
            if (icon) icon.className = 'ri-menu-unfold-line';
        }
        
        const mBtn = document.getElementById('mobile-menu-btn');
        if (mBtn) mBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
        
        // Update theme button in sidebar
        this.updateThemeButton();
    },

    async checkAuth() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                this.user = await res.json();
            } else {
                this.user = null;
            }
        } catch (e) {
            this.user = null;
        }
    },

    showApp() {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        
        // Ensure sidebar is closed on mobile after login
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');

        this.navigate(this.currentView);
        this.fetchData();
    },

    showAuth() {
        document.getElementById('app').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    },

    toggleAuthMode(mode) {
        const loginForm = document.getElementById('login-form');
        const regForm = document.getElementById('register-form');
        const subtitle = document.getElementById('auth-subtitle');

        if (mode === 'register') {
            loginForm.style.display = 'none';
            regForm.style.display = 'block';
            subtitle.innerText = 'Crie sua conta em segundos';
        } else {
            loginForm.style.display = 'block';
            regForm.style.display = 'none';
            subtitle.innerText = 'Entre para organizar seus estudos';
        }
    },

    async handleLogin() {
        const login = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password: pass })
            });
            const data = await res.json();
            if (res.ok) {
                this.user = data;
                this.showApp();
            } else {
                alert(data.error || 'Erro ao entrar');
            }
        } catch (e) {
            alert('Falha na conexão com o servidor');
        }
    },

    async handleRegister() {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-pass').value;

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                this.user = data;
                this.showApp();
            } else {
                alert(data.error || 'Erro ao criar conta');
            }
        } catch (e) {
            alert('Erro ao processar registro');
        }
    },

    async logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        this.user = null;
        this.showAuth();
    },

    togglePasswordVisibility(inputId, iconEl) {
        const input = document.getElementById(inputId);
        if (input.type === 'password') {
            input.type = 'text';
            iconEl.className = 'ri-eye-line toggle-pass';
        } else {
            input.type = 'password';
            iconEl.className = 'ri-eye-off-line toggle-pass';
        }
    },

    openMyAccount() {
        if (!this.user) return;

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');
        }

        const mc = document.getElementById('modal-container');
        document.getElementById('modal-title').innerText = 'Minha Conta';
        document.getElementById('modal-body').innerHTML = `
            <div style="text-align:center; padding: 20px 0;">
                <div style="width:80px; height:80px; border-radius:50%; background:var(--bg-hover); display:flex; align-items:center; justify-content:center; margin: 0 auto 16px;">
                    <i class="ri-user-line" style="font-size:3rem; color:var(--accent-color)"></i>
                </div>
                <h3>${this.user.name}</h3>
                <p style="color:var(--text-secondary); margin-bottom:24px;">${this.user.email}</p>
                
                <div style="border-top: 1px solid var(--border-color); padding-top:20px; text-align:left;">
                    <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:12px;">Deseja fazer algo?</p>
                    <button class="btn-primary" style="width:100%; background:var(--bg-hover); color:var(--text-primary); margin-bottom:10px;" onclick="alert('Funcionalidade de alterar perfil em breve!')">Editar Perfil</button>
                    <button class="btn-primary" style="width:100%; background:var(--danger-color)22; color:var(--danger-color);" onclick="appState.logout(); appState.closeModal();">Sair da Conta</button>
                </div>
            </div>
        `;
        mc.classList.remove('hidden');
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const icon = document.getElementById('toggle-icon');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (window.innerWidth <= 768) {
            const isOpen = sidebar.classList.toggle('mobile-open');
            if (overlay) overlay.classList.toggle('active', isOpen);
            return;
        }

        const collapsed = sidebar.classList.toggle('collapsed');
        if (icon) icon.className = collapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line';
        localStorage.setItem('sidebarCollapsed', collapsed);
    },

    updateThemeButton() {
        const themeLabel = document.getElementById('theme-label');
        const themeIcon = document.querySelector('li[data-label="Tema"] i');
        
        if (themeLabel && themeIcon) {
            // Atualiza o texto do botão
            const themeText = this.theme === 'light' ? 'Tema: Claro' : 
                             this.theme === 'comfort' ? 'Tema: Conforto Visual' : 'Tema: Escuro';
            themeLabel.innerText = themeText;
            
            // Atualiza o ícone do botão
            if (this.theme === 'dark') themeIcon.className = 'ri-moon-line';
            else if (this.theme === 'comfort') themeIcon.className = 'ri-eye-line';
            else themeIcon.className = 'ri-sun-line';
        }
    },

    toggleTheme() {
        const cycle = ['light', 'comfort', 'dark'];
        const idx = cycle.indexOf(this.theme);
        this.theme = cycle[(idx + 1) % cycle.length];
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.updateThemeButton();
    },

    navigate(view) {
        this.currentView = view;
        document.querySelectorAll('.nav-links li').forEach(li => {
            li.classList.toggle('active', li.dataset.view === view);
        });
        
        // Ensure sidebar is closed on mobile after navigation
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (window.innerWidth <= 768) {
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');
        }

        this.renderView();
    },

    async fetchData() {
        try {
            const [subjects, activities, schedules, absences, grades] = await Promise.all([
                fetch('/api/subjects').then(r => r.json()),
                fetch('/api/activities').then(r => r.json()),
                fetch('/api/schedules').then(r => r.json()),
                fetch('/api/absences').then(r => r.json()),
                fetch('/api/grades').then(r => r.json())
            ]);
            this.data.subjects = subjects;
            this.data.activities = activities;
            this.data.schedules = schedules;
            this.data.absences = absences;
            this.data.grades = grades;
            this.renderView();
        } catch (e) {
            console.error("Erro ao buscar dados", e);
        }
    },

    getSubject(id) {
        return this.data.subjects.find(s => s.id === parseInt(id)) || { name: 'Geral', color: '#999' };
    },

    // ─── RENDER VIEWS ──────────────────────────────────────────────────────────

    renderView() {
        const container = document.getElementById('view-container');
        if (!container) return;
        if (this.currentView === 'dashboard') this.renderDashboard(container);
        else if (this.currentView === 'subjects') this.renderSubjects(container);
        else if (this.currentView === 'activities') this.renderActivities(container);
        else if (this.currentView === 'schedules') this.renderSchedules(container);
        else if (this.currentView === 'calendar') this.renderCalendar(container);
    },

    renderDashboard(container) {
        const totalActs = this.data.activities.length;
        const completedActs = this.data.activities.filter(a => a.status === 'completed').length;
        const subjectDetails = this.data.subjects.map(sub => {
            const subTotalTasks = this.data.activities.filter(a => a.subject_id === sub.id).length;
            const subCompTasks = this.data.activities.filter(a => a.subject_id === sub.id && a.status === 'completed').length;
            const subAbsences = this.data.absences.filter(a => a.subject_id === sub.id).length;
            const subGrades = this.data.grades.filter(g => g.subject_id === sub.id);
            const totalObtained = subGrades.reduce((s, g) => s + g.value * g.weight, 0);
            const totalWeight = subGrades.reduce((s, g) => s + g.weight, 0);
            const avg = totalWeight > 0 ? (totalObtained / totalWeight).toFixed(1) : '-';
            const absWarning = sub.max_absences > 0 && subAbsences >= sub.max_absences;
            const gradeWarning = avg !== '-' && parseFloat(avg) < sub.target_grade;
            return `
            <div class="card" style="border-left: 4px solid ${sub.color}; cursor:pointer;" onclick="appState.openNotes('subject', ${sub.id})">
                <div class="flex-between" style="margin-bottom:10px">
                    <h4>${sub.name}</h4>
                    <span style="font-size:0.75rem; color:var(--text-secondary)">Média: <strong style="color:${gradeWarning?'var(--danger-color)':'inherit'}">${avg}</strong>/${sub.target_grade}</span>
                </div>
                <div style="font-size:0.85rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:8px">
                    <div class="flex-between" title="Concluídas / Total">
                        <span><i class="ri-checkbox-circle-line"></i> Atividades</span>
                        <strong>${subCompTasks} / ${subTotalTasks}</strong>
                    </div>
                    <div class="flex-between">
                        <span><i class="ri-user-unfollow-line"></i> Faltas</span>
                        <strong style="color:${absWarning?'var(--danger-color)':'inherit'}">${subAbsences} / ${sub.max_absences}</strong>
                    </div>
                </div>
                ${sub.notes ? `<p style="margin-top:10px; font-size:0.8rem; color:var(--text-secondary); border-top:1px solid var(--border-color); padding-top:8px; white-space: pre-wrap; max-height:60px; overflow:hidden">${sub.notes}</p>` : ''}
            </div>`;
        }).join('');

        container.innerHTML = `
            <h1 class="view-title"><i class="ri-dashboard-line"></i> Dashboard</h1>
            <p style="color:var(--text-secondary); margin-bottom: 24px;">Cenário atual do seu semestre.</p>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                <div class="card" style="text-align:center; padding: 24px;">
                    <i class="ri-book-mark-line" style="font-size:2rem; color:var(--text-secondary);"></i>
                    <h3 style="margin-top:8px">Disciplinas</h3>
                    <h2 style="font-size: 2.5rem; margin-top: 8px;">${this.data.subjects.length}</h2>
                </div>
                <div class="card" style="text-align:center; padding: 24px;">
                    <i class="ri-calendar-todo-line" style="font-size:2rem; color:var(--text-secondary);"></i>
                    <h3 style="margin-top:8px">Atividades</h3>
                    <h2 style="font-size: 2.5rem; margin-top: 8px; color:var(--accent-color)">${completedActs}<span style="font-size:1.5rem; color:var(--text-secondary)">/${totalActs}</span></h2>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px">Concluídas</p>
                </div>
                <div class="card" style="text-align:center; padding: 24px;">
                    <i class="ri-user-unfollow-line" style="font-size:2rem; color:var(--text-secondary);"></i>
                    <h3 style="margin-top:8px">Faltas Totais</h3>
                    <h2 style="font-size: 2.5rem; margin-top: 8px; color:var(--danger-color)">${this.data.absences.length}</h2>
                </div>
            </div>
            <h3 style="margin-bottom:16px; font-weight:600">Minhas Disciplinas <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:400">(clique para ver anotações)</span></h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;">
                ${subjectDetails || '<p style="color:var(--text-secondary)">Adicione disciplinas para ver o detalhamento aqui.</p>'}
            </div>`;
    },

    renderSubjects(container) {
        container.innerHTML = `
            <div class="flex-between">
                <h1 class="view-title"><i class="ri-book-mark-line"></i> Disciplinas</h1>
                <button class="btn-primary" onclick="appState.openModal('subject')"><i class="ri-add-line"></i> Nova</button>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                ${this.data.subjects.map(sub => {
                    const subAbsences = this.data.absences.filter(a => a.subject_id === sub.id).length;
                    const subGrades = this.data.grades.filter(g => g.subject_id === sub.id);
                    const totalObtained = subGrades.reduce((s, g) => s + g.value * g.weight, 0);
                    const totalWeight = subGrades.reduce((s, g) => s + g.weight, 0);
                    const avg = totalWeight > 0 ? (totalObtained / totalWeight).toFixed(1) : '-';
                    const absWarning = sub.max_absences > 0 && subAbsences >= sub.max_absences;
                    const gradeWarning = avg !== '-' && parseFloat(avg) < sub.target_grade;
                    return `
                    <div class="card">
                        <div class="flex-between" style="margin-bottom: 12px;">
                            <h3><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${sub.color};margin-right:8px;"></span>${sub.name}</h3>
                            <button style="background:none; border:none; cursor:pointer; color:var(--text-secondary); font-size:1rem;" onclick="appState.deleteItem('subjects', ${sub.id})" title="Excluir"><i class="ri-delete-bin-line"></i></button>
                        </div>
                        <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom: 12px; display:flex; justify-content:space-between;">
                            <span>Faltas: <strong style="color:${absWarning?'var(--danger-color)':'inherit'}">${subAbsences}/${sub.max_absences}</strong></span>
                            <span>Média: <strong style="color:${gradeWarning?'var(--danger-color)':'inherit'}">${avg}</strong> / ${sub.target_grade}</span>
                        </div>
                        <!-- Provas List -->
                        <div style="margin-bottom: 12px; font-size: 0.8rem; background: var(--bg-hover); padding: 8px; border-radius: var(--radius-md); max-height:120px; overflow-y:auto;">
                            ${subGrades.length === 0 ? '<span style="color:var(--text-secondary)">Sem provas registradas.</span>' : subGrades.map(g => `
                                <div class="flex-between" style="margin-bottom:4px;">
                                    <span>${g.description}</span>
                                    <div style="display:flex; gap: 8px; align-items:center">
                                        <span><strong>${g.value.toFixed(1)}</strong>/${g.max_value.toFixed(1)}</span>
                                        <i class="ri-close-line" style="cursor:pointer;color:var(--danger-color)" onclick="appState.deleteItem('grades', ${g.id})"></i>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="display:flex; gap: 8px;">
                            <button class="btn-primary" style="flex:1; padding:6px; font-size:0.8rem; background:var(--bg-hover); color:var(--text-primary)" onclick="appState.openModal('absence', ${sub.id})"><i class="ri-calendar-close-line"></i> Falta</button>
                            <button class="btn-primary" style="flex:1; padding:6px; font-size:0.8rem; background:var(--bg-hover); color:var(--text-primary)" onclick="appState.openModal('grade', ${sub.id})"><i class="ri-file-star-line"></i> Prova</button>
                            <button class="btn-primary" style="flex:1; padding:6px; font-size:0.8rem; background:var(--bg-hover); color:var(--text-primary)" onclick="appState.openNotes('subject', ${sub.id})"><i class="ri-sticky-note-line"></i> Notas</button>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
    },

    renderActivities(container) {
        const pending = this.data.activities.filter(a => a.status === 'pending');
        const done = this.data.activities.filter(a => a.status === 'completed');
        const renderAct = (act) => {
            const sub = this.getSubject(act.subject_id);
            return `
            <div class="card" style="opacity: ${act.status === 'completed' ? 0.65 : 1}; transition: opacity 0.3s;">
                <div class="flex-between">
                    <div style="display:flex; align-items:center; gap: 12px; flex:1">
                        <input type="checkbox" style="width:18px;height:18px;accent-color:var(--accent-color);cursor:pointer;" ${act.status === 'completed' ? 'checked' : ''} onchange="appState.toggleActivity(${act.id}, this.checked)">
                        <div style="flex:1">
                            <h3 style="text-decoration: ${act.status === 'completed' ? 'line-through' : 'none'}; font-size:0.95rem">${act.title}</h3>
                            <p style="font-size:0.8rem;color:var(--text-secondary); margin-top:2px;">
                                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sub.color};margin-right:4px;"></span>${sub.name}
                                ${act.due_date ? `&nbsp;·&nbsp;<i class="ri-calendar-line"></i> ${act.due_date}` : ''}
                            </p>
                            ${act.notes ? `<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:6px; white-space:pre-wrap; overflow:hidden; max-height:40px; text-overflow:ellipsis;">${act.notes}</p>` : ''}
                        </div>
                    </div>
                    <div style="display:flex; gap:6px; margin-left:12px;">
                        <button style="background:none; border:none; cursor:pointer; color:var(--accent-color); font-size:1rem;" onclick="appState.openModal('editActivity', null, ${act.id})" title="Editar"><i class="ri-edit-line"></i></button>
                        <button style="background:none; border:none; cursor:pointer; color:var(--text-secondary); font-size:1rem;" onclick="appState.openNotes('activity', ${act.id})" title="Anotações"><i class="ri-sticky-note-line"></i></button>
                        <button style="background:none; border:none; cursor:pointer; color:var(--danger-color); font-size:1rem;" onclick="appState.deleteItem('activities', ${act.id})" title="Excluir"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </div>
            </div>`;
        };

        container.innerHTML = `
            <div class="flex-between">
                <h1 class="view-title"><i class="ri-calendar-todo-line"></i> Atividades e Trabalhos</h1>
                <button class="btn-primary" onclick="appState.openModal('activity')"><i class="ri-add-line"></i> Nova</button>
            </div>
            ${pending.length > 0 ? `<h4 style="color:var(--text-secondary); margin-bottom:12px; font-weight:500">Pendentes (${pending.length})</h4>` : ''}
            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:24px;">
                ${pending.sort((a,b) => new Date(a.due_date||'9999') - new Date(b.due_date||'9999')).map(renderAct).join('')}
                ${pending.length === 0 ? '<p style="color:var(--text-secondary)">Nenhuma atividade pendente 🎉</p>' : ''}
            </div>
            ${done.length > 0 ? `
            <h4 style="color:var(--text-secondary); margin-bottom:12px; font-weight:500">Concluídas (${done.length})</h4>
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${done.map(renderAct).join('')}
            </div>` : ''}`;
    },

    renderSchedules(container) {
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const daysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        const columnsHtml = days.map((dayName, i) => {
            const daySchedules = this.data.schedules
                .filter(s => s.day_of_week === i)
                .sort((a, b) => a.start_time.localeCompare(b.start_time));
            
            const scheduleCards = daySchedules.map(sch => {
                const sub = this.getSubject(sch.subject_id);
                return `
                <div class="schedule-card" style="border-left-color: ${sub.color}">
                    <div class="flex-between" style="border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 12px;">
                        <strong style="font-size:1.15rem">${sch.title}</strong>
                        <button style="background:none; border:none; cursor:pointer; color:var(--danger-color); font-size:1.3rem; padding:0" onclick="appState.deleteItem('schedules', ${sch.id})" title="Remover"><i class="ri-close-circle-line"></i></button>
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                        <p style="font-size:1rem; color:${sub.color}; font-weight:700; margin-bottom:6px">${sub.name || 'Sem disciplina'}</p>
                        <p style="font-size:0.95rem; color:var(--text-secondary); display:flex; align-items:center; gap:6px;">
                            <i class="ri-time-line"></i> ${sch.start_time} – ${sch.end_time}
                        </p>
                        ${sch.location ? `<p style="font-size:0.95rem; color:var(--text-secondary); margin-top:4px; display:flex; align-items:center; gap:6px;"><i class="ri-map-pin-line"></i> ${sch.location}</p>` : ''}
                    </div>
                </div>`;
            }).join('');

            return `
            <div class="schedule-column">
                <h4>
                    <span class="day-short">${daysShort[i]}</span>
                    <span class="day-full">${dayName}</span>
                </h4>
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: ${scheduleCards ? 'flex-start' : 'center'};">
                    ${scheduleCards || '<p style="color:var(--text-secondary); text-align:center; font-size:1rem; opacity:0.5;">Sem aulas</p>'}
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
            <div class="flex-between" style="margin-bottom: 32px">
                <h1 class="view-title" style="margin-bottom:0"><i class="ri-time-line"></i> Meu Horário</h1>
                <button class="btn-primary" onclick="appState.openModal('schedule')"><i class="ri-add-line"></i> Nova Aula</button>
            </div>
            <div class="schedule-container">
                ${columnsHtml}
            </div>`;
    },

    renderCalendar(container) {
        // Usa o mês e ano armazenados no localStorage ou o atual
        const storedMonth = parseInt(localStorage.getItem('calendar_month'));
        const storedYear = parseInt(localStorage.getItem('calendar_year'));
        
        const year = isNaN(storedYear) ? new Date().getFullYear() : storedYear;
        const month = isNaN(storedMonth) ? new Date().getMonth() : storedMonth;
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthName = new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        // Verifica se é o mês atual para destacar o dia de hoje
        const today = new Date();
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

        let daysHtml = '';
        
        // Cria blocos para cada dia do mês (sem blocos vazios de alinhamento)
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const dayActivities = this.data.activities.filter(a => a.due_date === dateStr);
            const isToday = isCurrentMonth && d === today.getDate();
            const hasItems = dayActivities.length > 0;
            
            // Determina o tipo do dia da semana
            const dayOfWeek = new Date(year, month, d).getDay();
            const dayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const dayLabel = dayLabels[dayOfWeek];
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            const actsHtml = dayActivities.slice(0, 3).map(act => {
                const sub = this.getSubject(act.subject_id);
                const done = act.status === 'completed';
                return `<div class="calendar-day-activity" style="background:${sub.color}22; color:${sub.color}; text-decoration:${done?'line-through':'none'}; border-left:2px solid ${sub.color}" title="${act.title}">${act.title}</div>`;
            }).join('');
            const moreHtml = dayActivities.length > 3 ? `<div class="calendar-day-more">+${dayActivities.length - 3} mais</div>` : '';

            daysHtml += `
                <div class="calendar-day ${isToday ? 'today' : ''}" onclick="${hasItems ? `appState.openDayDetail('${dateStr}')` : ''}">
                    <div class="calendar-day-num" style="${hasItems ? 'color:var(--accent-color)' : ''}">${d}</div>
                    <div class="calendar-day-label" style="${isWeekend ? 'color:var(--danger-color)' : ''}">${dayLabel}</div>
                    <div class="calendar-day-content">
                        ${actsHtml}
                        ${moreHtml}
                    </div>
                </div>`;
        }

        container.innerHTML = `
            <div class="flex-between" style="margin-bottom:20px">
                <h1 class="view-title" style="margin-bottom:0"><i class="ri-calendar-event-line"></i> Calendário</h1>
                <div style="display:flex; align-items:center; gap:12px;">
                    <h3 style="text-transform: capitalize; color:var(--text-secondary); font-weight:600; font-size:1.2rem">${monthName}</h3>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-primary" style="padding:6px 12px; font-size:0.9rem;" onclick="appState.changeMonth(-1)"><i class="ri-arrow-left-s-line"></i></button>
                        <button class="btn-primary" style="padding:6px 12px; font-size:0.9rem;" onclick="appState.changeMonth(1)"><i class="ri-arrow-right-s-line"></i></button>
                    </div>
                </div>
            </div>
            <div class="calendar-wrapper">
                <div class="calendar-grid">
                    ${daysHtml}
                </div>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:20px; text-align:center;"><i class="ri-information-line"></i> Clique em um dia com atividades para ver os detalhes.</p>
        `;
    },

    changeMonth(offset) {
        // Obtém o mês e ano atuais (do localStorage ou do sistema)
        let currentMonth = parseInt(localStorage.getItem('calendar_month') || new Date().getMonth());
        let currentYear = parseInt(localStorage.getItem('calendar_year') || new Date().getFullYear());
        
        currentMonth += offset;
        
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        
        // Atualiza o localStorage
        localStorage.setItem('calendar_month', currentMonth);
        localStorage.setItem('calendar_year', currentYear);
        
        // Renderiza o calendário com o novo mês/ano
        this.renderCalendar(document.getElementById('view-container'));
    },

    resetCalendar() {
        localStorage.removeItem('calendar_month');
        localStorage.removeItem('calendar_year');
        this.renderCalendar(document.getElementById('view-container'));
    },

    // ─── MODALS ────────────────────────────────────────────────────────────────

    openDayDetail(dateStr) {
        const dayActivities = this.data.activities.filter(a => a.due_date === dateStr);
        if (dayActivities.length === 0) return;

        const date = new Date(dateStr + 'T12:00:00');
        const formatted = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

        const typeLabel = { general: 'Geral', assignment: 'Trabalho', exam: 'Prova' };
        const typeIcon  = { general: 'ri-task-line', assignment: 'ri-folder-line', exam: 'ri-file-star-line' };

        const itemsHtml = dayActivities.map(act => {
            const sub = this.getSubject(act.subject_id);
            const done = act.status === 'completed';
            const subGrades = this.data.grades.filter(g => g.subject_id === parseInt(act.subject_id));
            const gradeInfo = act.activity_type === 'exam' && subGrades.length > 0
                ? `<div style="font-size:0.8rem; margin-top:6px; padding:6px 8px; background:var(--bg-hover); border-radius:var(--radius-md); color:var(--text-secondary)">
                    <i class="ri-file-star-line"></i> Provas de ${sub.name}:
                    ${subGrades.map(g => `<span style="font-weight:600; color:var(--text-primary)"> ${g.description}: ${g.value}/${g.max_value}</span>`).join(' |')}
                  </div>` : '';
            return `
            <div style="padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-secondary); margin-bottom: 12px;">
                <div class="flex-between" style="margin-bottom: 8px;">
                    <div style="display:flex; align-items:flex-start; gap:10px;">
                        <span style="width:10px;height:10px;border-radius:50%;background:${sub.color};display:inline-block;flex-shrink:0;margin-top:5px"></span>
                        <div>
                            <strong style="font-size:0.95rem; text-decoration:${done?'line-through':'none'}; color:${done?'var(--text-secondary)':'var(--text-primary)'}">${act.title}</strong>
                            <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">${sub.name} &nbsp;·&nbsp; <i class="${typeIcon[act.activity_type] || 'ri-task-line'}"></i> ${typeLabel[act.activity_type] || 'Geral'}</p>
                        </div>
                    </div>
                    <span style="font-size:0.75rem; padding:3px 8px; border-radius:12px; background:${done?'#22c55e22':'#f9731622'}; color:${done?'#16a34a':'#c2410c'}; font-weight:600; white-space:nowrap; flex-shrink:0">${done ? '✓ Concluída' : 'Pendente'}</span>
                </div>
                ${act.description ? `<p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:6px; padding-left:20px;">${act.description}</p>` : ''}
                ${act.notes ? `<p style="font-size:0.8rem; color:var(--text-secondary); padding: 8px; background:var(--bg-hover); border-radius:var(--radius-md); white-space:pre-wrap; margin-top:4px;">${act.notes}</p>` : ''}
                ${gradeInfo}
                <div style="display:flex; gap:8px; margin-top:10px; padding-left:20px;">
                    <button onclick="appState.closeModal(); appState.openModal('editActivity', null, ${act.id})" style="font-size:0.8rem; padding:4px 10px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:none; color:var(--text-primary); cursor:pointer;"><i class="ri-edit-line"></i> Editar</button>
                    <button onclick="appState.toggleActivity(${act.id}, ${!done}); appState.closeModal(); appState.navigate('calendar');" style="font-size:0.8rem; padding:4px 10px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:none; color:${done?'var(--text-secondary)':'var(--accent-color)'}; cursor:pointer;">
                        <i class="${done ? 'ri-refresh-line' : 'ri-checkbox-circle-line'}"></i> ${done ? 'Reabrir' : 'Concluir'}
                    </button>
                </div>
            </div>`;
        }).join('');

        const mc = document.getElementById('modal-container');
        document.getElementById('modal-title').innerHTML = `<i class="ri-calendar-event-line"></i> ${formatted}`;
        document.getElementById('modal-body').innerHTML = `
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">${dayActivities.length} item(s) para este dia</p>
            ${itemsHtml}`;
        mc.classList.remove('hidden');
    },

    openModal(type, extraId = null, editId = null) {
        const mc = document.getElementById('modal-container');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        let subjectOptions = `<option value="">Sem disciplina</option>`;
        this.data.subjects.forEach(s => { subjectOptions += `<option value="${s.id}">${s.name}</option>`; });

        if (type === 'subject') {
            title.innerText = 'Nova Disciplina';
            body.innerHTML = `
                <form onsubmit="event.preventDefault(); appState.saveItem('subjects');">
                    <div class="form-group"><label>Nome</label><input type="text" id="m-name" required></div>
                    <div class="form-group"><label>Máx. Faltas</label><input type="number" id="m-abs" value="0"></div>
                    <div class="form-group"><label>Média Alvo</label><input type="number" step="0.1" id="m-grade" value="6.0"></div>
                    <div class="form-group"><label>Cor</label><input type="color" id="m-color" value="#2383e2" style="height:40px;padding:0;cursor:pointer;width:100%"></div>
                    <button type="submit" class="btn-primary" style="width:100%; margin-top:8px;">Salvar</button>
                </form>`;

        } else if (type === 'activity') {
            title.innerText = 'Nova Atividade';
            body.innerHTML = `
                <form onsubmit="event.preventDefault(); appState.saveItem('activities');">
                    <div class="form-group"><label>Título</label><input type="text" id="m-title" required></div>
                    <div class="form-group"><label>Disciplina</label><select id="m-sub">${subjectOptions}</select></div>
                    <div class="form-group"><label>Data de Entrega</label><input type="date" id="m-date"></div>
                    <div class="form-group"><label>Tipo</label>
                        <select id="m-type">
                            <option value="general">Geral</option>
                            <option value="assignment">Trabalho</option>
                            <option value="exam">Prova</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Descrição</label><textarea id="m-desc" rows="3" style="resize:vertical"></textarea></div>
                    <button type="submit" class="btn-primary" style="width:100%; margin-top:8px;">Salvar</button>
                </form>`;

        } else if (type === 'editActivity') {
            const act = this.data.activities.find(a => a.id === editId);
            if (!act) return;
            title.innerText = 'Editar Atividade';
            body.innerHTML = `
                <form onsubmit="event.preventDefault(); appState.updateActivity(${editId});">
                    <div class="form-group"><label>Título</label><input type="text" id="m-title" value="${act.title}" required></div>
                    <div class="form-group"><label>Disciplina</label>
                        <select id="m-sub">
                            ${subjectOptions.replace(`value="${act.subject_id}"`, `value="${act.subject_id}" selected`)}
                        </select>
                    </div>
                    <div class="form-group"><label>Data de Entrega</label><input type="date" id="m-date" value="${act.due_date || ''}"></div>
                    <div class="form-group"><label>Tipo</label>
                        <select id="m-type">
                            <option value="general" ${act.activity_type==='general'?'selected':''}>Geral</option>
                            <option value="assignment" ${act.activity_type==='assignment'?'selected':''}>Trabalho</option>
                            <option value="exam" ${act.activity_type==='exam'?'selected':''}>Prova</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Descrição</label><textarea id="m-desc" rows="3" style="resize:vertical">${act.description || ''}</textarea></div>
                    <button type="submit" class="btn-primary" style="width:100%; margin-top:8px;">Salvar Alterações</button>
                </form>`;

        } else if (type === 'schedule') {
            title.innerText = 'Novo Horário';
            body.innerHTML = `
                <form onsubmit="event.preventDefault(); appState.saveItem('schedules');">
                    <div class="form-group"><label>Nome da Aula</label><input type="text" id="m-title" required></div>
                    <div class="form-group"><label>Disciplina</label><select id="m-sub">${subjectOptions}</select></div>
                    <div class="form-group"><label>Dia da Semana</label>
                        <select id="m-day">
                            <option value="1">Segunda-feira</option><option value="2">Terça-feira</option>
                            <option value="3">Quarta-feira</option><option value="4">Quinta-feira</option>
                            <option value="5">Sexta-feira</option><option value="6">Sábado</option>
                            <option value="0">Domingo</option>
                        </select>
                    </div>
                    <div style="display:flex; gap:16px">
                        <div class="form-group" style="flex:1"><label>Início</label><input type="time" id="m-start" required></div>
                        <div class="form-group" style="flex:1"><label>Fim</label><input type="time" id="m-end" required></div>
                    </div>
                    <div class="form-group"><label>Local (Sala)</label><input type="text" id="m-loc"></div>
                    <button type="submit" class="btn-primary" style="width:100%; margin-top:8px;">Salvar</button>
                </form>`;

        } else if (type === 'absence') {
            const sub = this.getSubject(extraId);
            title.innerText = 'Registrar Falta';
            body.innerHTML = `
                <form onsubmit="event.preventDefault(); appState.saveItem('absences', ${extraId});">
                    <p style="margin-bottom:12px; font-size:0.9rem">Registrando falta para: <strong>${sub.name}</strong></p>
                    <div class="form-group"><label>Data</label><input type="date" id="m-date" required></div>
                    <button type="submit" class="btn-primary" style="width:100%; margin-top:8px;">Salvar Falta</button>
                </form>`;
            setTimeout(() => { const el = document.getElementById('m-date'); if(el) el.valueAsDate = new Date(); }, 10);

        } else if (type === 'grade') {
            const sub = this.getSubject(extraId);
            title.innerText = 'Registrar Prova';
            body.innerHTML = `
                <form onsubmit="event.preventDefault(); appState.saveItem('grades', ${extraId});">
                    <p style="margin-bottom:12px; font-size:0.9rem">Registrando prova para: <strong>${sub.name}</strong></p>
                    <div class="form-group"><label>Nome da Avaliação (Ex: P1, Trabalho Final)</label><input type="text" id="m-desc" required placeholder="Ex: P1"></div>
                    <div style="display:flex; gap:16px">
                        <div class="form-group" style="flex:1"><label>Nota Obtida</label><input type="number" step="0.1" min="0" id="m-val" required placeholder="Ex: 7.5"></div>
                        <div class="form-group" style="flex:1"><label>Nota Máxima</label><input type="number" step="0.1" min="0" id="m-max" value="10" required></div>
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%; margin-top:8px;">Salvar Prova</button>
                </form>`;
        }

        mc.classList.remove('hidden');
    },

    async openNotes(parentType, parentId) {
        const mc = document.getElementById('modal-container');
        const titleEl = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        let parentName = '';
        if (parentType === 'subject') {
            const s = this.data.subjects.find(s => s.id === parentId);
            parentName = s ? s.name : '';
        } else {
            const a = this.data.activities.find(a => a.id === parentId);
            parentName = a ? a.title : '';
        }

        // Fetch notes for this parent
        const res = await fetch(`/api/notes?parent_type=${parentType}&parent_id=${parentId}`);
        const notes = await res.json();

        titleEl.innerHTML = `<i class="ri-sticky-note-line"></i> Anotações — ${parentName}`;
        body.innerHTML = this._renderNotesList(notes, parentType, parentId);
        mc.classList.remove('hidden');
    },

    _renderNotesList(notes, parentType, parentId) {
        const noteCards = notes.length === 0
            ? `<p style="color:var(--text-secondary); text-align:center; padding:24px 0;">Nenhuma anotação ainda.<br>Clique em "Nova Anotação" para começar.</p>`
            : notes.map(n => `
                <div style="border:1px solid var(--border-color); border-radius:var(--radius-md); padding:12px; margin-bottom:10px; background:var(--bg-secondary); cursor:pointer" onclick="appState.openNoteEditor(${n.id}, '${parentType}', ${parentId})">
                    <div class="flex-between">
                        <strong style="font-size:0.95rem">${n.title}</strong>
                        <div style="display:flex; gap:8px; align-items:center">
                            <span style="font-size:0.75rem; color:var(--text-secondary)">${n.created_at || ''}</span>
                            <i class="ri-delete-bin-line" style="color:var(--danger-color); cursor:pointer; font-size:1rem" onclick="event.stopPropagation(); appState.deleteNote(${n.id}, '${parentType}', ${parentId})"></i>
                        </div>
                    </div>
                    ${n.content ? `<p style="font-size:0.82rem; color:var(--text-secondary); margin-top:6px; max-height:40px; overflow:hidden; white-space:pre-wrap;">${n.content}</p>` : ''}
                </div>
            `).join('');

        return `
            <div style="margin-bottom:14px;">
                <button class="btn-primary" style="width:100%;" onclick="appState.openNoteEditor(null, '${parentType}', ${parentId})">
                    <i class="ri-add-line"></i> Nova Anotação
                </button>
            </div>
            ${noteCards}`;
    },

    async openNoteEditor(noteId, parentType, parentId) {
        const mc = document.getElementById('modal-container');
        const titleEl = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        let existingNote = null;
        if (noteId) {
            const res = await fetch(`/api/notes?parent_type=${parentType}&parent_id=${parentId}`);
            const notes = await res.json();
            existingNote = notes.find(n => n.id === noteId);
        }

        titleEl.innerHTML = existingNote
            ? `<i class="ri-edit-line"></i> Editar Anotação`
            : `<i class="ri-plus-line"></i> Nova Anotação`;

        body.innerHTML = `
            <div style="margin-bottom: 10px">
                <button style="background:none; border:none; color:var(--accent-color); cursor:pointer; font-size:0.85rem; padding:0" onclick="appState.openNotes('${parentType}', ${parentId})">
                    <i class="ri-arrow-left-line"></i> Voltar para lista
                </button>
            </div>
            <div class="form-group">
                <label>Título da Anotação</label>
                <input type="text" id="note-title" value="${existingNote ? existingNote.title.replace(/"/g, '&quot;') : ''}" placeholder="Ex: Resumo Cap. 3" style="font-size:1rem; font-weight:500">
            </div>
            <div class="form-group">
                <label>Conteúdo</label>
                <textarea id="note-content" rows="12" placeholder="Escreva aqui seus resumos, links, fórmulas, anotações de aula..." style="width:100%; resize:vertical; font-family:inherit; font-size:0.9rem; padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-secondary); color:var(--text-primary); outline:none; line-height:1.7">${existingNote ? existingNote.content : ''}</textarea>
            </div>
            <button class="btn-primary" style="width:100%; margin-top:4px" onclick="appState.saveNote(${noteId || 'null'}, '${parentType}', ${parentId})">
                <i class="ri-save-line"></i> Salvar Anotação
            </button>`;

        mc.classList.remove('hidden');
    },

    async saveNote(noteId, parentType, parentId) {
        const title = document.getElementById('note-title').value.trim() || 'Sem título';
        const content = document.getElementById('note-content').value;

        if (noteId) {
            await fetch(`/api/notes/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
        } else {
            await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, parent_type: parentType, parent_id: parentId })
            });
        }
        // Go back to the list view
        this.openNotes(parentType, parentId);
    },

    async deleteNote(noteId, parentType, parentId) {
        if (confirm('Excluir esta anotação?')) {
            await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
            this.openNotes(parentType, parentId);
        }
    },

    closeModal() {
        document.getElementById('modal-container').classList.add('hidden');
    },

    // ─── SAVE / UPDATE ─────────────────────────────────────────────────────────

    async saveItem(endpoint, extraId = null) {
        let data = {};
        if (endpoint === 'subjects') {
            data = {
                name: document.getElementById('m-name').value,
                max_absences: parseInt(document.getElementById('m-abs').value || 0),
                target_grade: parseFloat(document.getElementById('m-grade').value || 6),
                color: document.getElementById('m-color').value
            };
        } else if (endpoint === 'activities') {
            data = {
                title: document.getElementById('m-title').value,
                subject_id: document.getElementById('m-sub').value || null,
                due_date: document.getElementById('m-date').value || null,
                activity_type: document.getElementById('m-type').value,
                description: document.getElementById('m-desc').value
            };
        } else if (endpoint === 'schedules') {
            data = {
                title: document.getElementById('m-title').value,
                subject_id: document.getElementById('m-sub').value || null,
                day_of_week: parseInt(document.getElementById('m-day').value),
                start_time: document.getElementById('m-start').value,
                end_time: document.getElementById('m-end').value,
                location: document.getElementById('m-loc').value
            };
        } else if (endpoint === 'absences') {
            data = {
                subject_id: extraId,
                date: document.getElementById('m-date').value
            };
        } else if (endpoint === 'grades') {
            data = {
                subject_id: extraId,
                description: document.getElementById('m-desc').value,
                value: parseFloat(document.getElementById('m-val').value),
                max_value: parseFloat(document.getElementById('m-max').value)
            };
        }

        const res = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) { this.closeModal(); this.fetchData(); }
    },

    async updateActivity(id) {
        const data = {
            title: document.getElementById('m-title').value,
            subject_id: document.getElementById('m-sub').value || null,
            due_date: document.getElementById('m-date').value || null,
            activity_type: document.getElementById('m-type').value,
            description: document.getElementById('m-desc').value
        };
        const res = await fetch(`/api/activities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) { this.closeModal(); this.fetchData(); }
    },

    async saveNotes(endpoint, id) {
        const notes = document.getElementById('m-notes').value;
        const res = await fetch(`/api/${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes })
        });
        if (res.ok) { this.closeModal(); this.fetchData(); }
    },

    async deleteItem(endpoint, id) {
        if (confirm('Deseja confirmar a exclusão?')) {
            await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
            this.fetchData();
        }
    },

    async toggleActivity(id, isCompleted) {
        await fetch(`/api/activities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: isCompleted ? 'completed' : 'pending' })
        });
        this.fetchData();
    }
};

window.appState = appState;
window.onload = () => appState.init();
