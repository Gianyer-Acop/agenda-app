@echo off
echo 🚀 Iniciando Agenda de Faculdade com Neon.tech (PostgreSQL)...
echo.

REM Verifica se o Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Erro: Python nao esta instalado ou nao esta no PATH.
    echo Por favor, instale o Python 3.6 ou superior.
    pause
    exit /b 1
)

REM Verifica se o pip está disponível
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Erro: pip nao esta disponivel.
    echo Por favor, instale o pip.
    pause
    exit /b 1
)

echo 📦 Instalando dependencias...
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ Erro ao instalar dependencias.
    pause
    exit /b 1
)

echo.
echo 🔧 Configurando para usar Neon.tech (PostgreSQL online)...
echo.

REM Verifica se o arquivo .env existe
if not exist .env (
    echo ⚠️  Arquivo .env nao encontrado.
    echo Por favor, crie um arquivo .env com suas credenciais do Neon.tech.
    echo Use o arquivo .env.example como modelo.
    echo.
    echo Exemplo de conteudo para .env:
    echo NEON_DATABASE_URL=postgresql://usuario:senha@ep-nome.us-east-1.aws.neon.tech/banco?sslmode=require
    echo SECRET_KEY=sua_chave_secreta_aleatoria
    echo.
    pause
    exit /b 1
)

echo 🔍 Verificando configuracao do .env...
findstr /C:"NEON_DATABASE_URL=" .env >nul
if errorlevel 1 (
    echo ⚠️  NEON_DATABASE_URL nao esta configurado no .env
    echo Por favor, adicione a URL do seu banco Neon.tech no .env
    pause
    exit /b 1
)

findstr /C:"SECRET_KEY=" .env >nul
if errorlevel 1 (
    echo ⚠️  SECRET_KEY nao esta configurado no .env
    echo Por favor, adicione uma chave secreta no .env
    pause
    exit /b 1
)

echo.
echo 🌐 Iniciando servidor Flask com Neon.tech...
echo 📍 Acesse o site em: http://localhost:5000
echo.
echo 💡 Para parar o servidor, pressione Ctrl+C
echo.

REM Carrega as variáveis de ambiente do .env e inicia o servidor
set /p NEON_DATABASE_URL=<nul
set /p SECRET_KEY=<nul
for /f "tokens=1,* delims==" %%a in (.env) do (
    if "%%a"=="NEON_DATABASE_URL" set "NEON_DATABASE_URL=%%b"
    if "%%a"=="SECRET_KEY" set "SECRET_KEY=%%b"
)

python app.py

echo.
echo 📱 Servidor encerrado.
pause
