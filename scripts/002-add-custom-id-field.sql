-- Adicionar campo custom_id para identificação única por tipo
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS custom_id VARCHAR(50);

-- Criar índice único composto para garantir que custom_id seja único por tipo e usuário
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_custom_id_type_user 
ON transactions(custom_id, type, user_id) 
WHERE custom_id IS NOT NULL;

-- Atualizar registros existentes com custom_id sequencial
DO $$
DECLARE
    rec RECORD;
    counter INTEGER;
BEGIN
    -- Para receitas
    counter := 1;
    FOR rec IN 
        SELECT id FROM transactions 
        WHERE type = 'income' AND custom_id IS NULL 
        ORDER BY created_at
    LOOP
        UPDATE transactions 
        SET custom_id = 'R' || LPAD(counter::text, 3, '0')
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
    
    -- Para despesas
    counter := 1;
    FOR rec IN 
        SELECT id FROM transactions 
        WHERE type = 'expense' AND custom_id IS NULL 
        ORDER BY created_at
    LOOP
        UPDATE transactions 
        SET custom_id = 'D' || LPAD(counter::text, 3, '0')
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
END $$;
