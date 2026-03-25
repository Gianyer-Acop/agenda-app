# Deploy na Render

Este guia fornece instruções para fazer o deploy da aplicação Agenda de Faculdade na plataforma Render.

## Pré-requisitos

1. Conta na [Render](https://render.com/)
2. Conta no [GitHub](https://github.com/)
3. URL do banco de dados PostgreSQL do Neon.tech (já configurada no `.env`)

## Estrutura do Projeto

```
Agenda de Faculdade/
├── app.py              # Aplicação Flask principal
├── models.py           # Modelos de banco de dados
├── database.py         # Configuração do banco de dados
├── config.py           # Configurações da aplicação
├── Procfile            # Arquivo para deploy na Render
├── requirements.txt    # Dependências Python
├── .env               # Variáveis de ambiente (não commitado)
├── static/            # Arquivos estáticos (CSS, JS)
├── templates/         # Templates HTML
└── README.md          # Documentação principal
```

## Configuração no Render

### 1. Conectar ao GitHub

1. Acesse o [dashboard da Render](https://dashboard.render.com/)
2. Clique em "New" → "Web Service"
3. Conecte sua conta do GitHub
4. Selecione o repositório `agenda-app`

### 2. Configurar o Serviço Web

**Basic Information:**
- **Name:** `agenda-de-faculdade` (ou o nome que desejar)
- **Region:** `Oregon (us-west)` (ou a região mais próxima de você)

**Build & Deploy:**
- **Repository:** `Gianyer-Acop/agenda-app`
- **Branch:** `main` (ou a branch que desejar usar)
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python app.py`

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no Render:

```
DATABASE_URL=postgresql://username:password@ep-quiet-mode-123456.us-east-1.aws.neon.tech/agenda-app?sslmode=require
SECRET_KEY=sua_chave_secreta_aqui
FLASK_ENV=production
```

**Importante:**
- Substitua `DATABASE_URL` pela URL real do seu banco Neon.tech
- Substitua `SECRET_KEY` por uma chave secreta segura (gerada aleatoriamente)
- A URL do banco deve ser a mesma que está no seu `.env`

### 4. Configurações Adicionais

**Environment:** `Python 3.11` (ou versão mais recente compatível)

**Auto Deploy:** `Yes` (para deploy automático em cada push)

## Pós-Deploy

### 1. Primeiro Acesso

Após o deploy ser concluído:
1. Acesse a URL fornecida pelo Render
2. Crie sua conta de usuário
3. O banco de dados será criado automaticamente

### 2. Verificar Conexão com o Banco

Se houver problemas de conexão:
1. Verifique se a `DATABASE_URL` está correta
2. Confira se o banco Neon.tech está configurado corretamente
3. Verifique os logs no dashboard do Render

### 3. Monitoramento

- **Logs:** Acesse o dashboard do Render para ver logs de erro
- **Health Check:** A aplicação inclui endpoints de saúde
- **Performance:** Monitorar uso de recursos no dashboard

## Troubleshooting

### Erro de Conexão com Banco de Dados

```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) FATAL: password authentication failed for user "..."
```

**Solução:**
1. Verifique a URL do banco de dados no Neon.tech
2. Confira se o usuário e senha estão corretos
3. Atualize a variável de ambiente no Render

### Erro de Importação

```
ModuleNotFoundError: No module named '...'
```

**Solução:**
1. Verifique o `requirements.txt`
2. Confira se todas as dependências estão listadas
3. Atualize o arquivo se necessário

### Erro 500 no Primeiro Acesso

**Solução:**
1. Verifique os logs no Render
2. Confira se o banco de dados foi criado
3. Tente acessar novamente após alguns segundos

## Dicas de Performance

1. **Cache:** Considere adicionar cache para consultas frequentes
2. **Conexões:** Configure pool de conexões no SQLAlchemy
3. **Monitoramento:** Use as métricas do Render para otimizar

## Segurança

1. **SECRET_KEY:** Nunca compartilhe a chave secreta
2. **DATABASE_URL:** Mantenha a URL do banco segura
3. **HTTPS:** O Render fornece HTTPS gratuito
4. **Backups:** Configure backups no Neon.tech

## Suporte

Para suporte adicional:
1. Consulte os logs no dashboard do Render
2. Verifique a documentação da Render
3. Consulte a documentação do Neon.tech para banco de dados