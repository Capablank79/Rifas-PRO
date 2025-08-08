-- Script SQL para crear las tablas del sistema de rifas

-- Crear tipos ENUM para roles y estados
CREATE TYPE user_role AS ENUM ('free', 'plata', 'gold');
CREATE TYPE raffle_status AS ENUM ('draft', 'active', 'finished');

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'free',
    subscription_expiry TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones según el plan
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Tabla de rifas
CREATE TABLE IF NOT EXISTS raffles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price_per_number INTEGER NOT NULL,
    total_numbers INTEGER NOT NULL,
    plan user_role NOT NULL,
    status raffle_status NOT NULL DEFAULT 'draft',
    draw_date TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones según el plan
    CONSTRAINT valid_price_free CHECK (
        (plan = 'free' AND price_per_number <= 1000) OR 
        (plan = 'plata' AND price_per_number <= 3000) OR
        (plan = 'gold')
    ),
    CONSTRAINT valid_numbers_free CHECK (
        (plan = 'free' AND total_numbers <= 100) OR
        (plan = 'plata' AND total_numbers <= 200) OR
        (plan = 'gold')
    )
);

-- Tabla de premios
CREATE TABLE IF NOT EXISTS prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    gallery JSONB DEFAULT '[]'::JSONB,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vendedores
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    assigned_numbers JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Tabla de números de rifa
CREATE TABLE IF NOT EXISTS raffle_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    buyer_name TEXT,
    buyer_email TEXT,
    is_sold BOOLEAN DEFAULT FALSE,
    qr_code TEXT,
    sold_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_number_per_raffle UNIQUE (raffle_id, number),
    CONSTRAINT valid_buyer_email CHECK (buyer_email IS NULL OR buyer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Tabla de sorteos
CREATE TABLE IF NOT EXISTS draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    winners JSONB DEFAULT '[]'::JSONB,
    hash_seed TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT one_draw_per_raffle UNIQUE (raffle_id)
);

-- Tabla de cuentas bancarias
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_type TEXT NOT NULL,
    holder_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar Row Level Security (RLS)

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (solo ven su propia información)
CREATE POLICY users_policy ON users
    FOR ALL
    USING (id = auth.uid());

-- Políticas para rifas (organizadores solo ven sus rifas)
CREATE POLICY raffles_policy ON raffles
    FOR ALL
    USING (user_id = auth.uid());

-- Políticas para premios (solo visibles para el organizador de la rifa)
CREATE POLICY prizes_policy ON prizes
    FOR ALL
    USING (
        raffle_id IN (SELECT id FROM raffles WHERE user_id = auth.uid())
    );

-- Políticas para vendedores (solo visibles para el organizador de la rifa)
CREATE POLICY vendors_policy ON vendors
    FOR ALL
    USING (
        raffle_id IN (SELECT id FROM raffles WHERE user_id = auth.uid())
    );

-- Políticas para números de rifa
-- Organizadores ven todos los números de sus rifas
CREATE POLICY raffle_numbers_organizer_policy ON raffle_numbers
    FOR ALL
    USING (
        raffle_id IN (SELECT id FROM raffles WHERE user_id = auth.uid())
    );

-- Vendedores solo ven sus números asignados
CREATE POLICY raffle_numbers_vendor_policy ON raffle_numbers
    FOR ALL
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE email = auth.email())
    );

-- Compradores solo ven sus compras
CREATE POLICY raffle_numbers_buyer_policy ON raffle_numbers
    FOR SELECT
    USING (
        buyer_email = auth.email()
    );

-- Políticas para sorteos (solo visibles para el organizador de la rifa)
CREATE POLICY draws_policy ON draws
    FOR ALL
    USING (
        raffle_id IN (SELECT id FROM raffles WHERE user_id = auth.uid())
    );

-- Políticas para cuentas bancarias (solo visibles para el propietario)
CREATE POLICY bank_accounts_policy ON bank_accounts
    FOR ALL
    USING (user_id = auth.uid());

-- Funciones para validar límites según el plan

-- Función para validar el número máximo de rifas por usuario según su plan
CREATE OR REPLACE FUNCTION check_raffle_limit()
    RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM users WHERE id = NEW.user_id AND role = 'free' AND
        (SELECT COUNT(*) FROM raffles WHERE user_id = NEW.user_id) >= 1
    ) THEN
        RAISE EXCEPTION 'Los usuarios con plan Free solo pueden crear 1 rifa';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM users WHERE id = NEW.user_id AND role = 'plata' AND
        (SELECT COUNT(*) FROM raffles WHERE user_id = NEW.user_id) >= 5
    ) THEN
        RAISE EXCEPTION 'Los usuarios con plan Plata solo pueden crear 5 rifas';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar el límite de rifas al crear una nueva
CREATE TRIGGER check_raffle_limit_trigger
    BEFORE INSERT ON raffles
    FOR EACH ROW
    EXECUTE FUNCTION check_raffle_limit();

-- Función para validar el número máximo de premios por rifa según el plan
CREATE OR REPLACE FUNCTION check_prize_limit()
    RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM raffles r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = NEW.raffle_id AND u.role = 'free' AND
        (SELECT COUNT(*) FROM prizes WHERE raffle_id = NEW.raffle_id) >= 5
    ) THEN
        RAISE EXCEPTION 'Las rifas en plan Free solo pueden tener 5 premios como máximo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar el límite de premios al crear uno nuevo
CREATE TRIGGER check_prize_limit_trigger
    BEFORE INSERT ON prizes
    FOR EACH ROW
    EXECUTE FUNCTION check_prize_limit();

-- Función para validar el número máximo de vendedores por rifa según el plan
CREATE OR REPLACE FUNCTION check_vendor_limit()
    RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM raffles r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = NEW.raffle_id AND u.role = 'plata' AND
        (SELECT COUNT(*) FROM vendors WHERE raffle_id = NEW.raffle_id) >= 100
    ) THEN
        RAISE EXCEPTION 'Las rifas en plan Plata solo pueden tener 100 vendedores como máximo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar el límite de vendedores al crear uno nuevo
CREATE TRIGGER check_vendor_limit_trigger
    BEFORE INSERT ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION check_vendor_limit();

-- Índices para mejorar el rendimiento
CREATE INDEX idx_raffles_user_id ON raffles(user_id);
CREATE INDEX idx_prizes_raffle_id ON prizes(raffle_id);
CREATE INDEX idx_vendors_raffle_id ON vendors(raffle_id);
CREATE INDEX idx_raffle_numbers_raffle_id ON raffle_numbers(raffle_id);
CREATE INDEX idx_raffle_numbers_vendor_id ON raffle_numbers(vendor_id);
CREATE INDEX idx_raffle_numbers_buyer_email ON raffle_numbers(buyer_email);
CREATE INDEX idx_draws_raffle_id ON draws(raffle_id);
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);