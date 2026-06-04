const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 5500);
const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const MAX_PORT_ATTEMPTS = 20;
const QUESTION_BANK_SIZE = 1000;
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const QUESTIONS_FILE = path.join(DATA_DIR, "questions.json");
const SCORES_FILE = path.join(DATA_DIR, "scores.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const PRESENCE = new Map();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".txt": "text/plain; charset=utf-8"
};

const INITIAL_QUESTIONS = buildQuestions().slice(0, 25);

function generatedQuestions() {
  return buildQuestions().slice(25);
}

function buildQuestions() {
  const handpicked = [
    ["Tu peux devenir invisible quand tu veux, mais...", "Tu redeviens visible sans vetements", "Chaque minute invisible te coute 10 euros"],
    ["Tu dois accepter 1 million d'euros, mais...", "Tu ne peux plus utiliser Internet", "Tu dois demenager tous les ans"],
    ["Tu peux lire les pensees pendant une journee, mais...", "Tu entends aussi tout ce que les gens pensent de toi", "Tout le monde sait que tu as ce pouvoir"],
    ["Tu dois sauver une personne, mais...", "C'est ton animal prefere", "Ce sont 10 inconnus"],
    ["Tu peux voir 10 secondes dans le futur, mais...", "Tu oublies 10 secondes de ton passe", "Tu ne peux pas changer ce que tu vois"],
    ["Tu dois poster une video chaque jour pendant un an, mais...", "Elle doit etre totalement sincere", "Elle doit etre choisie par un inconnu"],
    ["Tu peux ne plus jamais etre fatigue, mais...", "Tu ne peux plus dormir pour le plaisir", "Tu bailles a chaque mensonge"],
    ["Tu dois vivre un mois sans ton telephone, mais...", "Tu gagnes 1000 euros", "Tout le monde peut encore t'envoyer des messages"],
    ["Tu peux effacer une mauvaise journee, mais...", "Un inconnu s'en souvient parfaitement", "Tu dois la revivre en reve une fois par mois"],
    ["Tu dois participer a une emission de tele, mais...", "Le sujet est ton plus grand complexe", "Ton ex choisit les questions"],
    ["Tu peux devenir celebre demain, mais...", "Tu es celebre pour une honte", "Tu ne peux plus sortir incognito"],
    ["Tu dois dire la verite pendant 24 heures, mais...", "Tu es avec ta famille", "Tu es au travail"],
    ["Tu peux gagner tous les jeux, mais...", "Personne ne veut plus jouer avec toi", "Tu oublies les regles apres chaque victoire"],
    ["Tu dois passer une semaine dans le passe, mais...", "Tu ne peux parler a personne", "Tu risques de changer un souvenir important"],
    ["Tu peux recevoir un conseil du futur, mais...", "Il arrive trop tard une fois sur deux", "Il est ecrit par ton toi le plus arrogant"],
    ["Tu dois choisir un nouveau talent, mais...", "Tu perds une habitude que tu aimes", "Tout le monde te demande de l'utiliser"],
    ["Tu peux devenir riche, mais...", "Tu ne peux plus mentir", "Tu ne peux plus garder de secret"],
    ["Tu dois vivre avec une notification magique, mais...", "Elle sonne quand quelqu'un ment", "Elle sonne quand quelqu'un pense a toi"],
    ["Tu peux annuler une erreur par semaine, mais...", "Une petite erreur apparait ailleurs", "Tu dois revivre le moment au ralenti"],
    ["Tu dois manger gratuitement toute ta vie, mais...", "Le serveur choisit toujours ton plat", "Tu dois finir chaque assiette"],
    ["Tu peux etre parfaitement photogenique, mais...", "Tu rates toutes les photos des autres", "Tu clignes des yeux en vrai quand on te regarde"],
    ["Tu dois vivre un an dans une maison gratuite, mais...", "Une piece change de place chaque nuit", "Tous tes amis ont une cle"],
    ["Tu peux comprendre toutes les langues, mais...", "Ton accent change toutes les 30 secondes", "Tu oublies parfois ta langue maternelle"],
    ["Tu dois choisir un bouton magique, mais...", "Il donne 1 euro a tout le monde et retire 100 euros a une personne", "Il supprime les pubs mais ralentit Internet"],
    ["Tu peux connaitre ton avenir amoureux, mais...", "Tu ne peux rien changer", "La personne concernee le sait aussi"]
  ];

  const actions = [
    "Tu dois passer 24 heures sans mentir",
    "Tu dois accepter le travail de tes reves",
    "Tu dois vivre une semaine dans une ville inconnue",
    "Tu dois faire un discours devant 500 personnes",
    "Tu dois laisser ton telephone a un ami pendant une journee",
    "Tu dois porter la meme tenue pendant un mois",
    "Tu dois participer a un diner avec toutes tes ex-relations",
    "Tu dois lire a voix haute ton dernier message envoye",
    "Tu dois laisser quelqu'un choisir ta playlist pendant un an",
    "Tu dois passer une journee avec ton pire ennemi",
    "Tu dois devenir influenceur pendant 30 jours",
    "Tu dois vivre sans reseaux sociaux pendant un an",
    "Tu dois accepter une invitation mystere",
    "Tu dois refaire ton adolescence pendant une semaine",
    "Tu dois parler a ton toi de 12 ans",
    "Tu dois parler a ton toi de 80 ans",
    "Tu dois choisir une seule application pour toute ta vie",
    "Tu dois donner ton avis honnete a chaque question",
    "Tu dois laisser ta famille organiser ton anniversaire",
    "Tu dois dormir dans un endroit public une nuit",
    "Tu dois passer un entretien pour ton job ideal",
    "Tu dois manger le meme repas tous les jours pendant un an",
    "Tu dois accepter un super pouvoir",
    "Tu dois revivre ton jour le plus genant",
    "Tu dois revivre ton meilleur souvenir",
    "Tu dois choisir une personne pour lire tes pensees",
    "Tu dois participer a un concours de talent",
    "Tu dois devenir invisible pendant une heure",
    "Tu dois tout raconter a un inconnu",
    "Tu dois confier ton compte principal a quelqu'un",
    "Tu dois vivre dans ton film prefere",
    "Tu dois prendre une grande decision en 10 secondes",
    "Tu dois laisser le hasard choisir tes vacances",
    "Tu dois envoyer un message important sans le relire",
    "Tu dois passer un mois sans musique",
    "Tu dois passer un mois sans parler",
    "Tu dois dire oui a tout pendant une journee",
    "Tu dois dire non a tout pendant une journee",
    "Tu dois choisir entre deux secrets",
    "Tu dois partager ton journal intime",
    "Tu dois accepter une fortune soudaine",
    "Tu dois perdre une habitude pour toujours",
    "Tu dois apprendre une verite sur tes proches",
    "Tu dois choisir une regle pour toute l'humanite",
    "Tu dois passer une semaine sans argent",
    "Tu dois passer une semaine sans miroir",
    "Tu dois changer de prenom pendant un an",
    "Tu dois vivre avec une camera allumee une heure par jour",
    "Tu dois laisser tes amis voter tes decisions",
    "Tu dois prendre le train vers une destination inconnue",
    "Tu dois accepter une mission ultra simple",
    "Tu dois gagner une grosse somme d'argent",
    "Tu dois perdre tous tes souvenirs d'une journee",
    "Tu dois rendre service a ton pire ennemi",
    "Tu dois devenir le centre de l'attention",
    "Tu dois disparaitre des reseaux pendant 6 mois",
    "Tu dois recevoir un message du futur",
    "Tu dois choisir une malediction sociale",
    "Tu dois vivre avec ton historique visible",
    "Tu dois accepter une recompense publique",
    "Tu dois avouer une petite honte",
    "Tu dois choisir un don pour toute ta famille",
    "Tu dois donner un conseil a tout le monde",
    "Tu dois passer une soiree sans partir quand tu veux",
    "Tu dois choisir ton reve chaque nuit",
    "Tu dois changer un evenement du passe",
    "Tu dois devenir imbattable dans un domaine",
    "Tu dois recevoir une note sociale visible",
    "Tu dois echanger ta vie avec un ami une journee",
    "Tu dois accepter un colocataire choisi au hasard",
    "Tu dois vivre avec une chanson dans la tete",
    "Tu dois pouvoir entendre les pensees des animaux",
    "Tu dois etre honnete avec ton crush",
    "Tu dois laisser ton boss lire une conversation",
    "Tu dois choisir une verite qui devient publique"
  ];

  const dilemmaPairs = [
    ["Tout le monde est au courant", "Personne ne te croit"],
    ["Tu gagnes 10 000 euros", "Tu perds ton souvenir prefere"],
    ["Tu dois le faire en public", "Tu dois le refaire chaque annee"],
    ["Ton meilleur ami le voit", "Ton pire ennemi le raconte"],
    ["Tu ne peux pas expliquer pourquoi", "Tu dois mentir a quelqu'un que tu aimes"],
    ["Tu perds Internet pendant un mois", "Tu perds ton telephone pendant une semaine"],
    ["Tu dois porter des chaussures mouillees", "Tu dois avoir toujours les mains froides"],
    ["Tu reussis parfaitement", "Quelqu'un d'autre recoit tout le credit"],
    ["Tu peux recommencer une fois", "Tu oublies ce que tu voulais changer"],
    ["Tu as 24 heures pour te preparer", "Tout est diffuse en direct"],
    ["Tu deviens populaire", "Tu ne sais jamais qui est sincere"],
    ["Tu sauves ton honneur", "Tu trahis un petit secret"],
    ["Tu gardes l'argent", "Tu dois couper contact avec les reseaux sociaux"],
    ["Tu peux choisir la date", "Tu ne peux choisir personne avec toi"],
    ["Tu as une chance sur deux de reussir", "Tu reussis mais tu dois recommencer demain"],
    ["Tu peux garder le secret", "Une personne innocente est accusee"],
    ["Tu obtiens ce que tu veux", "Quelqu'un que tu aimes perd un petit confort"],
    ["Tu ne ressens aucune honte", "Tu ne ressens aucune fierte"],
    ["Tu dois sourire tout le temps", "Tu dois tout dire avec une voix monotone"],
    ["Tu controles le resultat", "Tu oublies comment tu as fait"],
    ["Tu gagnes du temps", "Tu perds une amitie fragile"],
    ["Tu aides beaucoup de gens", "Personne ne saura que c'est grace a toi"],
    ["Tu es protege de toute critique", "Tu n'entends plus aucun compliment"],
    ["Tu peux partir quand tu veux", "Tu dois revenir des qu'on t'appelle"],
    ["Tu peux choisir l'option facile", "Tout le monde saura que tu l'as choisie"],
    ["Tu evites une grosse honte", "Tu crees une petite honte quotidienne"],
    ["Tu gagnes une capacite incroyable", "Tu perds une competence banale"],
    ["Tu vis une experience unique", "Tu ne peux jamais en parler"],
    ["Tu peux annuler le choix", "Tu dois payer 100 euros pour chaque hesitation"],
    ["Tu fais plaisir a ta famille", "Tu te deçois toi-meme"],
    ["Tu deviens tres admire", "Tu deviens tres jalouse par les autres"],
    ["Tu sais toute la verite", "Tu ne peux poser aucune question"],
    ["Tu changes ta vie", "Tu changes aussi celle d'un inconnu"],
    ["Tu as le controle total", "Tu dois assumer les consequences publiquement"],
    ["Tu peux gagner gros", "Tu peux tout perdre sur un detail"]
  ];

  const questions = handpicked.map(([question, choiceA, choiceB], index) => ({
    id: `q${String(index + 1).padStart(3, "0")}`,
    question,
    choiceA,
    choiceB,
    votesA: 0,
    votesB: 0
  }));

  for (let i = questions.length; i < QUESTION_BANK_SIZE; i += 1) {
    const action = actions[i % actions.length];
    const cycle = Math.floor(i / actions.length);
    const pair = dilemmaPairs[(i * 7 + cycle * 11) % dilemmaPairs.length];
    questions.push({
      id: `q${String(i + 1).padStart(3, "0")}`,
      question: `${action}, mais...`,
      choiceA: pair[0],
      choiceB: pair[1],
      votesA: 0,
      votesB: 0
    });
  }

  return questions;
}

function buildQuestions() {
  const categories = [
    {
      question: "Tu peux choisir un seul super-pouvoir :",
      choices: [
        "Devenir invisible quand tu veux",
        "Lire dans les pensees",
        "Te teleporter n'importe ou",
        "Arreter le temps pendant 10 secondes",
        "Voler sans effort",
        "Voir 24 heures dans le futur",
        "Comprendre toutes les langues",
        "Guerir instantanement les blessures",
        "Changer d'apparence a volonte",
        "Respirer sous l'eau",
        "Parler aux animaux",
        "Controler tes reves",
        "Memoriser tout ce que tu lis",
        "Effacer un souvenir precis",
        "Changer la meteo autour de toi",
        "Trouver n'importe quel objet perdu",
        "Savoir quand quelqu'un ment",
        "Dormir 2 heures et etre en pleine forme",
        "Copier le talent de quelqu'un pendant une heure",
        "Rendre une personne heureuse instantanement",
        "Avoir une chance parfaite une fois par jour",
        "Remonter 5 minutes dans le temps",
        "Te rendre totalement silencieux",
        "Faire apparaitre ton plat prefere",
        "Transformer une mauvaise decision en brouillon"
      ]
    },
    {
      question: "Tu dois choisir un avantage pour toute ta vie :",
      choices: [
        "Ne plus jamais payer de loyer",
        "Voyager gratuitement partout",
        "Manger gratuitement dans tous les restaurants",
        "Avoir 3000 euros garantis chaque mois",
        "Ne plus jamais tomber malade",
        "Avoir toujours 8 heures de sommeil parfait",
        "Ne jamais attendre dans une file",
        "Avoir une maison parfaite a vie",
        "Avoir tous les transports gratuits",
        "Ne plus jamais perdre tes affaires",
        "Avoir un assistant personnel 2 heures par jour",
        "Recevoir un conseil utile chaque matin",
        "Avoir toujours le bon timing",
        "Ne plus jamais faire de paperasse",
        "Avoir une cuisine toujours remplie",
        "Pouvoir prendre un mois de vacances par an",
        "Trouver un travail qui te plait vraiment",
        "Etre rembourse de tous tes achats rates",
        "Avoir une energie stable toute la journee",
        "Apprendre une competence deux fois plus vite",
        "Avoir toujours une place assise",
        "Etre protege des arnaques",
        "Trouver facilement les bons amis",
        "Avoir un logement dans la ville de ton choix",
        "Pouvoir recommencer une journee par an"
      ]
    },
    {
      question: "Tu dois choisir un sacrifice acceptable :",
      choices: [
        "Ne plus jamais manger de chocolat",
        "Ne plus jamais utiliser les reseaux sociaux",
        "Ne plus jamais partir en avion",
        "Ne plus jamais boire de cafe",
        "Ne plus jamais regarder de series",
        "Ne plus jamais acheter de vetements neufs",
        "Ne plus jamais ecouter de musique seul",
        "Ne plus jamais dormir apres 9h",
        "Ne plus jamais commander a manger",
        "Ne plus jamais utiliser d'emoji",
        "Ne plus jamais mentir, meme pour etre gentil",
        "Ne plus jamais prendre de photos",
        "Ne plus jamais manger au restaurant",
        "Ne plus jamais jouer aux jeux video",
        "Ne plus jamais pouvoir garder un secret",
        "Ne plus jamais choisir la musique en voiture",
        "Ne plus jamais pouvoir annuler un plan",
        "Ne plus jamais utiliser de GPS",
        "Ne plus jamais porter ta couleur preferee",
        "Ne plus jamais regarder ton film prefere",
        "Ne plus jamais faire de grasse matinee",
        "Ne plus jamais acheter en ligne",
        "Ne plus jamais rire a tes propres blagues",
        "Ne plus jamais dire 'je t'avais dit'",
        "Ne plus jamais avoir de notifications"
      ]
    },
    {
      question: "Tu dois choisir une verite a connaitre :",
      choices: [
        "Ce que les gens pensent vraiment de toi",
        "La date exacte de ta mort",
        "La personne qui t'aime le plus",
        "La pire decision de ta vie",
        "La meilleure decision a prendre cette annee",
        "Le moment ou tu seras le plus heureux",
        "Le secret le plus important de ta famille",
        "Le nombre de personnes qui te regrettent",
        "Le vrai avis de ton meilleur ami",
        "La raison de ton prochain gros echec",
        "La personne qui parle le plus de toi",
        "Le souvenir que tu as deforme sans le savoir",
        "Le jour ou ta vie va changer",
        "La chose que tu devrais abandonner",
        "La personne a qui tu devrais pardonner",
        "Le mensonge qu'on t'a le plus repete",
        "La peur qui te bloque le plus",
        "Le talent que tu sous-estimes",
        "Le choix que tu regretteras si tu ne le fais pas",
        "La relation qui te fait le plus grandir",
        "La promesse que tu ne tiendras pas",
        "L'occasion que tu as deja ratee",
        "La personne qui te comprend le mieux",
        "La chose qui te rend vraiment jaloux",
        "Le moment ou tu as ete le plus courageux"
      ]
    },
    {
      question: "Tu peux changer une seule chose dans le monde :",
      choices: [
        "Plus personne ne souffre de faim",
        "Plus personne ne ment",
        "Plus personne ne se sent seul",
        "Les guerres deviennent impossibles",
        "Tout le monde a un logement",
        "Tout le monde a acces aux soins",
        "Les animaux ne souffrent plus",
        "La pollution disparait en 10 ans",
        "Les riches ne peuvent plus tricher",
        "Les enfants sont toujours proteges",
        "Les maladies graves deviennent curables",
        "Chaque travail essentiel est bien paye",
        "Les discriminations disparaissent",
        "La corruption devient impossible",
        "Les personnes agees ne sont jamais abandonnees",
        "Tout le monde peut etudier gratuitement",
        "Les violences familiales disparaissent",
        "Les prisons rehabilitent vraiment",
        "Chaque pays accueille les refugies dignement",
        "Personne ne nait dans l'extreme pauvrete",
        "Les catastrophes naturelles sont previsibles",
        "Les reseaux sociaux ne rendent plus addict",
        "Chaque vote politique est vraiment honnete",
        "La nature se regenere deux fois plus vite",
        "Les gens comprennent instantanement la douleur des autres"
      ]
    },
    {
      question: "Tu dois choisir une situation sociale genante :",
      choices: [
        "Lire ton dernier message a voix haute",
        "Montrer ton historique de recherche",
        "Porter une tenue choisie par tes amis",
        "Dire ton vrai avis pendant un repas de famille",
        "Revoir ton premier amour par surprise",
        "Recevoir une note sociale visible par tous",
        "Faire un discours sans preparation",
        "Laisser ton telephone deverrouille 10 minutes",
        "Entendre les pensees des gens sur toi",
        "Voir tes anciens posts projetes en public",
        "Appeler ton boss par le mauvais prenom",
        "Envoyer un vocal trop sincere au mauvais groupe",
        "Confondre deux personnes importantes",
        "Raconter une blague qui ne fait rire personne",
        "Etre filme pendant ton pire moment de danse",
        "Devoir expliquer ton dernier achat bizarre",
        "Croiser ton ex avec tes parents",
        "Decouvrir que ton micro etait allume",
        "Devoir choisir qui inviter devant tout le monde",
        "Recevoir tous tes compliments en public",
        "Recevoir toutes tes critiques en public",
        "Avoir ton niveau de stress affiche",
        "Avoir ton niveau d'ennui affiche",
        "Devoir justifier chaque 'vu' sans reponse",
        "Faire semblant de connaitre quelqu'un qui te connait vraiment"
      ]
    },
    {
      question: "Tu peux ameliorer une seule capacite chez toi :",
      choices: [
        "Avoir une confiance parfaite",
        "Ne plus procrastiner",
        "Parler en public sans stress",
        "Comprendre vite les emotions des autres",
        "Apprendre toutes les langues facilement",
        "Etre tres discipline",
        "Retenir tous les prenoms",
        "Dormir parfaitement",
        "Savoir cuisiner comme un chef",
        "Etre excellent en humour",
        "Gerer ton argent parfaitement",
        "Ne jamais paniquer",
        "Etre incroyablement creatif",
        "Avoir une memoire parfaite",
        "Savoir negocier sans malaise",
        "Etre sportif sans effort",
        "Savoir reparer presque tout",
        "Avoir une intuition fiable",
        "Ecrire parfaitement",
        "Danser sans honte",
        "Savoir dire non",
        "Savoir pardonner",
        "Savoir quitter une situation toxique",
        "Savoir motiver les autres",
        "Comprendre rapidement les maths et la logique"
      ]
    },
    {
      question: "Tu dois choisir une vie alternative :",
      choices: [
        "Vivre riche mais tres discret",
        "Vivre celebre mais tres expose",
        "Vivre dans une grande ville toute ta vie",
        "Vivre a la campagne toute ta vie",
        "Changer de pays tous les 5 ans",
        "Rester dans ta ville natale pour toujours",
        "Avoir une carriere brillante mais peu de temps libre",
        "Avoir beaucoup de temps libre mais peu d'argent",
        "Vivre seul dans un lieu magnifique",
        "Vivre entoure dans un lieu moyen",
        "Tout recommencer a 18 ans avec ta memoire actuelle",
        "Avancer directement a 40 ans avec une vie stable",
        "Avoir une famille immense",
        "Avoir une liberte totale sans attaches",
        "Travailler pour une cause importante",
        "Travailler pour un salaire enorme",
        "Etre connu pour ton intelligence",
        "Etre connu pour ta gentillesse",
        "Vivre sans stress mais sans grands frissons",
        "Vivre intense mais souvent fatigue",
        "Avoir une routine parfaite",
        "Avoir une aventure nouvelle chaque semaine",
        "Vivre pres de tous tes amis",
        "Vivre dans le pays de tes reves",
        "Avoir une vie simple mais tres heureuse"
      ]
    }
  ];

  const questions = [];
  const seen = new Set();

  function addQuestion(question, choiceA, choiceB) {
    const key = `${question}|${choiceA}|${choiceB}`;
    if (seen.has(key) || choiceA === choiceB || questions.length >= QUESTION_BANK_SIZE) return;
    seen.add(key);
    questions.push({
      id: `q${String(questions.length + 1).padStart(3, "0")}`,
      question,
      choiceA,
      choiceB,
      votesA: 0,
      votesB: 0
    });
  }

  for (const category of categories) {
    for (let i = 0; i < category.choices.length; i += 1) {
      for (let j = i + 1; j < category.choices.length; j += 1) {
        addQuestion(category.question, category.choices[i], category.choices[j]);
      }
    }
  }

  if (questions.length < QUESTION_BANK_SIZE) {
    throw new Error(`Banque insuffisante: ${questions.length}/${QUESTION_BANK_SIZE} questions.`);
  }

  return questions;
}

function questionBank() {
  return [...INITIAL_QUESTIONS, ...generatedQuestions()];
}

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const seededQuestions = questionBank();
  if (!fs.existsSync(QUESTIONS_FILE)) {
    writeJson(QUESTIONS_FILE, seededQuestions);
  } else {
    const existing = readJson(QUESTIONS_FILE);
    const existingById = new Map(existing.map((question) => [question.id, question]));
    const merged = seededQuestions.map((question) => {
      const previous = existingById.get(question.id);
      return {
        ...question,
        votesA: previous?.votesA ?? question.votesA,
        votesB: previous?.votesB ?? question.votesB
      };
    });
    if (JSON.stringify(merged) !== JSON.stringify(existing)) {
      writeJson(QUESTIONS_FILE, merged);
    }
  }
  if (!fs.existsSync(SCORES_FILE)) writeJson(SCORES_FILE, []);
  if (!fs.existsSync(SESSIONS_FILE)) writeJson(SESSIONS_FILE, {});
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(data));
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Payload trop volumineux."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("JSON invalide."));
      }
    });
    request.on("error", reject);
  });
}

function publicQuestions() {
  return readJson(QUESTIONS_FILE).map(({ votesA, votesB, ...question }) => question);
}

function percentages(votesA, votesB) {
  const total = votesA + votesB;
  if (total === 0) return { A: 0, B: 0 };
  const percentA = Math.round((votesA / total) * 100);
  return { A: percentA, B: 100 - percentA };
}

function getMajority(question) {
  if (question.votesA === question.votesB) return null;
  return question.votesA > question.votesB ? "A" : "B";
}

function pointsFor(question, choice) {
  const majorityChoice = getMajority(question);
  if (!majorityChoice || choice !== majorityChoice) return 0;
  const pct = percentages(question.votesA, question.votesB)[majorityChoice];
  return pct >= 51 && pct <= 55 ? 2 : 1;
}

function parisDay(date = new Date()) {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function sortedScoreEntries(mode = "global") {
  const today = parisDay();
  return readJson(SCORES_FILE)
    .filter((score) => mode !== "today" || score.day === today)
    .sort((a, b) => b.score - a.score || b.correct - a.correct || new Date(a.createdAt) - new Date(b.createdAt));
}

function normalizePseudo(pseudo) {
  return pseudo.trim().toLowerCase();
}

function aggregateScores(mode = "global") {
  const entries = sortedScoreEntries(mode);
  const groups = new Map();

  for (const entry of entries) {
    const key = normalizePseudo(entry.pseudo);
    const current = groups.get(key) || {
      pseudo: entry.pseudo,
      gamesPlayed: 0,
      totalScore: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      bestGamePercent: 0,
      lastPlayedAt: entry.createdAt
    };

    current.gamesPlayed += 1;
    current.totalScore += entry.score;
    current.totalCorrect += entry.correct;
    current.totalQuestions += entry.total;
    current.bestGamePercent = Math.max(current.bestGamePercent, entry.successRate);
    if (new Date(entry.createdAt) > new Date(current.lastPlayedAt)) {
      current.lastPlayedAt = entry.createdAt;
      current.pseudo = entry.pseudo;
    }
    groups.set(key, current);
  }

  return [...groups.values()]
    .map((entry) => ({
      ...entry,
      successRate: Number(((entry.totalCorrect / entry.totalQuestions) * 100).toFixed(1)),
      averageScore: Number((entry.totalScore / entry.gamesPlayed).toFixed(1))
    }))
    .sort((a, b) => {
      return b.successRate - a.successRate
        || b.gamesPlayed - a.gamesPlayed
        || b.totalCorrect - a.totalCorrect
        || b.averageScore - a.averageScore
        || new Date(a.lastPlayedAt) - new Date(b.lastPlayedAt);
    });
}

function rankForPseudo(pseudo) {
  const key = normalizePseudo(pseudo);
  return aggregateScores("global").findIndex((entry) => normalizePseudo(entry.pseudo) === key) + 1;
}

async function handleApi(request, response, url) {
  try {
    if (request.method === "GET" && url.pathname === "/api/questions") {
      sendJson(response, 200, { questions: publicQuestions() });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/leaderboard") {
      const mode = url.searchParams.get("mode") === "today" ? "today" : "global";
      sendJson(response, 200, { entries: aggregateScores(mode).slice(0, 50) });
      return;
    }

    if ((request.method === "GET" || request.method === "POST") && url.pathname === "/api/presence") {
      const now = Date.now();
      if (request.method === "POST") {
        const body = await parseBody(request);
        const key = normalizePseudo(body.pseudo) || String(body.playerId || "local");
        PRESENCE.set(key, now);
      }

      for (const [key, seenAt] of PRESENCE.entries()) {
        if (now - seenAt > 2 * 60 * 1000) PRESENCE.delete(key);
      }

      sendJson(response, 200, { online: PRESENCE.size });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/vote") {
      const body = await parseBody(request);
      const gameId = String(body.gameId || "").trim();
      const questionId = String(body.questionId || "").trim();
      const choice = String(body.choice || "").toUpperCase();

      if (!gameId || !questionId || !["A", "B"].includes(choice)) {
        sendJson(response, 400, { error: "Vote invalide." });
        return;
      }

      const questions = readJson(QUESTIONS_FILE);
      const question = questions.find((item) => item.id === questionId);
      if (!question) {
        sendJson(response, 404, { error: "Question introuvable." });
        return;
      }

      const sessions = readJson(SESSIONS_FILE);
      sessions[gameId] ||= { votedQuestionIds: [], scoreSaved: false };
      if (sessions[gameId].votedQuestionIds.includes(questionId)) {
        sendJson(response, 409, { error: "Cette question a deja ete votee dans cette partie." });
        return;
      }

      if (choice === "A") question.votesA += 1;
      if (choice === "B") question.votesB += 1;
      sessions[gameId].votedQuestionIds.push(questionId);

      writeJson(QUESTIONS_FILE, questions);
      writeJson(SESSIONS_FILE, sessions);

      const majorityChoice = getMajority(question);
      const points = pointsFor(question, choice);
      sendJson(response, 200, {
        questionId,
        votesA: question.votesA,
        votesB: question.votesB,
        percentages: percentages(question.votesA, question.votesB),
        majorityChoice,
        isCorrect: points > 0,
        points
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/scores") {
      const body = await parseBody(request);
      const gameId = String(body.gameId || "").trim();
      const pseudo = String(body.pseudo || "").trim().slice(0, 18);
      const score = Number(body.score);
      const correct = Number(body.correct);
      const total = Number(body.total);
      const title = String(body.title || "").trim().slice(0, 40);

      if (!gameId || !pseudo || !Number.isInteger(score) || !Number.isInteger(correct) || total !== 25) {
        sendJson(response, 400, { error: "Score invalide." });
        return;
      }

      const sessions = readJson(SESSIONS_FILE);
      if (!sessions[gameId] || sessions[gameId].votedQuestionIds.length !== 25) {
        sendJson(response, 400, { error: "Termine les 25 questions avant d'enregistrer ton score." });
        return;
      }
      if (sessions[gameId].scoreSaved) {
        sendJson(response, 409, { error: "Score deja enregistre pour cette partie." });
        return;
      }

      const scores = readJson(SCORES_FILE);
      const entry = {
        id: `s-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        gameId,
        pseudo,
        score,
        correct,
        total,
        successRate: Math.round((correct / total) * 100),
        title,
        day: parisDay(),
        createdAt: new Date().toISOString()
      };
      scores.push(entry);
      sessions[gameId].scoreSaved = true;

      writeJson(SCORES_FILE, scores);
      writeJson(SESSIONS_FILE, sessions);

      sendJson(response, 201, {
        entry,
        rank: rankForPseudo(pseudo),
        leaderboard: aggregateScores("global").slice(0, 10),
        today: aggregateScores("today").slice(0, 10)
      });
      return;
    }

    sendJson(response, 404, { error: "Route API introuvable." });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Erreur serveur." });
  }
}

function serveStatic(response, urlPath) {
  const cleanPath = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
  const filePath = path.normalize(path.join(ROOT, cleanPath));
  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    response.end(content);
  });
}

ensureData();

function listen(port, attemptsLeft = MAX_PORT_ATTEMPTS) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname === "/healthz") {
      sendJson(response, 200, { ok: true });
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      handleApi(request, response, url);
      return;
    }
    serveStatic(response, url.pathname);
  });

  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0 && !process.env.PORT) {
      server.close();
      listen(port + 1, attemptsLeft - 1);
      return;
    }
    throw error;
  });

  server.listen(port, HOST, () => {
    const displayHost = HOST === "0.0.0.0" ? "127.0.0.1" : HOST;
    console.log(`La Majorite disponible sur http://${displayHost}:${port}`);
  });
}

listen(PORT);
