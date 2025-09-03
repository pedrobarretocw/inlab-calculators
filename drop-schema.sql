-- CUIDADO: Este comando irá DELETAR PERMANENTEMENTE todo o schema e dados!

-- Opção 1: Deletar schema completo (recomendado)
-- Este comando remove o schema e TODAS as tabelas dentro dele
DROP SCHEMA IF EXISTS inlab_payroll_tools CASCADE;

-- Ou se preferir deletar tabela por tabela primeiro:

-- Opção 2: Deletar tabelas individuais (opcional)
-- DROP TABLE IF EXISTS inlab_payroll_tools.events CASCADE;
-- DROP TABLE IF EXISTS inlab_payroll_tools.calculations CASCADE;
-- DROP TABLE IF EXISTS inlab_payroll_tools.leads CASCADE;
-- DROP TABLE IF EXISTS inlab_payroll_tools.ab_variants CASCADE;
-- DROP TABLE IF EXISTS inlab_payroll_tools.calculators CASCADE;
-- DROP SCHEMA IF EXISTS inlab_payroll_tools;

-- ✅ Após executar, o schema inlab_payroll_tools não existirá mais!
