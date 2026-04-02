#!/usr/bin/env bash
# 🚀 CLI SCRIPT PARA AUTONOMOUS SAAS FORGE

echo "🔥 Iniciando Forja de SaaS..."

# 1. Crear proyecto Next.js
npx -y create-next-app@latest saas-app --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*" --use-npm

cd saas-app

# 2. Instalar dependencias core
npm install @supabase/supabase-js stripe zod lucide-react clsx tailwind-merge motion

# 3. Crear estructura de directorios
mkdir -p app/api/ai lib sql

# 4. Finalizar
echo "✅ Forja completada. Listo para despliegue."
