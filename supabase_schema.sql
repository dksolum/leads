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
-- 8. INSERIR O PACOTE DE PRECIFICAÇÃO PADRÃO
-- ---------------------------------------------------------------------
-- Insere o pacote padrão do sistema apenas se a tabela de precificações estiver vazia.
INSERT INTO public.pricing_packages (name, value, payment_options)
SELECT 
    'Consultoria Padrão', 
    'R$ 597,00', 
    '[{"label":"1","description":"Até 12x de R$ 61,74 no Cartão de Crédito","link":"https://hotm.io/solum-consultoria"},{"label":"2","description":"À vista por R$ 597","link":"https://hotm.io/solum-consultoria"},{"label":"3","description":"Até 2x de R$ 314,22 no Boleto Parcelado","link":"https://hotm.io/solum-consultoria-parcelado"},{"label":"4","description":"Entrada de R$ 147 + 1x de R$ 450","link":"https://mpago.li/2PY7vuj"},{"label":"5","description":"Boleto Parcelado (PARCELEX) - Última tentativa","link":"https://hotm.io/solum-consultoria-parcelex"},{"label":"6","description":"R$ 47 (GARANTIR A VAGA) + 1x de R$ 550 (NO DIA DO FECHAMENTO)","link":"https://mpago.li/2gVs1Rb"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_packages LIMIT 1);
