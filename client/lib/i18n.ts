import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "en" | "es" | "pt";

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Onboarding
    "onboarding.title": "Welcome to Fit Femme",
    "onboarding.subtitle": "Premium workouts designed for you",
    "onboarding.start": "Get Started",
    "onboarding.skip": "Skip",

    // Workouts
    "workouts.title": "Workouts",
    "workouts.categories.all": "All",
    "workouts.categories.hiit": "HIIT",
    "workouts.categories.strength": "Strength",
    "workouts.categories.cardio": "Cardio",
    "workouts.categories.core": "Core",
    "workouts.categories.stretch": "Stretch",
    "workouts.filters.popular": "Popular",
    "workouts.filters.short": "Short",
    "workouts.filters.noEquipment": "No Equipment",
    "workouts.filters.new": "New",
    "workouts.clearFilters": "Clear Filters",
    "workouts.noResults": "No workouts found",

    // Stats
    "stats.title": "Muscle Distribution",
    "stats.subtitle": "Workout focus areas",
    "stats.locked": "Stats are a Pro Feature",
    "stats.lockedDesc": "Track your muscle distribution, progress, and workout streaks with a Pro subscription.",
    "stats.unlockPro": "Unlock Pro",

    // Profile
    "profile.title": "Profile",
    "profile.subscription": "Subscription",
    "profile.proMember": "Pro Member",
    "profile.proAccess": "You have full access to all workouts and features.",
    "profile.manageSubscription": "Manage your subscription in your device settings.",
    "profile.upgradeToPro": "Upgrade to Pro",
    "profile.unlockFeatures": "Unlock all 6 workouts, stats, history & more",
    "profile.viewPlans": "View Plans",
    "profile.account": "Account",
    "profile.personalInfo": "Personal Info",
    "profile.goals": "Goals",
    "profile.units": "Units",
    "profile.appSettings": "App Settings",
    "profile.notifications": "Notifications",
    "profile.vibration": "Vibration",
    "profile.language": "Language",
    "profile.support": "Support",
    "profile.privacyPolicy": "Privacy Policy",
    "profile.termsOfService": "Terms of Service",
    "profile.contact": "Contact Us",
    "profile.logout": "Log Out",

    // Paywall
    "paywall.title": "Unlock Pro",
    "paywall.subtitle": "Get unlimited access to all workouts and features",
    "paywall.monthly": "Monthly",
    "paywall.monthlyPrice": "$1.99/mo",
    "paywall.annual": "Annual",
    "paywall.annualPrice": "$14.99/yr",
    "paywall.lifetime": "Lifetime",
    "paywall.lifetimePrice": "$49.99",
    "paywall.mostPopular": "Most Popular",
    "paywall.subscribe": "Subscribe",
    "paywall.purchase": "Purchase",
    "paywall.restore": "Restore Purchases",
    "paywall.feature1": "All 6 workouts unlocked",
    "paywall.feature2": "Unlimited daily workouts",
    "paywall.feature3": "Full progress tracking",
    "paywall.feature4": "Workout history",
    "paywall.feature5": "Streak system",
    "paywall.feature6": "Custom workout builder",

    // Buttons & Common
    "common.close": "Close",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.back": "Back",
    "common.next": "Next",
  },
  es: {
    // Onboarding
    "onboarding.title": "Bienvenida a Fit Femme",
    "onboarding.subtitle": "Entrenamientos premium diseñados para ti",
    "onboarding.start": "Comenzar",
    "onboarding.skip": "Saltar",

    // Workouts
    "workouts.title": "Entrenamientos",
    "workouts.categories.all": "Todos",
    "workouts.categories.hiit": "HIIT",
    "workouts.categories.strength": "Fuerza",
    "workouts.categories.cardio": "Cardio",
    "workouts.categories.core": "Centro",
    "workouts.categories.stretch": "Flexibilidad",
    "workouts.filters.popular": "Popular",
    "workouts.filters.short": "Corto",
    "workouts.filters.noEquipment": "Sin Equipamiento",
    "workouts.filters.new": "Nuevo",
    "workouts.clearFilters": "Limpiar Filtros",
    "workouts.noResults": "No se encontraron entrenamientos",

    // Stats
    "stats.title": "Distribución Muscular",
    "stats.subtitle": "Áreas de enfoque del entrenamiento",
    "stats.locked": "Estadísticas es una Función Pro",
    "stats.lockedDesc": "Rastrea tu distribución muscular, progreso y racha de entrenamientos con una suscripción Pro.",
    "stats.unlockPro": "Desbloquear Pro",

    // Profile
    "profile.title": "Perfil",
    "profile.subscription": "Suscripción",
    "profile.proMember": "Miembro Pro",
    "profile.proAccess": "Tienes acceso completo a todos los entrenamientos y características.",
    "profile.manageSubscription": "Administra tu suscripción en la configuración de tu dispositivo.",
    "profile.upgradeToPro": "Actualizar a Pro",
    "profile.unlockFeatures": "Desbloquea los 6 entrenamientos, estadísticas, historial y más",
    "profile.viewPlans": "Ver Planes",
    "profile.account": "Cuenta",
    "profile.personalInfo": "Información Personal",
    "profile.goals": "Objetivos",
    "profile.units": "Unidades",
    "profile.appSettings": "Configuración de la App",
    "profile.notifications": "Notificaciones",
    "profile.vibration": "Vibración",
    "profile.language": "Idioma",
    "profile.support": "Soporte",
    "profile.privacyPolicy": "Política de Privacidad",
    "profile.termsOfService": "Términos de Servicio",
    "profile.contact": "Contáctanos",
    "profile.logout": "Cerrar Sesión",

    // Paywall
    "paywall.title": "Desbloquear Pro",
    "paywall.subtitle": "Obtén acceso ilimitado a todos los entrenamientos y características",
    "paywall.monthly": "Mensual",
    "paywall.monthlyPrice": "$1.99/mes",
    "paywall.annual": "Anual",
    "paywall.annualPrice": "$14.99/año",
    "paywall.lifetime": "Vida Útil",
    "paywall.lifetimePrice": "$49.99",
    "paywall.mostPopular": "Más Popular",
    "paywall.subscribe": "Suscribirse",
    "paywall.purchase": "Comprar",
    "paywall.restore": "Restaurar Compras",
    "paywall.feature1": "Los 6 entrenamientos desbloqueados",
    "paywall.feature2": "Entrenamientos diarios ilimitados",
    "paywall.feature3": "Seguimiento completo del progreso",
    "paywall.feature4": "Historial de entrenamientos",
    "paywall.feature5": "Sistema de racha",
    "paywall.feature6": "Constructor de entrenamiento personalizado",

    // Buttons & Common
    "common.close": "Cerrar",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
  },
  pt: {
    // Onboarding
    "onboarding.title": "Bem-vinda ao Fit Femme",
    "onboarding.subtitle": "Treinos premium projetados para você",
    "onboarding.start": "Começar",
    "onboarding.skip": "Pular",

    // Workouts
    "workouts.title": "Treinos",
    "workouts.categories.all": "Todos",
    "workouts.categories.hiit": "HIIT",
    "workouts.categories.strength": "Força",
    "workouts.categories.cardio": "Cardio",
    "workouts.categories.core": "Núcleo",
    "workouts.categories.stretch": "Flexibilidade",
    "workouts.filters.popular": "Popular",
    "workouts.filters.short": "Curto",
    "workouts.filters.noEquipment": "Sem Equipamento",
    "workouts.filters.new": "Novo",
    "workouts.clearFilters": "Limpar Filtros",
    "workouts.noResults": "Nenhum treino encontrado",

    // Stats
    "stats.title": "Distribuição Muscular",
    "stats.subtitle": "Áreas de foco do treino",
    "stats.locked": "Estatísticas é um Recurso Pro",
    "stats.lockedDesc": "Rastreie sua distribuição muscular, progresso e sequência de treinos com uma assinatura Pro.",
    "stats.unlockPro": "Desbloquear Pro",

    // Profile
    "profile.title": "Perfil",
    "profile.subscription": "Assinatura",
    "profile.proMember": "Membro Pro",
    "profile.proAccess": "Você tem acesso completo a todos os treinos e recursos.",
    "profile.manageSubscription": "Gerencie sua assinatura nas configurações do seu dispositivo.",
    "profile.upgradeToPro": "Atualizar para Pro",
    "profile.unlockFeatures": "Desbloqueie todos os 6 treinos, estatísticas, histórico e muito mais",
    "profile.viewPlans": "Ver Planos",
    "profile.account": "Conta",
    "profile.personalInfo": "Informações Pessoais",
    "profile.goals": "Objetivos",
    "profile.units": "Unidades",
    "profile.appSettings": "Configurações do App",
    "profile.notifications": "Notificações",
    "profile.vibration": "Vibração",
    "profile.language": "Idioma",
    "profile.support": "Suporte",
    "profile.privacyPolicy": "Política de Privacidade",
    "profile.termsOfService": "Termos de Serviço",
    "profile.contact": "Contate-nos",
    "profile.logout": "Sair",

    // Paywall
    "paywall.title": "Desbloquear Pro",
    "paywall.subtitle": "Obtenha acesso ilimitado a todos os treinos e recursos",
    "paywall.monthly": "Mensal",
    "paywall.monthlyPrice": "$1.99/mês",
    "paywall.annual": "Anual",
    "paywall.annualPrice": "$14.99/ano",
    "paywall.lifetime": "Vitalício",
    "paywall.lifetimePrice": "$49.99",
    "paywall.mostPopular": "Mais Popular",
    "paywall.subscribe": "Inscrever",
    "paywall.purchase": "Comprar",
    "paywall.restore": "Restaurar Compras",
    "paywall.feature1": "Todos os 6 treinos desbloqueados",
    "paywall.feature2": "Treinos diários ilimitados",
    "paywall.feature3": "Rastreamento completo de progresso",
    "paywall.feature4": "Histórico de treinos",
    "paywall.feature5": "Sistema de sequência",
    "paywall.feature6": "Construtor de treino personalizado",

    // Buttons & Common
    "common.close": "Fechar",
    "common.cancel": "Cancelar",
    "common.save": "Salvar",
    "common.back": "Voltar",
    "common.next": "Próximo",
  },
};

const LANGUAGE_STORAGE_KEY = "@fitfemme_language";

let currentLanguage: Language = "en";

export async function initializeLanguage() {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && (saved === "en" || saved === "es" || saved === "pt")) {
      currentLanguage = saved;
    }
  } catch (error) {
    console.log("Error loading language preference:", error);
  }
}

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string): string {
  const lang = currentLanguage;
  return translations[lang][key] || translations.en[key] || key;
}

export function useLanguage() {
  const [lang, setLang] = useState<Language>(currentLanguage);

  const changeLang = (newLang: Language) => {
    setLanguage(newLang);
    setLang(newLang);
  };

  return { language: lang, setLanguage: changeLang, t: (key: string) => translations[lang][key] || translations.en[key] || key };
}
