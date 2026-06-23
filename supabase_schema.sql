-- =====================================================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS (SUPABASE) - CORRIGIDO
-- =====================================================================
-- Este script cria as tabelas necessárias para o painel administrativo
-- de Captura de Leads e define as políticas de segurança RLS utilizando
-- uma função SECURITY DEFINER para evitar erros de recursão infinita.
--
-- Para executar: Copie este script, vá ao painel do Supabase, clique em
-- "SQL Editor", crie uma nova query, cole o conteúdo e clique em "Run".
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABELA DE USUÁRIOS ADMINISTRATIVOS / VENDEDORES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
    role TEXT NOT NULL CHECK (role IN ('administrador', 'vendedor', 'secretario')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 2. TABELA DE PACOTES DE PRECIFICAÇÃO
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pricing_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    payment_options JSONB NOT NULL,
    presentation_type TEXT DEFAULT 'personal' CHECK (presentation_type IN ('personal', 'business', 'complete')),
    product_moment TEXT DEFAULT 'consultoria' CHECK (product_moment IN ('consultoria', 'especial', 'entrada')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 3. HABILITAR SEGURANÇA DE LINHA (ROW LEVEL SECURITY - RLS)
-- ---------------------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_packages ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 4. FUNÇÃO AUXILIAR COM BYPASS DE RLS (SECURITY DEFINER)
-- ---------------------------------------------------------------------
-- Criar uma função com SECURITY DEFINER é a forma padrão e segura no
-- PostgreSQL/Supabase de verificar o papel de um usuário na mesma tabela
-- sem causar erros de recursão infinita nas políticas.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        (auth.jwt() ->> 'email') = 'diegokloppel21@gmail.com'
        OR EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE email = lower(auth.jwt() ->> 'email') AND role = 'administrador'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------
-- 5. POLÍTICAS DE SEGURANÇA (RLS) PARA A TABELA ADMIN_USERS
-- ---------------------------------------------------------------------

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON public.admin_users;
DROP POLICY IF EXISTS "Permitir modificacoes para administradores" ON public.admin_users;

-- Permitir que qualquer usuário autenticado leia a lista de usuários do painel
CREATE POLICY "Permitir leitura para autenticados" ON public.admin_users
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Permitir controle total de usuários administrativos apenas para o email master ou administradores
CREATE POLICY "Permitir modificacoes para administradores" ON public.admin_users
    FOR ALL 
    TO authenticated
    USING (public.check_is_admin());

-- ---------------------------------------------------------------------
-- 6. POLÍTICAS DE SEGURANÇA (RLS) PARA A TABELA PRICING_PACKAGES
-- ---------------------------------------------------------------------

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON public.pricing_packages;
DROP POLICY IF EXISTS "Permitir modificacoes para administradores" ON public.pricing_packages;

-- Permitir que qualquer usuário autenticado leia os pacotes de precificação
CREATE POLICY "Permitir leitura para autenticados" ON public.pricing_packages
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Permitir gerenciamento de pacotes de precificação apenas para o email master ou administradores
CREATE POLICY "Permitir modificacoes para administradores" ON public.pricing_packages
    FOR ALL 
    TO authenticated
    USING (public.check_is_admin());

-- ---------------------------------------------------------------------
-- 7. INSERIR O PRIMEIRO USUÁRIO ADMINISTRADOR (MASTER)
-- ---------------------------------------------------------------------
-- O e-mail abaixo já tem bypass no código front-end, mas inseri-lo
-- no banco garante a consistência das consultas e políticas de RLS.
INSERT INTO public.admin_users (email, role)
VALUES ('diegokloppel21@gmail.com', 'administrador')
ON CONFLICT (email) DO UPDATE 
SET role = 'administrador';

-- ---------------------------------------------------------------------
-- 8. INSERIR OS PACOTES DE PRECIFICAÇÃO PADRÕES E ESTRUTURADOS
-- ---------------------------------------------------------------------
-- Insere os pacotes estruturados do sistema apenas se a tabela de precificações estiver vazia.
INSERT INTO public.pricing_packages (name, value, presentation_type, product_moment, payment_options)
SELECT 
    'Consultoria Estruturada (Pessoal)', 
    'R$ 597,00', 
    'personal',
    'consultoria',
    '[{"label":"1","value":"R$ 61,74","isCard":true,"description":"Até 12x de R$ 61,74 no Cartão de Crédito","installments":12,"installmentValue":"R$ 61,74","link":"https://hotm.io/solum-consultoria"},{"label":"2","value":"R$ 597,00","isCard":false,"description":"À vista por R$ 597,00","link":"https://hotm.io/solum-consultoria"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_packages LIMIT 1);

INSERT INTO public.pricing_packages (name, value, presentation_type, product_moment, payment_options)
SELECT 
    'Condição Especial (Pessoal)', 
    'R$ 450,00', 
    'personal',
    'especial',
    '[{"label":"1","value":"R$ 46,55","isCard":true,"description":"Até 12x de R$ 46,55 no Cartão de Crédito","installments":12,"installmentValue":"R$ 46,55","link":"https://hotm.io/solum-consultoria-especial"},{"label":"2","value":"R$ 450,00","isCard":false,"description":"À vista por R$ 450,00","link":"https://hotm.io/solum-consultoria-especial"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_packages WHERE presentation_type = 'personal' AND product_moment = 'especial');

INSERT INTO public.pricing_packages (name, value, presentation_type, product_moment, payment_options)
SELECT 
    'Produto de Entrada (Pessoal)', 
    'R$ 147,00', 
    'personal',
    'entrada',
    '[{"label":"1","value":"R$ 15,20","isCard":true,"description":"Até 12x de R$ 15,20 no Cartão de Crédito","installments":12,"installmentValue":"R$ 15,20","link":"https://hotm.io/solum-entrada"},{"label":"2","value":"R$ 147,00","isCard":false,"description":"À vista por R$ 147,00","link":"https://hotm.io/solum-entrada"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_packages WHERE presentation_type = 'personal' AND product_moment = 'entrada');

-- 9.2 Finanças Empresariais
INSERT INTO public.pricing_packages (name, value, presentation_type, product_moment, payment_options)
SELECT 
    'Consultoria Estruturada (Empresarial)', 
    'R$ 1.500,00', 
    'business',
    'consultoria',
    '[{"label":"1","value":"R$ 155,15","isCard":true,"description":"Até 12x de R$ 155,15 no Cartão de Crédito","installments":12,"installmentValue":"R$ 155,15","link":"https://hotm.io/solum-business"},{"label":"2","value":"R$ 1.500,00","isCard":false,"description":"À vista por R$ 1.500,00","link":"https://hotm.io/solum-business"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_packages WHERE presentation_type = 'business' AND product_moment = 'consultoria');

INSERT INTO public.pricing_packages (name, value, presentation_type, product_moment, payment_options)
SELECT 
    'Condição Especial (Empresarial)', 
    'R$ 1.200,00', 
    'business',
    'especial',
    '[{"label":"1","value":"R$ 124,12","isCard":true,"description":"Até 12x de R$ 124,12 no Cartão de Crédito","installments":12,"installmentValue":"R$ 124,12","link":"https://hotm.io/solum-business-especial"},{"label":"2","value":"R$ 1.200,00","isCard":false,"description":"À vista por R$ 1.200,00","link":"https://hotm.io/solum-business-especial"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_packages WHERE presentation_type = 'business' AND product_moment = 'especial');

INSERT INTO public.pricing_packages (name, value, presentation_type, product_moment, payment_options)
SELECT 
    'Produto de Entrada (Empresarial)', 
    'R$ 250,00', 
    'business',
    'entrada',
    '[{"label":"1","value":"R$ 25,85","isCard":true,"description":"Até 12x de R$ 25,85 no Cartão de Crédito","installments":12,"installmentValue":"R$ 25,85","link":"https://hotm.io/solum-business-entrada"},{"label":"2","value":"R$ 250,00","isCard":false,"description":"À vista por R$ 250,00","link":"https://hotm.io/solum-business-entrada"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_packages WHERE presentation_type = 'business' AND product_moment = 'entrada');

-- 9.3 Finanças Empresariais + Pessoais
INSERT INTO public.pricing_packages (name, value, presentation_type, product_moment, payment_options)
SELECT 
    'Consultoria Estruturada (Empresarial + Pessoal)', 
    'R$ 2.200,00', 
    'complete',
    'consultoria',
    '[{"label":"1","value":"R$ 227,55","isCard":true,"description":"Até 12x de R$ 227,55 no Cartão de Crédito","installments":12,"installmentValue":"R$ 227,55","link":"https://hotm.io/solum-hybrid"},{"label":"2","value":"R$ 2.200,00","isCard":false,"description":"À vista por R$ 2.200,00","link":"https://hotm.io/solum-hybrid"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_packages WHERE presentation_type = 'complete' AND product_moment = 'consultoria');

INSERT INTO public.pricing_packages (name, value, presentation_type, product_moment, payment_options)
SELECT 
    'Condição Especial (Empresarial + Pessoal)', 
    'R$ 1.800,00', 
    'complete',
    'especial',
    '[{"label":"1","value":"R$ 186,18","isCard":true,"description":"Até 12x de R$ 186,18 no Cartão de Crédito","installments":12,"installmentValue":"R$ 186,18","link":"https://hotm.io/solum-hybrid-especial"},{"label":"2","value":"R$ 1.800,00","isCard":false,"description":"À vista por R$ 1.800,00","link":"https://hotm.io/solum-hybrid-especial"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_packages WHERE presentation_type = 'complete' AND product_moment = 'especial');

INSERT INTO public.pricing_packages (name, value, presentation_type, product_moment, payment_options)
SELECT 
    'Produto de Entrada (Empresarial + Pessoal)', 
    'R$ 350,00', 
    'complete',
    'entrada',
    '[{"label":"1","value":"R$ 36,20","isCard":true,"description":"Até 12x de R$ 36,20 no Cartão de Crédito","installments":12,"installmentValue":"R$ 36,20","link":"https://hotm.io/solum-hybrid-entrada"},{"label":"2","value":"R$ 350,00","isCard":false,"description":"À vista por R$ 350,00","link":"https://hotm.io/solum-hybrid-entrada"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_packages WHERE presentation_type = 'complete' AND product_moment = 'entrada');
