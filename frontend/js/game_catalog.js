const OfflineGameCatalog = (() => {
  const languages = [
    "tj", "ru", "en", "de", "fr", "es", "it", "tr", "ar", "fa", "zh-CN", "ja",
  ];

  const topics = [
{
  "id": "greetings",
  "title": {
    "tj": "Салом ва шиносоӣ", "ru": "Приветствия и знакомство", "en": "Greetings and introductions",
    "de": "Begrüßung und Vorstellung", "fr": "Salutations et présentations",
    "es": "Saludos y presentaciones", "it": "Saluti e presentazioni", "tr": "Selamlaşma ve tanışma",
    "ar": "التحية والتعارف", "fa": "سلام و آشنایی", "zh-CN": "问候与介绍", "ja": "挨拶と自己紹介"
  },
  "phrases": [
    { "tj": "Субҳ ба хайр.", "ru": "Доброе утро.", "en": "Good morning.", "de": "Guten Morgen.", "fr": "Bonjour.", "es": "Buenos días.", "it": "Buongiorno.", "tr": "Günaydın.", "ar": "صباح الخير.", "fa": "صبح بخیر.", "zh-CN": "早上好。", "ja": "おはようございます。" },
    { "tj": "Ман Амина ном дорам.", "ru": "Меня зовут Амина.", "en": "My name is Amina.", "de": "Ich heiße Amina.", "fr": "Je m’appelle Amina.", "es": "Me llamo Amina.", "it": "Mi chiamo Amina.", "tr": "Benim adım Amina.", "ar": "اسمي أمينة.", "fa": "نام من آمنه است.", "zh-CN": "我叫阿米娜。", "ja": "私の名前はアミナです。" },
    { "tj": "Аз шиносоӣ бо шумо шодам.", "ru": "Рад с вами познакомиться.", "en": "Nice to meet you.", "de": "Schön, Sie kennenzulernen.", "fr": "Ravi de vous rencontrer.", "es": "Mucho gusto.", "it": "Piacere di conoscerti.", "tr": "Tanıştığıma memnun oldum.", "ar": "سعيد بلقائك.", "fa": "از آشنایی با شما خوشوقتم.", "zh-CN": "很高兴认识你。", "ja": "お会いできてうれしいです。" },
    { "tj": "Рӯзи ба хайр.", "ru": "Добрый день.", "en": "Good afternoon.", "de": "Guten Tag.", "fr": "Bon après-midi.", "es": "Buenas tardes.", "it": "Buon pomeriggio.", "tr": "Tünaydın.", "ar": "طاب يومك.", "fa": "روز بخیر.", "zh-CN": "下午好。", "ja": "こんにちは。" },
    { "tj": "Шоми ба хайр.", "ru": "Добрый вечер.", "en": "Good evening.", "de": "Guten Abend.", "fr": "Bonsoir.", "es": "Buenas noches.", "it": "Buonasera.", "tr": "İyi akşamlar.", "ar": "مساء الخير.", "fa": "عصر بخیر.", "zh-CN": "晚上好。", "ja": "こんばんは。" },
    { "tj": "Шумо чӣ хел?", "ru": "Как дела?", "en": "How are you?", "de": "Wie geht es dir?", "fr": "Comment ça va?", "es": "¿Cómo estás?", "it": "Come stai?", "tr": "Nasılsın?", "ar": "كيف حالك؟", "fa": "چطور هستید؟", "zh-CN": "你好吗？", "ja": "お元気ですか？" },
    { "tj": "Ман нағз, ташаккур.", "ru": "У меня все хорошо, спасибо.", "en": "I am fine, thank you.", "de": "Mir geht es gut, danke.", "fr": "Je vais bien, merci.", "es": "Estoy bien, gracias.", "it": "Sto bene, grazie.", "tr": "İyiyim, teşekkür ederim.", "ar": "أنا بخير، شكراً لك.", "fa": "من خوبم، ممنون.", "zh-CN": "我很好，谢谢。", "ja": "私は元気です、ありがとう。" },
    { "tj": "Шумо аз куҷо ҳастед?", "ru": "Откуда вы?", "en": "Where are you from?", "de": "Woher kommen Sie?", "fr": "D'où venez-vous?", "es": "¿De dónde es usted?", "it": "Di dove sei?", "tr": "Nerelisiniz?", "ar": "من أين أنت؟", "fa": "شما اهل کجا هستید؟", "zh-CN": "你来自哪里？", "ja": "どちらのご出身ですか？" },
    { "tj": "Ман аз Тоҷикистон ҳастам.", "ru": "Я из Таджикистана.", "en": "I am from Tajikistan.", "de": "Ich komme aus Tadschikistan.", "fr": "Je viens du Tadjikistan.", "es": "Soy de Tayikistán.", "it": "Vengo dal Tagikistan.", "tr": "Tacikistan'danım.", "ar": "أنا من طاجيكستان.", "fa": "من اهل تاجیکستان هستم.", "zh-CN": "我来自塔吉克斯坦。", "ja": "私はタジキスタン出身です。" },
    { "tj": "Хайр, то вохӯрии оянда.", "ru": "До свидания, до новых встреч.", "en": "Goodbye, see you next time.", "de": "Auf Wiedersehen, bis zum nächsten Mal.", "fr": "Au revoir, à la prochaine.", "es": "Adiós, hasta la próxima.", "it": "Arrivederci, alla prossima.", "tr": "Hoşça kalın, görüşmek üzere.", "ar": "وداعاً، أراك في المرة القادمة.", "fa": "خداحافظ، تا دیدار بعدی.", "zh-CN": "再见，下次见。", "ja": "さようなら、また次回。" }
  ]
},
{
  "id": "introduction_details",
  "title": {
    "tj": "Шиносоии амиқтар", "ru": "Более близкое знакомство", "en": "Getting to know each other",
    "de": "Kennenlernen", "fr": "Faire connaissance",
    "es": "Conocerse mejor", "it": "Conoscersi meglio", "tr": "Tanışmayı ilerletmek",
    "ar": "التعارف العميق", "fa": "آشنایی بیشتر", "zh-CN": "深入了解", "ja": "より親しい自己紹介"
  },
  "phrases": [
    { "tj": "Номи шумо чист?", "ru": "Как вас зовут?", "en": "What is your name?", "de": "Wie heißen Sie?", "fr": "Comment vous appelez-vous?", "es": "¿Cómo se llama?", "it": "Come ti chiami?", "tr": "Adınız ne?", "ar": "ما اسمك؟", "fa": "نام شما چیست؟", "zh-CN": "你叫什么名字？", "ja": "お名前は何ですか？" },
    { "tj": "Шумо чандсола ҳастед?", "ru": "Сколько вам лет?", "en": "How old are you?", "de": "Wie alt sind Sie?", "fr": "Quel âge avez-vous?", "es": "¿Cuántos años tiene?", "it": "Quanti anni hai?", "tr": "Kaç yaşındasınız?", "ar": "كم عمرك؟", "fa": "چند سال دارید؟", "zh-CN": "你多大了？", "ja": "何歳ですか？" },
    { "tj": "Ман бистсола ҳастам.", "ru": "Мне двадцать лет.", "en": "I am twenty years old.", "de": "Ich bin zwanzig Jahre alt.", "fr": "J'ai vingt ans.", "es": "Tengo veinte años.", "it": "Ho vent'anni.", "tr": "Yirmi yaşındayım.", "ar": "عمري عشرون عاماً.", "fa": "من بیست ساله هستم.", "zh-CN": "我 command二十岁。", "ja": "私は20歳です。" },
    { "tj": "Шумо чӣ кор мекунед? (Касбатон чист?)", "ru": "Чем вы занимаетесь? (Кто вы по профессии?)", "en": "What do you do? (What is your profession?)", "de": "Was machen Sie beruflich?", "fr": "Que faites-vous dans la vie?", "es": "¿A qué se dedica?", "it": "Che lavoro fai?", "tr": "Ne iş yapıyorsunuz?", "ar": "ماذا تعمل؟", "fa": "شغل شما چیست؟", "zh-CN": "你是做什么工作的？", "ja": "お仕事は何ですか？" },
    { "tj": "Ман донишҷӯ ҳастам.", "ru": "Я студент.", "en": "I am a student.", "de": "Ich bin Student.", "fr": "Je suis étudiant.", "es": "Soy estudiante.", "it": "Sono uno studente.", "tr": "Öğrenciyim.", "ar": "أنا طالب.", "fa": "من دانشجو هستم.", "zh-CN": "我是学生。", "ja": "私は学生です。" },
    { "tj": "Шумо дар куҷо зиндагӣ мекунед?", "ru": "Где вы живете?", "en": "Where do you live?", "de": "Wo wohnen Sie?", "fr": "Où habitez-vous?", "es": "¿Dónde vive?", "it": "Dove vivi?", "tr": "Nerede yaşıyorsunuz?", "ar": "أين تعيش؟", "fa": "شما کجا زندگی می‌کنید؟", "zh-CN": "你住在哪里？", "ja": "どこに住んでいますか？" },
    { "tj": "Ман дар Душанбе зиндагӣ мекунам.", "ru": "Я живу в Душанбе.", "en": "I live in Dushanbe.", "de": "Ich wohne in Duschanbe.", "fr": "J'habite à Douchanbé.", "es": "Vivo en Dusambé.", "it": "Vivo a Dushanbe.", "tr": "Duşanbe'de yaşıyorum.", "ar": "أعيش في دوشانبي.", "fa": "من در دوشنبه زندگی می‌کنم.", "zh-CN": "我住在杜尚别。", "ja": "私はドゥシャンベに住んでいます。" },
    { "tj": "Шумо бо чӣ шавқ доред? (Хоббии шумо чист?)", "ru": "Чем вы увлекаетесь? (Какое у вас хобби?)", "en": "What are your hobbies?", "de": "Was sind Ihre Hobbys?", "fr": "Quels sont vos loisirs?", "es": "¿Cuáles son sus pasatiempos?", "it": "Quali uro i tuoi hobby?", "tr": "Hobileriniz nelerdir?", "ar": "ما هي هواياتك؟", "fa": "سرگرمی‌های شما چیست؟", "zh-CN": " your有什么爱好？", "ja": "趣味は何ですか？" },
    { "tj": "Ман хондани китобро дӯст медорам.", "ru": "Я люблю читать книги.", "en": "I like reading books.", "de": "Ich lese gerne Bücher.", "fr": "J'aime lire des livres.", "es": "Me gusta leer libros.", "it": "Mi piace leggere libri.", "tr": "Kitap okumayı severim.", "ar": "أحب قراءة الكتب.", "fa": "من книга خواندن را دوست دارم.", "zh-CN": "我喜欢读书。", "ja": "本を読むのが好きです。" },
    { "tj": "Оё метавонам рақами шуморо гирам?", "ru": "Могу я взять ваш номер телефона?", "en": "Can I have your phone number?", "de": "Kann ich Ihre Telefonnummer haben?", "fr": "Puis-je avoir votre numéro de téléphone?", "es": "¿Me дадут ваш número de teléfono?", "it": "Posso avere il tuo numero di telefono?", "tr": "Telefon numaranızı alabilir miyim?", "ar": "هل يمكنني الحصول على رقم هاتفك؟", "fa": "می‌توانم شماره تلفن شما را داشته باشم؟", "zh-CN": "可以给我你的电话号码吗？", "ja": "電話番号を教えていただけますか？" }
  ]
},
{
  "id": "family_and_friends",
  "title": {
    "tj": "Оила ва дӯстон", "ru": "Семья и друзья", "en": "Family and friends",
    "de": "Familie und Freunde", "fr": "Famille et amis",
    "es": "Familia y amigos", "it": "Famiglia e amici", "tr": "Aile ve arkadaşlar",
    "ar": "العائلة والأصدقاء", "fa": "خانواده و دوستان", "zh-CN": "家庭与朋友", "ja": "家族と友人"
  },
  "phrases": [
    { "tj": "Оилаи шумо калон аст?", "ru": "У вас большая семья?", "en": "Do you have a large family?", "de": "Haben Sie eine große Familie?", "fr": "Avez-vous une grande famille ?", "es": "¿Tienes una familia grande?", "it": "Hai una famiglia numerosa?", "tr": "Büyük bir aileniz var mı?", "ar": "هل لديك عائلة كبيرة؟", "fa": "آیا خانواده بزرگی دارید؟", "zh-CN": "你的家庭很大吗？", "ja": "大家族ですか？" },
    { "tj": "Ман оилаамро хеле дӯст медорам.", "ru": "Я очень люблю свою семью.", "en": "I love my family very much.", "de": "Ich liebe meine Familie sehr.", "fr": "J'aime beaucoup ma famille.", "es": "Amo mucho a mi familia.", "it": "Amo molto la mia famiglia.", "tr": "Ailemi çok seviyorum.", "ar": "أنا أحب عائلتي كثيراً.", "fa": "من خانواده‌ام را خیلی دوست دارم.", "zh-CN": "我非常爱我的家人。", "ja": "私は家族が大好きです。" },
    { "tj": "Оё шумо бародар ё хоҳар доред?", "ru": "У вас есть братья или сестры?", "en": "Do you have any brothers or sisters?", "de": "Haben Sie Brüder oder Schwestern?", "fr": "Avez-vous des frères ou des sœurs ?", "es": "¿Tienes hermanos o hermanas?", "it": "Hai fratelli o sorelle?", "tr": "Erkek veya kız kardeşiniz var mı?", "ar": "هل لديك إخوة أو أخوات؟", "fa": "آیا برادر یا خواهر دارید؟", "zh-CN": "你有兄弟姐妹吗？", "ja": "兄弟や姉妹はいますか？" },
    { "tj": "Ман як бародар ва як хоҳар дорам.", "ru": "У меня есть один брат и одна сестра.", "en": "I have one brother and one sister.", "de": "Ich habe einen Bruder und eine Schwester.", "fr": "J'ai un frère et une sœur.", "es": "Tengo un hermano y una hermana.", "it": "Ho un fratello e una sorella.", "tr": "Bir erkek ve bir kız kardeşim var.", "ar": "لدي أخ واحد وأخت واحدة.", "fa": "من یک برادر و یک خواهر دارم.", "zh-CN": "我有一个哥哥和一个妹妹。", "ja": "私には兄が一人と妹が一人います。" },
    { "tj": "Падару модари шумо дар куҷо зиндагӣ мекунанд?", "ru": "Где живут ваши родители?", "en": "Where do your parents live?", "de": "Wo wohnen Ihre Eltern?", "fr": "Où habitent vos parents ?", "es": "¿Dónde viven tus padres?", "it": "Dove vivono i tuoi genitori?", "tr": "Anne babanız nerede yaşıyor?", "ar": "أين يعيش والداك؟", "fa": "پدر و مادر شما کجا زندگی می‌کنند؟", "zh-CN": "你的父母住在哪里？", "ja": "ご両親はどこに住んでいますか？" },
    { "tj": "Оё шумо оиладор ҳастед?", "ru": "Вы женаты / замужем?", "en": "Are you married?", "de": "Sind Sie verheiratet?", "fr": "Êtes-vous marié(e) ?", "es": "¿Estás casado/a?", "it": "Sei sposato/a?", "tr": "Evli misiniz?", "ar": "هل أنت متزوج؟", "fa": "آیا شما متاهل هستید؟", "zh-CN": "你结婚了吗？", "ja": "結婚していますか？" },
    { "tj": "Оё шумо фарзанд доред?", "ru": "У вас есть дети?", "en": "Do you have any children?", "de": "Haben Sie Kinder?", "fr": "Avez-vous des enfants ?", "es": "¿Tienes hijos?", "it": "Hai dei figli?", "tr": "Çocuğunuz var mı?", "ar": "هل لديك أطفال؟", "fa": "آیا فرزند دارید؟", "zh-CN": "你有 child吗？", "ja": "子供はいますか？" },
    { "tj": "Ман ду фарзанд дорам: як писар ва як духтар.", "ru": "У меня двое детей: сын и дочь.", "en": "I have two children: a son and a daughter.", "de": "Ich habe zwei Kinder: einen Sohn und eine Tochter.", "fr": "J'ai deux enfants : un fils et une fille.", "es": "Tengo dos hijos: un hijo y una hija.", "it": "Ho due figli: un figlio e una figlia.", "tr": "İki çocuğum var: bir oğlan ve bir kız.", "ar": "لدي طفلان: ولد وبنت.", "fa": "من دو فرزند دارم: یک پسر و یک دختر.", "zh-CN": "我有两个孩子：一个儿子和一个女儿。", "ja": "私には子供が二人います：息子と娘です。" },
    { "tj": "Ин дӯсти беҳтарини ман аст.", "ru": "Это мой лучший друг / моя лучшая подруга.", "en": "This is my best friend.", "de": "Das ist mein beste Freund.", "fr": "C'est mon meilleur ami.", "es": "Este es mi mejor amigo.", "it": "Questo è il mio migliore amico.", "tr": "Bu benim en yakın arkadaşım.", "ar": "هذا هو صديقي المفضل.", "fa": "این بهترین دوست من است.", "zh-CN": "这是 my最好的朋友。", "ja": "これは私の親友です。" },
    { "tj": "Мо муддати дароз аст, ки дӯст ҳастем.", "ru": "Мы дружим уже долгое время.", "en": "We have been friends for a long time.", "de": "Wir sind schon lange befreundet.", "fr": "Nous sommes amis depuis longtemps.", "es": "Somos amigos desde hace mucho tiempo.", "it": "Siamo amici da molto tempo.", "tr": "Biz uzun zamandır arkadaşız.", "ar": "نحن أصدقاء منذ فترة طويلة.", "fa": "ما زمان زیادی است که با هم دوست هستیم.", "zh-CN": "我们已经是老朋友了。", "ja": "私たちは長い間友人です。" },
    { "tj": "Инҳо хешовандони ман ҳастанд.", "ru": "Это мои родственники.", "en": "These are my relatives.", "de": "Das sind meine Verwandten.", "fr": "Ce sont mes proches.", "es": "Estos son mis parientes.", "it": "Questi sono i miei parenti.", "tr": "Bunlar benim akrabalarım.", "ar": "هؤلاء هم أقاربي.", "fa": "این‌ها خویشاوندان من هستند.", "zh-CN": "这些是我的亲戚。", "ja": "これらは私の親戚です。" },
    { "tj": "Мо тез-тез бо ҳам вомехӯрем.", "ru": "Мы часто встречаемся вместе.", "en": "We often meet up together.", "de": "Wir treffen uns oft.", "fr": "Nous nous voyons souvent.", "es": "Nos reunimos a menudo.", "it": "Ci incontriamo spesso.", "tr": "Sık sık bir araya geliriz.", "ar": "نلتقي معاً في часто.", "fa": "ما اغلب با هم ملاقات می‌کنیم.", "zh-CN": "我们经常聚在一起。", "ja": "私たちはよく集まります。" },
    { "tj": "Оё метавонам шуморо ба меҳмонӣ даъват кунам?", "ru": "Могу я пригласить вас в гости?", "en": "Can I invite you to visit us?", "de": "Darf ich Sie zu uns einladen?", "fr": "Puis-je vous inviter chez nous ?", "es": "¿Puedo invitarte a visitarnos?", "it": "Posso invitarti da noi?", "tr": "Sizi misafirliğe davet edebilir miyim?", "ar": "هل يمكنني دعوتك لزيارتنا؟", "fa": "می‌توانم شما را به خانه دعوت کنم؟", "zh-CN": "我可以邀请你来作客吗？", "ja": "うちに遊びに招待してもいいですか？" },
    { "tj": "Ба падару модаратон аз ман салом гӯед.", "ru": "Передавайте привет вашим родителям.", "en": "Give my regards to your parents.", "de": "Grüßen Sie Ihre Eltern von mir.", "fr": "Saluez vos parents de ma part.", "es": "Saluda a tus padres de mi parte.", "it": "Saluta i tuoi genitori da parte mia.", "tr": "Anne babanıza selamlarımı iletin.", "ar": "بلغ تحياتي لوالديك.", "fa": "به پدر و مادرتان سلام برسانید.", "zh-CN": "代我向你的父母问好。", "ja": "ご両親によろしくお伝えください。" },
    { "tj": "Саломат ва хушбахт бошед!", "ru": "Будьте здоровы и счастливы!", "en": "Be healthy and happy!", "de": "Bleiben Sie gesund und glücklich!", "fr": "Soyez en bonne santé et heureux !", "es": "¡Mantente sano y feliz!", "it": "Sii sano e felice!", "tr": "Sağlıklı ve mutlu kalın!", "ar": "دمتم سالمين وسعداء!", "fa": "سلامت و خوشبخت باشید!", "zh-CN": "祝你健康快乐！", "ja": "健康で幸せに過ごしてください！" }
  ]
},
{
  "id": "on_the_bus",
  "title": {
    "tj": "Дар автобус", "ru": "В автобусе", "en": "On the bus",
    "de": "Im Bus", "fr": "Dans l'autobus",
    "es": "En el autobús", "it": "In autobus", "tr": "Otobüste",
    "ar": "في الحافلة", "fa": "در اتوبوس", "zh-CN": "在公交车上", "ja": "バスで"
  },
  "phrases": [
    { "tj": "Истгоҳи наздиктарини автобус дар куҷост?", "ru": "Где находится ближайшая автобусная остановка?", "en": "Where is the nearest bus stop?", "de": "Wo ist die nächste Bushaltestelle?", "fr": "Où se trouve l'arrêt de bus le plus proche ?", "es": "¿Dónde está la parada de autobús más cercana?", "it": "Dov'è la fermata dell'autobus più vicina?", "tr": "En yakın otobüs durağı nerede?", "ar": "أين تقع أقرب محطة حافلات؟", "fa": "نزدیک‌ترین ایستگاه اتوبوس کجاست؟", "zh-CN": "最近的公交车站在哪里？", "ja": "一番近いバス停はどこですか？" },
    { "tj": "Кадом автобус ба маркази шаҳр меравад?", "ru": "Какой автобус едет до центра города?", "en": "Which bus goes to the city center?", "de": "Welcher Bus fährt zum Stadtzentrum?", "fr": "Quel bus va au centre-ville ?", "es": "¿Qué autobús va al centro de la ciudad?", "it": "Quale autobus va in centro?", "tr": "Hangi otobüs şehir merkezine gidiyor?", "ar": "أي حافلة تذهب إلى وسط المدينة؟", "fa": "کدام اتوبوس به مرکز شهر می‌رود؟", "zh-CN": "哪路公交车去市中心？", "ja": "どのバスが市内中心部に行きますか？" },
    { "tj": "Оё ин автобус ба фурудгоҳ меравад?", "ru": "Этот автобус едет в аэропорт?", "en": "Does this bus go to the airport?", "de": "Fährt dieser Bus zum Flughafen?", "fr": "Ce bus va-t-il à l'aéroport ?", "es": "¿Este autobús va al aeropuerto?", "it": "Questo autobus va in aeroporto?", "tr": "Bu otobüs havalimanına gidiyor mu?", "ar": "هل هذه الحافلة تذهب إلى المطار؟", "fa": "آیا این اتوبوس به فرودگاه می‌رود؟", "zh-CN": "这辆公交车去机场吗？", "ja": "このバスは空港に行きますか？" },
    { "tj": "Чипта чанд пул аст?", "ru": "Сколько стоит билет?", "en": "How much is the ticket?", "de": "Wie viel kostet die Fahrkarte?", "fr": "Combien coûte le ticket ?", "es": "¿Cuánto cuesta el billete?", "it": "Quanto costa il biglietto?", "tr": "Bilet ne kadar?", "ar": "كم ثمن التذكرة؟", "fa": "قیمت بلیط چقدر است؟", "zh-CN": "车票多少钱？", "ja": "切符はいくらですか？" },
    { "tj": "Ман аз куҷо метавонам чипта (корти нақлиётӣ) харам?", "ru": "Где я могу купить билет (транспортную карту)?", "en": "Where can I buy a ticket (transport card)?", "de": "Wo kann ich eine Fahrkarte (Transportkarte) kaufen?", "fr": "Où puis-je acheter un ticket (carte de transport) ?", "es": "¿Dónde puedo comprar un billete (tarjeta de transporte)?", "it": "Dove posso comprare un biglietto (carta di trasporto)?", "tr": "Nereden bilet (ulaşım kartı) satın alabilirim?", "ar": "أين يمكنني شراء تذكرة (بطاقة مواصلات)؟", "fa": "از کجا می‌توانم بلیط (کارت اتوبوس) بخرم؟", "zh-CN": "我在哪里可以买到车票（交通卡）？", "ja": "切符（交通カード）はどこで買えますか？" },
    { "tj": "Оё ин ҷо холӣ аст?", "ru": "Это место свободно?", "en": "Is this seat free?", "de": "Ist dieser Platz frei?", "fr": "Ce siège est-il libre ?", "es": "¿Este asiento está libre?", "it": "Questo posto è libero?", "tr": "Bu koltuk boş mu?", "ar": "هل هذا المقعد شاغر؟", "fa": "آیا این صندلی خالی است؟", "zh-CN": "这个座位空着吗？", "ja": "この席は空いていますか？" },
    { "tj": "Лутфан, ба ман ҷой диҳед.", "ru": "Пожалуйста, уступите мне место.", "en": "Please give me a seat.", "de": "Bitte machen Sie мне Platz.", "fr": "S'il vous plaît, laissez-moi une place.", "es": "Por favor, cédame el asiento.", "it": "Per favore, mi lasci il posto.", "tr": "Lütfen bana yer verir misiniz?", "ar": "رجاءً، اترك لي مقعداً.", "fa": "لطفاً به من جا بدهید.", "zh-CN": "请给我让个座。", "ja": "席を譲っていただけますか？" },
    { "tj": "Истгоҳи навбатӣ кадом аст?", "ru": "Какая следующая остановка?", "en": "What is the next stop?", "de": "Was ist die nächste Haltestelle?", "fr": "Quel est le prochain arrêt ?", "es": "¿Cuál es la siguiente parada?", "it": "Qual è la prossima fermata?", "tr": "Bir sonraki durak nerede?", "ar": "ما هي المحطة القادمة؟", "fa": "ایستگاه بعدی کدام است؟", "zh-CN": "下一站是什么？", "ja": "次はどの駅ですか？" },
    { "tj": "Ман бояд дар кадом истгоҳ фароям?", "ru": "На какой остановке мне нужно сойти?", "en": "Which stop do I need to get off at?", "de": "An welcher Haltestelle muss ich aussteigen?", "fr": "À quel arrêt dois-je descendre ?", "es": "¿En qué parada debo bajarme?", "it": "A quale fermata devo scendere?", "tr": "Hangi durakta inmem gerekiyor?", "ar": "في أي محطة يجب أن أنزل؟", "fa": "کدام ایستگاه باید پیاده شوم؟", "zh-CN": "我应该并在哪一站下车？", "ja": "どの停留所で降りればいいですか？" },
    { "tj": "Автобуси навбатӣ кай меояд?", "ru": "Когда приедет следующий автобус?", "en": "When is the next bus coming?", "de": "Wann kommt der nächste Bus?", "fr": "Quand arrive le prochain bus ?", "es": "¿Cuándo viene el próximo autobús?", "it": "Quando arriva il prossimo autobus?", "tr": "Bir sonraki otobüs ne zaman gelecek?", "ar": "متى ستصل الحافلة القادمة؟", "fa": "اتوبوس بعدی کی می‌رسد؟", "zh-CN": "下一班公交车什么时候来？", "ja": "次のバスはいつ来ますか？" },
    { "tj": "Оё метавонам бо корт пардохт кунам?", "ru": "Можно оплатить картой?", "en": "Can I pay by card?", "de": "Kann ich mit Karte bezahlen?", "fr": "Puis-je payer par carte ?", "es": "¿Puedo pagar con tarjeta?", "it": "Posso pagare con la carta?", "tr": "Kredi kartıyla ödeyebilir miyim?", "ar": "هل يمكنني الدفع بالبطاقة؟", "fa": "می‌توانم با کارت پرداخت کنم؟", "zh-CN": "可以刷卡吗？", "ja": "カードで払えますか？" },
    { "tj": "Шумо дар истгоҳи навбатӣ мефароед?", "ru": "Вы выходите на следующей остановке?", "en": "Are you getting off at the next stop?", "de": "Steigen Sie an der nächsten Haltestelle aus?", "fr": "Descendez-vous au prochain arrêt ?", "es": "¿Se baja en la siguiente parada?", "it": "Scende alla prossima fermata?", "tr": "Bir sonraki durakta inecek misiniz?", "ar": "هل ستنزل في المحطة القادمة؟", "fa": "ایستگاه بعدی پیاده می‌شوید؟", "zh-CN": "你下一站下车吗？", "ja": "次の停留所で降りますか？" },
    { "tj": "Лутфан, каме роҳ диҳед, ман бояд фароям.", "ru": "Пожалуйста, разрешите пройти, мне нужно сойти.", "en": "Please let me through, I need to get off.", "de": "Bitte lassen Sie mich durch, ich muss aussteigen.", "fr": "S'il vous plaît, laissez-moi passer, je dois descendre.", "es": "Por favor, déjeme pasar, tengo que bajar.", "it": "Per favore, mi faccia passare, devo scendere.", "tr": "Lütfen müsaade edin, inmem gerekiyor.", "ar": "اسمحي لي بالمرور، أحتاج إلى النزول.", "fa": "لطفاً اجازه بدهید رد شوم، باید پیاده شوم.", "zh-CN": "请借过一下，我要下车。", "ja": "通してください、降ります。" },
    { "tj": "Дарҳоро кушоед, лутфан.", "ru": "Откройте двери, пожалуйста.", "en": "Open the doors, please.", "de": "Öffnen Sie bitte die Türen.", "fr": "Ouvrez les portes, s'il vous plaît.", "es": "Abra las puertas, por favor.", "it": "Apra le porte, per favore.", "tr": "Kapıları açar mısınız, lütfen?", "ar": "افتح الأبواب، من فضلك.", "fa": "لطفاً درها را باز کنید.", "zh-CN": "请开门。", "ja": "ドアを開けてください。" },
    { "tj": "Барои кӯмак ташаккур!", "ru": "Спасибо за помощь!", "en": "Thank you for your help!", "de": "Danke für Ihre Hilfe!", "fr": "Merci pour votre aide !", "es": "¡Gracias por su ayuda!", "it": "Grazie per l'aiuto!", "tr": "Yardımınız için teşekkürler!", "ar": "شكراً لمساعدتك!", "fa": "ممنون بابت کمک شما!", "zh-CN": "谢谢你的帮助！", "ja": "助けてくれてありがとうございました！" }
  ]
},
{
  "id": "in_the_taxi",
  "title": {
    "tj": "Дар такси", "ru": "В такси", "en": "In the taxi",
    "de": "Im Taxi", "fr": "Dans le taxi",
    "es": "En el taxi", "it": "In taxi", "tr": "Takside",
    "ar": "في سيارة الأجرة", "fa": "در تاکسی", "zh-CN": "在出租车上", "ja": "タクシーで"
  },
  "phrases": [
    { "tj": "Лутфан, маро ба ин нишонӣ (адрес) баред.", "ru": "Пожалуйста, отвезите меня по этому адресу.", "en": "Please take me to this address.", "de": "Bitte bringen Sie mich zu dieser Adresse.", "fr": "S'il vous plaît, emmenez-moi à cette adresse.", "es": "Por favor, lléveme a esta dirección.", "it": "Per favore, mi porti a questo indirizzo.", "tr": "Lütfen beni bu adrese götürün.", "ar": "يرجى أخذي إلى هذا العنوان.", "fa": "لطفاً مرا به این آدرس ببرید.", "zh-CN": "请带我去这个地址。", "ja": "この住所までお願いします。" },
    { "tj": "Нархи то маркази шаҳр чанд пул мешавад?", "ru": "Сколько стоит доехать до центра города?", "en": "How much to the city center?", "de": "Wie viel kostet es bis zum Stadtzentrum?", "fr": "Combien ça coûte pour aller au centre-ville?", "es": "¿Cuánto cuesta ir al centro de la ciudad?", "it": "Quanto costa andare in centro?", "tr": "Şehir merkezine ne kadar yazar?", "ar": "كم ثمن الذهاب إلى وسط المدينة؟", "fa": "هزینه تا مرکز شهر چقدر می‌شود؟", "zh-CN": "到市中心多少钱？", "ja": "市内中心部までいくらですか？" },
    { "tj": "Лутфан, бордонро (багажник) кушоед.", "ru": "Пожалуйста, откройте багажник.", "en": "Please open the trunk.", "de": "Bitte öffnen Sie den Kofferraum.", "fr": "Où est le coffre, s'il vous plaît?", "es": "Por favor, abra el maletero.", "it": "Per favore, apra il bagagliaio.", "tr": "Lütfen bagajı açar mısınız?", "ar": "يرجى فتح صندوق السيارة.", "fa": "لطفاً صندوق عقب را باز کنید.", "zh-CN": "请打开 trunk 行李箱。", "ja": "トランクを開けてください。" },
    { "tj": "Оё метавонед кондитсионерро рӯшан кунед?", "ru": "Можете включить кондиционер?", "en": "Could you turn on the air conditioning?", "de": "Könnten Sie die Klimaanlage einschalten?", "fr": "Pourriez-vous allumer la climatisation?", "es": "¿Podría encender el aire acondicionado?", "it": "Potrebbe accendere l'aria condizionata?", "tr": "Klimayı açabilir misiniz?", "ar": "هل يمكنك تشغيل المكيف؟", "fa": "می‌توانید کولر را روشن کنید؟", "zh-CN": "可以开一下空调吗？", "ja": "エアコンをつけていただけますか？" },
    { "tj": "Ин ҷо хеле гарм аст (ё хунук аст).", "ru": "Здесь очень жарко (или холодно).", "en": "It is very hot (or cold) here.", "de": "Es ist sehr heiß (oder kalt) hier.", "fr": "Il fait très chaud (ou froid) ici.", "es": "Hace mucho calor (o frío) aquí.", "it": "Fa molto caldo (o freddo) qui.", "tr": "Burası çok sıcak (veya soğuk).", "ar": "الجو حار جداً (أو بارد) هنا.", "fa": "اینجا خیلی گرم (یا سرد) است.", "zh-CN": "这里太热了（或太冷了）。", "ja": "ここはとても暑い（または寒い）です。" },
    { "tj": "Мо кай ба он ҷо мерасем?", "ru": "Когда мы туда приедем?", "en": "When will we get there?", "de": "Wann kommen wir dort an?", "fr": "Quand est-ce qu'on arrive?", "es": "¿Cuándo llegaremos allí?", "it": "Quando arriveremo?", "tr": "Oraya ne zaman varırız?", "ar": "متى سنصل إلى هناك؟", "fa": "ما کی به آنجا می‌رسیم؟", "zh-CN": "我们什么时候到那里？", "ja": "いつ着きますか？" },
    { "tj": "Оё мо дар бандшавии нақлиёт (пробка) мондаем?", "ru": "Мы застряли в пробке?", "en": "Are we stuck in a traffic jam?", "de": "Stecken wir im Stau?", "fr": "On est coincés dans un embouteillage?", "es": "¿Estamos atrapados en un atasco?", "it": "Siamo bloccati nel traffico?", "tr": "Trafikte mi kaldık?", "ar": "هل نحن عالقون في ازدحام مروري؟", "fa": "آیا در ترافیک گیر کرده‌ایم؟", "zh-CN": "我们堵车了吗？", "ja": "渋滞にはまっていますか？" },
    { "tj": "Лутфан, каме тезтар равед, ман дер карда истодаам.", "ru": "Пожалуйста, поезжайте немного быстрее, я опаздываю.", "en": "Please go a little faster, I am late.", "de": "Bitte fahren Sie etwas schneller, ich bin zu spät.", "fr": "S'il vous plaît, allez un peu plus vite, je suis en retard.", "es": "Por favor, vaya un poco más rápido, voy tarde.", "it": "Per favore, vada un po' più veloce, sono in ritardo.", "tr": "Lütfen biraz daha hızlı gidin, geç kalıyorum.", "ar": "يرجى الإسراع قليلاً، أنا متأخر.", "fa": "لطفاً کمی سریع‌تر بروید، من دیرم شده است.", "zh-CN": "请开快一点，我赶时间。", "ja": "少し急いでいただけますか、遅刻しそうなのです。" },
    { "tj": "Эҳтиёт кунед, лутфан суръатро паст кунед.", "ru": "Осторожнее, пожалуйста, сбросьте скорость.", "en": "Be careful, please slow down.", "de": "Fahren Sie vorsichtig, bitte langsamer.", "fr": "Faites attention, ralentissez s'il vous plaît.", "es": "Tenga cuidado, por favor reduzca la velocidad.", "it": "Faccia attenzione, per favore rallenti.", "tr": "Dikkatli olun, lütfen yavaşlayın.", "ar": "كن حذراً، يرجى إبطاء السرعة.", "fa": "مراقب باشید، لطفاً سرعت را کم کنید.", "zh-CN": "小心点，请减速。", "ja": "気をつけて、スピードを落としてください。" },
    { "tj": "Ин ҷо нигоҳ доред, лутфан.", "ru": "Остановитесь здесь, пожалуйста.", "en": "Stop here, please.", "de": "Halten Sie hier an, bitte.", "fr": "Arrêtez-vous ici, s'il vous plaît.", "es": "Pare aquí, por favor.", "it": "Si fermi qui, per favore.", "tr": "Burada durun, lütfen.", "ar": "توقف هنا، من فضلك.", "fa": "لطفاً اینجا نگه دارید.", "zh-CN": "请在这里停車。", "ja": "ここで止めてください。" },
    { "tj": "Пас аз чароғаки сабз (светофор) ба рост гардед.", "ru": "Поверните направо после светофора.", "en": "Turn right after the traffic light.", "de": "Biegen Sie nach der Ampel rechts ab.", "fr": "Tournez à droite après le feu.", "es": "Gire a la derecha después del semáforo.", "it": "Giri a destra dopo il semaforo.", "tr": "Trafik ışığından sonra sağa dönün.", "ar": "انعطف يميناً بعد الإشارة الضوئية.", "fa": "بعد از چراغ راهنمایی به راست بپیچید.", "zh-CN": "过红绿灯后向右转。", "ja": "信号の先を右に曲がってください。" },
    { "tj": "Оё метавонам бо корт пардохт кунам?", "ru": "Можно оплатить картой?", "en": "Can I pay by card?", "de": "Kann ich mit Karte bezahlen?", "fr": "Puis-je payer par carte?", "es": "¿Puedo pagar con tarjeta?", "it": "Posso pagare con la carta?", "tr": "Kredi kartıyla ödeyebilir miyim?", "ar": "هل يمكنني الدفع بالبطاقة؟", "fa": "می‌توانم با کارت پرداخت کنم؟", "zh-CN": "可以刷卡吗？", "ja": "カードで払えますか？" },
    { "tj": "Ман бо пулҳои нақд пардохт мекунам.", "ru": "Я заплачу наличными.", "en": "I will pay in cash.", "de": "Ich zahle bar.", "fr": "Je vais payer en espèces.", "es": "Pagaré en efectivo.", "it": "Pagherò in contanti.", "tr": "Nakit ödeyeceğim.", "ar": "سأدفع نقداً.", "fa": "من نقدی پرداخت می‌کنم.", "zh-CN": "我付现金。", "ja": "現金で払います。" },
    { "tj": "Бақияашро нигоҳ доред.", "ru": "Сдачи не надо.", "en": "Keep the change.", "de": "Stimmt so.", "fr": "Gardez la monnaie.", "es": "Quédese con el cambio.", "it": "Tenga il resto.", "tr": "Üstü kalsın.", "ar": "احتفظ بالباقي.", "fa": "باقی پول برای خودتان.", "zh-CN": "不用找零了。", "ja": "お釣りはとっておいてください。" },
    { "tj": "Ташаккур барои сафар, рӯзи хуш!", "ru": "Спасибо за поездку, хорошего дня!", "en": "Thank you for the ride, have a nice day!", "de": "Danke für die Fahrt, einen schönen Tag noch!", "fr": "Merci pour le trajet, bonne journée!", "es": "Gracias por el viaje, ¡buen día!", "it": "Grazie per il viaggio, buona giornata!", "tr": "Yolculuk için teşekkürler, iyi günler!", "ar": "شكراً على الرحلة، أتمنى لك يوماً سعيداً!", "fa": "ممنون بابت سفر، روز خوبی داشته باشید!", "zh-CN": "谢谢，祝你今天愉快！", "ja": "ありがとうございました、良い一日を！" }
  ]
},
{
  "id": "at_work",
  "title": {
    "tj": "Дар кор", "ru": "На работе", "en": "At work",
    "de": "Achtung Arbeit", "fr": "Au travail",
    "es": "En el trabajo", "it": "Al lavoro", "tr": "İşte",
    "ar": "في العمل", "fa": "در کار", "zh-CN": "在工作中", "ja": "職場で"
  },
  "phrases": [
    { "tj": "Ҷойи кории ман дар куҷост?", "ru": "Где моё рабочее место?", "en": "Where is my workplace?", "de": "Wo ist mein Arbeitsplatz?", "fr": "Où est mon poste de travail ?", "es": "¿Dónde está mi lugar de trabajo?", "it": "Dov'è la mia postazione di lavoro?", "tr": "Çalışma yerim nerede?", "ar": "أين هو مكان عملي؟", "fa": "محل کار من کجاست؟", "zh-CN": "我的工作岗位在哪里？", "ja": "私の席はどこですか？" },
    { "tj": "Рӯзи кории мо соати чанд сар мешавад?", "ru": "Во сколько начинается наш рабочий день?", "en": "What time does our workday start?", "de": "Wann beginnt unser Arbeitstag?", "fr": "À quelle heure commence notre journée de travail ?", "es": "¿A qué hora empieza nuestra jornada laboral?", "it": "A che ora inizia la nostra giornata lavorativa?", "tr": "Mesaimiz saat kaçta başlıyor?", "ar": "في أي وقت يبدأ يوم عملنا؟", "fa": "ساعت کاری ما چه زمانی شروع می‌شود؟", "zh-CN": "我们的工作日几点开始？", "ja": "就業時間は何時に始まりますか？" },
    { "tj": "Сардори (мудири) мо кист?", "ru": "Кто наш начальник (менеджер)?", "en": "Who is our boss (manager)?", "de": "Wer ist unser Chef (Manager)?", "fr": "Qui est notre chef (manager) ?", "es": "¿Quién es nuestro jefe (gerente)?", "it": "Chi è il nostro capo (manager)?", "tr": "Patronumuz (müdürümüz) kim?", "ar": "من هو رئيسنا (مديرنا)؟", "fa": "رئیس (مدیر) ما کیست؟", "zh-CN": "我们的老板（经理）是谁？", "ja": "私たちのボス（上司）は誰ですか？" },
    { "tj": "Имрӯз соати чанд ҷаласа (маҷлис) дорем?", "ru": "Во сколько у нас сегодня собрание?", "en": "What time is our meeting today?", "de": "Um wie viel Uhr ist heute unsere Besprechung?", "fr": "À quelle heure est notre réunion aujourd'hui ?", "es": "¿A qué hora es nuestra reunión de hoy?", "it": "A che ora è la nostra riunione oggi?", "tr": "Bugün toplantımız saat kaçta?", "ar": "في أي وقت اجتماعنا اليوم？", "fa": "امروز جلسه ما چه ساعتی است؟", "zh-CN": "我们今天的会议是几点？", "ja": "今日の会議は何時ですか？" },
    { "tj": "Ба ман компютер ва почтаи корӣ лозим аст.", "ru": "Мне нужны компьютер и рабочая почта.", "en": "I need a computer and a work email.", "de": "Ich brauche einen Computer und eine Arbeits-E-Mail.", "fr": "J'ai besoin d'un ordinateur et d'un e-mail professionnel.", "es": "Necesito una computadora и un correo electrónico de trabajo.", "it": "Ho bisogno di un computer e di un'email di lavoro.", "tr": "Bir bilgisayara ve iş e-postasına ihtiyacım var.", "ar": "أحتاج إلى كمبيوتر وبريد إلكتروني للعمل.", "fa": "من به یک کامپیوتر و ایمیل کاری نیاز دارم.", "zh-CN": "我需要一台电脑和工作邮箱。", "ja": "パソコンと仕事用のメールアドレスが必要です。" },
    { "tj": "Ин вазифаро то кай бояд иҷро кунам (дедлайн)?", "ru": "До какого времени нужно выполнить эту задачу (дедлайн)?", "en": "When is the deadline for this task?", "de": "Wann ist die Frist für diese Aufgabe?", "fr": "Quelle est la date limite pour cette tâche ?", "es": "¿Cuál es la fecha límite para esta tarea?", "it": "Qual è la scadenza per questo compito?", "tr": "Bu görevin son teslim tarihi nedir?", "ar": "ما هو الموعد النهائي لهذه المهمة؟", "fa": "مهلت (ددلاین) انجام این کار تا کی است؟", "zh-CN": "这项任务的截止日期是什么时候？", "ja": "このタスクの締め切りはいつですか？" },
    { "tj": "Ман ин ҳисоботро тайёр кардам.", "ru": "Я подготовил этот отчёт.", "en": "I have prepared this report.", "de": "Ich habe diesen Bericht vorbereitet.", "fr": "J'ai préparé ce rapport.", "es": "He preparado este informe.", "it": "Ho preparato questa relazione.", "tr": "Bu raporu hazırladım.", "ar": "لقد أعددت هذا التقرير.", "fa": "من این گزارش را آماده کرده‌ام.", "zh-CN": "我写好了这份报告。", "ja": "レポートを作成しました。" },
    { "tj": "Оё метавонед ба ман дар ин кор кӯмак кунед?", "ru": "Можете ли вы помочь мне с этой работой?", "en": "Can you help me with this work?", "de": "Können Sie mir bei dieser Arbeit helfen?", "fr": "Pouvez-vous m'aider pour ce travail ?", "es": "¿Puede ayudarme con este trabajo?", "it": "Puoi aiutarmi con questo lavoro?", "tr": "Bu işte bana yardımcı olabilir misiniz?", "ar": "هل يمكنك مساعدتي في هذا العمل؟", "fa": "می‌توانید در این کار به من کمک کنید؟", "zh-CN": "您能在工作上帮我一下吗？", "ja": "この仕事を手伝っていただけますか？" },
    { "tj": "Вақти хӯроки нисфирӯзӣ кай аст?", "ru": "Когда время обеденного перерыва?", "en": "When is the lunch break?", "de": "Wann ist die Mittagspause?", "fr": "C'est quand la pause déjeuner ?", "es": "¿Cuándo es el descanso para almorzar?", "it": "Quand'è la pausa pranzo?", "tr": "Öğle arası ne zaman?", "ar": "متى يحين وقت استراحة الغداء؟", "fa": "ساعت ناهار چه زمانی است؟", "zh-CN": "午休时间是什么时候？", "ja": "昼休みはいつですか？" },
    { "tj": "Ман мехоҳам ба рухсатии меҳнатӣ (отпуск) равам.", "ru": "Я бы хотел пойти в отпуск.", "en": "I would like to go on vacation.", "de": "Ich möchte Urlaub machen.", "fr": "Je voudrais prendre des vacances.", "es": "Me gustaría irme de vacaciones.", "it": "Vorrei andare in vacanza.", "tr": "Tatile çıkmak istiyorum.", "ar": "أود الذهاب في إجازة.", "fa": "می‌خواهم به مرخصی بروم.", "zh-CN": "我想请假去度假。", "ja": "休暇を取りたいです。" },
    { "tj": "Принтер (чопгар) дар куҷост?", "ru": "Где находится принтер?", "en": "Where is the printer?", "de": "Wo ist der Drucker?", "fr": "Où est l'imprimante ?", "es": "¿Dónde está la impresora?", "it": "Dov'è la stampante?", "tr": "Yazıcı nerede?", "ar": "أين تقع الطابعة؟", "fa": "پرینتر کجاست؟", "zh-CN": "打印机在哪里？", "ja": "プリンターはどこですか？" },
    { "tj": "Ҳамкорони нав хеле меҳрубонанд.", "ru": "Новые коллеги очень дружелюбны.", "en": "The new colleagues are very friendly.", "de": "Die neuen Kollegen sind sehr freundlich.", "fr": "Les nouveaux collègues sont très sympathiques.", "es": "Los nuevos compañeros son muy amables.", "it": "I nuovi colleghi sono molto amichevoli.", "tr": "Yeni meslektaşlar çok cana yakın.", "ar": "الزملاء الجدد ودودون للغاية.", "fa": "همکاران جدید خیلی مهربان هستند.", "zh-CN": "新同事们都非常友好。", "ja": "新しい同僚たちはとても親切です。" },
    { "tj": "Рӯзи маош кай аст?", "ru": "Когда день зарплаты?", "en": "When is payday?", "de": "Wann ist Zahltag?", "fr": "Quand est le jour de paie ?", "es": "¿Cuándo es el día de pago?", "it": "Quando si viene pagati?", "tr": "Maaş günü ne zaman?", "ar": "متى يوم الدفع؟", "fa": "روز حقوق چه زمانی است؟", "zh-CN": "什么时候发工资？", "ja": "給料日はいつですか？" },
    { "tj": "Ман бояд имрӯз изофакорӣ (overtime) кунам.", "ru": "Мне нужно сегодня поработать сверхурочно.", "en": "I need to work overtime today.", "de": "Ich muss heute Überstunden machen.", "fr": "Je dois faire des heures supplémentaires aujourd'hui.", "es": "Necesito trabajar horas extras hoy.", "it": "Oggi devo fare gli straordinari.", "tr": "Bugün fazla mesai yapmam gerekiyor.", "ar": "أحتاج إلى العمل لبعض الوقت الإضافي اليوم.", "fa": "امروز باید اضافه‌کاری کنم.", "zh-CN": "我今天需要加班。", "ja": "今日は残業をする必要があります。" },
    { "tj": "Кори хуб ба ҳама, хайр!", "ru": "Всем хорошей работы, пока!", "en": "Good work to everyone, bye!", "de": "Gute Arbeit für alle, tschüss!", "fr": "Bon travail à tous, au revoir !", "es": "¡Buen trabajo a todos, adiós!", "it": "Buon lavoro a tutti, ciao!", "tr": "Herkese iyi çalışmalar, hoşça kalın!", "ar": "عمل موفق للجميع، وداعاً!", "fa": "خسته نباشید همگی، خداحافظ!", "zh-CN": "祝大家工作顺利，再见！", "ja": "皆さんお疲れ様でした、さようなら！" }
  ]
},
{
  "id": "shopping",
  "title": {
    "tj": "Дар мағоза", "ru": "В магазине", "en": "Shopping",
    "de": "Im Geschäft", "fr": "Magasinage",
    "es": "En la tienda", "it": "In negozio", "tr": "Mağazada",
    "ar": "في المتجر", "fa": "در مغازه", "zh-CN": "在商店", "ja": "店で"
  },
  "phrases": [
    { "tj": "Ин чанд пул аст?", "ru": "Сколько это стоит?", "en": "How much is this?", "de": "Wie viel kostet das?", "fr": "Combien ça coûte?", "es": "¿Cuánto cuesta esto?", "it": "Quanto costa questo?", "tr": "Bu ne kadar?", "ar": "كم سعر هذا؟", "fa": "این چند است؟", "zh-CN": "这个多少钱？", "ja": "これはいくらですか？" },
    { "tj": "Маркази савдо дар куҷост?", "ru": "Где находится торговый центр?", "en": "Where is the shopping mall?", "de": "Wo ist das Einkaufszentrum?", "fr": "Où est le centre commercial?", "es": "¿Dónde está el centro comercial?", "it": "Dov'è il centro commerciale?", "tr": "Alışveriş merkezi nerede?", "ar": "أين يقع مركز التسوق؟", "fa": "مرکز خرید کجاست؟", "zh-CN": "购物中心在哪里？", "ja": "ショッピングモールはどこですか？" },
    { "tj": "Ман танҳо тамошо карда истодаам.", "ru": "Я просто смотрю.", "en": "I am just looking.", "de": "Ich schaue nur.", "fr": "Je regarde seulement.", "es": "Solo estoy mirando.", "it": "Sto solo guardando.", "tr": "Sadece bakıyorum.", "ar": "أنا فقط أنظر.", "fa": "من فقط دارم نگاه می‌کنم.", "zh-CN": "我只是看看。", "ja": "ただ見ているだけです。" },
    { "tj": "Оё шумо инро бо ранги дигар доред?", "ru": "У вас есть это в другом цвете?", "en": "Do you have this in another color?", "de": "Haben Sie das ин другой Farbe?", "fr": "Avez-vous cela dans une autre couleur?", "es": "¿Tiene esto en otro color?", "it": "Lo avete in un altro colore?", "tr": "Bunun başka bir rengi var mı?", "ar": "هل لديك هذا بلون آخر؟", "fa": "آیا این را در رنگ دیگری دارید؟", "zh-CN": "这个有别的颜色吗？", "ja": "これの他の色はありますか？" },
    { "tj": "Хонаи либосивазкунӣ дар куҷост?", "ru": "Где находится примерочная?", "en": "Where is the fitting room?", "de": "Wo ist die Umkleidekabine?", "fr": "Où est la cabine d'essayage?", "es": "¿Dónde está el probador?", "it": "Dov'è il camerino?", "tr": "Soyunma kabini nerede?", "ar": "أين غرفة قياس الملابس؟", "fa": "اتاق پرو کجاست؟", "zh-CN": "试衣间在哪里？", "ja": "试着室はどこですか？" },
    { "tj": "Ин ба ман хеле калон аст.", "ru": "Это мне слишком велико.", "en": "This is too big for me.", "de": "Das ist mir zu groß.", "fr": "C'est trop grand pour moi.", "es": "Это мне слишком велико.", "it": "Questo è troppo grande per me.", "tr": "Bu bana çok büyük.", "ar": "هذا كبير جداً علي.", "fa": "این برای من خیلی بزرگ است.", "zh-CN": "这个对我来说太大了。", "ja": "これは私には大きすぎます。" },
    { "tj": "Оё шумо андозаи хурдтар доред?", "ru": "У вас есть размер поменьше?", "en": "Do you have a smaller size?", "de": "Haben Sie eine kleinere Größe?", "fr": "Avez-vous une taille plus petite?", "es": "¿Tiene una talla más pequeña?", "it": "Ha una taglia più piccola?", "tr": "Daha küçük bir bedeniniz var mı?", "ar": "هل لديك مقاس أصغر؟", "fa": "آیا سایز کوچکتر دارید؟", "zh-CN": "你有小一点的号吗？", "ja": "もっと小さいサイズはありますか？" },
    { "tj": "Ман инро мехарам.", "ru": "Я куплю это.", "en": "I will buy this.", "de": "Ich kaufe das.", "fr": "Je vais l'acheter.", "es": "Lo compraré.", "it": "Lo compro.", "tr": "Bunu satın alacağım.", "ar": "سأشتري هذا.", "fa": "من این را می‌خرم.", "zh-CN": "我要买这个。", "ja": "これを買います。" },
    { "tj": "Оё ягон тахфиф ҳаст?", "ru": "Есть ли скидки?", "en": "Is there any discount?", "de": "Gibt es einen Rabatt?", "fr": "Y a-t-il une réduction?", "es": "¿Hay algún descuento?", "it": "C'è uno sconto?", "tr": "İndirim var mı?", "ar": "هل هناك أي خصم؟", "fa": "آیا تخفیفی وجود دارد؟", "zh-CN": "有折扣吗？", "ja": "割引はありますか？" },
    { "tj": "Хазина дар куҷост?", "ru": "Где находится касса?", "en": "Where is the cash desk?", "de": "Wo ist die Kasse?", "fr": "Où est la caisse?", "es": "¿Dónde está la caja?", "it": "Dov'è la cassa?", "tr": "Kasa nerede?", "ar": "أين الصندوق؟", "fa": "صندوق کجاست؟", "zh-CN": "收银台在哪里？", "ja": "レジはどこですか？" },
    { "tj": "Лутфан ба ман халта диҳед.", "ru": "Дайте мне пакет, пожалуйста.", "en": "Give me a bag, please.", "de": "Geben Sie mir bitte eine Tüte.", "fr": "Donnez-moi un sac, s'il vous plaît.", "es": "Deme una bolsa, por favor.", "it": "Mi dia un sacchetto, per favore.", "tr": "Bir poşet verir misiniz, lütfen?", "ar": "أعطني كيسًا، من فضلك.", "fa": "لطفا به من یک کیسه بدهید.", "zh-CN": "请给我一个袋子。", "ja": "袋をください。" },
    { "tj": "Оё метавонам инро баргардонам?", "ru": "Могу ли я вернуть это?", "en": "Can I return this?", "de": "Kann ich das zurückgeben?", "fr": "Puis-je retourner ceci?", "es": "¿Puedo devolver esto?", "it": "Posso restituirlo?", "tr": "Bunu iade edebilir miyim?", "ar": "هل يمكنني إرجاع هذا؟", "fa": "می‌توانم این را برگردانم؟", "zh-CN": "可以退货吗？", "ja": "これは返品できますか？" },
    { "tj": "Лутфан, ба ман чекро диҳед.", "ru": "Чек, пожалуйста.", "en": "The receipt, please.", "de": "Der Kassenbon, bitte.", "fr": "Le reçu, s'il vous plaît.", "es": "El recibo, por favor.", "it": "Lo scontrino, per favore.", "tr": "Fiş, lütfen.", "ar": "الإيصال، من فضلك.", "fa": "رسید، لطفا.", "zh-CN": "请给我收据。", "ja": "レシートをください。" },
    { "tj": "Шумо чанд соат кор мекунед? (Мағоза кай маҳкам мешавад?)", "ru": "До скольки вы работаете? (Когда закрывается магазин?)", "en": "What are your opening hours? (When does the shop close?)", "de": "Wie lange haben Sie geöffnet?", "fr": "Quelles sont vos heures d'ouverture?", "es": "¿Hasta qué hora работают?", "it": "Quali sono gli orari di apertura?", "tr": "Kaça kadar açıksınız?", "ar": "ما هي ساعات العمل؟", "fa": "ساعت کاری شما چیست؟", "zh-CN": "你们几点营业？（商店几点关门？）", "ja": "営業時間は何時までですか？" },
    { "tj": "Ин хеле гарон аст.", "ru": "Это очень дорого.", "en": "This is very expensive.", "de": "Das ist sehr teuer.", "fr": "C'est très cher.", "es": "Esto es muy caro.", "it": "Questo è molto caro.", "tr": "Bu çok pahalı.", "ar": "هذا غالي جداً.", "fa": "این خیلی گران است.", "zh-CN": "这个太贵了。", "ja": "これはとても高いです。" }
  ]
},
{
  "id": "at_the_restaurant",
  "title": {
    "tj": "Дар тарабхона", "ru": "В ресторане", "en": "At the restaurant",
    "de": "Im Restaurant", "fr": "Au restaurant",
    "es": "En el restaurante", "it": "Al ristorante", "tr": "Restoranda",
    "ar": "في المطعم", "fa": "در رستوران", "zh-CN": "在餐厅", "ja": "レストランで"
  },
  "phrases": [
    { "tj": "Барои ду нафар миз лозим аст.", "ru": "Столик на двоих, пожалуйста.", "en": "A table for two, please.", "de": "Einen Tisch für zwei Personen, bitte.", "fr": "Une table pour deux, s'il vous plaît.", "es": "Una mesa para dos, por favor.", "it": "Un tavolo per due, per favore.", "tr": "İki kişilik bir masa, lütfen.", "ar": "طاولة لشخصين، من فضلك.", "fa": "یک میز برای دو نفر، لطفا.", "zh-CN": "请给我一张两个人的 table。", "ja": "2人用の席をお願いします。" },
    { "tj": "Лутфан, менюро ба мо диҳед.", "ru": "Меню, пожалуйста.", "en": "The menu, please.", "de": "Die Speisekarte, bitte.", "fr": "Le menu, s'il vous plaît.", "es": "El menú, por favor.", "it": "Il menu, per favore.", "tr": "Menü, lütfen.", "ar": "القائمة، من فضلك.", "fa": "منو، لطفا.", "zh-CN": "请给我菜单。", "ja": "メニューをください。" },
    { "tj": "Хӯроки махсуси шумо кадом аст?", "ru": "Какое у вас фирменное блюдо?", "en": "What is your specialty?", "de": "Was ist Ihre Spezialität?", "fr": "Quelle о est votre spécialité?", "es": "¿Cuál es la especialidad de la casa?", "it": "Qual è la vostra specialità?", "tr": "Spesiyaliniz nedir?", "ar": "ما هو طبقكم المميز؟", "fa": "غذای مخصوص شما چیست؟", "zh-CN": "你们招牌菜是什么？", "ja": "おすすめ料理は何ですか？" },
    { "tj": "Шумо чиро тавсия медиҳед?", "ru": "Что вы рекомендуете?", "en": "What do you recommend?", "de": "Was empfehlen Sie?", "fr": "Que recommandez-vous?", "es": "¿Qué me recomienda?", "it": "Cosa mi consiglia?", "tr": "Ne tavsiye edersiniz?", "ar": "ماذا توصي؟", "fa": "شما چه چیزی را توصیه می‌کنید؟", "zh-CN": "你推荐什么？", "ja": "何がおすすめですか？" },
    { "tj": "Ман омодаам фармоиш диҳам.", "ru": "Я готов сделать заказ.", "en": "I am ready to order.", "de": "Ich bin bereit zu bestellen.", "fr": "Je suis prêt à commander.", "es": "Estoy listo para ordenar.", "it": "Sono pronto per ordinare.", "tr": "Sipariş vermeye hazırım.", "ar": "أنا جاهز للطلب.", "fa": "من آماده سفارش هستم.", "zh-CN": "我准备好点菜了。", "ja": "注文をお願いします。" },
    { "tj": "Ман ин хӯрокро мегирам.", "ru": "Я возьму это блюдо.", "en": "I will take this dish.", "de": "Ich nehme dieses Gericht.", "fr": "Je vais prendre ce plat.", "es": "Tomaré este plato.", "it": "Prenderò questo piatto.", "tr": "Bu yemeği alacağım.", "ar": "سآخذ هذا الطبق.", "fa": "من این غذا را می‌خواهم.", "zh-CN": "我要点这个菜。", "ja": "これにします。" },
    { "tj": "Лутфан, ба ман як коса шӯрбо оред.", "ru": "Принесите мне тарелку супа, пожалуйста.", "en": "Bring me a bowl of soup, please.", "de": "Bringen Sie mir bitte einen Teller Suppe.", "fr": "Apportez-moi un bol de soupe, s'il vous plaît.", "es": "Traiga un plato de sopa, por favor.", "it": "Mi porti un piatto di zuppa, per favore.", "tr": "Bir kase çorba getirebilir misiniz, lütfen?", "ar": "احضر لي حساءً، من فضلك.", "fa": "لطفا برای من یک کاسه سوپ بیاورید.", "zh-CN": "请给我来碗汤。", "ja": "スープを一杯ください。" },
    { "tj": "Оё шумо хӯрокҳои гиёҳхорӣ доред?", "ru": "У вас есть вегетарианские блюда?", "en": "Do you have vegetarian dishes?", "de": "Haben Sie vegetarische Gerichte?", "fr": "Avez-vous des plats végétariens?", "es": "¿Tienen platos vegetarianos?", "it": "Avete piatti vegetariani?", "tr": "Vejetaryen yemekleriniz var mı?", "ar": "هل لديكم أطباق نباتية؟", "fa": "آیا غذای گیاهی دارید؟", "zh-CN": "你们有素食吗？", "ja": "ベジタリアン向けの料理はありますか？" },
    { "tj": "Барои ман як шиша об, лутфан.", "ru": "Бутылку воды, пожалуйста.", "en": "A bottle of water, please.", "de": "Eine Flasche Wasser, bitte.", "fr": "Une bouteille d'eau, s'il vous plaît.", "es": "Una botella de agua, por favor.", "it": "Una bottiglia d'acqua, per favore.", "tr": "Bir şişe su, lütfen.", "ar": "زجاجة ماء، من فضلك.", "fa": "یک بطری آب، لطفا.", "zh-CN": "请给我一瓶水。", "ja": "お水を一本ください。" },
    { "tj": "Нӯшокиҳо кадомҳоянд?", "ru": "Какие у вас есть напитки?", "en": "What drinks do you have?", "de": "Welche Getränke haben Sie?", "fr": "Quelles boissons avez-vous?", "es": "¿Qué bebidas tienen?", "it": "Che bevande avete?", "tr": "Hangi içecekleriniz var?", "ar": "ما هي المشروبات التي لديكم؟", "fa": "چه نوشیدنی‌هایی دارید؟", "zh-CN": "有什么饮料？", "ja": "飲み物は何がありますか？" },
    { "tj": "Хӯрок хеле болаззат аст!", "ru": "Еда очень вкусная!", "en": "The food is very delicious!", "de": "Das Essen ist sehr lecker!", "fr": "La nourriture est très délicieuse!", "es": "¡La comida está muy deliciosa!", "it": "Il cibo è delizioso!", "tr": "Yemek çok lezzetli!", "ar": "الطعام لديد جداً!", "fa": "غذا بسیار لذیذ است!", "zh-CN": "这菜真好吃！", "ja": "料理がとても美味しいです！" },
    { "tj": "Ин хӯрок хунук аст.", "ru": "Это блюдо холодное.", "en": "This dish is cold.", "de": "Dieses Gericht ist kalt.", "fr": "Ce plat est froid.", "es": "Este plato está frío.", "it": "Questo piatto è freddo.", "tr": "Bu yemek soğuk.", "ar": "هذا الطبق بارد.", "fa": "این غذا سرد است.", "zh-CN": "这个菜凉了。", "ja": "この料理は冷めています。" },
    { "tj": "Лутфан, ҳисобро биёред.", "ru": "Счет, пожалуйста.", "en": "The bill, please.", "de": "Die Rechnung, bitte.", "fr": "L'addition, s'il vous plaît.", "es": "La cuenta, por favor.", "it": "Il conto, per favore.", "tr": "Hesap, lütfen.", "ar": "الفاتورة، من فضلك.", "fa": "صورتحساب، لطفا.", "zh-CN": "请結帳。", "ja": "お会計をお願いします。" },
    { "tj": "Оё бо корт пардохт кардан мумкин аст?", "ru": "Можно оплатить картой?", "en": "Can I pay by card?", "de": "Kann ich mit Karte bezahlen?", "fr": "Puis-je payer par carte?", "es": "¿Puedo pagar con tarjeta?", "it": "Posso pagare con la carta?", "tr": "Kredi kartıyla ödeyebilir miyim?", "ar": "هل يمكنني الدفع بالبطاقة؟", "fa": "می‌توانم با کارت پرداخت کنم؟", "zh-CN": "可以刷卡吗？", "ja": "カードで払えますか？" },
    { "tj": "Бақияашро нигоҳ доред (инпули чойпулӣ).", "ru": "Сдачи не надо (оставьте сдачу себе).", "en": "Keep the change.", "de": "Stimmt so.", "fr": "Gardez la monnaie.", "es": "Quédese con el cambio.", "it": "Tenga il resto.", "tr": "Üstü kalsın.", "ar": "احتفظ بالباقي.", "fa": "باقی پول для خودتان.", "zh-CN": "不用找零了。", "ja": "お釣りはとっておいてください。" }
  ]
},
{
  "id": "at_the_hotel",
  "title": {
    "tj": "Дар меҳмонхона", "ru": "В гостинице", "en": "At the hotel",
    "de": "Im Hotel", "fr": "À l'hôtel",
    "es": "En el hotel", "it": "In hotel", "tr": "Otelde",
    "ar": "في الفندق", "fa": "در هتل", "zh-CN": "在酒店", "ja": "ホテルで"
  },
  "phrases": [
    { "tj": "Ман ҳуҷра банд карда будам.", "ru": "Я забронировал номер.", "en": "I have a reservation.", "de": "Ich habe eine Reservierung.", "fr": "J'ai une réservation.", "es": "Tengo una reserva.", "it": "Ho una prenotazione.", "tr": "Резervasyonum var.", "ar": "لدي حجز.", "fa": "من اتاق رزرو کرده‌ام.", "zh-CN": "我预订了房间。", "ja": "予約しています。" },
    { "tj": "Оё ҳуҷраҳои холӣ доред?", "ru": "У вас есть свободные номера?", "en": "Do you have any vacancies?", "de": "Haben Sie freie Zimmer?", "fr": "Avez-vous des chambres libres?", "es": "¿Tienen habitaciones libres?", "it": "Avete camere libere?", "tr": "Boş odanız var mı?", "ar": "هل لديكم غرف شاغرة؟", "fa": "آیا اتاق خالی دارید؟", "zh-CN": "你们还有 vacancy 空房吗？", "ja": "空いている部屋はありますか？" },
    { "tj": "Ман мехоҳам як ҳуҷра барои ду нафар банд кунам.", "ru": "Я бы хотел забронировать двухместный номер.", "en": "I would like to book a double room.", "de": "Ich möchte ein Doppelzimmer buchen.", "fr": "Je voudrais réserver une chambre double.", "es": "Me gustaría reservar una habitación doble.", "it": "Vorrei prenotare una camera doppia.", "tr": "İki kişilik bir oda rezerve etmek istiyorum.", "ar": "أود حجز غرفة لشخصين.", "fa": "من می‌خواهم یک اتاق دو نفره رزرو کنم.", "zh-CN": "我想订一间双人房。", "ja": "ツインの部屋を予約したいです。" },
    { "tj": "Нархи як шаб чанд пул аст?", "ru": "Сколько стоит одна ночь?", "en": "How much is it per night?", "de": "Wie viel kostet es pro Nacht?", "fr": "Combien ça coûte par nuit?", "es": "¿Cuánto cuesta por noche?", "it": "Quanto costa per una notte?", "tr": "Gecelik fiyatı ne kadar?", "ar": "كم سعر الليلة الواحدة؟", "fa": "قیمت هر شب چقدر است؟", "zh-CN": "住一晚多少钱？", "ja": "一泊いくらですか？" },
    { "tj": "Оё субҳона ба нарх дохил мешавад?", "ru": "Завтрак включен в стоимость?", "en": "Is breakfast included?", "de": "Ist das Frühstück inklusive?", "fr": "Le petit-déjeuner est-il inclus?", "es": "¿El desayuno está incluido?", "it": "La colazione è inclusa?", "tr": "Kahvaltı dahil mi?", "ar": "هل الإفطار مشمول؟", "fa": "آیا صبحانه شامل قیمت می‌شود؟", "zh-CN": "早餐包含在费用里吗？", "ja": "朝食は含まれていますか？" },
    { "tj": "Вақти бақайдгирӣ (регистрация) кай аст?", "ru": "Во сколько заселение (check-in)?", "en": "What time is check-in?", "de": "Wann ist der Check-in?", "fr": "À quelle heure est le check-in?", "es": "¿A qué hora es el registro de entrada?", "it": "A che ora si fa il check-in?", "tr": "Giriş saati kaçta?", "ar": "ما هو وقت تسجيل الدخول؟", "fa": "ساعت تحویل گرفتن اتاق کی است؟", "zh-CN": "几点可以办理入住？", "ja": "チェックインは何時ですか？" },
    { "tj": "Калиди ман, лутфан.", "ru": "Мой ключ, пожалуйста.", "en": "My key, please.", "de": "Mein Schlüssel, bitte.", "fr": "Ma clé, s'il vous plaît.", "es": "Mi llave, por favor.", "it": "La mia chiave, per favore.", "tr": "Anahtarım, lütfen.", "ar": "مفتاحي، من فضلك.", "fa": "کلید من، لطفا.", "zh-CN": "请给我钥匙。", "ja": "鍵をください。" },
    { "tj": "Ҳуҷраи ман дар кадом ошёна аст?", "ru": "На каком этаже мой номер?", "en": "Which floor is my room on?", "de": "Auf welchem Stockwerk ist mein Zimmer?", "fr": "À quel étage est ma chambre?", "es": "¿En qué piso está mi habitación?", "it": "A che piano è la mia camera?", "tr": "Odam kaçıncı katta?", "ar": "في أي طابق غرفتي؟", "fa": "اتاق من در کدام طبقه است؟", "zh-CN": "我的房间在几楼？", "ja": "私の部屋は何階ですか？" },
    { "tj": "Рамзи Wi-Fi чист?", "ru": "Какой пароль от Wi-Fi?", "en": "What is the Wi-Fi password?", "de": "Wie lautet das Wi-Fi-Passwort?", "fr": "Quel est le mot de passe du Wi-Fi?", "es": "¿Cuál es la contraseña del Wi-Fi?", "it": "Qual è la password del Wi-Fi?", "tr": "Wi-Fi şifresi nedir?", "ar": "ما هي كلمة مرور الواي فاي؟", "fa": "رمز وای‌فای چیست؟", "zh-CN": "Wi-Fi密码是多少？", "ja": "Wi-Fiのパスワードは何ですか？" },
    { "tj": "Дар ҳуҷраи ман оби гарм нест.", "ru": "В моем номере нет горячей воды.", "en": "There is no hot water in my room.", "de": "In meinem Zimmer gibt es kein warmes Wasser.", "fr": "Il n'y a pas d'eau chaude dans ma chambre.", "es": "No hay agua caliente en mi habitación.", "it": "Non c'è acqua calda nella mia camera.", "tr": "Odamda sıcak su yok.", "ar": "لا يوجد ماء ساخن في غرفتي.", "fa": "در اتاق من آب گرم نیست.", "zh-CN": "我的房间里没有热水。", "ja": "部屋のお湯が出ません。" },
    { "tj": "Лутфан ҳуҷраи маро тоза кунед.", "ru": "Пожалуйста, уберите в моем номере.", "en": "Please clean my room.", "de": "Bitte reinigen Sie mein Zimmer.", "fr": "S'il vous plaît, nettoyez ma chambre.", "es": "Por favor, limpie mi habitación.", "it": "Per favore, pulisca la mia camera.", "tr": "Lütfen odamı temizleyin.", "ar": "رجاءً نظف غرفتي.", "fa": "لطفا اتاق مرا تمیز کنید.", "zh-CN": "请打扫一下 my房间。", "ja": "部屋の掃除をお願いします。" },
    { "tj": "Оё ман метавонам ҷомадонҳоямро дар ин ҷо гузорам?", "ru": "Могу ли я оставить здесь свои чемоданы?", "en": "Can I leave my luggage here?", "de": "Kann ich mein Gepäck hier lassen?", "fr": "Puis-je laisser mes bagages ici?", "es": "¿Puedo dejar mi equipaje aquí?", "it": "Posso lasciare qui i miei bagagli?", "tr": "Bagajımı burada bırakabilir miyim?", "ar": "هل يمكنني ترك أمتعتي هنا؟", "fa": "می‌توانم چمدان‌هایم را اینجا بگذارم؟", "zh-CN": "我可以把行李寄存在这里吗？", "ja": "ここに荷物を預けられますか？" },
    { "tj": "Ман мехоҳам як такси фармоиш диҳам.", "ru": "Я бы хотел вызвать такси.", "en": "I would like to call a taxi.", "de": "Ich möchte ein Taxi rufen.", "fr": "Je voudrais appeler un taxi.", "es": "Me gustaría pedir un taxi.", "it": "Vorrei chiamare un taxi.", "tr": "Bir taksi çağırmak istiyorum.", "ar": "أود استدعاء سيارة أجرة.", "fa": "من می‌خواهم یک تاکسی بگیرم.", "zh-CN": "我想叫辆出租车。", "ja": "タクシーを呼んでいただけますか？" },
    { "tj": "Соати чанд бояд ҳуҷраро супорам (check-out)?", "ru": "Во сколько выезд (check-out)?", "en": "What time is check-out?", "de": "Wann ist der Check-out?", "fr": "À quelle heure est le check-out?", "es": "¿A qué hora es la salida?", "it": "A che ora si fa il check-out?", "tr": "Çıkış saati kaçta?", "ar": "ما هو وقت تسجيل المغادرة؟", "fa": "ساعت تخلیه اتاق کی است؟", "zh-CN": "退房时间是几点？", "ja": "チェックアウトは何時ですか？" },
    { "tj": "Саёҳати мо хеле хуб гузашт, ташаккур!", "ru": "У нас был отличный отдых, спасибо!", "en": "We had a great stay, thank you!", "de": "Wir hatten einen tollen Aufenthalt, danke!", "fr": "Nous avons passé un excellent séjour, merci!", "es": "¡Tuvimos una gran estancia, gracias!", "it": "Abbiamo avuto un soggiorno fantastico, grazie!", "tr": "Harika bir konaklama geçirdik, teşekkürler!", "ar": "لقد كانت إقامة رائعة، شكراً لك!", "fa": "اقامت بسیار خوبی داشتیم، ممنون!", "zh-CN": "我们住得很愉快，谢谢！", "ja": "素晴らしい滞在でした、ありがとう！" }
  ]
},
{
  "id": "at_the_airport",
  "title": {
    "tj": "Дар фурудгоҳ", "ru": "В аэропорту", "en": "At the airport",
    "de": "Am Flughafen", "fr": "À l'aéroport",
    "es": "En el aeropuerto", "it": "In aeroporto", "tr": "Havalimanında",
    "ar": "في المطار", "fa": "در فرودگاه", "zh-CN": "在机场", "ja": "空港で"
  },
  "phrases": [
    { "tj": "Бақайдгирии парвоз дар куҷост?", "ru": "Где проходит регистрация на рейс?", "en": "Where is the flight check-in?", "de": "Wo ist самара Check-in für den Flug?", "fr": "Où se fait l'enregistrement du vol?", "es": "¿Dónde está el mostrador de facturación?", "it": "Dov'è il check-in del volo?", "tr": "Uçuş kaydı (check-in) nerede?", "ar": "أين يتم تسجيل الوصول للرحلة؟", "fa": "پذیرش پرواز کجاست؟", "zh-CN": "航班登机手续在哪里办理？", "ja": "搭乗手続きはどこですか？" },
    { "tj": "Лутфан, шиноснома ва чиптаатонро диҳед.", "ru": "Пожалуйста, ваш паспорт и билет.", "en": "Your passport and ticket, please.", "de": "Ihren Reisepass und Ihr Ticket, bitte.", "fr": "Votre passeport et votre billet, s'il vous plaît.", "es": "Su pasaporte y billete, por favor.", "it": "Il passaporto e il biglietto, per favore.", "tr": "Pasaportunuz ve biletiniz, lütfen.", "ar": "جواز سفرك وتذكرتك، من فضلك.", "fa": "لطفاً پاسپورت و بلیط خود را بدهید.", "zh-CN": "请出示您的护照和机票。", "ja": "パスポートと航空券をお願いします。" },
    { "tj": "Ин ҷомадони ман аст.", "ru": "Это мой чемодан.", "en": "This is my suitcase.", "de": "Das ist mein Koffer.", "fr": "C'est ma valise.", "es": "Esta es mi maleta.", "it": "Questa è la mia valigia.", "tr": "Bu benim bavulum.", "ar": "هذه حقيبتي.", "fa": "این چمدان من است.", "zh-CN": "这是我的行李箱。", "ja": "これは私のスーツケースです。" },
    { "tj": "Оё ман метавонам инро ҳамчун бори дастӣ гирам?", "ru": "Могу ли я взять это как ручную кладь?", "en": "Can I take this as hand luggage?", "de": "Kann ich das als Handgepäck mitnehmen?", "fr": "Puis-je prendre cela comme bagage à main?", "es": "¿Puedo llevar esto como equipaje de mano?", "it": "Posso portarlo como bagaglio a mano?", "tr": "Bunu el bagajı olarak alabilir miyim?", "ar": "هل يمكنني أخذ هذا كحقيبة يد؟", "fa": "می‌توانم این را به عنوان بار دستی ببرم؟", "zh-CN": "我可以把这个当作手提行李吗？", "ja": "これを機内持ち込み手荷物にできますか？" },
    { "tj": "Калиди нишаст (чиптаи нишаст) дар куҷост?", "ru": "Где мой посадочный талон?", "en": "Where is my boarding pass?", "de": "Wo ist meine Bordkarte?", "fr": "Où est ma carte d'embarquement?", "es": "¿Dónde está mi tarjeta de embarque?", "it": "Dov'è la mia carta d'imbarco?", "tr": "Biniş kartım nerede?", "ar": "أين بطاقة صعود الطائرة الخاصة بي؟", "fa": "کارت پرواز من کجاست؟", "zh-CN": "我的登机牌在哪里？", "ja": "搭乗券はどこですか？" },
    { "tj": "Дарвозаи (Gate) парвози ман чанд аст?", "ru": "Какой выход (выход на посадку) у моего рейса?", "en": "Which gate is my flight leaving from?", "de": "An welchem Gate fliegt mein Flug ab?", "fr": "De quelle porte part mon vol?", "es": "¿De qué puerta sale mi vuelo?", "it": "Da quale gate parte il mio volo?", "tr": "Uçağım hangi kapıdan kalkıyor?", "ar": "من أي بوابة تغادر رحلتي؟", "fa": "پرواز من از کدام دروازه حرکت می‌کند؟", "zh-CN": " my航班在哪个登机口？", "ja": "私の飛行機は何番ゲートから出発しますか？" },
    { "tj": "Оё парвоз ба таъхир афтод?", "ru": "Рейс задерживается?", "en": "Is the flight delayed?", "de": "Hat der Flug Verspätung?", "fr": "Le vol est-il retardé?", "es": "¿Му се ha retrasado el vuelo?", "it": "Il volo è in ritardo?", "tr": "Uçuş ertelendi mi?", "ar": "هل تأخرت الرحلة؟", "fa": "آیا پرواز تاخیر دارد؟", "zh-CN": "航班延误了吗？", "ja": "飛行機は遅れていますか？" },
    { "tj": "Парвоз бекор карда шуд.", "ru": "Рейс отменен.", "en": "The flight is canceled.", "de": "Der Flug wurde annulliert.", "fr": "Le vol est annulé.", "es": "El vuelo está cancelado.", "it": "Il volo è cancellato.", "tr": "Uçuş iptal edildi.", "ar": "تم إلغاء الرحلة.", "fa": "پرواز لغو شده است.", "zh-CN": "航班取消了。", "ja": "飛行機は欠航になりました。" },
    { "tj": "Назорати шиносоӣ дар куҷост?", "ru": "Где паспортный контроль?", "en": "Where is passport control?", "de": "Wo ist die Passkontrolle?", "fr": "Où est le contrôle des passeports?", "es": "¿Dónde está el control de pasaportes?", "it": "Dov'è il controllo passaporti?", "tr": "Pasaport kontrolü nerede?", "ar": "أين هو مراقبة الجوازات؟", "fa": "کنترل پاسپورت کجاست؟", "zh-CN": "护照檢查处在哪里？", "ja": "出国審査はどこですか？" },
    { "tj": "Ҷойи нишасти ман дар канори тиреза аст.", "ru": "Мое место у окна.", "en": "My seat is by the window.", "de": "Mein Platz ist am Fenster.", "fr": "Mon siège est côté fenêtre.", "es": "Mi asiento está al lado de la ventana.", "it": "Il mio posto è vicino al finestrino.", "tr": "Koltuğum pencere kenarında.", "ar": "مقعدي بجانب النافذة.", "fa": "صندلی من کنار پنجره است.", "zh-CN": "我的座位靠窗。", "ja": "私の席は窓側です。" },
    { "tj": "Барои амният камарбандҳоро бандед.", "ru": "Пожалуйста, пристегните ремни безопасности.", "en": "Please fasten your seatbelts.", "de": "Bitte schnallen Sie sich an.", "fr": "Veuillez attacher votre ceinture de sécurité.", "es": "Por favor, abróchense los cinturones.", "it": "Allacciate le cinture di sicurezza, per favore.", "tr": "Lütfen emniyet kemerlerinizi bağlayın.", "ar": "يرجى ربط أحزمة الأمان.", "fa": "لطفاً کمربندهای ایمنی خود را ببندید.", "zh-CN": "请 code系好安全带。", "ja": "シートベルトをお締めください。" },
    { "tj": "Ҷойи гирифтани бағоҷ дар куҷост?", "ru": "Где выдача багажа?", "en": "Where is the baggage claim?", "de": "Wo ist die Gepäckausgabe?", "fr": "Où est la livraison des bagages?", "es": "¿Dónde está la recogida de equipajes?", "it": "Dov'è il ritiro bagagli?", "tr": "Bagaj alım yeri nerede?", "ar": "أين منطقة استلام الأمتعة؟", "fa": "محل تحویل بار کجاست؟", "zh-CN": "行李领取处在哪里？", "ja": "手荷物受取所はどこですか？" },
    { "tj": "Ман бағоҷамро гум кардам.", "ru": "Я потерял свой багаж.", "en": "I lost my luggage.", "de": "Ich habe mein Gepäck verloren.", "fr": "J'ai perdu mes bagages.", "es": "He perdido mi equipaje.", "it": "Ho perso il mio bagaglio.", "tr": "Bagajımı kaybettim.", "ar": "لقد فقدت أمتعتي.", "fa": "من بار خود را گم کرده‌ام.", "zh-CN": "我丢了行李。", "ja": "荷物を紛失しました。" },
    { "tj": "Мағозаи бебоҷ (Duty Free) дар куҷост?", "ru": "Где находится магазин дьюти-фри?", "en": "Where is the duty-free shop?", "de": "Wo ist der Duty-Free-Shop?", "fr": "Où est la boutique hors taxes?", "es": "¿Dónde está la tienda libre de impuestos?", "it": "Dov'è il duty-free?", "tr": "Duty-free mağazası nerede?", "ar": "أين هو السوق الحرة؟", "fa": "فروشگاه بدون مالیات کجاست؟", "zh-CN": "免税店在哪里？", "ja": "免税店はどこですか？" },
    { "tj": "Парвози хуш дошта бошед!", "ru": "Приятного полета!", "en": "Have a nice flight!", "de": "Guten Flug!", "fr": "Bon vol!", "es": "¡Buen viaje!", "it": "Buon volo!", "tr": "İyi uçuşlar!", "ar": "رحلة سعيدة!", "fa": "پرواز خوبی داشته باشید!", "zh-CN": "祝您 cells飞行愉快！", "ja": "良い空の旅を！" }
  ]
},
{
  "id": "at_the_university",
  "title": {
    "tj": "Дар донишгоҳ", "ru": "В университете", "en": "At the university",
    "de": "In der Universität", "fr": "À l'université",
    "es": "En la universidad", "it": "All'università", "tr": "Üniversitede",
    "ar": "في الجامعة", "fa": "در دانشگاه", "zh-CN": "在大学", "ja": "大学で"
  },
  "phrases": [
    { "tj": "Факултаи шумо кадом аст?", "ru": "На каком факультете вы учитесь?", "en": "Which faculty are you in?", "de": "An welcher Fakultät sind Sie?", "fr": "Dans quelle faculté êtes-vous ?", "es": "¿En qué facultad estás?", "it": "In quale facoltà sei?", "tr": "Hangi fakültedesiniz?", "ar": "في أي كلية أنت؟", "fa": "دانشکده شما کدام است؟", "zh-CN": "你在哪个学院？", "ja": "学部は何ですか？" },
    { "tj": "Лексияи (дарси) навбатӣ дар куҷост?", "ru": "Где проходит следующая лекция?", "en": "Where is the next lecture?", "de": "Wo ist die nächste Vorlesung?", "fr": "Où est le prochain cours ?", "es": "¿Dónde es la próxima conferencia?", "it": "Dov'è la prossima lezione?", "tr": "Bir sonraki ders nerede?", "ar": "أين المحاضرة القادمة؟", "fa": "کلاس بعدی کجاست؟", "zh-CN": "下一节课在哪上？", "ja": "次の講義はどこですか？" },
    { "tj": "Ҷадвали дарсҳоро аз куҷо ёбам?", "ru": "Где я могу найти расписание занятий?", "en": "Where can I find the class schedule?", "de": "Wo finde ich den Stundenplan?", "fr": "Où puis-je trouver l'emploi du temps ?", "es": "¿Dónde puedo encontrar el horario de clases?", "it": "Dove posso trovare l'orario delle lezioni?", "tr": "Ders programını nerede bulabilirim?", "ar": "أين يمكنني العثور على جدول الحصص؟", "fa": "برنامه کلاس‌ها را از کجا پیدا کنم؟", "zh-CN": "我在哪里可以找到课程表？", "ja": "時間割はどこで見られますか？" },
    { "tj": "Ман барои имтиҳон омода шуда истодаам.", "ru": "Я готовлюсь к экзамену.", "en": "I am preparing for an exam.", "de": "Ich bereite mich auf eine Prüfung vor.", "fr": "Je me prépare pour un examen.", "es": "Me estoy preparando para un examen.", "it": "Mi sto preparando per un esame.", "tr": "Sınava hazırlanıyorum.", "ar": "أنا أستعد للامتحان.", "fa": "من دارم برای امتحان آماده می‌شوم.", "zh-CN": "我正在准备考试。", "ja": "試験の準備をしています。" },
    { "tj": "Деканат (дафтари факулта) дар куҷост?", "ru": "Где находится деканат?", "en": "Where is the dean's office?", "de": "Wo ist das Dekanat?", "fr": "Où est le bureau du doyen ?", "es": "¿Dónde está el decanato?", "it": "Dov'è la presidenza?", "tr": "Dekanlık nerede?", "ar": "أين يقع مكتب العميد؟", "fa": "دفتر رئیس دانشکده (آموزش) کجاست؟", "zh-CN": "学院办公室在哪里？", "ja": "学部長室はどこですか？" },
    { "tj": "Оё ман метавонам стипендия гирам?", "ru": "Могу ли я получать стипендию?", "en": "Can I get a scholarship?", "de": "Kann ich ein Stipendium bekommen?", "fr": "Puis-je obtenir une bourse ?", "es": "¿Puedo obtener una beca?", "it": "Posso ottenere una borsa di studio?", "tr": "Burs alabilir miyim?", "ar": "هل يمكنني الحصول على منحة دراسية؟", "fa": "آیا می‌توانم بورسیه تحصیلی بگیرم؟", "zh-CN": "我可以申请奖学金吗？", "ja": "奨学金をもらうことはできますか？" },
    { "tj": "Ман бояд кори курсиро супорам.", "ru": "Мне нужно сдать курсовую работу.", "en": "I need to submit my term paper.", "de": "Ich muss meine Hausarbeit abgeben.", "fr": "Je dois rendre mon mémoire.", "es": "Tengo que entregar mi trabajo de curso.", "it": "Devo consegnare la tesina.", "tr": "Dönem ödevimi teslim etmem gerekiyor.", "ar": "أحتاج إلى تقديم ورقة البحث الخاصة بي.", "fa": "من باید پایان‌نامه (پروژه) خودم را تحویل دهم.", "zh-CN": "我需要提交学期论文。", "ja": "レポートを提出する必要があります。" },
    { "tj": "Устоди илмии ман кист?", "ru": "Кто мой научный руководитель?", "en": "Who is my academic advisor?", "de": "Wer ist mein wissenschaftlicher Betreuer?", "fr": "Qui est mi tuteur académique ?", "es": "¿Quién es mi supervisor académico?", "it": "Chi è il mio relatore?", "tr": "Tez danışmanım kim?", "ar": "من هو مشروفي الأكاديمي؟", "fa": "استاد راهنمای من کیست؟", "zh-CN": "我的导师是谁？", "ja": "私の指導教官は誰ですか？" },
    { "tj": "Кафедраи забонҳо дар кадом ошёна аст?", "ru": "На каком этаже кафедра языков?", "en": "Which floor is the language department on?", "de": "Auf welchem Stockwerk ist das Spracheninstitut?", "fr": "À quel étage est le département de langues ?", "es": "¿En qué piso está el departamento de idiomas?", "it": "A che piano è il dipartimento di lingue?", "tr": "Dil bölümü kaçıncı katta?", "ar": "في أي طابق قسم اللغات؟", "fa": "دپارتمان زبان در کدام طبقه است؟", "zh-CN": "语言系在几楼？", "ja": "語学学科は何階ですか？" },
    { "tj": "Ман мехоҳам ба китобхонаи донишгоҳ аъзо шавам.", "ru": "Я хочу записаться в университетскую библиотеку.", "en": "I want to join the university library.", "de": "Ich möchte mich in der Universitätsbibliothek anmelden.", "fr": "Je veux m'inscrire à la bibliothèque universitaire.", "es": "Quiero inscribirme en la biblioteca universitaria.", "it": "Voglio iscrivermi alla biblioteca universitaria.", "tr": "Üniversite kütüphanesine üye olmak istiyorum.", "ar": "أريد الانضمام إلى مكتبة الجامعة.", "fa": "می‌خواهم در کتابخانه دانشگاه عضو شوم.", "zh-CN": "我想办理大学图书馆借阅证。", "ja": "大学の図書館カードを作りたいです。" },
    { "tj": "Ошхонаи донишгоҳ дар куҷост?", "ru": "Где находится университетская столовая?", "en": "Where is the university canteen?", "de": "Wo ist die Mensa der Universität?", "fr": "Où est la cantine universitaire ?", "es": "¿Dónde está la cafetería de la universidad?", "it": "Dov'è la mensa universitaria?", "tr": "Üniversite yemekhanesi nerede?", "ar": "أين يقع مقصف الجامعة؟", "fa": "سلف (غذاخوری) دانشگاه کجاست؟", "zh-CN": "学校食堂在哪里？", "ja": "大学の食堂はどこですか？" },
    { "tj": "Ин кори илмӣ хеле аҷиб аст.", "ru": "Эта научная работа очень интересная.", "en": "This research paper is very interesting.", "de": "Diese Forschungsarbeit ist sehr interessant.", "fr": "Ce travail de recherche est très intéressant.", "es": "Este trabajo de investigación es muy interesante.", "it": "Questo lavoro di ricerca è molto interessante.", "tr": "Bu araştırma makalesi çok ilginç.", "ar": "هذه الورقة البحثية مثيرة للاهتمام للغاية.", "fa": "این مقاله پژوهشی بسیار جالب است.", "zh-CN": "这篇研究论文非常有趣。", "ja": "この研究論文はとても興味深いです。" },
    { "tj": "Вақти супоридани санҷишҳо кай сар мешавад?", "ru": "Когда начинается зачетная неделя?", "en": "When does the exam week start?", "de": "Wann beginnt die Prüfungswoche?", "fr": "Quand commence la semaine des examens ?", "es": "¿Cuándo empieza la semana de exámenes?", "it": "Quando comincia la settimana degli esami?", "tr": "Sınav haftası ne zaman başlıyor?", "ar": "متى يبدأ أسبوع الامتحانات؟", "fa": "هفته امتحانات کی شروع می‌شود؟", "zh-CN": "考试周什么时候开始？", "ja": "試験期間はいつから始まりますか？" },
    { "tj": "Ман соҳиби дипломи донишгоҳ шудам.", "ru": "Я получил диплом университета.", "en": "I received my university degree.", "de": "Ich habe meinen Universitätsabschluss erhalten.", "fr": "J'ai obtenu mon diplôme universitaire.", "es": "Recibí mi título universitario.", "it": "Ho conseguirto la laurea.", "tr": "Üniversite diplomamı aldım.", "ar": "لقد حصلت على شهادتي الجامعية.", "fa": "من مدرک دانشگاهی‌ام را گرفتم.", "zh-CN": "我拿到大学毕业证了。", "ja": "大学の学位を取得しました。" },
    { "tj": "Ба ҳамаи донишҷӯён муваффақият хоҳонам!", "ru": "Желаю всем студентам успехов!", "en": "I wish all students success!", "de": "Ich wünsche allen Studenten viel Erfolg!", "fr": "Je souhaite du succès à tous les étudiants !", "es": "¡Les deseo éxito a todos los estudiantes!", "it": "Auguro successo a tutti gli studenti!", "tr": "Tüm öğrencilere başarılar dilerim!", "ar": "أتمنى لجميع الطلاب النجاح!", "fa": "برای همه دانشجویان آرزوی موفقیت دارم!", "zh-CN": "祝所有同学们学业有成！", "ja": "学生の皆さんの成功を祈っています！" }
  ]
},
{
  "id": "at_the_school",
  "title": {
    "tj": "Дар мактаб", "ru": "В школе", "en": "At the school",
    "de": "In der Schule", "fr": "À l'école",
    "es": "En la escuela", "it": "A scuola", "tr": "Okulda",
    "ar": "في المدرسة", "fa": "در مدرسه", "zh-CN": "在学校", "ja": "学校で"
  },
  "phrases": [
    { "tj": "Дар куҷо синфхонаи ман аст?", "ru": "Где моя классная комната?", "en": "Where is my classroom?", "de": "Wo ist mein Klassenzimmer?", "fr": "Où est ma classe ?", "es": "¿Dónde está mi aula?", "it": "Dov'è la mia aula?", "tr": "Sınıfım nerede?", "ar": "أين صفّي؟", "fa": "کلاس من کجاست؟", "zh-CN": "我的教室在哪里？", "ja": "私の教室はどこですか？" },
    { "tj": "Соати чанд дарс сар мешавад?", "ru": "Во сколько начинается урок?", "en": "What time does the class start?", "de": "Um wie viel Uhr beginnt der Unterricht?", "fr": "À quelle heure commence le cours ?", "es": "¿A qué hora empieza la clase?", "it": "A che ora comincia la lezione?", "tr": "Ders saat kaçta başlıyor?", "ar": "في أي وقت يبدأ الدرس؟", "fa": "کلاس چه ساعتی شروع می‌شود؟", "zh-CN": "几点上课？", "ja": "授業は何時に始まりますか？" },
    { "tj": "Муаллим дар куҷост?", "ru": "Где учитель?", "en": "Where is the teacher?", "de": "Wo ist der Lehrer?", "fr": "Où est le professeur ?", "es": "¿Dónde está el profesor?", "it": "Dov'è l'insegnante?", "tr": "Öğretmen nerede?", "ar": "أين المعلم؟", "fa": "معلم کجاست؟", "zh-CN": "老师在哪里？", "ja": "先生はどこですか？" },
    { "tj": "Ман вазифаи хонагиро иҷро кардам.", "ru": "Я сделал домашнее задание.", "en": "I have done my homework.", "de": "Ich habe meine Hausaufgaben gemacht.", "fr": "J'ai fait mes devoirs.", "es": "He hecho mi tarea.", "it": "Ho fatto i compiti.", "tr": "Ödevimi yaptım.", "ar": "لقد فعلت واجباتي المنزلية.", "fa": "من تکالیفم را انجام دادم.", "zh-CN": "我做完作业了。", "ja": "宿題をしました。" },
    { "tj": "Оё метавонам берун равам?", "ru": "Можно выйти?", "en": "May I go out?", "de": "Darf ich hinausgehen?", "fr": "Puis-je sortir ?", "es": "¿Puedo salir?", "it": "Posso uscire?", "tr": "Dışarı çıkabilir miyim?", "ar": "هل يمكنني الخروج؟", "fa": "آیا می‌توانم بیرون بروم؟", "zh-CN": "我可以出去吗？", "ja": "外に出てもいいですか？" },
    { "tj": "Ман ин мавзӯъро намефаҳмам.", "ru": "Я не понимаю эту тему.", "en": "I don't understand this topic.", "de": "Ich verstehe dieses Thema nicht.", "fr": "Je ne comprends pas ce sujet.", "es": "No entiendo este tema.", "it": "Non capisco questo argomento.", "tr": "Bu konuyu anlamıyorum.", "ar": "أنا لا أفهم هذا الموضوع.", "fa": "من این موضوع را نمی‌فهمم.", "zh-CN": "我不懂这个主题。", "ja": "このトピックがわかりません。" },
    { "tj": "Лутфан, инро бори дигар фаҳмонед.", "ru": "Пожалуйста, объясните это еще раз.", "en": "Please explain this again.", "de": "Bitte erklären Sie das noch einmal.", "fr": "Veuillez réexpliquer ceci, s'il vous plaît.", "es": "Por favor, explique esto de nuevo.", "it": "Per favore, spiega di nuovo questo.", "tr": "Lütfen bunu tekrar açıklayın.", "ar": "الرجاء شرح هذا مرة أخرى.", "fa": "لطفاً این را دوباره توضیح دهید.", "zh-CN": "请再解释一遍。", "ja": "もう一度説明してください。" },
    { "tj": "Оё шумо қалам ё дафтар доред?", "ru": "У вас есть ручка или тетрадь?", "en": "Do you have a pen or a notebook?", "de": "Haben Sie einen Stift oder ein Heft?", "fr": "Avez-vous un stylo ou un cahier ?", "es": "¿Tiene un bolígrafo o un cuaderno?", "it": "Hai una penna o un quaderno?", "tr": "Bir kalem veya defteriniz var mı?", "ar": "هل لديك قلم أو دفتر؟", "fa": "آیا خودکار یا دفتر دارید؟", "zh-CN": "你有笔或笔记本吗？", "ja": "ペンやノートはありますか？" },
    { "tj": "Имрӯз кадом фанҳо ҳастанд?", "ru": "Какие сегодня предметы?", "en": "What subjects do we have today?", "de": "Welche Fächer haben wir heute?", "fr": "Quelles matières avons-nous aujourd'hui ?", "es": "¿Qué asignaturas tenemos hoy?", "it": "Quali materie abbiamo oggi?", "tr": "Bugün hangi derslerimiz var?", "ar": "ما هي المواد التي لدينا اليوم؟", "fa": "امروز چه درس‌هایی داریم؟", "zh-CN": "今天有什么科目？", "ja": "今日は何の教科がありますか？" },
    { "tj": "Танаффус соати чанд аст?", "ru": "Во сколько перемена?", "en": "What time is the break?", "de": "Wann ist die Pause?", "fr": "À quelle heure est la récréation ?", "es": "¿A qué hora es el recreo?", "it": "A che ora è la ricreazione?", "tr": "Teneffüs saat kaçta?", "ar": "في أي وقت الاستراحة؟", "fa": "زنگ تفریح چه ساعتی است؟", "zh-CN": "几点休息？", "ja": "休み時間は何時ですか？" },
    { "tj": "Китобхона дар куҷост?", "ru": "Где библиотека?", "en": "Where is the library?", "de": "Wo ist die Bibliothek?", "fr": "Où est la bibliothèque ?", "es": "¿Dónde está la biblioteca?", "it": "Dov'è la biblioteca?", "tr": "Kütüphane nerede?", "ar": "أين المكتبة؟", "fa": "کتابخانه کجاست؟", "zh-CN": "图书馆在哪里？", "ja": "図書館はどこですか？" },
    { "tj": "Ман савол дорам.", "ru": "У меня есть вопрос.", "en": "I have a question.", "de": "Ich habe eine Frage.", "fr": "J'ai une question.", "es": "Tengo una pregunta.", "it": "Ho una domanda.", "tr": "Bir sorum var.", "ar": "عندي سؤال.", "fa": "من یک سوال دارم.", "zh-CN": "我有一个问题。", "ja": "質問があります。" },
    { "tj": "Имтиҳон кай аст?", "ru": "Когда экзамен?", "en": "When is the exam?", "de": "Wann ist die Prüfung?", "fr": "Quand est l'examen ?", "es": "¿Cuándo es el examen?", "it": "Quando è l'esame?", "tr": "Sınav ne zaman?", "ar": "متى الامتحان؟", "fa": "امتحان کی است؟", "zh-CN": "什么时候考试？", "ja": "試験はいつですか？" },
    { "tj": "Ман ба дарс дер кардам.", "ru": "Я опоздал на урок.", "en": "I am late for class.", "de": "Ich bin zu spät zum Unterricht.", "fr": "Je suis en retard pour le cours.", "es": "Llegué tarde a clase.", "it": "Sono in ritardo per la lezione.", "tr": "Derse geç kaldım.", "ar": "لقد تأخرت عن الدرس.", "fa": "من به کلاس دیر رسیدم.", "zh-CN": "我上课迟到了。", "ja": "授業に遅刻しました。" },
    { "tj": "Рӯзи хуш ба муаллим ва ҳамсинфон!", "ru": "Хорошего дня учителю и одноклассникам!", "en": "Have a nice day to the teacher and classmates!", "de": "Einen schönen Tag für Lehrer und Mitschüler!", "fr": "Bonne journée au professeur et aux camarades de classe !", "es": "¡Que tengan un buen día el profesor y los compañeros!", "it": "Buona giornata all'insegnante e ai compagni di classe !", "tr": "Öğretmene ve sınıf arkadaşlarına iyi günler!", "ar": "يوماً سعيداً للمعلم وزملاء الدراسة!", "fa": "روز خوبی برای معلم و همکلاسی‌ها!", "zh-CN": "祝老师和同学们今天愉快！", "ja": "先生とクラスメイトの皆さん、良い一日を！" }
  ]
},
{
  "id": "at_the_embassy",
  "title": {
    "tj": "Дар сафоратхона", "ru": "В посольстве", "en": "At the embassy",
    "de": "In der Botschaft", "fr": "À l'ambassade",
    "es": "En la embajada", "it": "In ambasciata", "tr": "Büyükelçilikte",
    "ar": "في السفارة", "fa": "در سفارتخانه", "zh-CN": "在大使馆", "ja": "大使館で"
  },
  "phrases": [
    { "tj": "Ман барои гирифтани раводид (виза) омадам.", "ru": "Я пришел для получения визы.", "en": "I came to get a visa.", "de": "Ich bin hier, um ein Visum zu beantragen.", "fr": "Je suis venu pour obtenir un visa.", "es": "Vine а obtener una visa.", "it": "Sono venuto per ottenere un visto.", "tr": "Vize almak için geldim.", "ar": "لقد جئت للحصول على تأشيرة.", "fa": "من برای گرفتن ویزا آمده‌ام.", "zh-CN": "我是来辦理签证的。", "ja": "ビザを取得しに来ました。" },
    { "tj": "Вақти қабули ман соати чанд аст?", "ru": "На какое время у меня назначена встреча?", "en": "What time is my appointment?", "de": "Um wie viel Uhr ist mein Termin?", "fr": "À quelle heure est mon rendez-vous?", "es": "¿A qué hora es mi cita?", "it": "A che ora è il mio appuntamento?", "tr": "Randevum saat kaçta?", "ar": "في أي وقت موعدي؟", "fa": "وقت ملاقات من چه ساعتی است؟", "zh-CN": "我的预约是几点？", "ja": "予約時間は何時ですか？" },
    { "tj": "Кадом ҳуҷҷатҳоро бояд пешниҳод кунам?", "ru": "Какие документы я должен предоставить?", "en": "What documents do I need to submit?", "de": "Welche Dokumente muss ich einreichen?", "fr": "Quels documents dois-je fournir?", "es": "¿Qué documentos debo presentar?", "it": "Quali documenti devo presentare?", "tr": "Hangi belgeleri teslim etmem gerekiyor?", "ar": "ما هي الوثائق التي يجب أن أقدمها؟", "fa": "چه مدارکی را باید ارائه دهم؟", "zh-CN": "我需要提交哪些材料？", "ja": "どの書類を提出する必要がありますか？" },
    { "tj": "Лутфан, варақаи дархостро (анкета) ба ман диҳед.", "ru": "Дайте мне, пожалуйста, анкету.", "en": "Please give me the application form.", "de": "Geben Sie mir bitte das Antragsformular.", "fr": "Donnez-moi le formulaire de demande, s'il vous plaît.", "es": "Por favor, deme el formulario de solicitud.", "it": "Per favore, mi dia il modulo di domanda.", "tr": "Lütfen bana başvuru formunu verin.", "ar": "يرجى إعطائي نموذج الطلب.", "fa": "لطفاً فرم درخواست را به من بدهید.", "zh-CN": "请给我一张申请表。", "ja": "申請用紙をください。" },
    { "tj": "Ин варақаро чӣ тавр бояд пур кард?", "ru": "Как правильно заполнить эту анкету?", "en": "How should I fill out this form?", "de": "Wie fülle ich dieses Formular aus?", "fr": "Comment dois-je remplir ce formulaire?", "es": "¿Cómo debo llenar este formulario?", "it": "Come devo compilare questo modulo?", "tr": "Bu formu nasıl doldurmalıyım?", "ar": "كيف يجب أن أملأ هذا النموذج؟", "fa": "این فرم را چگونه باید پر کرد؟", "zh-CN": "这张表格应该怎么 frontier填写？", "ja": "この用紙にはどのように記入すればいいですか？" },
    { "tj": "Пардохти консулӣ чанд пул аст?", "ru": "Сколько составляет консульский сбор?", "en": "How much is the consular fee?", "de": "Wie hoch ist die Konsulargebühr?", "fr": "À combien s'élèvent les frais consulaires?", "es": "¿Cuánto es la tasa consular?", "it": "A quanto ammonta la tassa consolare?", "tr": "Konsolosluk ücreti ne kadar?", "ar": "كم تبلغ الرسوم القنصلية؟", "fa": "هزینه کنسولی چقدر است؟", "zh-CN": "领事 visa费是多少？", "ja": "領事手数料はいくらですか？" },
    { "tj": "Ман бояд суҳбат (интервю) гузарам?", "ru": "Мне нужно проходить собеседование?", "en": "Do I need to pass an interview?", "de": "Muss ich zu einem Interview gehen?", "fr": "Dois-je passer un entretien?", "es": "¿Tengo que pasar una entrevista?", "it": "Devo fare un colloquio?", "tr": "Mülakata girmem gerekiyor mu?", "ar": "هل يجب أن أجرى مقابلة؟", "fa": "آیا باید مصاحبه شوم؟", "zh-CN": "我需要面签吗？", "ja": "面接を受ける必要がありますか？" },
    { "tj": "Гирифтани раводид чанд рӯз вақт мегирад?", "ru": "Сколько дней занимает оформление визы?", "en": "How many days does it take to process the visa?", "de": "Wie viele Tage dauert die Visumbearbeitung?", "fr": "Combien de jours prend l'obtention du visa?", "es": "¿Cuántos días toma el procesamiento de la visa?", "it": "Quanti giorni ci vogliono per il visto?", "tr": "Vize işlemleri kaç gün sürüyor?", "ar": "كم يوماً يستغرق إصدار التأشيرة؟", "fa": "صدور ویزا چند روز طول می‌کشد؟", "zh-CN": "办理签证需要几天？", "ja": "ビザの発行には何日かかりますか？" },
    { "tj": "Ҳадафи сафари шумо чист?", "ru": "Какова цель вашей поездки?", "en": "What is the purpose of your trip?", "de": "Was ist der Zweck Ihrer Reise?", "fr": "Quel est le but de votre voyage?", "es": "¿Cuál es el motivo de su viaje?", "it": "Qual è lo scopo del tuo viaggio?", "tr": "Seyahatinizin amacı nedir?", "ar": "ما هو الغرض من رحلتك؟", "fa": "هدف سفر شما چیست؟", "zh-CN": "您旅游的目的是什么？", "ja": "渡航の目的は何ですか？" },
    { "tj": "Ман ҳамчун сайёҳ (турист) сафар мекунам.", "ru": "Я путешествую как турист.", "en": "I am traveling as a tourist.", "de": "Ich reise als Tourist.", "fr": "Je voyage en tant que touriste.", "es": "Viajo como turista.", "it": "Viaggio come turista.", "tr": "Turist olarak seyahat ediyorum.", "ar": "أنا أسافر كسائح.", "fa": "من به عنوان گردشگر سفر می‌کنم.", "zh-CN": "我是去旅游的。", "ja": "観光客として旅行します。" },
    { "tj": "Оё ба ман даъватнома лозим аст?", "ru": "Нужно ли мне приглашение?", "en": "Do I need an invitation letter?", "de": "Benötige ich ein Einladungsschreiben?", "fr": "Ai-je besoin d'une lettre d'invitation?", "es": "¿Necesito una carta de invitación?", "it": "Ho bisogno di una lettera di invito?", "tr": "Davet mektubuna ihtiyacım var mı?", "ar": "هل أحتاج إلى رسالة دعوة؟", "fa": "آیا به دعوت‌نامه نیاز دارم？", "zh-CN": "我需要邀请函吗？", "ja": "招待状は必要ですか？" },
    { "tj": "Ман бояд шиносномаамро дар ин ҷо гузорам?", "ru": "Я должен оставить здесь свой паспорт?", "en": "Do I have to leave my passport here?", "de": "Muss ich meinen Reisepass hier lassen?", "fr": "Dois-je laisser mon passeport ici?", "es": "¿Tengo que dejar mi pasaporte aquí?", "it": "Devo lasciare qui il mio passaporto?", "tr": "Pasaportumu burada bırakmalı mıyım?", "ar": "هل يجب أن أترك جواز سفري هنا؟", "fa": "آیا باید پاسپورتم را اینجا بگذارم؟", "zh-CN": "我需要把护照留在这里吗？", "ja": "パスポートをここに預ける必要がありますか？" },
    { "tj": "Раводиди ман кай тайёр мешавад?", "ru": "Когда будет готова моя виза?", "en": "When will my visa be ready?", "de": "Wann ist mein Visum fertig?", "fr": "Quand mon visa sera-t-il prêt?", "es": "¿Cuándo estará lista mi visa?", "it": "Quando sarà pronto il mio visto?", "tr": "Vizem ne zaman hazır olur?", "ar": "متى ستكون تأشيرتي جاهزة؟", "fa": "ویزای من کی آماده می‌شود؟", "zh-CN": "我的签证什么时候能办好？", "ja": "ビザはいつ発給されますか？" },
    { "tj": "Ба ман кӯмаки консулӣ лозим аст.", "ru": "Мне нужна консульская помощь.", "en": "I need consular assistance.", "de": "Ich benötige konsularische Unterstützung.", "fr": "J'ai besoin d'une assistance consulaire.", "es": "Necesito asistencia consular.", "it": "Ho bisogno di assistenza consolare.", "tr": "Konsolosluk yardımına ihtiyacım var.", "ar": "أحتاج إلى مساعدة قنصلية.", "fa": "من به کمک کنسولی نیاز دارم.", "zh-CN": "我需要领事协助。", "ja": "領事援助が必要です。" },
    { "tj": "Шӯъбаи консулӣ соати чанд кор мекунад?", "ru": "В какие часы работает консульский отдел?", "en": "What are the opening hours of the consular section?", "de": "Wie sind die Öffnungszeiten der Konsularabteilung?", "fr": "Quelles sont les heures d'ouverture de la section consulaire?", "es": "¿Cuáles son las horas de atención de la sección consular?", "it": "Quali sono gli orari di apertura della sezione consolare?", "tr": "Konsolosluk bölümü hangi saatlerde açık?", "ar": "ما هي ساعات عمل القسم القنصلي؟", "fa": "ساعات کاری بخش کنسولی چیست؟", "zh-CN": "领事处几点办公？", "ja": "領事部の業務時間は何時ですか？" }
  ]
},
{
  "id": "on_the_phone",
  "title": {
    "tj": "Дар телефон", "ru": "Разговор по телефону", "en": "On the phone",
    "de": "Am Telefon", "fr": "Au téléphone",
    "es": "Por teléfono", "it": "Al telefono", "tr": "Telefonda",
    "ar": "على الهاتف", "fa": "پشت تلفن", "zh-CN": "在电话中", "ja": "電話で"
  },
  "phrases": [
    { "tj": "Алло, салом! Шумо маро мешунавед?", "ru": "Алло, привет! Вы меня слышите?", "en": "Hello! Can you hear me?", "de": "Hallo! Hören Sie mich?", "fr": "Allo, bonjour! Вы m'entendez?", "es": "¡Alo, hola! ¿Me escucha?", "it": "Pronto, ciao! Mi senti?", "tr": "Alo, merhaba! Beni duyuyor musunuz?", "ar": "ألو، مرحباً! هل تسمعني؟", "fa": "الو، سلام! صدای مرا می‌شنوید؟", "zh-CN": "喂，你好！你能听到我说话吗？", "ja": "もしもし、こんにちは！聞こえますか？" },
    { "tj": "Лутфан, кӯмак кунед, ман намешунавам.", "ru": "Пожалуйста, помогите, я не слышу.", "en": "Please help, I can't hear.", "de": "Bitte helfen Sie, ich höre nichts.", "fr": "S'il vous plaît, aidez-moi, je n'entends pas.", "es": "Por favor, ayúdeme, no escucho.", "it": "Per favore, aiutami, non sento.", "tr": "Lütfen yardım edin, duyamıyorum.", "ar": "الرجاء المساعدة، أنا لا أسمع.", "fa": "لطفاً کمک کنید، من نمی‌شنوم.", "zh-CN": "请帮一下忙， I听不见。", "ja": "助けてください、聞こえません。" },
    { "tj": "Оё метавонам бо Амина гап занам?", "ru": "Могу я поговорить с Аминой?", "en": "Can I speak to Amina?", "de": "Kann ich mit Amina sprechen?", "fr": "Puis-je parler à Amina?", "es": "¿Puedo hablar con Amina?", "it": "Posso parlare con Amina?", "tr": "Amina ile görüşebilir miyim?", "ar": "هل يمكنني التحدث со أمينة؟", "fa": "می‌توانم با آمنه صحبت کنم؟", "zh-CN": "我可以和阿米娜通话吗？", "ja": "アミナさんとお話しできますか？" },
    { "tj": "Шумо хато занг задед.", "ru": "Вы ошиблись номером.", "en": "You have the wrong number.", "de": "Sie haben sich verwählt.", "fr": "Vous vous êtes trompé de numéro.", "es": "Se ha equivocado de número.", "it": "Ha sbagliato numero.", "tr": "Yanlış numara aradınız.", "ar": "لقد اتصلت بالرقم الخطأ.", "fa": "شما شماره را اشتباه گرفته‌اید.", "zh-CN": "你打错电话了。", "ja": "番号が間違っています。" },
    { "tj": "Лутфан, каме баландтар гап занед.", "ru": "Пожалуйста, говорите немного громче.", "en": "Please speak a little louder.", "de": "Bitte sprechen Sie etwas lauter.", "fr": "S'il vous plaît, parlez un peu plus fort.", "es": "Por favor, hable un poco más alto.", "it": "Per favore, parla un po' più forte.", "tr": "Lütfen biraz daha yüksek sesle konuşun.", "ar": "تحدث بصوت أعلى قليلاً، من فضلك.", "fa": "لطفاً کمی بلندتر صحبت کنید.", "zh-CN": "请大一点声说。", "ja": "もう少し大きな声で話してください。" },
    { "tj": "Алоқа хеле бад аст.", "ru": "Связь очень плохая.", "en": "The connection is very bad.", "de": "Die Verbindung ist sehr schlecht.", "fr": "La connexion est très mauvaise.", "es": "La conexión es muy mala.", "it": "La linea è pessima.", "tr": "Bağlantı çok kötü.", "ar": "الاتصال سيء للغاية.", "fa": "ارتباط خیلی ضعیف است.", "zh-CN": "信号太差了。", "ja": "電波がとても悪いです。" },
    { "tj": "Интизор шавед, ман ҳозир бармегардам.", "ru": "Подождите, я сейчас вернусь.", "en": "Hold on, I'll be right back.", "de": "Warten Sie, ich bin gleich zurück.", "fr": "Attendez, je reviens tout de suite.", "es": "Espere, ahora vuelvo.", "it": "Aspetta, torno subito.", "tr": "Bekleyin, hemen döneceğim.", "ar": "انتظر، سأعود حالاً.", "fa": "منتظر بمانید، الآن برمی‌گردم.", "zh-CN": "请稍等，我马上回来。", "ja": "少々お待ちください、すぐ戻ります。" },
    { "tj": "Ман дертар занг мезанам.", "ru": "Я перезвоню позже.", "en": "I will call back later.", "de": "Ich rufe später zurück.", "fr": "Je rappellerai plus tard.", "es": "Llamaré más tarde.", "it": "Richiamerò più tardi.", "tr": "Daha sonra tekrar arayacağım.", "ar": "سأتصل لاحقاً.", "fa": "بعداً دوباره زنگ می‌زنم.", "zh-CN": "我晚点再打过来。", "ja": "後でかけ直します。" },
    { "tj": "Батареяи телефони ман тамом шуда истодааст.", "ru": "У меня садится батарея.", "en": "My battery is dying.", "de": "Mein Akku ist fast leer.", "fr": "Ma batterie est presque déchargée.", "es": "Mi batería se está agotando.", "it": "La mia batteria si sta scaricando.", "tr": "Pilim bitiyor.", "ar": "بطاريتي تنفد.", "fa": "باتری گوشی من دارد تمام می‌شود.", "zh-CN": "我的手机快没电了。", "ja": "バッテリーが切れそうです。" },
    { "tj": "Ба ман паём (СМС) фиристед.", "ru": "Отправьте мне сообщение (СМС).", "en": "Send me a text message (SMS).", "de": "Senden Sie mir eine SMS.", "fr": "Envoyez-moi un message (SMS).", "es": "Envíeme un mensaje (SMS).", "it": "Mandami un messaggio (SMS).", "tr": "Bana bir mesaj (SMS) gönderin.", "ar": "أرسل لي رسالة نصية (SMS).", "fa": "به من پیامک (اس‌ام‌اس) بفرستید.", "zh-CN": "给我发条短信（SMS）。", "ja": "メッセージ（SMS）を送ってください。" },
    { "tj": "Оё метавонед паёми маро ба ӯ расонед?", "ru": "Можете передать ему/ей мое сообщение?", "en": "Can you give him/her my message?", "de": "Können Sie ihm/ihr meine Nachricht ausrichten?", "fr": "Pouvez-vous lui transmettre mon message?", "es": "¿Puede darle mi mensaje?", "it": "Puoi riferirgli/le il mio messaggio?", "tr": "Ona mesajımı iletebilir misiniz?", "ar": "هل يمكنك توصيل رسالتي إليه/إليها؟", "fa": "می‌توانید پیام مرا به او برسانید؟", "zh-CN": "你能帮我转达一句话吗？", "ja": "彼/彼女に伝言をお願いできますか？" },
    { "tj": "Телефони худро хомӯш кунед.", "ru": "Выключите свой телефон.", "en": "Turn off your phone.", "de": "Schalten Sie Ihr Telefon aus.", "fr": "Éteignez votre téléphone.", "es": "Apague su teléfono.", "it": "Spegni il tuo telefono.", "tr": "Telefonunuzu kapatın.", "ar": "أغلق هاتفك.", "fa": "تلفن خود را خاموش کنید.", "zh-CN": "把手机关掉。", "ja": "携帯電話の電源を切ってください。" },
    { "tj": "Ман рақами шуморо сабт мекунам.", "ru": "Я сохраню ваш номер.", "en": "I will save your number.", "de": "Ich werde Ihre Nummer speichern.", "fr": "Je vais enregistrer votre numéro.", "es": "Guardaré su número.", "it": "Salverò il tuo numero.", "tr": "Numaranızı kaydedeceğim.", "ar": "سأحفظ رقمك.", "fa": "شماره شما را ذخیره می‌کنم.", "zh-CN": "我会存下你的号码。", "ja": "番号を登録しておきます。" },
    { "tj": "Ташаккур барои занг.", "ru": "Спасибо за звонок.", "en": "Thank you for calling.", "de": "Danke für den Anruf.", "fr": "Merci pour votre appel.", "es": "Gracias por llamar.", "it": "Grazie per la chiamata.", "tr": "Aradığınız için teşekkürler.", "ar": "شكراً لاتصالك.", "fa": "ممنون که زنگ زدید.", "zh-CN": "謝謝你打来电话。", "ja": "お電話ありがとうございました。" },
    { "tj": "Рӯзи хуш, хайр!", "ru": "Хорошего дня, пока!", "en": "Have a nice day, bye!", "de": "Schönen Tag noch, tschüss!", "fr": "Bonne journée, au revoir!", "es": "Que tenga un buen día, ¡adiós!", "it": "Buona giornata, ciao!", "tr": "İyi günler, hoşça kalın!", "ar": "أتمنى لك يوماً سعيداً، وداعاً!", "fa": "روز خوبی داشته باشید، خداحافظ!", "zh-CN": "祝你今天愉快， 再见！", "ja": "良い一日を、さようなら！" }
  ]
},
{
  "id": "at_the_hospital",
  "title": {
    "tj": "Дар беморхона", "ru": "В больнице", "en": "At the hospital",
    "de": "Im Krankenhaus", "fr": "À l'hôpital",
    "es": "En el hospital", "it": "In ospedale", "tr": "Hastanesinde",
    "ar": "في المستشفى", "fa": "در بیمارستان", "zh-CN": "在医院", "ja": "病院で"
  },
  "phrases": [
    { "tj": "Ба ман табиб лозим аст.", "ru": "Мне нужен врач.", "en": "I need a doctor.", "de": "Ich brauche einen Arzt.", "fr": "J'ai besoin d'un médecin.", "es": "Necesito un médico.", "it": "Ho bisogno di un medico.", "tr": "Bir doktora ihtiyacım var.", "ar": "أحتاج إلى طبيب.", "fa": "من به یک پزشک نیاز دارم.", "zh-CN": "我需要医生。", "ja": "医者が必要です。" },
    { "tj": "Дар куҷо ёрии таъҷилӣ аст?", "ru": "Где скорая помощь?", "en": "Where is the emergency room?", "de": "Wo ist die Notaufnahme?", "fr": "Où sont les urgences?", "es": "¿Dónde está la sala de urgencias?", "it": "Dov'è il pronto soccorso?", "tr": "Acil servis nerede?", "ar": "أين غرفة الطوارئ؟", "fa": "بخش اورژانس کجاست؟", "zh-CN": "急诊室在哪里？", "ja": "救急外来はどこですか？" },
    { "tj": "Ман дарди шадид дар қафаси сина дорам.", "ru": "У меня сильная боль в груди.", "en": "I have severe chest pain.", "de": "Ich habe starke Schmerzen in der Brust.", "fr": "J'ai une douleur intense dans la poitrine.", "es": "Tengo un dolor fuerte en el pecho.", "it": "Ho un dolore forte al petto.", "tr": "Göğsümde şiddetli bir ağrı var.", "ar": "عندي ألم حاد في الصدر.", "fa": "در قفسه سینه درد شدیدی دارم.", "zh-CN": "我胸口剧痛。", "ja": "胸に激しい痛みがあります。" },
    { "tj": "Ба ман нафаскашӣ душвор аст.", "ru": "Мне трудно дышать.", "en": "It is difficult for me to breathe.", "de": "Es fällt mir schwer zu atmen.", "fr": "J'ai du mal à respirer.", "es": "Me cuesta respirar.", "it": "Ho difficoltà a respirare.", "tr": "Nefes almakta zorlanıyorum.", "ar": "أجد صعوبة في التنفس.", "fa": "نفس کشیدن برایم سخت است.", "zh-CN": "我呼吸困难。", "ja": "呼吸が困難です。" },
    { "tj": "Ҳарорати баданам баланд аст.", "ru": "У меня высокая температура.", "en": "I have a high fever.", "de": "Ich habe hohes Fieber.", "fr": "J'ai une forte fièvre.", "es": "Tengo fiebre alta.", "it": "Ho la febbre alta.", "tr": "Yüksek ateşım var.", "ar": "عندي حرارة عالية.", "fa": "تب بالایی دارم.", "zh-CN": "我发高烧了。", "ja": "高熱があります。" },
    { "tj": "Ман бемор ҳис мекунам.", "ru": "Меня тошнит.", "en": "I feel nauseous.", "de": "Mir ist übel.", "fr": "J'ai des nausées.", "es": "Tengo náuseas.", "it": "Ho la nausea.", "tr": "Midem bulanıyor.", "ar": "أشعر بالغثيان.", "fa": "حالت تهوع دارم.", "zh-CN": "我想吐。", "ja": "吐き気がします。" },
    { "tj": "Ба ман аз назар гузарондан лозим аст.", "ru": "Мне нужен осмотр.", "en": "I need a check-up.", "de": "Ich brauche eine Untersuchung.", "fr": "J'ai besoin d'un examen médical.", "es": "Necesito un chequeo.", "it": "Ho bisogno di una visita.", "tr": "Muayene olmam gerekiyor.", "ar": "أحتاج إلى فحص طبي.", "fa": "به معاینه نیاز دارم.", "zh-CN": "我需要做检查。", "ja": "診察が必要です。" },
    { "tj": "Шумо кай табиби мутахассис доред?", "ru": "Когда у вас принимает специалист?", "en": "When is the specialist available?", "de": "Wann ist der Facharzt da?", "fr": "Quand le spécialiste est-il disponible?", "es": "¿Cuándo está disponible el especialista?", "it": "Quando c'è lo specialista?", "tr": "Uzman doktor ne zaman müsait?", "ar": "متى يتوفر الطبيب المختص؟", "fa": "پزشک متخصص چه زمانی حضور دارد؟", "zh-CN": "专科医生什么时候值班？", "ja": "専門医の診察は何時ですか？" },
    { "tj": "Оё ман бояд таҳлил супорам?", "ru": "Мне нужно сдать анализы?", "en": "Do I need to take tests?", "de": "Muss ich Tests machen?", "fr": "Dois-je faire des analyses?", "es": "¿Necesito hacerme análisis?", "it": "Devo fare degli esami?", "tr": "Test yaptırmam gerekiyor mu?", "ar": "هل يجب أن أجري تحاليل؟", "fa": "آیا باید آزمایش بدهم؟", "zh-CN": "我需要做化验吗？", "ja": "検査を受ける必要がありますか？" },
    { "tj": "Натиҷаи таҳлилҳо кай тайёр мешавад?", "ru": "Когда будут готовы результаты анализов?", "en": "When will the test results be ready?", "de": "Wann sind die Testergebnisse fertig?", "fr": "Quand les résultats d'analyse seront-ils prêts?", "es": "¿Cuándo estarán listos los resultados?", "it": "Quando saranno pronti i risultati?", "tr": "Test sonuçları ne zaman çıkacak?", "ar": "متى تظهر نتائج التحاليل؟", "fa": "نتایج آزمایش چه زمانی آماده می‌شود؟", "zh-CN": "化验结果什么时候出来？", "ja": "検査結果はいつ出ますか？" },
    { "tj": "Ин ҷо мехобам ё ба хона меравам?", "ru": "Мне нужно остаться в больнице или можно идти домой?", "en": "Do I need to stay in the hospital or can I go home?", "de": "Muss ich im Krankenhaus bleiben?", "fr": "Dois-je rester à l'hôpital ou puis-je rentrer?", "es": "¿Tengo que quedarme en el hospital?", "it": "Devo rimanere in ospedale?", "tr": "Hastanede kalmam mı gerekiyor?", "ar": "هل يجب أن أقيم في المستشفى؟", "fa": "آیا باید در بیمارستان بستری شوم؟", "zh-CN": "我需要住院还是回家？", "ja": "入院する必要がありますか？" },
    { "tj": "Доруханаро ба ман диҳед.", "ru": "Выпишите мне рецепт, пожалуйста.", "en": "Please write me a prescription.", "de": "Bitte schreiben Sie mir ein Rezept.", "fr": "S'il vous plaît, donnez-moi une ordonnance.", "es": "Por favor, escríbame una receta.", "it": "Per favore, mi prescriva una ricetta.", "tr": "Lütfen bana reçete yazın.", "ar": "من فضلك اكتب لي وصفة طبية.", "fa": "لطفاً برای من نسخه بنویسید.", "zh-CN": "请给我开个处方。", "ja": "処方箋を書いてください。" },
    { "tj": "Ман суғуртаи тиббӣ дорам.", "ru": "У меня есть медицинская страховка.", "en": "I have health insurance.", "de": "Ich habe eine Krankenversicherung.", "fr": "J'ai une assurance maladie.", "es": "Tengo seguro médico.", "it": "Ho un'assicurazione sanitaria.", "tr": "Sağlık sigortam var.", "ar": "لدي تأمين صحي.", "fa": "من بیمه درمانی دارم.", "zh-CN": "我有医疗保险。", "ja": "医療保険に入っています。" },
    { "tj": "Шартномаи суғуртаи ман инро мепӯшонад?", "ru": "Это покрывается моей страховкой?", "en": "Is this covered by my insurance?", "de": "Ist das von meiner Versicherung abgedeckt?", "fr": "Est-ce couvert par mon assurance?", "es": "¿Está esto cubierto por mi seguro?", "it": "È coperto dalla mia assicurazione?", "tr": "Bu sigortam tarafından karşılanıyor mu?", "ar": "هل يغطي التأمين الخاص بي هذا؟", "fa": "آیا این تحت پوشش بیمه من است؟", "zh-CN": "我的保险能报销这个吗？", "ja": "これは保険でカバーされますか？" },
    { "tj": "Ташаккур ба шумо барои кӯмак ва ғамхорӣ.", "ru": "Спасибо вам за помощь и заботу.", "en": "Thank you for your help and care.", "de": "Vielen Dank für Ihre Hilfe und Fürsorge.", "fr": "Merci pour votre aide et vos soins.", "es": "Gracias por su ayuda y atención.", "it": "Grazie per il vostro aiuto e le vostre cure.", "tr": "Yardımınız için teşekkür ederim.", "ar": "شكرا لمساعدتكم ورعايتكم.", "fa": "از کمک و مراقبت شما سپاسگزارم.", "zh-CN": "谢谢您的帮助和照顾。", "ja": "助けていただき、お世話になりました。" }
  ]
},
{
  "id": "at_the_bank",
  "title": {
    "tj": "Дар бонк", "ru": "В банке", "en": "At the bank",
    "de": "In der Bank", "fr": "À la banque",
    "es": "En el banco", "it": "In banca", "tr": "Bankada",
    "ar": "في البنك", "fa": "در بانک", "zh-CN": "在银行", "ja": "銀行で"
  },
  "phrases": [
    { "tj": "Наздиктарин банкомат дар куҷост?", "ru": "Где находится ближайший банкомат?", "en": "Where is the nearest ATM?", "de": "Wo ist der nächste Geldautomat?", "fr": "Où се trouve le distributeur le plus proche?", "es": "¿Dónde está el cajero automático más cercano?", "it": "Dov'è il bancomat più vicino?", "tr": "En yakın ATM nerede?", "ar": "أين يقع أقرب صراف آلي؟", "fa": "نزدیک‌ترین عابربانک کجاست؟", "zh-CN": "最近的自动取款机在哪里？", "ja": "一番近いATMはどこですか？" },
    { "tj": "Ман мехоҳам як суратҳисоб кушоям.", "ru": "Я бы хотел открыть счет.", "en": "I would like to open an account.", "de": "Ich möchte ein Konto eröffnen.", "fr": "Je voudrais ouvrir un compte.", "es": "Me gustaría abrir una cuenta.", "it": "Vorrei aprire un conto corrente.", "tr": "Hesap açtırmak istiyorum.", "ar": "أود فتح حساب.", "fa": "من می‌خواهم یک حساب باز کنم.", "zh-CN": "我想开个账户。", "ja": "口座を開設したいです。" },
    { "tj": "Қурби асъор барои имрӯз чанд аст?", "ru": "Какой сегодня курс валют?", "en": "What is the exchange rate today?", "de": "Wie ist der heutige Wechselkurs?", "fr": "Quel est le taux de change aujourd'hui?", "es": "¿Cuál es el tipo de cambio de hoy?", "it": "Qual è il tasso di cambio di oggi?", "tr": "Bugün döviz kuru nedir?", "ar": "ما هو سعر الصرف اليوم؟", "fa": "نرخ ارز امروز چقدر است؟", "zh-CN": "今天的汇率是多少？", "ja": "今日の 為替レートはいくらですか？" },
    { "tj": "Ман мехоҳам пулро иваз кунам.", "ru": "Я хочу обменять деньги.", "en": "I want to exchange money.", "de": "Ich möchte Geld wechseln.", "fr": "Je veux échanger de l'argent.", "es": "Quiero cambiar dinero.", "it": "Voglio cambiare dei soldi.", "tr": "Para bozdurmak istiyorum.", "ar": "اريد تحويل نقود.", "fa": "من می‌خواهم پول چنج کنم.", "zh-CN": "我想换钱。", "ja": "両替をしたいです。" },
    { "tj": "Комиссияи шумо чанд пул аст?", "ru": "Какая у вас комиссия?", "en": "How much is the commission?", "de": "Wie hoch ist die Provision?", "fr": "À combien s'élève la commission?", "es": "¿De cuánto es la comisión?", "it": "A quanto ammonta la commissione?", "tr": "Komisyon ne kadar?", "ar": "كم تبلغ العموله؟", "fa": "کارمزد چقدر است؟", "zh-CN": "手续费是多少？", "ja": "手数料はいくらですか？" },
    { "tj": "Ман бояд пул нақд кунам.", "ru": "Мне нужно снять наличные.", "en": "I need to withdraw cash.", "de": "Ich muss Bargeld abheben.", "fr": "Je dois retirer de l'argent liquide.", "es": "Necesito retirar efectivo.", "it": "Devo prelevare del contante.", "tr": "Nakit para çekmem gerekiyor.", "ar": "أحتاج إلى سحب نقود.", "fa": "من باید پول نقد برداشت کنم.", "zh-CN": "我需要取现。", "ja": "現金を降ろす必要があります。" },
    { "tj": "Оё метавонам ба хориҷа пул интиқол диҳам?", "ru": "Могу ли я перевести деньги за границу?", "en": "Can I transfer money abroad?", "de": "Kann ich Geld ins Ausland überweisen?", "fr": "Puis-je transférer de l'argent à l'étranger?", "es": "¿Puedo transferir dinero al extranjero?", "it": "Posso trasferire denaro all'estero?", "tr": "Yurt dışına para transferi yapabilir miyim?", "ar": "هل يمكنني تحويل أموال إلى الخارج؟", "fa": "آیا می‌توانم به خارج از کشور پول بفرستم؟", "zh-CN": "我可以汇款到国外吗？", "ja": "海外送金はできますか？" },
    { "tj": "Корти бонкии ман кор намекунад.", "ru": "Моя банковская карта не работает.", "en": "My bank card is not working.", "de": "Meine Bankkarte funktioniert nicht.", "fr": "Ma carte bancaire ne fonctionne pas.", "es": "Mi tarjeta bancaria no funciona.", "it": "La mia carta bancaria non funziona.", "tr": "Banka kartım çalışmıyor.", "ar": "بطاقتي البنكية لا تعمل.", "fa": "کارت بانکی من کار نمی‌کند.", "zh-CN": "我的银行卡坏了。", "ja": "キャッシュカードが使えません。" },
    { "tj": "Ман рамзи корти худро фаромӯш кардам.", "ru": "Я забыл ПИН-код от своей карты.", "en": "I forgot the PIN code of my card.", "de": "Ich habe den PIN-Code meiner Karte vergessen.", "fr": "J'ai oublié le code PIN de ma carte.", "es": "Olvidé el código PIN de mi tarjeta.", "it": "Ho dimenticato il codice PIN della mia carta.", "tr": "Kartımın şifresini unuttum.", "ar": "لقد نسيت الرقم السري لبطاقتي.", "fa": "رمز کارت خودم را فراموش کرده‌ام.", "zh-CN": "我忘记了银行卡密码。", "ja": "カードの暗証番号を忘れました。" },
    { "tj": "Лутфан дар ин ҷо имзо кунед.", "ru": "Пожалуйста, подпишите здесь.", "en": "Please sign here.", "de": "Bitte unterschreiben Sie hier.", "fr": "Veuillez signer ici.", "es": "Por favor, firme aquí.", "it": "Per favore, firmi qui.", "tr": "Lütfen burayı imzalayın.", "ar": "الرجاء التوقيع هنا.", "fa": "لطفاً اینجا را امضا کنید.", "zh-CN": "请在这里签名。", "ja": "ここにサインをお願いします。" },
    { "tj": "Ман мехоҳам ба суратҳисоби худ пул гузорам.", "ru": "Я хочу положить деньги на свой счет.", "en": "I want to deposit money into my account.", "de": "Ich möchte Geld auf mein Konto einzahlen.", "fr": "Je veux déposer de l'argent sur mon compte.", "es": "Quiero depositar dinero en mi cuenta.", "it": "Voglio depositare dei soldi sul mio conto.", "tr": "Hesabıma para yatırmak istiyorum.", "ar": "أريد إيداع أموال في حسابي.", "fa": "من می‌خواهم به حسابم پول واریز کنم.", "zh-CN": "我想往账户里存钱。", "ja": "口座にお金を入金したいです。" },
    { "tj": "Ман корти худро гум кардам, онро маҳкам кунед.", "ru": "Я потерял карту, заблокируйте ее.", "en": "I lost my card, please block it.", "de": "Ich habe meine Karte verloren, bitte sperren Sie sie.", "fr": "J'ai perdu ma carte, veuillez la bloquer.", "es": "Perdí mi tarjeta, por favor bloquéela.", "it": "Ho perso la mia carta, per favore la blocchi.", "tr": "Kartımı kaybettim, lütfen iptal edin.", "ar": "لقد فقدت بطاقتي، يرجى حظرها.", "fa": "من کارتم را گم کرده‌ام، لطفاً آن را مسدود کنید.", "zh-CN": "我的卡丢了，请帮我挂失。", "ja": "カードを紛失したので、停止してください。" },
    { "tj": "Ба ман кӯчиши суратҳисоб (выписка) лозим аст.", "ru": "Мне нужна выписка по счету.", "en": "I need a bank statement.", "de": "Ich brauche einen Kontoauszug.", "fr": "J'ai besoin d'un relevé de compte.", "es": "Necesito un extracto bancaria.", "it": "Ho bisogno di un estratto conto.", "tr": "Hesap özetine ihtiyacım var.", "ar": "أحتاج إلى كشف حساب.", "fa": "من به صورتحساب بانکی نیاز دارم.", "zh-CN": "我需要一份银行流水账单。", "ja": "残高証明書が必要です。" },
    { "tj": "Мӯҳлати корти ман гузаштааст.", "ru": "Срок действия моей карты истек.", "en": "My card has expired.", "de": "Meine Karte ist abgelaufen.", "fr": "Ma carte a expiré.", "es": "Mi tarjeta ha caducado.", "it": "La mia carta è scaduta.", "tr": "Kartımın süresi doldu.", "ar": "لقد انتهت صلاحية بطاقتي.", "fa": "تاریخ انقضای کارت من گذشته است.", "zh-CN": "我的卡过期了。", "ja": "カードの有効期限が切れています。" },
    { "tj": "Бонк соати чанд маҳкам мешавад?", "ru": "Во сколько закрывается банк?", "en": "What time does the bank close?", "de": "Wann schließt die Bank?", "fr": "À quelle heure ferme la banque?", "es": "¿A qué hora cierra el banco?", "it": "A che ora chiude la banca?", "tr": "Banka saat kaçta kapanıyor?", "ar": "في أي وقت يغلق البنك؟", "fa": "بانک چه ساعتی بسته می‌شود؟", "zh-CN": "银行几点关门？", "ja": "銀行は何時に閉まりますか？" }
  ]
},
{
  "id": "at_the_pharmacy",
  "title": {
    "tj": "Дар дорухона", "ru": "В аптеке", "en": "At the pharmacy",
    "de": "In der Apotheke", "fr": "À la pharmacie",
    "es": "En la farmacia", "it": "In farmacia", "tr": "Eczanede",
    "ar": "في الصيدلية", "fa": "در داروخانه", "zh-CN": "在药店", "ja": "薬局で"
  },
  "phrases": [
    { "tj": "Наздиктарин дорухона дар куҷост?", "ru": "Где находится ближайшая аптека?", "en": "Where is the nearest pharmacy?", "de": "Wo ist die nächste Apotheke?", "fr": "Où se trouve la pharmacie la plus proche?", "es": "¿Dónde está la farmacia más cercana?", "it": "Dov'è la farmacia più vicina?", "tr": "En yakın eczane nerede?", "ar": "أين تقع أقرب صيدلية؟", "fa": "نزدیک‌ترین داروخانه کجاست؟", "zh-CN": "最近的药店在哪里？", "ja": "一番近い薬局はどこですか？" },
    { "tj": "Ман доруи дарди сар мехоҳам.", "ru": "Мне нужно лекарство от головной боли.", "en": "I need medicine for a headache.", "de": "Ich brauche ein Medikament gegen Kopfschmerzen.", "fr": "J'ai besoin d'un médicament contre le mal de tête.", "es": "Necesito un medicamento para el dolor de cabeza.", "it": "Ho bisogno di un farmaco per il mal di testa.", "tr": "Baş ağrısı için bir ilaç istiyorum.", "ar": "أحتاج إلى دواء لصداع الرأس.", "fa": "من دارویی برای سردرد می‌خواهم.", "zh-CN": "我需要治头痛的药。", "ja": "頭痛薬をください。" },
    { "tj": "Оё ин доруро бе ретсепт (нусхаи табиб) харидан мумкин аст?", "ru": "Можно ли купить это лекарство без рецепта?", "en": "Can I buy this medicine without a prescription?", "de": "Kann ich dieses Medikament ohne Rezept kaufen?", "fr": "Puis-je acheter ce médicament sans ordonnance?", "es": "¿Puedo comprar este medicamento sin receta?", "it": "Posso comprare questo farmaco senza ricetta?", "tr": "Bu ilacı reçetesiz alabilir miyim?", "ar": "هل يمكنني شراء هذا الدواء بدون وصفة طبية؟", "fa": "آیا می‌توان این دارو را بدون نسخه خرید؟", "zh-CN": "这个药不需要处方就可以买吗？", "ja": "この薬は処方箋なしで買えますか？" },
    { "tj": "Ин доруро чӣ хел бояд қабул кард?", "ru": "Как принимать это лекарство?", "en": "How should I take this medicine?", "de": "Wie soll ich dieses Medikament einnehmen?", "fr": "Comment dois-je prendre ce médicament?", "es": "¿Cómo debo tomar este medicamento?", "it": "Come devo prendere questo farmaco?", "tr": "Bu ilacı nasıl kullanmalıyım?", "ar": "كيف يجب أن آخذ هذا الدواء؟", "fa": "این دارو را چگونه باید مصرف کرد؟", "zh-CN": "这个药应该怎么 frontier吃？", "ja": "この薬はどのように服用すればいいですか？" },
    { "tj": "Пеш аз хӯрок ё баъд аз хӯрок?", "ru": "До еды или после еды?", "en": "Before or after meals?", "de": "Vor oder nach dem Essen?", "fr": "Avant ou après les repas?", "es": "¿Antes o después de las comidas?", "it": "Prima o dopo i pasti?", "tr": "Yemekten önce mi sonra mı?", "ar": "قبل الأكل أم بعده؟", "fa": "قبل از غذا یا بعد از غذا؟", "zh-CN": "饭前还是饭后？", "ja": "食前ですか、それとも食后ですか？" },
    { "tj": "Ман сурфа дорам, ба ман шарбат (сироп) диҳед.", "ru": "У меня кашель, дайте мне сироп, пожалуйста.", "en": "I have a cough, please give me a syrup.", "de": "Ich habe Husten, geben Sie mir bitte einen Saft.", "fr": "J'ai de la toux, donnez-moi un sirop, s'il vous plaît.", "es": "Tengo tos, deme un jarabe, por favor.", "it": "Ho la tosse, mi dia uno sciroppo, per favore.", "tr": "Öksürüğüm var, lütfen bana bir şurup verin.", "ar": "عندي سعال، أعطني شراباً من فضلك.", "fa": "من سرفه می‌کنم، لطفاً به من یک شربت بدهید.", "zh-CN": "我咳嗽，请给我来瓶糖浆。", "ja": "咳が出るので、シロップをください。" },
    { "tj": "Оё ин дору таъсири манфӣ (побочный эффект) дорад?", "ru": "Есть ли у этого лекарства побочные эффекты?", "en": "Does this medicine have any side effects?", "de": "Hat dieses Medikament Nebenwirkungen?", "fr": "Ce médicament a-t-il des effets secondaires?", "es": "¿Este medicamento tiene efectos secundarios?", "it": "Questo farmaco ha effetti collaterali?", "tr": "Bu ilacın yan etkileri var mı?", "ar": "هل لهذا الدواء آثار جانبية؟", "fa": "آیا این دارو عوارض جانبی دارد؟", "zh-CN": "这个药有副作用吗？", "ja": "この薬に副作用はありますか？" },
    { "tj": "Ба ман дока ва пахта лозим аст.", "ru": "Мне нужны марля и вата.", "en": "I need gauze and cotton wool.", "de": "Ich brauche Verbandmulle und Watte.", "fr": "J'ai besoin de gaze et de coton.", "es": "Necesito gasa y algodón.", "it": "Ho bisogno di garza e cotone.", "tr": "Gazlı bez ve pamuğa ihtiyacım var.", "ar": "أحتاج إلى شاش وقطن.", "fa": "من به گاز استریل و پنبه نیاز دارم.", "zh-CN": "我需要纱布和棉花。", "ja": "ガーゼと綿をください。" },
    { "tj": "Ба ман пластири захмбандӣ диҳед.", "ru": "Дайте мне пластырь, пожалуйста.", "en": "Give me a plaster, please.", "de": "Geben Sie mir bitte ein Pflaster.", "fr": "Donnez-moi un pansement, s'il vous plaît.", "es": "Deme una tirita, por favor.", "it": "Mi dia un cerotto, per favore.", "tr": "Yara bandı verir misiniz, lütfen?", "ar": "أعطني لاصق جروح، من فضلك.", "fa": "لطفاً به من چسب زخم بدهید.", "zh-CN": "请给我创可贴。", "ja": "絆創膏をください。" },
    { "tj": "Ман ҳароратсанҷ (градусник) мехоҳам.", "ru": "Мне нужен термометр.", "en": "I need a thermometer.", "de": "Ich brauche ein Thermometer.", "fr": "J'ai besoin d'un thermomètre.", "es": "Necesito un termómetro.", "it": "Ho bisogno di un termometro.", "tr": "Termometreye ihtiyacım var.", "ar": "أحتاج إلى ميزان حرارة.", "fa": "من یک دماسنج می‌خواهم.", "zh-CN": "我需要一个体温计。", "ja": "体温計をください。" },
    { "tj": "Барои кӯдакон чӣ гуна доруи ҳароратпасткунӣ доред?", "ru": "Какое жаропонижающее у вас есть для детей?", "en": "What fever reducer do you have for children?", "de": "Welches fiebersenkende Mittel haben Sie für Kinder?", "fr": "Quel antipyrétique avez-vous pour les enfants?", "es": "¿Qué antipirético tienen para niños?", "it": "Che antipiretico avete per bambini?", "tr": "Çocuklar için hangi ateş düşürücü var?", "ar": "ما هو مخفض الحرارة الذي لديكم للأطفال؟", "fa": "چه داروی تب‌بری برای کودکان دارید؟", "zh-CN": "你们有什么适合儿童的退烧药？", "ja": "子供用の解熱剤はありますか？" },
    { "tj": "Ман ба ин дору аллергия дорам.", "ru": "У меня аллергия на это лекарство.", "en": "I am allergic to this medicine.", "de": "Ich bin allergisch gegen dieses Medikament.", "fr": "Je suis allergique à ce médicament.", "es": "Soy alérgico a este medicamento.", "it": "Sono allergico a questo farmaco.", "tr": "Bu ilaca karşı alerjim var.", "ar": "عندي حساسية من هذا الدواء.", "fa": "من به این دارو آلرژی دارم.", "zh-CN": "我对这个药过敏。", "ja": "私はこの薬にアレルギーがあります。" },
    { "tj": "Рӯзе чанд бор бояд истифода бурд?", "ru": "Сколько раз в день нужно использовать?", "en": "How many times a day should I use it?", "de": "Wie oft am Tag muss ich es verwenden?", "fr": "Combien de fois par jour dois-je l'utiliser?", "es": "¿Cuántas veces al día debo usarlo?", "it": "Quante volte al giorno devo usarlo?", "tr": "Günde kaç kez kullanmalıyım?", "ar": "كم مرة в اليوم يجب استخدامه؟", "fa": "روزی چند بار باید استفاده شود؟", "zh-CN": "一天要吃几次？", "ja": "一日何回使用しますか？" },
    { "tj": "Оё ин дору барои занони ҳомиладор мумкин аст?", "ru": "Можно ли это лекарство беременным?", "en": "Is this medicine safe for pregnant women?", "de": "Dürfen Schwangere dieses Medikament einnehmen?", "fr": "Ce médicament est-il permis pour les femmes enceintes?", "es": "¿Преду salir este medicamento para mujeres embarazadas?", "it": "Questo farmaco è sicuro per le donne in gravidanza?", "tr": "Bu ilaç hamileler için uygun mu?", "ar": "هل هذا الدواء آمن للحوامل؟", "fa": "آیا این دارو برای زنان باردار مجاز است؟", "zh-CN": "孕妇可以吃这个药吗？", "ja": "この薬は妊婦が服用しても大丈夫ですか？" },
    { "tj": "Оё дорухонаи шабонарӯзӣ (24 соат) дар ин наздикиҳо ҳаст?", "ru": "Есть ли поблизости круглосуточная аптека?", "en": "Is there a 24-hour pharmacy nearby?", "de": "Gibt es eine 24-Stunden-Apotheke in der Nähe?", "fr": "Y a-t-il une pharmacie ouverte 24h/24 à proximité?", "es": "¿Hay una farmacia de 24 horas cerca?", "it": "C'è una farmacia aperta 24 ore su 24 qui vicino?", "tr": "Yakınlarda 24 saat açık eczane var mı?", "ar": "هل توجد صيدلية تعمل على مدار 24 ساعة بالقرب من هنا؟", "fa": "آیا داروخانه شبانه‌روزی в این نزدیکی هست؟", "zh-CN": "这附近有24小时营业的药店吗？", "ja": "この近くに24時間営業の薬局はありますか？" }
  ]
},
{
  "id": "hobby_and_free_time",
  "title": {
    "tj": "Хобби", "ru": "Хобби", "en": "Hobby",
    "de": "Hobby", "fr": "Loisirs",
    "es": "Pasatiempo", "it": "Hobby", "tr": "Hobi",
    "ar": "هواية", "fa": "سرگرمی", "zh-CN": "爱好", "ja": "趣味"
  },
  "phrases": [
    { "tj": "Хоббии шумо чист?", "ru": "Какое у вас хобби?", "en": "What is your hobby?", "de": "Was ist Ihr Hobby?", "fr": "Quel est votre passe-temps ?", "es": "¿Cuál es tu pasatiempo?", "it": "Qual è il tuo hobby?", "tr": "Hobiğiniz nedir?", "ar": "ما هي هوايتك؟", "fa": "سرگرمی شما چیست؟", "zh-CN": "你的爱好是什么？", "ja": "一番の趣味は何ですか？" },
    { "tj": "Хоббии ман варзиш аст.", "ru": "Моё хобби — спорт.", "en": "My hobby is sports.", "de": "Mein Hobby ist Sport.", "fr": "Mon hobby est le sport.", "es": "Mi pasatiempo es el deporte.", "it": "Il mio hobby è lo sport.", "tr": "Hobim spor yapmak.", "ar": "هوايتي هي الرياضة.", "fa": "سرگرمی من ورزش است.", "zh-CN": "我的爱好是运动。", "ja": "私的趣味はスポーツです。" },
    { "tj": "Ман дӯст медорам китоб хонам.", "ru": "Я люблю читать книги.", "en": "I love reading books.", "de": "Ich lese gerne Bücher.", "fr": "J'aime lire des livres.", "es": "Me encanta leer libros.", "it": "Mi piace leggere libri.", "tr": "Kitap okumayı seviyorum.", "ar": "أحب قراءة الكتب.", "fa": "من خواندن کتاب را دوست دارم.", "zh-CN": "我喜欢读书。", "ja": "本を読むのが好きです。" },
    { "tj": "Дар вақти холӣ ман расм мекашам.", "ru": "В свободное время я рисую.", "en": "In my free time I draw.", "de": "In meiner Freizeit zeichne ich.", "fr": "Pendant mon temps libre, je dessine.", "es": "En mi tiempo libre dibujo.", "it": "Nel mio tempo libero disegno.", "tr": "Boş zamanlarımda resim yaparım.", "ar": "أرسم في وقت فراغي.", "fa": "در وقت آزاد نقاشی می‌کشم.", "zh-CN": "我在空闲时间画画。", "ja": "暇なときに絵を描きます。" },
    { "tj": "Сурудхонӣ ва мусиқӣ маҳфили ман аст.", "ru": "Пение и музыка — моё увлечение.", "en": "Singing and music are my passion.", "de": "Singen und Musik sind meine Leidenschaft.", "fr": "Le chant et la musique sont ma passion.", "es": "Cantar y la música son mi pasión.", "it": "Il canto e la musica sono la mia passione.", "tr": "Şarkı söylemek ve müzik tutkumdur.", "ar": "الغناء والموسيقى شغفي.", "fa": "آوازخوانی و موسیقی علاقه من است.", "zh-CN": "唱歌和音乐是我的爱好。", "ja": "歌うことと音楽が私の情熱です。" },
    { "tj": "Ман сайругашт дар табиатро дӯст медорам.", "ru": "Я люблю гулять на природе.", "en": "I love walking in nature.", "de": "Ich liebe es, in der Natur spazieren zu gehen.", "fr": "J'aime me promener dans la nature.", "es": "Me encanta caminar en la naturaleza.", "it": "Amo passeggiare nella natura.", "tr": "Doğada yürüyüş yapmayı seviyorum.", "ar": "أحب المشي في الطبيعة.", "fa": "من پیاده‌روی در طبیعت را دوست دارم.", "zh-CN": "我喜欢在大自然中散步。", "ja": "自然の中を散歩するのが好きです。" },
    { "tj": "Оё шумо ба аксбардорӣ мароқ доред?", "ru": "Вы увлекаетесь фотографией?", "en": "Are you interested in photography?", "de": "Interessieren Sie sich für Fotografie?", "fr": "Vous intéressez-vous à la photographie ?", "es": "¿Te interesa la fotografía?", "it": "Ti interessa la fotografia?", "tr": "Fotoğrafçılıkla ilgileniyor musunuz?", "ar": "هل أنت مهتم بالتصوير الفوتوغرافي؟", "fa": "آیا به عکاسی علاقه دارید؟", "zh-CN": "你对摄影感兴趣吗？", "ja": "写真に興味はありますか？" },
    { "tj": "Саёҳат кардан ҳаёти ман аст.", "ru": "Путешествия — это моя жизнь.", "en": "Traveling is my life.", "de": "Reisen ist mein Leben.", "fr": "Voyager, c'est ma vie.", "es": "Viajar es mi vida.", "it": "Viaggiare è la mia vita.", "tr": "Seyahat etmek benim hayatım.", "ar": "السفر هو حياتي.", "fa": "سفر کردن زندگی من است.", "zh-CN": "旅行是我的生命。", "ja": "旅行は私の人生です。" },
    { "tj": "Ман бо дӯстон футбол бозӣ мекунам.", "ru": "Я играю в футбол с друзьями.", "en": "I play football with friends.", "de": "Ich spiele Fußball mit Freunden.", "fr": "Je joue au football avec des amis.", "es": "Juego al fútbol con amigos.", "it": "Gioco a calcio con gli amici.", "tr": "Arkadaşlarımla futbol oynarım.", "ar": "ألعب كرة القدم مع الأصدقاء.", "fa": "من با دوستانم فوتبال بازی می‌کنم.", "zh-CN": "我和朋友踢足球。", "ja": "友達とサッカーをします。" },
    { "tj": "Хӯрокпазӣ хоббии дӯстдоштаи ман аст.", "ru": "Готовка — это моё любимое хобби.", "en": "Cooking is my favorite hobby.", "de": "Kochen ist mein Lieblingshobby.", "fr": "La cuisine est mon passe-temps favori.", "es": "Cocinar es mi pasatiempo favorito.", "it": "Cucinare è il mio hobby preferito.", "tr": "Yemek yapmak en sevdiğim hobim.", "ar": "الطبخ هو هوايتي المفضلة.", "fa": "آشپزی سرگرمی مورد علاقه من است.", "zh-CN": "做饭是我最喜欢的爱好。", "ja": "料理は私の大好きな趣味です。" },
    { "tj": "Дар вақти холӣ ман бозиҳои видеоӣ мекунам.", "ru": "В свободное время я играю в видеоигры.", "en": "I play video games in my free time.", "de": "In der Freizeit spiele ich Videospiele.", "fr": "Je joue à des jeux vidéo pendant mon temps libre.", "es": "En mi tiempo libre juego videojuegos.", "it": "Nel tempo libero gioco ai videogiochi.", "tr": "Boş zamanlarımda video oyunu oynarım.", "ar": "ألعـب ألعاب الفيديو في وقت فراغي.", "fa": "در وقت آزاد بازی‌های ویدئویی می‌کنم.", "zh-CN": "我在空闲时间玩电子游戏。", "ja": "暇なときにビデオゲームをします。" },
    { "tj": "Боғдорӣ ба ман оромиш медиҳад.", "ru": "Садоводство приносит мне спокойствие.", "en": "Gardening brings me peace.", "de": "Gärtnern bringt mir Ruhe.", "fr": "Le jardinage m'apporte la paix.", "es": "La jardinería me da paz.", "it": "Il giardinaggio mi dà pace.", "tr": "Bahçıvanlık bana huzur veriyor.", "ar": "البستنة تمنحني السلام.", "fa": "باغبانی به من آرامش می‌دهد.", "zh-CN": "园艺带给我平静。", "ja": "ガーデニングは私に平穏をもたらします。" },
    { "tj": "Омӯхтани забонҳои хориҷӣ ба ман писанд аст.", "ru": "Мне нравится изучать иностранные языки.", "en": "I like learning foreign languages.", "de": "Ich lerne gerne Fremdsprachen.", "fr": "J'aime apprendre des langues étrangères.", "es": "Me gusta aprender idiomas extranjeros.", "it": "Mi piace imparare le lingue straniere.", "tr": "Yabancı dil öğrenmeyi seviyorum.", "ar": "أحب تعلم اللغات الأجنبية.", "fa": "یادگیری زبان‌های خارجی را دوست دارم.", "zh-CN": "我喜欢学习外语。", "ja": "外国語を学ぶのが好きです。" },
    { "tj": "Ман мехоҳам гитара навохтанро омӯзам.", "ru": "Я хочу научиться играть на гитаре.", "en": "I want to learn to play the guitar.", "de": "Ich möchte lernen, Gitarre zu spielen.", "fr": "Je veux apprendre à jouer de la guitare.", "es": "Quiero aprender a tocar la guitarra.", "it": "Voglio imparare a suonare la chitarra.", "tr": "Gitar çalmayı öğrenmek istiyorum.", "ar": "أريد أن أتعلم عزف الغيتار.", "fa": "من می‌خواهم نواختن گیتار را یاد بگیرم.", "zh-CN": "我想学弹吉他。", "ja": "ギターの弾き方を習いたいです。" },
    { "tj": "Вақти худро бо фоида гузаронед!", "ru": "Проводите время с пользой!", "en": "Spend your time usefully!", "de": "Verbringen Sie Ihre Zeit sinnvoll!", "fr": "Passez votre temps de manière utile !", "es": "¡Pasa tu tiempo de manera útil!", "it": "Trascorri il tuo tempo in modo utile!", "tr": "Zamanınızı faydalı geçirin!", "ar": "اقضِ وقتك بطريقة مفيدة!", "fa": "وقت خود را به خوبی بگذرانید!", "zh-CN": "有意义地度过你的时间！", "ja": "有意義に時間を過ごしてください！" }
  ]
},
  ];

  const readingQuestion = {
    tj: "Маънои ин ҷумла чист?",
    ru: "Что означает это предложение?",
    en: "What does this sentence mean?",
    de: "Was bedeutet dieser Satz?",
    fr: "Que signifie cette phrase ?",
    es: "¿Qué significa esta oración?",
    it: "Che cosa significa questa frase?",
    tr: "Bu cümle ne anlama geliyor?",
    ar: "ماذا تعني هذه الجملة؟",
    fa: "معنی این جمله چیست؟",
    "zh-CN": "这个句子是什么意思？",
    ja: "この文はどういう意味ですか？",
  };

  // Deterministic PRNG (mulberry32): both duel players pass the same shared
  // seed here so they answer the exact same shuffled question set.
  function seededRandom(seed) {
    let state = seed >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(items, rng = Math.random) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index--) {
      const otherIndex = Math.floor(rng() * (index + 1));
      [copy[index], copy[otherIndex]] = [copy[otherIndex], copy[index]];
    }
    return copy;
  }

  const CHOICE_OPTION_COUNT = 4;

  // Cap on how many items a single game round contains.
  const MAX_GAME_ITEMS = 10;

  // Maps each game topic to the closest vocabulary topic so word-based games
  // always pull dictionary words (лӯғат) even when the game topic itself has
  // no dedicated word list in VocabularyCatalog.
  const topicVocabularyMap = {
    greetings: "greetings",
    introduction_details: "pronouns",
    family_and_friends: "family",
    on_the_bus: "transport",
    in_the_taxi: "transport",
    at_work: "verbs",
    shopping: "clothes",
    at_the_restaurant: "fruits",
    at_the_hotel: "places",
    at_the_airport: "transport",
    at_the_university: "school",
    at_the_school: "school",
    at_the_embassy: "adjectives",
    on_the_phone: "verbs",
    at_the_hospital: "bodyParts",
    at_the_bank: "numbers",
    at_the_pharmacy: "vegetables",
    hobby_and_free_time: "adjectives",
  };

  // Sentence-level games are fed from the topic dialogue lines only; every
  // other (word-level) game is fed from the dictionary (лӯғат) words only.
  const DIALOGUE_GAME_TYPES = new Set(["multiple_choice", "listening", "speaking", "writing", "reading"]);

  function usesDialogues(gameType) {
    return DIALOGUE_GAME_TYPES.has(gameType);
  }

  // Builds the {word, translation} pool for a topic from dialogue phrases only.
  function buildDialogueEntries(topic, sourceLanguage, targetLanguage, rng = Math.random) {
    return shuffle(
      topic.phrases
        .filter((phrase) => phrase[sourceLanguage] && phrase[targetLanguage])
        .map((phrase) => ({
          word: phrase[targetLanguage],
          translation: phrase[sourceLanguage],
        })),
      rng,
    ).slice(0, MAX_GAME_ITEMS);
  }

  // Builds the {word, translation} pool for a topic from dictionary words only.
  function buildVocabularyEntries(topic, sourceLanguage, targetLanguage, rng = Math.random) {
    return shuffle(
      VocabularyCatalog.get(topicVocabularyMap[topic.id] || "greetings")
        .filter((entry) => entry[sourceLanguage] && entry[targetLanguage])
        .map((entry) => ({
          word: entry[targetLanguage],
          translation: entry[sourceLanguage],
        })),
      rng,
    ).slice(0, MAX_GAME_ITEMS);
  }

  function buildEntries(gameType, topic, sourceLanguage, targetLanguage, rng = Math.random) {
    return usesDialogues(gameType)
      ? buildDialogueEntries(topic, sourceLanguage, targetLanguage, rng)
      : buildVocabularyEntries(topic, sourceLanguage, targetLanguage, rng);
  }

  // Builds a small, shuffled multiple-choice set: the correct answer plus a
  // few random distractors (default 4 options total) instead of listing every
  // phrase as an option.
  function buildChoiceOptions(correctAnswer, allOptions, optionCount = CHOICE_OPTION_COUNT, rng = Math.random) {
    const distractors = shuffle(allOptions.filter((option) => option !== correctAnswer), rng).slice(
      0,
      Math.max(optionCount - 1, 1),
    );
    return shuffle([correctAnswer, ...distractors], rng);
  }

  function get(gameType, sourceLanguage, targetLanguage, topicId, seed = null) {
    if (!languages.includes(sourceLanguage) || !languages.includes(targetLanguage)) return null;
    const topic = topics.find((item) => item.id === topicId);
    if (!topic) return null;
    // A duel seed makes the whole round deterministic for both players.
    const rng = seed ? seededRandom(seed) : Math.random;
    // Word games (vocabulary_learning, vocab_match, translation,
    // speed_challenge, word_scramble) use dictionary words only;
    // multiple_choice/listening/speaking/writing/reading use dialogue lines.
    const entries = buildEntries(gameType, topic, sourceLanguage, targetLanguage, rng);
    const translations = entries.map((entry) => ({
      sentence: entry.translation,
      answer: entry.word,
    }));
    const sourcePhrases = entries.map((entry) => entry.translation);
    const targetPhrases = entries.map((entry) => entry.word);
    // Default direction: the prompt is in the language being learned and the
    // options are in the learner's own language (receptive recognition).
    const choiceItems = entries.map((entry) => ({
      sentence: entry.word,
      options: buildChoiceOptions(entry.translation, sourcePhrases, CHOICE_OPTION_COUNT, rng),
      correct_answer: entry.translation,
    }));
    // Reverse direction: the prompt is in the learner's own language and the
    // options are in the language being learned (productive recall).
    const reverseChoiceItems = entries.map((entry) => ({
      sentence: entry.translation,
      options: buildChoiceOptions(entry.word, targetPhrases, CHOICE_OPTION_COUNT, rng),
      correct_answer: entry.word,
    }));

    switch (gameType) {
      case "vocab_match":
      case "multiple_choice":
      case "word_scramble":
      case "vocabulary_learning":
        return { pairs: entries };
      case "translation":
        return { items: translations };
      case "speed_challenge":
        return {
          items: reverseChoiceItems.map((item) => ({
            question: item.sentence,
            options: item.options,
            correct_answer: item.correct_answer,
          })),
        };
      case "listening":
        return { items: choiceItems };
      case "speaking":
      case "writing":
        return {
          items: entries.map((entry) => ({
            prompt: entry.translation,
            expected_answer: entry.word,
            keywords: [entry.word],
          })),
        };
      case "reading":
        // The passage is in the language being learned, so the options stay in
        // the learner's own language (the answer must be a meaning, not a copy
        // of a phrase that is already visible in the passage).
        return {
          items: entries.map((entry) => ({
            passage: entry.word,
            question: readingQuestion[sourceLanguage],
            options: buildChoiceOptions(entry.translation, sourcePhrases, CHOICE_OPTION_COUNT, rng),
            correct_answer: entry.translation,
          })),
        };
      default:
        return null;
    }
  }

  function getCount(gameType, topicId) {
    const topic = topics.find((item) => item.id === topicId);
    if (!topic) return 0;
    if (usesDialogues(gameType)) return Math.min(MAX_GAME_ITEMS, topic.phrases.length);
    const vocabularyCount = VocabularyCatalog.get(topicVocabularyMap[topicId] || "greetings").length;
    return Math.min(MAX_GAME_ITEMS, vocabularyCount);
  }

  return { get, getCount, languages, topics };
})();
