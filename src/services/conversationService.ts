import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Language } from './geminiService'

// Language-specific localization
const localization: Record<Language, {
  languageName: string
  welcomeMessage: string
  processingMessage: string
  phaseNames: {
    metadata: string
    verification: string
    customization: string
  }
  buttonLabels: {
    next: string
    back: string
    skip: string
    custom: string
    correct: string
    applyChanges: string
  }
  uiTexts?: {
    correctionsNeeded: string
    correctionsDescription: string
    noIssuesFound: string
    noIssuesDescription: string
    questionProgress: string
    phaseComplete: string
    phaseCompleteDescription: string
    removeTip: string
    generatingSuggestions: string
    suggestedAnswers: string
    customOption: string
    backToSuggestions: string
    processing: string
    finish: string
    answerNext: string
    phaseHeaders?: {
      metadata: {
        title: string
        subtitle: string
      }
      verification: {
        title: string
        subtitle: string
      }
      customization: {
        title: string
        subtitle: string
      }
    }
  }
  modalTexts: {
    correctionChoice: {
      title: string
      description: string
      fromOriginal: string
      fromOriginalDesc: string
      fromCurrent: string
      fromCurrentDesc: string
      cancel: string
      confirm: string
    }
  }
}> = {
  english: {
    languageName: 'English',
    welcomeMessage: 'Welcome to the Smart Interactive Review! I\'ll help you create the perfect notes by understanding your preferences and building a theory about how you like your content structured.',
    processingMessage: 'Thank you for your responses to the {phase} questions. I\'ve updated my understanding.',
    phaseNames: {
      metadata: 'Document Information',
      verification: 'Content Review',
      customization: 'Personal Preferences'
    },
    buttonLabels: {
      next: 'Next',
      back: 'Back',
      skip: 'Skip',
      custom: 'Custom',
      correct: '✅ Correct',
      applyChanges: '✏️ Correct in Editor'
    },
    uiTexts: {
      correctionsNeeded: 'Your Preferences',
      correctionsDescription: 'Based on your answers, here are the improvements I will make to match your preferences. You can remove any that don\'t seem right.',
      noIssuesFound: 'No specific preferences captured yet.',
      noIssuesDescription: 'Please answer some questions in the Review tab to tell me what you want your notes to look like.',
      questionProgress: 'Question {current} of {total}',
      phaseComplete: '{phase} Phase Complete!',
      phaseCompleteDescription: 'You can switch to another phase or check the Correct tab to see the issues I\'ve identified.',
      removeTip: 'Remove this statement',
      generatingSuggestions: 'Generating suggestions...',
      suggestedAnswers: 'Suggested answers:',
      customOption: 'None of these fit - I\'ll type my own',
      backToSuggestions: 'Back to suggestions',
      processing: 'Processing...',
      finish: 'Finish',
      answerNext: 'Answer & Next',
      phaseHeaders: {
        metadata: {
          title: 'Note Metadata & Format',
          subtitle: 'Help me understand what these notes are for and how you like them structured.'
        },
        verification: {
          title: 'Content Verification',
          subtitle: 'Let\'s verify that I understood your content correctly and didn\'t miss anything important.'
        },
        customization: {
          title: 'Custom Preferences',
          subtitle: 'Tell me about any specific changes or customizations you\'d like to make.'
        }
      }
    },
    modalTexts: {
      correctionChoice: {
        title: 'How would you like to apply corrections?',
        description: 'Choose how to apply the corrections based on your preferences:',
        fromOriginal: 'Start from Original',
        fromOriginalDesc: 'Apply all improvements to the original transcribed text',
        fromCurrent: 'Build on Current',
        fromCurrentDesc: 'Add refinements to the current improved version',
        cancel: 'Cancel',
        confirm: 'Apply Corrections'
      }
    }
  },
  german: {
    languageName: 'Deutsch',
    welcomeMessage: 'Willkommen zur Smart Interactive Review! Ich helfe Ihnen dabei, die perfekten Notizen zu erstellen, indem ich Ihre Präferenzen verstehe und eine Theorie darüber entwickle, wie Sie Ihre Inhalte strukturieren möchten.',
    processingMessage: 'Vielen Dank für Ihre Antworten zu den {phase}-Fragen. Ich habe mein Verständnis aktualisiert.',
    phaseNames: {
      metadata: 'Dokumentinformationen',
      verification: 'Inhaltsüberprüfung',
      customization: 'Persönliche Einstellungen'
    },
    buttonLabels: {
      next: 'Weiter',
      back: 'Zurück',
      skip: 'Überspringen',
      custom: 'Benutzerdefiniert',
      correct: '✅ Korrigieren',
      applyChanges: '✏️ Im Editor korrigieren'
    },
    uiTexts: {
      correctionsNeeded: 'Ihre Wünsche',
      correctionsDescription: 'Basierend auf Ihren Antworten sind hier die Verbesserungen, die ich vornehmen werde, um Ihren Wünschen zu entsprechen. Sie können alle entfernen, die nicht richtig erscheinen.',
      noIssuesFound: 'Noch keine spezifischen Wünsche erfasst.',
      noIssuesDescription: 'Bitte beantworten Sie einige Fragen im Review-Tab, um mir zu sagen, wie Ihre Notizen aussehen sollen.',
      questionProgress: 'Frage {current} von {total}',
      phaseComplete: '{phase}-Phase abgeschlossen!',
      phaseCompleteDescription: 'Sie können zu einer anderen Phase wechseln oder den Korrigieren-Tab überprüfen, um die Probleme zu sehen, die ich identifiziert habe.',
      removeTip: 'Diese Aussage entfernen',
      generatingSuggestions: 'Vorschläge werden generiert...',
      suggestedAnswers: 'Vorgeschlagene Antworten:',
      customOption: 'Keine davon passt - Ich tippe meine eigene',
      backToSuggestions: 'Zurück zu den Vorschlägen',
      processing: 'Verarbeitung...',
      finish: 'Beenden',
      answerNext: 'Antworten & Weiter',
      phaseHeaders: {
        metadata: {
          title: 'Notizen-Metadaten & Format',
          subtitle: 'Helfen Sie mir zu verstehen, wofür diese Notizen sind und wie Sie sie strukturiert haben möchten.'
        },
        verification: {
          title: 'Inhaltsüberprüfung',
          subtitle: 'Lassen Sie uns überprüfen, ob ich Ihren Inhalt richtig verstanden habe und nichts Wichtiges übersehen habe.'
        },
        customization: {
          title: 'Persönliche Einstellungen',
          subtitle: 'Erzählen Sie mir von spezifischen Änderungen oder Anpassungen, die Sie vornehmen möchten.'
        }
      }
    },
    modalTexts: {
      correctionChoice: {
        title: 'Wie möchten Sie die Korrekturen anwenden?',
        description: 'Wählen Sie aus, wie die Korrekturen basierend auf Ihren Präferenzen angewendet werden sollen:',
        fromOriginal: 'Vom Original starten',
        fromOriginalDesc: 'Alle Verbesserungen auf den ursprünglichen transkribierten Text anwenden',
        fromCurrent: 'Auf Aktuellem aufbauen',
        fromCurrentDesc: 'Verbesserungen zur aktuellen verbesserten Version hinzufügen',
        cancel: 'Abbrechen',
        confirm: 'Korrekturen anwenden'
      }
    }
  },
  french: {
    languageName: 'Français',
    welcomeMessage: 'Bienvenue dans la Smart Interactive Review ! Je vais vous aider à créer les notes parfaites en comprenant vos préférences et en construisant une théorie sur la façon dont vous aimez structurer votre contenu.',
    processingMessage: 'Merci pour vos réponses aux questions {phase}. J\'ai mis à jour ma compréhension.',
    phaseNames: {
      metadata: 'Informations du document',
      verification: 'Révision du contenu',
      customization: 'Préférences personnelles'
    },
    buttonLabels: {
      next: 'Suivant',
      back: 'Retour',
      skip: 'Ignorer',
      custom: 'Personnalisé',
      correct: '✅ Corriger',
      applyChanges: '✏️ Corriger dans l\'éditeur'
    },
    uiTexts: {
      correctionsNeeded: 'Vos préférences',
      correctionsDescription: 'Basé sur vos réponses, voici les améliorations que je vais apporter pour correspondre à vos préférences. Vous pouvez supprimer celles qui ne semblent pas correctes.',
      noIssuesFound: 'Aucune préférence spécifique capturée encore.',
      noIssuesDescription: 'Veuillez répondre à quelques questions dans l\'onglet Révision pour me dire à quoi vos notes devraient ressembler.',
      questionProgress: 'Question {current} sur {total}',
      phaseComplete: 'Phase {phase} terminée !',
      phaseCompleteDescription: 'Vous pouvez passer à une autre phase ou vérifier l\'onglet Corriger pour voir les problèmes que j\'ai identifiés.',
      removeTip: 'Supprimer cette déclaration',
      generatingSuggestions: 'Génération de suggestions...',
      suggestedAnswers: 'Réponses suggérées :',
      customOption: 'Aucune de ces réponses ne convient - Je vais taper la mienne',
      backToSuggestions: 'Retour aux suggestions',
      processing: 'Traitement...',
      finish: 'Terminer',
      answerNext: 'Répondre et suivant',
      phaseHeaders: {
        metadata: {
          title: 'Métadonnées et format des notes',
          subtitle: 'Aidez-moi à comprendre à quoi servent ces notes et comment vous aimez les structurer.'
        },
        verification: {
          title: 'Vérification du contenu',
          subtitle: 'Vérifions que j\'ai bien compris votre contenu et que je n\'ai rien manqué d\'important.'
        },
        customization: {
          title: 'Préférences personnalisées',
          subtitle: 'Parlez-moi de changements ou personnalisations spécifiques que vous aimeriez apporter.'
        }
      }
    },
    modalTexts: {
      correctionChoice: {
        title: 'Comment souhaitez-vous appliquer les corrections ?',
        description: 'Choisissez comment appliquer les corrections selon vos préférences :',
        fromOriginal: 'Partir de l\'original',
        fromOriginalDesc: 'Appliquer toutes les améliorations au texte transcrit original',
        fromCurrent: 'Construire sur l\'actuel',
        fromCurrentDesc: 'Ajouter des raffinements à la version améliorée actuelle',
        cancel: 'Annuler',
        confirm: 'Appliquer les corrections'
      }
    }
  },
  // For brevity, I'll add just a few more languages. The pattern is clear for the rest
  spanish: {
    languageName: 'Español',
    welcomeMessage: '¡Bienvenido a la Smart Interactive Review! Te ayudaré a crear las notas perfectas entendiendo tus preferencias y construyendo una teoría sobre cómo te gusta estructurar tu contenido.',
    processingMessage: 'Gracias por tus respuestas a las preguntas de {phase}. He actualizado mi comprensión.',
    phaseNames: {
      metadata: 'Información del documento',
      verification: 'Revisión del contenido',
      customization: 'Preferencias personales'
    },
    buttonLabels: {
      next: 'Siguiente',
      back: 'Atrás',
      skip: 'Omitir',
      custom: 'Personalizado',
      correct: '✅ Corregir',
      applyChanges: '✏️ Corregir en el editor'
    },
    uiTexts: {
      correctionsNeeded: 'Tus preferencias',
      correctionsDescription: 'Basado en tus respuestas, aquí están las mejoras que haré para coincidir con tus preferencias. Puedes eliminar las que no parezcan correctas.',
      noIssuesFound: 'Aún no se han capturado preferencias específicas.',
      noIssuesDescription: 'Por favor responde algunas preguntas en la pestaña Revisar para decirme cómo deberían verse tus notas.',
      questionProgress: 'Pregunta {current} de {total}',
      phaseComplete: '¡Fase {phase} completada!',
      phaseCompleteDescription: 'Puedes cambiar a otra fase o revisar la pestaña Corregir para ver los problemas que he identificado.',
      removeTip: 'Eliminar esta declaración',
      generatingSuggestions: 'Generando sugerencias...',
      suggestedAnswers: 'Respuestas sugeridas:',
      customOption: 'Ninguna de estas encaja - Escribiré la mía',
      backToSuggestions: 'Volver a las sugerencias',
      processing: 'Procesando...',
      finish: 'Finalizar',
      answerNext: 'Responder y siguiente',
      phaseHeaders: {
        metadata: {
          title: 'Metadatos y formato de notas',
          subtitle: 'Ayúdame a entender para qué son estas notas y cómo te gusta estructurarlas.'
        },
        verification: {
          title: 'Verificación del contenido',
          subtitle: 'Verifiquemos que entendí tu contenido correctamente y no perdí nada importante.'
        },
        customization: {
          title: 'Preferencias personalizadas',
          subtitle: 'Cuéntame sobre cambios específicos o personalizaciones que te gustaría hacer.'
        }
      }
    },
    modalTexts: {
      correctionChoice: {
        title: '¿Cómo te gustaría aplicar las correcciones?',
        description: 'Elige cómo aplicar las correcciones según tus preferencias:',
        fromOriginal: 'Comenzar desde el original',
        fromOriginalDesc: 'Aplicar todas las mejoras al texto transcrito original',
        fromCurrent: 'Construir sobre el actual',
        fromCurrentDesc: 'Agregar refinamientos a la versión mejorada actual',
        cancel: 'Cancelar',
        confirm: 'Aplicar correcciones'
      }
    }
  },
  // Add basic translations for remaining languages
  italian: {
    languageName: 'Italiano',
    welcomeMessage: 'Benvenuto alla Smart Interactive Review! Ti aiuterò a creare le note perfette comprendendo le tue preferenze e costruendo una teoria su come ti piace strutturare i tuoi contenuti.',
    processingMessage: 'Grazie per le tue risposte alle domande {phase}. Ho aggiornato la mia comprensione.',
    phaseNames: { metadata: 'Informazioni documento', verification: 'Revisione contenuto', customization: 'Preferenze personali' },
    buttonLabels: { next: 'Avanti', back: 'Indietro', skip: 'Salta', custom: 'Personalizzato', correct: '✅ Correggi', applyChanges: '✏️ Correggi nell\'editor' },
    uiTexts: { correctionsNeeded: 'Correzioni necessarie', correctionsDescription: 'Basato sulla nostra interazione, ecco i problemi che ho identificato che devono essere corretti. Puoi rimuovere qualsiasi problema non corretto.', noIssuesFound: 'Nessun problema identificato ancora.', noIssuesDescription: 'Rispondi ad alcune domande nella scheda Revisione per aiutarmi a identificare aree di miglioramento.', questionProgress: 'Domanda {current} di {total}', phaseComplete: 'Fase {phase} completata!', phaseCompleteDescription: 'Puoi passare a un\'altra fase o controllare la scheda Correggi per vedere i problemi che ho identificato.', removeTip: 'Rimuovi questa dichiarazione', generatingSuggestions: 'Generando suggerimenti...', suggestedAnswers: 'Risposte suggerite:', customOption: 'Nessuna di queste si adatta - Scriverò la mia', backToSuggestions: 'Torna ai suggerimenti', processing: 'Elaborazione...', finish: 'Finisci', answerNext: 'Rispondi e avanti' },
    modalTexts: { correctionChoice: { title: 'Come vorresti applicare le correzioni?', description: 'Scegli come applicare le correzioni secondo le tue preferenze:', fromOriginal: 'Inizia dall\'originale', fromOriginalDesc: 'Applica tutti i miglioramenti al testo trascritto originale', fromCurrent: 'Costruisci sull\'attuale', fromCurrentDesc: 'Aggiungi raffinamenti alla versione migliorata attuale', cancel: 'Annulla', confirm: 'Applica correzioni' } }
  },
  portuguese: {
    languageName: 'Português',
    welcomeMessage: 'Bem-vindo à Smart Interactive Review! Vou ajudá-lo a criar as notas perfeitas entendendo suas preferências e construindo uma teoria sobre como você gosta de estruturar seu conteúdo.',
    processingMessage: 'Obrigado pelas suas respostas às perguntas {phase}. Atualizei minha compreensão.',
    phaseNames: { metadata: 'Informações do documento', verification: 'Revisão do conteúdo', customization: 'Preferências pessoais' },
    buttonLabels: { next: 'Próximo', back: 'Voltar', skip: 'Pular', custom: 'Personalizado', correct: '✅ Corrigir', applyChanges: '✏️ Corrigir no editor' },
    uiTexts: { correctionsNeeded: 'Correções necessárias', correctionsDescription: 'Baseado na nossa interação, aqui estão os problemas que identifiquei que precisam ser corrigidos. Você pode remover qualquer problema incorreto.', noIssuesFound: 'Nenhum problema identificado ainda.', noIssuesDescription: 'Responda algumas perguntas na aba Revisão para me ajudar a identificar áreas de melhoria.', questionProgress: 'Pergunta {current} de {total}', phaseComplete: 'Fase {phase} concluída!', phaseCompleteDescription: 'Você pode mudar para outra fase ou verificar a aba Corrigir para ver os problemas que identifiquei.', removeTip: 'Remover esta declaração', generatingSuggestions: 'Gerando sugestões...', suggestedAnswers: 'Respostas sugeridas:', customOption: 'Nenhuma dessas se adapta - Vou digitar a minha', backToSuggestions: 'Voltar às sugestões', processing: 'Processando...', finish: 'Finalizar', answerNext: 'Responder e próximo' },
    modalTexts: { correctionChoice: { title: 'Como gostaria de aplicar as correções?', description: 'Escolha como aplicar as correções de acordo com suas preferências:', fromOriginal: 'Começar do original', fromOriginalDesc: 'Aplicar todas as melhorias ao texto transcrito original', fromCurrent: 'Construir sobre o atual', fromCurrentDesc: 'Adicionar refinamentos à versão melhorada atual', cancel: 'Cancelar', confirm: 'Aplicar correções' } }
  },
  // Add remaining languages with English fallbacks for now
  dutch: { 
    languageName: 'Nederlands', 
    welcomeMessage: 'Welkom bij de Smart Interactive Review! Ik help je de perfecte notities te maken door je voorkeuren te begrijpen en een theorie op te bouwen over hoe je je inhoud wilt structureren.', 
    processingMessage: 'Bedankt voor je antwoorden op de {phase} vragen. Ik heb mijn begrip bijgewerkt.', 
    phaseNames: { metadata: 'Documentinformatie', verification: 'Inhoudsbeoordeling', customization: 'Persoonlijke voorkeuren' }, 
    buttonLabels: { next: 'Volgende', back: 'Terug', skip: 'Overslaan', custom: 'Aangepast', correct: '✅ Corrigeren', applyChanges: '✏️ Corrigeren in editor' }, 
    uiTexts: { correctionsNeeded: 'Correcties nodig', correctionsDescription: 'Gebaseerd op onze interactie zijn hier de problemen die ik heb geïdentificeerd die gecorrigeerd moeten worden. Je kunt onjuiste problemen verwijderen.', noIssuesFound: 'Nog geen problemen geïdentificeerd.', noIssuesDescription: 'Beantwoord enkele vragen in het Review-tabblad om me te helpen verbetergebieden te identificeren.', questionProgress: 'Vraag {current} van {total}', phaseComplete: 'Fase {phase} voltooid!', phaseCompleteDescription: 'Je kunt naar een andere fase gaan of het Corrigeren-tabblad controleren om de problemen te zien die ik heb geïdentificeerd.', removeTip: 'Deze verklaring verwijderen', generatingSuggestions: 'Suggesties genereren...', suggestedAnswers: 'Voorgestelde antwoorden:', customOption: 'Geen van deze past - Ik typ mijn eigen', backToSuggestions: 'Terug naar suggesties', processing: 'Verwerken...', finish: 'Voltooien', answerNext: 'Antwoorden en volgende' },
    modalTexts: { correctionChoice: { title: 'Hoe wil je de correcties toepassen?', description: 'Kies hoe je de correcties wilt toepassen volgens je voorkeuren:', fromOriginal: 'Begin bij origineel', fromOriginalDesc: 'Alle verbeteringen toepassen op de originele getranscribeerde tekst', fromCurrent: 'Bouw voort op huidige', fromCurrentDesc: 'Verfijningen toevoegen aan de huidige verbeterde versie', cancel: 'Annuleren', confirm: 'Correcties toepassen' } } 
  },
  polish: { 
    languageName: 'Polski', 
    welcomeMessage: 'Witamy w Smart Interactive Review! Pomogę Ci stworzyć idealne notatki, rozumiejąc Twoje preferencje i budując teorię o tym, jak lubisz strukturyzować swoje treści.', 
    processingMessage: 'Dziękuję za Twoje odpowiedzi na pytania {phase}. Zaktualizowałem moje zrozumienie.', 
    phaseNames: { metadata: 'Informacje o dokumencie', verification: 'Przegląd treści', customization: 'Preferencje osobiste' }, 
    buttonLabels: { next: 'Dalej', back: 'Wstecz', skip: 'Pomiń', custom: 'Niestandardowy', correct: '✅ Popraw', applyChanges: '✏️ Popraw w edytorze' }, 
    uiTexts: { correctionsNeeded: 'Potrzebne poprawki', correctionsDescription: 'Na podstawie naszej interakcji, oto problemy, które zidentyfikowałem i które wymagają poprawienia. Możesz usunąć nieprawidłowe problemy.', noIssuesFound: 'Nie zidentyfikowano jeszcze problemów.', noIssuesDescription: 'Odpowiedz na kilka pytań w zakładce Przegląd, aby pomóc mi zidentyfikować obszary do poprawy.', questionProgress: 'Pytanie {current} z {total}', phaseComplete: 'Faza {phase} zakończona!', phaseCompleteDescription: 'Możesz przejść do innej fazy lub sprawdzić zakładkę Popraw, aby zobaczyć problemy, które zidentyfikowałem.', removeTip: 'Usuń to stwierdzenie', generatingSuggestions: 'Generowanie sugestii...', suggestedAnswers: 'Sugerowane odpowiedzi:', customOption: 'Żadna z tych nie pasuje - wpiszę własną', backToSuggestions: 'Powrót do sugestii', processing: 'Przetwarzanie...', finish: 'Zakończ', answerNext: 'Odpowiedz i dalej' },
    modalTexts: { correctionChoice: { title: 'Jak chcesz zastosować poprawki?', description: 'Wybierz sposób zastosowania poprawek zgodnie z Twoimi preferencjami:', fromOriginal: 'Zacznij od oryginału', fromOriginalDesc: 'Zastosuj wszystkie ulepszenia do oryginalnego transkrybowanego tekstu', fromCurrent: 'Buduj na obecnym', fromCurrentDesc: 'Dodaj udoskonalenia do obecnej ulepszonej wersji', cancel: 'Anuluj', confirm: 'Zastosuj poprawki' } } 
  },
  czech: { languageName: 'Čeština', welcomeMessage: 'Vítejte v Smart Interactive Review! Pomůžu vám vytvořit dokonalé poznámky tím, že pochopím vaše preference a vytvořím teorii o tom, jak rádi strukturujete svůj obsah.', processingMessage: 'Děkuji za vaše odpovědi na otázky {phase}. Aktualizoval jsem své pochopení.', phaseNames: { metadata: 'Informace o dokumentu', verification: 'Kontrola obsahu', customization: 'Osobní preference' }, buttonLabels: { next: 'Další', back: 'Zpět', skip: 'Přeskočit', custom: 'Vlastní', correct: '✅ Opravit', applyChanges: '✏️ Opravit v editoru' }, modalTexts: { correctionChoice: { title: 'Jak chcete použít opravy?', description: 'Vyberte způsob použití oprav podle vašich preferencí:', fromOriginal: 'Začít od originálu', fromOriginalDesc: 'Použít všechna vylepšení na původní přepsaný text', fromCurrent: 'Stavět na současném', fromCurrentDesc: 'Přidat vylepšení k současné vylepšené verzi', cancel: 'Zrušit', confirm: 'Použít opravy' } } },
  slovak: { languageName: 'Slovenčina', welcomeMessage: 'Vitajte v Smart Interactive Review! Pomôžem vám vytvoriť dokonalé poznámky pochopením vašich preferencií a vytvorením teórie o tom, ako radi štruktúrujete svoj obsah.', processingMessage: 'Ďakujem za vaše odpovede na otázky {phase}. Aktualizoval som svoje pochopenie.', phaseNames: { metadata: 'Informácie o dokumente', verification: 'Kontrola obsahu', customization: 'Osobné preferencie' }, buttonLabels: { next: 'Ďalej', back: 'Späť', skip: 'Preskočiť', custom: 'Vlastný', correct: '✅ Opraviť', applyChanges: '✏️ Opraviť v editore' }, modalTexts: { correctionChoice: { title: 'Ako chcete použiť opravy?', description: 'Vyberte spôsob použitia opráv podľa vašich preferencií:', fromOriginal: 'Začať od originálu', fromOriginalDesc: 'Použiť všetky vylepšenia na pôvodný prepísaný text', fromCurrent: 'Stavať na súčasnom', fromCurrentDesc: 'Pridať vylepšenia k súčasnej vylepšenej verzii', cancel: 'Zrušiť', confirm: 'Použiť opravy' } } },
  hungarian: { languageName: 'Magyar', welcomeMessage: 'Üdvözöljük a Smart Interactive Review-ban! Segítek létrehozni a tökéletes jegyzeteket azáltal, hogy megértem a preferenciáit és elméletet építek arról, hogyan szereti strukturálni a tartalmát.', processingMessage: 'Köszönöm a válaszait a {phase} kérdésekre. Frissítettem a megértésemet.', phaseNames: { metadata: 'Dokumentum információk', verification: 'Tartalom áttekintés', customization: 'Személyes beállítások' }, buttonLabels: { next: 'Következő', back: 'Vissza', skip: 'Kihagyás', custom: 'Egyéni', correct: '✅ Javítás', applyChanges: '✏️ Javítás a szerkesztőben' }, modalTexts: { correctionChoice: { title: 'Hogyan szeretné alkalmazni a javításokat?', description: 'Válassza ki, hogyan alkalmazza a javításokat a preferenciái szerint:', fromOriginal: 'Kezdés az eredetitől', fromOriginalDesc: 'Minden fejlesztés alkalmazása az eredeti átírt szövegre', fromCurrent: 'Építés a jelenlegire', fromCurrentDesc: 'Finomítások hozzáadása a jelenlegi javított verzióhoz', cancel: 'Mégse', confirm: 'Javítások alkalmazása' } } },
  romanian: { languageName: 'Română', welcomeMessage: 'Bun venit la Smart Interactive Review! Vă voi ajuta să creați notițele perfecte prin înțelegerea preferințelor dvs. și construirea unei teorii despre cum vă place să vă structurați conținutul.', processingMessage: 'Mulțumesc pentru răspunsurile dvs. la întrebările {phase}. Mi-am actualizat înțelegerea.', phaseNames: { metadata: 'Informații document', verification: 'Revizuire conținut', customization: 'Preferințe personale' }, buttonLabels: { next: 'Următorul', back: 'Înapoi', skip: 'Sări', custom: 'Personalizat', correct: '✅ Corectează', applyChanges: '✏️ Corectează în editor' }, modalTexts: { correctionChoice: { title: 'Cum doriți să aplicați corecturile?', description: 'Alegeți cum să aplicați corecturile conform preferințelor dvs.:', fromOriginal: 'Începeți de la original', fromOriginalDesc: 'Aplicați toate îmbunătățirile la textul transcris original', fromCurrent: 'Construiți pe actualul', fromCurrentDesc: 'Adăugați rafinamente la versiunea îmbunătățită actuală', cancel: 'Anulează', confirm: 'Aplică corecturile' } } },
  bulgarian: { languageName: 'Български', welcomeMessage: 'Добре дошли в Smart Interactive Review! Ще ви помогна да създадете перфектни бележки, като разбера вашите предпочитания и изградя теория за това как обичате да структурирате съдържанието си.', processingMessage: 'Благодаря за отговорите ви на въпросите за {phase}. Актуализирах разбирането си.', phaseNames: { metadata: 'Информация за документа', verification: 'Преглед на съдържанието', customization: 'Лични предпочитания' }, buttonLabels: { next: 'Следващ', back: 'Назад', skip: 'Пропусни', custom: 'Персонализиран', correct: '✅ Коригирай', applyChanges: '✏️ Коригирай в редактора' }, modalTexts: { correctionChoice: { title: 'Как искате да приложите корекциите?', description: 'Изберете как да приложите корекциите според вашите предпочитания:', fromOriginal: 'Започни от оригинала', fromOriginalDesc: 'Приложи всички подобрения към оригиналния транскрибиран текст', fromCurrent: 'Надгради текущия', fromCurrentDesc: 'Добави подобрения към текущата подобрена версия', cancel: 'Отказ', confirm: 'Приложи корекциите' } } },
  croatian: { languageName: 'Hrvatski', welcomeMessage: 'Dobrodošli u Smart Interactive Review! Pomoći ću vam stvoriti savršene bilješke razumijevanjem vaših preferencija i izgradnjom teorije o tome kako volite strukturirati svoj sadržaj.', processingMessage: 'Hvala na vašim odgovorima na {phase} pitanja. Ažurirao sam svoje razumijevanje.', phaseNames: { metadata: 'Informacije o dokumentu', verification: 'Pregled sadržaja', customization: 'Osobne preferencije' }, buttonLabels: { next: 'Sljedeći', back: 'Natrag', skip: 'Preskoči', custom: 'Prilagođeno', correct: '✅ Ispravi', applyChanges: '✏️ Ispravi u editoru' }, modalTexts: { correctionChoice: { title: 'Kako biste htjeli primijeniti ispravke?', description: 'Odaberite kako primijeniti ispravke prema vašim preferencijama:', fromOriginal: 'Počni od izvornika', fromOriginalDesc: 'Primijeni sva poboljšanja na izvorni prepisani tekst', fromCurrent: 'Nadograditi trenutni', fromCurrentDesc: 'Dodaj poboljšanja trenutnoj poboljšanoj verziji', cancel: 'Otkaži', confirm: 'Primijeni ispravke' } } },
  serbian: { languageName: 'Српски', welcomeMessage: 'Добродошли у Smart Interactive Review! Помоћи ћу вам да створите савршене белешке разумевањем ваших преференција и изградњом теорије о томе како волите да структурирате свој садржај.', processingMessage: 'Хвала на вашим одговорима на {phase} питања. Ажурирао сам своје разумевање.', phaseNames: { metadata: 'Информације о документу', verification: 'Преглед садржаја', customization: 'Личне преференције' }, buttonLabels: { next: 'Следећи', back: 'Назад', skip: 'Прескочи', custom: 'Прилагођено', correct: '✅ Исправи', applyChanges: '✏️ Исправи у едитору' }, modalTexts: { correctionChoice: { title: 'Како бисте хтели да примените исправке?', description: 'Одаберите како да примените исправке према вашим преференцијама:', fromOriginal: 'Почни од оригинала', fromOriginalDesc: 'Примени сва побољшања на оригинални преписани текст', fromCurrent: 'Надогради тренутни', fromCurrentDesc: 'Додај побољшања тренутној побољшаној верзији', cancel: 'Откажи', confirm: 'Примени исправке' } } },
  slovenian: { languageName: 'Slovenščina', welcomeMessage: 'Dobrodošli v Smart Interactive Review! Pomagal vam bom ustvariti popolne zapiske z razumevanjem vaših preferenc in gradnjo teorije o tem, kako radi strukturirate svojo vsebino.', processingMessage: 'Hvala za vaše odgovore na {phase} vprašanja. Posodobil sem svoje razumevanje.', phaseNames: { metadata: 'Informacije o dokumentu', verification: 'Pregled vsebine', customization: 'Osebne preference' }, buttonLabels: { next: 'Naprej', back: 'Nazaj', skip: 'Preskoči', custom: 'Po meri', correct: '✅ Popravi', applyChanges: '✏️ Popravi v urejevalniku' }, modalTexts: { correctionChoice: { title: 'Kako bi radi uporabili popravke?', description: 'Izberite, kako uporabiti popravke glede na vaše preference:', fromOriginal: 'Začni z izvirnikom', fromOriginalDesc: 'Uporabi vse izboljšave na izvirno prepisano besedilo', fromCurrent: 'Nadgradi trenutno', fromCurrentDesc: 'Dodaj izboljšave k trenutni izboljšani različici', cancel: 'Prekliči', confirm: 'Uporabi popravke' } } },
  estonian: { languageName: 'Eesti', welcomeMessage: 'Tere tulemast Smart Interactive Review\'sse! Aitan teil luua täiuslikke märkmeid, mõistes teie eelistusi ja ehitades teooria selle kohta, kuidas teile meeldib oma sisu struktureerida.', processingMessage: 'Tänan teid {phase} küsimustele vastamise eest. Olen oma arusaamist värskendanud.', phaseNames: { metadata: 'Dokumendi teave', verification: 'Sisu ülevaade', customization: 'Isiklikud eelistused' }, buttonLabels: { next: 'Edasi', back: 'Tagasi', skip: 'Jäta vahele', custom: 'Kohandatud', correct: '✅ Paranda', applyChanges: '✏️ Paranda redaktoris' }, modalTexts: { correctionChoice: { title: 'Kuidas soovite parandusi rakendada?', description: 'Valige, kuidas rakendada parandusi vastavalt teie eelistustele:', fromOriginal: 'Alustage originaalist', fromOriginalDesc: 'Rakendage kõik täiustused algsele transkribeeritud tekstile', fromCurrent: 'Ehitada praegusele', fromCurrentDesc: 'Lisage täiustusi praegusele täiustatud versioonile', cancel: 'Tühista', confirm: 'Rakenda parandused' } } },
  latvian: { languageName: 'Latviešu', welcomeMessage: 'Laipni lūdzam Smart Interactive Review! Es jums palīdzēšu izveidot perfektus piezīmes, saprotot jūsu preferences un veidojot teoriju par to, kā jums patīk strukturēt savu saturu.', processingMessage: 'Paldies par jūsu atbildēm uz {phase} jautājumiem. Esmu atjauninājis savu izpratni.', phaseNames: { metadata: 'Dokumenta informācija', verification: 'Satura pārskats', customization: 'Personīgās preferences' }, buttonLabels: { next: 'Tālāk', back: 'Atpakaļ', skip: 'Izlaist', custom: 'Pielāgots', correct: '✅ Labot', applyChanges: '✏️ Labot redaktorā' }, modalTexts: { correctionChoice: { title: 'Kā vēlaties piemērot labojumus?', description: 'Izvēlieties, kā piemērot labojumus atbilstoši jūsu preferencēm:', fromOriginal: 'Sākt no oriģināla', fromOriginalDesc: 'Piemērot visus uzlabojumus oriģinālajam transkribētajam tekstam', fromCurrent: 'Veidot uz pašreizējā', fromCurrentDesc: 'Pievienot uzlabojumus pašreizējai uzlabotajai versijai', cancel: 'Atcelt', confirm: 'Piemērot labojumus' } } },
  lithuanian: { languageName: 'Lietuvių', welcomeMessage: 'Sveiki atvykę į Smart Interactive Review! Padėsiu jums sukurti tobulus užrašus, suprasdamas jūsų pageidavimus ir kurdamas teoriją apie tai, kaip mėgstate struktūruoti savo turinį.', processingMessage: 'Ačiū už jūsų atsakymus į {phase} klausimus. Atnaujinau savo supratimą.', phaseNames: { metadata: 'Dokumento informacija', verification: 'Turinio peržiūra', customization: 'Asmeniniai nustatymai' }, buttonLabels: { next: 'Toliau', back: 'Atgal', skip: 'Praleisti', custom: 'Pasirinktinis', correct: '✅ Taisyti', applyChanges: '✏️ Taisyti redaktoriuje' }, modalTexts: { correctionChoice: { title: 'Kaip norėtumėte pritaikyti pataisymus?', description: 'Pasirinkite, kaip pritaikyti pataisymus pagal jūsų pageidavimus:', fromOriginal: 'Pradėti nuo originalo', fromOriginalDesc: 'Pritaikyti visus pagerinimus originaliam transkribuotam tekstui', fromCurrent: 'Kurti ant dabartinio', fromCurrentDesc: 'Pridėti pagerinimus prie dabartinės pagerintos versijos', cancel: 'Atšaukti', confirm: 'Pritaikyti pataisymus' } } }
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface TheoryStatement {
  id: string
  category: string
  statement: string
  confidence: number
  source: string // Which phase/question generated this
}

export interface PhaseResponse {
  question: string
  answer: string | string[]
  questionId: string
}

export type ReviewPhase = 'metadata' | 'verification' | 'customization'

export interface EnhancedConversationState {
  messages: ConversationMessage[]
  currentPhase: ReviewPhase
  theoryStatements: TheoryStatement[]
  isComplete: boolean
  phaseResponses: Record<ReviewPhase, PhaseResponse[]>
}

export interface ConversationState {
  messages: ConversationMessage[]
  currentTopic: string | null
  suggestedImprovements: string[]
  isComplete: boolean
  reviewPhase: 'initial' | 'questioning' | 'refining' | 'finalizing'
  // Enhanced properties
  currentPhase?: ReviewPhase
  theoryStatements?: TheoryStatement[]
  phaseResponses?: Record<ReviewPhase, PhaseResponse[]>
}

export class ConversationAgent {
  private genAI: GoogleGenerativeAI
  private state: ConversationState
  private originalText: string
  private improvedText: string

  constructor(apiKey: string, originalText: string, improvedText: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.originalText = originalText
    this.improvedText = improvedText
    this.state = {
      messages: [],
      currentTopic: null,
      suggestedImprovements: [],
      isComplete: false,
      reviewPhase: 'initial'
    }
  }

  getState(): ConversationState {
    return { ...this.state }
  }

  async startReview(): Promise<ConversationMessage> {
    const initialPrompt = `I'm an AI assistant helping you review and improve your transcribed notes. I've already created an improved version of your original text, but I'd like to work with you interactively to make it even better.

Let me analyze what I've done so far and ask you some questions to refine it further.

**Original text length:** ${this.originalText.length} characters
**Improved text length:** ${this.improvedText.length} characters

I'll ask you a few questions to understand your preferences and make targeted improvements. Shall we begin?

**First question:** What is the primary purpose of these notes? (e.g., study material, meeting minutes, research notes, lecture notes)`

    const message: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: initialPrompt,
      timestamp: new Date()
    }

    this.state.messages.push(message)
    this.state.reviewPhase = 'questioning'
    
    return message
  }

  async processUserResponse(userInput: string): Promise<ConversationMessage> {
    // Add user message to conversation
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    }
    this.state.messages.push(userMessage)

    // Generate AI response based on current phase and conversation history
    const aiResponse = await this.generateContextualResponse(userInput)
    
    const aiMessage: ConversationMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    }
    this.state.messages.push(aiMessage)

    return aiMessage
  }

  private async generateContextualResponse(userInput: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const conversationHistory = this.state.messages
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n')

    let systemPrompt = ''
    
    switch (this.state.reviewPhase) {
      case 'questioning':
        systemPrompt = `You are an AI assistant helping to improve transcribed notes through interactive conversation. 

CURRENT PHASE: Asking clarifying questions to understand user preferences.

CONVERSATION SO FAR:
${conversationHistory}

USER'S LATEST INPUT: ${userInput}

ORIGINAL TEXT (first 500 chars): ${this.originalText.substring(0, 500)}...

IMPROVED TEXT (first 500 chars): ${this.improvedText.substring(0, 500)}...

Based on the user's response, ask ONE follow-up question to better understand their needs. Choose from these types of questions:
1. Structure preferences (bullet points, paragraphs, headings)
2. Level of detail (concise vs comprehensive)
3. Specific topics to emphasize or de-emphasize
4. Target audience or use case
5. Formatting preferences

After 3-4 questions, move to the refining phase by saying "Great! Based on your preferences, let me suggest some specific improvements..."

Keep responses conversational and helpful. Maximum 3 sentences.`
        break;

      case 'refining':
        systemPrompt = `You are an AI assistant in the REFINING phase of note improvement.

CONVERSATION HISTORY:
${conversationHistory}

USER'S LATEST INPUT: ${userInput}

ORIGINAL TEXT: ${this.originalText}

CURRENT IMPROVED VERSION: ${this.improvedText}

Based on the conversation, provide 2-3 SPECIFIC improvement suggestions for the notes. For each suggestion:
1. Explain what you'd change
2. Why it would be better
3. Ask if they want you to implement it

Format as:
**Suggestion 1:** [Description]
*Why:* [Reason]
*Implement this change?* (Yes/No)

Keep it focused and actionable.`
        this.state.reviewPhase = 'finalizing'
        break;

      case 'finalizing':
        systemPrompt = `You are in the FINALIZING phase. The user has provided feedback on suggestions.

CONVERSATION HISTORY:
${conversationHistory}

USER'S LATEST INPUT: ${userInput}

If the user approved changes, acknowledge them and ask if they want any other modifications.
If they're satisfied, congratulate them and suggest they can download the final version.
Keep responses brief and positive.`
        break;
    }

    try {
      const result = await model.generateContent(systemPrompt)
      const response = result.response
      return response.text()
    } catch (error) {
      console.error('Error generating AI response:', error)
      return "I apologize, but I'm having trouble processing that. Could you please try again?"
    }
  }

  async iterateOnText(currentEditorText: string): Promise<{ newText: string; changes: string[] }> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const conversationSummary = this.state.messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n- ')

    const prompt = `Based on our conversation, please improve the current text in the editor. 

ORIGINAL PDF TEXT:
${this.originalText}

CURRENT EDITOR TEXT:
${currentEditorText}

USER'S FEEDBACK AND PREFERENCES FROM OUR CONVERSATION:
- ${conversationSummary}

Please provide:
1. An improved version of the current editor text incorporating the user's feedback
2. A list of specific changes you made

Format your response EXACTLY like this:

===IMPROVED_TEXT===
[Put the improved text here]

===CHANGES_MADE===
- [Change 1]
- [Change 2]
- [Change 3]

Make sure to incorporate the user's preferences and feedback while maintaining the content quality and structure.`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response.text()

      // Parse the response
      const improvedMatch = response.match(/===IMPROVED_TEXT===\s*([\s\S]*?)\s*===CHANGES_MADE===/)?.[1]?.trim()
      const changesMatch = response.match(/===CHANGES_MADE===\s*([\s\S]*?)(?:$|\n\n===)/)?.[1]?.trim()

      if (!improvedMatch) {
        throw new Error('Could not parse improved text')
      }

      const changes = changesMatch 
        ? changesMatch.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim())
        : ['Text improved based on conversation']

      // Update our internal improved text
      this.improvedText = improvedMatch

      return {
        newText: improvedMatch,
        changes
      }
    } catch (error) {
      console.error('Error iterating on text:', error)
      throw new Error('Failed to iterate on text. Please try again.')
    }
  }

  getImprovedText(): string {
    return this.improvedText
  }

  markComplete(): void {
    this.state.isComplete = true
  }
}

export class EnhancedConversationAgent {
  private genAI: GoogleGenerativeAI
  private state: EnhancedConversationState
  private originalText: string
  private improvedText: string
  private language: Language

  constructor(apiKey: string, originalText: string, improvedText: string, language: Language = 'english') {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.originalText = originalText
    this.improvedText = improvedText
    this.language = language
    this.state = {
      messages: [],
      currentPhase: 'metadata',
      theoryStatements: [],
      isComplete: false,
      phaseResponses: {
        metadata: [],
        verification: [],
        customization: []
      }
    }
  }

  getState(): EnhancedConversationState {
    return { ...this.state }
  }

  getLocalization() {
    return localization[this.language]
  }

  async initializeReview(): Promise<void> {
    const loc = localization[this.language]
    const welcomeMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: loc.welcomeMessage,
      timestamp: new Date()
    }
    this.state.messages.push(welcomeMessage)
  }

  async processPhaseResponses(phase: ReviewPhase, responses: PhaseResponse[]): Promise<void> {
    // Store responses for this phase
    this.state.phaseResponses[phase] = responses
    
    // Generate theory statements based on responses
    const newStatements = await this.generateTheoryStatements(phase, responses)
    
    // Only deduplicate if we have new statements to avoid clearing everything
    if (newStatements.length > 0) {
      // Deduplicate against existing statements to avoid redundancy
      const deduplicatedStatements = await this.deduplicateStatements(this.state.theoryStatements, newStatements)
      
      // IMPORTANT: Always keep at least some issues - never completely empty the list
      const statementsToAdd = deduplicatedStatements.length > 0 ? deduplicatedStatements : newStatements
      
      // Add statements to existing ones (never replace completely)
      this.state.theoryStatements.push(...statementsToAdd)
      
      const addedCount = statementsToAdd.length
      const skippedCount = newStatements.length - deduplicatedStatements.length
      const loc = localization[this.language]
      const phaseName = loc.phaseNames[phase]
      let message = `Converted your ${phaseName.toLowerCase()} preferences into improvement requests.`
      
      if (addedCount > 0) {
        message += ` Created ${addedCount} request${addedCount > 1 ? 's' : ''} based on your preferences.`
      } else {
        message += ` Your preferences have been noted!`
      }
      if (skippedCount > 0) {
        message += ` (Skipped ${skippedCount} duplicate${skippedCount > 1 ? 's' : ''})`
      }
      
      const processingMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: message,
        timestamp: new Date()
      }
      this.state.messages.push(processingMessage)
    } else {
      console.log(`[${phase}] No new statements generated, keeping existing issues unchanged`)
    }
  }

  private async generateTheoryStatements(phase: ReviewPhase, responses: PhaseResponse[]): Promise<TheoryStatement[]> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const responseText = responses.map(r => `Q: ${r.question}\nA: ${Array.isArray(r.answer) ? r.answer.join(', ') : r.answer}`).join('\n\n')
    const loc = localization[this.language]
    
    console.log(`[${phase}] Converting user preferences to improvement requests`)
    
    // Check if user provided any meaningful responses and count them
    const validResponses = responses.filter(r => {
      const answer = Array.isArray(r.answer) ? r.answer.join('').trim() : String(r.answer).trim()
      const isValid = answer && answer.length > 0 && answer !== 'keine Angabe' && answer !== 'no preference' && answer !== 'none'
      return isValid
    })
    
    if (validResponses.length === 0) {
      console.log(`[${phase}] No valid responses provided, skipping issue generation`)
      return []
    }
    
    console.log(`[${phase}] Found ${validResponses.length} valid responses that should generate issues`)
    
    const prompt = `You are creating improvement requests based solely on the user's stated preferences. Do NOT analyze any existing text. Only generate issues that represent what the user wants.

USER'S STATED PREFERENCES:
${responseText}

TASK: Convert each user preference into specific improvement requests. These represent what the user wants their notes to have, regardless of what currently exists.

CONVERSION RULES:

1. If user selected "Vorlesungsnotizen" (lecture notes):
   → Generate: "Text should be formatted as lecture notes with clear topic headers and structured learning content"

2. If user selected specific formatting (bullet points, headings, etc.):
   → Generate: "Text should use [requested format]"

3. If user specified audience (students, colleagues, etc.):
   → Generate: "Language and complexity should be appropriate for [specified audience]"

4. If user specified detail level (concise, comprehensive, etc.):
   → Generate: "Text should be [specified detail level]"

5. If user specified purpose (study, reference, etc.):
   → Generate: "Text should be optimized for [specified purpose]"

CRITICAL INSTRUCTIONS:
- Generate issues in ${loc.languageName}
- Each issue represents what the user WANTS (not what's wrong with current text)
- Focus on positive statements: "Text should have X" rather than "Text lacks X"
- Generate one issue per distinct user preference
- Set confidence to 1.0 for all user preferences (they explicitly stated what they want)
- MANDATORY: Generate AT LEAST ${validResponses.length} issue(s) - one for each meaningful user response
- If user gave no specific preferences, return empty array []
- ALWAYS generate at least one issue if user provided any meaningful preference
- Convert every meaningful user response into an actionable improvement request

Examples of CORRECT issue generation based on user preferences:
- User selects "Vorlesungsnotizen" → "Text sollte als Vorlesungsnotizen mit klaren Themenüberschriften formatiert werden"
- User selects "bullet points" → "Text sollte Aufzählungspunkte verwenden"
- User selects "for students" → "Sprache sollte für Studenten angemessen sein"
- User selects "concise" → "Text sollte prägnant und auf das Wesentliche beschränkt sein"

JSON format:
[
  {
    "category": "Format", 
    "statement": "Text sollte als Vorlesungsnotizen mit klaren Themenüberschriften formatiert werden",
    "confidence": 1.0,
    "source": "user_preference"
  }
]

Return ONLY the JSON array, no other text.`

    try {
      console.log(`[${phase}] Sending prompt to AI:`, prompt.substring(0, 200) + '...')
      
      const result = await model.generateContent(prompt)
      const response = result.response.text()
      
      console.log(`[${phase}] AI Response (raw):`, response)
      
      // Try to extract JSON from response (in case AI adds extra text)
      let jsonText = response.trim()
      
      // Remove any markdown code blocks if present
      jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '')
      
      const jsonStart = jsonText.indexOf('[')
      const jsonEnd = jsonText.lastIndexOf(']')
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1)
      }
      
      console.log(`[${phase}] Extracted JSON:`, jsonText)
      
      // Parse JSON response
      const statements = JSON.parse(jsonText)
      
      // Validate the response format
      if (!Array.isArray(statements)) {
        console.error(`[${phase}] AI response is not an array:`, statements)
        return []
      }
      
      console.log(`[${phase}] Parsed statements:`, statements)
      
      const validStatements = statements.filter(stmt => {
        const isValid = stmt && 
          typeof stmt.category === 'string' && 
          typeof stmt.statement === 'string' && 
          typeof stmt.confidence === 'number' &&
          stmt.confidence >= 0.5 && stmt.confidence <= 1.0 && // Lowered minimum confidence
          stmt.statement.length > 10 // Ensure meaningful statements
          
        if (!isValid) {
          console.log(`[${phase}] Invalid statement filtered out:`, stmt)
        }
        return isValid
      })
      
      console.log(`[${phase}] Generated ${validStatements.length} valid issues from ${responses.length} responses`)
      console.log(`[${phase}] Valid statements:`, validStatements)
      
      if (validStatements.length === 0) {
        console.error(`[${phase}] CRITICAL: No valid statements generated despite having ${validResponses.length} valid responses`)
        console.error(`[${phase}] This violates the requirement of minimum one issue per valid response`)
        console.error(`[${phase}] Valid responses were:`, validResponses)
        
        // Fallback: Create basic issues from user responses
        const fallbackStatements = validResponses.map((response, index) => ({
          id: `${phase}_fallback_${Date.now()}_${index}`,
          category: 'User Preference',
          statement: `Text should incorporate user preference: ${Array.isArray(response.answer) ? response.answer.join(', ') : response.answer}`,
          confidence: 1.0,
          source: 'fallback_generation'
        }))
        
        console.log(`[${phase}] Generated ${fallbackStatements.length} fallback issues`)
        return fallbackStatements
      }
      
      return validStatements.map((stmt: { category: string; statement: string; confidence: number; source?: string }, index: number) => ({
        id: `${phase}_${Date.now()}_${index}`,
        category: stmt.category,
        statement: stmt.statement,
        confidence: stmt.confidence,
        source: stmt.source || `${phase}_analysis`
      }))
    } catch (error) {
      console.error(`[${phase}] Error generating theory statements:`, error)
      console.error(`[${phase}] Error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        responses: responses,
        responseText: responseText
      })
      return []
    }
  }

  async removeTheoryStatement(statementId: string): Promise<void> {
    const beforeCount = this.state.theoryStatements.length
    const beforeIds = this.state.theoryStatements.map(s => s.id)
    
    this.state.theoryStatements = this.state.theoryStatements.filter(stmt => stmt.id !== statementId)
    
    const afterCount = this.state.theoryStatements.length
    const afterIds = this.state.theoryStatements.map(s => s.id)
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Theory statement removal:', {
        statementId,
        beforeCount,
        afterCount,
        beforeIds,
        afterIds,
        removed: beforeCount !== afterCount
      })
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error('Error generating response:', error)
      return 'Sorry, I couldn\'t generate a response at this time.'
    }
  }

  async applyTheoryToText(currentText: string): Promise<{ newText: string; changes: string[] }> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const theoryText = this.state.theoryStatements
      .map(stmt => `${stmt.category}: ${stmt.statement} (Confidence: ${Math.round(stmt.confidence * 100)}%)`)
      .join('\n')
    
    const allResponses = Object.entries(this.state.phaseResponses)
      .flatMap(([phase, responses]) => 
        responses.map(r => `[${phase}] ${r.question}: ${Array.isArray(r.answer) ? r.answer.join(', ') : r.answer}`)
      )
      .join('\n')

    const loc = localization[this.language]

    const prompt = `Apply the user's preferences to improve their notes based on our interactive review.

ORIGINAL PDF TEXT:
${this.originalText}

CURRENT TEXT TO IMPROVE:
${currentText}

USER'S THEORY (My Understanding):
${theoryText}

DETAILED USER RESPONSES:
${allResponses}

LANGUAGE CONTEXT: Improve the text in ${loc.languageName}, following ${loc.languageName} language conventions, style, and formatting preferences.

Please provide:
1. An improved version of the current text that incorporates all the user's preferences from the theory
2. A list of specific changes made

Format your response EXACTLY like this:

===IMPROVED_TEXT===
[Put the improved text here]

===CHANGES_MADE===
- [Change 1]
- [Change 2]
- [Change 3]

Apply ALL theory statements where relevant. Make substantial improvements based on their preferences.`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response.text()

      // Parse the response
      const improvedMatch = response.match(/===IMPROVED_TEXT===\s*([\s\S]*?)\s*===CHANGES_MADE===/)?.[1]?.trim()
      const changesMatch = response.match(/===CHANGES_MADE===\s*([\s\S]*?)(?:$|\n\n===)/)?.[1]?.trim()

      if (!improvedMatch) {
        throw new Error('Could not parse improved text')
      }

      const changes = changesMatch 
        ? changesMatch.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim())
        : ['Text improved based on theory']

      this.improvedText = improvedMatch

      return {
        newText: this.improvedText,
        changes
      }
    } catch (error) {
      console.error('Error applying theory to text:', error)
      throw new Error('Failed to apply theory. Please try again.')
    }
  }

  async applyTheoryToTextWithChoice(currentText: string, useOriginalAsBase: boolean): Promise<{ newText: string; changes: string[] }> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const theoryText = this.state.theoryStatements
      .map(stmt => `${stmt.category}: ${stmt.statement} (Confidence: ${Math.round(stmt.confidence * 100)}%)`)
      .join('\n')
    
    const allResponses = Object.entries(this.state.phaseResponses)
      .flatMap(([phase, responses]) => 
        responses.map(r => `[${phase}] ${r.question}: ${Array.isArray(r.answer) ? r.answer.join(', ') : r.answer}`)
      )
      .join('\n')

    const baseText = useOriginalAsBase ? this.originalText : currentText
    const loc = localization[this.language]
    const contextText = useOriginalAsBase ? 
      `Starting from the ORIGINAL transcribed text and applying all improvements at once.` :
      `Building on the CURRENT improved text with additional refinements.`

    const prompt = `Apply the user's preferences to improve their notes based on our interactive review.

${contextText}

ORIGINAL PDF TEXT:
${this.originalText}

BASE TEXT TO IMPROVE:
${baseText}

${!useOriginalAsBase ? `CURRENT IMPROVED VERSION (for reference):
${currentText}

` : ''}USER'S THEORY (My Understanding):
${theoryText}

DETAILED USER RESPONSES:
${allResponses}

LANGUAGE CONTEXT: Improve the text in ${loc.languageName}, following ${loc.languageName} language conventions, style, and formatting preferences.

Please provide:
1. An improved version of the base text that incorporates all the user's preferences from the theory
2. A list of specific changes made

${useOriginalAsBase ? 
  'Apply ALL improvements from scratch, creating a comprehensive revision.' :
  'Build on the current improvements with additional refinements based on the theory.'}

Format your response EXACTLY like this:

===IMPROVED_TEXT===
[Put the improved text here]

===CHANGES_MADE===
- [Change 1]
- [Change 2]
- [Change 3]

Apply ALL theory statements where relevant. Make substantial improvements based on their preferences.`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response.text()

      // Parse the response
      const improvedMatch = response.match(/===IMPROVED_TEXT===\s*([\s\S]*?)\s*===CHANGES_MADE===/)?.[1]?.trim()
      const changesMatch = response.match(/===CHANGES_MADE===\s*([\s\S]*?)(?:$|\n\n===)/)?.[1]?.trim()

      if (!improvedMatch) {
        throw new Error('Could not parse improved text')
      }

      const changes = changesMatch 
        ? changesMatch.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim())
        : ['Text improved based on theory']

      this.improvedText = improvedMatch

      return {
        newText: this.improvedText,
        changes
      }
    } catch (error) {
      console.error('Error applying theory to text:', error)
      throw new Error('Failed to apply theory. Please try again.')
    }
  }

  private async deduplicateStatements(existingStatements: TheoryStatement[], newStatements: TheoryStatement[]): Promise<TheoryStatement[]> {
    if (existingStatements.length === 0) {
      return newStatements
    }

    const deduplicatedStatements: TheoryStatement[] = []
    
    for (const newStatement of newStatements) {
      const isDuplicate = await this.isStatementDuplicate(newStatement, existingStatements)
      
      if (!isDuplicate) {
        deduplicatedStatements.push(newStatement)
      } else {
        console.log(`Skipping duplicate statement: "${newStatement.statement}"`)
      }
    }
    
    return deduplicatedStatements
  }

  private async isStatementDuplicate(newStatement: TheoryStatement, existingStatements: TheoryStatement[]): Promise<boolean> {
    // Quick category filter - if categories are different, likely not duplicate
    const sameCategory = existingStatements.filter(stmt => stmt.category === newStatement.category)
    if (sameCategory.length === 0) {
      return false
    }

    // Use Gemini to check for semantic similarity
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const loc = localization[this.language]
    
    const existingText = sameCategory.map(stmt => `"${stmt.statement}"`).join('\n')
    
    const prompt = `You are analyzing theory statements about note-taking preferences to detect duplicates.

LANGUAGE CONTEXT: Analysis should consider ${loc.languageName} language conventions and semantics.

NEW STATEMENT TO EVALUATE:
Category: ${newStatement.category}
Statement: "${newStatement.statement}"

EXISTING STATEMENTS IN SAME CATEGORY:
${existingText}

TASK: Determine if the new statement is semantically similar to any existing statement, meaning they address the same underlying issue or preference.

Consider statements duplicate if they:
- Address the same structural/formatting preference
- Target the same content organization issue  
- Recommend similar changes to the same aspect
- Have substantial semantic overlap even with different wording

Consider statements DIFFERENT if they:
- Address distinct aspects of note-taking
- Recommend different approaches to the same general area
- Have minimal semantic overlap
- Focus on different structural elements

Respond with only: "DUPLICATE" or "UNIQUE"

Examples:
- "Use bullet points for clarity" vs "Organize content with bullet points" = DUPLICATE
- "Add clear headings" vs "Use bullet points" = UNIQUE
- "Emphasize key concepts" vs "Highlight important information" = DUPLICATE
- "Improve paragraph structure" vs "Add section summaries" = UNIQUE`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response.text().trim().toUpperCase()
      
      return response.includes('DUPLICATE')
    } catch (error) {
      console.error('Error checking statement duplication:', error)
      // Fallback to simple word-based comparison
      return this.areStatementsSimilarFallback(newStatement, sameCategory)
    }
  }

  private areStatementsSimilarFallback(newStatement: TheoryStatement, existingStatements: TheoryStatement[]): boolean {
    const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, '').trim()
    const normalizedNew = normalize(newStatement.statement)
    
    for (const existing of existingStatements) {
      const normalizedExisting = normalize(existing.statement)
      
      // Check for exact match
      if (normalizedNew === normalizedExisting) {
        return true
      }
      
      // Check for high word overlap (simple similarity check)
      const wordsNew = normalizedNew.split(/\s+/)
      const wordsExisting = normalizedExisting.split(/\s+/)
      const commonWords = wordsNew.filter(word => wordsExisting.includes(word) && word.length > 2)
      
      // Consider similar if they share more than 60% of words
      const overlapRatio = (commonWords.length * 2) / (wordsNew.length + wordsExisting.length)
      if (overlapRatio > 0.6) {
        return true
      }
    }
    
    return false
  }
}

// Export localization for use in components
export { localization }
