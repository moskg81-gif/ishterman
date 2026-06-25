import { useState, useRef, createContext, useContext, useEffect, useCallback, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, writeBatch } from "firebase/firestore";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const LANGS = [{ id:"ru", flag:"🇷🇺", label:"RU" },{ id:"ky", flag:"🇰🇬", label:"KG" }];

const CITIES = [
  { id:"bishkek",     g_ru:"Бишкек",              g_ky:"Бишкек",              ru:"Бишкек",            ky:"Бишкек",            t:"city"     },
  { id:"bish_sverd",  g_ru:"Бишкек",              g_ky:"Бишкек",              ru:"Свердловский р-н",  ky:"Свердлов р-ну",     t:"district" },
  { id:"bish_okt",    g_ru:"Бишкек",              g_ky:"Бишкек",              ru:"Октябрьский р-н",   ky:"Октябрь р-ну",      t:"district" },
  { id:"bish_len",    g_ru:"Бишкек",              g_ky:"Бишкек",              ru:"Ленинский р-н",     ky:"Ленин р-ну",        t:"district" },
  { id:"bish_per",    g_ru:"Бишкек",              g_ky:"Бишкек",              ru:"Первомайский р-н",  ky:"Биринчи Май р-ну",  t:"district" },
  { id:"bish_alamudun",  g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Аламудун",          ky:"Аламудун",          t:"city"     },
  { id:"bish_vostok",    g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Восток",            ky:"Восток",            t:"city"     },
  { id:"bish_dachnoe",   g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Дачное",            ky:"Дачное",            t:"city"     },
  { id:"bish_dostuk",    g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Достук",            ky:"Достук",            t:"city"     },
  { id:"bish_kok_jar",   g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Кёк-Джар",          ky:"Кёк-Джар",          t:"city"     },
  { id:"bish_kyzyl_asker",g_ru:"Бишкек",         g_ky:"Бишкек",              ru:"Кызыл-Аскер",       ky:"Кызыл-Аскер",       t:"city"     },
  { id:"bish_lebedinovka",g_ru:"Бишкек",         g_ky:"Бишкек",              ru:"Лебединовка",       ky:"Лебединовка",       t:"city"     },
  { id:"bish_maevka",    g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Маевка",            ky:"Маевка",            t:"city"     },
  { id:"bish_mykan",     g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Мыкан",             ky:"Мыкан",             t:"city"     },
  { id:"bish_nizh_ala",  g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Нижняя Ала-Арча",   ky:"Нижняя Ала-Арча",   t:"city"     },
  { id:"bish_ozernoe",   g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Озёрное",           ky:"Озёрное",           t:"city"     },
  { id:"bish_orto_say",  g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Орто-Сай",          ky:"Орто-Сай",          t:"city"     },
  { id:"bish_prigorodnoe",g_ru:"Бишкек",         g_ky:"Бишкек",              ru:"Пригородное",       ky:"Пригородное",       t:"city"     },
  { id:"bish_sadovoe",   g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Садовое",           ky:"Садовое",           t:"city"     },
  { id:"bish_stepnoe",   g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Степное",           ky:"Степное",           t:"city"     },
  { id:"bish_chon_aryk", g_ru:"Бишкек",          g_ky:"Бишкек",              ru:"Чон-Арык",          ky:"Чон-Арык",          t:"city"     },
  { id:"tokmok",      g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Токмок",            ky:"Токмок",            t:"city"     },
  { id:"kara_balta",  g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кара-Балта",        ky:"Кара-Балта",        t:"city"     },
  { id:"kant",        g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кант",              ky:"Кант",              t:"city"     },
  { id:"sokuluk",     g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Сокулук",           ky:"Сокулук",           t:"city"     },
  { id:"belovodskoe", g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Беловодское",       ky:"Беловодское",       t:"city"     },
  { id:"kemin",       g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кемин",             ky:"Кемин",             t:"city"     },
  { id:"alamudun",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Аламүдүн",          ky:"Аламүдүн",          t:"city"     },
  { id:"ivanovka",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Ивановка",          ky:"Ивановка",          t:"city"     },
  { id:"panfilov",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Панфилов",          ky:"Панфилов",          t:"city"     },
  { id:"shopokoy",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Шопоков",           ky:"Шопоков",           t:"city"     },
  { id:"kara_jygach", g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кара-Жыгач",        ky:"Кара-Жыгач",        t:"city"     },
  { id:"voennaya",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Военно-Антоновка",  ky:"Военно-Антоновка",  t:"city"     },
  { id:"ak_suu_chuy", g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Ак-Суу",            ky:"Ак-Суу",            t:"city"     },
  { id:"kaindy",      g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Каинды",            ky:"Каинды",            t:"city"     },
  { id:"kirovskoe",   g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кировское",         ky:"Кировское",         t:"city"     },
  { id:"konstantinovka",g_ru:"Чуйская обл.",      g_ky:"Чүй облусу",          ru:"Константиновка",    ky:"Константиновка",    t:"city"     },
  { id:"lebedinovka", g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Лебединовка",       ky:"Лебединовка",       t:"city"     },
  { id:"maevka_chuy", g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Маевка",            ky:"Маевка",            t:"city"     },
  { id:"sosnovka",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Сосновка",          ky:"Сосновка",          t:"city"     },
  { id:"yuryevka",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Юрьевка",           ky:"Юрьевка",           t:"city"     },
  { id:"ak_tuz",      g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Ак-Туз",            ky:"Ак-Туз",            t:"city"     },
  { id:"verkhny_orok",g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Верхний Орок",      ky:"Верхний Орок",      t:"city"     },
  { id:"kayndy",      g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кайынды",           ky:"Кайынды",           t:"city"     },
  { id:"kok_jar",     g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кок-Джар",          ky:"Кок-Жар",           t:"city"     },
  { id:"kyzyl_oy",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Кызыл-Ой",          ky:"Кызыл-Ой",          t:"city"     },
  { id:"malovodnoye", g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Маловодное",        ky:"Маловодное",        t:"city"     },
  { id:"novopavlovka",g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Новопавловка",      ky:"Новопавловка",      t:"city"     },
  { id:"prigorodnoe", g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Пригородное",       ky:"Пригородное",       t:"city"     },
  { id:"suusamyr",    g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Суусамыр",          ky:"Суусамыр",          t:"city"     },
  { id:"tash_tobo",   g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Таш-Тобо",          ky:"Таш-Тобо",          t:"city"     },
  { id:"uch_emchek",  g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Уч-Эмчек",          ky:"Уч-Эмчек",          t:"city"     },
  { id:"shabdan",     g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Шабдан",            ky:"Шабдан",            t:"city"     },
  { id:"shamsi",      g_ru:"Чуйская обл.",        g_ky:"Чүй облусу",          ru:"Шамси",             ky:"Шамси",             t:"city"     },
  { id:"karakol",     g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Каракол",           ky:"Каракол",           t:"city"     },
  { id:"balykchy",    g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Балыкчы",           ky:"Балыкчы",           t:"city"     },
  { id:"cholpon_ata", g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Чолпон-Ата",        ky:"Чолпон-Ата",        t:"city"     },
  { id:"kyzyl_suu",   g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Кызыл-Суу",         ky:"Кызыл-Суу",         t:"city"     },
  { id:"tyup",        g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Тюп",               ky:"Түп",               t:"city"     },
  { id:"bokonbaevo",  g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Боконбаево",        ky:"Боконбаево",        t:"city"     },
  { id:"ak_suu",      g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Ак-Суу",            ky:"Ак-Суу",            t:"city"     },
  { id:"tamga",       g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Тамга",             ky:"Тамга",             t:"city"     },
  { id:"pokrovka",   g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Покровка",          ky:"Покровка",          t:"city"     },
  { id:"bosteri",    g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Бостери",           ky:"Бостери",           t:"city"     },
  { id:"grigorievka",g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Григорьевка",       ky:"Григорьевка",       t:"city"     },
  { id:"tamchy",     g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Тамчы",             ky:"Тамчы",             t:"city"     },
  { id:"barskoon",   g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Барскоон",          ky:"Барскоон",          t:"city"     },
  { id:"zhyrgalan",  g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Жыргалан",          ky:"Жыргалан",          t:"city"     },
  { id:"kara_oy",    g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Кара-Ой",           ky:"Кара-Ой",           t:"city"     },
  { id:"kichi_jar",  g_ru:"Иссык-Кульская обл.", g_ky:"Ысык-Көл облусу",     ru:"Кичи-Джаргылчак",   ky:"Кичи-Жаргылчак",    t:"city"     },
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
  { id:"tal_ak_jar",   g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Ак-Джар",           ky:"Ак-Жар",            t:"city"     },
  { id:"tal_ak_korgon",g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Ак-Коргон",         ky:"Ак-Коргон",         t:"city"     },
  { id:"tal_aral",     g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Арал",              ky:"Арал",              t:"city"     },
  { id:"tal_arashan",  g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Арашан",            ky:"Арашан",            t:"city"     },
  { id:"tal_besh_tash",g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Беш-Таш",           ky:"Беш-Таш",           t:"city"     },
  { id:"tal_jon_aryk", g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Джон-Арык",         ky:"Жон-Арык",          t:"city"     },
  { id:"tal_zhanybek", g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Жаныбек Баатыр",    ky:"Жаныбек Баатыр",    t:"city"     },
  { id:"tal_kara_oy",  g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Кара-Ой",           ky:"Кара-Ой",           t:"city"     },
  { id:"tal_kenesh",   g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Кенеш",             ky:"Кенеш",             t:"city"     },
  { id:"tal_kozuchak", g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Козучак",           ky:"Козучак",           t:"city"     },
  { id:"tal_kok_oy",   g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Кок-Ой",            ky:"Кок-Ой",            t:"city"     },
  { id:"tal_kum_aryk", g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Кум-Арык",          ky:"Кум-Арык",          t:"city"     },
  { id:"tal_kyzyl_tuu",g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Кызыл-Туу",         ky:"Кызыл-Туу",         t:"city"     },
  { id:"tal_orto_aryk",g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Орто-Арык",         ky:"Орто-Арык",         t:"city"     },
  { id:"tal_sasyk",    g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Сасык-Булак",       ky:"Сасык-Булак",       t:"city"     },
  { id:"tal_taldy",    g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Талды-Булак",       ky:"Талды-Булак",       t:"city"     },
  { id:"tal_tash_aryk",g_ru:"Таласская обл.",    g_ky:"Талас облусу",        ru:"Таш-Арык",          ky:"Таш-Арык",          t:"city"     },
  { id:"tal_uch_emchek",g_ru:"Таласская обл.",   g_ky:"Талас облусу",        ru:"Уч-Эмчек",          ky:"Уч-Эмчек",          t:"city"     },
  { id:"jalal",       g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Манас",             ky:"Манас",             t:"city"     },
  { id:"kara_darya",  g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Кара-Дарыя",        ky:"Кара-Дарыя",        t:"city"     },
  { id:"tash_kumyr",  g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Таш-Кумыр",         ky:"Таш-Күмүр",         t:"city"     },
  { id:"toktogul",    g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Токтогул",          ky:"Токтогул",          t:"city"     },
  { id:"mayluu_suu",  g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Майлуу-Суу",        ky:"Майлуу-Суу",        t:"city"     },
  { id:"kara_kol",    g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Кара-Куль",         ky:"Кара-Көл",          t:"city"     },
  { id:"suzak",       g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Сузак",             ky:"Сузак",             t:"city"     },
  { id:"bazar_korgon",g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Базар-Коргон",      ky:"Базар-Коргон",      t:"city"     },
  { id:"ala_buka",    g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Ала-Бука",          ky:"Ала-Бука",          t:"city"     },
  { id:"aksy",        g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Аксы",              ky:"Аксы",              t:"city"     },
  { id:"kerben",     g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Кербен",            ky:"Кербен",            t:"city"     },
  { id:"kazarman",   g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Казарман",          ky:"Казарман",          t:"city"     },
  { id:"kochkor_ata",g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Кочкор-Ата",        ky:"Кочкор-Ата",        t:"city"     },
  { id:"nooken",     g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Ноокен",            ky:"Ноокен",            t:"city"     },
  { id:"oktyabrskoe",g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Октябрьское",       ky:"Октябрьское",       t:"city"     },
  { id:"burgondu",   g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Бургонду",          ky:"Бургонду",          t:"city"     },
  { id:"shamaldy_say",g_ru:"Жалал-Абадская обл.",g_ky:"Жалал-Абад облусу",  ru:"Шамалды-Сай",       ky:"Шамалды-Сай",       t:"city"     },
  { id:"kyzyl_jar",  g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Кызыл-Жар",         ky:"Кызыл-Жар",         t:"city"     },
  { id:"masy",       g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Масы",              ky:"Масы",              t:"city"     },
  { id:"kok_zhanak", g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Кок-Жанак",         ky:"Кок-Жанак",         t:"city"     },
  { id:"chatkal",    g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Чаткал",            ky:"Чаткал",            t:"city"     },
  { id:"shakaftar",  g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Шакафтар",          ky:"Шакафтар",          t:"city"     },
  { id:"arslanbob",  g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Арсланбоб",         ky:"Арсланбоб",         t:"city"     },
  { id:"terek_say",  g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Терек-Сай",         ky:"Терек-Сай",         t:"city"     },
  { id:"sumsar",     g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Сумсар",            ky:"Сумсар",            t:"city"     },
  { id:"padysha_ata",g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Падыша-Ата",        ky:"Падыша-Ата",        t:"city"     },
  { id:"zhayyk",    g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Жайык",             ky:"Жайык",             t:"city"     },
  { id:"kara_dobo", g_ru:"Жалал-Абадская обл.", g_ky:"Жалал-Абад облусу",  ru:"Кара-Добо",         ky:"Кара-Добо",         t:"city"     },
  { id:"osh_city",    g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Ош",                ky:"Ош",                t:"city"     },
  { id:"kara_suu",    g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Кара-Суу",          ky:"Кара-Суу",          t:"city"     },
  { id:"nookat",      g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Ноокат",            ky:"Ноокат",            t:"city"     },
  { id:"aravan",      g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Араван",            ky:"Аравон",            t:"city"     },
  { id:"gulcha",      g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Гульча",            ky:"Гүлчө",             t:"city"     },
  { id:"kara_kuldzha",g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Кара-Кульджа",      ky:"Кара-Кулжа",        t:"city"     },
  { id:"chong_alai",  g_ru:"Ошская обл.",         g_ky:"Ош облусу",           ru:"Чон-Алай",          ky:"Чоң-Алай",          t:"city"     },
  { id:"daroot",        g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Дарот-Коргон",      ky:"Дарот-Коргон",      t:"city"     },
  { id:"papan",         g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Папан",             ky:"Папан",             t:"city"     },
  { id:"myrza_ake",     g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Мырза-Аке",         ky:"Мырза-Аке",         t:"city"     },
  { id:"karl_marks",    g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Карл-Маркс",        ky:"Карл-Маркс",        t:"city"     },
  { id:"kurshab",       g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Куршаб",            ky:"Куршаб",            t:"city"     },
  { id:"kara_shoro",    g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Кара-Шоро",         ky:"Кара-Шоро",         t:"city"     },
  { id:"pokrovka_osh",  g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Покровка",          ky:"Покровка",          t:"city"     },
  { id:"otuz_adyr",     g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Отуз-Адыр",         ky:"Отуз-Адыр",         t:"city"     },
  { id:"nayman_osh",    g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Найман",            ky:"Найман",            t:"city"     },
  { id:"kashkar",       g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Кашкар-Кыштак",     ky:"Кашкар-Кыштак",     t:"city"     },
  { id:"kyzyl_suu_osh", g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Кызыл-Суу",         ky:"Кызыл-Суу",         t:"city"     },
  { id:"mady",          g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Мады",              ky:"Мады",              t:"city"     },
  { id:"toolos",        g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Тоолос",            ky:"Тоолос",            t:"city"     },
  { id:"kerme_too",     g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Керме-Тоо",         ky:"Керме-Тоо",         t:"city"     },
  { id:"too_moyun",     g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Тоо-Моюн",          ky:"Тоо-Моюн",          t:"city"     },
  { id:"alay",          g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Алай",              ky:"Алай",              t:"city"     },
  { id:"alayku",        g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Алайку",            ky:"Алайку",            t:"city"     },
  { id:"kashka_suu",    g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Кашка-Суу",         ky:"Кашка-Суу",         t:"city"     },
  { id:"zhekendi",      g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Жекенди",           ky:"Жекенди",           t:"city"     },
  { id:"erkech_tam",    g_ru:"Ошская обл.",       g_ky:"Ош облусу",           ru:"Эркеч-Там",         ky:"Эркеч-Там",         t:"city"     },
  { id:"batken",      g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Баткен",            ky:"Баткен",            t:"city"     },
  { id:"kyzyl_kiya",  g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Кызыл-Кия",         ky:"Кызыл-Кыя",         t:"city"     },
  { id:"isfana",      g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Исфана",            ky:"Исфана",            t:"city"     },
  { id:"sulukta",     g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Сулюкта",           ky:"Сулукта",           t:"city"     },
  { id:"kadamjay",    g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Кадамжай",          ky:"Кадамжай",          t:"city"     },
  { id:"leilek",      g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Лейлек",            ky:"Лейлек",            t:"city"     },
  { id:"vorukh",      g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Воруx",             ky:"Ворух",             t:"city"     },
  { id:"khaydarkan", g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Хайдаркан",         ky:"Хайдаркан",         t:"city"     },
  { id:"ak_turpak",  g_ru:"Баткенская обл.",     g_ky:"Баткен облусу",       ru:"Ак-Турпак",         ky:"Ак-Турпак",         t:"city"     },
];
const locName  = (loc, l) => l==="ru" ? loc.ru  : loc.ky;
const locGroup = (loc, l) => l==="ru" ? loc.g_ru : loc.g_ky;
const locIcon  = t => t==="city"?"🏙":t==="district"?"🏘":"🌿";

const CATS = [
  { id:0,  ti:"ti-crane",              light:"#2478c8", ru:"Стройка",        ky:"Курулуш",        color:"#185FA5", bg:"#E6F1FB", shadow:"#0a3a6a" },
  { id:1,  ti:"ti-horse",             light:"#7a6012", ru:"Мал чарба",      ky:"Мал чарба",      color:"#5E4A0A", bg:"#F5ECDA", shadow:"#352900" },
  { id:2,  ti:"ti-tools-kitchen-2",   light:"#b04e9a", ru:"Той-Аш",         ky:"Той-Аш",         color:"#8A3A7A", bg:"#F5E6F5", shadow:"#4e1a43" },
  { id:3,  ti:"ti-bolt",              light:"#d4a800", ru:"Электрика",      ky:"Электрика",      color:"#B08A00", bg:"#FBF3CC", shadow:"#6b5300" },
  { id:4,  ti:"ti-tool",              light:"#d47512", ru:"Ремонт техники", ky:"Техника оңдоо",  color:"#B05E0A", bg:"#FAEEDD", shadow:"#6b3800" },
  { id:5,  ti:"ti-tractor",           light:"#729818", ru:"Полевые работы", ky:"Талаа иштери",   color:"#5A7A0F", bg:"#EEF5DC", shadow:"#2f4206" },
  { id:6,  ti:"ti-trees",             light:"#148a6c", ru:"Огород и сад",   ky:"Бак-Дарак",      color:"#0F6E56", bg:"#E1F5EE", shadow:"#063d2e" },
  { id:7,  ti:"ti-truck-delivery",    light:"#9c55bf", ru:"Доставка",       ky:"Доставка",       color:"#7C3D99", bg:"#F2E6FC", shadow:"#45205a" },
  { id:8,  ti:"ti-barbell",            light:"#c84040", ru:"Грузчик",        ky:"Жүк ташуучу",   color:"#A32D2D", bg:"#FCEBEB", shadow:"#4d0e0e" },
  { id:9,  ti:"ti-home",              light:"#1d84aa", ru:"Домашние дела",  ky:"Үй жумуштары",   color:"#1A6B8A", bg:"#DFF0F8", shadow:"#0a3d52" },
  { id:10, ti:"ti-gift",              light:"#3a9b40", ru:"Отдам бесплатно",ky:"Бекер берем",    color:"#2E7D32", bg:"#E8F5E9", shadow:"#14461a" },
  { id:11, ti:"ti-arrows-exchange",   light:"#8a35bf", ru:"Бартер",         ky:"Бартер",         color:"#6A1B9A", bg:"#F3E5F5", shadow:"#3d0e59" },
  { id:12, ti:"ti-wash",              light:"#00a5b5", ru:"Уборка",         ky:"Тазалоо",        color:"#00838F", bg:"#E0F7FA", shadow:"#004d57" },
  { id:13, ti:"ti-first-aid-kit",     light:"#e03278", ru:"Красота и здоровье", ky:"Сулуулук жана саламаттык", color:"#C2185B", bg:"#FCE4EC", shadow:"#720d34" },
  { id:14, ti:"ti-camera",            light:"#5a38c8", ru:"Фото и видео",   ky:"Фото жана видео", color:"#4527A0", bg:"#EDE7F6", shadow:"#28155e" },
  { id:15, ti:"ti-device-laptop",     light:"#1e7ee0", ru:"IT",             ky:"IT",              color:"#1565C0", bg:"#E3F2FD", shadow:"#0b3d73" },
  { id:16, ti:"ti-users-group",        light:"#e07a18", ru:"Мероприятие",    ky:"Маарeke",         color:"#E65100", bg:"#FBE9E7", shadow:"#873000" },
  { id:17, ti:"ti-cash",              light:"#3a9b40", ru:"Бухгалтерия",    ky:"Бухгалтерия",    color:"#2E7D32", bg:"#E8F5E9", shadow:"#14461a" },
  { id:18, ti:"ti-scale",             light:"#6b4a42", ru:"Юридика",        ky:"Юридика",         color:"#4E342E", bg:"#EFEBE9", shadow:"#2a1a16" },
];

const PERIOD_OPTIONS_RU = ["На один день","На два дня","На три дня","До конца недели","До конца месяца","Другое"];
const PERIOD_OPTIONS_KY = ["Бир күн","Эки күн","Үч күн","Жума бүтүшүнө чейин","Ай бүтүшүнө чейин","Башка"];

const T = {
  ru:{
    appName:"Иштерман", search:"Поиск заданий...", allCities:"Все населённые пункты",
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
    consentCreate:"Я согласен, что плата за размещение задания (29 сом) не возвращается, даже если никто не откликнулся.",
    consentRespond:"Я согласен, что плата за отклик (29 сом) не возвращается, даже если заказчик выберет другого.",
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
    gallery:"🖼 Галерея", camera:"📷 Камера", photosUploaded:"Загружено",photosOf:"из",
    nextStep:"Далее →", respondCount:"Откликов:", noTasks_my:"У вас пока нет заданий",
    otherCustomerTask:"Это задание другого заказчика", leaveReviewHint:"Оставьте отзыв исполнителю",
    deleteTask:"🗑 Удалить завершённое задание", deleteResponse:"🗑 Удалить из истории", cancelTask:"Отменить задание", cancelTaskWarn:"При отмене задания деньги не возвращаются", cancelledNotif:"отменил задание",
  },
  ky:{
    appName:"Иштерман", search:"Тапшырмаларды издөө...", allCities:"Бардык айылдар жана шаарлар",
    useGeo:"📡 Жанымда", locating:"...", allCats:"Баары",
    sortNew:"Жаңылар", sortCheap:"↑ Арзан", sortExpensive:"↓ Кымбат", sortNear:"📍 Жакын",
    urgent:"Шашылыш", noTasks:"Тапшырма табылган жок",
    create:"Тапшырма", profile:"Профиль", tasks:"Тапшырмалар",
    newTask:"Жаңы тапшырма", createMore:"Дагы түзүү", searchLoc:"Издөө...",
    fTitle:"Тапшырманын аты", fCat:"Категория", fBudget:"Бюджет (сом)", fLoc:"Айыл / шаар", fDesc:"Сүрөттөмө",
    phTitle:"Мисалы: бак казуу", phDesc:"Тапшырма жөнүндө кеңири...",
    completed:"аткарылган", customer:"Буйрутмачы", executor:"Аткаруучу",
    myTasks:"Менин тапшырмаларым", myResponses:"Менин жоопторум", notifications:"Билдирмелер",
    settings:"Жөндөөлөр", logout:"Чыгуу",
    statCreated:"Түзүлгөн", statDone:"Аткарылган", statRating:"Рейтинг",
    language:"Тил", lBudget:"💰 Бюджет", lTime:"🕐 Убакыт", lCity:"📍 Жер",
    back:"← Артка", contact:"Байланыш", daysAgo:"күн мурун",
    paymentTitle:"Тастыктоо", payingNow:"Жарыяланууда...", cancel:"Жокко чыгаруу",
    consentCreate:"Мен тапшырманы жайгаштыруу үчүн 29 сомдун кайтарылгысыз экенин макулдаймын.",
    consentRespond:"Мен жооп берүү үчүн 29 сомдун кайтарылгысыз экенин макулдаймын.",
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
    confirm:"Тастыктоо",
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
    myResponsesTitle:"Менин жоопторум", noMyResponses:"Сиз тапшырмаларга жооп берген жоксуз",
    respStatus_pending:"⏳ Күтүүдө", respStatus_chosen:"✅ Тандалды", respStatus_declined:"❌ Баш тартылды",
    yourOffer:"Сиздин баа:",
    leaveReview:"Баа берүү", reviewTitle:"Пикир",
    reviewRating:"Баа", reviewText:"Комментарий (милдеттүү эмес)",
    phReviewText:"Иш жөнүндө айтыңыз...",
    submitReview:"Пикир жөнөтүү", alreadyReviewed:"Пикир калтырдыңыз",
    noReviews:"Пикирлер жок", reviewsTitle:"Пикирлер",
    reviewCount:"пикир", viewProfile:"Аткаруучунун профили",
    userProfileTitle:"Колдонуучунун профили",
    gallery:"🖼 Галерея", camera:"📷 Камера", photosUploaded:"Жүктөлдү",photosOf:"/",
    nextStep:"Алга →", respondCount:"Жооптор:", noTasks_my:"Сизде азырынча тапшырма жок",
    otherCustomerTask:"Бул башка буйрутмачынын тапшырмасы", leaveReviewHint:"Аткаруучуга пикир калтырыңыз",
    deleteTask:"🗑 Аяктаганды өчүрүү", deleteResponse:"🗑 Тарыхтан өчүрүү", cancelTask:"Тапшырманы жокко чыгаруу", cancelTaskWarn:"Тапшырма жокко чыгарылса акча кайтарылбайт", cancelledNotif:"тапшырманы жокко чыгарды",
  }
};

const css = `
.dark-mode{--color-background-primary:#1C1C1E;--color-background-secondary:#2C2C2E;--color-background-tertiary:#111113;--color-text-primary:#F2F2F7;--color-text-secondary:#8E8E93;--color-border-tertiary:#38383A;}
input,select,textarea{color-scheme:light;}
.dark-mode input,.dark-mode select,.dark-mode textarea{background:#2C2C2E;border-color:#38383A;color:#F2F2F7;}
.dark-mode input::placeholder,.dark-mode textarea::placeholder{color:#636366;}
@keyframes fadeUp{from{opacity:0}to{opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
@keyframes tabSlide{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
@keyframes popIn{0%{transform:scale(0.88);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes logoMega{
  0%{transform:translateY(-280px) rotate(-15deg) scale(0.4) rotateX(40deg);opacity:0;filter:drop-shadow(0 0 0px rgba(255,180,0,0))}
  30%{opacity:1;filter:drop-shadow(0 0 40px rgba(255,200,0,1)) drop-shadow(0 0 80px rgba(255,140,0,0.8)) drop-shadow(0 30px 20px rgba(0,0,0,0.4))}
  52%{transform:translateY(28px) rotate(375deg) scale(1.12) rotateX(0deg);filter:drop-shadow(0 0 60px rgba(255,210,0,1)) drop-shadow(0 0 120px rgba(255,160,0,0.9)) drop-shadow(8px 24px 16px rgba(0,0,0,0.45))}
  68%{transform:translateY(-12px) rotate(358deg) scale(0.95);filter:drop-shadow(0 0 25px rgba(255,180,0,0.7)) drop-shadow(4px 16px 12px rgba(0,0,0,0.35))}
  80%{transform:translateY(7px) rotate(362deg) scale(1.04)}
  90%{transform:translateY(-3px) rotate(360deg) scale(0.99)}
  100%{transform:translateY(0) rotate(360deg) scale(1);opacity:1;filter:drop-shadow(6px 8px 0px rgba(0,0,0,0.3)) drop-shadow(12px 18px 0px rgba(0,0,0,0.15)) drop-shadow(0 28px 18px rgba(0,0,0,0.28)) drop-shadow(0 0 18px rgba(255,180,0,0.35))}
}
@keyframes logoPulseAlive{
  0%,100%{transform:scale(1) rotate(360deg);filter:drop-shadow(6px 8px 0px rgba(0,0,0,0.28)) drop-shadow(0 28px 18px rgba(0,0,0,0.22))}
  50%{transform:scale(1.07) rotate(360deg);filter:drop-shadow(8px 12px 2px rgba(0,0,0,0.32)) drop-shadow(0 32px 22px rgba(0,0,0,0.26))}
}
@keyframes logoGlow{
  0%,100%{box-shadow:0 0 0 0 rgba(255,180,0,0),0 12px 30px rgba(0,0,0,0.18)}
  50%{box-shadow:0 0 0 14px rgba(255,180,0,0.12),0 16px 40px rgba(0,0,0,0.24)}
}
.logo-anim{animation:logoMega 1.25s cubic-bezier(.22,.68,0,1.15) both,logoPulseAlive 2.4s ease-in-out 1.3s infinite}
.logo-anim-wrap{border-radius:50%;display:inline-block}
@keyframes auroraShift{
  0%{background-position:0% 50%}
  25%{background-position:100% 0%}
  50%{background-position:100% 100%}
  75%{background-position:0% 100%}
  100%{background-position:0% 50%}
}
@keyframes auroraOrb1{
  0%,100%{transform:translate(0px,0px) scale(1);opacity:0.55}
  33%{transform:translate(60px,-40px) scale(1.3);opacity:0.35}
  66%{transform:translate(-40px,60px) scale(0.85);opacity:0.65}
}
@keyframes auroraOrb2{
  0%,100%{transform:translate(0px,0px) scale(1);opacity:0.45}
  33%{transform:translate(-70px,30px) scale(1.2);opacity:0.65}
  66%{transform:translate(50px,-50px) scale(0.9);opacity:0.35}
}
@keyframes auroraOrb3{
  0%,100%{transform:translate(0px,0px) scale(1);opacity:0.4}
  50%{transform:translate(30px,70px) scale(1.4);opacity:0.6}
}
.login-bg{
  position:relative;overflow:hidden;
  background:linear-gradient(160deg,#1A0533,#4A148C,#6A1B9A,#1A0533,#311B92,#7B1FA2);
  background-size:400% 400%;
  animation:auroraShift 8s ease-in-out infinite;
}
.login-bg::before,.login-bg::after,.login-bg .orb3{
  content:"";position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none;
}
.login-bg::before{
  width:280px;height:280px;top:-80px;left:-60px;
  background:radial-gradient(circle,#E040FB 0%,#7B1FA2 50%,transparent 70%);
  animation:auroraOrb1 7s ease-in-out infinite;
}
.login-bg::after{
  width:240px;height:240px;bottom:-60px;right:-60px;
  background:radial-gradient(circle,#3D5AFE 0%,#1A237E 50%,transparent 70%);
  animation:auroraOrb2 9s ease-in-out infinite;
}
.orb3{
  width:200px;height:200px;top:50%;left:50%;transform:translate(-50%,-50%);
  background:radial-gradient(circle,rgba(186,104,200,0.5) 0%,transparent 70%);
  animation:auroraOrb3 11s ease-in-out infinite;
}
.login-content{position:relative;z-index:1;}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.fe{animation:fadeUp 0.18s ease both}
.si{animation:slideIn 0.22s cubic-bezier(.22,.68,0,1.1) both}
.tc{animation:tabSlide 0.18s cubic-bezier(.22,.68,0,1.1) both}
.pi{animation:popIn 0.28s cubic-bezier(.22,.68,0,1.2) both}
.fi{animation:fadeIn 0.3s ease both}
.card{transition:transform 0.13s ease;cursor:pointer}.card:hover{transform:translateY(-2px)}.card:active{transform:scale(0.97)}
.nb{transition:transform 0.11s ease}.nb:active{transform:scale(0.84)}
.pb{transition:background 0.14s,color 0.14s,border-color 0.14s,transform 0.1s}.pb:active{transform:scale(0.91)}
.rb{transition:background 0.14s,color 0.14s,border-color 0.14s,transform 0.1s}.rb:hover{filter:brightness(1.08)}.rb:active{transform:scale(0.95)}
.btn3d{transition:transform 0.1s ease,box-shadow 0.1s ease}.btn3d:active{transform:translateY(4px) !important}
.back-btn{display:flex;align-items:center;gap:4px;background:none;border:none;cursor:pointer;color:#185FA5;font-size:13px;font-weight:600;padding:4px 2px;flex-shrink:0;font-family:inherit;transition:opacity 0.12s}.back-btn:hover{opacity:0.7}
input,select,textarea{background:#fff;border:0.5px solid #e0e0e0;border-left:3px solid #185FA5;border-radius:0 10px 10px 0;padding:11px 14px;font-size:16px;color:var(--color-text-primary,#111);outline:none;font-family:inherit;}
input:focus,select:focus,textarea:focus{border-left-color:#00C244;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
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

// ─── Firebase ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAHkV1TcilvbOoXRrwXAmJGGJne01W4YLk",
  authDomain: "ishterman-6e62e.firebaseapp.com",
  projectId: "ishterman-6e62e",
  storageBucket: "ishterman-6e62e.firebasestorage.app",
  messagingSenderId: "290713684597",
  appId: "1:290713684597:web:5cf3ccf8e1e61fb72d063c",
};
const fbApp  = initializeApp(firebaseConfig);
const fbAuth = getAuth(fbApp);
const fbDb   = getFirestore(fbApp);

const ADMIN_EMAIL = "mos.kg81@gmail.com";

const fbSaveUser = (uid:string, data:any) =>
  setDoc(doc(fbDb,"users",uid), data, {merge:true}).catch(console.warn);

const fbLoadUserProfile = async (uid:string) => {
  try { const d=await getDoc(doc(fbDb,"users",uid)); return d.exists()?d.data():null; } catch{ return null; }
};

const fbSyncTasks = (tasks:any[]) => {
  try {
    const b=writeBatch(fbDb);
    tasks.forEach(t=>b.set(doc(fbDb,"tasks",String(t.id)),{...t}));
    b.commit().catch(console.warn);
  } catch{}
};
const fbSyncResponses = (rs:any[]) => {
  try {
    const b=writeBatch(fbDb);
    rs.forEach(r=>b.set(doc(fbDb,"responses",String(r.id)),{...r}));
    b.commit().catch(console.warn);
  } catch{}
};
const fbSyncReviews = (rv:any[]) => {
  try {
    const b=writeBatch(fbDb);
    rv.forEach(r=>b.set(doc(fbDb,"reviews",String(r.id)),{...r}));
    b.commit().catch(console.warn);
  } catch{}
};
const fbSyncNotifs = (ns:any[]) => {
  try {
    const b=writeBatch(fbDb);
    ns.slice(0,200).forEach(n=>b.set(doc(fbDb,"notifications",String(n.id)),{...n}));
    b.commit().catch(console.warn);
  } catch{}
};

const fbGetAdminStats = async () => {
  try {
    const [users,tasks,responses,reviews] = await Promise.all([
      getDocs(collection(fbDb,"users")),
      getDocs(collection(fbDb,"tasks")),
      getDocs(collection(fbDb,"responses")),
      getDocs(collection(fbDb,"reviews")),
    ]);
    const tasksData = tasks.docs.map(d=>d.data());
    return {
      users:     users.size,
      tasks:     tasks.size,
      openTasks:      tasksData.filter(t=>t.status==="open").length,
      closedTasks:    tasksData.filter(t=>t.status==="closed_by_choice").length,
      completedTasks: tasksData.filter(t=>t.status==="completed").length,
      responses:  responses.size,
      reviews:    reviews.size,
    };
  } catch(e) { console.warn(e); return null; }
};

// Координаты городов для расчёта расстояния
const CITY_COORDS: Record<string,{lat:number,lng:number}> = {
  bishkek:{lat:42.87,lng:74.59},bish_sverd:{lat:42.87,lng:74.59},bish_okt:{lat:42.87,lng:74.59},
  bish_len:{lat:42.87,lng:74.59},bish_per:{lat:42.87,lng:74.59},bish_alamudun:{lat:42.82,lng:74.62},
  tokmok:{lat:42.84,lng:75.30},kara_balta:{lat:42.82,lng:73.85},kant:{lat:42.89,lng:74.85},
  osh_city:{lat:40.51,lng:72.79},jalal:{lat:40.93,lng:73.00},karakol:{lat:42.49,lng:78.39},
  naryn:{lat:41.43,lng:75.99},talas:{lat:42.52,lng:72.24},batken:{lat:40.06,lng:70.82},
};
const haversine=(lat1:number,lng1:number,lat2:number,lng2:number)=>{
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
};
const cityDist=(cityId:string,userLat:number|null,userLng:number|null):number=>{
  if(!userLat||!userLng) return 999;
  const c=CITY_COORDS[cityId];
  if(!c) return 999;
  return Math.round(haversine(userLat,userLng,c.lat,c.lng)*10)/10;
};

const nowStr = () => { const d=new Date(); return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`; };
const fmtDate = (s) => { if(!s) return s; const m=s.match(/^(\d{4})-(\d{2})-(\d{2})(.*)/); return m?`${m[3]}.${m[2]}.${m[1]}${m[4]}`:s; };
const fmtDateTime = (iso) => { if(!iso) return ""; const d=new Date(iso); return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`; };
const initials = n => { const p=(n||"").trim().split(" ").filter(Boolean); return p.length>=2?(p[0][0]+p[1][0]).toUpperCase():p[0]?p[0].slice(0,2).toUpperCase():"??"; };
const avatarColor = id => { const c=["#185FA5","#0F6E56","#7C3D99","#B05E0A","#A32D2D","#5A7A0F"]; let h=0; for(let i=0;i<(id||"").length;i++)h=(h*31+id.charCodeAt(i))&0xffff; return c[h%c.length]; };

const MOCK_OWNER_ID  = "mock_user_8821";
const MOCK_OWNER     = { id:MOCK_OWNER_ID,  phone:"+99655500000", name:"Бакыт М." };
const DEMO_EXEC_ID   = "demo_exec_1337";
const DEMO_EXECUTOR  = { id:DEMO_EXEC_ID, phone:"+99670011223", name:"Эрлан К.", about:"Строитель с опытом 7 лет.", skills:["кладка","штукатурка","сварка"], experience:"7 лет в строительстве" };

const SEED_TASKS = [
  { id:1,  createdAt:Date.now()-3600000*5,  cat:0, price:5000, city:"bishkek",  time:"Бүгүн",    urgent:true,  dist:0.4, ru:"Помощь на стройке дома",        ky:"Үй куруусуна жардам",           dRu:"Нужны разнорабочие, кладка кирпича 2 этажа.", dKy:"Кирпич салуу, 2 кабат.",      ownerId:MOCK_OWNER_ID },
  { id:2,  createdAt:Date.now()-3600000*3,  cat:1, price:3000, city:"osh_city", time:"Эртең",    urgent:false, dist:1.2, ru:"Убрать урожай пшеницы",         ky:"Буудай оруп жыйноо",            dRu:"Поле 2 га, сдельная оплата.",  dKy:"2 га талаа.",                 ownerId:MOCK_OWNER_ID },
  { id:3,  createdAt:Date.now()-3600000*2,  cat:2, price:800,  city:"bishkek",  time:"Бүгүн",    urgent:true,  dist:0.7, ru:"Доставка документов по городу", ky:"Шаар боюнча документ жеткирүү", dRu:"3 точки, своя машина.",        dKy:"3 жер, өз унаасы.",           ownerId:MOCK_OWNER_ID },
  { id:4,  createdAt:Date.now()-3600000*1,  cat:3, price:2500, city:"karakol",  time:"Шейшемби", urgent:false, dist:2.1, ru:"Ремонт стиральной машины",      ky:"Кир жуугуч машинаны оңдоо",     dRu:"Машина не отжимает, Samsung.", dKy:"Машина сыкпайт, Samsung.",    ownerId:MOCK_OWNER_ID },
  { id:5,  createdAt:Date.now()-1800000,    cat:4, price:1500, city:"bishkek",  time:"Жекшемби", urgent:false, dist:0.9, ru:"Вскопать огород 3 сотки",       ky:"3 сотук жерди казуу",           dRu:"Участок 3 сотки, под посадку.",dKy:"3 сотук жер.",                ownerId:MOCK_OWNER_ID },
  { id:6,  createdAt:Date.now()-900000,     cat:5, price:4000, city:"jalal",    time:"Ишемби",   urgent:false, dist:3.5, ru:"Перенести мебель при переезде", ky:"Көчүүдө эмерек көтөрүү",        dRu:"2-комнатная, 3 этаж без лифта.",dKy:"2 бөлмөлүү, 3-кабат.",       ownerId:MOCK_OWNER_ID },
  { id:7,  createdAt:Date.now()-600000,     cat:0, price:8000, city:"bishkek",  time:"Бүгүн",    urgent:true,  dist:1.5, ru:"Залить фундамент гаража",       ky:"Гараждын фундаментин куюу",     dRu:"6x4м, бригада 3-4 чел.",       dKy:"6x4м, 3-4 адам.",             ownerId:MOCK_OWNER_ID },
  { id:8,  createdAt:Date.now()-300000,     cat:1, price:2000, city:"naryn",    time:"Эртең",    urgent:false, dist:4.2, ru:"Полив и уход за полем",         ky:"Талааны суугаруу",              dRu:"Огород 1 га, прополка.",       dKy:"1 га жер.",                   ownerId:MOCK_OWNER_ID },
];
const buildInitTasks = () => SEED_TASKS.map(s=>({
  ...s,
  status:    "open",
  completed: false,
  reactivation_count: 0,
  chosen_executor_id: null,
  expires_at: Date.now()+7*86400000,
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
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 14px",background:"#DAEEFF",borderBottom:"none",flexShrink:0}}>
      <BackBtn onPress={onBack}/>
      <p style={{margin:0,flex:1,fontSize:14,fontWeight:600,color:"#0C447C",textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{title}</p>
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
            <div style={{width:30,height:30,borderRadius:12,background:active||done?"#185FA5":"var(--color-background-secondary,#f4f4f4)",border:active||done?"none":"0.5px solid var(--color-border-tertiary,#e0e0e0)",color:active||done?"#fff":"var(--color-text-secondary,#888)",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>{done?"✓":s}</div>
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

function LangScreen({ onSelect }) {
  const [picked,setPicked]=useState("ru");
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <div style={{background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",padding:"12px 16px",display:"flex",justifyContent:"center",alignItems:"center",gap:8,flexShrink:0}}>
        <img src="/новый логотип на кыргызском.png" alt="logo" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover"}}/>
        <span style={{fontSize:18,fontWeight:700,color:"#F57C00"}}>Иштерман</span>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px"}}>
        <p style={{margin:"0 0 6px",fontSize:18,fontWeight:700,color:"var(--color-text-primary,#111)",textAlign:"center"}}>Выберите язык</p>
        <p style={{margin:"0 0 28px",fontSize:14,color:"var(--color-text-secondary,#888)",textAlign:"center"}}>Тилди тандаңыз</p>
        <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:320}}>
          {[{id:"ru",flag:"🇷🇺",label:"Русский"},{id:"ky",flag:"🇰🇬",label:"Кыргызча"}].map(l=>(
            <div key={l.id} onClick={()=>setPicked(l.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"var(--color-background-primary,#fff)",borderRadius:12,border:picked===l.id?"2px solid #185FA5":"0.5px solid var(--color-border-secondary,#ccc)",cursor:"pointer",boxSizing:"border-box"}}>
              <span style={{fontSize:26}}>{l.flag}</span>
              <span style={{fontSize:15,fontWeight:picked===l.id?600:400,color:picked===l.id?"var(--color-text-primary,#111)":"var(--color-text-secondary,#888)",flex:1}}>{l.label}</span>
              <div style={{width:18,height:18,borderRadius:"50%",border:picked===l.id?"2px solid #185FA5":"1.5px solid #ccc",background:picked===l.id?"#185FA5":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {picked===l.id&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}
              </div>
            </div>
          ))}
        </div>
        <button className="nb btn3d" onClick={()=>onSelect(picked)} style={{marginTop:28,width:"100%",maxWidth:320,padding:"13px 0",borderRadius:12,background:"linear-gradient(145deg,#00e052,#00C244)",color:"#fff",border:"none",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 5px 0 #007a2a,0 8px 16px rgba(0,194,68,0.35)"}}>
          {picked==="ru"?"Далее →":"Алга →"}
        </button>
      </div>
    </div>
  );
}

function LoginScreen({ lang, setLang, onLogin }) {
  const t=T[lang];
  const [step,setStep]   = useState<"phone"|"otp"|"name">("phone");
  const [phone,setPhone] = useState("+996 ");
  const [otp,setOtp]     = useState("");
  const [name,setName]   = useState("");
  const [err,setErr]     = useState("");
  const [loading,setLoading] = useState(false);
  const [agreed,setAgreed]   = useState(false);
  const [showDocsInline,setShowDocsInline] = useState<"terms"|"privacy"|null>(null);
  const confirmRef = useRef<any>(null);
  const verifierRef = useRef<any>(null);

  useEffect(()=>{
    let ctx=null;
    try{
      ctx=new(window.AudioContext||window.webkitAudioContext)();
      const boom=(freq,delay,dur,vol)=>{
        const buf=ctx.createBuffer(1,ctx.sampleRate*dur,ctx.sampleRate);
        const d=buf.getChannelData(0);
        for(let i=0;i<d.length;i++){const tt=i/ctx.sampleRate;d[i]=(Math.random()*2-1)*Math.exp(-tt*18)*vol;}
        const src=ctx.createBufferSource();src.buffer=buf;
        const f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=freq;
        const g=ctx.createGain();g.gain.setValueAtTime(1,ctx.currentTime+delay);
        src.connect(f);f.connect(g);g.connect(ctx.destination);src.start(ctx.currentTime+delay);
      };
      const sub=(freq,delay,dur,vol)=>{
        const o=ctx.createOscillator();const g=ctx.createGain();
        o.type="sine";o.frequency.setValueAtTime(freq,ctx.currentTime+delay);
        o.frequency.exponentialRampToValueAtTime(freq*0.4,ctx.currentTime+delay+dur);
        g.gain.setValueAtTime(vol,ctx.currentTime+delay);
        g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+delay+dur);
        o.connect(g);g.connect(ctx.destination);
        o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+dur);
      };
      boom(200,0.6,0.4,0.9);boom(400,0.6,0.2,0.5);
      sub(80,0.6,0.6,0.4);sub(120,0.61,0.4,0.2);
      setTimeout(()=>{try{ctx&&ctx.close();}catch{}},2000);
    }catch{}
    return()=>{
      try{ctx&&ctx.close();}catch{}
      try{verifierRef.current?.clear();}catch{}
      try{verifierRef.current?._container?.remove();}catch{}
      verifierRef.current=null;
    };
  },[]);


  const fmtPhone=(v)=>{
    let d=v.replace(/\D/g,"");
    if(d.startsWith("996"))d=d.slice(3);
    d=d.slice(0,9);
    let s="+996 ";
    if(d.length>0)s+=d.slice(0,3);
    if(d.length>3)s+=" "+d.slice(3,6);
    if(d.length>6)s+=" "+d.slice(6,9);
    return s;
  };

  const sendOtp=async()=>{
    const p=phone.replace(/\s/g,"");
    if(!/^\+996\d{9}$/.test(p)){setErr(t.errPhoneFormat);return;}
    setLoading(true);setErr("");
    try{
      if(!verifierRef.current){
        const container=document.createElement("div");
        document.body.appendChild(container);
        verifierRef.current=new RecaptchaVerifier(fbAuth,container,{size:"invisible"});
        verifierRef.current._container=container;
      }
      const result=await signInWithPhoneNumber(fbAuth,p,verifierRef.current);
      confirmRef.current=result;
      setStep("otp");
    }catch(e:any){
      console.error("Firebase Phone Auth error:",e.code, e.message);
      setErr((lang==="ru"?"Не удалось отправить SMS. Попробуйте позже.":"SMS жөнөтүлгөн жок. Кийинчерээк аракет кылыңыз.")+` (${e.code||e.message})`);
      try{verifierRef.current?.clear();}catch{}
      try{verifierRef.current?._container?.remove();}catch{}
      verifierRef.current=null;
    }
    setLoading(false);
  };

  const verifyOtp=async()=>{
    if(otp.replace(/\s/g,"").length<6){setErr(lang==="ru"?"Введите 6-значный код из SMS":"SMS-тен 6 орундуу код киргизиңиз");return;}
    setLoading(true);setErr("");
    try{
      await confirmRef.current.confirm(otp.replace(/\s/g,""));
      const p=phone.replace(/\s/g,"");
      const db=loadUsersDB();
      const existing=db[p];
      if(existing){onLogin(existing);}
      else{setStep("name");}
    }catch(e:any){
      setErr(lang==="ru"?"Неверный код. Проверьте SMS и попробуйте снова.":"Код туура эмес. SMS текшерип, кайра аракет кылыңыз.");
    }
    setLoading(false);
  };

  const register=()=>{
    if(!name.trim()){setErr(lang==="ru"?"Введите ваше имя":"Атыңызды жазыңыз");return;}
    if(!agreed){setErr(lang==="ru"?"Примите условия соглашения для продолжения":"Улантуу үчүн келишимдин шарттарын кабыл алыңыз");return;}
    const p=phone.replace(/\s/g,"");
    const user={id:"u_"+Date.now()+"_"+Math.random().toString(36).slice(2,6),phone:p,name:name.trim(),role:null};
    const db=loadUsersDB();db[p]=user;saveUsersDB(db);saveUser(user);
    onLogin(user);
  };

  const DocsBlock=()=>(
    <>
      {showDocsInline&&(
        <div style={{marginBottom:12,border:"0.5px solid #cce0f5",borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:"0.5px solid #cce0f5",background:"#f0f7ff"}}>
            {(["terms","privacy"] as const).map(id=>(
              <button key={id} onClick={()=>setShowDocsInline(id)} style={{flex:1,padding:"8px 4px",border:"none",background:"none",cursor:"pointer",fontSize:11,fontWeight:showDocsInline===id?700:400,color:showDocsInline===id?"#185FA5":"#888",borderBottom:showDocsInline===id?"2px solid #185FA5":"2px solid transparent"}}>
                {id==="terms"?(lang==="ru"?"Соглашение":"Келишим"):(lang==="ru"?"Конфиденциальность":"Купуялык")}
              </button>
            ))}
            <button onClick={()=>setShowDocsInline(null)} style={{padding:"8px 10px",border:"none",background:"none",cursor:"pointer",fontSize:14,color:"#888"}}>✕</button>
          </div>
          <div style={{maxHeight:160,overflowY:"auto",padding:"10px 12px"}}>
            <pre style={{margin:0,fontSize:10,lineHeight:1.6,color:"#333",whiteSpace:"pre-wrap",fontFamily:"inherit"}}>
              {showDocsInline==="terms"
                ?(lang==="ru"?"ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ\nИштерман — платформа для Кыргызской Республики\nДата: с момента публикации\n\n1. Регистрируясь, вы принимаете условия Соглашения.\n2. Платформа является информационным посредником.\n3. Заказчики самостоятельно публикуют задания.\n4. Исполнители самостоятельно откликаются на задания.\n5. Оплата производится напрямую между сторонами.\n6. Запрещается размещать незаконный контент.\n7. Платформа не несёт ответственности за споры.\n\nПолный текст доступен в разделе Профиль → Документы."
                  :"КОЛДОНУУЧУ КЕЛИШИМИ\nИштерман — Кыргыз Республикасы үчүн платформа\nДата: жарыяланган күндөн баштап\n\n1. Катталуу менен сиз Келишимдин шарттарын кабыл аласыз.\n2. Платформа маалымат ортомчусу болуп саналат.\n3. Буйрутмачылар тапшырмаларды өз алдынча жайгаштырат.\n4. Аткаруучулар тапшырмаларга өз алдынча жооп беришет.\n5. Төлөм тараптардын ортосунда түздөн-түз жүргүзүлөт.\n6. Мыйзамсыз мазмун жайгаштыруу тыйылат.\n7. Платформа талаш-тартыштар үчүн жооп бербейт.\n\nТолук текст Профиль → Документтер бөлүмүндө жеткиликтүү.")
                :(lang==="ru"?"ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ\nИштерман\nДата: с момента публикации\n\nМы собираем: имя, телефон, фото профиля (по желанию).\nДанные хранятся локально на вашем устройстве.\nМы не передаём данные третьим лицам в коммерческих целях.\nВы вправе запросить удаление своих данных.\n\nПолный текст доступен в разделе Профиль → Документы."
                  :"КУПУЯЛЫК САЯСАТЫ\nИштерман\nДата: жарыяланган күндөн баштап\n\nБиз чогулттабыз: аты-жөн, телефон, профиль сүрөтү (каалоо боюнча).\nМаалыматтар жергиликтүү түзмөгүңүздө сакталат.\nМаалыматтарды коммерциялык максаттар үчүн үчүнчү жактарга бербейз.\nМаалыматтарыңызды жок кылып берүүнү суроого укугуңуз бар.\n\nТолук текст Профиль → Документтер бөлүмүндө жеткиликтүү.")
              }
            </pre>
          </div>
        </div>
      )}
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14,padding:"10px 12px",background:"#f0f7ff",borderRadius:10,border:"0.5px solid #cce0f5"}}>
        <div onClick={()=>setAgreed(a=>!a)} style={{width:20,height:20,borderRadius:5,border:`2px solid ${agreed?"#00C244":"#aaa"}`,background:agreed?"#00C244":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginTop:1}}>
          {agreed&&<span style={{color:"#fff",fontSize:13,fontWeight:700,lineHeight:1}}>✓</span>}
        </div>
        <p style={{margin:0,fontSize:11,color:"#444",lineHeight:1.5}}>
          {lang==="ru"
            ?<>Я ознакомился и принимаю <span onClick={()=>setShowDocsInline("terms")} style={{color:"#185FA5",textDecoration:"underline",cursor:"pointer"}}>Пользовательское соглашение</span> и <span onClick={()=>setShowDocsInline("privacy")} style={{color:"#185FA5",textDecoration:"underline",cursor:"pointer"}}>Политику конфиденциальности</span> сервиса Иштерман</>
            :<>Мен <span onClick={()=>setShowDocsInline("terms")} style={{color:"#185FA5",textDecoration:"underline",cursor:"pointer"}}>Колдонуучу келишими</span> жана <span onClick={()=>setShowDocsInline("privacy")} style={{color:"#185FA5",textDecoration:"underline",cursor:"pointer"}}>Купуялык саясаты</span> менен таанышып, кабыл алдым</>
          }
        </p>
      </div>
    </>
  );

  return (
    <div className="fi" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <div id="recaptcha-container"/>
      <div style={{background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",padding:"12px 16px",display:"flex",justifyContent:"center",alignItems:"center",gap:8,flexShrink:0}}>
        <img src="/новый логотип на кыргызском.png" alt="logo" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover"}}/>
        <span style={{fontSize:18,fontWeight:700,color:"#F57C00"}}>Иштерман</span>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 28px"}}>
        <div className="logo-anim-wrap" style={{marginBottom:20}}>
          <img src="/новый логотип на кыргызском.png" alt="Иштерман" className="logo-anim" style={{width:220,height:220,objectFit:"contain",borderRadius:"50%",display:"block"}}/>
        </div>
        <p style={{margin:"0 0 6px",fontSize:18,fontWeight:700,color:"var(--color-text-primary,#111)",textAlign:"center"}}>{t.loginTitle}</p>
        <p style={{margin:"0 0 28px",fontSize:13,color:"var(--color-text-secondary,#888)",textAlign:"center"}}>Иштерман</p>
        <div style={{width:"100%",maxWidth:320}}>

          {/* Шаг 1: ввод номера */}
          {step==="phone"&&(<>
            <div style={{marginBottom:16}}>
              <p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>📞 {t.phoneLabel}</p>
              <input type="tel" value={phone} onChange={e=>{setPhone(fmtPhone(e.target.value));setErr("");}}
                placeholder="+996 700 000 000" style={{width:"100%",fontSize:15}}/>
            </div>
            {err&&<p style={{margin:"0 0 12px",fontSize:12,color:"#A32D2D",fontWeight:500,textAlign:"center"}}>{err}</p>}
            <button className="nb btn3d" onClick={sendOtp} disabled={loading}
              style={{width:"100%",padding:"13px 0",borderRadius:12,background:"linear-gradient(145deg,#00e052,#00C244)",color:"#fff",border:"none",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 5px 0 #007a2a,0 8px 16px rgba(0,194,68,0.35)",opacity:loading?0.7:1}}>
              {loading?(lang==="ru"?"Отправка...":"Жөнөтүлүүдө..."):(lang==="ru"?"Получить SMS-код":"SMS-код алуу")}
            </button>
          </>)}

          {/* Шаг 2: ввод OTP */}
          {step==="otp"&&(<>
            <div style={{marginBottom:8,padding:"10px 14px",background:"#f0f7ff",borderRadius:10,border:"0.5px solid #cce0f5"}}>
              <p style={{margin:0,fontSize:12,color:"#444",textAlign:"center"}}>
                {lang==="ru"?<>SMS-код отправлен на <b>{phone}</b></>:<><b>{phone}</b> номерине SMS-код жөнөтүлдү</>}
              </p>
            </div>
            <div style={{marginBottom:16,marginTop:12}}>
              <p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>🔑 {lang==="ru"?"Код из SMS":"SMS-тен код"}</p>
              <input type="number" value={otp} onChange={e=>{setOtp(e.target.value.slice(0,6));setErr("");}}
                placeholder="000000" style={{width:"100%",fontSize:22,letterSpacing:8,textAlign:"center"}}/>
            </div>
            {err&&<p style={{margin:"0 0 12px",fontSize:12,color:"#A32D2D",fontWeight:500,textAlign:"center"}}>{err}</p>}
            <button className="nb btn3d" onClick={verifyOtp} disabled={loading}
              style={{width:"100%",padding:"13px 0",borderRadius:12,background:"linear-gradient(145deg,#00e052,#00C244)",color:"#fff",border:"none",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 5px 0 #007a2a,0 8px 16px rgba(0,194,68,0.35)",opacity:loading?0.7:1}}>
              {loading?(lang==="ru"?"Проверка...":"Текшерилүүдө..."):(lang==="ru"?"Подтвердить":"Ырастоо")}
            </button>
            <button onClick={()=>{setStep("phone");setOtp("");setErr("");try{verifierRef.current?.clear();}catch{};try{verifierRef.current?._container?.remove();}catch{};verifierRef.current=null;}}
              style={{width:"100%",marginTop:10,padding:"8px 0",background:"none",border:"none",cursor:"pointer",fontSize:13,color:"var(--color-text-secondary,#888)"}}>
              ← {lang==="ru"?"Изменить номер":"Номерди өзгөртүү"}
            </button>
          </>)}

          {/* Шаг 3: имя (только новые пользователи) */}
          {step==="name"&&(<>
            <div style={{marginBottom:12,padding:"10px 14px",background:"#E8F5E9",borderRadius:10,border:"0.5px solid #8AC88A"}}>
              <p style={{margin:0,fontSize:13,color:"#2A5E1A",textAlign:"center",fontWeight:600}}>
                ✅ {lang==="ru"?"Номер подтверждён!":"Номер ырасталды!"}
              </p>
            </div>
            <div style={{marginBottom:12,marginTop:12}}>
              <p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>👤 {lang==="ru"?"Ваше имя":"Атыңыз"}</p>
              <input value={name} onChange={e=>{setName(e.target.value);setErr("");}} placeholder={lang==="ru"?"Имя":"Аты"} style={{width:"100%",fontSize:15}}/>
            </div>
            <DocsBlock/>
            {err&&<p style={{margin:"0 0 12px",fontSize:12,color:"#A32D2D",fontWeight:500,textAlign:"center"}}>{err}</p>}
            <button className="nb btn3d" onClick={register}
              style={{width:"100%",padding:"13px 0",borderRadius:12,background:"linear-gradient(145deg,#00e052,#00C244)",color:"#fff",border:"none",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 5px 0 #007a2a,0 8px 16px rgba(0,194,68,0.35)"}}>
              {lang==="ru"?"Завершить регистрацию":"Каттоону аяктоо"}
            </button>
          </>)}

        </div>
      </div>
    </div>
  );
}

function AdminLoginScreen({ onLogin }) {
  const [email,setEmail]       = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading]   = useState(false);
  const [err,setErr]           = useState("");
  const [showPass,setShowPass] = useState(false);

  const handle = async () => {
    if(!email.trim()||!password){setErr("Заполните все поля");return;}
    setLoading(true);setErr("");
    try{
      const cred = await signInWithEmailAndPassword(fbAuth,email.trim(),password);
      if(cred.user.email!==ADMIN_EMAIL){
        await signOut(fbAuth);
        setErr("Доступ запрещён. Этот вход только для владельца.");
        setLoading(false);return;
      }
      const fbProfile = await fbLoadUserProfile(cred.user.uid);
      const user = fbProfile||{id:cred.user.uid,fbUid:cred.user.uid,email:cred.user.email,name:"Admin",role:"admin"};
      onLogin({...user,role:"admin"});
    }catch(e:any){
      if(e.code==="auth/invalid-credential"||e.code==="auth/user-not-found"||e.code==="auth/invalid-login-credentials"||e.code==="auth/wrong-password"){
        setErr("Неверный email или пароль");
      } else if(e.code==="auth/invalid-email"){
        setErr("Неверный формат email");
      } else {
        setErr("Ошибка подключения");
      }
    }finally{setLoading(false);}
  };

  return (
    <div className="fi login-bg" style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <div className="orb3"/>
      <div className="login-content" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 24px 40px"}}>
        <div style={{fontSize:52,marginBottom:8,textAlign:"center"}}>👑</div>
        <p style={{fontSize:20,fontWeight:700,color:"#fff",margin:"0 0 4px",textAlign:"center"}}>Панель владельца</p>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.55)",margin:"0 0 28px",textAlign:"center"}}>Иштерман · Admin</p>
        <div style={{width:"100%",maxWidth:340}}>
          <div style={{marginBottom:12}}>
            <p style={{margin:"0 0 5px",fontSize:12,color:"rgba(255,255,255,0.75)"}}>✉️ Email</p>
            <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} placeholder="admin@mail.com"
              style={{width:"100%",fontSize:15,background:"rgba(255,255,255,0.12)",color:"#fff",border:"0.5px solid rgba(255,255,255,0.3)",borderLeft:"3px solid rgba(255,255,255,0.6)"}}/>
          </div>
          <div style={{marginBottom:16}}>
            <p style={{margin:"0 0 5px",fontSize:12,color:"rgba(255,255,255,0.75)"}}>🔒 Пароль</p>
            <div style={{position:"relative"}}>
              <input type={showPass?"text":"password"} value={password} onChange={e=>{setPassword(e.target.value);setErr("");}} placeholder="••••••"
                style={{width:"100%",fontSize:15,paddingRight:44,background:"rgba(255,255,255,0.12)",color:"#fff",border:"0.5px solid rgba(255,255,255,0.3)",borderLeft:"3px solid rgba(255,255,255,0.6)"}}/>
              <button type="button" onClick={()=>setShowPass(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:18,color:"rgba(255,255,255,0.7)",padding:"4px",lineHeight:1}}>
                {showPass?"🙈":"👁"}
              </button>
            </div>
          </div>
          {err&&<p style={{margin:"0 0 12px",fontSize:12,color:"#FFAB91",fontWeight:500,textAlign:"center"}}>{err}</p>}
          <button className="rb" onClick={handle} disabled={loading}
            style={{width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:"pointer",background:"#7B1FA2",color:"#fff",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><span style={{animation:"spin 0.8s linear infinite",display:"inline-block"}}>⏳</span>...</>:"Войти в панель"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleScreen({ lang, user, onSelectRole }) {
  const t=T[lang];
  const isAdmin=user.email===ADMIN_EMAIL;
  const roles=[
    {id:"customer",img:"/иконка заказчика.png",label:t.roleCustomer,sub:t.roleCustomerSub,color:"#185FA5",bg:"#E6F1FB"},
    {id:"executor",img:"/новый логотип на кыргызском.png",label:t.roleExecutor,sub:t.roleExecutorSub,color:"#0F6E56",bg:"#E1F5EE"},
    ...(isAdmin?[{id:"admin",icon:"👑",label:lang==="ru"?"Я Администратор":"Мен Администратор",sub:lang==="ru"?"Управление и статистика":"Башкаруу жана статистика",color:"#7C3D99",bg:"#F3E8FF"}]:[]),
  ];
  return (
    <div className="fi" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <div style={{background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",padding:"12px 16px",flexShrink:0,display:"flex",alignItems:"center",gap:8}}><img src="/новый логотип на кыргызском.png" alt="logo" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover"}}/><span style={{fontSize:18,fontWeight:700,color:"#F57C00"}}>Иштерман</span></div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
        <div style={{width:60,height:60,borderRadius:30,background:avatarColor(user.id),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20,fontWeight:700,marginBottom:10}}>{initials(user.name)}</div>
        <p style={{fontSize:18,fontWeight:700,color:"var(--color-text-primary,#111)",margin:"0 0 4px"}}>{user.name}</p>
        <p style={{fontSize:12,color:"var(--color-text-secondary,#888)",margin:"0 0 28px"}}>{user.email||user.phone}</p>
        <p style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary,#111)",margin:"0 0 6px",textAlign:"center"}}>{t.roleTitle}</p>
        <p style={{fontSize:12,color:"var(--color-text-secondary,#888)",margin:"0 0 24px",textAlign:"center",lineHeight:1.6}}>{t.roleSub}</p>
        <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:12}}>
          {roles.map(r=>(
            <button key={r.id} className="card btn3d" onClick={()=>onSelectRole(r.id)} style={{width:"100%",padding:"18px 20px",borderRadius:16,border:"none",background:`linear-gradient(145deg,${r.color}cc,${r.color})`,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:16,boxShadow:`0 5px 0 ${r.color}88,0 8px 16px ${r.color}44`}}>
              {r.img?<img src={r.img} alt={r.id} style={{width:64,height:64,objectFit:"contain",borderRadius:8,flexShrink:0}}/>:<span style={{fontSize:32}}>{r.icon}</span>}
              <div><p style={{margin:"0 0 4px",fontSize:17,fontWeight:700,color:"#fff"}}>{r.label}</p><p style={{margin:0,fontSize:14,color:"rgba(255,255,255,0.8)"}}>{r.sub}</p></div>
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
    addNotification(currentUser.id, lang==="ru"?`⭐ Вы оставили отзыв для ${target?.name||""}`:`⭐ ${target?.name||""} үчүн пикир калтырдыңыз`);
    if (targetId!==currentUser.id) addNotification(targetId, lang==="ru"?`⭐ ${currentUser.name} оставил вам отзыв (${rating}★)`:`⭐ ${currentUser.name} сизге пикир калтырды (${rating}★)`);
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

function ReviewRow({ rv, i }) {
  const name = useUserName(rv.authorId);
  return (
    <div style={{paddingTop:i>0?12:0,marginTop:i>0?12:0,borderTop:i>0?"0.5px solid var(--color-border-tertiary,#e0e0e0)":"none"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontSize:12,fontWeight:600,color:"var(--color-text-primary,#111)"}}>{name}</span>
        <div style={{display:"flex",alignItems:"center",gap:5}}><Stars r={rv.rating} size={12}/><span style={{fontSize:10,color:"var(--color-text-secondary,#888)"}}>{rv.rating}.0</span></div>
      </div>
      {rv.text&&<p style={{margin:0,fontSize:12,color:"var(--color-text-secondary,#888)",lineHeight:1.5,fontStyle:"italic"}}>"{rv.text}"</p>}
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
          :userReviews.slice(0,6).map((rv,i)=>(
            <ReviewRow key={rv.id} rv={rv} i={i}/>
          ))}
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
        <p style={{margin:"0 0 2px",fontSize:30,fontWeight:700,color:"#185FA5"}}>29 сом</p>
        <p style={{margin:"0 0 16px",fontSize:13,color:"var(--color-text-secondary,#888)",textAlign:"center"}}>{t.publish}</p>
        {taskTitle&&<div style={{width:"100%",padding:"10px 14px",background:"var(--color-background-primary,#fff)",borderRadius:12,marginBottom:14,fontSize:13,fontWeight:500,color:"var(--color-text-primary,#111)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}>📋 {taskTitle}</div>}
        <label style={{display:"flex",gap:10,cursor:"pointer",marginBottom:6,alignItems:"flex-start",width:"100%"}}>
          <input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)} style={{width:18,height:18,flexShrink:0,cursor:"pointer",accentColor:"#185FA5",marginTop:2}}/>
          <span style={{fontSize:12,color:"var(--color-text-secondary,#888)",lineHeight:1.6}}>{consent}</span>
        </label>
        {!checked&&<p style={{margin:"0 0 8px",fontSize:11,color:"#A32D2D",width:"100%"}}>{t.checkboxRequired}</p>}
        <button className="rb" onClick={handlePay} disabled={!checked||status==="paying"}
          style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:checked&&status!=="paying"?"pointer":"default",background:checked&&status!=="paying"?"#185FA5":"#c0d0e8",color:"#fff",fontSize:15,fontWeight:700,marginBottom:10,marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {status==="paying"?<><span style={{fontSize:16,animation:"spin 0.8s linear infinite",display:"inline-block"}}>⏳</span>{t.payingNow}</>:(lang==="ru"?"Оплатить":"Тастыктоо")}
        </button>
        <button onClick={pop} style={{width:"100%",padding:"12px",borderRadius:12,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"none",cursor:"pointer",fontSize:14,color:"var(--color-text-secondary,#888)"}}>{t.cancel}</button>
      </div>
    </div>
  );
}

function CityPickerScreen({ currentCity, onSelect, onClose }) {
  const { lang, t, pop } = useApp();
  const [q,setQ]=useState("");
  const lq=q.trim().toLowerCase();
  const matches=lq?CITIES.filter(c=>c.ru.toLowerCase().includes(lq)||c.ky.toLowerCase().includes(lq)):CITIES;
  const groups={};matches.forEach(c=>{const g=locGroup(c,lang);if(!groups[g])groups[g]=[];groups[g].push(c);});
  const close=onClose||(()=>pop());
  const select=id=>{onSelect(id);close();};
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-primary,#fff)"}}>
      <div style={{padding:"10px 14px",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
        <button onClick={close} className="back-btn" style={{flexShrink:0}}><span style={{fontSize:15}}>←</span><span>{lang==="ru"?"Назад":"Артка"}</span></button><div style={{position:"relative",flex:1}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"var(--color-text-secondary,#888)"}}>🔍</span><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder={t.searchLoc} style={{width:"100%",paddingLeft:26,paddingTop:7,paddingBottom:7}}/></div>
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

// Глобальные координаты пользователя (обновляются при геолокации)
let _userLat:number|null=null;
let _userLng:number|null=null;

function TopBar({ search, setSearch, city, onCityPress }) {
  const { lang, t, setLang } = useApp();
  const sel=CITIES.find(c=>c.id===city);
  return (
    <div style={{background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",padding:"8px 12px",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}><img src="/новый логотип на кыргызском.png" alt="logo" style={{width:26,height:26,borderRadius:"50%",objectFit:"cover"}}/><span style={{fontSize:16,fontWeight:700,color:"#F57C00"}}>Иштерман</span></div>
        <div style={{display:"flex",gap:4}}>{LANGS.map(l=><button key={l.id} className="pb" onClick={()=>setLang(l.id)} style={{padding:"3px 8px",borderRadius:6,border:"0.5px solid",cursor:"pointer",fontSize:11,fontWeight:lang===l.id?700:400,borderColor:lang===l.id?"#185FA5":"var(--color-border-tertiary,#e0e0e0)",background:lang===l.id?"#185FA5":"transparent",color:lang===l.id?"#fff":"var(--color-text-secondary,#888)"}}>{l.label}</button>)}</div>
      </div>
      <div style={{position:"relative",marginBottom:6}}>
        <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"var(--color-text-secondary,#888)"}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} style={{width:"100%",paddingLeft:27,paddingTop:7,paddingBottom:7,borderRadius:10,fontSize:13,background:"rgba(180,220,255,0.35)",border:"1px solid rgba(130,190,255,0.5)"}}/>
        {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:13,color:"var(--color-text-secondary,#888)"}}>✕</button>}
      </div>
      <button onClick={onCityPress} className="pb" style={{width:"100%",padding:"7px 10px",borderRadius:10,border:"1px solid rgba(130,190,255,0.5)",background:"rgba(180,220,255,0.35)",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:13}}>
        <span style={{fontSize:12}}>{sel?locIcon(sel.t):"🌐"}</span>
        <span style={{flex:1,textAlign:"left",color:sel?"#185FA5":"var(--color-text-secondary,#888)",fontWeight:sel?500:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel?locName(sel,lang):t.allCities}</span>
        <span style={{fontSize:9,color:"var(--color-text-secondary,#888)"}}>▼</span>
      </button>
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
        <button onClick={()=>push({type:"userProfile",userId:resp.executorId})} style={{background:"none",border:"none",padding:0,cursor:"pointer",flexShrink:0}}><Avatar user={user} size={isChosen?68:56} fontSize={isChosen?22:18}/></button>
        <div style={{flex:1,minWidth:0}}>
          <button onClick={()=>push({type:"userProfile",userId:resp.executorId})} style={{background:"none",border:"none",padding:0,cursor:"pointer",fontSize:isChosen?18:16,fontWeight:700,color:"var(--color-text-primary,#111)",textDecoration:"underline",textDecorationColor:"#185FA520"}}>{user?.name||"—"}</button>
          {rating?(<div style={{display:"flex",alignItems:"center",gap:4,marginTop:3}}><Stars r={rating.avg} size={isChosen?15:13}/><span style={{fontSize:isChosen?13:12,color:"var(--color-text-secondary,#888)"}}>{rating.avg} ({rating.count})</span></div>):<span style={{fontSize:isChosen?13:12,color:"var(--color-text-secondary,#888)",display:"block",marginTop:3}}>{t.noReviews}</span>}
          {showPhone&&isChosen&&<p style={{margin:"5px 0 0",fontSize:14,color:"#185FA5",fontWeight:500}}>📞 {phone}</p>}
        </div>
        <span style={{fontSize:isChosen?17:16,fontWeight:700,color:"#185FA5",whiteSpace:"nowrap"}}>{resp.priceOffer.toLocaleString()} сом</span>
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

function Lightbox({ imgs, startIndex, onClose }) {
  const [idx,setIdx]=useState(startIndex);
  const prev=()=>setIdx(i=>(i-1+imgs.length)%imgs.length);
  const next=()=>setIdx(i=>(i+1)%imgs.length);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",fontSize:22,width:40,height:40,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      {imgs.length>1&&<button onClick={e=>{e.stopPropagation();prev();}} style={{position:"absolute",left:12,background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",fontSize:26,width:40,height:40,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>}
      <img onClick={e=>e.stopPropagation()} src={imgs[idx]} style={{maxWidth:"95vw",maxHeight:"85vh",objectFit:"contain",borderRadius:8}}/>
      {imgs.length>1&&<button onClick={e=>{e.stopPropagation();next();}} style={{position:"absolute",right:12,background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",fontSize:26,width:40,height:40,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>}
      {imgs.length>1&&<div style={{position:"absolute",bottom:20,display:"flex",gap:6}}>{imgs.map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:i===idx?"#fff":"rgba(255,255,255,0.4)"}}/>)}</div>}
    </div>
  );
}

function TaskDetailScreen({ task }) {
  const { lang, t, tasks, setTasks, addNotification, push, currentUser, responses, setResponses, reviews } = useApp();
  const [showForm,setShowForm]=useState(false);
  const [priceOffer,setPriceOffer]=useState(String(task.price));
  const [comment,setComment]=useState("");
  const [lightbox,setLightbox]=useState(null);
  const [showCompleteConfirm,setShowCompleteConfirm]=useState(false);

  const cat         = CATS[task.cat];
  const loc         = CITIES.find(c=>c.id===task.city);
  const currentTask = tasks.find(tk=>tk.id===task.id)||task;
  const isOwner     = currentTask.ownerId===currentUser.id;
  const isExecutor  = currentUser.role==="executor";
  const isCustomer  = currentUser.role==="customer";
  const daysLeft    = Math.max(0,Math.round(((typeof currentTask.expires_at==="number"?currentTask.expires_at:new Date(currentTask.expires_at).getTime())-Date.now())/86400000));
  const taskTitle   = lang==="ru"?task.ru:task.ky;

  const taskResponses = responses.filter(r=>r.taskId===task.id);
  const myResponse    = taskResponses.find(r=>r.executorId===currentUser.id);
  const chosenResp    = taskResponses.find(r=>r.status==="chosen");
  const isCompleted   = currentTask.status==="completed";

  const todayStart=new Date();todayStart.setHours(0,0,0,0);
  const todayResponses=responses.filter(r=>r.executorId===currentUser.id&&new Date(r.createdAt).getTime()>=todayStart.getTime());
  const dailyLimitReached=isExecutor&&todayResponses.length>=3;

  const statusMap={
    open:            {color:"#0F6E56",bg:"#E1F5EE",label:t.statusOpen},
    closed_by_choice:{color:"#fff",bg:"#A32D2D",label:t.statusClosed},
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
    const prevChosen=taskResponses.find(r=>r.status==="chosen");
    setTasks(ts=>ts.map(tk=>tk.id===task.id?{...tk,status:"open",chosen_executor_id:null,reactivation_count:tk.reactivation_count+1}:tk));
    setResponses(rs=>rs.map(r=>r.taskId===task.id&&r.status==="chosen"?{...r,status:"pending"}:r));
    addNotification(currentUser.id, lang==="ru"?`🔄 Задание «${taskTitle}» снова открыто`:`🔄 «${taskTitle}» тапшырмасы кайра ачылды`);
    if (prevChosen&&prevChosen.executorId!==currentUser.id) addNotification(prevChosen.executorId, lang==="ru"?`🔄 Заказчик снова открыл задание «${taskTitle}» — вы снова в очереди`:`🔄 Буйрутмачы «${taskTitle}» тапшырмасын кайра ачты — сиз кайра кезекте`);
  };

  const handleComplete=()=>{
    const hasChosen=currentTask.chosen_executor_id||taskResponses.some(r=>r.status==="chosen");
    if (!hasChosen){
      addNotification(currentUser.id, lang==="ru"?"⛔ Нельзя завершить задание без выбранного исполнителя":"⛔ Аткаруучу тандалбай тапшырманы аяктоо мүмкүн эмес");
      setShowCompleteConfirm(false);
      return;
    }
    setTasks(ts=>ts.map(tk=>tk.id===task.id?{...tk,status:"completed",completed:true,completed_at:Date.now()}:tk));
    addNotification(currentUser.id, lang==="ru"?`🏁 Задание «${taskTitle}» завершено! Оставьте отзыв исполнителю.`:`🏁 «${taskTitle}» аяктады! Аткаруучуга пикир калтырыңыз.`);
    setShowCompleteConfirm(false);
  };

  const goToRespondPayment=()=>{
    const nr={id:"resp_"+Date.now(),taskId:task.id,executorId:currentUser.id,priceOffer:Number(priceOffer)||task.price,comment:comment.trim(),status:"pending",createdAt:new Date().toISOString()};
    setResponses(rs=>[...rs,nr]);
    addNotification(currentUser.id, t.respondSent);
    if (currentTask.ownerId!==currentUser.id) {
      addNotification(currentTask.ownerId, lang==="ru"?`💬 Новый отклик на «${taskTitle}» от ${currentUser.name}`:`💬 «${taskTitle}» тапшырмасына ${currentUser.name} жооп берди`);
    }
    setShowForm(false);
  };

  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      {lightbox&&<Lightbox imgs={lightbox.imgs} startIndex={lightbox.idx} onClose={()=>setLightbox(null)}/>}
      <ScreenHeader title={t.taskDetail} right={<span style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:st.bg,color:st.color}}>{st.label}</span>}/>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px 30px"}}>
        <SectionCard delay={0}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <Pill color={cat.color} bg={cat.bg}>{cat.icon} {cat[lang]}</Pill>
            {task.urgent&&<Pill color="#A32D2D" bg="#FCEBEB">{t.urgent}</Pill>}
          </div>
          <p style={{margin:"0 0 6px",fontSize:16,fontWeight:600,color:"var(--color-text-primary,#111)"}}>{task[lang==="ru"?"ru":"ky"]}</p>
          <p style={{margin:"0 0 10px",fontSize:15,color:"var(--color-text-secondary,#888)",lineHeight:1.6}}>{task[lang==="ru"?"dRu":"dKy"]}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {[[t.lBudget,`${task.price.toLocaleString()} сом`],[t.lTime,fmtDate(task.time)],[t.lCity,loc?locName(loc,lang):"—"],[t.expiresIn,isCompleted?"—":(task.period||`${daysLeft} ${lang==="ru"?"дн.":"күн"}`)]].map(([k,v])=>(
              <div key={k} style={{background:"var(--color-background-secondary,#f4f4f4)",borderRadius:9,padding:"10px 12px"}}>
                <div style={{fontSize:12,color:"var(--color-text-secondary,#888)",marginBottom:3}}>{k}</div>
                <div style={{fontSize:15,fontWeight:600,color:"var(--color-text-primary,#111)"}}>{v}</div>
              </div>
            ))}
          </div>
          {(()=>{const imgs=(task.photos||[]).filter(p=>p&&(typeof p==="string"?p:p.url)&&(typeof p==="string"?p:p.url).length>10).map(p=>typeof p==="string"?p:p.url);return imgs.length>0&&(
            <div style={{marginTop:12,display:"flex",gap:8,overflowX:"auto"}}>
              {imgs.map((src,i)=>(
                <img key={i} onClick={()=>setLightbox({imgs,idx:i})} src={src} alt="" style={{width:imgs.length===1?"100%":80,height:imgs.length===1?140:80,objectFit:"cover",borderRadius:8,flexShrink:0,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",cursor:"pointer"}}/>
              ))}
            </div>
          );})()}
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
            {!myResponse&&dailyLimitReached&&(
              <div style={{background:"#FFF3E0",border:"1px solid #FFB74D",borderRadius:12,padding:"14px 16px",textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:6}}>🚫</div>
                <p style={{margin:"0 0 4px",fontSize:13,fontWeight:600,color:"#E65100"}}>{lang==="ru"?"Отклики ограничены":"Жооп берүү чектелген"}</p>
                <p style={{margin:0,fontSize:12,color:"#BF360C"}}>{lang==="ru"?"В день можно отправить только 3 отклика":"Күнүнө үч жолу гана жооп берүү мүмкүн"}</p>
              </div>
            )}
            {!myResponse&&!dailyLimitReached&&(showForm?(
              <div>
                <p style={{margin:"0 0 6px",fontSize:14,color:"var(--color-text-secondary,#888)"}}>{t.priceOffer}</p>
                <input type="number" value={priceOffer} onChange={e=>setPriceOffer(e.target.value)} style={{width:"100%",marginBottom:12}}/>
                <p style={{margin:"0 0 6px",fontSize:14,color:"var(--color-text-secondary,#888)"}}>{t.offerComment}</p>
                <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder={lang==="ru"?"Почему именно вы?":"Эмне үчүн сиз?"} style={{width:"100%",resize:"none",marginBottom:12}}/>
                <button className="rb" onClick={goToRespondPayment} style={{width:"100%",padding:"12px",borderRadius:11,border:"none",cursor:"pointer",background:"#185FA5",color:"#fff",fontSize:14,fontWeight:700,marginBottom:6}}>{t.confirm}</button>
                <button onClick={()=>setShowForm(false)} style={{width:"100%",padding:"9px",borderRadius:10,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"none",cursor:"pointer",fontSize:13,color:"var(--color-text-secondary,#888)"}}>{t.cancel}</button>
              </div>
            ):(<div><button className="rb" onClick={()=>setShowForm(true)} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",cursor:"pointer",background:"#185FA5",color:"#fff",fontSize:14,fontWeight:700}}>{t.respond}</button><p style={{margin:"8px 0 0",fontSize:11,color:"var(--color-text-secondary,#888)",textAlign:"center",lineHeight:1.6}}>{lang==="ru"?"Заказчик рассмотрит все отклики и сам выберет исполнителя. Чтобы выбрали именно вас — добавьте фото и заполните профиль: это повышает доверие и шансы быть выбранным.":"Буйрутмачы бардык жоопторду карап аткаруучуну тандайт. Тандалуу үчүн профилиңизге сүрөт кошуп, өзүңүз жөнүндө маалымат көбүрөөк жазыңыз — бул ишенимди жогорулатат."}</p></div>)
            )}
            {myResponse?.status==="pending"&&(<div style={{textAlign:"center",padding:"12px",background:"#EAF3DE",borderRadius:10,color:"#2A5E1A",fontWeight:500,fontSize:13}}>{t.alreadyResponded} ✓<p style={{margin:"6px 0 0",fontSize:11,color:"#2A5E1A",opacity:0.75,fontWeight:400}}>{lang==="ru"?"Ожидайте решения заказчика":"Буйрутмачынын чечимин күтүңүз"}</p></div>)}
          </SectionCard>
        )}

        {isExecutor&&!isOwner&&currentTask.status!=="open"&&(
          <SectionCard delay={0.05}>
            {myResponse?.status==="chosen"&&!isCompleted&&(<div style={{padding:"10px 12px",background:"#EAF3DE",borderRadius:10,marginBottom:10,border:"0.5px solid #8AC88A"}}><p style={{margin:0,fontSize:12,fontWeight:700,color:"#2A5E1A"}}>🎉 {t.chosenBadge}</p></div>)}
            {myResponse?.status==="chosen"&&isCompleted&&(<div style={{padding:"10px 13px",background:"#E6F1FB",borderRadius:10,border:"0.5px solid #A0C0E8",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>🏁</span><span style={{fontSize:13,color:"#185FA5",fontWeight:600}}>{lang==="ru"?"Задание завершено заказчиком":"Буйрутмачы тапшырманы аяктатты"}</span></div>)}
            {myResponse?.status==="declined"&&(<div style={{textAlign:"center",padding:"12px",background:"var(--color-background-secondary,#f4f4f4)",borderRadius:10,color:"var(--color-text-secondary,#888)",fontSize:13}}>{t.respStatus_declined}</div>)}
            {!myResponse&&(<p style={{margin:0,textAlign:"center",padding:"8px",fontSize:13,color:"var(--color-text-secondary,#888)"}}>{currentTask.status==="closed_expired"?`⏰ ${lang==="ru"?"Срок задания истёк":"Тапшырманын мөөнөтү өттү"}`:t.taskClosed}</p>)}
            {isCompleted&&myResponse?.status==="chosen"&&(<ReviewBtn taskId={task.id} targetId={currentTask.ownerId} taskTitle={taskTitle} reviews={reviews} currentUser={currentUser} push={push} t={t}/>)}
          </SectionCard>
        )}

        {isCustomer&&!isOwner&&(<SectionCard delay={0.05}><p style={{margin:0,textAlign:"center",padding:"8px",fontSize:13,color:"var(--color-text-secondary,#888)"}}>{t.otherCustomerTask}</p></SectionCard>)}
      </div>
    </div>
  );
}

function MyTasksScreen() {
  const { lang, t, tasks, setTasks, responses, reviews, currentUser, push, addNotification } = useApp();
  const deleteTask=(e,taskId)=>{e.stopPropagation();setTasks(ts=>ts.filter(tk=>tk.id!==taskId));};
  const cancelTask=(e,task)=>{
    e.stopPropagation();
    if(!window.confirm(lang==="ru"?`Отменить задание «${task.ru}»? Деньги не возвращаются.`:`«${task.ru}» тапшырмасын жокко чыгаруу? Акча кайтарылбайт.`))return;
    setTasks(ts=>ts.map(tk=>tk.id===task.id?{...tk,status:"cancelled"}:tk));
    const responders=responses.filter(r=>r.taskId===task.id);
    responders.forEach(r=>{
      addNotification(r.executorId, lang==="ru"
        ?`❌ Заказчик отменил задание «${task.ru}`
        :`❌ Буйрутмачы «${task.ru}» тапшырмасын жокко чыгарды`);
    });
    addNotification(currentUser.id, lang==="ru"?`❌ Задание «${task.ru}» отменено`:`❌ «${task.ru}» тапшырмасы жокко чыгарылды`);
  };
  const myTasks=tasks.filter(tk=>tk.ownerId===currentUser.id).sort((a,b)=>(b.createdAt||b.id)-(a.createdAt||a.id));
  const statusCfg={open:{label:t.statusOpen,color:"#0F6E56",bg:"#E1F5EE"},closed_by_choice:{label:t.statusClosed,color:"#fff",bg:"#A32D2D"},closed_expired:{label:t.statusExpired,color:"#666",bg:"#EFEFEF"},completed:{label:t.statusCompleted,color:"#185FA5",bg:"#E6F1FB"},cancelled:{label:lang==="ru"?"Отменено":"Жокко чыгарылды",color:"#888",bg:"#EFEFEF"}};
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <ScreenHeader title={t.myTasks}/>
      <div style={{flex:1,overflowY:"auto",padding:"10px 14px 20px"}}>
        {myTasks.length===0?<div style={{textAlign:"center",padding:"50px 0",color:"var(--color-text-secondary,#888)",fontSize:13}}>{t.noTasks_my}</div>
        :myTasks.map((task,i)=>{
          const cat=CATS[task.cat],loc=CITIES.find(c=>c.id===task.city),sc=statusCfg[task.status]||statusCfg.open;
          const respCount=responses.filter(r=>r.taskId===task.id).length;
          const chosenResp=responses.find(r=>r.taskId===task.id&&r.status==="chosen");
          const hasReview=chosenResp&&reviews.some(r=>r.taskId===task.id&&r.authorId===currentUser.id&&r.targetId===chosenResp.executorId);
          return (
            <div key={task.id} className="fe card" style={{animationDelay:`${i*0.04}s`,background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:14,padding:"12px 13px",marginBottom:9}} onClick={()=>push({type:"taskDetail",task})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}><div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}><Pill color={cat.color} bg={cat.bg}>{cat.icon} {cat[lang]}</Pill>{task.urgent&&<Pill color="#A32D2D" bg="#FCEBEB">{t.urgent}</Pill>}</div><span style={{fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:12,background:sc.bg,color:sc.color,whiteSpace:"nowrap",flexShrink:0}}>{sc.label}</span></div>
              <p style={{margin:"0 0 5px",fontSize:14,fontWeight:500,color:"var(--color-text-primary,#111)",lineHeight:1.3}}>{task[lang==="ru"?"ru":"ky"]}</p>
              <div style={{display:"flex",gap:8,fontSize:11,color:"var(--color-text-secondary,#888)",flexWrap:"wrap",alignItems:"center",marginBottom:8}}><span>{locIcon(loc?.t||"city")} {loc?locName(loc,lang):"—"}</span><span>💰 {task.price.toLocaleString()} сом</span><span>🕐 {fmtDate(task.time)}</span></div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",background:"var(--color-background-secondary,#f4f4f4)",borderRadius:9}}><span style={{fontSize:11,color:"var(--color-text-secondary,#888)"}}>{t.respondCount}</span><span style={{fontSize:13,fontWeight:600,color:respCount>0?"#185FA5":"var(--color-text-secondary,#888)"}}>{respCount>0?`${respCount} 💬`:"—"}</span></div>
              {task.status==="completed"&&chosenResp&&!hasReview&&(<div style={{marginTop:8,padding:"6px 10px",background:"#FFF8E6",borderRadius:8,border:"0.5px solid #F0C040",fontSize:11,color:"#7A5C00",fontWeight:500}}>⭐ {t.leaveReviewHint}</div>)}
              {task.status==="completed"&&(<div style={{marginTop:6,display:"flex",justifyContent:"flex-end"}}><button onClick={e=>deleteTask(e,task.id)} style={{padding:"4px 12px",borderRadius:7,border:"0.5px solid #A32D2D",background:"#FCEBEB",cursor:"pointer",fontSize:11,color:"#A32D2D",fontWeight:600}}>{t.deleteTask}</button></div>)}
              {task.status==="cancelled"&&(<div style={{marginTop:6,display:"flex",justifyContent:"flex-end"}} onClick={e=>e.stopPropagation()}><button onClick={e=>deleteTask(e,task.id)} style={{padding:"3px 10px",borderRadius:6,border:"0.5px solid #A32D2D",background:"#FCEBEB",cursor:"pointer",fontSize:10,color:"#A32D2D",fontWeight:600}}>🗑 {lang==="ru"?"Удалить отменённое задание":"Жокко чыгарылганды өчүрүү"}</button></div>)}
              {task.status==="open"&&(<div style={{marginTop:6,display:"flex",flexDirection:"column",alignItems:"flex-end"}} onClick={e=>e.stopPropagation()}>
                <button onClick={e=>cancelTask(e,task)} style={{padding:"3px 10px",borderRadius:6,border:"0.5px solid #A32D2D",background:"#FCEBEB",cursor:"pointer",fontSize:10,color:"#A32D2D",fontWeight:600}}>{t.cancelTask}</button>
              </div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyResponsesScreen() {
  const { lang, t, tasks, responses, setResponses, reviews, currentUser, push, usersDB } = useApp();
  const SEVEN_DAYS=7*24*60*60*1000;
  const [lightbox,setLightbox]=useState(null);
  const myResponses=responses.filter(r=>r.executorId===currentUser.id);
  const deleteResp=(e,respId)=>{e.stopPropagation();setResponses(rs=>rs.filter(r=>r.id!==respId));};
  const statusCfg={pending:{label:t.respStatus_pending,color:"#B05E0A",bg:"#FAEEDD"},chosen:{label:t.respStatus_chosen,color:"#0F6E56",bg:"#E1F5EE"},declined:{label:t.respStatus_declined,color:"#A32D2D",bg:"#FCEBEB"}};
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      {lightbox&&<Lightbox imgs={lightbox.imgs} startIndex={lightbox.idx} onClose={()=>setLightbox(null)}/>}
      <ScreenHeader title={t.myResponsesTitle}/>
      <div style={{flex:1,overflowY:"auto",padding:"10px 14px 20px"}}>
        {myResponses.length===0?<div style={{textAlign:"center",padding:"50px 0",color:"var(--color-text-secondary,#888)",fontSize:13}}>{t.noMyResponses}</div>
        :myResponses.map((resp,i)=>{
          const task=tasks.find(tk=>tk.id===resp.taskId);if(!task)return null;
          const cat=CATS[task.cat],loc=CITIES.find(c=>c.id===task.city),sc=statusCfg[resp.status]||statusCfg.pending;
          const isCompleted=task.status==="completed";
          const isChosen=resp.status==="chosen";
          const owner=Object.values(usersDB).find((u:any)=>u.id===task.ownerId) as any;
          return (
            <div key={resp.id} className="fe" style={{animationDelay:`${i*0.04}s`,background:"var(--color-background-primary,#fff)",border:`0.5px solid ${isChosen?"#8AC88A":"var(--color-border-tertiary,#e0e0e0)"}`,borderRadius:14,padding:"12px 13px",marginBottom:9}}>
              <div className="card" onClick={()=>push({type:"taskDetail",task})}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}><div style={{display:"flex",gap:5,flexWrap:"wrap"}}><Pill color={cat.color} bg={cat.bg}>{cat.icon} {cat[lang]}</Pill>{task.urgent&&<Pill color="#A32D2D" bg="#FCEBEB">{t.urgent}</Pill>}</div><Pill color={sc.color} bg={sc.bg}>{sc.label}</Pill></div>
                <p style={{margin:"0 0 5px",fontSize:14,fontWeight:500,color:"var(--color-text-primary,#111)",lineHeight:1.3}}>{task[lang==="ru"?"ru":"ky"]}</p>
                <div style={{display:"flex",gap:8,fontSize:11,color:"var(--color-text-secondary,#888)",flexWrap:"wrap",alignItems:"center",marginBottom:6}}><span>{locIcon(loc?.t||"city")} {loc?locName(loc,lang):"—"}</span><span>🕐 {fmtDate(task.time)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"var(--color-background-secondary,#f4f4f4)",borderRadius:8}}><span style={{fontSize:11,color:"var(--color-text-secondary,#888)"}}>{t.yourOffer}</span><span style={{fontSize:13,fontWeight:600,color:"#185FA5"}}>{resp.priceOffer.toLocaleString()} сом</span></div>
                {resp.comment&&<p style={{margin:"6px 0 0",fontSize:12,color:"var(--color-text-secondary,#888)",fontStyle:"italic"}}>"{resp.comment}"</p>}
              </div>
              {isChosen&&(
                <div style={{marginTop:10,padding:"10px 12px",background:"#EAF3DE",borderRadius:10,border:"0.5px solid #8AC88A"}}>
                  <p style={{margin:"0 0 6px",fontSize:12,fontWeight:700,color:"#2A5E1A"}}>🎉 {lang==="ru"?"Вы выбраны! Контакт заказчика:":"Сиз тандалдыңыз! Буйрутмачынын байланышы:"}</p>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:owner&&task.photos?.length>0?8:0}}>
                    <Avatar user={owner} size={36} fontSize={14}/>
                    <div>
                      <p style={{margin:"0 0 1px",fontSize:13,fontWeight:600,color:"#111"}}>{owner?.name||"—"}</p>
                      <p style={{margin:0,fontSize:12,color:"#185FA5",fontWeight:500}}>📞 {owner?.phone||"—"}</p>
                    </div>
                  </div>
                  {(()=>{const imgs=(task.photos||[]).filter(p=>p&&(typeof p==="string"?p:p.url)&&(typeof p==="string"?p:p.url).length>10).map(p=>typeof p==="string"?p:p.url);return imgs.length>0&&(
                    <div style={{display:"flex",gap:6,overflowX:"auto",marginTop:8}}>
                      {imgs.map((src,pi)=>(
                        <img key={pi} onClick={()=>setLightbox({imgs,idx:pi})} src={src} alt="" style={{width:80,height:80,objectFit:"cover",borderRadius:8,flexShrink:0,border:"0.5px solid #8AC88A",cursor:"pointer"}}/>
                      ))}
                    </div>
                  );})()}
                </div>
              )}
              {isCompleted&&resp.status==="chosen"&&(<ReviewBtn taskId={task.id} targetId={task.ownerId} taskTitle={lang==="ru"?task.ru:task.ky} reviews={reviews} currentUser={currentUser} push={push} t={t}/>)}
              <div style={{marginTop:6,display:"flex",justifyContent:"flex-end"}} onClick={e=>e.stopPropagation()}>
                <button onClick={e=>deleteResp(e,resp.id)} style={{padding:"3px 10px",borderRadius:6,border:"0.5px solid #A32D2D",background:"#FCEBEB",cursor:"pointer",fontSize:10,color:"#A32D2D",fontWeight:600}}>🗑 {lang==="ru"?"Удалить отклик":"Жоопту өчүрүү"}</button>
              </div>
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
  const { lang, t, currentUser, setCurrentUser, setUsersDB, pop } = useApp();
  const isExecutor=currentUser.role==="executor";
  const fileRef=useRef();
  const defaultNames=["Пользователь","Колдонуучу"];
  const [name,setName]=useState(defaultNames.includes(currentUser.name)?"":currentUser.name||"");
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
    setCurrentUser(u);saveUser(u);const db=loadUsersDB();if(db[u.phone]){db[u.phone]=u;saveUsersDB(db);setUsersDB({...db});}
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
        {[[t.fName,name,setName,"👤",false],[t.fAbout,about,setAbout,"📝",true]].map(([lbl,val,setter,icon,multi],idx)=>(
          <div key={lbl} className="fe" style={{marginBottom:14}}><p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:500}}>{icon} {lbl}</p>{multi?<textarea value={val} onChange={e=>setter(e.target.value)} placeholder={t.phAbout} rows={3} style={{width:"100%",resize:"none",lineHeight:1.5}}/>:<input autoFocus={idx===0} value={val} onChange={e=>setter(e.target.value)} placeholder={t.namePlaceholder} style={{width:"100%",fontSize:14}}/>}</div>
        ))}
        {isExecutor&&(<>
          <div className="fe" style={{marginBottom:14}}><p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:500}}>⚡ {t.fSkills}</p><input value={skills} onChange={e=>setSkills(e.target.value)} placeholder={t.phSkills} style={{width:"100%"}}/><p style={{margin:"4px 0 0",fontSize:10,color:"var(--color-text-secondary,#888)"}}>{lang==="ru"?"Вводите через запятую":"Үтүр менен жазыңыз"}</p></div>
          <div className="fe" style={{marginBottom:14}}><p style={{margin:"0 0 5px",fontSize:12,color:"var(--color-text-secondary,#888)",fontWeight:500}}>🏆 {t.fExp}</p><textarea value={exp} onChange={e=>setExp(e.target.value)} placeholder={t.phExp} rows={2} style={{width:"100%",resize:"none",lineHeight:1.5}}/></div>
        </>)}
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

function DocsScreen() {
  const { lang, pop } = useApp();
  const [tab, setTab] = useState<"terms"|"privacy">("terms");
  const isRu = lang === "ru";
  const TERMS_RU = `ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ
Иштерман — платформа для Кыргызской Республики

Дата вступления в силу: с момента публикации

1. ОБЩИЕ ПОЛОЖЕНИЯ
1.1. Настоящее Соглашение регулирует отношения между сервисом Иштерман («Платформа») и пользователями.
1.2. Регистрируясь, вы принимаете условия настоящего Соглашения в полном объёме.
1.3. Платформа является информационным посредником и не является стороной сделок между заказчиками и исполнителями.

2. РЕГИСТРАЦИЯ И АККАУНТ
2.1. Для использования сервиса необходимо указать номер телефона и имя.
2.2. Вы несёте ответственность за достоверность указанных данных.
2.3. Один пользователь может иметь только один аккаунт.

3. ПРАВИЛА ДЛЯ ЗАКАЗЧИКОВ
3.1. Описание задания должно быть честным и полным.
3.2. Заказчик самостоятельно выбирает исполнителя из числа откликнувшихся.
3.3. Оплата исполнителю производится напрямую, вне Платформы.
3.4. Запрещается размещать задания, нарушающие законодательство КР.

4. ПРАВИЛА ДЛЯ ИСПОЛНИТЕЛЕЙ
4.1. Исполнитель обязуется выполнить задание в срок и в соответствии с договорённостью.
4.2. Запрещается предоставлять ложную информацию о себе или своих навыках.
4.3. Исполнитель несёт полную ответственность за качество выполненных работ.

5. ЗАПРЕЩЁННЫЙ КОНТЕНТ
Запрещается размещать задания и отклики, связанные с:
— незаконной деятельностью;
— оружием, наркотиками, алкоголем;
— деятельностью, нарушающей права третьих лиц.

6. ОТВЕТСТВЕННОСТЬ
6.1. Платформа не несёт ответственности за споры между заказчиками и исполнителями.
6.2. Платформа не гарантирует выполнение заданий или оплату услуг.
6.3. Пользователи самостоятельно разрешают спорные ситуации.

7. ИЗМЕНЕНИЕ УСЛОВИЙ
Платформа вправе изменять условия Соглашения, уведомив пользователей через приложение. Продолжение использования сервиса означает согласие с новыми условиями.

8. ПРИМЕНИМОЕ ПРАВО
Настоящее Соглашение регулируется законодательством Кыргызской Республики.`;

  const TERMS_KY = `КОЛДОНУУЧУ КЕЛИШИМИ
Иштерман — Кыргыз Республикасы үчүн платформа

Күчүнө кирүү датасы: жарыяланган күндөн баштап

1. ЖАЛПЫ ЖОБОЛОР
1.1. Бул Келишим Иштерман сервиси («Платформа») менен колдонуучулардын ортосундагы мамилелерди жөнгө салат.
1.2. Катталуу менен сиз ушул Келишимдин шарттарын толук кабыл аласыз.
1.3. Платформа маалымат ортомчусу болуп саналат жана буйрутмачы менен аткаруучунун ортосундагы бүтүмдөрдүн тарабы эмес.

2. КАТТОО ЖАНА АККАУНТ
2.1. Сервисти колдонуу үчүн телефон номериңизди жана атыңызды көрсөтүшүңүз керек.
2.2. Берилген маалыматтардын туруктуулугу үчүн жооп бересиз.
2.3. Бир колдонуучунун бир гана аккаунту болушу мүмкүн.

3. БУЙРУТМАЧЫЛАР ҮЧҮН ЭРЕЖЕЛЕР
3.1. Тапшырманын сүрөттөлүшү чынчыл жана толук болуш керек.
3.2. Буйрутмачы жооп берген аткаруучулардын арасынан өз алдынча тандайт.
3.3. Аткаруучуга төлөм Платформадан тышкары, түздөн-түз жүргүзүлөт.
3.4. КР мыйзамдарын бузган тапшырмаларды жайгаштыруу тыйылган.

4. АТКАРУУЧУЛАР ҮЧҮН ЭРЕЖЕЛЕР
4.1. Аткаруучу тапшырманы мөөнөтүндө жана макулдашуу боюнча аткарууга милдеттенет.
4.2. Өзү жана жөндөмдөрү жөнүндө жалган маалымат берүү тыйылган.
4.3. Аткаруучу аткарылган иштердин сапаты үчүн толук жооп берет.

5. ТЫЙЫЛГАН МАЗМУН
Төмөнкүлөргө байланыштуу тапшырмаларды жана жооптарды жайгаштыруу тыйылат:
— мыйзамсыз иш-аракеттер;
— куралдар, баңгизаттар, алкоголь;
— үчүнчү жактардын укуктарын бузган иш-аракеттер.

6. ЖООПКЕРЧИЛИК
6.1. Платформа буйрутмачылар менен аткаруучулардын ортосундагы талаш-тартыштар үчүн жооп бербейт.
6.2. Платформа тапшырмалардын аткарылышын же кызмат акысынын төлөнүшүн кепилдебейт.
6.3. Колдонуучулар талаш-тартыш маселелерин өз алдынча чечишет.

7. ШАРТТАРДЫ ӨЗГӨРТҮҮ
Платформа колдонуучуларды тиркеме аркылуу кабарландырып, Келишимдин шарттарын өзгөртүүгө укуктуу. Сервисти андан ары колдонуу жаңы шарттарга макулдукту билдирет.

8. КОЛДОНУЛУУЧУ МЫЙЗАМЫБул Келишим Кыргыз Республикасынын мыйзамдарына ылайык жөнгө салынат.`;

  const PRIVACY_RU = `ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ
Иштерман

Дата вступления в силу: с момента публикации

1. КАКИЕ ДАННЫЕ МЫ СОБИРАЕМ
— Имя и номер телефона (обязательно при регистрации)
— Фотография профиля (по желанию)
— Навыки, опыт, описание о себе (по желанию)
— Данные о созданных заданиях и откликах
— История уведомлений и отзывов

2. КАК МЫ ИСПОЛЬЗУЕМ ДАННЫЕ
— Для идентификации пользователя в системе
— Для отображения профиля другим пользователям
— Для работы функций уведомлений и отзывов
— Для улучшения качества сервиса

3. ХРАНЕНИЕ ДАННЫХ
Данные хранятся локально на вашем устройстве (localStorage браузера). Передача данных третьим лицам в коммерческих целях не производится.

4. ВАШИ ПРАВА
В соответствии с Законом КР «Об информации персонального характера» (2017) вы вправе:
— Получить доступ к своим данным
— Исправить неточные данные
— Удалить свои данные (через обращение к администратору)
— Отозвать согласие на обработку данных

5. БЕЗОПАСНОСТЬ
Мы принимаем технические и организационные меры для защиты ваших данных от несанкционированного доступа.

6. КОНТАКТЫ
По вопросам обработки персональных данных обращайтесь: mos.kg81@gmail.com

7. ИЗМЕНЕНИЯ
Мы можем обновлять эту Политику. Об изменениях уведомим через приложение.`;

  const PRIVACY_KY = `КУПУЯЛЫК САЯСАТЫ
Иштерман

Күчүнө кирүү датасы: жарыяланган күндөн баштап

1. КАНДАЙ МААЛЫМАТТАРДЫ ЧОГУЛТТАБЫЗ
— Аты-жөн жана телефон номери (каттоодо милдеттүү)
— Профиль сүрөтү (каалоо боюнча)
— Жөндөмдөр, тажрыйба, өзү жөнүндө маалымат (каалоо боюнча)
— Түзүлгөн тапшырмалар жана жооптор боюнча маалыматтар
— Билдирмелер жана пикирлер тарыхы

2. МААЛЫМАТТАРДЫ КАНТИП КОЛДОНОБУЗ
— Системадагы колдонуучуну аныктоо үчүн
— Профилди башка колдонуучуларга көрсөтүү үчүн
— Билдирмелер жана пикирлер функцияларынын иштеши үчүн
— Сервистин сапатын жакшыртуу үчүн

3. МААЛЫМАТТАРДЫ САКТОО
Маалыматтар түзмөгүңүздө жергиликтүү (localStorage) жана корголгон Firebase маалымат базасында (Google Cloud, АКШ серверлери) сакталат. Маалыматтар коммерциялык максаттар үчүн үчүнчү жактарга берилбейт.

4. СИЗДИН УКУКТАРЫҢЫЗ
КР «Жеке мүнөздөгү маалымат жөнүндө» Мыйзамына (2017) ылайык сизде укук бар:
— Өз маалыматтарыңызга кире алууга
— Так эмес маалыматтарды оңдоого
— Маалыматтарыңызды жок кылып берүүнү суроого (администраторго кайрылуу аркылуу)
— Маалыматтарды иштетүүгө макулдугуңузду кайтарып алууга

5. КООПСУЗДУК
Маалыматтарыңызды уруксатсыз жетүүдөн коргоо үчүн техникалык жана уюштуруучулук чараларды колдонобуз.

6. БАЙЛАНЫШ
Жеке маалыматтарды иштетүү маселелери боюнча кайрылыңыз: mos.kg81@gmail.com

7. ӨЗГӨРТҮҮЛӨР
Бул Саясатты жаңырта алабыз. Өзгөртүүлөр жөнүндө тиркеме аркылуу кабарлайбыз.`;

  const termsText  = isRu ? TERMS_RU   : TERMS_KY;
  const privacyText = isRu ? PRIVACY_RU : PRIVACY_KY;
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <ScreenHeader title={isRu?"Документы":"Документтер"}/>
      <div style={{display:"flex",gap:0,borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"var(--color-background-primary,#fff)",flexShrink:0}}>
        {([["terms", isRu?"Соглашение":"Келишим"], ["privacy", isRu?"Конфиденциальность":"Купуялык"]] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"11px 8px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:tab===id?700:400,color:tab===id?"#185FA5":"var(--color-text-secondary,#888)",borderBottom:tab===id?"2px solid #185FA5":"2px solid transparent"}}>
            {label}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
        <pre style={{margin:0,fontSize:11,lineHeight:1.7,color:"var(--color-text-primary,#111)",whiteSpace:"pre-wrap",fontFamily:"inherit"}}>
          {tab==="terms" ? termsText : privacyText}
        </pre>
      </div>
    </div>
  );
}

function TabProfile() {
  const { lang, t, setLang, notifications, push, tasks, responses, reviews, currentUser, onLogout, switchToAdminRole } = useApp();
  const unread=notifications.filter(n=>!n.read).length;
  const myTasks=tasks.filter(tk=>tk.ownerId===currentUser.id);
  const doneTasks=myTasks.filter(tk=>tk.status==="completed");
  const myResponses=responses.filter(r=>r.executorId===currentUser.id);
  const roleLabel=currentUser.role==="admin"?(lang==="ru"?"Администратор":"Администратор"):currentUser.role?t[`roleLabel_${currentUser.role}`]:(lang==="ru"?"Не выбрана":"Тандалган жок");
  const roleIcon=currentUser.role==="customer"?"🧑‍💼":currentUser.role==="executor"?"🔨":currentUser.role==="admin"?"👑":"❓";
  const isExecutor=currentUser.role==="executor";
  const isAdmin=currentUser.role==="admin";
  if(isAdmin) return <AdminScreen standalone/>;
  const skillsList=currentUser.skills?.filter(Boolean)||[];
  const rating=calcRating(reviews,currentUser.id);
  const completedWithPendingReviews=isExecutor?[]:doneTasks.filter(tk=>{const cr=responses.find(r=>r.taskId===tk.id&&r.status==="chosen");if(!cr)return false;return !reviews.some(r=>r.taskId===tk.id&&r.authorId===currentUser.id&&r.targetId===cr.executorId);});
  const statItems=isExecutor?[[t.myResponses,myResponses.length],[t.statDone,myResponses.filter(r=>r.status==="chosen").length],[t.statRating,rating?`${rating.avg}★`:"—"]]:[[t.statCreated,myTasks.length],[t.statDone,doneTasks.length],[t.statRating,rating?`${rating.avg}★`:"—"]];
  const isOwner=currentUser.email===ADMIN_EMAIL;
  const menuItems=[...(currentUser.role==="customer"?[{label:t.myTasks,action:()=>push({type:"myTasks"}),icon:"📋",bold:myTasks.length>0}]:[{label:t.myResponses,action:()=>push({type:"myResponses"}),icon:"💬",bold:myResponses.length>0}]),{label:t.notifications+(unread>0?` (${unread})`:""),action:()=>push({type:"notifications"}),icon:"🔔",bold:unread>0},{label:t.settings,action:()=>push({type:"settings"}),icon:"⚙️"},{label:lang==="ru"?"Документы":"Документтер",action:()=>push({type:"docs"}),icon:"📄"},...(isOwner?[{label:lang==="ru"?"🔄 Сменить режим":"🔄 Режимди алмаштыруу",action:switchToAdminRole,icon:"🔄",bold:true}]:[]),{label:t.logout,action:onLogout,icon:"🚪",danger:true}];
  return (
    <div className="tc" style={{padding:"14px 14px 24px",overflowY:"auto"}}>
      <div className="fe" style={{background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:16,padding:"16px",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
          <Avatar user={currentUser} size={60} fontSize={20}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><p style={{margin:0,fontSize:16,fontWeight:700,color:"var(--color-text-primary,#111)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.name}</p><button onClick={()=>push({type:"editProfile"})} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#185FA5",padding:"0 2px",flexShrink:0}}>✏️</button></div>
            <p style={{margin:"0 0 4px",fontSize:14,color:"var(--color-text-secondary,#888)"}}>{currentUser.phone}</p>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:12,background:"var(--color-background-secondary,#f4f4f4)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)"}}><span style={{fontSize:12}}>{roleIcon}</span><span style={{fontSize:11,color:"var(--color-text-secondary,#888)",fontWeight:500}}>{roleLabel}</span></div>
              {rating&&(<div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:12,background:"#FFF8E6",border:"0.5px solid #F0C040"}}><Stars r={rating.avg} size={12}/><span style={{fontSize:11,color:"#7A5C00",fontWeight:600}}>{rating.avg}</span><span style={{fontSize:10,color:"#B07A00"}}>({rating.count})</span></div>)}
            </div>
          </div>
        </div>
        {currentUser.about&&<p style={{margin:"0 0 10px",fontSize:15,color:"var(--color-text-primary,#111)",lineHeight:1.6}}>{currentUser.about}</p>}
        {isExecutor&&skillsList.length>0&&(<div style={{marginBottom:8}}><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{skillsList.map(s=><span key={s} style={{padding:"4px 12px",borderRadius:20,background:"#E6F1FB",color:"#185FA5",fontSize:13,fontWeight:500}}>{s}</span>)}</div></div>)}
        {isExecutor&&currentUser.experience&&<p style={{margin:"0 0 8px",fontSize:14,color:"var(--color-text-secondary,#888)",fontStyle:"italic"}}>{currentUser.experience}</p>}
        <button onClick={()=>push({type:"editProfile"})} className="rb" style={{width:"100%",marginTop:4,padding:"9px",borderRadius:10,border:"0.5px solid #185FA5",background:"#E6F1FB",cursor:"pointer",fontSize:12,color:"#185FA5",fontWeight:600}}>✏️ {t.editProfile}</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {statItems.map(([k,v],i)=>(<div key={k} className="fe" style={{animationDelay:`${i*0.05}s`,background:"var(--color-background-secondary,#f4f4f4)",borderRadius:11,padding:"13px 8px",textAlign:"center"}}><div style={{fontSize:19,fontWeight:700,color:"var(--color-text-primary,#111)",marginBottom:3}}>{v}</div><div style={{fontSize:12,color:"var(--color-text-secondary,#888)"}}>{k}</div></div>))}
      </div>
      {completedWithPendingReviews.length>0&&(
        <div className="fe" style={{background:"#FFF8E6",border:"0.5px solid #F0C040",borderRadius:14,padding:"12px 14px",marginBottom:12}}>
          <p style={{margin:"0 0 8px",fontSize:12,fontWeight:700,color:"#7A5C00"}}>⭐ {lang==="ru"?"Оставьте отзывы исполнителям:":"Аткаруучуларга пикир калтырыңыз:"}</p>
          {completedWithPendingReviews.slice(0,3).map(tk=>{const cr=responses.find(r=>r.taskId===tk.id&&r.status==="chosen");if(!cr)return null;const title=lang==="ru"?tk.ru:tk.ky;return(<button key={tk.id} className="rb" onClick={()=>push({type:"leaveReview",taskId:tk.id,targetId:cr.executorId,taskTitle:title})} style={{width:"100%",padding:"8px 12px",borderRadius:10,border:"0.5px solid #F0C040",background:"#fff",cursor:"pointer",fontSize:12,color:"#7A5C00",fontWeight:500,textAlign:"left",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,paddingRight:8}}>📋 {title}</span><span style={{flexShrink:0,color:"#BA7517"}}>★ →</span></button>);})}
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,justifyContent:"flex-end"}}>
        <span style={{fontSize:11,color:"var(--color-text-secondary,#888)"}}>{t.language}:</span>
        {LANGS.map(l=>(<button key={l.id} className="pb" onClick={()=>setLang(l.id)} style={{padding:"3px 10px",borderRadius:6,border:"0.5px solid",cursor:"pointer",fontSize:11,fontWeight:lang===l.id?700:400,borderColor:lang===l.id?"#185FA5":"var(--color-border-tertiary,#e0e0e0)",background:lang===l.id?"#185FA5":"transparent",color:lang===l.id?"#fff":"var(--color-text-secondary,#888)"}}>{l.label}</button>))}
      </div>
      <div style={{background:"var(--color-background-primary,#fff)",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",borderRadius:14,overflow:"hidden"}}>
        {menuItems.map((item,i,arr)=>(<div key={item.label} onClick={item.action} style={{display:"flex",alignItems:"center",gap:12,padding:"15px 14px",borderBottom:i<arr.length-1?"0.5px solid var(--color-border-tertiary,#e0e0e0)":"none",cursor:item.action?"pointer":"default",transition:"opacity 0.12s"}} onMouseEnter={e=>item.action&&(e.currentTarget.style.opacity="0.6")} onMouseLeave={e=>(e.currentTarget.style.opacity="1")}><span style={{fontSize:18,width:24,textAlign:"center"}}>{item.icon}</span><span style={{flex:1,fontSize:16,color:item.danger?"#A32D2D":"var(--color-text-primary,#111)",fontWeight:item.bold?600:400}}>{item.label}</span>{!item.danger&&<span style={{color:"var(--color-text-secondary,#888)",fontSize:19}}>›</span>}</div>))}
      </div>
    </div>
  );
}

function TabTasks() {
  const { lang, t, tasks, responses, push, currentUser, settings, usersDB } = useApp();
  const getUserById = (uid) => {
    if (!uid) return null;
    if (uid===currentUser?.id) return currentUser;
    if (uid===MOCK_OWNER_ID) return MOCK_OWNER;
    if (uid===DEMO_EXEC_ID) return DEMO_EXECUTOR;
    return usersDB[Object.keys(usersDB).find(k=>usersDB[k].id===uid)] || {id:uid,name:uid.slice(0,8)};
  };
  const [search,setSearch]=useState("");const [city,setCity]=useState(null);const [catId,setCatId]=useState(null);const [sort,setSort]=useState("new");const [lk,setLk]=useState(0);const [cityPickerOpen,setCityPickerOpen]=useState(false);
  const rekey=fn=>{fn();setLk(k=>k+1);};
  const openCityPicker=()=>setCityPickerOpen(true);
  const SORTS=[{id:"new",l:t.sortNew},{id:"asc",l:t.sortCheap},{id:"desc",l:t.sortExpensive},{id:"dist",l:t.sortNear}];
  const statusColor={open:"#0F6E56",closed_by_choice:"#A32D2D",closed_expired:"#888",completed:"#185FA5"};
  const statusLabel={open:t.statusOpen,closed_by_choice:t.statusClosed,closed_expired:t.statusExpired,completed:t.statusCompleted};
  const isCustomer=currentUser.role==="customer";
  let list=tasks.filter(tk=>tk.status!=="cancelled"&&(isCustomer?(tk.status==="open"||(tk.ownerId===currentUser.id&&tk.status!=="completed")):(tk.status==="open"||(tk.status!=="completed"&&responses.some(r=>r.taskId===tk.id&&r.executorId===currentUser.id)))));
  if (!isCustomer&&settings.myCategories.length>0) list=list.filter(tk=>settings.myCategories.includes(tk.cat));
  if (search.trim()){const q=search.toLowerCase();list=list.filter(tk=>tk.ru.toLowerCase().includes(q)||tk.ky.toLowerCase().includes(q)||CATS[tk.cat][lang].toLowerCase().includes(q));}
  if (city) list=list.filter(tk=>tk.city===city);
  if (catId!==null) list=list.filter(tk=>tk.cat===catId);
  list.sort((a,b)=>sort==="asc"?a.price-b.price:sort==="desc"?b.price-a.price:sort==="dist"?(a.dist??999)-(b.dist??999):(b.createdAt||b.id)-(a.createdAt||a.id));
  return (
    <div style={{position:"relative",height:"100%",display:"flex",flexDirection:"column"}}>
      {cityPickerOpen&&(
        <div style={{position:"absolute",inset:0,zIndex:300,display:"flex",flexDirection:"column",background:"var(--color-background-primary,#fff)"}}>
          <CityPickerScreen currentCity={city} onSelect={id=>{setCity(id);setLk(k=>k+1);setCityPickerOpen(false);}} onClose={()=>setCityPickerOpen(false)}/>
        </div>
      )}
      <TopBar search={search} setSearch={v=>{setSearch(v);setLk(k=>k+1);}} city={city} setCity={v=>{setCity(v);setLk(k=>k+1);}} onCityPress={openCityPicker}/>
      <div style={{padding:"6px 12px 0",background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",flexShrink:0}}>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,paddingTop:4}}>
          <button className="pb" onClick={()=>rekey(()=>setCatId(null))} style={{flexShrink:0,width:catId===null?68:44,overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer",padding:0,transition:"width 0.3s ease,opacity 0.3s ease",opacity:1}}>
            <div style={{width:44,height:44,borderRadius:12,background:catId===null?"linear-gradient(145deg,#2478c8,#185FA5)":"linear-gradient(145deg,#5a9ad4,#378ADD)",boxShadow:catId===null?"0 5px 0 #0a3a6a,0 8px 16px rgba(24,95,165,0.4)":"0 5px 0 #1a5490,0 8px 12px rgba(55,138,221,0.3)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s ease",flexShrink:0}}>
              <i className="ti ti-layout-grid" style={{fontSize:22,color:"#fff"}}/>
            </div>
            <span style={{fontSize:11,fontWeight:600,color:catId===null?"#0C447C":"#378ADD",whiteSpace:"normal",textAlign:"center",lineHeight:1.2}}>{t.allCats}</span>
          </button>
          {CATS.map(c=>{
            const isSelected=catId===c.id;
            const isHidden=catId!==null&&!isSelected;
            return(
            <button key={c.id} className="pb" onClick={()=>rekey(()=>setCatId(c.id))} style={{flexShrink:0,width:isHidden?0:68,overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer",padding:0,transition:"width 0.35s ease,opacity 0.35s ease",opacity:isHidden?0:1}}>
              <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(145deg,${c.light},${c.color})`,boxShadow:`0 5px 0 ${c.shadow},0 8px 16px ${c.color}66`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"transform 0.1s ease",transform:isSelected?"translateY(3px)":"translateY(0)"}}>
                <i className={`ti ${c.ti}`} style={{fontSize:22,color:"#fff"}}/>
              </div>
              <span style={{fontSize:11,fontWeight:600,color:c.color,whiteSpace:"normal",textAlign:"center",lineHeight:1.2,maxWidth:60}}>{c[lang]}</span>
            </button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:5,paddingBottom:6}}>
          {SORTS.map(s=><button key={s.id} className="pb btn3d" onClick={()=>rekey(()=>setSort(s.id))} style={{flexShrink:0,padding:"3px 10px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,background:sort===s.id?"linear-gradient(145deg,#2478c8,#185FA5)":"linear-gradient(145deg,#f0f0f0,#e0e0e0)",color:sort===s.id?"#fff":"var(--color-text-secondary,#888)",fontWeight:sort===s.id?600:400,boxShadow:sort===s.id?"0 3px 0 #0a3a6a,0 5px 10px rgba(24,95,165,0.3)":"0 3px 0 #bbb,0 5px 8px rgba(0,0,0,0.1)"}}>{s.l}</button>)}
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
                <span>{locIcon(loc?.t||"city")} {loc?locName(loc,lang):"—"}</span><span>🕐 {fmtDate(task.time)}</span>
                <span style={{marginLeft:"auto",fontSize:10,fontWeight:600,color:task.status==="closed_by_choice"?"#fff":sc,padding:"2px 7px",borderRadius:12,background:task.status==="closed_by_choice"?"#A32D2D":sc+"18"}}>{statusLabel[task.status]}</span>
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
  const DRAFT_KEY="ishtap_create_draft";
  const savedDraft=useMemo(()=>{try{const d=sessionStorage.getItem(DRAFT_KEY);return d?JSON.parse(d):null;}catch{return null;}},[]);
  const [step,setStep]=useState(savedDraft?.step||1);
  const [form,setForm]=useState(savedDraft?.form||{title:"",cat:0,price:"",loc:"bishkek",desc:"",urgent:false});
  const [catPicked,setCatPicked]=useState(savedDraft?.catPicked||false);
  const [locSearch,setLocSearch]=useState(savedDraft?.locSearch||"Бишкек");
  const [locOpen,setLocOpen]=useState(false);
  const [photos,setPhotos]=useState(savedDraft?.photos||[]);
  const [err1,setErr1]=useState({});
  const fmtPhone=raw=>{let d=raw.replace(/\D/g,"");if(d.startsWith("996"))d=d.slice(3);if(d.startsWith("0"))d=d.slice(1);d=d.slice(0,9);let o="+996";if(d.length>0)o+=" "+d.slice(0,3);if(d.length>3)o+=" "+d.slice(3,5);if(d.length>5)o+=" "+d.slice(5,7);if(d.length>7)o+=" "+d.slice(7,9);return o;};
  const [form2,setForm2]=useState(savedDraft?.form2||{address:"",startDate:"",startTime:"",period:"",periodCustom:"",phone:"+996 "});
  const [err2,setErr2]=useState({});
  const [periodMode,setPeriodMode]=useState(savedDraft?.periodMode||"select");
  const fileRef=useRef<any>(),camRef=useRef<any>();
  const saveDraft=useCallback(()=>{try{sessionStorage.setItem(DRAFT_KEY,JSON.stringify({step,form,form2,photos,catPicked,locSearch,periodMode}));}catch{}},
    [step,form,form2,photos,catPicked,locSearch,periodMode]);
  useEffect(()=>{return()=>{sessionStorage.removeItem(DRAFT_KEY);};},[]);
  const set1=(k,v)=>{setForm(f=>({...f,[k]:v}));setErr1(e=>({...e,[k]:false}));};
  const set2=(k,v)=>{setForm2(f=>({...f,[k]:v}));setErr2(e=>({...e,[k]:false}));};
  const groups={};CITIES.forEach(c=>{const g=lang==="ru"?c.g_ru:c.g_ky;if(!groups[g])groups[g]=[];groups[g].push(c);});
  const addFiles=(files:FileList|null)=>{
    if(!files||files.length===0)return;
    Array.from(files).slice(0,3).forEach(f=>{
      const r=new FileReader();
      r.onload=ev=>{
        const src=ev.target?.result as string;
        if(!src)return;
        const img=new Image();
        img.onload=()=>{
          const MAX=1024;
          let w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
          if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
          const c=document.createElement("canvas");
          c.width=w;c.height=h;
          const ctx=c.getContext("2d");
          if(!ctx)return;
          ctx.drawImage(img,0,0,w,h);
          const url=c.toDataURL("image/jpeg",0.7);
          c.width=0;c.height=0;
          setPhotos(p=>[...p,{url,name:f.name}].slice(0,3));
        };
        img.src=src;
      };
      r.readAsDataURL(f);
    });
  };
  const removePhoto=idx=>setPhotos(p=>p.filter((_,i)=>i!==idx));
  const v1=()=>{const e={};if(!form.title.trim())e.title=true;if(!form.price)e.price=true;setErr1(e);return!Object.keys(e).length;};
  const v2=()=>{const e={};if(!form2.address.trim())e.address=true;    if(!/^\+996\d{9}$/.test(form2.phone.replace(/\s/g,"")))e.phone=true;setErr2(e);return!Object.keys(e).length;};
  const goToPayment=()=>{
    if (!v2()) return;
    const sl=form2.startDate?(fmtDate(form2.startDate)+(form2.startTime?" "+form2.startTime:"")):(lang==="ru"?"Сегодня":"Бүгүн");
    const periodStr=periodMode==="custom"?form2.periodCustom:form2.period;
    const _now=Date.now();
    const periodDays=(p=>{
      if(!p)return 7;
      const l=p.toLowerCase();
      if(l.includes("один день")||l.includes("бир күн"))return 1;
      if(l.includes("два дня")||l.includes("эки күн"))return 2;
      if(l.includes("три дня")||l.includes("үч күн"))return 3;
      if(l.includes("конца недели")||l.includes("жума"))return 7;
      if(l.includes("конца месяца")||l.includes("ай бүтүш"))return 30;
      const m=l.match(/(\d+)/);if(m)return parseInt(m[1]);
      return 7;
    })(periodStr);
    const nt={id:_now,createdAt:_now,cat:form.cat,price:Number(form.price)||0,city:form.loc,time:sl,period:periodStr||"",urgent:form.urgent,dist:cityDist(form.loc,_userLat,_userLng),ru:form.title,ky:form.title,dRu:(form.desc||"Подробности уточняются.")+" Адрес: "+form2.address,dKy:(form.desc||"Чоо-жайы такталат.")+" Дарек: "+form2.address,photos:photos.map(p=>p.url),ownerId:currentUser.id,status:"open",reactivation_count:0,chosen_executor_id:null,expires_at:_now+periodDays*86400000,completed:false};
    setTasks(ts=>[nt,...ts]);
    addNotification(currentUser.id, lang==="ru"?`✅ Задание «${form.title}» опубликовано`:`✅ «${form.title}» жарыяланды`);
    reset();
    switchTab("tasks");
  };
  const reset=()=>{setStep(1);setForm({title:"",cat:0,price:"",loc:"bishkek",desc:"",urgent:false});setCatPicked(false);setLocSearch("Бишкек");setLocOpen(false);setForm2({address:"",startDate:"",startTime:"",period:"",periodCustom:"",phone:"+996 "});setPhotos([]);setErr1({});setErr2({});setPeriodMode("select");};
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
        <div className="fe" style={{marginBottom:14}}>
          <p style={{margin:"0 0 7px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>🗓 {t.fStartDate}</p>
          <input type="date" lang={lang==="ky"?"ky-KG":"ru-RU"} value={form2.startDate} onChange={e=>set2("startDate",e.target.value)} style={{width:"100%",marginBottom:10,colorScheme:"light"}}/>
          <p style={{margin:"0 0 8px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>🕐 {lang==="ru"?"Время":"Убакыт"}</p>
          {(()=>{
            const MINS=[0,5,10,15,20,25,30,35,40,45,50,55];
            const tH=form2.startTime?parseInt(form2.startTime.split(":")[0]):10;
            const tM=form2.startTime?parseInt(form2.startTime.split(":")[1]):0;
            const mIdx=MINS.indexOf(tM)>=0?MINS.indexOf(tM):0;
            const setH=h=>set2("startTime",`${String(h).padStart(2,"0")}:${String(tM).padStart(2,"0")}`);
            const setM=m=>set2("startTime",`${String(tH).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
            const drum=(items,selIdx,onUp,onDown)=>(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:58,border:"1.5px solid var(--color-border-secondary,#ccc)",borderRadius:12,overflow:"hidden",background:"var(--color-background-primary,#fff)"}}>
                <button onClick={onUp} style={{width:"100%",padding:"5px 0",background:"none",border:"none",borderBottom:"0.5px solid var(--color-border-tertiary,#eee)",cursor:"pointer",fontSize:13,color:"var(--color-text-secondary,#888)"}}>▲</button>
                <div style={{padding:"3px 0",fontSize:10,color:"var(--color-text-secondary,#888)",opacity:0.5,textAlign:"center"}}>{items[(selIdx-1+items.length)%items.length]}</div>
                <div style={{padding:"6px 0",fontSize:20,fontWeight:700,color:"#185FA5",textAlign:"center",background:"#E6F1FB",width:"100%"}}>{items[selIdx]}</div>
                <div style={{padding:"3px 0",fontSize:10,color:"var(--color-text-secondary,#888)",opacity:0.5,textAlign:"center"}}>{items[(selIdx+1)%items.length]}</div>
                <button onClick={onDown} style={{width:"100%",padding:"5px 0",background:"none",border:"none",borderTop:"0.5px solid var(--color-border-tertiary,#eee)",cursor:"pointer",fontSize:13,color:"var(--color-text-secondary,#888)"}}>▼</button>
              </div>
            );
            const hours=Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));
            const mins=MINS.map(m=>String(m).padStart(2,"0"));
            return (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16}}>
                {drum(hours,tH,()=>setH((tH+23)%24),()=>setH((tH+1)%24))}
                <span style={{fontSize:28,fontWeight:700,color:"var(--color-text-primary,#111)",marginBottom:4}}>:</span>
                {drum(mins,mIdx,()=>setM(MINS[(mIdx-1+MINS.length)%MINS.length]),()=>setM(MINS[(mIdx+1)%MINS.length]))}
              </div>
            );
          })()}
        </div>
        <div className="fe" style={{marginBottom:14}}><p style={{margin:"0 0 7px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>⏳ {t.fPeriod}</p>{periodMode==="select"?<select value={form2.period} onChange={e=>{if(e.target.value===periodOptions[periodOptions.length-1]){setPeriodMode("custom");set2("period","");}else set2("period",e.target.value);}} style={{width:"100%",colorScheme:"light"}}><option value="">{t.periodPlaceholder}</option>{periodOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>:<div style={{display:"flex",gap:8}}><input autoFocus type="text" value={form2.periodCustom} onChange={e=>set2("periodCustom",e.target.value)} placeholder={lang==="ru"?"Например: до 20 июля":"Мисалы: 20-июлга чейин"} style={{flex:1}}/><button onClick={()=>{setPeriodMode("select");set2("periodCustom","");}} style={{padding:"0 10px",borderRadius:9,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"var(--color-background-secondary,#f4f4f4)",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary,#888)",flexShrink:0}}>✕</button></div>}</div>
        <div className="fe" style={{marginBottom:24}}><p style={{margin:"0 0 5px",fontSize:12,fontWeight:err2.phone?600:400,color:err2.phone?"#A32D2D":"var(--color-text-secondary,#888)"}}>📞 {t.fPhone}{err2.phone?t.errPhone:""}</p>          <input type="tel" value={form2.phone} onChange={e=>set2("phone",fmtPhone(e.target.value))} placeholder={t.phPhone} className={err2.phone?"err-input":""} style={{width:"100%"}}/></div>
        <p style={{margin:"0 0 10px",fontSize:10,color:"#aaa",textAlign:"center",lineHeight:1.5,padding:"0 4px"}}>
          {lang==="ru"
            ?"Запрещается размещать задания, связанные с незаконной деятельностью, оружием, наркотиками или нарушением прав третьих лиц."
            :"Мыйзамсыз иш-аракеттерге, куралдарга, баңгизаттарга же үчүнчү жактардын укуктарын бузууга байланыштуу тапшырмаларды жайгаштырууга тыйуу салынат."
          }
        </p>
        <button className="rb btn3d" onClick={goToPayment} style={{width:"100%",padding:14,borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(145deg,#2478c8,#185FA5)",color:"#fff",fontSize:15,fontWeight:700,marginBottom:16,boxShadow:"0 5px 0 #0a3a6a,0 8px 16px rgba(24,95,165,0.4)"}}>{lang==="ru"?"Опубликовать":"Жарыялоо"}</button>
      </div>
    </div>
  );
  const selCat=CATS[form.cat];
  const catPicker=catPicked
    ?(<div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:12,background:selCat.bg,border:`1.5px solid ${selCat.color}`,flex:1}}>
          <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(145deg,${selCat.light},${selCat.color})`,boxShadow:`0 3px 0 ${selCat.shadow}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <i className={`ti ${selCat.ti}`} style={{fontSize:16,color:"#fff"}}/>
          </div>
          <span style={{fontSize:13,fontWeight:600,color:selCat.color}}>{selCat[lang]}</span>
        </div>
        <button onClick={()=>setCatPicked(false)} style={{padding:"8px 12px",borderRadius:12,border:"0.5px solid var(--color-border-secondary,#ccc)",background:"var(--color-background-secondary,#f4f4f4)",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary,#888)",flexShrink:0,whiteSpace:"nowrap"}}>{lang==="ru"?"Сменить":"Өзгөртүү"}</button>
      </div>)
    :(<div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,paddingTop:2}}>{CATS.map(c=>{
        const isSel=form.cat===c.id;
        return(<button key={c.id} className="pb btn3d" onClick={()=>{set1("cat",c.id);setCatPicked(true);}} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",padding:0}}>
          <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(145deg,${c.light},${c.color})`,boxShadow:`0 5px 0 ${c.shadow},0 8px 16px ${c.color}66`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <i className={`ti ${c.ti}`} style={{fontSize:22,color:"#fff"}}/>
          </div>
          <span style={{fontSize:10,fontWeight:600,color:c.color,whiteSpace:"normal",textAlign:"center",maxWidth:56,lineHeight:1.2}}>{c[lang]}</span>
        </button>);
      })}</div>);
  const locResults=locSearch.trim().length>0?CITIES.filter(c=>locName(c,lang).toLowerCase().includes(locSearch.toLowerCase())||locName(c,lang==="ru"?"ky":"ru").toLowerCase().includes(locSearch.toLowerCase())).slice(0,30):[];
  const selLoc=CITIES.find(c=>c.id===form.loc);
  const displayList=locSearch.trim().length>0?locResults:CITIES.slice(0,40);
  const locPicker=(
    <div>
      <div style={{position:"relative"}}>
        <input
          value={locSearch}
          onChange={e=>{setLocSearch(e.target.value);setLocOpen(true);}}
          onFocus={()=>setLocOpen(true)}
          placeholder={lang==="ru"?"Введите название населённого пункта...":"Айыл/шаардын атын жазыңыз..."}
          style={{width:"100%",paddingRight:32}}
        />
        {locSearch.length>0&&<button onClick={()=>{setLocSearch("");setLocOpen(false);}} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:"var(--color-text-secondary,#888)",padding:0,lineHeight:1}}>✕</button>}
      </div>
      {selLoc&&!locOpen&&<div style={{marginTop:6,display:"flex",alignItems:"center",gap:6,padding:"7px 10px",borderRadius:10,background:"#E6F1FB",border:"0.5px solid #185FA5"}}>
        <span style={{fontSize:13}}>📍</span>
        <span style={{fontSize:13,fontWeight:600,color:"#185FA5"}}>{locName(selLoc,lang)}</span>
        <span style={{fontSize:11,color:"#185FA5",opacity:0.7,marginLeft:2}}>{selLoc.g_ru}</span>
      </div>}
      {locOpen&&<div style={{marginTop:4,border:"0.5px solid var(--color-border-secondary,#ccc)",borderRadius:12,overflow:"hidden",background:"var(--color-background-primary,#fff)"}}>
        {locSearch.trim().length>0&&locResults.length===0&&(
          <div style={{padding:"14px",fontSize:13,color:"var(--color-text-secondary,#888)",textAlign:"center"}}>{lang==="ru"?"Населённый пункт не найден":"Айыл/шаар табылган жок"}</div>
        )}
        {displayList.map(c=>(
          <button key={c.id} onClick={()=>{set1("loc",c.id);setLocSearch(locName(c,lang));setLocOpen(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",background:form.loc===c.id?"#E6F1FB":"none",border:"none",borderBottom:"0.5px solid var(--color-border-tertiary,#eee)",cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:14,flexShrink:0}}>{locIcon(c.t)}</span>
            <span style={{fontSize:13,color:form.loc===c.id?"#185FA5":"var(--color-text-primary,#111)",fontWeight:form.loc===c.id?600:400,flex:1,minWidth:0}}>{locName(c,lang)}</span>
            <span style={{fontSize:10,color:"var(--color-text-secondary,#888)",flexShrink:0,marginLeft:4}}>{c.g_ru}</span>
          </button>
        ))}
      </div>}
    </div>
  );
  const fields=[[t.fTitle,<input placeholder={t.phTitle} value={form.title} onChange={e=>set1("title",e.target.value)} className={err1.title?"err-input":""} style={{width:"100%"}}/>,"title"],[t.fCat,catPicker,null],[t.fLoc,locPicker,null],[t.fBudget,<input type="number" placeholder="1500" value={form.price} onChange={e=>set1("price",e.target.value)} className={err1.price?"err-input":""} style={{width:"100%"}}/>,"price"],[t.fDesc,<textarea placeholder={t.phDesc} value={form.desc} onChange={e=>set1("desc",e.target.value)} rows={3} style={{width:"100%",resize:"none"}}/>,null]];
  return (
    <div className="tc" style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <StepBar step={1} lang={lang} t={t}/>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px 16px"}}>
        <p style={{margin:"0 0 14px",fontSize:17,fontWeight:600,color:"var(--color-text-primary,#111)"}}>{t.newTask}</p>
        {fields.map(([lbl,inp,ek],i)=>(<div key={i} className="fe" style={{marginBottom:12,animationDelay:`${i*0.04}s`}}><p style={{margin:"0 0 5px",fontSize:12,color:ek&&err1[ek]?"#A32D2D":"var(--color-text-secondary,#888)",fontWeight:ek&&err1[ek]?600:400}}>{lbl}{ek&&err1[ek]?t.errRequired:""}</p>{inp}</div>))}
        <div className="fe" style={{marginBottom:20}}>
          <p style={{margin:"0 0 8px",fontSize:12,color:"var(--color-text-secondary,#888)"}}>{lang==="ru"?"Фото (до 3)":"Сүрөт (3гө чейин)"}</p>
          {photos.length>0&&(<div>
            <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
              {photos.map((ph,i)=>(<div key={i} style={{position:"relative",width:80,height:80,borderRadius:10,overflow:"hidden",border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",flexShrink:0}}>
                <img src={ph.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <button onClick={()=>removePhoto(i)} style={{position:"absolute",top:3,right:3,width:20,height:20,borderRadius:10,background:"rgba(0,0,0,0.65)",border:"none",cursor:"pointer",color:"#fff",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",padding:0,fontWeight:700}}>✕</button>
              </div>))}
              {photos.length<3&&(<button onClick={()=>fileRef.current.click()} style={{width:80,height:80,borderRadius:10,border:"1.5px dashed #185FA5",background:"#E6F1FB",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,flexShrink:0}}><span style={{fontSize:18,color:"#185FA5"}}>＋</span><span style={{fontSize:9,color:"#185FA5",fontWeight:600}}>{lang==="ru"?"Добавить":"Кошуу"}</span></button>)}
            </div>
            <button onClick={()=>setPhotos([])} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#A32D2D",padding:0,textDecoration:"underline"}}>
              {lang==="ru"?"Очистить все фотографии":"Бардык сүрөттөрдү тазалоо"}
            </button>
          </div>)}
          {photos.length===0&&(<button onClick={()=>fileRef.current.click()} className="pb" style={{width:130,height:130,background:"var(--color-background-secondary,#f4f4f4)",border:"none",borderRadius:12,padding:"4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0}}>
            <img src="/иконка Галерея.png" alt="gallery" style={{width:110,height:110,objectFit:"contain",filter:"saturate(2) brightness(1.05)",mixBlendMode:"multiply",background:"var(--color-background-tertiary,#f0f0f0)",borderRadius:8}}/>
            <div style={{background:"#2E7D32",color:"#fff",fontSize:11,fontWeight:500,padding:"3px 12px",borderRadius:20,marginTop:-8}}>+ {lang==="ru"?"Добавить фото":"Сүрөт кошуу"}</div>
          </button>)}
          {photos.length>0&&photos.length<3&&(<button onClick={()=>fileRef.current.click()} className="pb" style={{width:"100%",padding:"7px",borderRadius:9,border:"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:"var(--color-background-secondary,#f4f4f4)",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary,#888)"}}>{t.gallery}</button>)}
          <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{addFiles(e.target.files);e.target.value="";}}/>
          <p style={{margin:"5px 0 0",fontSize:10,color:"var(--color-text-secondary,#888)"}}>{t.photosUploaded} {photos.length} {t.photosOf} 3</p>
        </div>
        <button className="rb btn3d" onClick={()=>{if(v1())setStep(2);}} style={{width:"100%",padding:14,borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(145deg,#2478c8,#185FA5)",color:"#fff",fontSize:15,fontWeight:700,boxShadow:"0 5px 0 #0a3a6a,0 8px 16px rgba(24,95,165,0.4)"}}>{t.nextStep}</button>
      </div>
    </div>
  );
}

function AdminScreen({ standalone=false }:{ standalone?:boolean }) {
  const { lang, pop, onLogout, currentUser, setCurrentUser } = useApp();

  const switchRole = (role:"admin"|"customer"|"executor") => {
    const u = {...currentUser, role};
    setCurrentUser(u);
    saveUser(u);
    if(u.id) fbSaveUser(u.id, u);
  };
  const [stats,setStats]   = useState(null);
  const [loading,setLoading] = useState(true);
  const [err,setErr]       = useState("");
  useEffect(()=>{
    fbGetAdminStats().then(s=>{
      if(s)setStats(s);else setErr(lang==="ru"?"Ошибка загрузки":"Жүктөө катасы");
      setLoading(false);
    });
  },[]);
  const rows = stats ? [
    {icon:"👥", label:lang==="ru"?"Пользователи":"Колдонуучулар",      value:stats.users,         grad:"linear-gradient(135deg,#185FA5,#0D3B6E)"},
    {icon:"📋", label:lang==="ru"?"Всего заданий":"Жалпы тапшырмалар", value:stats.tasks,         grad:"linear-gradient(135deg,#7C3D99,#4A148C)"},
    {icon:"🟢", label:lang==="ru"?"Активных":"Активдүү",                value:stats.openTasks,     grad:"linear-gradient(135deg,#0F6E56,#064D3A)"},
    {icon:"🔵", label:lang==="ru"?"В работе":"Иштелүүдө",               value:stats.closedTasks,   grad:"linear-gradient(135deg,#1565C0,#0D3B6E)"},
    {icon:"✅", label:lang==="ru"?"Завершённых":"Аяктаган",             value:stats.completedTasks,grad:"linear-gradient(135deg,#2E7D32,#1B5E20)"},
    {icon:"💬", label:lang==="ru"?"Откликов":"Жооптор",                 value:stats.responses,     grad:"linear-gradient(135deg,#B05E0A,#7A3F05)"},
    {icon:"⭐", label:lang==="ru"?"Отзывов":"Пикирлер",                 value:stats.reviews,       grad:"linear-gradient(135deg,#A32D2D,#6D1F1F)"},
  ] : [];
  return (
    <div className="si" style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--color-background-tertiary,#f0f0f0)"}}>
      <div style={{background:"var(--color-background-primary,#fff)",borderBottom:"0.5px solid var(--color-border-tertiary,#e0e0e0)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 14px"}}>
          {standalone
            ? <div style={{minWidth:60}}/>
            : <button className="back-btn" onClick={pop}><span style={{fontSize:15}}>←</span><span>{lang==="ru"?"Назад":"Артка"}</span></button>
          }
          <p style={{margin:0,flex:1,fontSize:14,fontWeight:600,textAlign:"center",color:"var(--color-text-primary,#111)"}}>👑 {lang==="ru"?"Панель владельца":"Ээсинин панели"}</p>
          {standalone
            ? <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#A32D2D",fontWeight:600,minWidth:60,textAlign:"right"}}>{lang==="ru"?"Выйти":"Чыгуу"}</button>
            : <div style={{minWidth:60}}/>
          }
        </div>
        {standalone&&(
          <div style={{display:"flex",gap:6,padding:"0 14px 10px"}}>
            {([
              {role:"admin",    icon:"👑", label:lang==="ru"?"Админ":"Админ"},
              {role:"customer", icon:"🧑‍💼", label:lang==="ru"?"Заказчик":"Буйрутмачы"},
              {role:"executor", icon:"🔨", label:lang==="ru"?"Исполнитель":"Аткаруучу"},
            ] as const).map(r=>{
              const active=currentUser?.role===r.role;
              return (
                <button key={r.role} onClick={()=>switchRole(r.role)} style={{flex:1,padding:"7px 4px",borderRadius:10,border:active?"2px solid #185FA5":"0.5px solid var(--color-border-tertiary,#e0e0e0)",background:active?"#185FA5":"var(--color-background-secondary,#f4f4f4)",color:active?"#fff":"var(--color-text-secondary,#888)",fontSize:11,fontWeight:active?700:400,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <span style={{fontSize:16}}>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 14px 32px"}}>
        {loading&&<div style={{textAlign:"center",padding:"60px 0",color:"var(--color-text-secondary,#888)",fontSize:14}}>{lang==="ru"?"Загрузка...":"Жүктөлүүдө..."}</div>}
        {err&&<div style={{textAlign:"center",padding:"40px 0",color:"#A32D2D",fontSize:13}}>{err}</div>}
        {!loading&&!err&&(
          <>
            <div style={{background:"linear-gradient(135deg,#185FA5,#4A148C)",borderRadius:16,padding:"16px 18px",marginBottom:12,color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{margin:"0 0 2px",fontSize:11,opacity:0.75}}>Иштерман — Admin</p>
                <p style={{margin:0,fontSize:18,fontWeight:700}}>{lang==="ru"?"Статистика":"Статистика"}</p>
              </div>
              <p style={{margin:0,fontSize:11,opacity:0.65,textAlign:"right"}}>{new Date().toLocaleDateString(lang==="ru"?"ru-RU":"ky-KG",{day:"2-digit",month:"long",year:"numeric"})}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {rows.map((r,i)=>(
                <div key={i} style={{background:r.grad,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:22,flexShrink:0,width:32,textAlign:"center"}}>{r.icon}</div>
                  <div style={{flex:1,color:"rgba(255,255,255,0.75)",fontSize:13,fontWeight:500}}>{r.label}</div>
                  <div style={{fontSize:26,fontWeight:700,color:"#fff",minWidth:36,textAlign:"right"}}>{r.value}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PreLoginRoleScreen({ lang, onSelect, onBack }) {
  const roles=[
    {id:"customer", icon:"🧑‍💼", label:lang==="ru"?"Я заказчик":"Мен буйрутмачы",  sub:lang==="ru"?"Публикую задания":"Тапшырма жарыялайм",  grad:"linear-gradient(135deg,#185FA5,#0D3B6E)", border:"#185FA5"},
    {id:"executor", icon:"🔨",  label:lang==="ru"?"Я исполнитель":"Мен аткаруучу", sub:lang==="ru"?"Выполняю задания":"Тапшырма аткарам",   grad:"linear-gradient(135deg,#0F6E56,#064D3A)", border:"#0F6E56"},
  ];
  return (
    <div className="fi" style={{height:"100%",display:"flex",flexDirection:"column",background:"linear-gradient(160deg,#1A0533 0%,#2D0A4E 50%,#1A1A2E 100%)"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 20px 36px"}}>
        <img src="/новый логотип на кыргызском.png" alt="Иштерман" style={{width:80,height:80,objectFit:"contain",marginBottom:14,borderRadius:"50%"}}/>
        <p style={{fontSize:20,fontWeight:700,color:"#fff",margin:"0 0 4px",textAlign:"center"}}>Иштерман</p>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.55)",margin:"0 0 32px",textAlign:"center"}}>
          {lang==="ru"?"Кто вы?":"Сиз кимсиз?"}
        </p>
        <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:12}}>
          {roles.map(r=>(
            <button key={r.id} onClick={()=>onSelect(r.id)}
              style={{width:"100%",padding:"16px 20px",borderRadius:16,border:`1.5px solid ${r.border}`,background:r.grad,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:16,boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>
              <span style={{fontSize:30,flexShrink:0}}>{r.icon}</span>
              <div>
                <p style={{margin:"0 0 3px",fontSize:15,fontWeight:700,color:"#fff"}}>{r.label}</p>
                <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,0.65)"}}>{r.sub}</p>
              </div>
              <span style={{marginLeft:"auto",color:"rgba(255,255,255,0.5)",fontSize:18}}>›</span>
            </button>
          ))}
        </div>
        <button onClick={onBack} style={{marginTop:28,background:"none",border:"none",cursor:"pointer",fontSize:13,color:"rgba(255,255,255,0.4)",padding:"8px 0"}}>
          ← {lang==="ru"?"Назад":"Артка"}
        </button>
      </div>
    </div>
  );
}

const getTabsCfg = role => role==="executor"
  ? [{id:"tasks",icon:"🗂",img:"/задачи.PNG"},{id:"profile",icon:"👤",img:"/новая иконка Профиль.png"}]
  : role==="admin"
  ? [{id:"tasks",icon:"🗂",img:"/задачи.PNG"},{id:"profile",icon:"👑"}]
  : [{id:"tasks",icon:"🗂",img:"/задачи.PNG"},{id:"create",icon:"＋"},{id:"profile",icon:"👤",img:"/новая иконка Профиль.png"}];

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,setLang]         = useState("ru");
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

  // Начальная загрузка из localStorage
  useEffect(()=>{
    const db=loadUsersDB();setUsersDB(db);ensureDemoDB();
    const user=loadUser();
    if(user){
      setCurrentUser(user);
      const storedT=loadTasksDB();
      if(storedT){setTasks(storedT);}
      else{const initT=buildInitTasks();setTasks(initT);saveTasksDB(initT);saveRespDB([]);}
      const storedR=loadRespDB();
      if(storedR.length){setResponses(storedR);}else{setResponses([]);saveRespDB([]);}
      setReviews(loadReviewsDB());
      setAllNotifs(loadNotifsDB());
      if(!user.role)setAuthState("role");
      else setAuthState("app");
    } else {
      setAuthState("lang");
    }
  },[]);

  // Проверка истёкших заданий (каждую минуту)
  useEffect(()=>{
    if (authState!=="app") return;
    const check=()=>{
      const now=Date.now();
      setTasks(prev=>{
        const expired=prev.filter(tk=>tk.status==="open"&&(typeof tk.expires_at==="number"?tk.expires_at:new Date(tk.expires_at).getTime())<now);
        if (!expired.length) return prev;
        // side-effects вне updater — откладываем через setTimeout
        setTimeout(()=>{
          expired.forEach(tk=>{
            const title=lang==="ru"?tk.ru:tk.ky;
            addNotification(tk.ownerId, lang==="ru"?`⏰ Срок задания «${title}» истёк`:`⏰ «${title}» тапшырмасынын мөөнөтү өттү`);
            setResponses(rs=>{
              const updated=rs.map(r=>{
                if (r.taskId!==tk.id||r.status!=="pending") return r;
                setTimeout(()=>addNotification(r.executorId, lang==="ru"?`⏰ Задание «${title}» истекло, ваш отклик отменён`:`⏰ «${title}» мөөнөтү өттү, жообуңуз жокко чыгарылды`),0);
                return {...r,status:"declined"};
              });
              saveRespDB(updated);
              return updated;
            });
          });
        },0);
        return prev.map(tk=>tk.status==="open"&&(typeof tk.expires_at==="number"?tk.expires_at:new Date(tk.expires_at).getTime())<now?{...tk,status:"closed_expired"}:tk);
      });
    };
    check();const id=setInterval(check,60_000);return()=>clearInterval(id);
  },[authState,lang]);

  // Persist helpers (localStorage + Firestore background sync)
  const setTasksPersist    = useCallback(u=>setTasks(p=>{const n=typeof u==="function"?u(p):u;saveTasksDB(n);fbSyncTasks(n);return n;}),[]);
  const setRespPersist     = useCallback(u=>setResponses(p=>{const n=typeof u==="function"?u(p):u;saveRespDB(n);fbSyncResponses(n);return n;}),[]);
  const setReviewsPersist  = useCallback(u=>setReviews(p=>{const n=typeof u==="function"?u(p):u;saveReviewsDB(n);fbSyncReviews(n);return n;}),[]);
  const setAllNotifsPersist= useCallback(u=>setAllNotifs(p=>{const n=typeof u==="function"?u(p):u;saveNotifsDB(n);fbSyncNotifs(n);return n;}),[]);

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
    if(u.id)fbSaveUser(u.id,u);
    const db=loadUsersDB();
    const key=u.email||u.phone||u.id;
    if(key){db[key]=u;saveUsersDB(db);}
    setUsersDB({...db});
    setAuthState("app");
  },[currentUser]);

  const handleLogout = useCallback(()=>{
    clearUser();setCurrentUser(null);setNavStack([]);setTab("tasks");setTabKey(k=>k+1);
    setAllNotifs([]);setResponses([]);setReviews([]);setTasks([]);setAuthState("lang");
  },[]);

  const handleLogin = useCallback(user=>{
    setCurrentUser(user);saveUser(user);
    const db=loadUsersDB();setUsersDB(db);
    const stored=loadTasksDB();
    if(stored){setTasks(stored);}
    else{const initT=buildInitTasks();setTasks(initT);saveTasksDB(initT);saveRespDB([]);}
    setResponses(loadRespDB());
    setReviews(loadReviewsDB());
    setAllNotifs(loadNotifsDB());
    if(!user.role)setAuthState("role");
    else setAuthState("app");
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
      case "admin":         return <AdminScreen/>;
      case "docs":          return <DocsScreen/>;
      default: return null;
    }
  };

  if (authState===null) return (
    <div style={{maxWidth:390,margin:"0 auto",height:720,display:"flex",alignItems:"center",justifyContent:"center",background:"#fff",borderRadius:24,border:"0.5px solid #e0e0e0"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:52,marginBottom:10}}>🇰🇬</div><p style={{fontSize:20,fontWeight:700,color:"#F57C00",margin:0}}>Иштерман</p></div>
    </div>
  );
  const shell = (child:any) => <div style={{maxWidth:390,margin:"0 auto",position:"relative",background:"#f0f0f0",borderRadius:24,overflow:"hidden",height:720,display:"flex",flexDirection:"column",border:"0.5px solid #e0e0e0"}}><style>{css}</style>{child}</div>;
  if (authState==="lang")  return shell(<LangScreen onSelect={l=>{setLang(l);setAuthState("login");}}/>);
  if (authState==="login") return shell(<LoginScreen lang={lang} setLang={setLang} onLogin={handleLogin}/>);
  if (authState==="role")  return shell(<RoleScreen lang={lang} user={currentUser} onSelectRole={handleSelectRole}/>);

  const ctxValue={
    lang,t,setLang,
    tasks,setTasks:setTasksPersist,
    responses,setResponses:setRespPersist,
    reviews,setReviews:setReviewsPersist,
    notifications, clearNotifications, addNotification,
    push,pop,switchTab,
    currentUser,setCurrentUser,usersDB,setUsersDB,
    onLogout:handleLogout,
    switchToAdminRole:()=>{},
    settings,setSettings,
  };

  return (
    <Ctx.Provider value={ctxValue}>
      <style>{css}</style>
      <div className={settings.darkTheme?"dark-mode":""} style={{maxWidth:390,margin:"0 auto",position:"relative",background:settings.darkTheme?"#111113":"#f0f0f0",borderRadius:"clamp(0px,calc((100vw - 480px)*999),24px)",overflow:"hidden",height:"100dvh",maxHeight:"clamp(100dvh,100dvh,900px)",display:"flex",flexDirection:"column",border:`0.5px solid ${settings.darkTheme?"#38383A":"#e0e0e0"}`}}>
        <div style={{flex:1,overflow:"hidden",position:"relative",display:"flex",flexDirection:"column"}}>
          {currentNav
            ?<div style={{height:"100%",display:"flex",flexDirection:"column"}}>{renderNav(currentNav)}</div>
            :<div key={`${tab}-${tabKey}-${lang}`} style={{height:"100%",display:"flex",flexDirection:"column"}} className="tc">
              {tab==="tasks"&&<TabTasks/>}{tab==="create"&&<TabCreate/>}{tab==="profile"&&<TabProfile/>}
            </div>
          }
        </div>
        {!currentNav&&(
          <div style={{position:"relative",display:"flex",borderTop:"1px solid var(--color-border-tertiary,#e0e0e0)",boxShadow:"0 -4px 12px rgba(0,0,0,0.06)",background:"#fff",flexShrink:0,alignItems:"flex-end"}}>
            {TABS_CFG.map(tb=>{
              if(tb.id==="create") return (
                <button key={tb.id} className="nb" onClick={()=>switchTab(tb.id)} style={{flex:1,border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,paddingBottom:10,paddingTop:0,position:"relative"}}>
                  {tab==="tasks"
                    ?(<><div style={{width:52,height:52,borderRadius:"50%",background:"#00C244",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",top:-8,boxShadow:"0 3px 12px rgba(0,194,68,0.35)"}}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><line x1="14" y1="3" x2="14" y2="25" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><line x1="3" y1="14" x2="25" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                      </div>
                      <span style={{fontSize:10,fontWeight:400,color:"#888",marginTop:-4}}>{TAB_LABELS[tb.id]}</span></>)
                    :(<><span style={{fontSize:20,color:tab==="create"?"#EF9F27":"#85B7EB",marginTop:9}}>{tb.icon}</span>
                      <span style={{fontSize:10,fontWeight:tab==="create"?700:400,color:tab==="create"?"#EF9F27":"#85B7EB"}}>{TAB_LABELS[tb.id]}</span></>)
                  }
                </button>
              );
              {
                const isActive=tab===tb.id;
                const isTasksTab=tb.id==="tasks";
                const fullBg=isTasksTab?"linear-gradient(145deg,#8a35bf,#6A1B9A)":"linear-gradient(145deg,#2478c8,#185FA5)";
                const fullShadow=isTasksTab?"0 5px 0 #3d0e59,0 8px 16px rgba(106,27,154,0.45)":"0 5px 0 #0a3a6a,0 8px 16px rgba(24,95,165,0.45)";
                const bg=isActive?"linear-gradient(145deg,#c8dff7,#9fc5ee)":fullBg;
                const shadow=isActive?"0 5px 0 #6fa0cc,0 8px 14px rgba(130,180,235,0.35)":fullShadow;
                return (
                <button key={tb.id} className="nb btn3d" onClick={()=>switchTab(tb.id)} style={{flex:1,padding:"9px 0 11px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <div style={{width:44,height:44,borderRadius:12,background:bg,boxShadow:shadow,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"transform 0.1s ease"}}>
                    {isTasksTab
                      ?<i className="ti ti-briefcase" style={{fontSize:22,color:"#fff"}}/>
                      :<i className="ti ti-user" style={{fontSize:22,color:"#fff"}}/>
                    }
                  </div>
                  <span style={{fontSize:isTasksTab?11:10,fontWeight:isActive?700:400,color:isTasksTab&&isActive?"#8a35bf":isTasksTab?"#9fc5ee":isActive?"#185FA5":"#9fc5ee",transition:"color 0.15s"}}>{TAB_LABELS[tb.id]}</span>
                </button>
                );
              }
            })}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
