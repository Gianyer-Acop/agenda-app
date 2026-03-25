#!/usr/bin/env python3
"""
Script para recriar o banco de dados com a estrutura correta.
Este script deve ser executado quando houver alterações nos modelos.
"""

import os
import sqlite3
from flask import Flask
from database import db
from models import User, Subject, Activity, Schedule, Absence, Grade, Note

def recreate_database():
    """Recria o banco de dados SQLite"""
    
    # Remove o banco de dados existente
    db_path = os.path.join(os.path.dirname(__file__), 'agenda.db')
    if os.path.exists(db_path):
        print(f"Removendo banco de dados existente: {db_path}")
        os.remove(db_path)
    
    # Cria uma nova instância Flask para inicializar o banco
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev-key-agenda-escolar-123'
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'agenda.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        print("Criando tabelas no banco de dados...")
        db.create_all()
        print("Banco de dados recriado com sucesso!")
        
        # Verifica se as tabelas foram criadas corretamente
        inspector = sqlite3.inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Tabelas criadas: {tables}")
        
        # Verifica as colunas da tabela activity
        columns = inspector.get_columns('activity')
        column_names = [col['name'] for col in columns]
        print(f"Colunas da tabela activity: {column_names}")
        
        if 'user_id' in column_names:
            print("✅ Coluna user_id encontrada na tabela activity")
        else:
            print("❌ Coluna user_id NÃO encontrada na tabela activity")

if __name__ == '__main__':
    recreate_database()