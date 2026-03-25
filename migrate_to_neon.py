#!/usr/bin/env python3
"""
Script para migrar dados do SQLite local para PostgreSQL no Neon.tech
"""

import os
import sqlite3
import psycopg2
from urllib.parse import urlparse
from datetime import datetime

def migrate_data():
    print("🚀 Iniciando migração de dados para Neon.tech...")
    
    # Verifica se está configurado para usar Neon.tech
    neon_url = os.environ.get('NEON_DATABASE_URL')
    if not neon_url:
        print("❌ URL do Neon.tech não configurada. Defina a variável NEON_DATABASE_URL.")
        print("Exemplo: export NEON_DATABASE_URL='postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/db?sslmode=require'")
        return False
    
    # Conecta ao SQLite (origem)
    sqlite_path = os.path.join(os.path.dirname(__file__), 'agenda.db')
    if not os.path.exists(sqlite_path):
        print(f"❌ Banco SQLite não encontrado em: {sqlite_path}")
        return False
    
    print(f"📦 Conectando ao SQLite: {sqlite_path}")
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_cursor = sqlite_conn.cursor()
    
    # Conecta ao PostgreSQL (destino)
    print("🌐 Conectando ao PostgreSQL (Neon.tech)...")
    try:
        # Parse da URL do PostgreSQL
        parsed = urlparse(neon_url)
        pg_conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path[1:],  # Remove a barra inicial
            sslmode='require'
        )
        pg_cursor = pg_conn.cursor()
    except Exception as e:
        print(f"❌ Falha ao conectar ao PostgreSQL: {e}")
        return False
    
    try:
        # Tabelas a migrar
        tables = ['users', 'subjects', 'activities', 'schedules', 'absences', 'grades', 'notes']
        
        for table in tables:
            print(f"🔄 Migrando tabela: {table}")
            
            # Obtém dados do SQLite
            sqlite_cursor.execute(f"SELECT * FROM {table}")
            rows = sqlite_cursor.fetchall()
            
            if not rows:
                print(f"  ⚠️  Tabela {table} vazia, pulando...")
                continue
            
            # Obtém nomes das colunas
            columns = [desc[0] for desc in sqlite_cursor.description]
            columns_str = ', '.join(columns)
            placeholders = ', '.join(['%s'] * len(columns))
            
            # Insere no PostgreSQL
            insert_query = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
            
            for row in rows:
                try:
                    pg_cursor.execute(insert_query, row)
                except psycopg2.IntegrityError:
                    pg_conn.rollback()  # Ignora duplicatas
                    continue
                except Exception as e:
                    print(f"    ❌ Erro ao inserir linha: {e}")
                    pg_conn.rollback()
                    continue
            
            pg_conn.commit()
            print(f"  ✅ {len(rows)} registros migrados para {table}")
        
        print("🎉 Migração concluída com sucesso!")
        print("💡 Agora você pode usar: export USE_NEON=true && python app.py")
        return True
        
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        pg_conn.rollback()
        return False
    
    finally:
        sqlite_conn.close()
        pg_conn.close()

if __name__ == '__main__':
    migrate_data()