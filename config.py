"""
Configuração exclusiva para Neon.tech (PostgreSQL)
"""

import os
from urllib.parse import quote_plus

class NeonConfig:
    """Configuração para uso exclusivo do Neon.tech (PostgreSQL)"""
    
    # URL do banco de dados Neon.tech - obrigatória
    NEON_DATABASE_URL = os.environ.get('NEON_DATABASE_URL')
    
    if not NEON_DATABASE_URL:
        raise ValueError(
            "NEON_DATABASE_URL não configurada. "
            "Defina a variável de ambiente com a URL do seu banco Neon.tech. "
            "Exemplo: export NEON_DATABASE_URL='postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/db?sslmode=require'"
        )
    
    # URL já vem no formato correto do Neon.tech, sem necessidade de codificação
    SQLALCHEMY_DATABASE_URI = NEON_DATABASE_URL
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    # Chave secreta para sessões
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    if not SECRET_KEY:
        raise ValueError(
            "SECRET_KEY não configurada. "
            "Defina a variável de ambiente SECRET_KEY para segurança das sessões."
        )
