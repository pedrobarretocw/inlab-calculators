-- Query para adicionar coluna 'name' na tabela calculations
-- Execute esta query no seu banco de dados

-- Substitua 'public' pelo nome do seu schema se for diferente
ALTER TABLE public.calculations 
ADD COLUMN name VARCHAR(255) DEFAULT NULL;

-- Opcional: Adicionar um índice para melhorar performance em buscas por nome
CREATE INDEX idx_calculations_name ON public.calculations(name);

-- Comentário: 
-- - VARCHAR(255) permite nomes de até 255 caracteres
-- - DEFAULT NULL permite que cálculos antigos continuem funcionando
-- - O índice melhora a performance se você fizer buscas por nome no futuro
-- - Se o seu schema não for 'public', substitua por: 'seu_schema.calculations'
