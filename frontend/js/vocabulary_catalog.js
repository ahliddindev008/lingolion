const VocabularyCatalog = (() => {
  const wordsByTopic = {
   greetings: [
  { "tj": "Салом!", "ru": "Привет!", "en": "Hello! / Hi!", "de": "Hallo!", "fr": "Salut!", "es": "¡Hola!", "it": "Ciao!", "tr": "Merhaba!", "ar": "مرحباً!", "fa": "سلام!", "zh-CN": "你好！", "ja": "こんにちは！" },
  { "tj": "Субҳ ба хайр!", "ru": "Доброе утро!", "en": "Good morning!", "de": "Guten Morgen!", "fr": "Bonjour!", "es": "¡Buenos días!", "it": "Buongiorno!", "tr": "Günaydın!", "ar": "صباح الخير!", "fa": "صبح بخیر!", "zh-CN": "早上好！", "ja": "おはようございます！" },
  { "tj": "Рӯз ба хайр!", "ru": "Добрый день!", "en": "Good afternoon!", "de": "Guten Tag!", "fr": "Bonjour!", "es": "¡Buenas tardes!", "it": "Buon pomeriggio!", "tr": "Tünaydın! / İyi günler!", "ar": "مساء الخير!", "fa": "روز بخیر!", "zh-CN": "下午好！", "ja": "こんにちは！" },
  { "tj": "Шом ба хайр!", "ru": "Добрый вечер!", "en": "Good evening!", "de": "Guten Abend!", "fr": "Bonsoir!", "es": "¡Buenas noches!", "it": "Buonasera!", "tr": "İyi akşamlar!", "ar": "مساء الخير!", "fa": "عصر بخیر! / شب بخیر!", "zh-CN": "晚上好！", "ja": "こんばんは！" },
  { "tj": "Шумо чӣ хел?", "ru": "Как дела? / Как вы?", "en": "How are you?", "de": "Wie geht es dir / Ihnen?", "fr": "Comment ça va? / Comment allez-vous?", "es": "¿Cómo estás? / ¿Cómo está usted?", "it": "Come stai? / Come sta?", "tr": "Nasılsınız? / Nasıl gidiyor?", "ar": "كيف حالك؟", "fa": "چطور هستید؟ / حال شما چطوره؟", "zh-CN": "你好吗？", "ja": "お元気ですか？" },
  { "tj": "Хуб, ташаккур!", "ru": "Хорошо, спасибо!", "en": "Fine, thank you! / Good, thanks!", "de": "Gut, danke!", "fr": "Bien, merci!", "es": "¡Bien, gracias!", "it": "Bene, grazie!", "tr": "İyiyim, teşekkürler!", "ar": "بخير، شكراً!", "fa": "خوبم، ممنون!", "zh-CN": "很好，谢谢！", "ja": "元気です、ありがとう！" },
  { "tj": "Аҳволи корҳо чӣ хел?", "ru": "Как поживаешь? / Что нового?", "en": "How is it going? / What's up?", "de": "Wie läuft's? / Was gibt's Neues?", "fr": "Comment ça va? / Quoi de neuf?", "es": "¿Cómo te va? / ¿Qué tal?", "it": "Come va? / Che c'è di nuovo?", "tr": "Nasıl gidiyor? / Ne haber?", "ar": "كيف تجري الأمور؟", "fa": "اوضاع چطوره؟ / چه خبر؟", "zh-CN": "怎么样？ / 有什么新鲜事吗？", "ja": "調子はどうですか？" },
  { "tj": "Аз дидори шумо шодам!", "ru": "Рад вас видеть! / Рад встрече!", "en": "Nice to meet you! / Glad to see you!", "de": "Schön, dich / Sie zu sehen!", "fr": "Ravi de vous rencontrer!", "es": "¡Gusto en conocerte! / ¡Me alegro de verte!", "it": "Piacere di conoscerti!", "tr": "Tanıştığımıza memnun oldum!", "ar": "سررت بلقائك!", "fa": "از دیدنت خوشحالم! / از آشنایی با شما خوشبختم!", "zh-CN": "很高兴见到你！", "ja": "はじめまして！ / お会いできて嬉しいです！" },
  { "tj": "Хуш омадед!", "ru": "Добро пожаловать!", "en": "Welcome!", "de": "Willkommen!", "fr": "Bienvenue!", "es": "¡Bienvenido!", "it": "Benvenuto!", "tr": "Hoş geldiniz!", "ar": "أهلاً وسهلاً!", "fa": "خوش آمدید!", "zh-CN": "欢迎！", "ja": "ようこそ！" },
  { "tj": "Хайр! / Саломат бошед!", "ru": "До свидания! / Пока!", "en": "Goodbye! / Bye!", "de": "Auf Wiedersehen! / Tschüss!", "fr": "Au revoir!", "es": "¡Adiós!", "it": "Arrivederci! / Ciao!", "tr": "Hoşça kal! / Güle güle!", "ar": "مع السلامة! / وداعاً!", "fa": "خداحافظ!", "zh-CN": "再见！", "ja": "さようなら！" },
  { "tj": "То бозгашт! / То дидор!", "ru": "До встречи! / Скоро увидимся!", "en": "See you! / See you soon!", "de": "Bis bald! / Bis später!", "fr": "À bientôt!", "es": "¡Hasta pronto! / ¡Nos vemos!", "it": "A presto!", "tr": "Görüşmek üzere! / Görüşürüz!", "ar": "إلى اللقاء قريباً!", "fa": "به امید دیدار! / تا بعد!", "zh-CN": "回头见！ / 再会！", "ja": "またね！ / またお会いしましょう！" },
  { "tj": "Шаби хуш! / Шаб ба хайр!", "ru": "Спокойной ночи!", "en": "Good night!", "de": "Gute Nacht!", "fr": "Bonne nuit!", "es": "¡Buenas noches!", "it": "Buonanotte!", "tr": "İyi geceler!", "ar": "تصبح على خير!", "fa": "شب خوش! / شب به خیر!", "zh-CN": "晚安！", "ja": "おやすみなさい！" }
],
    pronouns: [
  // Ҷонишинҳои шахсӣ (Субъект)
  { tj: "ман", ru: "я", en: "i", de: "ich", fr: "je", es: "yo", it: "io", tr: "ben", ar: "أنا", fa: "من", "zh-CN": "我", ja: "私" },
  { tj: "ту", ru: "ты", en: "you", de: "du", fr: "tu", es: "tú", it: "tu", tr: "sen", ar: "أنت", fa: "تو", "zh-CN": "你", ja: "あなた" },
  { tj: "ӯ", ru: "он / она", en: "he / she", de: "er / sie", fr: "il / elle", es: "él / ella", it: "lui / lei", tr: "o", ar: "هو / هي", fa: "او", "zh-CN": "他 / 她", ja: "彼 / 彼女" },
  { tj: "мо", ru: "мы", en: "we", de: "wir", fr: "nous", es: "nosotros", it: "noi", tr: "biz", ar: "نحن", fa: "ما", "zh-CN": "我们", ja: "私たち" },
  { tj: "шумо", ru: "вы", en: "you (plural)", de: "ihr / Sie", fr: "vous", es: "vosotros / ustedes", it: "voi", tr: "siz", ar: "أنتم", fa: "شما", "zh-CN": "你们", ja: "あなたたち" },
  { tj: "онҳо", ru: "они", en: "they", de: "sie", fr: "ils / elles", es: "ellos / ellas", it: "loro", tr: "onlar", ar: "هم", fa: "آنها", "zh-CN": "他们", ja: "彼ら" },

  // Ҷонишинҳои шахсӣ (Объект)
  { tj: "маро", ru: "меня", en: "me", de: "mich", fr: "me", es: "me", it: "mi", tr: "beni", ar: "ني", fa: "مرا", "zh-CN": "我 (宾)", ja: "私を" },
  { tj: "туро", ru: "тебя", en: "you (obj)", de: "dich", fr: "te", es: "te", it: "ti", tr: "seni", ar: "ك", fa: "تورا", "zh-CN": "你 (宾)", ja: "あなたを" },
  { tj: "ӯро", ru: "его / её", en: "him / her", de: "ihn / sie", fr: "le / la", es: "lo / la", it: "lo / la", tr: "onu", ar: "ه / ها", fa: "او را", "zh-CN": "他/她 (宾)", ja: "彼/彼女を" },
  { tj: "моро", ru: "нас", en: "us", de: "uns", fr: "nous", es: "nos", it: "ci", tr: "bizi", ar: "نا", fa: "ما را", "zh-CN": "我们 (宾)", ja: "私たちを" },
  { tj: "шуморо", ru: "вас", en: "you (obj pl)", de: "euch", fr: "vous", es: "os / los", it: "vi", tr: "sizi", ar: "كم", fa: "شما را", "zh-CN": "你们 (宾)", ja: "あなたたちを" },
  { tj: "онҳоро", ru: "их", en: "them", de: "sie (obj)", fr: "les", es: "los / las", it: "li / le", tr: "onları", ar: "هم (مفعول)", fa: "آنها را", "zh-CN": "他们 (宾)", ja: "彼らを" },

  // Ҷонишинҳои нафсӣ (Худи)
  { tj: "худам", ru: "я сам", en: "myself", de: "selbst", fr: "moi-même", es: "yo mismo", it: "me stesso", tr: "kendim", ar: "نفسي", fa: "خودم", "zh-CN": "我自己", ja: "自分自身" },
  { tj: "худат", ru: "ты сам", en: "yourself", de: "selbst", fr: "toi-même", es: "tú mismo", it: "te stesso", tr: "kendin", ar: "نفسك", fa: "خودت", "zh-CN": "你自己", ja: "あなた自身" },
  { tj: "худаш", ru: "он сам", en: "himself / herself", de: "selbst", fr: "lui-même", es: "él mismo", it: "se stesso", tr: "kendisi", ar: "نفسه", fa: "خودش", "zh-CN": "他自己", ja: "彼自身" },

  // Ҷонишинҳои ишоратӣ
  { tj: "ин", ru: "этот", en: "this", de: "dieser", fr: "ce / cet", es: "este", it: "questo", tr: "bu", ar: "هذا", fa: "این", "zh-CN": "这", ja: "これ" },
  { tj: "он", ru: "тот", en: "that", de: "jener", fr: "cela", es: "ese / aquel", it: "quello", tr: "şu / o", ar: "ذلك", fa: "آن", "zh-CN": "那", ja: "あれ" },

  // Ҷонишинҳои саволӣ
  { tj: "ки", ru: "кто", en: "who", de: "wer", fr: "qui", es: "quién", it: "chi", tr: "kim", ar: "من", fa: "کی / چه کسی", "zh-CN": "谁", ja: "だれ" },
  { tj: "чӣ", ru: "что", en: "what", de: "was", fr: "quoi", es: "qué", it: "cosa", tr: "ne", ar: "ماذا", fa: "چی / چه", "zh-CN": "什么", ja: "なに" },
  { tj: "кадом", ru: "какой", en: "which", de: "welcher", fr: "quel", es: "cuál", it: "quale", tr: "hangi", ar: "أي", fa: "کدام", "zh-CN": "哪个", ja: "どれ" }
],

colors: [
  { tj: "сафед", ru: "белый", en: "white", de: "Weiß", fr: "blanc", es: "blanco", it: "bianco", tr: "beyaz", ar: "أبيض", fa: "سفید", "zh-CN": "白色", ja: "白" },
  { tj: "сиёҳ", ru: "черный", en: "black", de: "Schwarz", fr: "noir", es: "negro", it: "nero", tr: "siyah", ar: "أسود", fa: "مشکی", "zh-CN": "黑色", ja: "黒" },
  { tj: "сурх", ru: "красный", en: "red", de: "Rot", fr: "rouge", es: "rojo", it: "rosso", tr: "kırmızı", ar: "أحمر", fa: "قرمز", "zh-CN": "红色", ja: "赤" },
  { tj: "кабуд", ru: "синий", en: "blue", de: "Blau", fr: "bleu", es: "azul", it: "blu", tr: "mavi", ar: "أزرق", fa: "آبی", "zh-CN": "蓝色", ja: "青" },
  { tj: "зард", ru: "желтый", en: "yellow", de: "Gelb", fr: "jaune", es: "amarillo", it: "giallo", tr: "sarı", ar: "أصفر", fa: "زرد", "zh-CN": "黄色", ja: "黄色" },
  { tj: "сабз", ru: "зеленый", en: "green", de: "Grün", fr: "vert", es: "verde", it: "verde", tr: "yeşil", ar: "أخضر", fa: "سبز", "zh-CN": "绿色", ja: "緑" },
  { tj: "норанҷӣ", ru: "оранжевый", en: "orange", de: "Orange", fr: "orange", es: "naranja", it: "arancione", tr: "turuncu", ar: "برتقالي", fa: "نارنجی", "zh-CN": "橙色", ja: "オレンジ色" },
  { tj: "бунафш", ru: "фиолетовый", en: "purple", de: "Lila", fr: "violet", es: "morado", it: "viola", tr: "mor", ar: "بنفسجي", fa: "بنفش", "zh-CN": "紫色", ja: "紫" },
  { tj: "гулобӣ", ru: "розовый", en: "pink", de: "Rosa", fr: "rose", es: "rosa", it: "rosa", tr: "pembe", ar: "وردي", fa: "صورتی", "zh-CN": "粉红色", ja: "ピンク" },
  { tj: "қаҳваранг", ru: "коричневый", en: "brown", de: "Braun", fr: "marron", es: "marrón", it: "marrone", tr: "kahverengi", ar: "بني", fa: "قهوه‌ای", "zh-CN": "棕色", ja: "茶色" },
  { tj: "хокистарӣ", ru: "серый", en: "gray", de: "Grau", fr: "gris", es: "gris", it: "grigio", tr: "gri", ar: "رمادي", fa: "خاکستری", "zh-CN": "灰色", ja: "灰色" },
  { tj: "тиллоӣ", ru: "золотой", en: "gold", de: "Gold", fr: "or", es: "dorado", it: "oro", tr: "altın", ar: "ذهبي", fa: "طلایی", "zh-CN": "金色", ja: "金色" }
],
daysOfWeek: [
  { tj: "душанбе", ru: "понедельник", en: "monday", de: "Montag", fr: "lundi", es: "lunes", it: "lunedì", tr: "pazartesi", ar: "الإثنين", fa: "دوشنبه", "zh-CN": "星期一", ja: "月曜日" },
  { tj: "сешанбе", ru: "вторник", en: "tuesday", de: "Dienstag", fr: "mardi", es: "martes", it: "martedì", tr: "salı", ar: "الثلاثاء", fa: "سهشنبه", "zh-CN": "星期二", ja: "火曜日" },
  { tj: "чоршанбе", ru: "среда", en: "wednesday", de: "Mittwoch", fr: "mercredi", es: "miércoles", it: "mercoledì", tr: "çarşamba", ar: "الأربعاء", fa: "چهارشنبه", "zh-CN": "星期三", ja: "水曜日" },
  { tj: "پنجшанбе", ru: "четверг", en: "thursday", de: "Donnerstag", fr: "donnerstag", es: "jueves", it: "giovedì", tr: "perşembe", ar: "الخميس", fa: "پنجشنبه", "zh-CN": "星期四", ja: "木曜日" },
  { tj: "ҷумъа", ru: "пятница", en: "friday", de: "Freitag", fr: "vendredi", es: "viernes", it: "venerdì", tr: "cuma", ar: "الجمعة", fa: "جمعه", "zh-CN": "星期五", ja: "金曜日" },
  { tj: "шанбе", ru: "суббота", en: "saturday", de: "Samstag", fr: "samedi", es: "sábado", it: "sabato", tr: "cumartesi", ar: "السبت", fa: "شنبه", "zh-CN": "星期六", ja: "土曜日" },
  { tj: "якшанбе", ru: "воскресенье", en: "sunday", de: "Sonntag", fr: "dimanche", es: "domingo", it: "domenica", tr: "pazar", ar: "الأحد", fa: "یکشنبه", "zh-CN": "星期日", ja: "日曜日" },
  { tj: "дирӯз", ru: "вчера", en: "yesterday", de: "gestern", fr: "hier", es: "ayer", it: "ieri", tr: "dün", ar: "أمس", fa: "دیروز", "zh-CN": "昨天", ja: "昨日" },
  { tj: "имрӯз", ru: "сегодня", en: "today", de: "heute", fr: "aujourd'hui", es: "hoy", it: "oggi", tr: "bugün", ar: "اليوم", fa: "امروز", "zh-CN": "今天", ja: "今日" },
  { tj: "фардо", ru: "завтра", en: "tomorrow", de: "morgen", fr: "demain", es: "mañana", it: "domani", tr: "yarın", ar: "غدًا", fa: "فردا", "zh-CN": "明天", ja: "明日" }
],
family: [
  { tj: "оила", ru: "семья", en: "family", de: "Familie", fr: "famille", es: "familia", it: "famiglia", tr: "aile", ar: "عائلة", fa: "خانواده", "zh-CN": "家庭", ja: "家族" },
  { tj: "падару модар", ru: "родители", en: "parents", de: "Eltern", fr: "parents", es: "padres", it: "genitori", tr: "ebeveyn", ar: "والدان", fa: "پدر و مادر", "zh-CN": "父母", ja: "両親" },
  { tj: "падар", ru: "отец", en: "father", de: "Vater", fr: "père", es: "padre", it: "padre", tr: "baba", ar: "أب", fa: "پدر", "zh-CN": "父亲", ja: "父親" },
  { tj: "модар", ru: "мать", en: "mother", de: "Mutter", fr: "mère", es: "madre", it: "madre", tr: "anne", ar: "أم", fa: "مادر", "zh-CN": "母亲", ja: "母親" },
  { tj: "писар", ru: "сын", en: "son", de: "Sohn", fr: "fils", es: "hijo", it: "figlio", tr: "oğul", ar: "ابن", fa: "پسر", "zh-CN": "儿子", ja: "息子" },
  { tj: "духтар", ru: "дочь", en: "daughter", de: "Tochter", fr: "fille", es: "hija", it: "figlia", tr: "kız", ar: "ابنة", fa: "دختر", "zh-CN": "女儿", ja: "娘" },
  { tj: "бародар", ru: "брат", en: "brother", de: "Bruder", fr: "frère", es: "hermano", it: "fratello", tr: "erkek kardeş", ar: "أخ", fa: "برادر", "zh-CN": "兄弟", ja: "兄弟" },
  { tj: "хоҳар", ru: "сестра", en: "sister", de: "Schwester", fr: "sœur", es: "hermana", it: "sorella", tr: "kız kardeş", ar: "أخت", fa: "خواهر", "zh-CN": "姐妹", ja: "姉妹" },
  { tj: "бобо", ru: "дедушка", en: "grandfather", de: "Großvater", fr: "grand-père", es: "abuelo", it: "nonno", tr: "dede", ar: "جد", fa: "پدربزرگ", "zh-CN": "爷爷", ja: "祖父" },
  { tj: "бибӣ", ru: "бабушка", en: "grandmother", de: "Großmutter", fr: "grand-mère", es: "abuela", it: "nonna", tr: "büyükanne", ar: "جدة", fa: "مادربزرг", "zh-CN": "奶奶", ja: "祖母" },
  { tj: "шавҳар", ru: "муж", en: "husband", de: "Ehemann", fr: "mari", es: "esposo", it: "marito", tr: "koca", ar: "زوج", fa: "شوهر", "zh-CN": "丈夫", ja: "夫" },
  { tj: "зан", ru: "жена", en: "wife", de: "Ehefrau", fr: "femme", es: "esposa", it: "moglie", tr: "eş", ar: "زوجة", fa: "زن / همسر", "zh-CN": "妻子", ja: "妻" }
],

numbers: [
  { tj: "як", ru: "один", en: "one", de: "eins", fr: "un", es: "uno", it: "uno", tr: "bir", ar: "واحد", fa: "یک", "zh-CN": "一", ja: "一" },
  { tj: "ду", ru: "два", en: "two", de: "zwei", fr: "deux", es: "dos", it: "due", tr: "iki", ar: "اثنان", fa: "دو", "zh-CN": "二", ja: "二" },
  { tj: "се", ru: "три", en: "three", de: "drei", fr: "trois", es: "tres", it: "tre", tr: "üç", ar: "ثلاثة", fa: "سه", "zh-CN": "三", ja: "三" },
  { tj: "чор", ru: "четыре", en: "four", de: "vier", fr: "quatre", es: "cuatro", it: "quattro", tr: "dört", ar: "أربعة", fa: "چهار", "zh-CN": "四", ja: "四" },
  { tj: "панҷ", ru: "пять", en: "five", de: "fünf", fr: "cinq", es: "cinco", it: "cinque", tr: "beş", ar: "خمسة", fa: "پنج", "zh-CN": "五", ja: "五" },
  { tj: "шаш", ru: "шесть", en: "six", de: "sechs", fr: "six", es: "seis", it: "sei", tr: "altı", ar: "ستة", fa: "شش", "zh-CN": "六", ja: "六" },
  { tj: "ҳафт", ru: "семь", en: "seven", de: "sieben", fr: "sept", es: "siete", it: "sette", tr: "yedi", ar: "سبعة", fa: "هفت", "zh-CN": "七", ja: "七" },
  { tj: "ҳашт", ru: "восемь", en: "eight", de: "acht", fr: "huit", es: "ocho", it: "otto", tr: "sekiz", ar: "ثمانية", fa: "هشت", "zh-CN": "八", ja: "八" },
  { tj: "неҳ", ru: "девять", en: "nine", de: "neun", fr: "neuf", es: "nueve", it: "nove", tr: "dokuz", ar: "تسعة", fa: "نه", "zh-CN": "九", ja: "九" },
  { tj: "деҳ", ru: "десять", en: "ten", de: "zehn", fr: "dix", es: "diez", it: "dieci", tr: "on", ar: "عشرة", fa: "ده", "zh-CN": "十", ja: "十" }
],
tens: [
  { tj: "даҳ", ru: "десять", en: "ten", de: "zehn", fr: "dix", es: "diez", it: "dieci", tr: "on", ar: "عشرة", fa: "ده", "zh-CN": "十", ja: "十" },
  { tj: "бист", ru: "двадцать", en: "twenty", de: "zwanzig", fr: "vingt", es: "veinte", it: "venti", tr: "yirmi", ar: "عشرون", fa: "بیست", "zh-CN": "二十", ja: "二十" },
  { tj: "сиро", ru: "тридцать", en: "thirty", de: "dreißig", fr: "trente", es: "treinta", it: "trenta", tr: "otuz", ar: "ثلاثون", fa: "سی", "zh-CN": "三十", ja: "三十" },
  { tj: "чил", ru: "сорок", en: "forty", de: "vierzig", fr: "quarante", es: "cuarenta", it: "quaranta", tr: "kırk", ar: "أربعون", fa: "چهل", "zh-CN": "四十", ja: "四十" },
  { tj: "панҷоҳ", ru: "пятьдесят", en: "fifty", de: "fünfzig", fr: "cinquante", es: "cincuenta", it: "cinquanta", tr: "elli", ar: "خمسون", fa: "پنجاه", "zh-CN": "五十", ja: "五十" },
  { tj: "шаст", ru: "шестьдесят", en: "sixty", de: "sechzig", fr: "soixante", es: "sesenta", it: "sessanta", tr: "altmış", ar: "ستون", fa: "شصت", "zh-CN": "六十", ja: "六十" },
  { tj: "ҳафтод", ru: "семьдесят", en: "seventy", de: "siebzig", fr: "soixante-dix", es: "setenta", it: "settanta", tr: "yetmiş", ar: "سبعون", fa: "هفتاد", "zh-CN": "七十", ja: "七十" },
  { tj: "ҳаштод", ru: "восемьдесят", en: "eighty", de: "achtzig", fr: "quatre-vingts", es: "ochenta", it: "ottanta", tr: "seksen", ar: "ثمانون", fa: "هشتاد", "zh-CN": "八十", ja: "八十" },
  { tj: "навад", ru: "девяносто", en: "ninety", de: "neunzig", fr: "quatre-vingt-dix", es: "noventa", it: "novanta", tr: "doksan", ar: "تسعون", fa: "نود", "zh-CN": "九十", ja: "九十" },
  { tj: "сад", ru: "сто", en: "one hundred", de: "hundert", fr: "cent", es: "cien", it: "cento", tr: "yüz", ar: "مئة", fa: "صد", "zh-CN": "一百", ja: "百" }
],
hundreds: [
  { tj: "сад", ru: "сто", en: "one hundred", de: "hundert", fr: "cent", es: "cien", it: "cento", tr: "yüz", ar: "مئة", fa: "صد", "zh-CN": "一百", ja: "百" },
  { tj: "дусад", ru: "двести", en: "two hundred", de: "zweihundert", fr: "deux cents", es: "doscientos", it: "duecento", tr: "iki yüz", ar: "مئتان", fa: "دویست", "zh-CN": "二百", ja: "二百" },
  { tj: "сесад", ru: "триста", en: "three hundred", de: "dreihundert", fr: "trois cents", es: "trescientos", it: "trecento", tr: "üç yüz", ar: "ثلاث مئة", fa: "سیصد", "zh-CN": "三百", ja: "三百" },
  { tj: "чорсад", ru: "четыреста", en: "four hundred", de: "vierhundert", fr: "quatre cents", es: "cuatrocientos", it: "quattrocento", tr: "dört yüz", ar: "أربع مئة", fa: "چهارصد", "zh-CN": "四百", ja: "四百" },
  { tj: "панҷсад", ru: "пятьсот", en: "five hundred", de: "fünfhundert", fr: "cinq cents", es: "quinientos", it: "cinquecento", tr: "beş yüz", ar: "خمس مئة", fa: "پانصد", "zh-CN": "五百", ja: "五百" },
  { tj: "шашсад", ru: "шестьсот", en: "six hundred", de: "sechshundert", fr: "six cents", es: "seiscientos", it: "seicento", tr: "altı yüz", ar: "ست مئة", fa: "ششصد", "zh-CN": "六百", ja: "六百" },
  { tj: "ҳафтсад", ru: "семьсот", en: "seven hundred", de: "siebenhundert", fr: "sept cents", es: "setecientos", it: "settecento", tr: "yedi yüz", ar: "سبع مئة", fa: "هفتصد", "zh-CN": "七百", ja: "七百" },
  { tj: "ҳаштсад", ru: "восемьсот", en: "eight hundred", de: "achthundert", fr: "huit cents", es: "ochocientos", it: "ottocento", tr: "sekiz yüz", ar: "ثمان مئة", fa: "هشتصد", "zh-CN": "八百", ja: "八百" },
  { tj: "неҳсад", ru: "девятьсот", en: "nine hundred", de: "neunhundert", fr: "neuf cents", es: "novecientos", it: "novecento", tr: "dokuz yüz", ar: "تسع مئة", fa: "نهصد", "zh-CN": "九百", ja: "九百" },
  { tj: "ҳазор", ru: "тысяча", en: "one thousand", de: "tausend", fr: "mille", es: "mil", it: "mille", tr: "bin", ar: "ألف", fa: "هزار", "zh-CN": "一千", ja: "千" }
],
adjectives: [
  // Андоза ва ҳаҷм
  { tj: "калон", ru: "большой", en: "big", de: "groß", fr: "grand", es: "grande", it: "grande", tr: "büyük", ar: "كبير", fa: "بزرگ", "zh-CN": "大", ja: "大きい" },
  { tj: "хурд", ru: "маленький", en: "small", de: "klein", fr: "petit", es: "pequeño", it: "piccolo", tr: "küçük", ar: "صغير", fa: "کوچک", "zh-CN": "小", ja: "小さい" },
  { tj: "дароз", ru: "длинный", en: "long", de: "lang", fr: "long", es: "largo", it: "lungo", tr: "uzun", ar: "طويل", fa: "دراز", "zh-CN": "长", ja: "長い" },
  { tj: "кӯтоҳ", ru: "короткий", en: "short", de: "kurz", fr: "court", es: "corto", it: "corto", tr: "kısa", ar: "قصير", fa: "کوتاه", "zh-CN": "短", ja: "短い" },

  // Сифат ва ҳолат
  { tj: "хуб", ru: "хороший", en: "good", de: "gut", fr: "bon", es: "bueno", it: "buono", tr: "iyi", ar: "جيد", fa: "خوب", "zh-CN": "好", ja: "良い" },
  { tj: "бад", ru: "плохой", en: "bad", de: "schlecht", fr: "mauvais", es: "malo", it: "cattivo", tr: "kötü", ar: "سيء", fa: "بد", "zh-CN": "坏", ja: "悪い" },
  { tj: "зебо", ru: "красивый", en: "beautiful", de: "schön", fr: "beau", es: "hermoso", it: "bello", tr: "güzel", ar: "جميل", fa: "زیبا", "zh-CN": "美丽", ja: "美しい" },
  { tj: "хунук", ru: "холодный", en: "cold", de: "kalt", fr: "froid", es: "frío", it: "freddo", tr: "soğuk", ar: "بارد", fa: "سرد", "zh-CN": "冷", ja: "冷たい" },
  { tj: "гарм", ru: "теплый / горячий", en: "warm / hot", de: "warm / heiß", fr: "chaud", es: "caliente", it: "caldo", tr: "sıcak", ar: "دافئ / حار", fa: "گرم", "zh-CN": "热 / 温暖", ja: "温かい / 熱い" },

  // Нав ва кӯҳна
  { tj: "нав", ru: "новый", en: "new", de: "neu", fr: "nouveau", es: "nuevo", it: "nuovo", tr: "yeni", ar: "جديد", fa: "نو", "zh-CN": "新", ja: "新しい" },
  { tj: "кӯҳна", ru: "старый", en: "old", de: "alt", fr: "vieux", es: "viejo", it: "vecchio", tr: "eski", ar: "قديم", fa: "کهنه", "zh-CN": "旧", ja: "古い" },

  // Осон ва душвор
  { tj: "осон", ru: "легкий", en: "easy", de: "einfach", fr: "facile", es: "fácil", it: "facile", tr: "kolay", ar: "سهل", fa: "آسان", "zh-CN": "容易", ja: "簡単な" },
  { tj: "душвор", ru: "трудный", en: "difficult", de: "schwierig", fr: "difficile", es: "difícil", it: "difficile", tr: "zor", ar: "صعب", fa: "دشوار", "zh-CN": "困难", ja: "難しい" },
  { tj: "муҳим", ru: "важный", en: "important", de: "wichtig", fr: "important", es: "importante", it: "importante", tr: "önemli", ar: "مهم", fa: "مهم", "zh-CN": "重要", ja: "重要な" }
],
moreAdjectives: [
  // Эҳсосот ва ҳолат
  { tj: "шод", ru: "радостный", en: "happy", de: "glücklich", fr: "joyeux", es: "feliz", it: "felice", tr: "mutlu", ar: "سعيد", fa: "شاد", "zh-CN": "快乐", ja: "嬉しい" },
  { tj: "ғамгин", ru: "грустный", en: "sad", de: "traurig", fr: "triste", es: "triste", it: "triste", tr: "üzgün", ar: "حزين", fa: "غمگین", "zh-CN": "悲伤", ja: "悲しい" },
  { tj: "хаста", ru: "уставший", en: "tired", de: "müde", fr: "fatigué", es: "cansado", it: "stanco", tr: "yorgun", ar: "تعبان", fa: "خسته", "zh-CN": "累", ja: "疲れた" },
  { tj: "солим", ru: "здоровый", en: "healthy", de: "gesund", fr: "sain", es: "saludable", it: "sano", tr: "sağlıklı", ar: "صحي", fa: "سالم", "zh-CN": "健康", ja: "健康な" },

  // Молия ва мақом
  { tj: "бой", ru: "богатый", en: "rich", de: "reich", fr: "riche", es: "rico", it: "ricco", tr: "zengin", ar: "غني", fa: "پولدار", "zh-CN": "富有", ja: "金持ち" },
  { tj: "камбағал", ru: "бедный", en: "poor", de: "arm", fr: "pauvre", es: "pobre", it: "povero", tr: "fakir", ar: "فقير", fa: "فقیر", "zh-CN": "贫穷", ja: "乏しい" },

  // Суръат ва қувва
  { tj: "тез", ru: "быстрый", en: "fast", de: "schnell", fr: "rapide", es: "rápido", it: "veloce", tr: "hızlı", ar: "سريع", fa: "سریع", "zh-CN": "快", ja: "速い" },
  { tj: "пурқувват", ru: "сильный", en: "strong", de: "stark", fr: "fort", es: "fuerte", it: "forte", tr: "güçlü", ar: "قوي", fa: "قوی", "zh-CN": "强壮", ja: "強い" },

  // Сифатҳои ашё ва муҳит
  { tj: "вазнин", ru: "тяжелый", en: "heavy", de: "schwer", fr: "lourd", es: "pesado", it: "pesante", tr: "ağır", ar: "ثقيل", fa: "سنگین", "zh-CN": "重", ja: "重い" },
  { tj: "сабук", ru: "легкий", en: "light", de: "light", fr: "léger", es: "ligero", it: "leggero", tr: "hafif", ar: "خفيف", fa: "سبک", "zh-CN": "轻", ja: "軽い" },
  { tj: "тоза", ru: "чистый", en: "clean", de: "sauber", fr: "propre", es: "limpio", it: "pulito", tr: "temiz", ar: "نظيف", fa: "تمیز", "zh-CN": "干净", ja: "きれいな" },
  { tj: "ифлос", ru: "грязный", en: "dirty", de: "schmutzig", fr: "sale", es: "sucio", it: "sporco", tr: "kirli", ar: "متسخ", fa: "کثیف", "zh-CN": "脏", ja: "汚い" },

  // Дигар сифатҳо
  { tj: "оқил", ru: "умный", en: "smart / wise", de: "klug", fr: "intelligent", es: "inteligente", it: "intelligente", tr: "akıllı", ar: "ذكية", fa: "عاقل / باهوش", "zh-CN": "聪明", ja: "賢い" },
  { tj: "ҷавон", ru: "молодой", en: "young", de: "jung", fr: "jeune", es: "joven", it: "giovane", tr: "genç", ar: "شاب", fa: "جوان", "zh-CN": "年轻", ja: "若い" },
  { tj: "گران", ru: "дорогой", en: "expensive", de: "teuer", fr: "cher", es: "caro", it: "costoso", tr: "pahalı", ar: "غالي", fa: "گران", "zh-CN": "昂贵", ja: "高い" }
],
adverbs: [
  { tj: "ҳоло", ru: "сейчас", en: "now", de: "jetzt", fr: "maintenant", es: "ahora", it: "ora", tr: "şimdi", ar: "الآن", fa: "اکنون", "zh-CN": "现在", ja: "今" },
  { tj: "ҳамеша", ru: "всегда", en: "always", de: "immer", fr: "toujours", es: "siempre", it: "sempre", tr: "her zaman", ar: "دائمًا", fa: "همیشه", "zh-CN": "总是", ja: "いつも" },
  { tj: "ҳеҷ вақт", ru: "никогда", en: "never", de: "nie", fr: "jamais", es: "nunca", it: "mai", tr: "asla", ar: "أبدًا", fa: "هرگز", "zh-CN": "never", ja: "決して" },
  { tj: "зуд", ru: "быстро", en: "quickly", de: "schnell", fr: "vite", es: "rápido", it: "velocemente", tr: "hızlıca", ar: "بسرعة", fa: "سریع", "zh-CN": "快", ja: "速く" },
  { tj: "оҳиста", ru: "медленно", en: "slowly", de: "langsam", fr: "lentement", es: "lentamente", it: "lentamente", tr: "yavaşça", ar: "ببطء", fa: "آهسته", "zh-CN": "慢", ja: "ゆっくり" },
  { tj: "дар ин ҷо", ru: "здесь", en: "here", de: "hier", fr: "ici", es: "aquí", it: "qui", tr: "burada", ar: "هنا", fa: "اینجا", "zh-CN": "这里", ja: "ここ" },
  { tj: "дар он ҷо", ru: "там", en: "there", de: "dort", fr: "là", es: "allí", it: "lì", tr: "orada", ar: "هناك", fa: "آنجا", "zh-CN": "那里", ja: "あそこ" },
  { tj: "бисёр", ru: "много", en: "much / a lot", de: "viel", fr: "beaucoup", es: "mucho", it: "molto", tr: "çok", ar: "كثيرًا", fa: "بسیار", "zh-CN": "多", ja: "たくさん" },
  { tj: "кам", ru: "мало", en: "little / few", de: "wenig", fr: "peu", es: "poco", it: "poco", tr: "az", ar: "قليلًا", fa: "کم", "zh-CN": "少", ja: "少し" },
  { tj: "хуб", ru: "хорошо", en: "well", de: "gut", fr: "bien", es: "bien", it: "bene", tr: "iyi", ar: "جيدًا", fa: "خوب", "zh-CN": "好", ja: "よく" },
  { tj: "бад", ru: "плохо", en: "badly", de: "schlecht", fr: "mal", es: "mal", it: "male", tr: "kötü", ar: "سيئًا", fa: "بد", "zh-CN": "坏", ja: "悪く" },
  { tj: "шояд", ru: "возможно", en: "maybe / perhaps", de: "vielleicht", fr: "peut-être", es: "quizás", it: "forse", tr: "belki", ar: "ربما", fa: "شاید", "zh-CN": "也许", ja: "多分" }
],
moreVerbs: [
  { tj: "навиштан", ru: "писать", en: "to write", de: "schreiben", fr: "écrire", es: "escribir", it: "scrivere", tr: "yazmak", ar: "كتب", fa: "نوشتن", "zh-CN": "写", ja: "書く" },
  { tj: "кор кардан", ru: "работать", en: "to work", de: "arbeiten", fr: "travailler", es: "trabajar", it: "lavorare", tr: "çalışmak", ar: "عمل", fa: "کار کردن", "zh-CN": "工作", ja: "働く" },
  { tj: "хоб рафтан", ru: "спать", en: "to sleep", de: "schlafen", fr: "dormir", es: "dormir", it: "dormire", tr: "uyumak", ar: "نام", fa: "خوابیدن", "zh-CN": "睡觉", ja: "眠る" },
  { tj: "фаҳмидан", ru: "понимать", en: "to understand", de: "verstehen", fr: "comprendre", es: "comprender", it: "capire", tr: "anlamak", ar: "فهم", fa: "فهمیدن", "zh-CN": "明白", ja: "理解する" },
  { tj: "омӯхтан", ru: "учить", en: "to learn", de: "lernen", fr: "apprendre", es: "aprender", it: "imparare", tr: "öğrenmek", ar: "تعلم", fa: "آموختن", "zh-CN": "学习", ja: "学ぶ" },
  { tj: "харидан", ru: "покупать", en: "to buy", de: "kaufen", fr: "acheter", es: "comprar", it: "comprare", tr: "satın almak", ar: "اشترى", fa: "خریدن", "zh-CN": "买", ja: "買う" },
  { tj: "додан", ru: "давать", en: "to give", de: "geben", fr: "donner", es: "dar", it: "dare", tr: "vermek", ar: "أعطى", fa: "دادن", "zh-CN": "给", ja: "与える" },
  { tj: "гирифтан", ru: "брать", en: "to take", de: "nehmen", fr: "prendre", es: "tomar", it: "prendere", tr: "almak", ar: "أخذ", fa: "گرفتن", "zh-CN": "拿", ja: "取る" },
  { tj: "зиндагӣ кардан", ru: "жить", en: "to live", de: "leben", fr: "vivre", es: "vivir", it: "vivere", tr: "yaşamak", ar: "عاش", fa: "زندگی کردن", "zh-CN": "住", ja: "生きる" },
  { tj: "дӯст доштан", ru: "любить", en: "to love", de: "lieben", fr: "aimer", es: "amar", it: "amare", tr: "sevmek", ar: "أحب", fa: "دوست داشتن", "zh-CN": "爱", ja: "愛する" },
  { tj: "кумак кардан", ru: "помогать", en: "to help", de: "helfen", fr: "aider", es: "ayudar", it: "aiutare", tr: "yardım etmek", ar: "ساعد", fa: "کمک کردن", "zh-CN": "帮助", ja: "助ける" },
  { tj: "ёфтан", ru: "находить", en: "to find", de: "finden", fr: "trouver", es: "encontrar", it: "trovare", tr: "bulmak", ar: "وجد", fa: "یافتن", "zh-CN": "找到", ja: "見つける" }
],
verbs: [
  { tj: "будан", ru: "быть", en: "to be", de: "sein", fr: "être", es: "ser / estar", it: "essere", tr: "olmak", ar: "كان", fa: "بودن", "zh-CN": "是", ja: "ある / いる" },
  { tj: "доштан", ru: "иметь", en: "to have", de: "haben", fr: "avoir", es: "tener", it: "avere", tr: "sahip olmak", ar: "ملك", fa: "داشتن", "zh-CN": "有", ja: "持つ" },
  { tj: "кардан", ru: "делать", en: "to do", de: "tun / machen", fr: "faire", es: "hacer", it: "fare", tr: "yapmak", ar: "فعل", fa: "کردن", "zh-CN": "做", ja: "する" },
  { tj: "рафтан", ru: "идти", en: "to go", de: "gehen", fr: "aller", es: "ir", it: "andare", tr: "gitmek", ar: "ذهب", fa: "رفتن", "zh-CN": "去", ja: "行く" },
  { tj: "омадан", ru: "приходить", en: "to come", de: "kommen", fr: "venir", es: "venir", it: "venire", tr: "gelmek", ar: "جاء", fa: "آمدن", "zh-CN": "来", ja: "来る" },
  { tj: "дидан", ru: "видеть", en: "to see", de: "sehen", fr: "voir", es: "ver", it: "vedere", tr: "görmek", ar: "رأى", fa: "دیدن", "zh-CN": "看", ja: "見る" },
  { tj: "гуфтан", ru: "говорить", en: "to say", de: "sagen", fr: "dire", es: "decir", it: "dire", tr: "söylemek", ar: "قال", fa: "گفتن", "zh-CN": "说", ja: "言う" },
  { tj: "донистан", ru: "знать", en: "to know", de: "wissen", fr: "savoir", es: "saber", it: "sapere", tr: "bilmek", ar: "عرف", fa: "دانستن", "zh-CN": "知道", ja: "知る" },
  { tj: "хостан", ru: "хотеть", en: "to want", de: "wollen", fr: "vouloir", es: "querer", it: "volere", tr: "istemek", ar: "أراد", fa: "خواستن", "zh-CN": "想", ja: "欲しい" },
  { tj: "хӯрдан", ru: "есть", en: "to eat", de: "essen", fr: "manger", es: "comer", it: "mangiare", tr: "yemek", ar: "أكل", fa: "خوردن", "zh-CN": "吃", ja: "食べる" },
  { tj: "нӯшидан", ru: "пить", en: "to drink", de: "trinken", fr: "boire", es: "beber", it: "bere", tr: "içmek", ar: "شرب", fa: "نوشیدن", "zh-CN": "喝", ja: "飲む" },
  { tj: "хондан", ru: "читать", en: "to read", de: "lesen", fr: "lire", es: "leer", it: "leggere", tr: "okumak", ar: "قرأ", fa: "خواندن", "zh-CN": "读", ja: "読む" }
],
school: [
  { tj: "мактаб", ru: "школа", en: "school", de: "Schule", fr: "école", es: "escuela", it: "scuola", tr: "okul", ar: "مدرسة", fa: "مدرسه", "zh-CN": "学校", ja: "学校" },
  { tj: "муаллим", ru: "учитель", en: "teacher", de: "Lehrer", fr: "professeur", es: "profesor", it: "insegnante", tr: "öğretmen", ar: "معلم", fa: "معلم", "zh-CN": "老师", ja: "先生" },
  { tj: "хонанда", ru: "ученик", en: "student / pupil", de: "Schüler", fr: "élève", es: "alumno", it: "alunno", tr: "öğrenci", ar: "تلميذ", fa: "دانش‌آموز", "zh-CN": "学生", ja: "生徒" },
  { tj: "синф", ru: "класс", en: "classroom", de: "Klassenzimmer", fr: "classe", es: "aula", it: "classe", tr: "sınıf", ar: "فصل", fa: "کلاس", "zh-CN": "教室", ja: "教室" },
  { tj: "китоб", ru: "книга", en: "book", de: "Buch", fr: "livre", es: "libro", it: "libro", tr: "kitap", ar: "كتاب", fa: "کتاب", "zh-CN": "书", ja: "本" },
  { tj: "дафтар", ru: "тетрадь", en: "notebook", de: "Heft", fr: "cahier", es: "cuaderno", it: "quaderno", tr: "defter", ar: "دفتر", fa: "دفتر", "zh-CN": "笔记本", ja: "ノート" },
  { tj: "қалам", ru: "карандаш", en: "pencil", de: "Bleistift", fr: "crayon", es: "lápiz", it: "matita", tr: "kalem", ar: "قلم رصاص", fa: "مداد", "zh-CN": "铅笔", ja: "铅筆" },
  { tj: "ручка", ru: "ручка", en: "pen", de: "Kugelschreiber", fr: "stylo", es: "bolígrafo", it: "penna", tr: "tükenmez kalem", ar: "قلم", fa: "خودکار", "zh-CN": "钢笔", ja: "ペン" },
  { tj: "дарс", ru: "урок", en: "lesson", de: "Lektion / Unterricht", fr: "leçon", es: "lección", it: "lezione", tr: "ders", ar: "درس", fa: "درس", "zh-CN": "课", ja: "レッスン" },
  { tj: "вазифаи хонагӣ", ru: "домашнее задание", en: "homework", de: "Hausaufgabe", fr: "devoirs", es: "tarea", it: "compiti", tr: "ödev", ar: "واجب منزلي", fa: "تکلیف خانه", "zh-CN": "作业", ja: "宿題" },
  { tj: "имтиҳон", ru: "экзамен", en: "exam", de: "Prüfung", fr: "examen", es: "examen", it: "esame", tr: "sınav", ar: "امتحان", fa: "امتحان", "zh-CN": "考试", ja: "試験" },
  { tj: "баҳо", ru: "оценка", en: "grade / mark", de: "Note", fr: "note", es: "nota", it: "voto", tr: "not", ar: "درجة", fa: "نمره", "zh-CN": "成绩 / 分数", ja: "成績" },
  { tj: "ҷадвали дарсҳо", ru: "расписание", en: "timetable", de: "Stundenplan", fr: "emploi du temps", es: "horario", it: "orario", tr: "ders programı", ar: "جدول حصص", fa: "برنامه درسی", "zh-CN": "课程表", ja: "时刻表" },
  { tj: "китобхона", ru: "библиотека", en: "library", de: "Bibliothek", fr: "bibliothèque", es: "biblioteca", it: "biblioteca", tr: "kütüphane", ar: "مكتبة", fa: "کتابخانه", "zh-CN": "图书馆", ja: "図書館" },
  { tj: "донишгоҳ", ru: "университет", en: "university", de: "Universität", fr: "université", es: "universidad", it: "università", tr: "üniversite", ar: "جامعة", fa: "دانشگاه", "zh-CN": "大学", ja: "大学" }
],
places: [
  { tj: "шаҳр", ru: "город", en: "city", de: "Stadt", fr: "ville", es: "ciudad", it: "città", tr: "şehir", ar: "مدينة", fa: "شهر", "zh-CN": "城市", ja: "都市" },
  { tj: "деҳа", ru: "деревня", en: "village", de: "Dorf", fr: "village", es: "pueblo", it: "villaggio", tr: "köy", ar: "قرية", fa: "روستا", "zh-CN": "农村 / 村庄", ja: "村" },
  { tj: "хона", ru: "дом", en: "house / home", de: "Haus", fr: "maison", es: "casa", it: "casa", tr: "ev", ar: "منزل", fa: "خانه", "zh-CN": "房子 / 家", ja: "家" },
  { tj: "кӯча", ru: "улица", en: "street", de: "Straße", fr: "rue", es: "calle", it: "via", tr: "sokak", ar: "شارع", fa: "خیابان", "zh-CN": "街道", ja: "通り" },
  { tj: "мағоза", ru: "магазин", en: "shop / store", de: "Geschäft", fr: "magasin", es: "tienda", it: "negozio", tr: "mağaza", ar: "متجر", fa: "مغازه", "zh-CN": "商店", ja: "店" },
  { tj: "бозор", ru: "рынок", en: "market", de: "Markt", fr: "marché", es: "mercado", it: "mercato", tr: "pazar", ar: "سوق", fa: "بازار", "zh-CN": "市场", ja: "市场" },
  { tj: "шифохона", ru: "больница", en: "hospital", de: "Krankenhaus", fr: "hôpital", es: "hospital", it: "ospedale", tr: "hastane", ar: "مستشفى", fa: "بیمارستان", "zh-CN": "医院", ja: "病院" },
  { tj: "дорӯхона", ru: "аптека", en: "pharmacy", de: "Apotheke", fr: "pharmacie", es: "farmacia", it: "farmacia", tr: "eczane", ar: "صيدلية", fa: "داروخانه", "zh-CN": "药店", ja: "薬局" },
  { tj: "тарабхона", ru: "ресторан", en: "restaurant", de: "Restaurant", fr: "restaurant", es: "restaurante", it: "ristorante", tr: "restoran", ar: "مطعم", fa: "رستوران", "zh-CN": "餐厅", ja: "レストラン" },
  { tj: "меҳмонхона", ru: "отель / гостиница", en: "hotel", de: "Hotel", fr: "hôtel", es: "hotel", it: "hotel", tr: "otel", ar: "فندق", fa: "هتل", "zh-CN": "酒店", ja: "ホテル" },
  { tj: "бонк", ru: "банк", en: "bank", de: "Bank", fr: "banque", es: "banco", it: "banca", tr: "banka", ar: "بنك", fa: "بانک", "zh-CN": "银行", ja: "银行" },
  { tj: "боғ", ru: "парк", en: "park", de: "Park", fr: "parc", es: "parque", it: "parco", tr: "park", ar: "حديقة", fa: "پارک / باغ", "zh-CN": "公园", ja: "公園" },
  { tj: "фурудгоҳ", ru: "аэропорт", en: "airport", de: "Flughafen", fr: "aéroport", es: "aeropuerto", it: "aeroporto", tr: "havalimanı", ar: "مطار", fa: "فرودگاه", "zh-CN": "机场", ja: "空港" },
  { tj: "истгоҳ", ru: "вокзал / остановка", en: "station", de: "Bahnhof", fr: "gare / station", es: "estación", it: "stazione", tr: "istasyon", ar: "محطة", fa: "ایستگاه", "zh-CN": "车站", ja: "駅" },
  { tj: "кинотеатр", ru: "кинотеатр", en: "cinema / theater", de: "Kino", fr: "cinéma", es: "cine", it: "cinema", tr: "sinema", ar: "سينما", fa: "سینما", "zh-CN": "电影院", ja: "映画館" }
],
  school: [
  { tj: "мактаб", ru: "школа", en: "school", de: "Schule", fr: "école", es: "escuela", it: "scuola", tr: "okul", ar: "مدرسة", fa: "مدرسه", "zh-CN": "学校", ja: "学校" },
  { tj: "муаллим", ru: "учитель", en: "teacher", de: "Lehrer", fr: "professeur", es: "profesor", it: "insegnante", tr: "öğretmen", ar: "معلم", fa: "معلم", "zh-CN": "老师", ja: "先生" },
  { tj: "хонанда", ru: "ученик", en: "student / pupil", de: "Schüler", fr: "élève", es: "alumno", it: "alunno", tr: "öğrenci", ar: "تلميذ", fa: "دانش‌آموز", "zh-CN": "学生", ja: "生徒" },
  { tj: "синф", ru: "класс", en: "classroom", de: "Klassenzimmer", fr: "classe", es: "aula", it: "classe", tr: "sınıf", ar: "فصل", fa: "کلاس", "zh-CN": "教室", ja: "教室" },
  { tj: "китоб", ru: "книга", en: "book", de: "Buch", fr: "livre", es: "libro", it: "libro", tr: "kitap", ar: "كتاب", fa: "کتاب", "zh-CN": "书", ja: "本" },
  { tj: "дафтар", ru: "тетрадь", en: "notebook", de: "Heft", fr: "cahier", es: "cuaderno", it: "quaderno", tr: "defter", ar: "دفتر", fa: "دفتر", "zh-CN": "笔记本", ja: "ノート" },
  { tj: "қалам", ru: "карандаш", en: "pencil", de: "Bleistift", fr: "crayon", es: "lápiz", it: "matita", tr: "kalem", ar: "قلم رصاص", fa: "مداد", "zh-CN": "铅笔", ja: "铅筆" },
  { tj: "ручка", ru: "ручка", en: "pen", de: "Kugelschreiber", fr: "stylo", es: "bolígrafo", it: "penna", tr: "tükenmez kalem", ar: "قلم", fa: "خودکار", "zh-CN": "钢笔", ja: "ペン" },
  { tj: "дарс", ru: "урок", en: "lesson", de: "Lektion / Unterricht", fr: "leçon", es: "lección", it: "lezione", tr: "ders", ar: "درس", fa: "درس", "zh-CN": "课", ja: "レッスン" },
  { tj: "вазифаи хонагӣ", ru: "домашнее задание", en: "homework", de: "Hausaufgabe", fr: "devoirs", es: "tarea", it: "compiti", tr: "ödev", ar: "واجب منزلي", fa: "تکلیف خانه", "zh-CN": "作业", ja: "宿題" },
  { tj: "имтиҳон", ru: "экзамен", en: "exam", de: "Prüfung", fr: "examen", es: "examen", it: "esame", tr: "sınav", ar: "امتحان", fa: "امتحان", "zh-CN": "考试", ja: "試験" },
  { tj: "баҳо", ru: "оценка", en: "grade / mark", de: "Note", fr: "note", es: "nota", it: "voto", tr: "not", ar: "درجة", fa: "نمره", "zh-CN": "成绩 / 分数", ja: "成績" },
  { tj: "ҷадвали дарсҳо", ru: "расписание", en: "timetable", de: "Stundenplan", fr: "emploi du temps", es: "horario", it: "orario", tr: "ders programı", ar: "جدول حصص", fa: "برنامه درسی", "zh-CN": "课程表", ja: "时刻表" },
  { tj: "китобхона", ru: "библиотека", en: "library", de: "Bibliothek", fr: "bibliothèque", es: "biblioteca", it: "biblioteca", tr: "kütüphane", ar: "مكتبة", fa: "کتابخانه", "zh-CN": "图书馆", ja: "図書館" },
  { tj: "донишгоҳ", ru: "университет", en: "university", de: "Universität", fr: "université", es: "universidad", it: "università", tr: "üniversite", ar: "جامعة", fa: "دانشگاه", "zh-CN": "大学", ja: "大学" }
],
transport: [
  { tj: "нақлиёт", ru: "транспорт", en: "transport", de: "Transport", fr: "transport", es: "transporte", it: "trasporto", tr: "ulaşım", ar: "نقل", fa: "ترابری / حمل و نقل", "zh-CN": "交通 / 运输", ja: "交通" },
  { tj: "мошин", ru: "машина / автомобиль", en: "car", de: "Auto", fr: "voiture", es: "coche / auto", it: "auto", tr: "araba", ar: "سيارة", fa: "ماشین / خودرو", "zh-CN": "汽车", ja: "車" },
  { tj: "автобус", ru: "автобус", en: "bus", de: "Bus", fr: "bus / autobus", es: "autobús", it: "autobus", tr: "otobüs", ar: "حافلة", fa: "اتوبوس", "zh-CN": "公交车 / バス", ja: "バス" },
  { tj: "қатора", ru: "поезд", en: "train", de: "Zug", fr: "train", es: "tren", it: "treno", tr: "tren", ar: "قطار", fa: "قطار", "zh-CN": "火车", ja: "電車" },
  { tj: "ҳавопаймо", ru: "самолет", en: "airplane", de: "Flugzeug", fr: "avion", es: "avión", it: "aereo", tr: "uçak", ar: "طائرة", fa: "هواپیما", "zh-CN": "飞机", ja: "飛行機" },
  { tj: "киштӣ", ru: "корабль", en: "ship", de: "Schiff", fr: "bateau / navire", es: "barco", it: "nave", tr: "gemi", ar: "سفينة", fa: "کشتی", "zh-CN": "轮船", ja: "船" },
  { tj: "велосипед", ru: "велосипед", en: "bicycle", de: "Fahrrad", fr: "vélo", es: "bicicleta", it: "bicicletta", tr: "bisiklet", ar: "دراجة هوائية", fa: "دوچرخه", "zh-CN": "自行车", ja: "自転車" },
  { tj: "мотосикл", ru: "мотоцикл", en: "motorcycle", de: "Motorrad", fr: "moto", es: "motocicleta", it: "moto", tr: "motosiklet", ar: "دراجة نارية", fa: "موتورسیکلت", "zh-CN": "摩托车", ja: "バイク" },
  { tj: "метро", ru: "метро", en: "subway / metro", de: " U-Bahn", fr: "métro", es: "metro", it: "metro", tr: "metro", ar: "مترو", fa: "مترو", "zh-CN": "地铁", ja: "地下鉄" },
  { tj: "трамвай", ru: "трамвай", en: "tram", de: "Straßenbahn", fr: "tramway", es: "tranvía", it: "tram", tr: "tramvay", ar: "ترام", fa: "تراموا", "zh-CN": "有轨电车", ja: "路面電車" },
  { tj: "мошини боркаш", ru: "грузовик", en: "truck", de: "LKW", fr: "camion", es: "camión", it: "camion", tr: "kamyon", ar: "شاحنة", fa: "کامیون", "zh-CN": "卡车", ja: "トラック" },
  { tj: "чархбол", ru: "вертолет", en: "helicopter", de: "Hubschrauber", fr: "hélicoptère", es: "helicóptero", it: "elicottero", tr: "helikopter", ar: "مروحية", fa: "هلیکوپتر", "zh-CN": "直升机", ja: "ヘリコプター" },
  { tj: "катер", ru: "лодка", en: "boat", de: "Boot", fr: "bateau", es: "barca / bote", it: "barca", tr: "tekne", ar: "قارب", fa: "قایق", "zh-CN": "小船", ja: "ボート" },
  { tj: "пул", ru: "мост", en: "bridge", de: "Brücke", fr: "pont", es: "puente", it: "ponte", tr: "köprü", ar: "جسر", fa: "پل", "zh-CN": "桥", ja: "桥" },
  { tj: "роҳ", ru: "дорога", en: "road", de: "Straße", fr: "route", es: "camino / carretera", it: "strada", tr: "yol", ar: "طريق", fa: "جاده / راه", "zh-CN": "道路", ja: "道路" }
],
clothes: [
  { tj: "либос", ru: "одежда", en: "clothes", de: "Kleidung", fr: "vêtements", es: "ropa", it: "vestiti", tr: "giysi", ar: "ملابس", fa: "لباس", "zh-CN": "衣服", ja: "服" },
  { tj: "курта", ru: "рубашка / платье", en: "shirt / dress", de: "Hemd / Kleid", fr: "chemise / robe", es: "camisa / vestido", it: "camicia / vestito", tr: "gömlek / elbise", ar: "قميص / فستان", fa: "پیراهن / لباس", "zh-CN": "衬衫 / 连衣裙", ja: "シャツ / ドレス" },
  { tj: "шим", ru: "брюки / штаны", en: "pants / trousers", de: "Hose", fr: "pantalon", es: "pantalones", it: "pantaloni", tr: "pantolon", ar: "بنطال", fa: "شلوار", "zh-CN": "裤子", ja: "ズボン" },
  { tj: "костюм", ru: "костюм", en: "suit", de: "Anzug", fr: "costume", es: "traje", it: "abito", tr: "takım elbise", ar: "بدلة", fa: "کت و شلوار", "zh-CN": "西装", ja: "スーツ" },
  { tj: "куртка", ru: "куртка", en: "jacket", de: "Jacke", fr: "veste", es: "chaqueta", it: "giacca", tr: "ceket", ar: "سترة", fa: "کاپشن / کت", "zh-CN": "夹克", ja: "ジャケット" },
  { tj: "палто", ru: "пальто", en: "coat", de: "Mantel", fr: "manteau", es: "abrigo", it: "cappotto", tr: "palto", ar: "معطف", fa: "پالتو", "zh-CN": "大衣 / 外套", ja: "コート" },
  { tj: "доман", ru: "юбка", en: "skirt", de: "Rock", fr: "jupe", es: "falda", it: "gonna", tr: "etek", ar: "تنورة", fa: "دامن", "zh-CN": "裙子", ja: "スカート" },
  { tj: "пойафзол", ru: "обувь", en: "shoes", de: "Schuhe", fr: "chaussures", es: "zapatos", it: "scarpe", tr: "ayakkabı", ar: "حذاء", fa: "کفش", "zh-CN": "鞋子", ja: "靴" },
  { tj: "ҷӯроб", ru: "носки", en: "socks", de: "Socken", fr: "chaussettes", es: "calcetines", it: "calze", tr: "çorap", ar: "جوارب", fa: "جوراب", "zh-CN": "袜子", ja: "靴下" },
  { tj: "кулоҳ", ru: "шапка / шляпа", en: "hat / cap", de: "Hut / Mütze", fr: "chapeau / bonnet", es: "sombrero / gorra", it: "cappello", tr: "şapka", ar: "قبعة", fa: "کلاه", "zh-CN": "帽子", ja: "帽子" },
  { tj: "шарф", ru: "шарф", en: "scarf", de: "Schal", fr: "écharpe", es: "bufanda", it: "sciarpa", tr: "atkı", ar: "وشاح", fa: "شال گردن", "zh-CN": "围巾", ja: "マフラー" },
  { tj: "дастпӯшак", ru: "перчатки", en: "gloves", de: "Handschuhe", fr: "gants", es: "guantes", it: "guanti", tr: "eldiven", ar: "قفازات", fa: "دستکش", "zh-CN": "手套", ja: "手袋" },
  { tj: "камарбанд", ru: "ремень / пояс", en: "belt", de: "Gürtel", fr: "ceinture", es: "cinturón", it: "cintura", tr: "kemer", ar: "حزام", fa: "کمربند", "zh-CN": "腰带", ja: "ベルト" },
  { tj: "свитшот", ru: "свитер", en: "sweater", de: "Pullover", fr: "pull", es: "suéter", it: "maglione", tr: "kazak", ar: "سترة صوفية", fa: "پلوور / پلیور", "zh-CN": "毛衣", ja: "セーター" },
  { tj: "ҷинс", ru: "джинсы", en: "jeans", de: "Jeans", fr: "jeans", es: "vaqueros", it: "jeans", tr: "kot pantolon", ar: "جينز", fa: "شلوار جین", "zh-CN": "牛仔裤", ja: "ジーンズ" }
],
bodyParts: [
  { tj: "бадан", ru: "тело", en: "body", de: "Körper", fr: "corps", es: "cuerpo", it: "corpo", tr: "vücut", ar: "جسد", fa: "بدن", "zh-CN": "身体", ja: "体" },
  { tj: "сар", ru: "голова", en: "head", de: "Kopf", fr: "tête", es: "cabeza", it: "testa", tr: "baş / kafa", ar: "رأس", fa: "سر", "zh-CN": "头", ja: "頭" },
  { tj: "рӯй", ru: "лицо", en: "face", de: "Gesicht", fr: "visage", es: "cara", it: "viso", tr: "yüz", ar: "وجه", fa: "صورت", "zh-CN": "脸", ja: "顔" },
  { tj: "чашм", ru: "глаз", en: "eye", de: "Auge", fr: "œil", es: "ojo", it: "occhio", tr: "göz", ar: "عين", fa: "چشم", "zh-CN": "眼睛", ja: "目" },
  { tj: "гӯш", ru: "ухо", en: "ear", de: "Ohr", fr: "oreille", es: "oreille", it: "orecchio", tr: "kulak", ar: "أذن", fa: "گوش", "zh-CN": "耳朵", ja: "耳" },
  { tj: "бинӣ", ru: "нос", en: "nose", de: "Nase", fr: "nez", es: "nariz", it: "naso", tr: "burun", ar: "أنف", fa: "بینی", "zh-CN": "鼻子", ja: "鼻" },
  { tj: "даҳон", ru: "рот", en: "mouth", de: "Mund", fr: "bouche", es: "boca", it: "bocca", tr: "ağız", ar: "فم", fa: "دهان", "zh-CN": "嘴", ja: "口" },
  { tj: "муй", ru: "волосы", en: "hair", de: "Haar", fr: "cheveux", es: "pelo", it: "capelli", tr: "saç", ar: "شعر", fa: "مو", "zh-CN": "头发", ja: "髪" },
  { tj: "гардан", ru: "шея", en: "neck", de: "Hals", fr: "cou", es: "cuello", it: "collo", tr: "boyun", ar: "رقبة", fa: "گردن", "zh-CN": "脖子", ja: "首" },
  { tj: "дил", ru: "сердце", en: "heart", de: "Herz", fr: "cœur", es: "corazón", it: "cuore", tr: "kalp", ar: "قلب", fa: "قلب", "zh-CN": "心脏", ja: "心臓" },
  { tj: "даст", ru: "рука", en: "hand / arm", de: "Hand / Arm", fr: "main / bras", es: "mano / brazo", it: "mano / braccio", tr: "el / kol", ar: "يد", fa: "دست", "zh-CN": "手 / 手臂", ja: "手 / 腕" },
  { tj: "пой", ru: "нога", en: "leg / foot", de: "Bein / Fuß", fr: "jambe / pied", es: "pierna / pie", it: "gamba / piede", tr: "bacak / ayak", ar: "رجل / قدم", fa: "پا", "zh-CN": "腿 / 脚", ja: "脚 / 足" },
  { tj: "ангушт", ru: "палец", en: "finger / toe", de: "Finger / Zehe", fr: "doigt", es: "dedo", it: "dito", tr: "parmak", ar: "اصبع", fa: "انگشت", "zh-CN": "手指 / 脚趾", ja: "指" },
  { tj: "пушт", ru: "спина", en: "back", de: "Rücken", fr: "dos", es: "espalda", it: "schiena", tr: "sırt", ar: "ظهر", fa: "پشت", "zh-CN": "背", ja: "背中" },
  { tj: "шикам", ru: "живот", en: "stomach / belly", de: "Bauch", fr: "ventre", es: "barriga / estómago", it: "pancia", tr: "karın / mide", ar: "بطن", fa: "شکم", "zh-CN": "肚子 / 胃", ja: "腹 / 胃" }
],
birds: [
  { tj: "паранда", ru: "птица", en: "bird", de: "Vogel", fr: "oiseau", es: "pájaro", it: "uccello", tr: "kuş", ar: "طائر", fa: "پرنده", "zh-CN": "鸟", ja: "鳥" },
  { tj: "уқоб", ru: "орел", en: "eagle", de: "Adler", fr: "aigle", es: "águila", it: "aquila", tr: "kartal", ar: "نسر", fa: "عقاب", "zh-CN": "鹰", ja: "ワシ" },
  { tj: "кабутар", ru: "голубь", en: "pigeon / dove", de: "Taube", fr: "pigeon", es: "paloma", it: "colombo", tr: "güvercin", ar: "حمامة", fa: "کبوتر", "zh-CN": "鸽子", ja: "ハト" },
  { tj: "зоғ", ru: "ворона", en: "crow", de: "Krähe", fr: "corbeau", es: "cuervo", it: "corvo", tr: "karga", ar: "غراب", fa: "کلاغ", "zh-CN": "乌鸦", ja: "カラス" },
  { tj: "чумчуқ", ru: "воробей", en: "sparrow", de: "Spatz", fr: "moineau", es: "gorrión", it: "passero", tr: "serçe", ar: "عصفور", fa: "گنجشک", "zh-CN": "麻雀", ja: "スズメ" },
  { tj: "булбул", ru: "соловей", en: "nightingale", de: "Nachtigall", fr: "rossignol", es: "ruiseñor", it: "usignolo", tr: "bülbül", ar: "بلبل", fa: "بلبل", "zh-CN": "夜莺", ja: "ナイチンゲール" },
  { tj: "боз", ru: "сокол", en: "falcon", de: "Falke", fr: "faucon", es: "halcón", it: "falco", tr: "doğan", ar: "صقر", fa: "شاهین", "zh-CN": "隼", ja: "ハヤブサ" },
  { tj: "ҷуфтирак", ru: "сова", en: "owl", de: "Eule", fr: "hibou", es: "búho", it: "gufo", tr: "baykuş", ar: "بومة", fa: "جغد", "zh-CN": "猫头鹰", ja: "フクロウ" },
  { tj: "лаклак", ru: "аист", en: "stork", de: "Storch", fr: "cigogne", es: "cigüeña", it: "cicogna", tr: "leylek", ar: "لقلق", fa: "لک‌لک", "zh-CN": "鹳", ja: "コウノトリ" },
  { tj: "тутӣ", ru: "попугай", en: "parrot", de: "Papagei", fr: "perroquet", es: "loro", it: "pappagallo", tr: "papağan", ar: "ببغاء", fa: "طوطی", "zh-CN": "鹦鹉", ja: "オウム" },
  { tj: "мурғобӣ", ru: "утка", en: "duck", de: "Ente", fr: "canard", es: "pato", it: "anatra", tr: "ördek", ar: "بطة", fa: "مرغابی", "zh-CN": "鸭子", ja: "カモ" },
  { tj: "ғоз", ru: "гусь", en: "goose", de: "Gans", fr: "oie", es: "ganso", it: "oca", tr: "kaz", ar: "وزة", fa: "غاز", "zh-CN": "鹅", ja: "ガチョウ" },
  { tj: "қу", ru: "лебедь", en: "swan", de: "Schwan", fr: "cygne", es: "cisne", it: "cigno", tr: "kuğu", ar: "بجع", fa: "قو", "zh-CN": "天鹅", ja: "白鳥" },
  { tj: "қутбӣ / пингвин", ru: "пингвин", en: "penguin", de: "Pinguin", fr: "manchot", es: "pingüino", it: "pinguino", tr: "penguen", ar: "بطريق", fa: "پنگوئن", "zh-CN": "企鹅", ja: "ペンギン" },
  { tj: "ҳудҳуд", ru: "удод", en: "hoopoe", de: "Wiedehopf", fr: "huppe", es: "abubilla", it: "upupa", tr: "ibibik", ar: "هدهد", fa: "هدهد", "zh-CN": "戴胜", ja: "ヤツガシラ" }
],
animals: [
  { tj: "саг", ru: "собака", en: "dog", de: "Hund", fr: "chien", es: "perro", it: "cane", tr: "köpek", ar: "كلب", fa: "سگ", "zh-CN": "狗", ja: "犬" },
  { tj: "гурба", ru: "кошка", en: "cat", de: "Katze", fr: "chat", es: "gato", it: "gatto", tr: "kedi", ar: "قطة", fa: "گربه", "zh-CN": "猫", ja: "猫" },
  { tj: "асп", ru: "лошадь", en: "horse", de: "Pferd", fr: "cheval", es: "caballo", it: "cavallo", tr: "at", ar: "حصان", fa: "اسب", "zh-CN": "马", ja: "馬" },
  { tj: "гов", ru: "корова", en: "cow", de: "Kuh", fr: "vache", es: "vaca", it: "mucca", tr: "inek", ar: "بقرة", fa: "گاو", "zh-CN": "牛", ja: "牛" },
  { tj: "гӯсфанд", ru: "овца", en: "sheep", de: "Schaf", fr: "mouton", es: "oveja", it: "pecora", tr: "koyun", ar: "خروف", fa: "گوسفند", "zh-CN": "绵羊", ja: "羊" },
  { tj: "шер", ru: "лев", en: "lion", de: "Löwe", fr: "lion", es: "león", it: "leone", tr: "aslan", ar: "أسد", fa: "شیر", "zh-CN": "狮子", ja: "ライオン" },
  { tj: "паланг", ru: "тигр", en: "tiger", de: "Tiger", fr: "tigre", es: "tigre", it: "tigre", tr: "kaplan", ar: "نمر", fa: "ببر", "zh-CN": "老虎", ja: "トラ" },
  { tj: "хирс", ru: "медведь", en: "bear", de: "Bär", fr: "ours", es: "oso", it: "orso", tr: "ayı", ar: "دب", fa: "خرس", "zh-CN": "熊", ja: "クマ" },
  { tj: "гург", ru: "волк", en: "wolf", de: "Wolf", fr: "loup", es: "lobo", it: "lupo", tr: "kurt", ar: "ذئب", fa: "گرگ", "zh-CN": "狼", ja: "オオカミ" },
  { tj: "рӯбоҳ", ru: "лиса", en: "fox", de: "Fuchs", fr: "renard", es: "zorro", it: "volpe", tr: "tilki", ar: "ثعلب", fa: "روباه", "zh-CN": "狐狸", ja: "キツネ" },
  { tj: "харгӯш", ru: "кролик", en: "rabbit", de: "Hase / Kaninchen", fr: "lapin", es: "conejo", it: "coniglio", tr: "tavşan", ar: "أرنب", fa: "خرگوش", "zh-CN": "兔子", ja: "ウサギ" },
  { tj: "мурғ", ru: "курица", en: "chicken", de: "Huhn", fr: "poule", es: "pollo", it: "pollo", tr: "tavuk", ar: "دجاجة", fa: "مرغ", "zh-CN": "鸡", ja: "鸡" },
  { tj: "паранда", ru: "птица", en: "bird", de: "Vogel", fr: "oiseau", es: "pájaro", it: "uccello", tr: "kuş", ar: "طائر", fa: "پرنده", "zh-CN": "鸟", ja: "鸟" },
  { tj: "моҳӣ", ru: "рыба", en: "fish", de: "Fisch", fr: "poisson", es: "pez", it: "pesce", tr: "balık", ar: "سمكة", fa: "ماهی", "zh-CN": "鱼", ja: "鱼" },
  { tj: "фил", ru: "слон", en: "elephant", de: "Elefant", fr: "éléphant", es: "elefante", it: "elefante", tr: "fil", ar: "فيل", fa: "فیل", "zh-CN": "大象", ja: "ゾウ" }
],
vegetables: [
  { tj: "картошка", ru: "картофель", en: "potato", de: "Kartoffel", fr: "pomme de terre", es: "patata", it: "patata", tr: "patates", ar: "بطاطс", fa: "سیب‌زمینی", "zh-CN": "土豆", ja: "ジャガイמו" },
  { tj: "пиёз", ru: "лук", en: "onion", de: "Zwiebel", fr: "oignon", es: "cebolla", it: "cipolla", tr: "soğan", ar: "بصل", fa: "پیاز", "zh-CN": "洋葱", ja: "玉ねぎ" },
  { tj: "помидор", ru: "помидор", en: "tomato", de: "Tomate", fr: "tomate", es: "tomate", it: "pomodoro", tr: "domates", ar: "طماطم", fa: "گوجه‌فرنگی", "zh-CN": "西红柿", ja: "トマト" },
  { tj: "бодиринг", ru: "огурец", en: "cucumber", de: "Gurke", fr: "concombre", es: "pepino", it: "cetriolo", tr: "salatalık", ar: "خيار", fa: "خیار", "zh-CN": "黄瓜", ja: "きゅうり" },
  { tj: "сабзӣ", ru: "морковь", en: "carrot", de: "Karotte", fr: "carotte", es: "zanahoria", it: "carota", tr: "havuç", ar: "جزر", fa: "هویج", "zh-CN": "胡萝卜", ja: "人参" },
  { tj: "сирпиёз", ru: "чеснок", en: "garlic", de: "Knoblauch", fr: "ail", es: "ajo", it: "aglio", tr: "sarımsak", ar: "ثوم", fa: "سیر", "zh-CN": "大蒜", ja: "ニンニク" },
  { tj: "карам", ru: "капуста", en: "cabbage", de: "Kohl", fr: "chou", es: "col", it: "cavolo", tr: "lahana", ar: "ملفوف", fa: "کلم", "zh-CN": "卷心菜", ja: "キャベツ" },
  { tj: "мурч", ru: "перец", en: "pepper", de: "Pfeffer", fr: "poivron", es: "pimiento", it: "peperone", tr: "biber", ar: "فلفل", fa: "فلفل", "zh-CN": "辣椒 / 青椒", ja: "ピーマン / 唐辛子" },
  { tj: "бодомҷон", ru: "баклажан", en: "eggplant", de: "Aubergin", fr: "aubergine", es: "berenjena", it: "melanzana", tr: "patlıcan", ar: "باذنجان", fa: "بادنجان", "zh-CN": "茄子", ja: "茄子" },
  { tj: "каду", ru: "тыква", en: "pumpkin", de: "Kürbis", fr: "citrouille", es: "calabaza", it: "zucca", tr: "kabak", ar: "قرع", fa: "کدو تنبل", "zh-CN": "南瓜", ja: "カボチャ" },
  { tj: "ҷаворимакка", ru: "кукуруза", en: "corn", de: "Mais", fr: "maïs", es: "maíz", it: "mais", tr: "mısır", ar: "ذرة", fa: "ذرت", "zh-CN": "玉米", ja: "トウモロコシ" },
  { tj: "нахӯд", ru: "горох", en: "peas", de: "Erbsen", fr: "pois", es: "guisantes", it: "piselli", tr: "bezelye", ar: "بsingleة", fa: "نخود", "zh-CN": "豌豆", ja: "エンドウ豆" },
  { tj: "лубиё", ru: "фасоль", en: "beans", de: "Bohnen", fr: "haricots", es: "frijoles", it: "fagioli", tr: "fasulye", ar: "فاصوليا", fa: "لوبیا", "zh-CN": "豆子", ja: "豆" },
  { tj: "кабудӣ", ru: "зелень", en: "herbs / greens", de: "Kräuter", fr: "herbes", es: "hierbas", it: "erbe", tr: "yeşillik", ar: "أعشاب", fa: "سبزیجات", "zh-CN": "香草 / 绿菜", ja: "ハーブ" },
  { tj: "занбӯруғ", ru: "гриб", en: "mushroom", de: "Pilz", fr: "champignon", es: "hongo", it: "fungo", tr: "mantar", ar: "فطر", fa: "قارچ", "zh-CN": "蘑菇", ja: "キノコ" }
],
fruits: [
  { tj: "себ", ru: "яблоко", en: "apple", de: "Apfel", fr: "pomme", es: "manzana", it: "mela", tr: "elma", ar: "تفاح", fa: "سیب", "zh-CN": "苹果", ja: "リンゴ" },
  { tj: "норманд", ru: "банан", en: "banana", de: "Banane", fr: "banane", es: "plátano", it: "banana", tr: "muz", ar: "موز", fa: "موز", "zh-CN": "香蕉", ja: "バナナ" },
  { tj: "афлесун", ru: "апельсин", en: "orange (fruit)", de: "Orange", fr: "orange", es: "naranja", it: "arancia", tr: "portakal", ar: "برتقال", fa: "پرتقال", "zh-CN": "橙子", ja: "オレンジ" },
  { tj: "ангур", ru: "виноград", en: "grapes", de: "Trauben", fr: "raisin", es: "uva", it: "uva", tr: "üzüm", ar: "عنب", fa: "انگور", "zh-CN": "葡萄", ja: "ブドウ" },
  { tj: "лиму", ru: "лимон", en: "lemon", de: "Zitrone", fr: "citron", es: "limón", it: "limone", tr: "limon", ar: "ليمون", fa: "لیمو", "zh-CN": "柠檬", ja: "レモン" },
  { tj: "шафтолу", ru: "персик", en: "peach", de: "Pfirsich", fr: "pêche", es: "melocotón", it: "pesca", tr: "şeftali", ar: "خوخ", fa: "هلو", "zh-CN": "桃子", ja: "桃" },
  { tj: "зардолу", ru: "абрикос", en: "apricot", de: "Aprikose", fr: "abricot", es: "albaricoque", it: "albicocca", tr: "kayısı", ar: "مشمش", fa: "زردآلو", "zh-CN": "杏子", ja: "アプリコット" },
  { tj: "олуболу", ru: "вишня", en: "cherry", de: "Kirsche", fr: "cerise", es: "cereza", it: "ciliegia", tr: "kiraz", ar: "كرز", fa: "گیلاس", "zh-CN": "樱桃", ja: "サクランボ" },
  { tj: "анор", ru: "гранат", en: "pomegranate", de: "Granatapfel", fr: "grenade", es: "granada", it: "melograno", tr: "nar", ar: "رمان", fa: "انار", "zh-CN": "石榴", ja: "ザクロ" },
  { tj: "анҷир", ru: "инжир", en: "fig", de: "Feige", fr: "figue", es: "higo", it: "fico", tr: "incir", ar: "تين", fa: "انجیر", "zh-CN": "无花果", ja: "イチジク" },
  { tj: "тарбуз", ru: "арбуз", en: "watermelon", de: "Wassermelone", fr: "pastèque", es: "sandía", it: "anguria", tr: "karpuz", ar: "بطيخ", fa: "هندوانه", "zh-CN": "西瓜", ja: "スイカ" },
  { tj: "хаربуза", ru: "дыня", en: "melon", de: "Melone", fr: "melon", es: "melón", it: "melone", tr: "kavun", ar: "شمام", fa: "خربزه", "zh-CN": "甜瓜", ja: "メロン" },
  { tj: "тутманд", ru: "клубника", en: "strawberry", de: "Erdbeere", fr: "fraise", es: "fresa", it: "fragola", tr: "çilek", ar: "فراولة", fa: "توت فرنگی", "zh-CN": "草莓", ja: "イチゴ" },
  { tj: "нок", ru: "груша", en: "pear", de: "Birne", fr: "poire", es: "pera", it: "pera", tr: "armut", ar: "كمثرى", fa: "گلابی", "zh-CN": "梨", ja: "梨" },
  { tj: "олу", ru: "слива", en: "plum", de: "Pflaume", fr: "prune", es: "ciruela", it: "prugna", tr: "erik", ar: "برقوق", fa: "آلو", "zh-CN": "李子", ja: "スモモ" }
],
moreFruits: [
  { tj: "себи заминӣ / ананас", ru: "ананас", en: "pineapple", de: "Ananas", fr: "ananas", es: "piña", it: "ananasso", tr: "ananas", ar: "أناناس", fa: "آناناس", "zh-CN": "菠萝", ja: "パイナップル" },
  { tj: "манго", ru: "манго", en: "mango", de: "Mango", fr: "mangue", es: "mango", it: "mango", tr: "mango", ar: "манго", fa: "انبه", "zh-CN": "芒果", ja: "マンゴー" },
  { tj: "киви", ru: "киви", en: "kiwi", de: "Kiwi", fr: "kiwi", es: "kiwi", it: "kiwi", tr: "kivi", ar: "كيوي", fa: "کیوی", "zh-CN": "猕猴桃", ja: "キウイ" },
  { tj: "ноки заминӣ / банан", ru: "кокос", en: "coconut", de: "Kokosnuss", fr: "noix de coco", es: "coco", it: "cocco", tr: "hindistan cevizi", ar: "جوز الهند", fa: "نارگیل", "zh-CN": "椰子", ja: "ココナッツ" },
  { tj: "зайтун", ru: "оливка / маслина", en: "olive", de: "Olive", fr: "olive", es: "oliva", it: "oliva", tr: "zeytin", ar: "زيتون", fa: "زیتون", "zh-CN": "橄榄", ja: "オリーブ" },
  { tj: "хурмо", ru: "хурма / финик", en: "date / persimmon", de: "Dattel / Kaki", fr: "datte / kaki", es: "dátil / caqui", it: "dattero / cachi", tr: "hurma", ar: "تمر", fa: "خرما", "zh-CN": "柿子 / 椰枣", ja: "柿 / ナツメヤシ" },
  { tj: "лимуи ширин / лайм", ru: "лайм", en: "lime", de: "Limette", fr: "lime", es: "lima", it: "lima", tr: "misket limonu", ar: "ليمون حامض", fa: "لومو ترش", "zh-CN": "青柠檬", ja: "ライム" },
  { tj: "малина", ru: "малина", en: "raspberry", de: "Himbeere", fr: "framboise", es: "frambuesa", it: "lampone", tr: "ahududu", ar: "توت العليق", fa: "تمشک", "zh-CN": "覆盆子", ja: "ラズベリー" },
  { tj: "тамашк", ru: "ежевика", en: "blackberry", de: "Brombeere", fr: "mûre", es: "mora", it: "mora", tr: "böğürtlen", ar: "توت أسود", fa: "شاه‌توت", "zh-CN": "黑莓", ja: "ブラックベリー" },
  { tj: "қоқ / мавиз", ru: "изюм / изюм", en: "raisin", de: "Rosine", fr: "raisin sec", es: "pasa", it: "uvetta", tr: "kuru üzüm", ar: "زبيب", fa: "کشمش", "zh-CN": "葡萄干", ja: "レーズン" },
  { tj: "чормағз", ru: "грецкий орех", en: "walnut", de: "Walnuss", fr: "noix", es: "nuez", it: "noce", tr: "ceviz", ar: "جوز", fa: "گردو", "zh-CN": "核桃", ja: "くるみ" },
  { tj: "бодом", ru: "миндаль", en: "almond", de: "Mandel", fr: "amande", es: "almendra", it: "mandorla", tr: "badem", ar: "لوز", fa: "بادام", "zh-CN": "杏仁", ja: "アーモンド" },
  { tj: "писта", ru: "фисташка", en: "pistachio", de: "Pistazie", fr: "pistache", es: "pistacho", it: "pistacchio", tr: "antep fıstığı", ar: "فستق", fa: "پسته", "zh-CN": "开心果", ja: "ピスタチオ" },
  { tj: "фундук", ru: "фундук", en: "hazelnut", de: "Haselnuss", fr: "noisette", es: "avellana", it: "nocciola", tr: "fındık", ar: "بندق", fa: "فندق", "zh-CN": "榛子", ja: "ヘーゼルナッツ" },
  { tj: "алича", ru: "алыча", en: "cherry plum", de: "Kirschpflaume", fr: "prunier-cerise", es: "ciruela verde", it: "prugnolo", tr: "erik (yeşil)", ar: "جرينج", fa: "آلوچه", "zh-CN": "樱桃李", ja: "チェリープラム" }
],
  };

  function get(topicId) {
    return wordsByTopic[topicId] || [];
  }

  return { get };
})();
