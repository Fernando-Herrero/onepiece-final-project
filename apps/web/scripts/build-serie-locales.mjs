/**
 * Genera public/locales/{es,en,ja}/serie.json desde apps/api/src/data/serie/*.json
 * Ejecutar tras cambios en apps/api/src/data/serie/:
 *   node apps/web/scripts/build-serie-locales.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '../../..');
const dataDir = join(repoRoot, 'apps/api/src/data/serie');
const localesDir = join(repoRoot, 'apps/web/public/locales');

const sagas = JSON.parse(readFileSync(join(dataDir, 'sagas.json'), 'utf8'));
const arcs = JSON.parse(readFileSync(join(dataDir, 'arcs.json'), 'utf8'));
const episodes = JSON.parse(readFileSync(join(dataDir, 'episodes.json'), 'utf8'));

const SAGA_NAMES = {
  es: {
    1: 'East Blue',
    2: 'Alabasta',
    3: 'Isla del cielo',
    4: 'Water 7',
    5: 'Thriller Bark',
    6: 'Guerra de la cumbre',
    7: 'Isla Gyojin',
    8: 'Dressrosa',
    9: 'Whole Cake Island',
    10: 'Wano',
  },
  en: Object.fromEntries(sagas.map(s => [s.id, s.name])),
  ja: Object.fromEntries(sagas.map(s => [s.id, s.titleJa])),
};

const esArcNames = {
  1: 'Romance Dawn',
  2: 'Orange Town',
  3: 'Syrup Village',
  4: 'Baratie',
  5: 'Arlong Park',
  6: 'Historia de Buggy (relleno)',
  7: 'Loguetown',
  8: 'Isla Warship (relleno)',
  9: 'Reverse Mountain / Laboon',
  10: 'Whisky Peak',
  11: 'Koby y Helmeppo (relleno)',
  12: 'Little Garden',
  13: 'Drum Island',
  14: 'Alabasta',
  15: 'Post-Alabasta',
  16: 'Isla Goat (relleno)',
  17: 'Isla Ruluka (relleno)',
  18: 'Jaya',
  19: 'Skypiea',
  20: 'G-8 (relleno)',
  21: 'Long Ring Long Land',
  22: "Ocean's Dream (relleno)",
  23: "Foxy's Return (relleno)",
  24: 'Water 7',
  25: 'Enies Lobby',
  26: 'Post-Enies Lobby',
  27: 'Ice Hunter (relleno)',
  28: 'Thriller Bark',
  29: 'Spa Island (relleno)',
  30: 'Sabaody Archipelago',
  31: 'Amazon Lily',
  32: 'Impel Down',
  33: 'Little East Blue (relleno)',
  34: 'Marineford',
  35: 'Post-guerra',
  36: 'Regreso a Sabaody',
  37: 'Isla Gyojin',
  38: "Ambición de Z (relleno)",
  39: 'Punk Hazard',
  40: 'Rescate de Caesar (relleno)',
  41: 'Dressrosa',
  42: 'Mina de plata (relleno)',
  43: 'Zou',
  44: 'Marine Rookie (relleno)',
  45: 'Whole Cake Island',
  46: 'Levely',
  47: 'Wano (parte 1)',
  48: 'Cidre Guild (relleno)',
  49: 'Wano (parte 2)',
  50: 'Pasado de Uta (relleno)',
  51: 'Wano (parte 3)',
};

const enArcDesc = {
  1: 'Luffy begins his journey, becomes a pirate, and forms the initial crew while facing their first challenges.',
  2: 'Luffy and Zoro arrive at Orange Town, meet Nami, and fight to free the town from Buggy the Clown.',
  3: 'The crew searches for a ship and meets Usopp while facing the Black Cat Pirates.',
  4: 'The group visits a floating restaurant seeking a cook; Sanji joins and conflict with Don Krieg erupts.',
  5: "Nami's past is revealed as they confront Arlong's rule over her homeland.",
  6: 'Side story showing Buggy and his crew with lighthearted and humorous moments.',
  7: 'Last stop before the Grand Line: Loguetown brings confrontations before the great voyage.',
  8: 'Filler arc where Luffy and his crew help a mysterious girl while facing pirates and hidden secrets.',
  9: 'The crew enters the Grand Line, faces the currents, and discovers Laboon, a giant whale with a mysterious bond.',
  10: 'The Straw Hats arrive at a festive town hiding dangerous secrets and unexpected enemies.',
  11: 'Short arc focused on Koby and Helmeppo, showing their development as marines.',
  12: 'The crew explores a prehistoric island with two warrior giants and enormous creatures.',
  13: 'The Straw Hats seek a doctor on a frozen island, facing illness and local mysteries.',
  14: 'Luffy and company help Vivi and the kingdom of Alabasta stop a war provoked by Crocodile.',
  15: 'The crew reflects on Alabasta and prepares for the next stage of the Grand Line.',
  16: 'Filler arc on a quiet island inhabited by goats with comic situations.',
  17: 'Filler following the Straw Hats on a mysterious island with peculiar inhabitants.',
  18: 'The crew reaches Jaya, discovering New World secrets and clues about ancient civilizations.',
  19: 'The Straw Hats ascend to the sky island, facing divine conflicts and ancestral trials.',
  20: 'Filler set in a heavily guarded marine base where the crew infiltrates and faces challenges.',
  21: 'The crew faces Foxy in a game of challenges and tricks testing wit and endurance.',
  22: 'Filler where the crew temporarily loses memory with comic adventures.',
  23: 'Filler showing Foxy’s return and a new showdown with the crew.',
  24: 'The crew arrives at Water 7, facing political tensions while seeking a new ship.',
  25: 'A bold rescue mission against the World Government; the crew faces powerful enemies.',
  26: 'After Enies Lobby, the crew recovers and prepares for the next stage.',
  27: 'Filler where the crew faces bounty hunters during their travels.',
  28: 'The Straw Hats reach a mysterious island of ghosts and zombies facing supernatural dangers.',
  29: 'Short filler where the crew visits a spa island with lighthearted situations.',
  30: 'Gateway to the New World: the Straw Hats face powerful forces and natural barriers.',
  31: 'Luffy reaches an island of warrior women while searching for Ace.',
  32: 'Luffy tries to infiltrate the most feared prison to save a loved one.',
  33: 'Filler where the crew recalls past adventures before reuniting for new challenges.',
  34: 'An epic battle between pirates, marines, and allies that changes the world.',
  35: 'The world after Marineford, with wounds, losses, and new directions for the crew.',
  36: 'After the time skip, the Straw Hats return to Sabaody to reunite and resume their journey.',
  37: 'Undersea exploration, forgotten cultures, and confrontations revealing deep truths.',
  38: 'Filler where the crew faces a mysterious villain while heading to the New World.',
  39: 'The crew reaches an island split between fire and ice, facing dangerous experiments.',
  40: 'Filler where the Straw Hats try to rescue Caesar Clown amid comic obstacles.',
  41: 'Fight against a corrupt lord who manipulated an entire kingdom.',
  42: 'Filler where the crew faces thieves and traps in a mine.',
  43: 'The crew reaches the elephant island, discovers Poneglyph secrets, and prepares for new challenges.',
  44: 'Filler where the Straw Hats infiltrate a minor marine base.',
  45: 'Sanji is separated and the crew enters Big Mom’s territory facing deadly challenges.',
  46: 'World congress where great powers gather amid rising political tensions.',
  47: 'The crew arrives at Wano, an isolated samurai country, and discovers its traditions.',
  48: 'Filler where the crew faces a group of criminals in the New World.',
  49: 'The crew continues fighting the Shogun’s allies and plans to defeat the main enemy.',
  50: 'Filler exploring Uta’s memories and past before current Wano events.',
  51: 'The final battle in Wano intensifies with epic confrontations and crucial revelations.',
};

const jaArcDesc = {
  1: 'ルフィが旅を始め、海賊となり、最初の仲間と共に初の試練に立ち向かう。',
  2: 'ルフィとゾロがオレンジの町に到着し、ナミと出会い、バギーから町を解放する。',
  3: '仲間たちが船を探し、ウソップと出会い、クロネコの海賊団と対峙する。',
  4: '浮遊レストランでコックを探し、サンジが加わり、クリークとの争いが起きる。',
  5: 'ナミの過去が明かされ、アーロンの支配と対峙する。',
  6: 'バギーと一味のサイドストーリー。軽快でユーモラスな展開。',
  7: 'グランドライン前の最後の寄港地ローグタウンでの対決。',
  8: '謎の少女を助けながら海賊と秘密に立ち向かうフィラー編。',
  9: 'グランドライン入り、ラブーンとの出会い。',
  10: '祝祭的な町に隠された危険と敵。',
  11: 'コビーとヘルメッポの成長を描く短編。',
  12: '先史時代の島と巨人の戦士たち。',
  13: '氷の島で医者を探す旅。',
  14: 'アラバスタでクロコダイルの陰謀を止める。',
  15: 'アラバスタ後の休息と次の航路へ。',
  16: 'ヤギの島フィラー。',
  17: 'ルルカ島フィラー。',
  18: 'ジャヤ島到着、空の島への手がかり。',
  19: 'スカイピア編、神々との戦い。',
  20: 'G-8基地フィラー。',
  21: 'フォクシーとのデーヴィ・バック・ファイト。',
  22: '記憶喪失フィラー。',
  23: 'フォクシー再登場フィラー。',
  24: 'ウォーターセブン、新たな船と対立。',
  25: 'エニエス・ロビー救出作戦。',
  26: 'エニエス・ロビー後の休息。',
  27: 'アイスハンター編フィラー。',
  28: 'スリラーバーク、モリアとの戦い。',
  29: 'スパ島フィラー。',
  30: 'シャボンディ諸島、新世界への入口。',
  31: 'アマゾン・リリー、エースを探すルフィ。',
  32: 'インペルダウン潜入。',
  33: 'リトルイーストブルー編フィラー。',
  34: 'マリンフォード頂上戦争。',
  35: '戦争後の世界と仲間たち。',
  36: '2年後、シャボンディ再集結。',
  37: '魚人島、海底の文化と真実。',
  38: 'Zの野望編フィラー。',
  39: 'パンクハザード、火と氷の島。',
  40: 'シーザー奪還フィラー。',
  41: 'ドレスローザ、ドフラミンゴとの戦い。',
  42: 'シルバーマイン編フィラー。',
  43: 'ゾウ、歴史の texto と新たな試練。',
  44: '海軍ルーキー編フィラー。',
  45: 'ホールケーキアイランド、サンジとビッグ・マム。',
  46: '世界会議レヴェリー。',
  47: 'ワノ国到着（前編）。',
  48: 'シードルギルド編フィラー。',
  49: 'ワノ国編（中編）。',
  50: 'ウタの過去編フィラー。',
  51: 'ワノ国決戦（後編）。',
};

const enEpTranslations = {
  1: 'A mysterious young man emerges from a barrel in the middle of the ocean. When a cruise ship is attacked by Alvida\'s pirates, he meets Coby, who dreams of becoming a marine.',
  2: 'Luffy and Coby reach Shell Town and meet the famous pirate hunter Roronoa Zoro, held prisoner by the corrupt Captain Morgan.',
  3: 'Luffy and Zoro face the tyrannical Captain Morgan in Shell Town. A mysterious thief watches the battle from the shadows.',
  4: 'A flashback reveals how Luffy gained his powers and straw hat through his childhood with Shanks. The crew reaches Orange Town.',
  5: 'The crew faces Buggy the Clown, a dangerous Devil Fruit pirate terrorizing Orange Town.',
  6: 'Luffy protects a loyal dog and its pet food shop while fighting beast tamer Mohji and his lion Richie.',
  7: 'Zoro proves his swordsmanship against acrobat Cabaji of Buggy\'s crew despite being injured.',
  8: 'Final showdown between Luffy and Buggy as Devil Fruit powers clash and Orange Town\'s fate is decided.',
  9: 'The crew reaches Syrup Village seeking a ship and meets Usopp, a young liar telling fantastical stories to the village children.',
  10: 'A strange hypnotist named Jango arrives. A conspiracy involving Kaya\'s butler and a sinister plan is revealed.',
  11: 'Klahadore is revealed to be the feared Captain Kuro. Usopp discovers the plan to kill Kaya and steal her fortune.',
  12: 'The decisive battle begins on the north slope as the Straw Hats and Usopp face the Black Cat Pirates.',
  13: 'Zoro fights the Meowban Brothers Sham and Buchi while Luffy and the others battle the rest of the pirate crew.',
  14: 'Luffy recovers from Jango\'s hypnosis. Kaya tries to resist threats as the battle intensifies.',
  15: 'Usopp finds courage to face his fears and defend the village, preparing for the final confrontation with Kuro.',
  16: 'Usopp\'s friends Onion, Pepper, and Carrot do everything to protect Kaya from the invading pirates.',
  17: 'The final confrontation between Luffy and Captain Kuro decides the village\'s fate and Kaya\'s safety.',
  18: 'Final showdown between Usopp and Jango as Usopp proves his marksmanship in a decisive battle.',
  19: 'Flashback to Zoro\'s past and his vow with childhood friend Kuina, revealing why he became a swordsman.',
  20: 'The crew reaches the floating restaurant Baratie and meets Sanji, a cook dreaming of finding the All Blue.',
  21: 'A hungry pirate named Gin tests Baratie\'s principle of feeding anyone in need.',
  22: 'Don Krieg, leader of the East Blue\'s largest pirate fleet, arrives at Baratie intending to conquer the restaurant.',
  23: 'Zeff\'s past as the pirate Red Leg and his connection to Sanji through a tragedy at sea is revealed.',
  24: 'Dracule Mihawk, the world\'s strongest swordsman, arrives at Baratie seeking Zoro for an epic duel.',
  25: 'Zoro unleashes a new special technique in his desperate battle against the world\'s most powerful swordsman.',
  26: 'After his crushing defeat by Mihawk, Zoro makes a solemn promise to Luffy that will define his future.',
  27: 'Gin struggles between loyalty to Don Krieg and gratitude toward Sanji.',
  28: 'The decisive battle between Luffy and Don Krieg begins while Gin sacrifices himself to save Luffy from poison gas.',
  29: 'The final battle between Luffy and Don Krieg reaches its climax with Luffy\'s Gomu Gomu no Bazooka.',
  30: 'After the battle, Sanji joins Luffy\'s crew to pursue his All Blue dream and bids an emotional farewell to Baratie and Zeff.',
  31: 'The crew learns Nami left with the Going Merry. Johnny and Yosaku bring news of Nami and the fish-man pirates led by Arlong.',
  32: 'Zoro and Usopp follow Nami to her hometown and discover she works for the fish-men as the "witch" who draws maps for Arlong.',
  33: 'Usopp is defeated by Arlong\'s men while Luffy and Sanji sail toward Cocoyashi guided by Yosaku.',
  34: 'Usopp reveals Nami\'s tragic story and why she works for Arlong. The crew gathers to learn the truth about their navigator.',
  35: 'Flashback revealing Nami\'s past: how retired marine Bell-mère found her as a baby and raised her with Nojiko.',
  36: 'The flashback continues as Arlong arrives, kills Bell-mère, and Nami agrees to work for him to save the villagers.',
  37: 'Arlong breaks his promise using corrupt marine Nezumi. When Nami finally asks for help, Luffy gives her his straw hat.',
  38: 'Battle begins at Arlong Park as the Straw Hats face fish-man pirates while Luffy is trapped underwater.',
  39: 'Zoro faces octopus swordsman Hatchan in a six-sword versus three duel while Luffy remains trapped underwater.',
  40: 'Sanji fights Kuroobi in the water while Usopp faces karateka Chu with his slingshot and wit.',
  41: 'Genzo and Nojiko save Luffy from the water. Nami confronts her past and declares she wants to keep living.',
  42: 'Arlong shows his true fish-man power with superhuman strength and shark teeth against Luffy.',
  43: 'Luffy destroys the room where Nami was forced to draw maps, proclaiming she is his nakama, and defeats Arlong.',
  44: 'The villagers celebrate freedom. Nami officially leaves her hometown and joins the Straw Hats as navigator.',
  45: 'Corrupt marine Nezumi reports Luffy. His first bounty of 30,000,000 berries makes him an officially wanted pirate.',
  46: 'Special episode following Buggy\'s adventures after his defeat as he seeks revenge against Luffy.',
  47: 'Buggy\'s adventures continue as the clown pirate seeks revenge while rebuilding his crew.',
  48: 'The Straw Hats reach Logue Town, where Pirate King Gol D. Roger was born and executed — their last stop before the Grand Line.',
  49: 'Zoro seeks new katanas in Logue Town, meets Tashigi, and obtains Sandai Kitetsu and Yubashiri.',
  50: 'Usopp faces famous sharpshooter Daddy Masterson in a high-noon duel.',
  51: 'Sanji competes in a cooking battle against beautiful chef Carmen.',
  52: 'Buggy tries to publicly execute Luffy on the same platform where Roger died. A mysterious storm saves Luffy.',
  53: 'The Straw Hats escape Logue Town as Smoker pursues them, heading toward the Grand Line.',
  54: 'The Straw Hats rescue Apis, a mysterious girl who can talk to animals and is fleeing the Marines.',
  55: 'Apis reveals she can communicate with millennium dragon Ryuji. Pirates and Marines seek the legendary dragon island.',
  56: 'Eric attacks Warship Island seeking Dragonite. The Straw Hats help villagers evacuate while protecting Apis and the elder dragon.',
  57: 'The search for Lost Island continues as Ryuji guides them toward the ancestral home of millennium dragons.',
  58: 'Zoro faces Eric in the ruins of Lost Island in an intense blade versus wind-scythe battle.',
  59: 'Luffy falls into Nelson\'s trap surrounded by the Marine fleet as Admiral Nelson reveals his plan.',
  60: 'Ryuji finds fellow dragons on Lost Island and regains vitality as millennium dragons fly together once more.',
  61: 'Final East Blue episode. The Straw Hats bid farewell to Apis and cross the Red Line into the Grand Line.',
};

const jaEpTranslations = {
  1: '海の真ん中の樽から現れた謎の少年。アルビダの海賊に襲われた客船で、海軍を目指すコビーと出会う。',
  2: 'ルフィとコビーがシェルタウンで、モーガン大佐の囚人となったロロノア・ゾロと出会う。',
  3: 'ルフィとゾロが暴君モーガン大佐と対峙。謎の女が影から戦いを見守る。',
  4: 'シャンクスとの幼少期のフラッシュバックでルフィの能力と麦わら帽子の由来が明かされる。一行はオレンジの町へ。',
  5: '悪魔の実の能力者バギーとオレンジの町を舞台にした戦い。',
  6: 'ルフィが忠犬と店を守るため、猛獣使いモージとライオンのリッチーと戦う。',
  7: '負傷したゾロがバギー一味のアクロバットキャバジと剣術勝負。',
  8: 'ルフィ対バギー最終決戦。悪魔の実の力が激突し、町の運命が決まる。',
  9: 'シロップ村で船を探す一行が、子供たちに空想話を語るウソップと出会う。',
  10: '催眠術師ジャンゴ登場。カヤの執事をめぐる陰謀が明らかに。',
  11: 'クラハドールが「百計のクロ」だったと判明。ウソップが暗殺計画を知る。',
  12: '北の坂での決戦開始。麦わらの一味とウソップ対クロネコの海賊団。',
  13: 'ゾロ対シャムとブチ。ルフィたちも残りの海賊と戦う。',
  14: 'ルフィがジャンゴの催眠から回復。カヤが脅威に抵抗。',
  15: 'ウソップが恐れと向き合い、クロとの最終対決へ。',
  16: 'ウソップの仲間たちがカヤを守る。',
  17: 'ルフィ対クロ最終決戦で村とカヤの運命が決まる。',
  18: 'ウソップ対ジャンゴ。狙撃手としての実力を示す。',
  19: 'ゾロと幼馴染クイナの誓い。三刀流を志した理由。',
  20: '海上レストラン「バラティエ」でサンジと出会う。',
  21: '空腹のギンがバラティエの「誰でも食べさせる」理念を試す。',
  22: '東の海最大の海賊艦隊、ドン・クリークがバラティエを狙う。',
  23: 'ゼフの「赤足」時代とサンジとの過去が明かされる。',
  24: '世界最強の剣士ミホークがゾロとの決闘を求めて来る。',
  25: '絶体絶命のゾロが新技を放つ。',
  26: 'ミホークに敗れたゾロがルフィに誓う「二度と負けない」。',
  27: 'ギンがクリークへの忠義とサンジへの恩義の間で揺れる。',
  28: 'ルフィ対クリーク決戦。ギンが毒ガスからルフィを救う。',
  29: 'ルフィのゴムゴムのバズーカでクリークを倒すクライマックス。',
  30: 'サンジがオールブルーを目指し一味に加わる。',
  31: 'ナミがメリー号を持ち去る。ジョニーとヨサクがアーロンの情報を持つ。',
  32: 'ゾロとウソップがココヤシ村でナミの正体を知る。',
  33: 'ウソップがアーロンに敗北。ルフィとサンジが向かう。',
  34: 'ウソップがナミの過去とアーロンとの関係を明かす。',
  35: 'ベルメールとナミ、ノジコのフラッシュバック。',
  36: 'アーロンがベルメールを殺し、ナミが村を救うために働く。',
  37: 'ネズミ軍曹の策略でナミが助けを求める。ルフィが麦わら帽子を渡す。',
  38: 'アーロンパークでの戦い開始。ルフィが水の中に閉じ込められる。',
  39: 'ゾロ対六刀流のハッチアン。',
  40: 'サンジ対クロオビ、ウソップ対チュウ。',
  41: 'ゲンゾとノジコがルフィを救う。ナミが生きる決意。',
  42: 'アーロンの本気の魚人パワー。',
  43: 'ルフィがアーロンを倒し「お前は仲間だ」と宣言。',
  44: 'ナミが故郷を離れ navigator として正式加入。',
  45: 'ルフィ初懸賞金3000万ベリー。',
  46: 'バギーの復讐を描くスペシャル。',
  47: 'バギー再登場、一味再建を目指す。',
  48: 'ローグタウン到着。ロジャーが生まれ、処刑された町。',
  49: 'ゾロが三代鬼徹と雪走を手に入れ、タシギと出会う。',
  50: 'ウソップ対狙撃手ダディの正午の決闘。',
  51: 'サンジ対美女シェフカルメンの料理勝負。',
  52: 'バギーが処刑台でルフィを狙う。嵐がルフィを救う。',
  53: 'スモーカーから逃れグランドラインへ。',
  54: '謎の少女アピスを助ける。',
  55: '千年竜リュウジとの交流。伝説の島を目指す。',
  56: 'エリックが軍艦島を襲撃。',
  57: '失われた島への旅が続く。',
  58: 'ゾロ対エリック、遺跡での決闘。',
  59: 'ネルソン提督の作戦でルフィが包囲される。',
  60: '千年竜たちが再び空を翔ける。',
  61: '東の海編最終回。赤い土の大陸を越えグランドラインへ。',
};

const overrides = {
  es: {
    arcs: Object.fromEntries(
      arcs.map(arc => [String(arc.id), { name: esArcNames[arc.id] ?? arc.name }]),
    ),
  },
  en: {
    arcs: Object.fromEntries(
      arcs.map(arc => [
        String(arc.id),
        { description: enArcDesc[arc.id] ?? arc.description },
      ]),
    ),
    episodes: Object.fromEntries(
      episodes.map(episode => [
        String(episode.id),
        { description: enEpTranslations[episode.id] ?? episode.description },
      ]),
    ),
  },
  ja: {
    arcs: Object.fromEntries(
      arcs.map(arc => [
        String(arc.id),
        { description: jaArcDesc[arc.id] ?? arc.description },
      ]),
    ),
    episodes: Object.fromEntries(
      episodes.map(episode => [
        String(episode.id),
        { description: jaEpTranslations[episode.id] ?? episode.description },
      ]),
    ),
  },
};

function buildLocale(locale) {
  const sagaEntries = Object.fromEntries(
    sagas.map(saga => [
      String(saga.id),
      { name: SAGA_NAMES[locale][saga.id] ?? saga.name },
    ]),
  );

  const arcEntries = Object.fromEntries(
    arcs.map(arc => {
      const localized = overrides[locale]?.arcs?.[String(arc.id)] ?? {};
      return [
        String(arc.id),
        {
          name: localized.name ?? arc.name,
          description: localized.description ?? arc.description,
        },
      ];
    }),
  );

  const episodeEntries = Object.fromEntries(
    episodes.map(episode => {
      const localized = overrides[locale]?.episodes?.[String(episode.id)] ?? {};
      return [
        String(episode.id),
        {
          name: localized.name ?? episode.name,
          description: localized.description ?? episode.description,
        },
      ];
    }),
  );

  return { sagas: sagaEntries, arcs: arcEntries, episodes: episodeEntries };
}

for (const locale of ['es', 'en', 'ja']) {
  const outDir = join(localesDir, locale);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'serie.json');
  writeFileSync(outPath, `${JSON.stringify(buildLocale(locale), null, 2)}\n`);
  process.stdout.write(`Wrote ${outPath}\n`);
}
