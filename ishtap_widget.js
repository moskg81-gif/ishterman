const sleep = ms => new Promise(r => setTimeout(r, ms));

const LANGS = [{ id:"ru", flag:"🇷🇺", label:"RU" },{ id:"ky", flag:"🇰🇬", label:"KY" }];

const CITIES = [
  { id:"bishkek",     g_ru:"Бишкек",              g_ky:"Бишкек",              ru:"Бишкек",            ky:"Бишкек",            t:"city"     },
  { id:"bish_sverd",  g_ru:"Бишкек",              g_ky:"Бишкек",              ru:"Свердловский р-н",  ky:"Свердлов р-ну",     t:"district" },
  { id:"bish_okt",    g_ru:"Бишкек",              g_ky:"Бишкек",              ru:"Октябрьский р-н",   ky:"Октябрь р-ну",      t:"district" },
  { id:"bish_len",    g_ru:"Бишкек",              g_ky:"Бишкек",              ru:"Ленинский р-н",     ky:"Ленин р-ну",        t:"district" },
  { id:"bish_per",    g_ru:"Бишкек",              g_ky:"Бишкек",              ru:"Первомайский р-н",  ky:"Биринчи Май р-ну",  t:"district" },
  { id:"tokmok",      g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Токмок",            ky:"Токмок",            t:"city"     },
  { id:"kara_balta",  g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кара-Балта",        ky:"Кара-Балта",        t:"city"     },
  { id:"kant",        g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кант",              ky:"Кант",              t:"city"     },
  { id:"sokuluk",     g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Сокулук",           ky:"Сокулук",           t:"city"     },
  { id:"belovodskoe", g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Беловодское",       ky:"Беловодское",       t:"city"     },
  { id:"kemin",       g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кемин",             ky:"Кемин",             t:"city"     },
  { id:"alamudun",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Аламүдүн",          ky:"Аламүдүн",          t:"city"     },
  { id:"ivanovka",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Ивановка",          ky:"Ивановка",          t:"city"     },
  { id:"panfilov",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Панфилов",          ky:"Панфилов",          t:"city"     },
  { id:"karakol",     g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Каракол",           ky:"Каракол",           t:"city"     },
  { id:"balykchy",    g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Балыкчы",           ky:"Балыкчы",           t:"city"     },
  { id:"cholpon_ata", g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Чолпон-Ата",        ky:"Чолпон-Ата",        t:"city"     },
  { id:"kyzyl_suu",   g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Кызыл-Суу",         ky:"Кызыл-Суу",         t:"city"     },
  { id:"tyup",        g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Тюп",               ky:"Түп",               t:"city"     },
  { id:"bokonbaevo",  g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Боконбаево",        ky:"Боконбаево",        t:"city"     },
  { id:"ak_suu",      g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Ак-Суу",            ky:"Ак-Суу",            t:"city"     },
  { id:"tamga",       g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Тамга",             ky:"Тамга",             t:"city"     },
  { id:"naryn",       g_ru:"Нарынская обл.",      g_ky:"Нарын облусу",        ru:"Нарын",             ky:"Нарын",             t:"city"     },
  { id:"at_bashy",    g_ru:"Нарынская обл.",      g_ky:"Нарын облусу",        ru:"Ат-Башы",           ky:"Ат-Башы",           t:"city"     },
  { id:"kochkor",     g_ru:"Нарынская обл.",      g_ky:"Нарын облусу",        ru:"Кочкор",            ky:"Кочкор",            t:"city"     },
  { id:"chaek",       g_ru:"Нарынская обл.",      g_ky:"Нарын облусу",        ru:"Чаек",              ky:"Чаек",              t:"city"     },
  { id:"jumgal",      g_ru:"Нарынская обл.",      g_ky:"Нарын облусу",        ru:"Жумгал",            ky:"Жумгал",            t:"city"     },
  { id:"ak_talaa",    g_ru:"Нарынская обл.",      g_ky:"Нарын облусу",        ru:"Ак-Талаа",          ky:"Ак-Талаа",          t:"city"     },
  { id:"talas",       g_ru:"Таласская обл.",      g_ky:"Талас облусу",        ru:"Талас",             ky:"Талас",             t:"city"     },
  { id:"kara_buura",  g_ru:"Таласская обл.",      g_ky:"Талас облусу",        ru:"Кара-Буура",        ky:"Кара-Буура",        t:"city"     },
  { id:"manas_tal",   g_ru:"Таласская обл.",      g_ky:"Талас облусу",        ru:"Манас",             ky:"Манас",             t:"city"     },
  { id:"bakay_ata",   g_ru:"Таласская обл.",      g_ky:"Талас облусу",        ru:"Бакай-Ата",         ky:"Бакай-Ата",         t:"city"     },
  { id:"jalal",       g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Жалал-Абад",        ky:"Жалал-Абад",        t:"city"     },
  { id:"uzgen",       g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Узген",             ky:"Өзгөн",             t:"city"     },
  { id:"tash_kumyr",  g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Таш-Кумыр",         ky:"Таш-Күмүр",         t:"city"     },
  { id:"toktogul",    g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Токтогул",          ky:"Токтогул",          t:"city"     },
  { id:"mayluu_suu",  g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Майлуу-Суу",        ky:"Майлуу-Суу",        t:"city"     },
  { id:"kara_kol",    g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Кара-Куль",         ky:"Кара-Көл",          t:"city"     },
  { id:"suzak",       g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Сузак",             ky:"Сузак",             t:"city"     },
  { id:"bazar_korgon",g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Базар-Коргон",      ky:"Базар-Коргон",      t:"city"     },
  { id:"ala_buka",    g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Ала-Бука",          ky:"Ала-Бука",          t:"city"     },
  { id:"aksy",        g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Аксы",              ky:"Аксы",              t:"city"     },
  { id:"osh_city",    g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Ош",                ky:"Ош",                t:"city"     },
  { id:"kara_suu",    g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Кара-Суу",          ky:"Кара-Суу",          t:"city"     },
  { id:"nookat",      g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Ноокат",            ky:"Ноокат",            t:"city"     },
  { id:"aravan",      g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Араван",            ky:"Аравон",            t:"city"     },
  { id:"gulcha",      g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Гульча",            ky:"Гүлчө",             t:"city"     },
  { id:"kara_kuldzha",g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Кара-Кульджа",      ky:"Кара-Кулжа",        t:"city"     },
  { id:"chong_alai",  g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Чон-Алай",          ky:"Чоң-Алай",          t:"city"     },
  { id:"batken",      g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Баткен",            ky:"Баткен",            t:"city"     },
  { id:"kyzyl_kiya",  g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Кызыл-Кия",         ky:"Кызыл-Кыя",         t:"city"     },
  { id:"isfana",      g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Исфана",            ky:"Исфана",            t:"city"     },
  { id:"sulukta",     g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Сулюкта",           ky:"Сулукта",           t:"city"     },
  { id:"kadamjay",    g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Кадамжай",          ky:"Кадамжай",          t:"city"     },
  { id:"leilek",      g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Лейлек",            ky:"Лейлек",            t:"city"     },
  { id:"vorukh",      g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Воруx",             ky:"Ворух",             t:"city"     },
];
const locName  = (loc, l) => l==="ru" ? loc.ru  : loc.ky;
const locGroup = (loc, l) => l==="ru" ? loc.g_ru : loc.g_ky;
const locIcon  = t => t==="city"?"🏙":t==="district"?"🏘":"🌿";

const CATS = [
  { id:0, icon:"🏗", ru:"Стройка",        ky:"Курулуш",       color:"#185FA5", bg:"#E6F1FB" },
  { id:1, icon:"🌾", ru:"Поле",           ky:"Талаа",         color:"#5A7A0F", bg:"#EEF5DC" },
  { id:2, icon:"🚴", ru:"Курьер",         ky:"Курьер",        color:"#7C3D99", bg:"#F2E6FC" },
  { id:3, icon:"🔧", ru:"Ремонт техники", ky:"Техника оңдоо", color:"#B05E0A", bg:"#FAEEDD" },
  { id:4, icon:"🌱", ru:"Огород и сад",   ky:"Бак-дарак",     color:"#0F6E56", bg:"#E1F5EE" },
  { id:5, icon:"💪", ru:"Грузчик",        ky:"Жүк ташуучу",  color:"#A32D2D", bg:"#FCEBEB" },
  { id:6, icon:"🚗", ru:"Попутка",        ky:"Попутка",       color:"#1A6B8A", bg:"#DFF0F8" },
  { id:7, icon:"🎉", ru:"Той-Аш",         ky:"Той-Аш",        color:"#8A3A7A", bg:"#F5E6F5" },
  { id:8, icon:"🐄", ru:"Мал чарба",      ky:"Мал чарба",     color:"#5E4A0A", bg:"#F5ECDA" },
  { id:9, icon:"⚡", ru:"Электрика",      ky:"Электрика",     color:"#B08A00", bg:"#FBF3CC" },
  { id:10,icon:"🛒", ru:"Купи-продай",    ky:"Сатып ал-сат",  color:"#2A7A2A", bg:"#DFF5DF" },
];

const PERIOD_OPTIONS_RU = ["На один день","На два дня","На три дня","До конца недели","До конца месяца","Другое"];
const PERIOD_OPTIONS_KY = ["Бир күн","Эки күн","Үч күн","Жума бүтүшүнө чейин","Ай бүтүшүнө чейин","Башка"];

const T = {
  ru:{
    appName:"ИшТап", search:"Поиск заданий...", allCities:"Все населённые пункты",
    useGeo:"📡 Рядом", locating:"...", allCats:"Все",
    sortNew:"Новые", sortCheap:"↑ Дешевле", sortExpensive:"↓ Дороже", sortNear:"📍 Ближе",
    urgent:"Срочно", noTasks:"Задачи не найдены",
    create:"Создать", profile:"Профиль", tasks:"Задачи",
    newTask:"Новая задача", createMore:"Создать ещё", searchLoc:"Поиск...",
    fTitle:"Название задачи", fCat:"Категория", fBudget:"Бюджет (сом)", fLoc:"Населённый пункт", fDesc:"Описание",
    phTitle:"Например: копать огород", phDesc:"Подробнее о задаче...",
    completed:"выполнено", customer:"Заказчик", executor:"Исполнитель",
    myTasks:"Мои задания", myResponses:"Мои отклики", notifications:"Уведомления",
    settings:"Настройки", logout:"Выйти",
    statCreated:"Создано", statDone:"Выполнено", statRating:"Рейтинг",
    language:"Язык", lBudget:"💰 Бюджет", lTime:"🕐 Время", lCity:"📍 Место",
    back:"← Назад", contact:"Контакт", daysAgo:"дн. назад",
    paymentTitle:"Подтверждение", payingNow:"Публикуем...", cancel:"Отмена",
    consentCreate:"Я согласен, что плата за размещение задания (20 сом) не возвращается, даже если никто не откликнулся.",
    consentRespond:"Я согласен, что плата за отклик (20 сом) не возвращается, даже если заказчик выберет другого.",
    checkboxRequired:"Поставьте галочку для продолжения",
    publish:"Опубликовать задание",
    statusOpen:"🟢 Активно", statusClosed:"🟡 Исполнитель выбран", statusExpired:"⚫ Истёк срок", statusCompleted:"✅ Завершено",
    taskDetail:"Подробности задания", respondersTitle:"Отклики",
    selectExec:"✅ Выбрать исполнителя", declineExec:"Отклонить",
    completeTask:"🏁 Завершить задание", completeConfirm:"Подтвердить завершение",
    completeHint:"После завершения задание нельзя реактивировать",
    reactivate:"🔄 Снова открыть", reactLimit:"Лимит реактиваций (3). Создайте новое задание.",
    expiresIn:"Истекает через",
    respond:"Откликнуться", respondSent:"Отклик отправлен!",
    alreadyResponded:"Вы уже откликнулись",
    noRespondsYet:"Откликов пока нет",
    priceOffer:"Ваша цена (сом):", offerComment:"Комментарий (необязательно):",
    chosenBadge:"✅ Выбран заказчиком",
    taskClosed:"Задание закрыто для откликов",
    notifTitle:"Уведомления", noNotif:"Уведомлений нет",
    confirm:"Подтвердить",
    step1Label:"Описание задания", step2Label:"Детали",
    fAddress:"Адрес работы", phAddress:"Точный адрес выполнения работ",
    fStartDate:"Дата и время начала", fPeriod:"Период выполнения (необязательно)",
    fPhone:"Контактный телефон", phPhone:"+996 XXX XX XX XX",
    errRequired:" — обязательное поле", errPhone:" — введите корректный номер",
    periodPlaceholder:"Выберите или введите период",
    noCreateForExecutor:"Исполнители не могут создавать задания",
    loginTitle:"Вход / Регистрация", phoneLabel:"Номер телефона",
    loginBtn:"Войти", errPhoneFormat:"Введите номер в формате +996XXXXXXXXX",
    roleTitle:"Кто вы?", roleSub:"Выберите роль. Её можно сменить позже в профиле.",
    roleCustomer:"Я заказчик", roleCustomerSub:"Публикую задания",
    roleExecutor:"Я исполнитель", roleExecutorSub:"Выполняю задания",
    roleLabel_customer:"Заказчик", roleLabel_executor:"Исполнитель",
    namePlaceholder:"Ваше имя", saveBtn:"Сохранить",
    myOwnTask:"Моё",
    editProfile:"Редактировать профиль", editProfileTitle:"Профиль",
    fName:"Имя", fAbout:"О себе", fSkills:"Навыки (через запятую)", fExp:"Опыт работы",
    phAbout:"Расскажите о себе...", phSkills:"Например: сварка, кладка, штукатурка", phExp:"Например: 5 лет в строительстве",
    avatarChange:"Изменить фото", avatarRemove:"Удалить фото",
    roleFixed:"Роль фиксирована при регистрации. Для смены роли создайте новый аккаунт.",
    roleFixedBtn:"Понятно", about:"О себе", skills:"Навыки", experience:"Опыт",
    myResponsesTitle:"Мои отклики", noMyResponses:"Вы ещё не откликались на задания",
    respStatus_pending:"⏳ Ожидает", respStatus_chosen:"✅ Выбран", respStatus_declined:"❌ Отклонён",
    yourOffer:"Ваша цена:",
    leaveReview:"Оставить отзыв", reviewTitle:"Отзыв",
    reviewRating:"Оценка", reviewText:"Комментарий (необязательно)",
    phReviewText:"Расскажите о работе...",
    submitReview:"Отправить отзыв", alreadyReviewed:"Отзыв оставлен",
    noReviews:"Отзывов пока нет", reviewsTitle:"Отзывы",
    reviewCount:"отзывов", viewProfile:"Профиль исполнителя",
    userProfileTitle:"Профиль пользователя",
  },
  ky:{
    appName:"ИшТап", search:"Тапшырмаларды издөө...", allCities:"Бардык айылдар жана шаарлар",
    useGeo:"📡 Жанымда", locating:"...", allCats:"Баары",
    sortNew:"Жаңылар", sortCheap:"↑ Арзан", sortExpensive:"↓ Кымбат", sortNear:"📍 Жакын",
    urgent:"Шашылыш", noTasks:"Тапшырма табылган жок",
    create:"Түзүү", profile:"Профиль", tasks:"Тапшырмалар",
    newTask:"Жаңы тапшырма", createMore:"Дагы түзүү", searchLoc:"Издөө...",
    fTitle:"Тапшырманын аты", fCat:"Категория", fBudget:"Бюджет (сом)", fLoc:"Айыл / шаар", fDesc:"Сүрөттөмө",
    phTitle:"Мисалы: бак казуу", phDesc:"Тапшырма жөнүндө кеңири...",
    completed:"аткарылган", customer:"Буйрутмачы", executor:"Аткаруучу",
    myTasks:"Менин тапшырмаларым", myResponses:"Менин жооптарым", notifications:"Билдирмелер",
    settings:"Жөндөөлөр", logout:"Чыгуу",
    statCreated:"Түзүлгөн", statDone:"Аткарылган", statRating:"Рейтинг",
    language:"Тил", lBudget:"💰 Бюджет", lTime:"🕐 Убакыт", lCity:"📍 Жер",
    back:"← Артка", contact:"Байланыш", daysAgo:"күн мурун",
    paymentTitle:"Ырастоо", payingNow:"Жарыяланууда...", cancel:"Жокко чыгаруу",
    consentCreate:"Мен тапшырманы жайгаштыруу үчүн 20 сомдун кайтарылгысыз экенин макулдаймын.",
    consentRespond:"Мен жооп берүү үчүн 20 сомдун кайтарылгысыз экенин макулдаймын.",
    checkboxRequired:"Уланууга белгилеңиз",
    publish:"Тапшырманы жарыялоо",
    statusOpen:"🟢 Активдүү", statusClosed:"🟡 Аткаруучу тандалды", statusExpired:"⚫ Мөөнөтү өттү", statusCompleted:"✅ Аяктады",
    taskDetail:"Тапшырма маалыматы", respondersTitle:"Жооптор",
    selectExec:"✅ Аткаруучуну тандоо", declineExec:"Баш тартуу",
    completeTask:"🏁 Тапшырманы аяктоо", completeConfirm:"Аяктоону ырастоо",
    completeHint:"Аяктагандан кийин тапшырманы кайра ачуу мүмкүн эмес",
    reactivate:"🔄 Кайра ачуу", reactLimit:"Реактивация чеги (3). Жаңы тапшырма түзүңүз.",
    expiresIn:"Мөөнөтү:",
    respond:"Жооп берүү", respondSent:"Жооп жөнөтүлдү!",
    alreadyResponded:"Жооп бердиңиз",
    noRespondsYet:"Жооп жок азырынча",
    priceOffer:"Сиздин баа (сом):", offerComment:"Комментарий (милдеттүү эмес):",
    chosenBadge:"✅ Буйрутмачы тандады",
    taskClosed:"Тапшырма жабылды",
    notifTitle:"Билдирмелер", noNotif:"Билдирмелер жок",
    confirm:"Ырастоо",
    step1Label:"Тапшырма сүрөттөмөсү", step2Label:"Чоо-жайы",
    fAddress:"Иш дареги", phAddress:"Иштин так дареги",
    fStartDate:"Башталуу күнү жана убактысы", fPeriod:"Аткаруу мезгили (милдеттүү эмес)",
    fPhone:"Байланыш телефону", phPhone:"+996 XXX XX XX XX",
    errRequired:" — милдеттүү талаа", errPhone:" — туура номер киргизиңиз",
    periodPlaceholder:"Мезгилди тандаңыз же жазыңыз",
    noCreateForExecutor:"Аткаруучулар тапшырма түзө албайт",
    loginTitle:"Кирүү / Каттоо", phoneLabel:"Телефон номери",
    loginBtn:"Кирүү", errPhoneFormat:"+996XXXXXXXXX форматында жазыңыз",
    roleTitle:"Сиз кимсиз?", roleSub:"Ролду тандаңыз. Аны кийинчерек профилден өзгөртүүгө болот.",
    roleCustomer:"Мен буйрутмачымын", roleCustomerSub:"Тапшырмалар жарыялайм",
    roleExecutor:"Мен аткаруучумун", roleExecutorSub:"Тапшырмаларды аткарам",
    roleLabel_customer:"Буйрутмачы", roleLabel_executor:"Аткаруучу",
    namePlaceholder:"Атыңыз", saveBtn:"Сактоо",
    myOwnTask:"Менин",
    editProfile:"Профилди түзөтүү", editProfileTitle:"Профиль",
    fName:"Аты", fAbout:"Өзүм жөнүндө", fSkills:"Жөндөмдөр (үтүр менен)", fExp:"Иш тажрыйбасы",
    phAbout:"Өзүңүз жөнүндө айтыңыз...", phSkills:"Мисалы: ташчы, балка, суваксы", phExp:"Мисалы: курулушта 5 жыл",
    avatarChange:"Сүрөттү өзгөртүү", avatarRemove:"Сүрөттү жок кылуу",
    roleFixed:"Каттоодо роль бекемделет. Ролду өзгөртүү үчүн жаңы аккаунт түзүңүз.",
    roleFixedBtn:"Түшүндүм", about:"Өзүм жөнүндө", skills:"Жөндөмдөр", experience:"Тажрыйба",
    myResponsesTitle:"Менин жооптарым", noMyResponses:"Сиз тапшырмаларга жооп берген жоксуз",
    respStatus_pending:"⏳ Күтүүдө", respStatus_chosen:"✅ Тандалды", respStatus_declined:"❌ Баш тартылды",
    yourOffer:"Сиздин баа:",
    leaveReview:"Баа берүү", reviewTitle:"Пикир",
    reviewRating:"Баа", reviewText:"Комментарий (милдеттүү эмес)",
    phReviewText:"Иш жөнүндө айтыңыз...",
    submitReview:"Пикир жөнөтүү", alreadyReviewed:"Пикир калтырдыңыз",
    noReviews:"Пикирлер жок", reviewsTitle:"Пикирлер",
    reviewCount:"пикир", viewProfile:"Аткаруучунун профили",
    userProfileTitle:"Колдонуучунун профили",
  }
};

const css = `
.dark-mode{--color-background-primary:#1C1C1E;--color-background-secondary:#2C2C2E;--color-background-tertiary:#111113;--color-text-primary:#F2F2F7;--color-text-secondary:#8E8E93;--color-border-tertiary:#38383A;}
.dark-mode input,.dark-mode select,.dark-mode textarea{background:#2C2C2E;border-color:#38383A;color:#F2F2F7;}
.dark-mode input::placeholder,.dark-mode textarea::placeholder{color:#636366;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
@keyframes tabSlide{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
@keyframes popIn{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.fe{animation:fadeUp 0.22s cubic-bezier(.22,.68,0,1.2) both}
.si{animation:slideIn 0.24s cubic-bezier(.22,.68,0,1.1) both}
.tc{animation:tabSlide 0.2s cubic-bezier(.22,.68,0,1.1) both}
.pi{animation:popIn 0.3s cubic-bezier(.22,.68,0,1.2) both}
.fi{animation:fadeIn 0.3s ease both}
.card{transition:transform 0.13s ease;cursor:pointer}.card:hover{transform:translateY(-2px)}.card:active{transform:scale(0.97)}
.nb{transition:transform 0.11s ease}.nb:active{transform:scale(0.84)}
.pb{transition:background 0.14s,color 0.14s,border-color 0.14s,transform 0.1s}.pb:active{transform:scale(0.91)}
.rb{transition:background 0.14s,color 0.14s,border-color 0.14s,transform 0.1s}.rb:hover{filter:brightness(1.08)}.rb:active{transform:scale(0.95)}
.back-btn{display:flex;align-items:center;gap:4px;background:none;border:none;cursor:pointer;color:#185FA5;font-size:13px;font-weight:600;padding:4px 2px;flex-shrink:0;font-family:inherit;transition:opacity 0.12s}.back-btn:hover{opacity:0.7}
input,select,textarea{background:var(--color-background-secondary,#f4f4f4);border:0.5px solid var(--color-border-tertiary,#e0e0e0);border-radius:10px;padding:9px 12px;font-size:13px;color:var(--color-text-primary,#111);outline:none;font-family:inherit;}
input:focus,select:focus,textarea:focus{border-color:#185FA5}
.err-input{border-color:#A32D2D !important}
::-webkit-scrollbar{display:none}
*{box-sizing:border-box;}
`;

// ─── Storage keys & helpers ───────────────────────────────────────────────────
const SK_USER      = "ishtap_user";
const SK_USERS     = "ishtap_users_db";
const SK_TASKS     = "ishtap_tasks_db";
const SK_RESPONSES = "ishtap_responses_db";
const SK_REVIEWS   = "ishtap_reviews_db";
const SK_SETTINGS  = "ishtap_settings";
// Единая глобальная таблица: [{id, userId, text, read, time}]
const SK_NOTIFS    = "ishtap_notifications_db";

const loadSettings  = () => { try{const v=localStorage.getItem(SK_SETTINGS); return v?JSON.parse(v):{notificationsOn:true,darkTheme:false,myCategories:[]};}catch{return{notificationsOn:true,darkTheme:false,myCategories:[]};} };
const saveSettings  = s  => { try{localStorage.setItem(SK_SETTINGS,JSON.stringify(s));}catch{} };
const loadUser      = () => { try{const v=localStorage.getItem(SK_USER);      return v?JSON.parse(v):null; }catch{return null;} };
const saveUser      = u  => { try{localStorage.setItem(SK_USER,JSON.stringify(u));}catch{} };
const clearUser     = () => { try{localStorage.removeItem(SK_USER);}catch{} };
const loadUsersDB   = () => { try{const v=localStorage.getItem(SK_USERS);     return v?JSON.parse(v):{};  }catch{return{};} };
const saveUsersDB   = db => { try{localStorage.setItem(SK_USERS,JSON.stringify(db));}catch{} };
const loadTasksDB   = () => { try{const v=localStorage.getItem(SK_TASKS);     return v?JSON.parse(v):null;}catch{return null;} };
const saveTasksDB   = ts => { try{localStorage.setItem(SK_TASKS,JSON.stringify(ts));}catch{} };
const loadRespDB    = () => { try{const v=localStorage.getItem(SK_RESPONSES); return v?JSON.parse(v):[];  }catch{return[];} };
const saveRespDB    = rs => { try{localStorage.setItem(SK_RESPONSES,JSON.stringify(rs));}catch{} };
const loadReviewsDB = () => { try{const v=localStorage.getItem(SK_REVIEWS);   return v?JSON.parse(v):[];  }catch{return[];} };
const saveReviewsDB = rv => { try{localStorage.setItem(SK_REVIEWS,JSON.stringify(rv));}catch{} };
const loadNotifsDB  = () => { try{const v=localStorage.getItem(SK_NOTIFS);    return v?JSON.parse(v):[];  }catch{return[];} };
const saveNotifsDB  = arr=> { try{localStorage.setItem(SK_NOTIFS,JSON.stringify(arr));}catch{} };

const nowStr = () => { const d=new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`; };
const initials = n => { const p=(n||"").trim().split(" ").filter(Boolean); return p.length>=2?(p[0][0]+p[1][0]).toUpperCase():p[0]?p[0].slice(0,2).toUpperCase():"??"; };
const avatarColor = id => { const c=["#185FA5","#0F6E56","#7C3D99","#B05E0A","#A32D2D","#5A7A0F"]; let h=0; for(let i=0;i<(id||"").length;i++)h=(h*31+id.charCodeAt(i))&0xffff; return c[h%c.length]; };

const MOCK_OWNER_ID  = "mock_user_8821";
const MOCK_OWNER     = { id:MOCK_OWNER_ID,  phone:"+99655500000", name:"Бакыт М." };
const DEMO_EXEC_ID   = "demo_exec_1337";
const DEMO_EXECUTOR  = { id:DEMO_EXEC_ID, phone:"+99670011223", name:"Эрлан К.", about:"Строитель с опытом 7 лет.", skills:["кладка","штукатурка","сварка"], experience:"7 лет в строительстве" };

const SEED_TASKS = [
  { id:0,  createdAt:Date.now()-86400000*2, cat:0, price:6000, city:"bishkek",  time:"Вчера",    urgent:false, dist:0.3, ru:"✅ ТЕСТ: Покрасить забор",        ky:"✅ ТЕСТ: Тосмону боёо",          dRu:"Тестовое завершённое задание — можно оставить отзыв исполнителю.", dKy:"Тест тапшырма — аткаруучуга пикир калтырса болот.", ownerId:"__CURRENT__", _demo:true },
  { id:1,  createdAt:Date.now()-3600000*5,  cat:0, price:5000, city:"bishkek",  time:"Бүгүн",    urgent:true,  dist:0.4, ru:"Помощь на стройке дома",        ky:"Үй куруусуна жардам",           dRu:"Нужны разнорабочие, кладка кирпича 2 этажа.", dKy:"Кирпич салуу, 2 кабат.",      ownerId:"__CURRENT__" },
  { id:2,  createdAt:Date.now()-3600000*3,  cat:1, price:3000, city:"osh_city", time:"Эртең",    urgent:false, dist:1.2, ru:"Убрать урожай пшеницы",         ky:"Буудай оруп жыйноо",            dRu:"Поле 2 га, сдельная оплата.",  dKy:"2 га талаа.",                 ownerId:MOCK_OWNER_ID },
  { id:3,  createdAt:Date.now()-3600000*2,  cat:2, price:800,  city:"bishkek",  time:"Бүгүн",    urgent:true,  dist:0.7, ru:"Доставка документов по городу", ky:"Шаар боюнча документ жеткирүү", dRu:"3 точки, своя машина.",        dKy:"3 жер, өз унаасы.",           ownerId:MOCK_OWNER_ID },
  { id:4,  createdAt:Date.now()-3600000*1,  cat:3, price:2500, city:"karakol",  time:"Шейшемби", urgent:false, dist:2.1, ru:"Ремонт стиральной машины",      ky:"Кир жуугуч машинаны оңдоо",     dRu:"Машина не отжимает, Samsung.", dKy:"Машина сыкпайт, Samsung.",    ownerId:MOCK_OWNER_ID },
  { id:5,  createdAt:Date.now()-1800000,    cat:4, price:1500, city:"bishkek",  time:"Жекшемби", urgent:false, dist:0.9, ru:"Вскопать огород 3 сотки",       ky:"3 сотук жерди казуу",           dRu:"Участок 3 сотки, под посадку.",dKy:"3 сотук жер.",                ownerId:"__CURRENT__" },
  { id:6,  createdAt:Date.now()-900000,     cat:5, price:4000, city:"jalal",    time:"Ишемби",   urgent:false, dist:3.5, ru:"Перенести мебель при переезде", ky:"Көчүүдө эмерек көтөрүү",        dRu:"2-комнатная, 3 этаж без лифта.",dKy:"2 бөлмөлүү, 3-кабат.",       ownerId:MOCK_OWNER_ID },
  { id:7,  createdAt:Date.now()-600000,     cat:0, price:8000, city:"bishkek",  time:"Бүгүн",    urgent:true,  dist:1.5, ru:"Залить фундамент гаража",       ky:"Гараждын фундаментин куюу",     dRu:"6x4м, бригада 3-4 чел.",       dKy:"6x4м, 3-4 адам.",             ownerId:MOCK_OWNER_ID },
  { id:8,  createdAt:Date.now()-300000,     cat:1, price:2000, city:"naryn",    time:"Эртең",    urgent:false, dist:4.2, ru:"Полив и уход за полем",         ky:"Талааны суугаруу",              dRu:"Огород 1 га, прополка.",       dKy:"1 га жер.",                   ownerId:MOCK_OWNER_ID },
];
const buildInitTasks = uid => SEED_TASKS.map(s=>({
  ...s,
  ownerId:   s.ownerId==="__CURRENT__" ? uid : s.ownerId,
  status:    s._demo ? "completed" : "open",
  completed: s._demo ? true : false,
  reactivation_count: 0,
  chosen_executor_id: s._demo ? DEMO_EXEC_ID : null,
  expires_at: new Date(Date.now()+7*86400000),
}));

const ensureDemoDB = () => {
  const db=loadUsersDB();
  if (!db[DEMO_EXECUTOR.phone]) { db[DEMO_EXECUTOR.phone]=DEMO_EXECUTOR; saveUsersDB(db); }
};

const Ctx = createContext({});
const useApp = () => useContext(Ctx);

function useUserById(uid) {
  const { currentUser, usersDB } = useApp();
  if (!uid) return null;
  if (uid===currentUser?.id) return currentUser;
  if (uid===MOCK_OWNER_ID)   return MOCK_OWNER;
  if (uid===DEMO_EXEC_ID)    return DEMO_EXECUTOR;
  return usersDB[Object.keys(usersDB).find(k=>usersDB[k].id===uid)] || { id:uid, name:uid.slice(0,8), phone:"—" };
}
function useUserName(uid)  { return useUserById(uid)?.name  || "—"; }
function useUserPhone(uid) { return useUserById(uid)?.phone || "—"; }

function calcRating(reviews, uid) {
  const r=reviews.filter(rv=>rv.targetId===uid);
  if (!r.length) return null;
  return { avg:(r.reduce((s,rv)=>s+rv.rating,0)/r.length).toFixed(1), count:r.length };
}

function StarRating({ value, onChange, size=22 }) {
  const [hover,setHover]=useState(0);
  return (
    <div style={{display:"flex",gap:4}}>
      {[1,2,3,4,5].map(s=>(
        <span key={s} onClick={()=>onChange&&onChange(s)} onMouseEnter={()=>onChange&&setHover(s)} onMouseLeave={()=>setHover(0)}
          style={{fontSize:size,cursor:onChange?"pointer":"default",color:(hover||value)>=s?"#BA7517":"#ddd",transition:"color 0.1s",userSelect:"none"}}>★</span>
      ))}
    </div>
  );
}
function Stars({ r, size=13 }) {
  if (!r && r!==0) return <span style={{fontSize:size,color:"var(--color-text-secondary,#888)"}}>—</span>;
  const n=parseFloat(r),full=Math.round(n);
  return <span style={{color:"#BA7517",fontSize:size,fontWeight:500,letterSpacing:-1}}>{"★".repeat(full)}{"☆".repeat(5-full)}</span>;
}
function Pill({ children, color, bg }) {
  return <span style={{fontSize:11,fontWeight:500,padding:"2px 9px",borderRadius:20,background:bg,color,whiteSpace:"nowrap"}}>{children}</span>;
}
function SectionCard({ children, delay=0, style={} }) {
  return <div className="fe" style={{background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:14,padding:"13px 14px",marginBottom:10,animationDelay:`${delay}s`,...style}}>{children}</div>;
}
function BackBtn({ onPress }) {
  const { t, pop } = useApp();
  return (
    <button className="back-btn" onClick={onPress||pop}>
      <span style={{fontSize:15,lineHeight:1}}>←</span>
      <span>{t.back.replace("← ","")}</span>
    </button>
  );
}
function ScreenHeader({ title, onBack, right }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 14px",background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",flexShrink:0}}>
      <BackBtn onPress={onBack}/>
      <p style={{margin:0,flex:1,fontSize:14,fontWeight:600,color:"var(--color-text-primary,#111)",textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{title}</p>
      <div style={{minWidth:60,display:"flex",justifyContent:"flex-end"}}>{right||null}</div>
    </div>
  );
}
function StepBar({ step, lang, t }) {
  return (
    <div style={{display:"flex",alignItems:"center",padding:"10px 20px",background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",flexShrink:0}}>
      {[1,2].map((s,i)=>{
        const done=step>s,active=step===s;
        return (
          <div key={s} style={{display:"flex",alignItems:"center",flex:i===0?1:"auto"}}>
            <div style={{width:24,height:24,borderRadius:12,background:active||done?"#185FA5":"var(--color-background-secondary,#f4f4f4)",border:active||done?"none":"0.5px solid var(--color-border-tertiary,#e0e0e0)",color:active||done?"#fff":"var(--color-text-secondary,#888)",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>{done?"✓":s}</div>
            <span style={{fontSize:11,fontWeight:active?600:400,color:active?"#185FA5":"var(--color-text-secondary,#888)",marginLeft:5,whiteSpace:"nowrap"}}>{s===1?t.step1Label:t.step2Label}</span>
            {i===0&&<div style={{flex:1,height:2,background:step>1?"#185FA5":"var(--color-border-tertiary,#e0e0e0)",margin:"0 8px",transition:"background 0.3s"}}/>}
          </div>
        );
      })}
    </div>
  );
}
function Avatar({ user, size=54, fontSize=18 }) {
  if (user?.avatar) return (
    <div style={{width:size,height:size,borderRadius:size/2,overflow:"hidden",flexShrink:0,border:"2px solid var(--color-border-tertiary,#e0e0e0)"}}>
      <img src={user.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
    </div>
  );
  return (
    <div style={{width:size,height:size,borderRadius:size/2,background:avatarColor(user?.id||""),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize,fontWeight:700,flexShrink:0}}>
      {initials(user?.name)}
    </div>
  );
}
function ReviewBtn({ taskId, targetId, taskTitle, reviews, currentUser, push, t }) {
  const existing=reviews.find(r=>r.taskId===taskId&&r.authorId===currentUser.id&&r.targetId===targetId);
  return (
    <button className="rb" onClick={()=>push({type:"leaveReview",taskId,targetId,taskTitle})}
      style={{width:"100%",padding:"10px",borderRadius:10,border:existing?"0.5px solid var(--color-border-tertiary,#e0e0e0)":"none",cursor:"pointer",background:existing?"var(--color-background-secondary,#f4f4f4)":"#185FA5",color:existing?"var(--color-text-secondary,#888)":"#fff",fontSize:13,fontWeight:600,marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
      {existing?<><Stars r={existing.rating} size={13}/> {t.alreadyReviewed}</>:<>⭐ {t.leaveReview}</>}
    </button>
  );
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function LoginScreen({ lang, setLang, onLogin }) {
  const t=T[lang];
  const [phone,setPhone]=useState("+996 ");
  const [loading,setLoading]=useState(false);
  const [errPhone,setErrPhone]=useState(false);
  const norm=p=>p.replace(/\s/g,"");
  const handleLogin=async()=>{
    const n=norm(phone);
    if(!/^\+996\d{9}$/.test(n)){setErrPhone(true);return;}
    setErrPhone(false);setLoading(true);await sleep(400);setLoading(false);
    const db=loadUsersDB();let user=db[n];
    if(!user){user={id:"u_"+Date.now(),phone:n,name:lang==="ru"?"Пользователь":"Колдонуучу",role:null};db[n]=user;saveUsersDB(db);}
    onLogin(user);
  };
  const fmt=raw=>{let d=raw.replace(/\D/g,"");if(d.startsWith("996"))d=d.slice(3);if(d.startsWith("0"))d=d.slice(1);d=d.slice(0,9);let o="+996";if(d.length>0)o+=" "+d.slice(0,3);if(d.length>3)o+=" "+d.slice(3,5);if(d.length>5)o+=" "+d.slice(5,7);if(d.length>7)o+=" "+d.slice(7,9);return o;};
  return (
    <div className="fi" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <div style={{background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <span style={{fontSize:18,fontWeight:700,color:"#185FA5"}}>ИшТап 🇰🇬</span>
        <div style={{display:"flex",gap:4}}>{LANGS.map(l=><button key={l.id} className="pb" onClick={()=>setLang(l.id)} style={{padding:"3px 8px",borderRadius:6,border:"0.5px solid",cursor:"pointer",fontSize:11,fontWeight:lang===l.id?700:400,borderColor:lang===l.id?"#185FA5":"var(--color-border-tertiary,#e0e0e0)",background:lang===l.id?"#185FA5":"transparent",color:lang===l.id?"#fff":"var(--color-text-secondary,#888)"}}>{l.flag} {l.label}</button>)}</div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 24px 40px"}}>
        <div className="pi" style={{fontSize:56,marginBottom:8}}>🔐</div>
        <p style={{fontSize:20,fontWeight:700,color:"var(--color-text-primary,#111)",margin:"0 0 4px",textAlign:"center"}}>{t.loginTitle}</p>
        <p style={{fontSize:13,color:"var(--color-text-secondary,#888)",margin:"0 0 28px",textAlign:"center"}}>ИшТап КГ</p>
        <div style={{width:"100%",maxWidth:340}}>
          <div style={{marginBottom:16}}>
            <p style={{margin:"0 0 5px",fontSize:12,color:errPhone?"#A32D2D":"var(--color-text-secondary,#888)",fontWeight:errPhone?600:400}}>📞 {t.phoneLabel}{errPhone?" — "+t.errPhoneFormat:""}</p>
            <input type="tel" value={phone} onChange={e=>{setPhone(fmt(e.target.value));setErrPhone(false);}} placeholder="+996 XXX XX XX XX" className={errPhone?"err-input":""} style={{width:"100%",fontSize:15}}/>
          </div>
          <button className="rb" onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:"pointer",background:"#185FA5",color:"#fff",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><span style={{animation:"spin 0.8s linear infinite",display:"inline-block"}}>⏳</span>...</>:t.loginBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleScreen({ lang, user, onSelectRole }) {
  const t=T[lang];
  const roles=[{id:"customer",icon:"🧑‍💼",label:t.roleCustomer,sub:t.roleCustomerSub,color:"#185FA5",bg:"#E6F1FB"},{id:"executor",icon:"🔨",label:t.roleExecutor,sub:t.roleExecutorSub,color:"#0F6E56",bg:"#E1F5EE"}];
  return (
    <div className="fi" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <div style={{background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",padding:"12px 16px",flexShrink:0}}><span style={{fontSize:18,fontWeight:700,color:"#185FA5"}}>ИшТап 🇰🇬</span></div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
        <div style={{width:60,height:60,borderRadius:30,background:avatarColor(user.id),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20,fontWeight:700,marginBottom:10}}>{initials(user.name)}</div>
        <p style={{fontSize:18,fontWeight:700,color:"var(--color-text-primary,#111)",margin:"0 0 4px"}}>{user.name}</p>
        <p style={{fontSize:12,color:"var(--color-text-secondary,#888)",margin:"0 0 28px"}}>{user.phone}</p>
        <p style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary,#111)",margin:"0 0 6px",textAlign:"center"}}>{t.roleTitle}</p>
        <p style={{fontSize:12,color:"var(--color-text-secondary,#888)",margin:"0 0 24px",textAlign:"center",lineHeight:1.6}}>{t.roleSub}</p>
        <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:12}}>
          {roles.map(r=>(
            <button key={r.id} className="card" onClick={()=>onSelectRole(r.id)} style={{width:"100%",padding:"18px 20px",borderRadius:16,border:`1.5px solid ${r.color}`,background:r.bg,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:16}}>
              <span style={{fontSize:32}}>{r.icon}</span>
              <div><p style={{margin:"0 0 3px",fontSize:15,fontWeight:700,color:r.color}}>{r.label}</p><p style={{margin:0,fontSize:12,color:r.color,opacity:0.75}}>{r.sub}</p></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaveReviewScreen({ taskId, targetId, taskTitle }) {
  const { lang, t, reviews, setReviews, currentUser, pop, addNotification } = useApp();
  const target=useUserById(targetId);
  const [rating,setRating]=useState(0);
  const [text,setText]=useState("");
  const [saving,setSaving]=useState(false);
  const existing=reviews.find(r=>r.taskId===taskId&&r.authorId===currentUser.id&&r.targetId===targetId);
  const handleSubmit=async()=>{
    if (!rating) return;
    setSaving(true);await sleep(300);
    const rv={id:"rv_"+Date.now(),taskId,authorId:currentUser.id,targetId,rating,text:text.trim(),createdAt:new Date().toISOString()};
    setReviews(rs=>[...rs,rv]);
    // Уведомление себе (рецензенту)
    addNotification(currentUser.id, lang==="ru"?`⭐ Вы оставили отзыв для ${target?.name||""}`:`⭐ ${target?.name||""} үчүн пикир калтырдыңыз`);
    setSaving(false);pop();
  };
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <ScreenHeader title={t.reviewTitle}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px"}}>
        {existing?(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:48,marginBottom:12}}>✅</div>
            <p style={{fontSize:15,fontWeight:600,color:"var(--color-text-primary,#111)",margin:"0 0 10px"}}>{t.alreadyReviewed}</p>
            <StarRating value={existing.rating} size={28}/>
            {existing.text&&<p style={{fontSize:13,color:"var(--color-text-secondary,#888)",marginTop:12,fontStyle:"italic",lineHeight:1.6}}>"{existing.text}"</p>}
          </div>
        ):(
          <>
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px",background:"var(--color-background-primary,#fff)",borderRadius:14,marginBottom:20,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}>
              <Avatar user={target} size={46} fontSize={16}/>
              <div><p style={{margin:"0 0 2px",fontSize:15,fontWeight:600,color:"var(--color-text-primary,#111)"}}>{target?.name}</p><p style={{margin:0,fontSize:12,color:"var(--color-text-secondary,#888)"}}>{taskTitle}</p></div>
            </div>
            <SectionCard>
              <p style={{margin:"0 0 10px",fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:600}}>{t.reviewRating}</p>
              <StarRating value={rating} onChange={setRating} size={36}/>
              {!rating&&<p style={{margin:"6px 0 0",fontSize:11,color:"#A32D2D"}}>{lang==="ru"?"Выберите оценку":"Баа тандаңыз"}</p>}
            </SectionCard>
            <SectionCard>
              <p style={{margin:"0 0 8px",fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:600}}>{t.reviewText}</p>
              <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={t.phReviewText} rows={4} style={{width:"100%",resize:"none",lineHeight:1.6}}/>
            </SectionCard>
            <button className="rb" onClick={handleSubmit} disabled={!rating||saving}
              style={{width:"100%",padding:"14px",borderRadius:12,border:"none",cursor:rating?"pointer":"default",background:rating?"#185FA5":"#c0d0e8",color:"#fff",fontSize:15,fontWeight:700}}>
              {saving?"...":`${t.submitReview}${rating?" ("+rating+"★)":""}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function UserProfileScreen({ userId }) {
  const { lang, t, reviews } = useApp();
  const user=useUserById(userId);
  const rating=calcRating(reviews,userId);
  const userReviews=reviews.filter(r=>r.targetId===userId).slice().reverse();
  const skillsList=user?.skills?.filter(Boolean)||[];
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <ScreenHeader title={t.userProfileTitle}/>
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 28px"}}>
        <SectionCard delay={0}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
            <Avatar user={user} size={60} fontSize={20}/>
            <div style={{flex:1,minWidth:0}}>
              <p style={{margin:"0 0 3px",fontSize:17,fontWeight:700,color:"var(--color-text-primary,#111)"}}>{user?.name}</p>
              {rating?(<div style={{display:"flex",alignItems:"center",gap:6}}><Stars r={rating.avg} size={14}/><span style={{fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:500}}>{rating.avg} · {rating.count} {t.reviewCount}</span></div>):<p style={{margin:0,fontSize:12,color:"var(--color-text-secondary,#888)"}}>{t.noReviews}</p>}
            </div>
          </div>
          {user?.about&&<p style={{margin:"0 0 10px",fontSize:13,color:"var(--color-text-primary,#111)",lineHeight:1.5}}>{user.about}</p>}
          {skillsList.length>0&&(<div style={{marginBottom:10}}><p style={{margin:"0 0 5px",fontSize:10,fontWeight:700,letterSpacing:0.5,color:"var(--color-text-secondary,#888)",textTransform:"uppercase"}}>{t.skills}</p><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{skillsList.map(s=><span key={s} style={{padding:"3px 10px",borderRadius:20,background:"#E6F1FB",color:"#185FA5",fontSize:11,fontWeight:500}}>{s}</span>)}</div></div>)}
          {user?.experience&&<div><p style={{margin:"0 0 3px",fontSize:10,fontWeight:700,letterSpacing:0.5,color:"var(--color-text-secondary,#888)",textTransform:"uppercase"}}>{t.experience}</p><p style={{margin:0,fontSize:13,color:"var(--color-text-primary,#111)",lineHeight:1.5}}>{user.experience}</p></div>}
        </SectionCard>
        {rating&&(<SectionCard delay={0.03} style={{background:"linear-gradient(135deg,#185FA5,#0F6E56)",border:"none"}}><div style={{display:"flex",alignItems:"center",gap:16}}><div style={{textAlign:"center"}}><div style={{fontSize:32,fontWeight:700,color:"#fff",lineHeight:1}}>{rating.avg}</div><div style={{marginTop:4}}><Stars r={rating.avg} size={14}/></div></div><div style={{width:"0.5px",height:40,background:"rgba(255,255,255,0.3)"}}/><div><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>{rating.count}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.75)"}}>{t.reviewCount}</div></div></div></SectionCard>)}
        <SectionCard delay={0.06}>
          <p style={{margin:"0 0 12px",fontSize:12,fontWeight:700,color:"var(--color-text-secondary,#888)",textTransform:"uppercase",letterSpacing:0.5}}>{t.reviewsTitle} ({userReviews.length})</p>
          {userReviews.length===0?<p style={{margin:0,fontSize:13,color:"var(--color-text-secondary,#888)",textAlign:"center",padding:"12px 0"}}>{t.noReviews}</p>
          :userReviews.slice(0,6).map((rv,i)=>{
            const AuthorName=()=>{const n=useUserName(rv.authorId);return <span style={{fontSize:12,fontWeight:600,color:"var(--color-text-primary,#111)"}}>{n}</span>;};
            return (<div key={rv.id} style={{paddingTop:i>0?12:0,marginTop:i>0?12:0,borderTop:i>0?"0.5px solid var(--color-border-tertiary,#e0e0e0)":"none"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><AuthorName/><div style={{display:"flex",alignItems:"center",gap:5}}><Stars r={rv.rating} size={12}/><span style={{fontSize:10,color:"var(--color-text-secondary,#888)"}}>{rv.rating}.0</span></div></div>{rv.text&&<p style={{margin:0,fontSize:12,color:"var(--color-text-secondary,#888)",lineHeight:1.5,fontStyle:"italic"}}>"{rv.text}"</p>}</div>);
          })}
        </SectionCard>
      </div>
    </div>
  );
}

function PaymentScreen({ paymentType, taskTitle, onConfirm }) {
  const { t, pop, lang, switchTab } = useApp();
  const [checked,setChecked]=useState(false);
  const [status,setStatus]=useState("idle");
  const consent=paymentType==="create"?t.consentCreate:t.consentRespond;
  const handlePay=async()=>{
    if (!checked) return; setStatus("paying"); await sleep(1600);
    if (Math.random()<0.1){setStatus("error_funds");return;}
    setStatus("success"); await sleep(700); pop(); onConfirm();
    if (paymentType==="create") switchTab("tasks");
  };
  if (status==="success") return (<div className="si" style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"var(--color-background-tertiary,#f0f0f0)",padding:"30px 24px"}}><div className="pi" style={{fontSize:64,marginBottom:14}}>✅</div><p style={{fontSize:18,fontWeight:700,color:"#0F6E56",textAlign:"center"}}>{lang==="ru"?"Оплата прошла!":"Төлөм өттү!"}</p></div>);
  if (status==="error_funds") return (<div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}><ScreenHeader title={t.paymentTitle}/><div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}><div style={{fontSize:58,marginBottom:16}}>💸</div><p style={{fontSize:17,fontWeight:700,color:"#A32D2D",marginBottom:16,textAlign:"center"}}>{lang==="ru"?"Недостаточно средств":"Каражат жетишсиз"}</p><button className="rb" onClick={()=>setStatus("idle")} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:"pointer",background:"#185FA5",color:"#fff",fontSize:14,fontWeight:700,marginBottom:10}}>{lang==="ru"?"Попробовать снова":"Кайра аракет"}</button><button onClick={pop} style={{width:"100%",padding:"11px",borderRadius:11,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"none",cursor:"pointer",fontSize:13,color:"var(--color-text-secondary,#888)"}}>{t.cancel}</button></div></div>);
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <ScreenHeader title={t.paymentTitle}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 36px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{fontSize:52,marginBottom:10}}>💳</div>
        <p style={{margin:"0 0 2px",fontSize:30,fontWeight:700,color:"#185FA5"}}>20 сом</p>
        <p style={{margin:"0 0 16px",fontSize:13,color:"var(--color-text-secondary,#888)",textAlign:"center"}}>{t.publish}</p>
        {taskTitle&&<div style={{width:"100%",padding:"10px 14px",background:"var(--color-background-primary,#fff)",borderRadius:12,marginBottom:14,fontSize:13,fontWeight:500,color:"var(--color-text-primary,#111)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}>📋 {taskTitle}</div>}
        <label style={{display:"flex",gap:10,cursor:"pointer",marginBottom:6,alignItems:"flex-start",width:"100%"}}>
          <input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)} style={{width:18,height:18,flexShrink:0,cursor:"pointer",accentColor:"#185FA5",marginTop:2}}/>
          <span style={{fontSize:12,color:"var(--color-text-secondary,#888)",lineHeight:1.6}}>{consent}</span>
        </label>
        {!checked&&<p style={{margin:"0 0 8px",fontSize:11,color:"#A32D2D",width:"100%"}}>{t.checkboxRequired}</p>}
        <button className="rb" onClick={handlePay} disabled={!checked||status==="paying"}
          style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:checked&&status!=="paying"?"pointer":"default",background:checked&&status!=="paying"?"#185FA5":"#c0d0e8",color:"#fff",fontSize:15,fontWeight:700,marginBottom:10,marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {status==="paying"?<><span style={{fontSize:16,animation:"spin 0.8s linear infinite",display:"inline-block"}}>⏳</span>{t.payingNow}</>:(lang==="ru"?"Оплатить":"Төлөө")}
        </button>
        <button onClick={pop} style={{width:"100%",padding:"12px",borderRadius:12,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"none",cursor:"pointer",fontSize:14,color:"var(--color-text-secondary,#888)"}}>{t.cancel}</button>
      </div>
    </div>
  );
}

function CityPickerScreen({ currentCity, onSelect }) {
  const { lang, t, pop } = useApp();
  const [q,setQ]=useState("");
  const lq=q.trim().toLowerCase();
  const matches=lq?CITIES.filter(c=>c.ru.toLowerCase().includes(lq)||c.ky.toLowerCase().includes(lq)):CITIES;
  const groups={};matches.forEach(c=>{const g=locGroup(c,lang);if(!groups[g])groups[g]=[];groups[g].push(c);});
  const select=id=>{onSelect(id);pop();};
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-primary,#fff)"}}>
      <div style={{padding:"10px 14px",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
        <BackBtn/><div style={{position:"relative",flex:1}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"var(--color-text-secondary,#888)"}}>🔍</span><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder={t.searchLoc} style={{width:"100%",paddingLeft:26,paddingTop:7,paddingBottom:7}}/></div>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        <div onClick={()=>select(null)} style={{padding:"11px 14px",cursor:"pointer",fontSize:13,fontWeight:!currentCity?600:400,color:!currentCity?"#185FA5":"var(--color-text-secondary,#888)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}>🌐 {t.allCities}</div>
        {Object.entries(groups).map(([grp,locs])=>(
          <div key={grp}>
            <div style={{padding:"4px 14px",fontSize:10,fontWeight:700,letterSpacing:0.7,color:"#185FA5",background:"var(--color-background-secondary,#f4f4f4)",textTransform:"uppercase",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}>{grp}</div>
            {locs.map(loc=>(<div key={loc.id} onClick={()=>select(loc.id)} style={{padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,background:currentCity===loc.id?"#E6F1FB":"transparent",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}><span style={{fontSize:14}}>{locIcon(loc.t)}</span><span style={{fontSize:13,flex:1,fontWeight:currentCity===loc.id?500:400,color:currentCity===loc.id?"#185FA5":"var(--color-text-primary,#111)"}}>{locName(loc,lang)}</span>{currentCity===loc.id&&<span style={{color:"#185FA5",fontSize:13}}>✓</span>}</div>))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TopBar({ search, setSearch, city, setCity, onCityPress }) {
  const { lang, t, setLang, addNotification } = useApp();
  const [geoLoading,setGeoLoading]=useState(false);
  const sel=CITIES.find(c=>c.id===city);
  const handleGeo=()=>{
    if (!navigator.geolocation){
      addNotification(lang==="ru"?"📍 Геолокация не поддерживается вашим браузером":"📍 Браузериңиз геолокацияны колдобойт");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const{latitude:la,longitude:lo}=pos.coords;
        const pts={bishkek:{lat:42.87,lng:74.59},osh_city:{lat:40.51,lng:72.79},jalal:{lat:40.93,lng:73.00},karakol:{lat:42.49,lng:78.39},naryn:{lat:41.43,lng:75.99}};
        let best="bishkek",bD=999;
        Object.entries(pts).forEach(([id,{lat,lng}])=>{const d=Math.hypot(lat-la,lng-lo);if(d<bD){bD=d;best=id;}});
        setCity(best);setGeoLoading(false);
      },
      ()=>{
        setGeoLoading(false);
        addNotification(lang==="ru"?"📍 Не удалось определить ваше местоположение. Проверьте разрешения в браузере.":"📍 Жайгашкан жериңизди аныктоо мүмкүн болгон жок. Браузердин уруксаттарын текшериңиз.");
      },
      {timeout:5000}
    );
  };
  return (
    <div style={{background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",padding:"8px 12px",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <span style={{fontSize:16,fontWeight:700,color:"#185FA5"}}>ИшТап 🇰🇬</span>
        <div style={{display:"flex",gap:4}}>{LANGS.map(l=><button key={l.id} className="pb" onClick={()=>setLang(l.id)} style={{padding:"3px 8px",borderRadius:6,border:"0.5px solid",cursor:"pointer",fontSize:11,fontWeight:lang===l.id?700:400,borderColor:lang===l.id?"#185FA5":"var(--color-border-tertiary,#e0e0e0)",background:lang===l.id?"#185FA5":"transparent",color:lang===l.id?"#fff":"var(--color-text-secondary,#888)"}}>{l.flag} {l.label}</button>)}</div>
      </div>
      <div style={{position:"relative",marginBottom:6}}>
        <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"var(--color-text-secondary,#888)"}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} style={{width:"100%",paddingLeft:27,paddingTop:7,paddingBottom:7,borderRadius:10,fontSize:13}}/>
        {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:13,color:"var(--color-text-secondary,#888)"}}>✕</button>}
      </div>
      <div style={{display:"flex",gap:5}}>
        <button onClick={onCityPress} className="pb" style={{flex:1,padding:"6px 10px",borderRadius:8,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"var(--color-background-secondary,#f4f4f4)",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,minWidth:0}}>
          <span style={{fontSize:11}}>{sel?locIcon(sel.t):"🌐"}</span>
          <span style={{flex:1,textAlign:"left",color:sel?"#185FA5":"var(--color-text-secondary,#888)",fontWeight:sel?500:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel?locName(sel,lang):t.allCities}</span>
          <span style={{fontSize:9,color:"var(--color-text-secondary,#888)"}}>▼</span>
        </button>
        <button onClick={handleGeo} className="pb" disabled={geoLoading} style={{padding:"6px 10px",borderRadius:8,border:"0.5px solid #185FA5",background:"#E6F1FB",cursor:"pointer",fontSize:11,color:"#185FA5",fontWeight:500,flexShrink:0}}>{geoLoading?t.locating:t.useGeo}</button>
      </div>
    </div>
  );
}

function ResponderCard({ resp, taskStatus, onSelect, onDecline, showPhone }) {
  const { lang, t, reviews, push } = useApp();
  const phone  = useUserPhone(resp.executorId);
  const user   = useUserById(resp.executorId);
  const rating = calcRating(reviews, resp.executorId);
  const isChosen=resp.status==="chosen",isDeclined=resp.status==="declined",isPending=resp.status==="pending";
  return (
    <div style={{padding:"12px 0",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
        <button onClick={()=>push({type:"userProfile",userId:resp.executorId})} style={{background:"none",border:"none",padding:0,cursor:"pointer",flexShrink:0}}><Avatar user={user} size={40} fontSize={14}/></button>
        <div style={{flex:1,minWidth:0}}>
          <button onClick={()=>push({type:"userProfile",userId:resp.executorId})} style={{background:"none",border:"none",padding:0,cursor:"pointer",fontSize:14,fontWeight:500,color:"var(--color-text-primary,#111)",textDecoration:"underline",textDecorationColor:"#185FA520"}}>{user?.name||"—"}</button>
          {rating?(<div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}><Stars r={rating.avg} size={11}/><span style={{fontSize:10,color:"var(--color-text-secondary,#888)"}}>{rating.avg} ({rating.count})</span></div>):<span style={{fontSize:10,color:"var(--color-text-secondary,#888)",display:"block",marginTop:2}}>{t.noReviews}</span>}
          {showPhone&&isChosen&&<p style={{margin:"2px 0 0",fontSize:12,color:"#185FA5"}}>📞 {phone}</p>}
        </div>
        <span style={{fontSize:15,fontWeight:700,color:"#185FA5",whiteSpace:"nowrap"}}>{resp.priceOffer.toLocaleString()} сом</span>
      </div>
      {resp.comment&&<p style={{margin:"0 0 8px",fontSize:12,color:"var(--color-text-secondary,#888)",fontStyle:"italic",lineHeight:1.5}}>"{resp.comment}"</p>}
      {isChosen&&<div style={{padding:"6px 10px",background:"#EAF3DE",borderRadius:8,fontSize:12,color:"#2A5E1A",fontWeight:600,textAlign:"center"}}>{t.chosenBadge}</div>}
      {isDeclined&&<div style={{padding:"6px 10px",background:"var(--color-background-secondary,#f4f4f4)",borderRadius:8,fontSize:12,color:"var(--color-text-secondary,#888)",textAlign:"center"}}>{t.respStatus_declined}</div>}
      {isPending&&taskStatus==="open"&&(
        <div style={{display:"flex",gap:8,marginTop:4}}>
          <button className="rb" onClick={()=>onSelect(resp.id)} style={{flex:1,padding:"8px",borderRadius:9,border:"none",cursor:"pointer",background:"#185FA5",color:"#fff",fontSize:12,fontWeight:600}}>{t.selectExec}</button>
          <button className="rb" onClick={()=>onDecline(resp.id)} style={{padding:"8px 12px",borderRadius:9,border:"0.5px solid #A32D2D",cursor:"pointer",background:"#FCEBEB",color:"#A32D2D",fontSize:12,fontWeight:600}}>{t.declineExec}</button>
        </div>
      )}
    </div>
  );
}

function TaskDetailScreen({ task }) {
  const { lang, t, tasks, setTasks, addNotification, push, currentUser, responses, setResponses, reviews } = useApp();
  const [showForm,setShowForm]=useState(false);
  const [priceOffer,setPriceOffer]=useState(String(task.price));
  const [comment,setComment]=useState("");
  const [showCompleteConfirm,setShowCompleteConfirm]=useState(false);

  const cat         = CATS[task.cat];
  const loc         = CITIES.find(c=>c.id===task.city);
  const currentTask = tasks.find(tk=>tk.id===task.id)||task;
  const isOwner     = currentTask.ownerId===currentUser.id;
  const isExecutor  = currentUser.role==="executor";
  const isCustomer  = currentUser.role==="customer";
  const daysLeft    = Math.max(0,Math.round((new Date(currentTask.expires_at)-Date.now())/86400000));
  const taskTitle   = lang==="ru"?task.ru:task.ky;
  const ownerPhone  = useUserPhone(currentTask.ownerId);

  const taskResponses = responses.filter(r=>r.taskId===task.id);
  const myResponse    = taskResponses.find(r=>r.executorId===currentUser.id);
  const chosenResp    = taskResponses.find(r=>r.status==="chosen");
  const isCompleted   = currentTask.status==="completed";

  const statusMap={
    open:            {color:"#0F6E56",bg:"#E1F5EE",label:t.statusOpen},
    closed_by_choice:{color:"#B05E0A",bg:"#FAEEDD",label:t.statusClosed},
    closed_expired:  {color:"#666",   bg:"var(--color-background-secondary,#f4f4f4)",label:t.statusExpired},
    completed:       {color:"#185FA5",bg:"#E6F1FB",label:t.statusCompleted},
  };
  const st=statusMap[currentTask.status]||statusMap.open;

  const handleSelectExec=respId=>{
    const resp=responses.find(r=>r.id===respId);if(!resp)return;
    setTasks(ts=>ts.map(tk=>tk.id===task.id?{...tk,status:"closed_by_choice",chosen_executor_id:resp.executorId}:tk));
    setResponses(rs=>rs.map(r=>{if(r.taskId!==task.id)return r;return r.id===respId?{...r,status:"chosen"}:{...r,status:"declined"};}));
    // Уведомление заказчику (себе)
    addNotification(currentUser.id, lang==="ru"?`✅ Вы выбрали исполнителя для «${taskTitle}»`:`✅ «${taskTitle}» үчүн аткаруучу тандадыңыз`);
    // Уведомление исполнителю
    if (resp.executorId!==currentUser.id) {
      addNotification(resp.executorId, lang==="ru"?`🎉 Вас выбрали для задания «${taskTitle}»`:`🎉 «${taskTitle}» тапшырмасына сиз тандалдыңыз`);
    }
  };

  const handleDeclineResp=respId=>{setResponses(rs=>rs.map(r=>r.id===respId?{...r,status:"declined"}:r));};

  const handleDeselect=()=>{
    if (currentTask.reactivation_count>=3){addNotification(currentUser.id,`⛔ ${t.reactLimit}`);return;}
    setTasks(ts=>ts.map(tk=>tk.id===task.id?{...tk,status:"open",chosen_executor_id:null,reactivation_count:tk.reactivation_count+1}:tk));
    setResponses(rs=>rs.map(r=>r.taskId===task.id&&r.status==="chosen"?{...r,status:"pending"}:r));
    addNotification(currentUser.id, lang==="ru"?`🔄 Задание «${taskTitle}» снова открыто`:`🔄 «${taskTitle}» тапшырмасы кайра ачылды`);
  };

  const handleComplete=()=>{
    const hasChosen=currentTask.chosen_executor_id||taskResponses.some(r=>r.status==="chosen");
    if (!hasChosen){
      addNotification(currentUser.id, lang==="ru"?"⛔ Нельзя завершить задание без выбранного исполнителя":"⛔ Аткаруучу тандалбай тапшырманы аяктоо мүмкүн эмес");
      setShowCompleteConfirm(false);
      return;
    }
    setTasks(ts=>ts.map(tk=>tk.id===task.id?{...tk,status:"completed",completed:true}:tk));
    addNotification(currentUser.id, lang==="ru"?`🏁 Задание «${taskTitle}» завершено! Оставьте отзыв исполнителю.`:`🏁 «${taskTitle}» аяктады! Аткаруучуга пикир калтырыңыз.`);
    setShowCompleteConfirm(false);
  };

  const goToRespondPayment=()=>push({
    type:"payment", paymentType:"respond", taskTitle,
    onConfirm:{fn:()=>{
      const nr={id:"resp_"+Date.now(),taskId:task.id,executorId:currentUser.id,priceOffer:Number(priceOffer)||task.price,comment:comment.trim(),status:"pending",createdAt:new Date().toISOString()};
      setResponses(rs=>[...rs,nr]);
      // Исполнителю — подтверждение
      addNotification(currentUser.id, t.respondSent);
      // Заказчику — новый отклик
      if (currentTask.ownerId!==currentUser.id) {
        addNotification(currentTask.ownerId, lang==="ru"?`💬 Новый отклик на «${taskTitle}» от ${currentUser.name}`:`💬 «${taskTitle}» тапшырмасына ${currentUser.name} жооп берди`);
      }
      setShowForm(false);
    }}
  });

  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <ScreenHeader title={t.taskDetail} right={<span style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:st.bg,color:st.color}}>{st.label}</span>}/>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px 30px"}}>
        <SectionCard delay={0}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <Pill color={cat.color} bg={cat.bg}>{cat.icon} {cat[lang]}</Pill>
            {task.urgent&&<Pill color="#A32D2D" bg="#FCEBEB">{t.urgent}</Pill>}
          </div>
          <p style={{margin:"0 0 6px",fontSize:16,fontWeight:600,color:"var(--color-text-primary,#111)"}}>{task[lang==="ru"?"ru":"ky"]}</p>
          <p style={{margin:"0 0 10px",fontSize:13,color:"var(--color-text-secondary,#888)",lineHeight:1.5}}>{task[lang==="ru"?"dRu":"dKy"]}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {[[t.lBudget,`${task.price.toLocaleString()} сом`],[t.lTime,task.time],[t.lCity,loc?locName(loc,lang):"—"],[t.expiresIn,isCompleted?"—":`${daysLeft} ${lang==="ru"?"дн.":"күн"}`]].map(([k,v])=>(
              <div key={k} style={{background:"var(--color-background-secondary,#f4f4f4)",borderRadius:9,padding:"8px 10px"}}>
                <div style={{fontSize:10,color:"var(--color-text-secondary,#888)",marginBottom:2}}>{k}</div>
                <div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary,#111)"}}>{v}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {isOwner&&(
          <SectionCard delay={0.05}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={{margin:0,fontSize:12,fontWeight:700,color:"var(--color-text-secondary,#888)",textTransform:"uppercase",letterSpacing:0.5}}>{t.respondersTitle} ({taskResponses.length})</p>
              {currentTask.status==="closed_by_choice"&&(<button className="rb" onClick={handleDeselect} style={{padding:"4px 10px",borderRadius:8,border:"0.5px solid #B05E0A",cursor:"pointer",background:"#FAEEDD",color:"#B05E0A",fontSize:11,fontWeight:600}}>{t.reactivate}</button>)}
            </div>
            {currentTask.status==="closed_expired"&&(<div style={{padding:"8px 12px",background:"var(--color-background-secondary,#f4f4f4)",borderRadius:9,marginBottom:10,fontSize:12,color:"var(--color-text-secondary,#888)",textAlign:"center"}}>⏰ {lang==="ru"?"Срок задания истёк":"Тапшырманын мөөнөтү өттү"}</div>)}
            {currentTask.status==="closed_by_choice"&&!showCompleteConfirm&&(<button className="rb" onClick={()=>setShowCompleteConfirm(true)} style={{width:"100%",padding:"11px",borderRadius:10,border:"none",cursor:"pointer",background:"#0F6E56",color:"#fff",fontSize:13,fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{t.completeTask}</button>)}
            {showCompleteConfirm&&(
              <div style={{padding:"13px",background:"#E1F5EE",borderRadius:12,border:"0.5px solid #8AC88A",marginBottom:10}}>
                <p style={{margin:"0 0 4px",fontSize:13,fontWeight:600,color:"#0F6E56"}}>{t.completeConfirm}</p>
                <p style={{margin:"0 0 10px",fontSize:11,color:"#0F6E56",opacity:0.8,lineHeight:1.5}}>{t.completeHint}</p>
                <div style={{display:"flex",gap:8}}>
                  <button className="rb" onClick={handleComplete} style={{flex:1,padding:"9px",borderRadius:9,border:"none",cursor:"pointer",background:"#0F6E56",color:"#fff",fontSize:13,fontWeight:700}}>✓ {t.confirm}</button>
                  <button onClick={()=>setShowCompleteConfirm(false)} style={{padding:"9px 14px",borderRadius:9,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"none",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary,#888)"}}>{t.cancel}</button>
                </div>
              </div>
            )}
            {isCompleted&&(<div style={{padding:"10px 13px",background:"#E6F1FB",borderRadius:10,border:"0.5px solid #A0C0E8",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>🏁</span><span style={{fontSize:13,color:"#185FA5",fontWeight:600}}>{lang==="ru"?"Задание успешно завершено":"Тапшырма ийгиликтүү аяктады"}</span></div>)}
            {taskResponses.length===0
              ?<p style={{margin:0,fontSize:13,color:"var(--color-text-secondary,#888)",textAlign:"center",padding:"12px 0"}}>{t.noRespondsYet}</p>
              :isCompleted||currentTask.status==="closed_by_choice"
                ?(chosenResp?<ResponderCard resp={chosenResp} taskStatus={currentTask.status} onSelect={handleSelectExec} onDecline={handleDeclineResp} showPhone/>:null)
                :taskResponses.map(resp=><ResponderCard key={resp.id} resp={resp} taskStatus={currentTask.status} onSelect={handleSelectExec} onDecline={handleDeclineResp} showPhone/>)
            }
            {isCompleted&&chosenResp&&(<ReviewBtn taskId={task.id} targetId={chosenResp.executorId} taskTitle={taskTitle} reviews={reviews} currentUser={currentUser} push={push} t={t}/>)}
          </SectionCard>
        )}

        {isExecutor&&!isOwner&&currentTask.status==="open"&&(
          <SectionCard delay={0.05}>
            {!myResponse&&(showForm?(
              <div>
                <p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>{t.priceOffer}</p>
                <input type="number" value={priceOffer} onChange={e=>setPriceOffer(e.target.value)} style={{width:"100%",marginBottom:10}}/>
                <p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>{t.offerComment}</p>
                <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={2} placeholder={lang==="ru"?"Почему именно вы?":"Эмне үчүн сиз?"} style={{width:"100%",resize:"none",marginBottom:10}}/>
                <button className="rb" onClick={goToRespondPayment} style={{width:"100%",padding:"12px",borderRadius:11,border:"none",cursor:"pointer",background:"#185FA5",color:"#fff",fontSize:14,fontWeight:700,marginBottom:6}}>{t.confirm}</button>
                <button onClick={()=>setShowForm(false)} style={{width:"100%",padding:"9px",borderRadius:10,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"none",cursor:"pointer",fontSize:13,color:"var(--color-text-secondary,#888)"}}>{t.cancel}</button>
              </div>
            ):(<button className="rb" onClick={()=>setShowForm(true)} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",cursor:"pointer",background:"#185FA5",color:"#fff",fontSize:14,fontWeight:700}}>{t.respond}</button>))}
            {myResponse?.status==="pending"&&(<div style={{textAlign:"center",padding:"12px",background:"#EAF3DE",borderRadius:10,color:"#2A5E1A",fontWeight:500,fontSize:13}}>{t.alreadyResponded} ✓<p style={{margin:"6px 0 0",fontSize:11,color:"#2A5E1A",opacity:0.75,fontWeight:400}}>{lang==="ru"?"Ожидайте решения заказчика":"Буйрутмачынын чечимин күтүңүз"}</p></div>)}
          </SectionCard>
        )}

        {isExecutor&&!isOwner&&currentTask.status!=="open"&&(
          <SectionCard delay={0.05}>
            {myResponse?.status==="chosen"&&!isCompleted&&(<div style={{padding:"10px 12px",background:"#EAF3DE",borderRadius:10,marginBottom:10,border:"0.5px solid #8AC88A"}}><p style={{margin:"0 0 4px",fontSize:12,fontWeight:700,color:"#2A5E1A"}}>🎉 {t.chosenBadge}</p><p style={{margin:"0 0 2px",fontSize:12,color:"#2A5E1A"}}>{lang==="ru"?"Контакт заказчика:":"Буйрутмачынын байланышы:"}</p><p style={{margin:0,fontSize:13,fontWeight:600,color:"#185FA5"}}>📞 {ownerPhone}</p></div>)}
            {myResponse?.status==="chosen"&&isCompleted&&(<div style={{padding:"10px 13px",background:"#E6F1FB",borderRadius:10,border:"0.5px solid #A0C0E8",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>🏁</span><span style={{fontSize:13,color:"#185FA5",fontWeight:600}}>{lang==="ru"?"Задание завершено заказчиком":"Буйрутмачы тапшырманы аяктатты"}</span></div>)}
            {myResponse?.status==="declined"&&(<div style={{textAlign:"center",padding:"12px",background:"var(--color-background-secondary,#f4f4f4)",borderRadius:10,color:"var(--color-text-secondary,#888)",fontSize:13}}>{t.respStatus_declined}</div>)}
            {!myResponse&&(<p style={{margin:0,textAlign:"center",padding:"8px",fontSize:13,color:"var(--color-text-secondary,#888)"}}>{currentTask.status==="closed_expired"?`⏰ ${lang==="ru"?"Срок задания истёк":"Тапшырманын мөөнөтү өттү"}`:t.taskClosed}</p>)}
            {isCompleted&&myResponse?.status==="chosen"&&(<ReviewBtn taskId={task.id} targetId={currentTask.ownerId} taskTitle={taskTitle} reviews={reviews} currentUser={currentUser} push={push} t={t}/>)}
          </SectionCard>
        )}

        {isCustomer&&!isOwner&&(<SectionCard delay={0.05}><p style={{margin:0,textAlign:"center",padding:"8px",fontSize:13,color:"var(--color-text-secondary,#888)"}}>{lang==="ru"?"Это задание другого заказчика":"Бул башка буйрутмачынын тапшырмасы"}</p></SectionCard>)}
      </div>
    </div>
  );
}

function MyTasksScreen() {
  const { lang, t, tasks, responses, reviews, currentUser, push } = useApp();
  const myTasks=tasks.filter(tk=>tk.ownerId===currentUser.id).sort((a,b)=>(b.createdAt||b.id)-(a.createdAt||a.id));
  const statusCfg={open:{label:t.statusOpen,color:"#0F6E56",bg:"#E1F5EE"},closed_by_choice:{label:t.statusClosed,color:"#B05E0A",bg:"#FAEEDD"},closed_expired:{label:t.statusExpired,color:"#666",bg:"#EFEFEF"},completed:{label:t.statusCompleted,color:"#185FA5",bg:"#E6F1FB"}};
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <ScreenHeader title={t.myTasks}/>
      <div style={{flex:1,overflowY:"auto",padding:"10px 14px 20px"}}>
        {myTasks.length===0?<div style={{textAlign:"center",padding:"50px 0",color:"var(--color-text-secondary,#888)",fontSize:13}}>{lang==="ru"?"У вас пока нет заданий":"Сизде азырынча тапшырма жок"}</div>
        :myTasks.map((task,i)=>{
          const cat=CATS[task.cat],loc=CITIES.find(c=>c.id===task.city),sc=statusCfg[task.status]||statusCfg.open;
          const respCount=responses.filter(r=>r.taskId===task.id).length;
          const chosenResp=responses.find(r=>r.taskId===task.id&&r.status==="chosen");
          const hasReview=chosenResp&&reviews.some(r=>r.taskId===task.id&&r.authorId===currentUser.id&&r.targetId===chosenResp.executorId);
          return (
            <div key={task.id} className="fe card" style={{animationDelay:`${i*0.04}s`,background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:14,padding:"12px 13px",marginBottom:9}} onClick={()=>push({type:"taskDetail",task})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}><div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}><Pill color={cat.color} bg={cat.bg}>{cat.icon} {cat[lang]}</Pill>{task.urgent&&<Pill color="#A32D2D" bg="#FCEBEB">{t.urgent}</Pill>}</div><span style={{fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:12,background:sc.bg,color:sc.color,whiteSpace:"nowrap",flexShrink:0}}>{sc.label}</span></div>
              <p style={{margin:"0 0 5px",fontSize:14,fontWeight:500,color:"var(--color-text-primary,#111)",lineHeight:1.3}}>{task[lang==="ru"?"ru":"ky"]}</p>
              <div style={{display:"flex",gap:8,fontSize:11,color:"var(--color-text-secondary,#888)",flexWrap:"wrap",alignItems:"center",marginBottom:8}}><span>{locIcon(loc?.t||"city")} {loc?locName(loc,lang):"—"}</span><span>💰 {task.price.toLocaleString()} сом</span><span>🕐 {task.time}</span></div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",background:"var(--color-background-secondary,#f4f4f4)",borderRadius:9}}><span style={{fontSize:11,color:"var(--color-text-secondary,#888)"}}>{lang==="ru"?"Откликов:":"Жооптор:"}</span><span style={{fontSize:13,fontWeight:600,color:respCount>0?"#185FA5":"var(--color-text-secondary,#888)"}}>{respCount>0?`${respCount} 💬`:"—"}</span></div>
              {task.status==="completed"&&chosenResp&&!hasReview&&(<div style={{marginTop:8,padding:"6px 10px",background:"#FFF8E6",borderRadius:8,border:"0.5px solid #F0C040",fontSize:11,color:"#7A5C00",fontWeight:500}}>⭐ {lang==="ru"?"Оставьте отзыв исполнителю":"Аткаруучуга пикир калтырыңыз"}</div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyResponsesScreen() {
  const { lang, t, tasks, responses, reviews, currentUser, push } = useApp();
  const myResponses=responses.filter(r=>r.executorId===currentUser.id);
  const statusCfg={pending:{label:t.respStatus_pending,color:"#B05E0A",bg:"#FAEEDD"},chosen:{label:t.respStatus_chosen,color:"#0F6E56",bg:"#E1F5EE"},declined:{label:t.respStatus_declined,color:"#A32D2D",bg:"#FCEBEB"}};
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <ScreenHeader title={t.myResponsesTitle}/>
      <div style={{flex:1,overflowY:"auto",padding:"10px 14px 20px"}}>
        {myResponses.length===0?<div style={{textAlign:"center",padding:"50px 0",color:"var(--color-text-secondary,#888)",fontSize:13}}>{t.noMyResponses}</div>
        :myResponses.map((resp,i)=>{
          const task=tasks.find(tk=>tk.id===resp.taskId);if(!task)return null;
          const cat=CATS[task.cat],loc=CITIES.find(c=>c.id===task.city),sc=statusCfg[resp.status]||statusCfg.pending;
          const isCompleted=task.status==="completed";
          return (
            <div key={resp.id} className="fe" style={{animationDelay:`${i*0.04}s`,background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:14,padding:"12px 13px",marginBottom:9}}>
              <div className="card" onClick={()=>push({type:"taskDetail",task})}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}><div style={{display:"flex",gap:5,flexWrap:"wrap"}}><Pill color={cat.color} bg={cat.bg}>{cat.icon} {cat[lang]}</Pill>{task.urgent&&<Pill color="#A32D2D" bg="#FCEBEB">{t.urgent}</Pill>}</div><Pill color={sc.color} bg={sc.bg}>{sc.label}</Pill></div>
                <p style={{margin:"0 0 5px",fontSize:14,fontWeight:500,color:"var(--color-text-primary,#111)",lineHeight:1.3}}>{task[lang==="ru"?"ru":"ky"]}</p>
                <div style={{display:"flex",gap:8,fontSize:11,color:"var(--color-text-secondary,#888)",flexWrap:"wrap",alignItems:"center",marginBottom:6}}><span>{locIcon(loc?.t||"city")} {loc?locName(loc,lang):"—"}</span><span>🕐 {task.time}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"var(--color-background-secondary,#f4f4f4)",borderRadius:8}}><span style={{fontSize:11,color:"var(--color-text-secondary,#888)"}}>{t.yourOffer}</span><span style={{fontSize:13,fontWeight:600,color:"#185FA5"}}>{resp.priceOffer.toLocaleString()} сом</span></div>
                {resp.comment&&<p style={{margin:"6px 0 0",fontSize:12,color:"var(--color-text-secondary,#888)",fontStyle:"italic"}}>"{resp.comment}"</p>}
              </div>
              {isCompleted&&resp.status==="chosen"&&(<ReviewBtn taskId={task.id} targetId={task.ownerId} taskTitle={lang==="ru"?task.ru:task.ky} reviews={reviews} currentUser={currentUser} push={push} t={t}/>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotificationsScreen() {
  const { lang, t, notifications, clearNotifications } = useApp();
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <ScreenHeader title={t.notifTitle} right={notifications.length>0?<button onClick={clearNotifications} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary,#888)"}}>✕ {lang==="ru"?"Очистить":"Тазалоо"}</button>:null}/>
      <div style={{flex:1,overflowY:"auto",padding:"10px 14px"}}>
        {notifications.length===0?<p style={{textAlign:"center",padding:"40px 0",color:"var(--color-text-secondary,#888)",fontSize:13}}>{t.noNotif}</p>
        :notifications.map((n,i)=>(
          <div key={n.id} className="fe" style={{padding:"10px 12px",background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:11,marginBottom:7,animationDelay:`${i*0.04}s`,display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{flex:1}}><p style={{margin:"0 0 2px",fontSize:13,color:"var(--color-text-primary,#111)",fontWeight:n.read?400:500}}>{n.text}</p><p style={{margin:0,fontSize:10,color:"var(--color-text-secondary,#888)"}}>{n.time}</p></div>
            {!n.read&&<div style={{width:8,height:8,borderRadius:4,background:"#185FA5",flexShrink:0,marginTop:4}}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditProfileScreen() {
  const { lang, t, currentUser, setCurrentUser, pop } = useApp();
  const isExecutor=currentUser.role==="executor";
  const fileRef=useRef();
  const [name,setName]=useState(currentUser.name||"");
  const [about,setAbout]=useState(currentUser.about||"");
  const [skills,setSkills]=useState((currentUser.skills||[]).join(", "));
  const [exp,setExp]=useState(currentUser.experience||"");
  const [avatar,setAvatar]=useState(currentUser.avatar||null);
  const [saving,setSaving]=useState(false);
  const [showRoleAlert,setShowRoleAlert]=useState(false);
  const pickAvatar=async e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setAvatar(ev.target.result);r.readAsDataURL(f);e.target.value="";};
  const handleSave=async()=>{
    if (!name.trim()) return; setSaving(true); await sleep(300);
    const skillsArr=skills.split(",").map(s=>s.trim()).filter(Boolean);
    const u={...currentUser,name:name.trim(),about:about.trim(),skills:skillsArr,experience:exp.trim(),avatar:avatar||null};
    setCurrentUser(u);saveUser(u);const db=loadUsersDB();if(db[u.phone]){db[u.phone]=u;saveUsersDB(db);}
    setSaving(false);pop();
  };
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <ScreenHeader title={t.editProfileTitle} right={<button onClick={handleSave} disabled={saving||!name.trim()} style={{background:"none",border:"none",cursor:name.trim()?"pointer":"default",color:name.trim()?"#185FA5":"var(--color-text-secondary,#888)",fontSize:13,fontWeight:700,padding:"4px 2px"}}>{saving?"...":t.saveBtn}</button>}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 32px"}}>
        <div className="fe" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,marginBottom:20,padding:"18px",background:"var(--color-background-primary,#fff)",borderRadius:16,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}>
          <Avatar user={{...currentUser,avatar,name}} size={80} fontSize={28}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>fileRef.current.click()} className="pb" style={{padding:"7px 14px",borderRadius:10,border:"0.5px solid #185FA5",background:"#E6F1FB",cursor:"pointer",fontSize:12,color:"#185FA5",fontWeight:500}}>📷 {t.avatarChange}</button>
            {avatar&&<button onClick={()=>setAvatar(null)} className="pb" style={{padding:"7px 14px",borderRadius:10,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"none",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary,#888)"}}>{t.avatarRemove}</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={pickAvatar}/>
        </div>
        {[[t.fName,name,setName,"👤",false],[t.fAbout,about,setAbout,"📝",true]].map(([lbl,val,setter,icon,multi])=>(
          <div key={lbl} className="fe" style={{marginBottom:14}}><p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:500}}>{icon} {lbl}</p>{multi?<textarea value={val} onChange={e=>setter(e.target.value)} placeholder={t.phAbout} rows={3} style={{width:"100%",resize:"none",lineHeight:1.5}}/>:<input value={val} onChange={e=>setter(e.target.value)} placeholder={t.namePlaceholder} style={{width:"100%",fontSize:14}}/>}</div>
        ))}
        {isExecutor&&(<>
          <div className="fe" style={{marginBottom:14}}><p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:500}}>⚡ {t.fSkills}</p><input value={skills} onChange={e=>setSkills(e.target.value)} placeholder={t.phSkills} style={{width:"100%"}}/><p style={{margin:"4px 0 0",fontSize:10,color:"var(--color-text-secondary,#888)"}}>{lang==="ru"?"Вводите через запятую":"Үтүр менен жазыңыз"}</p></div>
          <div className="fe" style={{marginBottom:14}}><p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:500}}>🏆 {t.fExp}</p><textarea value={exp} onChange={e=>setExp(e.target.value)} placeholder={t.phExp} rows={2} style={{width:"100%",resize:"none",lineHeight:1.5}}/></div>
        </>)}
        <div className="fe" style={{marginBottom:8}}>
          <p style={{margin:"0 0 8px",fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:500}}>{lang==="ru"?"Роль":"Роль"}</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"var(--color-background-secondary,#f4f4f4)",borderRadius:10,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{currentUser.role==="customer"?"🧑‍💼":"🔨"}</span><span style={{fontSize:13,color:"var(--color-text-primary,#111)",fontWeight:500}}>{t[`roleLabel_${currentUser.role}`]}</span></div>
            <button onClick={()=>setShowRoleAlert(true)} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary,#888)",padding:"2px 6px"}}>{lang==="ru"?"Изменить?":"Өзгөртүү?"}</button>
          </div>
        </div>
        {showRoleAlert&&(<div className="fe" style={{padding:"12px 14px",background:"#FFF3CD",borderRadius:12,border:"0.5px solid #F0C040",marginBottom:14}}><p style={{margin:"0 0 8px",fontSize:12,color:"#7A5C00",lineHeight:1.6}}>⚠️ {t.roleFixed}</p><button onClick={()=>setShowRoleAlert(false)} style={{padding:"5px 14px",borderRadius:8,border:"none",background:"#B05E0A",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600}}>{t.roleFixedBtn}</button></div>)}
        <button className="rb" onClick={handleSave} disabled={saving||!name.trim()} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",cursor:name.trim()?"pointer":"default",background:name.trim()?"#185FA5":"#c0d0e8",color:"#fff",fontSize:15,fontWeight:700,marginTop:10}}>{saving?(lang==="ru"?"Сохранение...":"Сакталууда..."):t.saveBtn}</button>
      </div>
    </div>
  );
}

function SettingsScreen() {
  const { lang, t, currentUser, settings, setSettings } = useApp();
  const isExecutor=currentUser.role==="executor";
  const upd=(key,val)=>{const next={...settings,[key]:val};setSettings(next);saveSettings(next);};
  const toggleCat=id=>{const cats=settings.myCategories.includes(id)?settings.myCategories.filter(c=>c!==id):[...settings.myCategories,id];upd("myCategories",cats);};
  const Row=({icon,label,sub,right})=>(<div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}><span style={{fontSize:18,width:24,textAlign:"center",flexShrink:0}}>{icon}</span><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary,#111)"}}>{label}</div>{sub&&<div style={{fontSize:11,color:"var(--color-text-secondary,#888)",marginTop:1}}>{sub}</div>}</div>{right}</div>);
  const Toggle=({value,onChange})=>(<div onClick={onChange} style={{width:44,height:26,borderRadius:13,background:value?"#185FA5":"#ccc",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}><div style={{position:"absolute",top:3,left:value?20:3,width:20,height:20,borderRadius:10,background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.25)"}}/></div>);
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <ScreenHeader title={t.settings}/>
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 30px"}}>
        <p style={{margin:"0 0 6px 2px",fontSize:10,fontWeight:700,letterSpacing:0.6,color:"var(--color-text-secondary,#888)",textTransform:"uppercase"}}>{lang==="ru"?"Общие":"Жалпы"}</p>
        <div className="fe" style={{background:"var(--color-background-primary,#fff)",borderRadius:14,overflow:"hidden",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",marginBottom:16}}>
          <Row icon="🔔" label={lang==="ru"?"Уведомления":"Билдирмелер"} sub={settings.notificationsOn?(lang==="ru"?"Включены":"Иштейт"):(lang==="ru"?"Выключены":"Өчүрүлгөн")} right={<Toggle value={settings.notificationsOn} onChange={()=>upd("notificationsOn",!settings.notificationsOn)}/>}/>
          <Row icon="🌙" label={lang==="ru"?"Тёмная тема":"Күңүрт теме"} sub={settings.darkTheme?(lang==="ru"?"Включена":"Иштейт"):(lang==="ru"?"Выключена":"Өчүрүлгөн")} right={<Toggle value={settings.darkTheme} onChange={()=>upd("darkTheme",!settings.darkTheme)}/>}/>
        </div>
        {isExecutor&&(<>
          <p style={{margin:"0 0 6px 2px",fontSize:10,fontWeight:700,letterSpacing:0.6,color:"var(--color-text-secondary,#888)",textTransform:"uppercase"}}>{lang==="ru"?"Мои категории":"Менин категорияларым"}</p>
          <div className="fe" style={{background:"var(--color-background-primary,#fff)",borderRadius:14,padding:"12px 14px",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",marginBottom:8}}>
            <p style={{margin:"0 0 10px",fontSize:12,color:"var(--color-text-secondary,#888)",lineHeight:1.5}}>{lang==="ru"?"Выберите специализации — задания других категорий будут скрыты из списка.":"Адистикти тандаңыз — башка категориядагы тапшырмалар тизмеден жашырылат."}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{CATS.map(c=>{const sel=settings.myCategories.includes(c.id);return(<button key={c.id} className="pb" onClick={()=>toggleCat(c.id)} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${sel?c.color:"var(--color-border-tertiary,#e0e0e0)"}`,background:sel?c.bg:"transparent",color:sel?c.color:"var(--color-text-secondary,#888)",cursor:"pointer",fontSize:12,fontWeight:sel?600:400,display:"flex",alignItems:"center",gap:5}}><span>{c.icon}</span><span>{c[lang]}</span>{sel&&<span style={{fontSize:10}}>✓</span>}</button>);})}</div>
            {settings.myCategories.length>0&&(<button onClick={()=>upd("myCategories",[])} style={{marginTop:10,background:"none",border:"none",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary,#888)",padding:0,textDecoration:"underline"}}>{lang==="ru"?"Показать все категории":"Бардык категорияларды көрсөтүү"}</button>)}
          </div>
          <p style={{margin:"4px 0 0 2px",fontSize:10,color:"var(--color-text-secondary,#888)"}}>{settings.myCategories.length===0?(lang==="ru"?"Показываются все категории":"Бардык категориялар көрсөтүлөт"):(lang==="ru"?`Выбрано: ${settings.myCategories.length} из ${CATS.length}`:`Тандалды: ${settings.myCategories.length} / ${CATS.length}`)}</p>
        </>)}
      </div>
    </div>
  );
}

function TabProfile() {
  const { lang, t, setLang, notifications, push, tasks, responses, reviews, currentUser, onLogout } = useApp();
  const unread=notifications.filter(n=>!n.read).length;
  const myTasks=tasks.filter(tk=>tk.ownerId===currentUser.id);
  const doneTasks=myTasks.filter(tk=>tk.status==="completed");
  const myResponses=responses.filter(r=>r.executorId===currentUser.id);
  const roleLabel=currentUser.role?t[`roleLabel_${currentUser.role}`]:(lang==="ru"?"Не выбрана":"Тандалган жок");
  const roleIcon=currentUser.role==="customer"?"🧑‍💼":currentUser.role==="executor"?"🔨":"❓";
  const isExecutor=currentUser.role==="executor";
  const skillsList=currentUser.skills?.filter(Boolean)||[];
  const rating=calcRating(reviews,currentUser.id);
  const completedWithPendingReviews=isExecutor?[]:doneTasks.filter(tk=>{const cr=responses.find(r=>r.taskId===tk.id&&r.status==="chosen");if(!cr)return false;return !reviews.some(r=>r.taskId===tk.id&&r.authorId===currentUser.id&&r.targetId===cr.executorId);});
  const statItems=isExecutor?[[t.myResponses,myResponses.length],[t.statDone,myResponses.filter(r=>r.status==="chosen").length],[t.statRating,rating?`${rating.avg}★`:"—"]]:[[t.statCreated,myTasks.length],[t.statDone,doneTasks.length],[t.statRating,rating?`${rating.avg}★`:"—"]];
  const menuItems=[...(currentUser.role==="customer"?[{label:t.myTasks,action:()=>push({type:"myTasks"}),icon:"📋",bold:myTasks.length>0}]:[{label:t.myResponses,action:()=>push({type:"myResponses"}),icon:"💬",bold:myResponses.length>0}]),{label:t.notifications+(unread>0?` (${unread})`:""),action:()=>push({type:"notifications"}),icon:"🔔",bold:unread>0},{label:t.settings,action:()=>push({type:"settings"}),icon:"⚙️"},{label:t.logout,action:onLogout,icon:"🚪",danger:true}];
  return (
    <div className="tc" style={{padding:"14px 14px 24px",overflowY:"auto"}}>
      <div className="fe" style={{background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:16,padding:"16px",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
          <Avatar user={currentUser} size={60} fontSize={20}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><p style={{margin:0,fontSize:16,fontWeight:700,color:"var(--color-text-primary,#111)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.name}</p><button onClick={()=>push({type:"editProfile"})} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#185FA5",padding:"0 2px",flexShrink:0}}>✏️</button></div>
            <p style={{margin:"0 0 4px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>{currentUser.phone}</p>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:12,background:"var(--color-background-secondary,#f4f4f4)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}><span style={{fontSize:12}}>{roleIcon}</span><span style={{fontSize:11,color:"var(--color-text-secondary,#888)",fontWeight:500}}>{roleLabel}</span></div>
              {rating&&(<div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:12,background:"#FFF8E6",border:"0.5px solid #F0C040"}}><Stars r={rating.avg} size={12}/><span style={{fontSize:11,color:"#7A5C00",fontWeight:600}}>{rating.avg}</span><span style={{fontSize:10,color:"#B07A00"}}>({rating.count})</span></div>)}
            </div>
          </div>
        </div>
        {currentUser.about&&<p style={{margin:"0 0 10px",fontSize:13,color:"var(--color-text-primary,#111)",lineHeight:1.5}}>{currentUser.about}</p>}
        {isExecutor&&skillsList.length>0&&(<div style={{marginBottom:8}}><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{skillsList.map(s=><span key={s} style={{padding:"3px 10px",borderRadius:20,background:"#E6F1FB",color:"#185FA5",fontSize:11,fontWeight:500}}>{s}</span>)}</div></div>)}
        {isExecutor&&currentUser.experience&&<p style={{margin:"0 0 8px",fontSize:12,color:"var(--color-text-secondary,#888)",fontStyle:"italic"}}>{currentUser.experience}</p>}
        <button onClick={()=>push({type:"editProfile"})} className="rb" style={{width:"100%",marginTop:4,padding:"9px",borderRadius:10,border:"0.5px solid #185FA5",background:"#E6F1FB",cursor:"pointer",fontSize:12,color:"#185FA5",fontWeight:600}}>✏️ {t.editProfile}</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {statItems.map(([k,v],i)=>(<div key={k} className="fe" style={{animationDelay:`${i*0.05}s`,background:"var(--color-background-secondary,#f4f4f4)",borderRadius:11,padding:"11px 8px",textAlign:"center"}}><div style={{fontSize:17,fontWeight:600,color:"var(--color-text-primary,#111)",marginBottom:2}}>{v}</div><div style={{fontSize:10,color:"var(--color-text-secondary,#888)"}}>{k}</div></div>))}
      </div>
      {completedWithPendingReviews.length>0&&(
        <div className="fe" style={{background:"#FFF8E6",border:"0.5px solid #F0C040",borderRadius:14,padding:"12px 14px",marginBottom:12}}>
          <p style={{margin:"0 0 8px",fontSize:12,fontWeight:700,color:"#7A5C00"}}>⭐ {lang==="ru"?"Оставьте отзывы исполнителям:":"Аткаруучуларга пикир калтырыңыз:"}</p>
          {completedWithPendingReviews.slice(0,3).map(tk=>{const cr=responses.find(r=>r.taskId===tk.id&&r.status==="chosen");if(!cr)return null;const title=lang==="ru"?tk.ru:tk.ky;return(<button key={tk.id} className="rb" onClick={()=>push({type:"leaveReview",taskId:tk.id,targetId:cr.executorId,taskTitle:title})} style={{width:"100%",padding:"8px 12px",borderRadius:10,border:"0.5px solid #F0C040",background:"#fff",cursor:"pointer",fontSize:12,color:"#7A5C00",fontWeight:500,textAlign:"left",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,paddingRight:8}}>📋 {title}</span><span style={{flexShrink:0,color:"#BA7517"}}>★ →</span></button>);})}
        </div>
      )}
      <div style={{background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:14,padding:"12px 14px",marginBottom:12}}>
        <p style={{margin:"0 0 8px",fontSize:12,fontWeight:700,color:"var(--color-text-secondary,#888)",textTransform:"uppercase",letterSpacing:0.5}}>{t.language}</p>
        <div style={{display:"flex",gap:8}}>{LANGS.map(l=>(<button key={l.id} className="pb" onClick={()=>setLang(l.id)} style={{flex:1,padding:"10px 8px",borderRadius:10,border:"0.5px solid",cursor:"pointer",textAlign:"center",borderColor:lang===l.id?"#185FA5":"var(--color-border-tertiary,#e0e0e0)",background:lang===l.id?"#E6F1FB":"transparent"}}><div style={{fontSize:22,marginBottom:3}}>{l.flag}</div><div style={{fontSize:12,fontWeight:lang===l.id?700:400,color:lang===l.id?"#185FA5":"var(--color-text-primary,#111)"}}>{lang==="ru"?(l.id==="ru"?"Русский":"Кыргызча"):(l.id==="ru"?"Орусча":"Кыргызча")}</div></button>))}</div>
      </div>
      <div style={{background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:14,overflow:"hidden"}}>
        {menuItems.map((item,i,arr)=>(<div key={item.label} onClick={item.action} style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",borderBottom:i<arr.length-1?"0.5px solid var(--color-border-tertiary,#e0e0e0)":"none",cursor:item.action?"pointer":"default",transition:"opacity 0.12s"}} onMouseEnter={e=>item.action&&(e.currentTarget.style.opacity="0.6")} onMouseLeave={e=>(e.currentTarget.style.opacity="1")}><span style={{fontSize:16,width:22,textAlign:"center"}}>{item.icon}</span><span style={{flex:1,fontSize:14,color:item.danger?"#A32D2D":"var(--color-text-primary,#111)",fontWeight:item.bold?600:400}}>{item.label}</span>{!item.danger&&<span style={{color:"var(--color-text-secondary,#888)",fontSize:17}}>›</span>}</div>))}
      </div>
    </div>
  );
}

function TabTasks() {
  const { lang, t, tasks, responses, push, currentUser, settings } = useApp();
  const [search,setSearch]=useState("");const [city,setCity]=useState(null);const [catId,setCatId]=useState(null);const [sort,setSort]=useState("new");const [lk,setLk]=useState(0);
  const rekey=fn=>{fn();setLk(k=>k+1);};
  const openCityPicker=()=>push({type:"cityPicker",currentCity:city,onSelect:{fn:id=>{setCity(id);setLk(k=>k+1);}}});
  const SORTS=[{id:"new",l:t.sortNew},{id:"asc",l:t.sortCheap},{id:"desc",l:t.sortExpensive},{id:"dist",l:t.sortNear}];
  const statusColor={open:"#0F6E56",closed_by_choice:"#B05E0A",closed_expired:"#888",completed:"#185FA5"};
  const statusLabel={open:t.statusOpen,closed_by_choice:t.statusClosed,closed_expired:t.statusExpired,completed:t.statusCompleted};
  const isCustomer=currentUser.role==="customer";
  let list=tasks.filter(tk=>isCustomer?(tk.status==="open"||tk.ownerId===currentUser.id):(tk.status==="open"||responses.some(r=>r.taskId===tk.id&&r.executorId===currentUser.id)));
  if (!isCustomer&&settings.myCategories.length>0) list=list.filter(tk=>settings.myCategories.includes(tk.cat));
  if (search.trim()){const q=search.toLowerCase();list=list.filter(tk=>tk.ru.toLowerCase().includes(q)||tk.ky.toLowerCase().includes(q)||CATS[tk.cat][lang].toLowerCase().includes(q));}
  if (city) list=list.filter(tk=>tk.city===city);
  if (catId!==null) list=list.filter(tk=>tk.cat===catId);
  list.sort((a,b)=>sort==="asc"?a.price-b.price:sort==="desc"?b.price-a.price:sort==="dist"?a.dist-b.dist:(b.createdAt||b.id)-(a.createdAt||a.id));
  return (
    <div style={{position:"relative",height:"100%",display:"flex",flexDirection:"column"}}>
      <TopBar search={search} setSearch={v=>{setSearch(v);setLk(k=>k+1);}} city={city} setCity={v=>{setCity(v);setLk(k=>k+1);}} onCityPress={openCityPicker}/>
      <div style={{padding:"6px 12px 0",background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",flexShrink:0}}>
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:6}}>
          <button className="pb" onClick={()=>rekey(()=>setCatId(null))} style={{flexShrink:0,padding:"3px 10px",borderRadius:20,border:"0.5px solid",cursor:"pointer",fontSize:11,borderColor:catId===null?"#185FA5":"var(--color-border-tertiary,#e0e0e0)",background:catId===null?"#185FA5":"transparent",color:catId===null?"#fff":"var(--color-text-secondary,#888)",fontWeight:catId===null?600:400}}>🗂 {t.allCats}</button>
          {CATS.map(c=><button key={c.id} className="pb" onClick={()=>rekey(()=>setCatId(c.id))} style={{flexShrink:0,padding:"3px 10px",borderRadius:20,border:"0.5px solid",cursor:"pointer",fontSize:11,borderColor:catId===c.id?c.color:"var(--color-border-tertiary,#e0e0e0)",background:catId===c.id?c.bg:"transparent",color:catId===c.id?c.color:"var(--color-text-secondary,#888)",fontWeight:catId===c.id?600:400}}>{c.icon} {c[lang]}</button>)}
        </div>
        <div style={{display:"flex",gap:5,paddingBottom:6}}>
          {SORTS.map(s=><button key={s.id} className="pb" onClick={()=>rekey(()=>setSort(s.id))} style={{flexShrink:0,padding:"3px 10px",borderRadius:8,border:"0.5px solid",cursor:"pointer",fontSize:11,borderColor:sort===s.id?"#185FA5":"var(--color-border-tertiary,#e0e0e0)",background:sort===s.id?"#185FA5":"transparent",color:sort===s.id?"#fff":"var(--color-text-secondary,#888)",fontWeight:sort===s.id?600:400}}>{s.l}</button>)}
        </div>
      </div>
      <div key={lk} style={{flex:1,overflowY:"auto",padding:"8px 12px 16px"}}>
        {list.length===0?<div style={{textAlign:"center",padding:"40px 0",color:"var(--color-text-secondary,#888)",fontSize:13}}>{t.noTasks}</div>
        :list.map((task,i)=>{
          const cat=CATS[task.cat],loc=CITIES.find(c=>c.id===task.city),sc=statusColor[task.status]||"#888",isOwn=task.ownerId===currentUser.id;
          return (
            <div key={task.id} className="card fe" style={{animationDelay:`${i*0.04}s`,background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:14,padding:"12px 13px",marginBottom:8}} onClick={()=>push({type:"taskDetail",task})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}><Pill color={cat.color} bg={cat.bg}>{cat.icon} {cat[lang]}</Pill>{task.urgent&&<Pill color="#A32D2D" bg="#FCEBEB">{t.urgent}</Pill>}{isOwn&&<Pill color="#185FA5" bg="#E6F1FB">👤 {t.myOwnTask}</Pill>}</div>
                <span style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary,#111)",whiteSpace:"nowrap",marginLeft:6}}>{task.price.toLocaleString()} сом</span>
              </div>
              <p style={{margin:"0 0 6px",fontSize:14,fontWeight:500,color:"var(--color-text-primary,#111)",lineHeight:1.3}}>{task[lang==="ru"?"ru":"ky"]}</p>
              <div style={{display:"flex",gap:8,fontSize:11,color:"var(--color-text-secondary,#888)",flexWrap:"wrap",alignItems:"center"}}>
                <span>{locIcon(loc?.t||"city")} {loc?locName(loc,lang):"—"}</span><span>🕐 {task.time}</span>
                <span style={{marginLeft:"auto",fontSize:10,fontWeight:600,color:sc,padding:"2px 7px",borderRadius:12,background:sc+"18"}}>{statusLabel[task.status]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabCreate() {
  const { lang, t, setTasks, addNotification, push, currentUser, switchTab } = useApp();
  const isExecutor=currentUser.role==="executor";
  if (isExecutor) return (
    <div className="tc" style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"30px 24px",gap:16}}>
      <div style={{fontSize:52}}>🚫</div>
      <p style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary,#111)",textAlign:"center",margin:0}}>{t.noCreateForExecutor}</p>
      <button className="rb" onClick={()=>switchTab("tasks")} style={{marginTop:8,padding:"11px 28px",borderRadius:12,border:"none",background:"#185FA5",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>{lang==="ru"?"К заданиям":"Тапшырмаларга"}</button>
    </div>
  );
  const [step,setStep]=useState(1);const [form,setForm]=useState({title:"",cat:0,price:"",loc:"bishkek",desc:"",urgent:false});const [photos,setPhotos]=useState([]);const [err1,setErr1]=useState({});  const fmtPhone=raw=>{let d=raw.replace(/\D/g,"");if(d.startsWith("996"))d=d.slice(3);if(d.startsWith("0"))d=d.slice(1);d=d.slice(0,9);let o="+996";if(d.length>0)o+=" "+d.slice(0,3);if(d.length>3)o+=" "+d.slice(3,5);if(d.length>5)o+=" "+d.slice(5,7);if(d.length>7)o+=" "+d.slice(7,9);return o;};
  const [form2,setForm2]=useState({address:"",startDate:"",startTime:"",period:"",periodCustom:"",phone:"+996 "});const [err2,setErr2]=useState({});const [periodMode,setPeriodMode]=useState("select");
  const fileRef=useRef(),camRef=useRef();
  const set1=(k,v)=>{setForm(f=>({...f,[k]:v}));setErr1(e=>({...e,[k]:false}));};
  const set2=(k,v)=>{setForm2(f=>({...f,[k]:v}));setErr2(e=>({...e,[k]:false}));};
  const groups={};CITIES.forEach(c=>{const g=lang==="ru"?c.g_ru:c.g_ky;if(!groups[g])groups[g]=[];groups[g].push(c);});
  const addFiles=files=>{Array.from(files).slice(0,3-photos.length).forEach(f=>{const url=URL.createObjectURL(f);setPhotos(p=>[...p,{url,name:f.name}].slice(0,3));});};
  const removePhoto=idx=>setPhotos(p=>p.filter((_,i)=>i!==idx));
  const v1=()=>{const e={};if(!form.title.trim())e.title=true;if(!form.price)e.price=true;setErr1(e);return!Object.keys(e).length;};
  const v2=()=>{const e={};if(!form2.address.trim())e.address=true;    if(!/^\+996\d{9}$/.test(form2.phone.replace(/\s/g,"")))e.phone=true;setErr2(e);return!Object.keys(e).length;};
  const goToPayment=()=>{
    if (!v2()) return;
    push({type:"payment",paymentType:"create",taskTitle:form.title,onConfirm:{fn:()=>{
      const sl=form2.startDate?(form2.startDate+(form2.startTime?" "+form2.startTime:"")):(lang==="ru"?"Сегодня":"Бүгүн");
      const _now=Date.now();
      const nt={id:_now,createdAt:_now,cat:form.cat,price:Number(form.price)||0,city:form.loc,time:sl,urgent:form.urgent,dist:Math.random()*3,ru:form.title,ky:form.title,dRu:(form.desc||"Подробности уточняются.")+" Адрес: "+form2.address,dKy:(form.desc||"Чоо-жайы такталат.")+" Дарек: "+form2.address,photos:photos.map(p=>p.url),ownerId:currentUser.id,status:"open",reactivation_count:0,chosen_executor_id:null,expires_at:new Date(_now+7*86400000),completed:false};
      setTasks(ts=>[nt,...ts]);
      addNotification(currentUser.id, lang==="ru"?`✅ Задание «${form.title}» опубликовано`:`✅ «${form.title}» жарыяланды`);
      reset();
    }}});
  };
  const reset=()=>{setStep(1);setForm({title:"",cat:0,price:"",loc:"bishkek",desc:"",urgent:false});setForm2({address:"",startDate:"",startTime:"",period:"",periodCustom:"",phone:"+996 "});setPhotos([]);setErr1({});setErr2({});setPeriodMode("select");};
  const periodOptions=lang==="ru"?PERIOD_OPTIONS_RU:PERIOD_OPTIONS_KY;
  if (step===2) return (
    <div className="tc" style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 14px",background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",flexShrink:0}}>
        <button className="back-btn" onClick={()=>setStep(1)}><span style={{fontSize:15}}>←</span><span>{lang==="ru"?"Назад":"Артка"}</span></button>
        <p style={{margin:0,flex:1,fontSize:14,fontWeight:600,color:"var(--color-text-primary,#111)",textAlign:"center"}}>{t.step2Label}</p><div style={{minWidth:60}}/>
      </div>
      <StepBar step={2} lang={lang} t={t}/>
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 8px"}}>
        <div className="fe" style={{marginBottom:14}}><p style={{margin:"0 0 5px",fontSize:12,fontWeight:err2.address?600:400,color:err2.address?"#A32D2D":"var(--color-text-secondary,#888)"}}>📍 {t.fAddress}{err2.address?t.errRequired:""}</p><textarea value={form2.address} onChange={e=>set2("address",e.target.value)} placeholder={t.phAddress} rows={2} className={err2.address?"err-input":""} style={{width:"100%",resize:"none",lineHeight:1.5}}/></div>
        <div className="fe" style={{marginBottom:14}}><p style={{margin:"0 0 7px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>🗓 {t.fStartDate}</p><div style={{display:"flex",gap:8}}><input type="date" value={form2.startDate} onChange={e=>set2("startDate",e.target.value)} style={{flex:1.6,minWidth:0}}/><input type="time" value={form2.startTime} onChange={e=>set2("startTime",e.target.value)} style={{flex:1,minWidth:0}}/></div></div>
        <div className="fe" style={{marginBottom:14}}><p style={{margin:"0 0 7px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>⏳ {t.fPeriod}</p>{periodMode==="select"?<select value={form2.period} onChange={e=>{if(e.target.value===periodOptions[periodOptions.length-1]){setPeriodMode("custom");set2("period","");}else set2("period",e.target.value);}} style={{width:"100%"}}><option value="">{t.periodPlaceholder}</option>{periodOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>:<div style={{display:"flex",gap:8}}><input autoFocus type="text" value={form2.periodCustom} onChange={e=>set2("periodCustom",e.target.value)} placeholder={lang==="ru"?"Например: до 20 июля":"Мисалы: 20-июлга чейин"} style={{flex:1}}/><button onClick={()=>{setPeriodMode("select");set2("periodCustom","");}} style={{padding:"0 10px",borderRadius:9,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"var(--color-background-secondary,#f4f4f4)",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary,#888)",flexShrink:0}}>✕</button></div>}</div>
        <div className="fe" style={{marginBottom:24}}><p style={{margin:"0 0 5px",fontSize:12,fontWeight:err2.phone?600:400,color:err2.phone?"#A32D2D":"var(--color-text-secondary,#888)"}}>📞 {t.fPhone}{err2.phone?t.errPhone:""}</p>          <input type="tel" value={form2.phone} onChange={e=>set2("phone",fmtPhone(e.target.value))} placeholder={t.phPhone} className={err2.phone?"err-input":""} style={{width:"100%"}}/></div>
        <button className="rb" onClick={goToPayment} style={{width:"100%",padding:14,borderRadius:12,border:"none",cursor:"pointer",background:"#185FA5",color:"#fff",fontSize:15,fontWeight:700,marginBottom:16}}>{lang==="ru"?"Опубликовать":"Жарыялоо"}</button>
      </div>
    </div>
  );
  const fields=[[t.fTitle,<input placeholder={t.phTitle} value={form.title} onChange={e=>set1("title",e.target.value)} className={err1.title?"err-input":""} style={{width:"100%"}}/>,"title"],[t.fCat,<select value={form.cat} onChange={e=>set1("cat",Number(e.target.value))} style={{width:"100%"}}>{CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c[lang]}</option>)}</select>,null],[t.fLoc,<select value={form.loc} onChange={e=>set1("loc",e.target.value)} style={{width:"100%"}}>{Object.entries(groups).map(([g,lcs])=><optgroup key={g} label={g}>{lcs.map(l=><option key={l.id} value={l.id}>{locIcon(l.t)} {locName(l,lang)}</option>)}</optgroup>)}</select>,null],[t.fBudget,<input type="number" placeholder="1500" value={form.price} onChange={e=>set1("price",e.target.value)} className={err1.price?"err-input":""} style={{width:"100%"}}/>,"price"],[t.fDesc,<textarea placeholder={t.phDesc} value={form.desc} onChange={e=>set1("desc",e.target.value)} rows={3} style={{width:"100%",resize:"none"}}/>,null]];
  return (
    <div className="tc" style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <StepBar step={1} lang={lang} t={t}/>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px 16px"}}>
        <p style={{margin:"0 0 14px",fontSize:17,fontWeight:600,color:"var(--color-text-primary,#111)"}}>{t.newTask}</p>
        {fields.map(([lbl,inp,ek],i)=>(<div key={i} className="fe" style={{marginBottom:12,animationDelay:`${i*0.04}s`}}><p style={{margin:"0 0 5px",fontSize:12,color:ek&&err1[ek]?"#A32D2D":"var(--color-text-secondary,#888)",fontWeight:ek&&err1[ek]?600:400}}>{lbl}{ek&&err1[ek]?t.errRequired:""}</p>{inp}</div>))}
        <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,cursor:"pointer"}}><input type="checkbox" checked={form.urgent} onChange={e=>set1("urgent",e.target.checked)} style={{width:16,height:16,accentColor:"#A32D2D"}}/><span style={{fontSize:13,color:"#A32D2D",fontWeight:500}}>⚡ {lang==="ru"?"Срочное задание":"Шашылыш тапшырма"}</span></label>
        <div className="fe" style={{marginBottom:20}}>
          <p style={{margin:"0 0 8px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>{lang==="ru"?"Фото (до 3)":"Сүрөт (3гө чейин)"}</p>
          {photos.length>0&&(<div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>{photos.map((ph,i)=>(<div key={i} style={{position:"relative",width:80,height:80,borderRadius:10,overflow:"hidden",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",flexShrink:0}}><img src={ph.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/><button onClick={()=>removePhoto(i)} style={{position:"absolute",top:3,right:3,width:18,height:18,borderRadius:9,background:"rgba(0,0,0,0.55)",border:"none",cursor:"pointer",color:"#fff",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>✕</button></div>))}{photos.length<3&&<button onClick={()=>fileRef.current.click()} style={{width:80,height:80,borderRadius:10,border:"1.5px dashed #185FA5",background:"#E6F1FB",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,flexShrink:0}}><span style={{fontSize:18,color:"#185FA5"}}>＋</span><span style={{fontSize:9,color:"#185FA5",fontWeight:600}}>{lang==="ru"?"Добавить":"Кошуу"}</span></button>}</div>)}
          {photos.length===0&&(<div style={{display:"flex",gap:8}}><button onClick={()=>fileRef.current.click()} className="pb" style={{flex:1,padding:"11px 8px",borderRadius:10,border:"1.5px dashed var(--color-border-tertiary,#e0e0e0)",background:"var(--color-background-secondary,#f4f4f4)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}><span style={{fontSize:22}}>🖼</span><span style={{fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:500}}>Галерея</span></button><button onClick={()=>camRef.current.click()} className="pb" style={{flex:1,padding:"11px 8px",borderRadius:10,border:"1.5px dashed var(--color-border-tertiary,#e0e0e0)",background:"var(--color-background-secondary,#f4f4f4)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}><span style={{fontSize:22}}>📷</span><span style={{fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:500}}>Камера</span></button></div>)}
          {photos.length>0&&photos.length<3&&(<div style={{display:"flex",gap:8,marginTop:6}}><button onClick={()=>fileRef.current.click()} className="pb" style={{flex:1,padding:"7px",borderRadius:9,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"var(--color-background-secondary,#f4f4f4)",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary,#888)"}}>🖼 Галерея</button><button onClick={()=>camRef.current.click()} className="pb" style={{flex:1,padding:"7px",borderRadius:9,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"var(--color-background-secondary,#f4f4f4)",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary,#888)"}}>📷 Камера</button></div>)}
          <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{addFiles(e.target.files);e.target.value="";}}/>
          <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{addFiles(e.target.files);e.target.value="";}}/>
          <p style={{margin:"5px 0 0",fontSize:10,color:"var(--color-text-secondary,#888)"}}>{lang==="ru"?`Загружено ${photos.length} из 3`:`${photos.length}/3 жүктөлдү`}</p>
        </div>
        <button className="rb" onClick={()=>{if(v1())setStep(2);}} style={{width:"100%",padding:14,borderRadius:12,border:"none",cursor:"pointer",background:"#185FA5",color:"#fff",fontSize:15,fontWeight:700}}>{lang==="ru"?"Далее →":"Андан ары →"}</button>
      </div>
    </div>
  );
}

const getTabsCfg = role => role==="executor"
  ? [{id:"tasks",icon:"🗂"},{id:"profile",icon:"👤"}]
  : [{id:"tasks",icon:"🗂"},{id:"create",icon:"＋"},{id:"profile",icon:"👤"}];

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [lang,setLang]       = useState("ru");
  const [authState,setAuthState] = useState(null);
  const [currentUser,setCurrentUser] = useState(null);
  const [usersDB,setUsersDB] = useState({});
  const [tab,setTab]         = useState("tasks");
  const [tabKey,setTabKey]   = useState(0);
  const [navStack,setNavStack] = useState([]);
  const [tasks,setTasks]     = useState([]);
  const [responses,setResponses] = useState([]);
  const [reviews,setReviews] = useState([]);
  const [settings,setSettings] = useState(loadSettings);
  // Единое хранилище всех уведомлений
  const [allNotifs,setAllNotifs] = useState([]);

  // Начальная загрузка
  useEffect(()=>{
    const saved=loadUser();const db=loadUsersDB();setUsersDB(db);ensureDemoDB();
    if (saved&&saved.id){
      setCurrentUser(saved);
      const storedT=loadTasksDB();
      if(storedT){setTasks(storedT);}
      else{const initT=buildInitTasks(saved.id);setTasks(initT);saveTasksDB(initT);}
      const storedR=loadRespDB();
      if(storedR.length){setResponses(storedR);}
      else{const dr=[{id:"resp_demo_1",taskId:0,executorId:DEMO_EXEC_ID,priceOffer:6000,comment:"Сделаю качественно, есть опыт!",status:"chosen",createdAt:new Date(Date.now()-86400000).toISOString()}];setResponses(dr);saveRespDB(dr);}
      setReviews(loadReviewsDB());
      setAllNotifs(loadNotifsDB());
      setAuthState("app");
    } else setAuthState("login");
  },[]);

  // Проверка истёкших заданий (каждую минуту)
  useEffect(()=>{
    if (authState!=="app") return;
    const check=()=>{
      const now=Date.now();
      setTasks(prev=>{
        const expired=prev.filter(tk=>tk.status==="open"&&new Date(tk.expires_at).getTime()<now);
        if (!expired.length) return prev;
        expired.forEach(tk=>{
          const title=lang==="ru"?tk.ru:tk.ky;
          // Уведомление заказчику
          addNotification(tk.ownerId, lang==="ru"?`⏰ Срок задания «${title}» истёк`:`⏰ «${title}» тапшырмасынын мөөнөтү өттү`);
          // Отклики → declined + уведомление каждому исполнителю
          setResponses(rs=>{
            const updated=rs.map(r=>{
              if (r.taskId!==tk.id||r.status!=="pending") return r;
              addNotification(r.executorId, lang==="ru"?`⏰ Задание «${title}» истекло, ваш отклик отменён`:`⏰ «${title}» мөөнөтү өттү, жообуңуз жокко чыгарылды`);
              return {...r,status:"declined"};
            });
            saveRespDB(updated);
            return updated;
          });
        });
        return prev.map(tk=>tk.status==="open"&&new Date(tk.expires_at).getTime()<now?{...tk,status:"closed_expired"}:tk);
      });
    };
    check();const id=setInterval(check,60_000);return()=>clearInterval(id);
  },[authState]);

  // Persist helpers
  const setTasksPersist    = useCallback(u=>setTasks(p=>{const n=typeof u==="function"?u(p):u;saveTasksDB(n);return n;}),[]);
  const setRespPersist     = useCallback(u=>setResponses(p=>{const n=typeof u==="function"?u(p):u;saveRespDB(n);return n;}),[]);
  const setReviewsPersist  = useCallback(u=>setReviews(p=>{const n=typeof u==="function"?u(p):u;saveReviewsDB(n);return n;}),[]);
  const setAllNotifsPersist= useCallback(u=>setAllNotifs(p=>{const n=typeof u==="function"?u(p):u;saveNotifsDB(n);return n;}),[]);

  /**
   * addNotification(userId, text) — отправить конкретному пользователю
   * addNotification(text)         — отправить текущему пользователю (обратная совместимость)
   */
  const addNotification = useCallback((uidOrText, maybeText)=>{
    const uid = maybeText!==undefined ? uidOrText : currentUser?.id;
    const msg = maybeText!==undefined ? maybeText  : uidOrText;
    if (!uid||!msg) return;
    const notif={id:`n_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,userId:uid,text:msg,read:false,time:nowStr()};
    setAllNotifsPersist(ns=>[notif,...ns].slice(0,500));
  },[currentUser?.id, setAllNotifsPersist]);

  const push      = useCallback(entry=>setNavStack(s=>[...s,entry]),[]);
  const pop       = useCallback(()=>setNavStack(s=>s.slice(0,-1)),[]);
  const switchTab = useCallback(id=>{setNavStack([]);setTab(id);setTabKey(k=>k+1);},[]);

  const handleSelectRole = useCallback(role=>{
    const u={...currentUser,role};setCurrentUser(u);saveUser(u);
    const db=loadUsersDB();if(db[u.phone]){db[u.phone]=u;saveUsersDB(db);}setUsersDB({...db});
    setAuthState("app");
  },[currentUser]);

  const handleLogout = useCallback(()=>{
    clearUser();setCurrentUser(null);setNavStack([]);setTab("tasks");setTabKey(k=>k+1);
    setAllNotifs([]);setResponses([]);setReviews([]);setTasks([]);setAuthState("login");
  },[]);

  const handleLogin = useCallback(user=>{
    setCurrentUser(user);saveUser(user);
    const db=loadUsersDB();setUsersDB(db);
    const stored=loadTasksDB();
    if (stored){setTasks(stored);}
    else{const initT=buildInitTasks(user.id);setTasks(initT);saveTasksDB(initT);const dr=[{id:"resp_demo_1",taskId:0,executorId:DEMO_EXEC_ID,priceOffer:6000,comment:"Сделаю качественно, есть опыт!",status:"chosen",createdAt:new Date(Date.now()-86400000).toISOString()}];saveRespDB(dr);}
    setResponses(loadRespDB());
    setReviews(loadReviewsDB());
    // Загружаем ВСЕ уведомления; фильтрация — по userId при отображении
    setAllNotifs(loadNotifsDB());
    if (!user.role) setAuthState("role"); else setAuthState("app");
  },[]);

  const TABS_CFG=getTabsCfg(currentUser?.role);
  const TAB_LABELS={tasks:T[lang].tasks,create:T[lang].create,profile:T[lang].profile};
  const currentNav=navStack[navStack.length-1]||null;
  const t=T[lang];

  // Уведомления текущего пользователя (производное от allNotifs)
  const notifications = allNotifs.filter(n=>n.userId===currentUser?.id);
  const clearNotifications = useCallback(()=>{
    setAllNotifsPersist(ns=>ns.filter(n=>n.userId!==currentUser?.id));
  },[currentUser?.id, setAllNotifsPersist]);

  const renderNav=entry=>{
    switch(entry.type){
      case "taskDetail":    return <TaskDetailScreen task={entry.task}/>;
      case "payment":       return <PaymentScreen paymentType={entry.paymentType} taskTitle={entry.taskTitle} onConfirm={entry.onConfirm.fn}/>;
      case "cityPicker":    return <CityPickerScreen currentCity={entry.currentCity} onSelect={entry.onSelect.fn}/>;
      case "notifications": return <NotificationsScreen/>;
      case "myTasks":       return <MyTasksScreen/>;
      case "settings":      return <SettingsScreen/>;
      case "myResponses":   return <MyResponsesScreen/>;
      case "editProfile":   return <EditProfileScreen/>;
      case "leaveReview":   return <LeaveReviewScreen taskId={entry.taskId} targetId={entry.targetId} taskTitle={entry.taskTitle}/>;
      case "userProfile":   return <UserProfileScreen userId={entry.userId}/>;
      default: return null;
    }
  };

  if (authState===null) return (
    <div style={{maxWidth:390,margin:"0 auto",height:720,display:"flex",alignItems:"center",justifyContent:"center",background:"#fff",borderRadius:24,border:"0.5px solid #e0e0e0"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:52,marginBottom:10}}>🇰🇬</div><p style={{fontSize:20,fontWeight:700,color:"#185FA5",margin:0}}>ИшТап</p></div>
    </div>
  );
  if (authState==="login") return <div style={{maxWidth:390,margin:"0 auto",position:"relative",background:"#f0f0f0",borderRadius:24,overflow:"hidden",height:720,display:"flex",flexDirection:"column",border:"0.5px solid #e0e0e0"}}><style>{css}</style><LoginScreen lang={lang} setLang={setLang} onLogin={handleLogin}/></div>;
  if (authState==="role")  return <div style={{maxWidth:390,margin:"0 auto",position:"relative",background:"#f0f0f0",borderRadius:24,overflow:"hidden",height:720,display:"flex",flexDirection:"column",border:"0.5px solid #e0e0e0"}}><style>{css}</style><RoleScreen lang={lang} user={currentUser} onSelectRole={handleSelectRole}/></div>;

  const ctxValue={
    lang,t,setLang,
    tasks,setTasks:setTasksPersist,
    responses,setResponses:setRespPersist,
    reviews,setReviews:setReviewsPersist,
    notifications, clearNotifications, addNotification,
    push,pop,switchTab,
    currentUser,setCurrentUser,usersDB,
    onLogout:handleLogout,settings,setSettings,
  };

  return (
    <Ctx.Provider value={ctxValue}>
      <style>{css}</style>
      <div className={settings.darkTheme?"dark-mode":""} style={{maxWidth:390,margin:"0 auto",position:"relative",background:settings.darkTheme?"#111113":"#f0f0f0",borderRadius:24,overflow:"hidden",height:720,display:"flex",flexDirection:"column",border:`0.5px solid ${settings.darkTheme?"#38383A":"#e0e0e0"}`}}>
        <div style={{flex:1,overflow:"hidden",position:"relative",display:"flex",flexDirection:"column"}}>
          {currentNav
            ?<div style={{height:"100%",display:"flex",flexDirection:"column"}}>{renderNav(currentNav)}</div>
            :<div key={`${tab}-${tabKey}-${lang}`} style={{height:"100%",display:"flex",flexDirection:"column"}} className="tc">
              {tab==="tasks"&&<TabTasks/>}{tab==="create"&&<TabCreate/>}{tab==="profile"&&<TabProfile/>}
            </div>
          }
        </div>
        {!currentNav&&(
          <div style={{display:"flex",borderTop:"0.5px solid #e0e0e0",background:"#fff",flexShrink:0}}>
            {TABS_CFG.map(tb=>(
              <button key={tb.id} className="nb" onClick={()=>switchTab(tb.id)} style={{flex:1,padding:"9px 0 11px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <span style={{fontSize:tb.id==="create"?22:16,transition:"transform 0.2s cubic-bezier(.22,.68,0,1.4)",transform:tab===tb.id?"scale(1.2)":"scale(1)",display:"block",color:tab===tb.id?"#185FA5":"#888"}}>{tb.icon}</span>
                <span style={{fontSize:10,fontWeight:tab===tb.id?700:400,color:tab===tb.id?"#185FA5":"#888",transition:"color 0.15s"}}>{TAB_LABELS[tb.id]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
