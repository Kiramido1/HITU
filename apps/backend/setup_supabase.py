"""
Setup script to create HITU database schema on Supabase.
This script bypasses the .env file and uses direct connection string.
"""
import os
import sys
from urllib.parse import quote_plus

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
import app.models.user  # noqa: F401
import app.models.academic  # noqa: F401
import app.models.lms  # noqa: F401
import app.models.platform  # noqa: F401


def setup_supabase_database():
    """Create all tables on Supabase database."""
    
    # Supabase connection details
    password = "Kali1010$$#$"
    encoded_password = quote_plus(password)
    
    database_url = f"postgresql://postgres.kstcpvbjzgtfizezjyyb:{encoded_password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
    
    print("Connecting to Supabase...")
    print(f"Database URL: {database_url[:50]}...")
    
    # Create sync engine for table creation
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        echo=True,
    )
    
    print("\nCreating all tables...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("\n✅ Successfully created all tables on Supabase!")
        
        # Print table list
        print("\nCreated tables:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
            
    except Exception as e:
        print(f"\n❌ Error creating tables: {e}")
        raise
    finally:
        engine.dispose()


if __name__ == "__main__":
    setup_supabase_database()
