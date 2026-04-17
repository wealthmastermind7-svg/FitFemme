import React, { createContext, useContext, useEffect, useState } from "react";
import { NativeModules, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "en" | "es" | "pt";

const DEFAULT_LANGUAGE: Language = process.env.EXPO_PUBLIC_DEFAULT_LANGUAGE === "pt" ? "pt" : process.env.EXPO_PUBLIC_DEFAULT_LANGUAGE === "es" ? "es" : "en";
const LANGUAGE_STORAGE_KEY = "@fitfemme_language";

function getDeviceLanguage(): Language {
  const locale =
    Platform.OS === "ios"
      ? NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
      : NativeModules.I18nManager?.localeIdentifier;
  const value = (locale ?? "").toLowerCase().replace("_", "-");
  if (value.startsWith("pt-br") || value.startsWith("pt")) return "pt";
  if (value.startsWith("es-mx") || value.startsWith("es")) return "es";
  return DEFAULT_LANGUAGE;
}

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
    "profile.yourGoal": "Your Goal",
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

    // Profile modal fields
    "profile.name": "Name",
    "profile.age": "Age",
    "profile.weight": "Weight",
    "profile.workoutDuration": "Daily Workout Goal (min)",
    "profile.saveChanges": "Save Changes",
    "profile.minGoal": "Min Goal",
    "profile.fitnessGoals": "Fitness Goals",
    "profile.unitsAndMeasurements": "Units & Measurements",
    "profile.helpCenter": "Help Center",
    "profile.sendFeedback": "Send Feedback",

    // Workouts screen
    "workouts.preview": "Preview",
    "workouts.min": "min",
    "workouts.exercises": "exercises",

    // Home screen
    "home.goodMorning": "Good morning",
    "home.goodAfternoon": "Good afternoon",
    "home.goodEvening": "Good evening",
    "home.todaysWorkout": "Today's Workout",
    "home.continueJourney": "Continue your fitness journey",
    "home.startWorkout": "Start Workout",
    "home.weeklyProgress": "Weekly Progress",
    "home.workoutsCompleted": "workouts completed",
    "home.quickStats": "Quick Stats",

    // Buttons & Common
    "common.close": "Close",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.back": "Back",
    "common.next": "Next",
    "common.viewAll": "View All",
    "common.today": "Today",
    "common.details": "Details",

    // Paywall
    "paywall.headline": "Unlock Your Full\nPotential",
    "paywall.joinThousands": "Join thousands of women transforming their fitness journey",
    "paywall.feature.workouts": "All 6 workouts unlocked",
    "paywall.feature.tracking": "Full progress tracking & muscle chart",
    "paywall.feature.history": "Workout history & streak calendar",
    "paywall.feature.unlimited": "Unlimited daily workouts",
    "paywall.monthly.label": "Monthly",
    "paywall.annual.label": "Annual",
    "paywall.lifetime.label": "Lifetime",
    "paywall.badge.popular": "Most Popular",
    "paywall.badge.value": "Best Value",
    "paywall.sub.monthly": "Cancel anytime",
    "paywall.sub.annual": "~$1.25/month, save 37%",
    "paywall.sub.lifetime": "One-time, keep forever",
    "paywall.noResults": "No workouts found",
    "paywall.legal": "Subscriptions auto-renew unless cancelled. Manage in device settings.",

    // Workout Preview & Player
    "workout.preview": "Workout Preview",
    "workout.exercises": "Exercises",
    "workout.description": "Here is what you will be doing",
    "workout.intensity": "Intensity",
    "workout.equipment": "Equipment",
    "workout.start": "START WORKOUT",
    "workout.sets": "sets",
    "workout.each": "each",
    "workout.min": "min",
    "workout.remaining": "REMAINING",
    "workout.rest": "REST",
    "workout.getReady": "Get Ready",
    "workout.setOf": "Set",
    "workout.of": "of",
    "workout.intensityHigh": "High",
    "workout.intensityMedium": "Medium",
    "workout.intensityLow": "Low",
    "workout.noEquipment": "No Equipment",

    // Bottom navigation tabs
    "nav.home": "Home",
    "nav.workouts": "Workouts",
    "nav.stats": "Stats",
    "nav.profile": "Profile",

    // WorkoutsScreen
    "workouts.allWorkouts": "All Workouts",
    "workouts.featuredBadge": "Editor's Pick",
    "workouts.startNow": "Start Now",
    "workouts.featured": "Featured Workout",

    // Workout titles (from sample data)
    "workout.fullBodyBurn": "Full Body Burn",
    "workout.gluteGains": "Glute Gains",
    "workout.coreCrusher": "Core Crusher",
    "workout.cardioQueen": "Cardio Queen",
    "workout.flexibilityFlow": "Flexibility Flow",
    "workout.noEquipmentAbs": "No-Equipment Abs",

    // Exercise names
    "exercise.jumpSquats": "Jump Squats",
    "exercise.burpees": "Burpees",
    "exercise.mountainClimber": "Mountain Climber",
    "exercise.pushUps": "Push-ups",
    "exercise.plankJacks": "Plank Jacks",
    "exercise.gluteBridgeWalk": "Glute Bridge Walk",
    "exercise.donkeyKick": "Basic to Cross Donkey Kick",
    "exercise.lateralWalk": "Resistance Band Lateral Walk",
    "exercise.sumoSquat": "Bottle Weighted Sumo Squat",
    "exercise.bicycleCrunch": "Bicycle Crunch",
    "exercise.lyingLegRaise": "Lying Leg Raise",
    "exercise.russianTwist": "Russian Twist",
    "exercise.plankJack": "Plank Jack",
    "exercise.highKneeTap": "High Knee Tap",
    "exercise.highKneeJumpRope": "High Knee Jump Rope",
    "exercise.jumpBox": "Jump Box",
    "exercise.suspenderSprinter": "Suspender Sprinter",
    "exercise.standingForwardBend": "Standing Forward Bend Uttanasana",
    "exercise.seatedHamstringStretch": "Seated Hamstring Stretch with Chair",
    "exercise.kneelingHipFlexor": "Kneeling Hip Flexor Stretch",
    "exercise.doublePigeonPose": "Double Pigeon Pose",
    "exercise.cowYogaPose": "Cow Yoga Pose Bitilasana",

    // How it works section
    "workout.howItWorks": "How it works",
    "workout.howItWorksDesc": "The guided timer will count down each exercise. Focus on your form while we track the time. Rest periods are built in between sets.",

    // Body Goals
    "goal.pickerTitle": "What's your body goal?",
    "goal.pickerSubtitle": "We'll personalize your nutrition guidance based on what you want to achieve.",
    "goal.continue": "Continue",
    "goal.skip": "Skip for now",
    "goal.changeAnytime": "You can change this anytime in your profile.",
    "goal.leanToned.title": "Lean & Toned",
    "goal.leanToned.short": "Lean & Toned",
    "goal.leanToned.desc": "Lose fat without losing your shape",
    "goal.bootyBuilder.title": "Booty Builder",
    "goal.bootyBuilder.short": "Booty Builder",
    "goal.bootyBuilder.desc": "Grow your glutes without gaining belly fat",
    "goal.flatStomach.title": "Flat Stomach",
    "goal.flatStomach.short": "Flat Stomach",
    "goal.flatStomach.desc": "Eat smarter for a flatter, less bloated look",
    "goal.yourGoal": "Your Goal",
    "goal.changeGoal": "Change goal",

    // Today's Goal Status (Home)
    "goalStatus.cardTitle": "Today's Goal",
    "goalStatus.calories": "calories",
    "goalStatus.protein": "protein",
    "goalStatus.target": "target",
    "goalStatus.scanCta": "Scan a meal to start",
    "goalStatus.empty": "No meals logged yet today",
    "goalStatus.leanToned.light": "Light day, on track",
    "goalStatus.leanToned.onTrack": "On track for fat loss",
    "goalStatus.leanToned.atTarget": "At your fat loss target",
    "goalStatus.leanToned.over": "Slightly over — adjust tomorrow",
    "goalStatus.bootyBuilder.needMore": "Need more fuel for glute growth",
    "goalStatus.bootyBuilder.fueling": "Fueling glute growth",
    "goalStatus.bootyBuilder.plenty": "Plenty of fuel today",
    "goalStatus.flatStomach.clean": "Light & clean choices",
    "goalStatus.flatStomach.onTrack": "On track for a flatter stomach",
    "goalStatus.flatStomach.atTarget": "Right on target",
    "goalStatus.flatStomach.over": "Heavy day — may feel bloated",

    // Meal Feedback (Food Scanner)
    "mealFeedback.highProtein": "High protein — great for toning",
    "mealFeedback.lowProtein": "Low protein — may slow muscle definition",
    "mealFeedback.heavyBloat": "Heavy meal — may cause bloating",
    "mealFeedback.heavyLean": "Heavy meal — keep dinner light",
    "mealFeedback.addProtein": "Add more protein to fuel glute growth",
    "mealFeedback.highFiber": "High fiber — supports a flat stomach",
    "mealFeedback.balanced": "Balanced choice for your goal",
    "mealFeedback.savedToday": "Logged to today's plan",
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
    "profile.yourGoal": "Tu Objetivo",
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

    // Profile modal fields
    "profile.name": "Nombre",
    "profile.age": "Edad",
    "profile.weight": "Peso",
    "profile.workoutDuration": "Meta Diaria de Entrenamiento (min)",
    "profile.saveChanges": "Guardar Cambios",
    "profile.minGoal": "Meta Min",
    "profile.fitnessGoals": "Objetivos de Fitness",
    "profile.unitsAndMeasurements": "Unidades y Medidas",
    "profile.helpCenter": "Centro de Ayuda",
    "profile.sendFeedback": "Enviar Comentarios",

    // Workouts screen
    "workouts.preview": "Vista Previa",
    "workouts.min": "min",
    "workouts.exercises": "ejercicios",

    // Home screen
    "home.goodMorning": "Buenos días",
    "home.goodAfternoon": "Buenas tardes",
    "home.goodEvening": "Buenas noches",
    "home.todaysWorkout": "Entrenamiento de Hoy",
    "home.continueJourney": "Continúa tu viaje de fitness",
    "home.startWorkout": "Comenzar Entrenamiento",
    "home.weeklyProgress": "Progreso Semanal",
    "home.workoutsCompleted": "entrenamientos completados",
    "home.quickStats": "Estadísticas Rápidas",

    // Buttons & Common
    "common.close": "Cerrar",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.viewAll": "Ver Todo",
    "common.today": "Hoy",
    "common.details": "Detalles",

    // Paywall
    "paywall.headline": "Desbloquea Todo\ntu Potencial",
    "paywall.joinThousands": "Únete a miles de mujeres que transforman su viaje de fitness",
    "paywall.feature.workouts": "Los 6 entrenamientos desbloqueados",
    "paywall.feature.tracking": "Seguimiento completo del progreso y gráfico muscular",
    "paywall.feature.history": "Historial de entrenamientos y calendario de rachas",
    "paywall.feature.unlimited": "Entrenamientos diarios ilimitados",
    "paywall.monthly.label": "Mensual",
    "paywall.annual.label": "Anual",
    "paywall.lifetime.label": "Vitalicio",
    "paywall.badge.popular": "Más Popular",
    "paywall.badge.value": "Mejor Valor",
    "paywall.sub.monthly": "Cancela cuando quieras",
    "paywall.sub.annual": "~$1.25/mes, ahorra 37%",
    "paywall.sub.lifetime": "Pago único, acceso para siempre",
    "paywall.noResults": "No se encontraron entrenamientos",
    "paywall.legal": "Las suscripciones se renuevan automáticamente. Gestionar en ajustes del dispositivo.",

    // Workout Preview & Player
    "workout.preview": "Vista Previa de Entrenamiento",
    "workout.exercises": "Ejercicios",
    "workout.description": "Esto es lo que harás",
    "workout.intensity": "Intensidad",
    "workout.equipment": "Equipamiento",
    "workout.start": "COMENZAR ENTRENAMIENTO",
    "workout.sets": "series",
    "workout.each": "cada",
    "workout.min": "min",
    "workout.remaining": "RESTANTE",
    "workout.rest": "DESCANSO",
    "workout.getReady": "Prepárate",
    "workout.setOf": "Serie",
    "workout.of": "de",
    "workout.intensityHigh": "Alto",
    "workout.intensityMedium": "Medio",
    "workout.intensityLow": "Bajo",
    "workout.noEquipment": "Sin Equipamiento",

    // Bottom navigation tabs
    "nav.home": "Inicio",
    "nav.workouts": "Entrenamientos",
    "nav.stats": "Estadísticas",
    "nav.profile": "Perfil",

    // WorkoutsScreen
    "workouts.allWorkouts": "Todos los Entrenamientos",
    "workouts.featuredBadge": "Selección del Editor",
    "workouts.startNow": "Comenzar Ahora",
    "workouts.featured": "Entrenamiento Destacado",

    // Workout titles (from sample data)
    "workout.fullBodyBurn": "Quema Todo el Cuerpo",
    "workout.gluteGains": "Ganancias de Glúteos",
    "workout.coreCrusher": "Aplastador de Núcleo",
    "workout.cardioQueen": "Reina del Cardio",
    "workout.flexibilityFlow": "Flujo de Flexibilidad",
    "workout.noEquipmentAbs": "Abdominales Sin Equipo",

    // Exercise names
    "exercise.jumpSquats": "Sentadillas Saltadas",
    "exercise.burpees": "Burpees",
    "exercise.mountainClimber": "Escalador de Montaña",
    "exercise.pushUps": "Flexiones",
    "exercise.plankJacks": "Planchas Saltadas",
    "exercise.gluteBridgeWalk": "Puente de Glúteos Caminando",
    "exercise.donkeyKick": "Patada de Burro Cruzada",
    "exercise.lateralWalk": "Caminata Lateral con Banda",
    "exercise.sumoSquat": "Sentadilla Sumo con Peso",
    "exercise.bicycleCrunch": "Abdominales de Bicicleta",
    "exercise.lyingLegRaise": "Levantamiento de Piernas Acostado",
    "exercise.russianTwist": "Giro Ruso",
    "exercise.plankJack": "Plancha Saltada",
    "exercise.highKneeTap": "Rodilla Alta Tocando",
    "exercise.highKneeJumpRope": "Saltar Cuerda Rodilla Alta",
    "exercise.jumpBox": "Salto a Caja",
    "exercise.suspenderSprinter": "Sprinter con Suspensores",
    "exercise.standingForwardBend": "Doblez Forward Standing Uttanasana",
    "exercise.seatedHamstringStretch": "Estiramiento Isquiotibial Sentado",
    "exercise.kneelingHipFlexor": "Estiramiento de Flexor de Cadera",
    "exercise.doublePigeonPose": "Doble Pose de Paloma",
    "exercise.cowYogaPose": "Pose de Vaca Yoga Bitilasana",

    // How it works section
    "workout.howItWorks": "Cómo funciona",
    "workout.howItWorksDesc": "El temporizador guiado contará hacia atrás cada ejercicio. Enfócate en tu forma mientras rastreamos el tiempo. Los períodos de descanso están integrados entre series.",

    // Body Goals
    "goal.pickerTitle": "¿Cuál es tu objetivo corporal?",
    "goal.pickerSubtitle": "Personalizaremos tu guía nutricional según lo que quieres lograr.",
    "goal.continue": "Continuar",
    "goal.skip": "Omitir por ahora",
    "goal.changeAnytime": "Puedes cambiarlo cuando quieras desde tu perfil.",
    "goal.leanToned.title": "Tonificada",
    "goal.leanToned.short": "Tonificada",
    "goal.leanToned.desc": "Pierde grasa sin perder tu figura",
    "goal.bootyBuilder.title": "Glúteos Más Grandes",
    "goal.bootyBuilder.short": "Glúteos",
    "goal.bootyBuilder.desc": "Crece tus glúteos sin ganar grasa abdominal",
    "goal.flatStomach.title": "Vientre Plano",
    "goal.flatStomach.short": "Vientre Plano",
    "goal.flatStomach.desc": "Come inteligente para un vientre más plano",
    "goal.yourGoal": "Tu Objetivo",
    "goal.changeGoal": "Cambiar objetivo",

    // Today's Goal Status (Home)
    "goalStatus.cardTitle": "Tu Objetivo de Hoy",
    "goalStatus.calories": "calorías",
    "goalStatus.protein": "proteína",
    "goalStatus.target": "meta",
    "goalStatus.scanCta": "Escanea una comida para empezar",
    "goalStatus.empty": "Aún no has registrado comidas hoy",
    "goalStatus.leanToned.light": "Día ligero, vas bien",
    "goalStatus.leanToned.onTrack": "En camino para perder grasa",
    "goalStatus.leanToned.atTarget": "En tu meta de pérdida de grasa",
    "goalStatus.leanToned.over": "Te pasaste un poco — ajusta mañana",
    "goalStatus.bootyBuilder.needMore": "Necesitas más combustible para crecer glúteos",
    "goalStatus.bootyBuilder.fueling": "Alimentando el crecimiento de glúteos",
    "goalStatus.bootyBuilder.plenty": "Mucho combustible hoy",
    "goalStatus.flatStomach.clean": "Elecciones ligeras y limpias",
    "goalStatus.flatStomach.onTrack": "En camino a un vientre más plano",
    "goalStatus.flatStomach.atTarget": "Justo en la meta",
    "goalStatus.flatStomach.over": "Día pesado — puede causar hinchazón",

    // Meal Feedback (Food Scanner)
    "mealFeedback.highProtein": "Mucha proteína — perfecto para tonificar",
    "mealFeedback.lowProtein": "Poca proteína — puede frenar la definición muscular",
    "mealFeedback.heavyBloat": "Comida pesada — puede causar hinchazón",
    "mealFeedback.heavyLean": "Comida pesada — mantén la cena ligera",
    "mealFeedback.addProtein": "Añade más proteína para crecer glúteos",
    "mealFeedback.highFiber": "Alta en fibra — apoya un vientre plano",
    "mealFeedback.balanced": "Elección equilibrada para tu objetivo",
    "mealFeedback.savedToday": "Registrada en tu plan de hoy",
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
    "profile.yourGoal": "Seu Objetivo",
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

    // Profile modal fields
    "profile.name": "Nome",
    "profile.age": "Idade",
    "profile.weight": "Peso",
    "profile.workoutDuration": "Meta Diária de Treino (min)",
    "profile.saveChanges": "Salvar Alterações",
    "profile.minGoal": "Meta Min",
    "profile.fitnessGoals": "Objetivos de Fitness",
    "profile.unitsAndMeasurements": "Unidades e Medidas",
    "profile.helpCenter": "Central de Ajuda",
    "profile.sendFeedback": "Enviar Feedback",

    // Workouts screen
    "workouts.preview": "Visualizar",
    "workouts.min": "min",
    "workouts.exercises": "exercícios",

    // Home screen
    "home.goodMorning": "Bom dia",
    "home.goodAfternoon": "Boa tarde",
    "home.goodEvening": "Boa noite",
    "home.todaysWorkout": "Treino de Hoje",
    "home.continueJourney": "Continue sua jornada fitness",
    "home.startWorkout": "Começar Treino",
    "home.weeklyProgress": "Progresso Semanal",
    "home.workoutsCompleted": "treinos concluídos",
    "home.quickStats": "Estatísticas Rápidas",

    // Buttons & Common
    "common.close": "Fechar",
    "common.cancel": "Cancelar",
    "common.save": "Salvar",
    "common.back": "Voltar",
    "common.next": "Próximo",
    "common.viewAll": "Ver Tudo",
    "common.today": "Hoje",
    "common.details": "Detalhes",

    // Paywall
    "paywall.headline": "Desbloqueie Todo\no seu Potencial",
    "paywall.joinThousands": "Junte-se a milhares de mulheres transformando sua jornada fitness",
    "paywall.feature.workouts": "Todos os 6 treinos desbloqueados",
    "paywall.feature.tracking": "Rastreamento completo de progresso e gráfico muscular",
    "paywall.feature.history": "Histórico de treinos e calendário de sequências",
    "paywall.feature.unlimited": "Treinos diários ilimitados",
    "paywall.monthly.label": "Mensal",
    "paywall.annual.label": "Anual",
    "paywall.lifetime.label": "Vitalício",
    "paywall.badge.popular": "Mais Popular",
    "paywall.badge.value": "Melhor Valor",
    "paywall.sub.monthly": "Cancele quando quiser",
    "paywall.sub.annual": "~$1.25/mês, economize 37%",
    "paywall.sub.lifetime": "Pagamento único, acesso para sempre",
    "paywall.noResults": "Nenhum treino encontrado",
    "paywall.legal": "As assinaturas são renovadas automaticamente. Gerencie nas configurações do dispositivo.",

    // Workout Preview & Player
    "workout.preview": "Visualização do Treino",
    "workout.exercises": "Exercícios",
    "workout.description": "Isto é o que você fará",
    "workout.intensity": "Intensidade",
    "workout.equipment": "Equipamento",
    "workout.start": "INICIAR TREINO",
    "workout.sets": "séries",
    "workout.each": "cada",
    "workout.min": "min",
    "workout.remaining": "RESTANTE",
    "workout.rest": "DESCANSO",
    "workout.getReady": "Prepare-se",
    "workout.setOf": "Série",
    "workout.of": "de",
    "workout.intensityHigh": "Alto",
    "workout.intensityMedium": "Médio",
    "workout.intensityLow": "Baixo",
    "workout.noEquipment": "Sem Equipamento",

    // Bottom navigation tabs
    "nav.home": "Início",
    "nav.workouts": "Treinos",
    "nav.stats": "Estatísticas",
    "nav.profile": "Perfil",

    // WorkoutsScreen
    "workouts.allWorkouts": "Todos os Treinos",
    "workouts.featuredBadge": "Escolha do Editor",
    "workouts.startNow": "Começar Agora",
    "workouts.featured": "Treino em Destaque",

    // Workout titles (from sample data)
    "workout.fullBodyBurn": "Queima Corporal Total",
    "workout.gluteGains": "Ganhos de Glúteos",
    "workout.coreCrusher": "Esmagador de Núcleo",
    "workout.cardioQueen": "Rainha do Cardio",
    "workout.flexibilityFlow": "Fluxo de Flexibilidade",
    "workout.noEquipmentAbs": "Abdominais Sem Equipamento",

    // Exercise names
    "exercise.jumpSquats": "Agachamentos Saltados",
    "exercise.burpees": "Burpees",
    "exercise.mountainClimber": "Escalador de Montanha",
    "exercise.pushUps": "Flexões",
    "exercise.plankJacks": "Prancha Saltada",
    "exercise.gluteBridgeWalk": "Ponte de Glúteos Caminhando",
    "exercise.donkeyKick": "Chute de Burro Cruzado",
    "exercise.lateralWalk": "Caminhada Lateral com Fita",
    "exercise.sumoSquat": "Agachamento Sumo com Peso",
    "exercise.bicycleCrunch": "Abdominal de Bicicleta",
    "exercise.lyingLegRaise": "Elevação de Pernas Deitado",
    "exercise.russianTwist": "Rotação Russa",
    "exercise.plankJack": "Prancha Saltada",
    "exercise.highKneeTap": "Joelho Alto Tocando",
    "exercise.highKneeJumpRope": "Pular Corda Joelho Alto",
    "exercise.jumpBox": "Salto em Caixa",
    "exercise.suspenderSprinter": "Sprinter com Suspensórios",
    "exercise.standingForwardBend": "Flexão para Frente em Pé Uttanasana",
    "exercise.seatedHamstringStretch": "Alongamento de Isquiotibial Sentado",
    "exercise.kneelingHipFlexor": "Alongamento de Flexor do Quadril",
    "exercise.doublePigeonPose": "Pose Dupla do Pombo",
    "exercise.cowYogaPose": "Pose de Vaca Yoga Bitilasana",

    // How it works section
    "workout.howItWorks": "Como funciona",
    "workout.howItWorksDesc": "O cronômetro guiado contará cada exercício. Concentre-se em sua forma enquanto rastreamos o tempo. Os períodos de descanso estão incorporados entre as séries.",

    // Body Goals
    "goal.pickerTitle": "Qual é seu objetivo corporal?",
    "goal.pickerSubtitle": "Vamos personalizar sua orientação nutricional com base no que você quer alcançar.",
    "goal.continue": "Continuar",
    "goal.skip": "Pular por agora",
    "goal.changeAnytime": "Você pode mudar a qualquer momento no seu perfil.",
    "goal.leanToned.title": "Definida",
    "goal.leanToned.short": "Definida",
    "goal.leanToned.desc": "Perca gordura sem perder sua forma",
    "goal.bootyBuilder.title": "Bumbum Maior",
    "goal.bootyBuilder.short": "Bumbum",
    "goal.bootyBuilder.desc": "Cresça seu bumbum sem ganhar gordura na barriga",
    "goal.flatStomach.title": "Barriga Lisa",
    "goal.flatStomach.short": "Barriga Lisa",
    "goal.flatStomach.desc": "Coma melhor para uma barriga mais lisa",
    "goal.yourGoal": "Seu Objetivo",
    "goal.changeGoal": "Mudar objetivo",

    // Today's Goal Status (Home)
    "goalStatus.cardTitle": "Seu Objetivo de Hoje",
    "goalStatus.calories": "calorias",
    "goalStatus.protein": "proteína",
    "goalStatus.target": "meta",
    "goalStatus.scanCta": "Escaneie uma refeição para começar",
    "goalStatus.empty": "Nenhuma refeição registrada hoje",
    "goalStatus.leanToned.light": "Dia leve, no caminho certo",
    "goalStatus.leanToned.onTrack": "No caminho para perder gordura",
    "goalStatus.leanToned.atTarget": "Na sua meta de perda de gordura",
    "goalStatus.leanToned.over": "Passou um pouco — ajuste amanhã",
    "goalStatus.bootyBuilder.needMore": "Precisa de mais combustível para crescer o bumbum",
    "goalStatus.bootyBuilder.fueling": "Alimentando o crescimento do bumbum",
    "goalStatus.bootyBuilder.plenty": "Bastante combustível hoje",
    "goalStatus.flatStomach.clean": "Escolhas leves e limpas",
    "goalStatus.flatStomach.onTrack": "No caminho para uma barriga mais lisa",
    "goalStatus.flatStomach.atTarget": "Bem na meta",
    "goalStatus.flatStomach.over": "Dia pesado — pode causar inchaço",

    // Meal Feedback (Food Scanner)
    "mealFeedback.highProtein": "Muita proteína — ótimo para definição",
    "mealFeedback.lowProtein": "Pouca proteína — pode atrasar a definição muscular",
    "mealFeedback.heavyBloat": "Refeição pesada — pode causar inchaço",
    "mealFeedback.heavyLean": "Refeição pesada — mantenha o jantar leve",
    "mealFeedback.addProtein": "Adicione mais proteína para crescer o bumbum",
    "mealFeedback.highFiber": "Rica em fibra — apoia uma barriga lisa",
    "mealFeedback.balanced": "Escolha equilibrada para seu objetivo",
    "mealFeedback.savedToday": "Adicionada ao seu plano de hoje",
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key: string) => translations.en[key] || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<Language>(getDeviceLanguage());

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (saved === "en" || saved === "es" || saved === "pt") {
          setLangState(saved);
          return;
        }
        setLangState(getDeviceLanguage());
      })
      .catch(() => {
        setLangState(getDeviceLanguage());
      });
  }, []);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang).catch(() => {});
  };

  const t = (key: string) => translations[language][key] || translations.en[key] || key;

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function getExerciseTranslationKey(exerciseName: string): string {
  const nameMap: Record<string, string> = {
    "Jump Squats": "exercise.jumpSquats",
    "Burpees": "exercise.burpees",
    "Mountain Climber": "exercise.mountainClimber",
    "Push-ups": "exercise.pushUps",
    "Plank Jacks": "exercise.plankJacks",
    "Glute Bridge Walk": "exercise.gluteBridgeWalk",
    "Basic to Cross Donkey Kick": "exercise.donkeyKick",
    "Resistance Band Lateral Walk": "exercise.lateralWalk",
    "Bottle Weighted Sumo Squat": "exercise.sumoSquat",
    "Bicycle Crunch": "exercise.bicycleCrunch",
    "Lying Leg Raise": "exercise.lyingLegRaise",
    "Russian Twist": "exercise.russianTwist",
    "Plank Jack": "exercise.plankJack",
    "High Knee Tap": "exercise.highKneeTap",
    "High Knee Jump Rope": "exercise.highKneeJumpRope",
    "Jump Box": "exercise.jumpBox",
    "Suspender Sprinter": "exercise.suspenderSprinter",
    "Standing Forward Bend Uttanasana": "exercise.standingForwardBend",
    "Seated Hamstring Stretch with Chair": "exercise.seatedHamstringStretch",
    "Kneeling Hip Flexor Stretch": "exercise.kneelingHipFlexor",
    "Double Pigeon Pose": "exercise.doublePigeonPose",
    "Cow Yoga Pose Bitilasana": "exercise.cowYogaPose",
  };
  return nameMap[exerciseName] || exerciseName;
}

export function t(key: string): string {
  return translations.en[key] || key;
}

export async function initializeLanguage() {}

export function setLanguage(lang: Language) {}
