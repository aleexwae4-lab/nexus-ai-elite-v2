
import { execSync } from 'child_process';

const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;
const PROJECT_NAME = "nexus-ai-elite-v2"; // Name of the project

if (!GITHUB_TOKEN || !VERCEL_TOKEN || !USERNAME) {
  console.error("❌ Faltan variables de entorno (GITHUB_ACCESS_TOKEN, VERCEL_TOKEN, GITHUB_USERNAME)");
  process.exit(1);
}

async function createRepo() {
  console.log("🚀 Creando repositorio en GitHub...");
  const res = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "Nexus-Elite-Deployer"
    },
    body: JSON.stringify({
      name: PROJECT_NAME,
      private: false,
      description: "Nexus AI Elite - The ultimate SaaS for AI-driven productivity"
    })
  });

  const data = await res.json();
  if (data.clone_url) {
    console.log("✅ Repo creado:", data.clone_url);
    return data.clone_url;
  } else {
    console.error("❌ Error creando repo:", data);
    // If it already exists, we might want to continue, but for now let's exit
    if (data.errors && data.errors[0].message === "name already exists on this account") {
        console.log("⚠️ El repositorio ya existe. Intentando continuar...");
        return `https://github.com/${USERNAME}/${PROJECT_NAME}.git`;
    }
    process.exit(1);
  }
}

function setupAndPush(repoUrl: string) {
  console.log("📦 Inicializando Git y subiendo código...");
  try {
    // Configure git user
    execSync('git config --global user.email "waeproduction8@gmail.com"', { stdio: 'inherit' });
    execSync('git config --global user.name "Nexus Elite Bot"', { stdio: 'inherit' });

    // Check if git is already initialized
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
      console.log("ℹ️ Git ya está inicializado.");
    } catch (e) {
      execSync('git init', { stdio: 'inherit' });
      execSync('git checkout -b main', { stdio: 'inherit' });
    }

    // Configure remote
    try {
      execSync(`git remote add origin ${repoUrl}`, { stdio: 'inherit' });
    } catch (e) {
      execSync(`git remote set-url origin ${repoUrl}`, { stdio: 'inherit' });
    }

    // Add files and commit
    execSync('git add .', { stdio: 'inherit' });
    try {
      execSync('git commit -m "Nexus Elite: Initial Deploy - God Level"', { stdio: 'inherit' });
    } catch (e) {
      console.log("ℹ️ Nada que commitear.");
    }

    // Push
    const authRepoUrl = repoUrl.replace('https://', `https://${USERNAME}:${GITHUB_TOKEN}@`);
    execSync(`git push -u ${authRepoUrl} main --force`, { stdio: 'inherit' });
    console.log("✅ Código subido con éxito.");
  } catch (err) {
    console.error("❌ Error en Git:", err);
    process.exit(1);
  }
}

async function createVercelProject() {
  console.log("🌐 Conectando con Vercel...");
  const res = await fetch("https://api.vercel.com/v9/projects", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: PROJECT_NAME,
      gitRepository: {
        type: "github",
        repo: `${USERNAME}/${PROJECT_NAME}`
      }
    })
  });

  const data = await res.json();
  if (data.id) {
    console.log("✅ Proyecto en Vercel configurado.");
    return data;
  } else {
    if (data.error && data.error.code === "name_already_exists") {
        console.log("⚠️ El proyecto en Vercel ya existe.");
        return { name: PROJECT_NAME };
    }
    console.error("❌ Error en Vercel:", data);
    return null;
  }
}

async function deploy(project: any) {
  if (!project) return;
  console.log("🚀 Lanzando deployment en Vercel...");
  const res = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: project.name,
      gitSource: {
        type: "github",
        repo: `${USERNAME}/${PROJECT_NAME}`,
        ref: "main"
      }
    })
  });

  const data = await res.json();
  if (data.url) {
    console.log("\n🌍 DEPLOY EXITOSO:");
    console.log(`🔗 https://${data.url}`);
  } else {
    console.error("❌ Error en el deploy:", data);
  }
}

(async () => {
  try {
    const repoUrl = await createRepo();
    setupAndPush(repoUrl);
    const vercelProject = await createVercelProject();
    await deploy(vercelProject);
    console.log("\n🔥 NEXUS ELITE: OPERACIÓN NIVEL DIOS COMPLETADA 🔥");
  } catch (err) {
    console.error("❌ ERROR CRÍTICO:", err);
  }
})();
