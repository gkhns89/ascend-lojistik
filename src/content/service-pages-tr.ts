/**
 * Hizmet detay sayfalarinin icerigi.
 *
 * Buradaki metinler tasima modlarinin sektorde gecerli, dogrulanabilir
 * isleyisini anlatir: kullanilan belgeler, ekipman tipleri, ucret hesabi ve
 * sik sorulanlar. Sirkete dair sayisal iddia (ofis sayisi, filo buyuklugu,
 * sefer sikligi, sertifika, tecrube yili) bilerek yoktur; AGENTS.md bunu
 * yasaklar. Yeni bir iddia eklenecekse once dogrulanmalidir.
 *
 * `serviceId` alani src/content/tr.ts icindeki services.items kaydina baglanir;
 * ikon ve madde listeleri oradan gelir, burada tekrarlanmaz.
 */

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceSection {
  heading: string;
  body: string[];
}

export interface ServiceSpecs {
  heading: string;
  note?: string;
  rows: { label: string; value: string }[];
}

/**
 * Slug'lar ayni zamanda route yollaridir. Literal union olarak tutulur ki
 * TanStack Router'in tipli `Link to` degerleriyle eslessin ve yazim hatasi
 * derleme zamaninda yakalansin.
 */
export type ServiceSlug =
  | "karayolu-tasimaciligi"
  | "denizyolu-tasimaciligi"
  | "havayolu-tasimaciligi"
  | "gemi-acenteligi"
  | "multimodal-tasimacilik"
  | "proje-tasimaciligi"
  | "parsiyel-tasimacilik";

export interface ServicePage {
  slug: ServiceSlug;
  serviceId: string;
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; subtitle: string };
  intro: string;
  sections: ServiceSection[];
  specs?: ServiceSpecs;
  faq: ServiceFaq[];
}

export const servicePagesTr: ServicePage[] = [
  {
    slug: "karayolu-tasimaciligi",
    serviceId: "karayolu",
    meta: {
      title: "Karayolu Taşımacılığı | Ascend Lojistik",
      description:
        "Avrupa, Balkanlar, BDT ve Orta Doğu rotalarında komple (FTL) ve parsiyel (LTL) karayolu taşımacılığı; ekipman seçimi, CMR ve NCTS transit süreçleri.",
    },
    hero: {
      eyebrow: "Karayolu Taşımacılığı",
      title: "Avrupa ve Orta Doğu rotalarında komple ve parsiyel karayolu",
      subtitle:
        "Yükün karakterine uygun ekipman, doğru rota ve transit rejimiyle planlanan uçtan uca karayolu operasyonu.",
    },
    intro:
      "Karayolu taşımacılığı, Türkiye'den Avrupa'ya ve Orta Doğu'ya yapılan sevkiyatlarda kapıdan kapıya teslim sağlayabilen tek moddur. Aktarma gerektirmediği için yükün elleçlenme sayısı azalır; termin, denizyoluna göre belirgin biçimde kısalır. Ascend Lojistik olarak yükün ağırlığı, hacmi, sıcaklık ihtiyacı ve tehlikeli madde sınıfına göre araç planlamasını yapıyor, gümrük ve transit süreçlerini operasyonun ayrılmaz parçası olarak yönetiyoruz.",
    sections: [
      {
        heading: "Komple (FTL) ve parsiyel (LTL) arasındaki fark",
        body: [
          "Komple yükleme (FTL – Full Truck Load), aracın tamamının tek bir gönderiye tahsis edilmesidir. Yük yolda başka bir gönderiyle birleşmediği için aktarma riski ortadan kalkar ve transit süresi en kısa seviyeye iner. Hacmi aracı dolduran, kırılgan ya da termin açısından kritik sevkiyatlarda tercih edilir.",
          "Parsiyel yükleme (LTL – Less than Truck Load), farklı göndericilere ait yüklerin aynı araçta konsolide edilmesidir. Maliyet yalnızca kaplanan alan üzerinden hesaplandığı için küçük hacimli ve düzenli sevkiyatlarda ciddi avantaj sağlar. Karşılığında konsolidasyon ve aktarma adımları nedeniyle transit süresi komple yüklemeye göre uzar.",
          "Parsiyel fiyatlandırmada ağırlığın yanı sıra yükün araçta kapladığı yer de dikkate alınır. Avrupa hatlarında yaygın uygulama, yüklenen her yükleme metresinin (ldm) belirli bir ağırlık karşılığı kabul edilmesidir; bu oran taşıyıcıya ve hatta göre değişir, teklif aşamasında netleştirilir.",
        ],
      },
      {
        heading: "Ekipman seçimi",
        body: [
          "Araç tipi, yükün fiziksel özellikleri kadar yükleme ve boşaltma koşullarına da bağlıdır. Yandan veya üstten yükleme gereken sevkiyatlarda tenteli araçlar, sıcaklık kontrolü gereken gıda ve ilaç sevkiyatlarında frigorifik araçlar kullanılır. Yüksek hacimli fakat hafif yüklerde mega treylerler hacim avantajı sağlar.",
          "Gabari dışı ölçülerde veya ağır tonajda taşınacak yükler için lowbed ve özel ekipmanlar devreye girer; bu sevkiyatlar ayrıca rota etüdü ve izin süreci gerektirdiğinden proje taşımacılığı kapsamında değerlendirilir.",
        ],
      },
      {
        heading: "Belgeler ve transit rejimi",
        body: [
          "Uluslararası karayolu taşımalarında taşıma sözleşmesini belgeleyen temel evrak CMR'dir. CMR, göndericiyi, alıcıyı, yükün tanımını ve teslim koşullarını kayıt altına alır ve teslimat sırasında imzalanarak taşımanın tamamlandığını gösterir.",
          "Avrupa Birliği ve ortak transit ülkeleri arasındaki sevkiyatlarda gümrük transit işlemleri NCTS üzerinden elektronik olarak yürütülür; T1 beyanı, yükün gümrük gözetimi altında ülkeler arası hareketini sağlar. Transit sürecinin doğru açılması ve zamanında kapatılması, sevkiyatın gecikmeden ilerlemesi açısından belirleyicidir.",
          "Tehlikeli madde kapsamındaki yükler ADR hükümlerine tabidir; ambalajlama, etiketleme, araç donanımı ve sürücü belgelendirmesi bu mevzuata göre planlanır.",
        ],
      },
    ],
    specs: {
      heading: "Sık kullanılan araç tipleri",
      note: "Ölçü ve kapasiteler araç bazında değişir; planlama teklif aşamasında yükün gerçek ölçüleriyle yapılır.",
      rows: [
        { label: "Tenteli (standart)", value: "Yandan ve üstten yükleme, genel kargo" },
        { label: "Mega treyler", value: "Yüksek hacimli, düşük yoğunluklu yükler" },
        { label: "Frigorifik", value: "Sıcaklık kontrollü gıda ve ilaç sevkiyatı" },
        { label: "Lowbed / özel ekipman", value: "Gabari dışı ve ağır tonajlı yükler" },
      ],
    },
    faq: [
      {
        q: "Parsiyel mi komple mi seçmeliyim?",
        a: "Yük aracın kapasitesinin önemli bir bölümünü dolduruyorsa ya da termin kritikse komple yükleme genellikle daha uygundur. Küçük hacimli ve termin esnekliği olan düzenli sevkiyatlarda parsiyel maliyet avantajı sağlar. Karar, hacim ve ağırlık bilgileriyle birlikte teklif aşamasında netleşir.",
      },
      {
        q: "CMR nedir, neden önemlidir?",
        a: "CMR, uluslararası karayolu taşımalarında taşıma sözleşmesini belgeleyen evraktır. Yükün teslim alındığı andaki durumunu ve teslim koşullarını kayıt altına alır; teslimat sırasında imzalanır ve olası hasar veya eksik tartışmalarında esas alınan belgedir.",
      },
      {
        q: "Transit süresi ne kadar?",
        a: "Süre rotaya, sınır kapılarındaki yoğunluğa, gümrük işlemlerine ve komple/parsiyel tercihine göre değişir. Gerçekçi bir termin, rota ve yük bilgileri paylaşıldıktan sonra verilir; tahmini süre teklifle birlikte iletilir.",
      },
    ],
  },

  {
    slug: "denizyolu-tasimaciligi",
    serviceId: "denizyolu",
    meta: {
      title: "Denizyolu Taşımacılığı | Ascend Lojistik",
      description:
        "FCL ve LCL konteyner taşımacılığı, konteyner tipleri, konşimento ve booking yönetimi; liman-liman ve kapı-kapı denizyolu çözümleri.",
    },
    hero: {
      eyebrow: "Denizyolu Taşımacılığı",
      title: "FCL ve LCL konteyner taşımacılığında doğru servis ve maliyet dengesi",
      subtitle:
        "Ana hat armatörleri ve acente ağıyla planlanan, liman-liman veya kapı-kapı denizyolu operasyonu.",
    },
    intro:
      "Denizyolu, birim başına maliyetin en düşük olduğu taşıma modudur ve yüksek hacimli, termin esnekliği bulunan sevkiyatların omurgasını oluşturur. Uzak Doğu, Amerika ve Avrupa hatlarında yükün hacmine göre konteynerin tamamını ya da bir bölümünü kullanan iki temel model vardır. Ascend Lojistik olarak servis seçimi, booking yönetimi ve liman süreçlerini tek elden yürütüyoruz.",
    sections: [
      {
        heading: "FCL ve LCL arasındaki fark",
        body: [
          "FCL (Full Container Load), konteynerin tamamının tek bir gönderiye tahsis edilmesidir. Konteyner yükleme noktasında mühürlenir ve varışa kadar açılmaz; bu da elleçleme sayısını ve hasar riskini azaltır. Hacmi bir konteyneri dolduran ya da dolduramasa bile karışmaması gereken yüklerde tercih edilir.",
          "LCL (Less than Container Load), farklı göndericilere ait yüklerin aynı konteynerde birleştirilmesidir. Konsolidasyon ve varışta ayrıştırma adımları nedeniyle süreç uzar, ancak küçük hacimli sevkiyatlarda tüm konteyneri kiralamaya göre belirgin maliyet avantajı sağlar.",
          "LCL fiyatlandırmasında ağırlık ile hacim karşılaştırılır ve hangisi yüksekse o esas alınır; sektörde yaygın uygulama bir metreküpün bin kilogram karşılığı kabul edilmesidir. Bu nedenle hafif ve hacimli yüklerde maliyet hacim üzerinden oluşur.",
        ],
      },
      {
        heading: "Konteyner tipleri",
        body: [
          "Genel kargo için standart kuru yük konteynerleri (Dry Van) kullanılır. Yüksekliği fazla olan yüklerde, standart konteynere göre ek iç yükseklik sunan High Cube tercih edilir.",
          "Sıcaklık kontrollü sevkiyatlarda reefer konteynerler, konteyner kapılarından geçmeyen uzun yüklerde flat rack, üstten vinçle yüklenmesi gereken yüklerde open top konteynerler devreye girer. Konteyner tipi, yükün ölçüleri ve yükleme yöntemiyle birlikte belirlenir.",
        ],
      },
      {
        heading: "Konşimento, teslim şekli ve liman süreleri",
        body: [
          "Denizyolu taşımasının temel belgesi konşimentodur (Bill of Lading). Taşıma sözleşmesini, yükün teslim alındığını ve malın mülkiyetini temsil eder; varışta yükün teslim alınabilmesi bu belgeye bağlıdır.",
          "Sorumluluğun ve masrafların taraflar arasında nerede el değiştirdiğini Incoterms kuralları belirler. FOB, CIF veya EXW gibi teslim şekilleri, navlun dışındaki yerel masrafların kime ait olacağını doğrudan etkilediği için teklif aşamasında netleştirilmesi gerekir.",
          "Varış limanında konteynerin tahsis edilen ücretsiz sürenin ötesinde kalması demuraj, konteynerin armatöre iade edilmesindeki gecikme ise detention maliyeti doğurur. Gümrük ve iç nakliye planlamasının önceden yapılması bu kalemleri önler.",
        ],
      },
    ],
    specs: {
      heading: "Yaygın konteyner tipleri",
      note: "İç ölçüler ve yükleme kapasiteleri armatöre ve konteyner yaşına göre değişir.",
      rows: [
        { label: "20' / 40' Dry Van", value: "Genel kargo, standart kuru yük" },
        { label: "40' High Cube", value: "Ek iç yükseklik gerektiren hacimli yükler" },
        { label: "Reefer", value: "Sıcaklık kontrollü sevkiyat" },
        { label: "Open Top / Flat Rack", value: "Üstten yükleme, gabari dışı ölçüler" },
      ],
    },
    faq: [
      {
        q: "LCL mi FCL mi daha uygun?",
        a: "Yükün hacmi bir konteynerin önemli bölümünü dolduruyorsa FCL genellikle hem maliyet hem süre açısından avantajlıdır. Küçük hacimli sevkiyatlarda LCL daha uygundur. Kesin karşılaştırma, hacim ve ağırlık bilgisiyle yapılan teklifte ortaya çıkar.",
      },
      {
        q: "Demuraj ve detention nedir?",
        a: "Demuraj, konteynerin liman sahasında tanınan ücretsiz sürenin ötesinde kalmasından doğan maliyettir. Detention ise konteynerin boşaltıldıktan sonra armatöre geç iade edilmesinden kaynaklanır. Her ikisi de gümrük ve iç nakliye planlamasının önceden yapılmasıyla önlenebilir.",
      },
      {
        q: "Kapı-kapı teslim mümkün mü?",
        a: "Evet. Liman-liman taşımaya ek olarak çıkış noktasından limana ve varış limanından teslim adresine iç nakliye planlanabilir; bu durumda gümrük işlemleri de operasyonun parçası olarak yürütülür.",
      },
    ],
  },

  {
    slug: "havayolu-tasimaciligi",
    serviceId: "havayolu",
    meta: {
      title: "Havayolu Taşımacılığı | Ascend Lojistik",
      description:
        "Zaman kritik yükler için hava kargo çözümleri: direkt ve transit uçuş planlaması, AWB, hacim ağırlığı hesabı ve kapı teslim seçenekleri.",
    },
    hero: {
      eyebrow: "Havayolu Taşımacılığı",
      title: "Zaman kritik sevkiyatlar için hava kargo",
      subtitle:
        "Acil sevkiyatlar, yüksek değerli ürünler ve kısa terminli projelerde en uygun uçuş planı ve kapıdan kapıya takip.",
    },
    intro:
      "Havayolu, terminin belirleyici olduğu sevkiyatlarda diğer modların önüne geçer. Birim maliyeti yüksektir; buna karşılık stok maliyetini, üretim duruşunu ya da sözleşmeden doğan gecikme cezasını önlediği durumlarda toplam maliyeti düşürür. Yüksek değerli, düşük hacimli ve termini kritik yükler bu modun tipik kullanım alanıdır.",
    sections: [
      {
        heading: "Ücret nasıl hesaplanır: hacim ağırlığı",
        body: [
          "Hava kargoda ücret, yükün fiili ağırlığı ile hacim ağırlığından hangisi yüksekse onun üzerinden hesaplanır. Bu ölçüye ücretlendirilebilir ağırlık (chargeable weight) denir.",
          "Hacim ağırlığı, IATA'nın yaygın olarak uygulanan kuralına göre santimetre cinsinden en, boy ve yüksekliğin çarpımının 6000'e bölünmesiyle bulunur. Yani bir metreküp yaklaşık 167 kilogram kabul edilir. Hafif ve hacimli yüklerde maliyet bu nedenle fiili ağırlıktan yüksek çıkar.",
          "Ambalajın ölçüleri doğrudan maliyete yansıdığı için paletleme ve kutulama planı, teklif öncesinde gerçek dış ölçülerle birlikte değerlendirilmelidir.",
        ],
      },
      {
        heading: "Direkt ve transit uçuş planlaması",
        body: [
          "Direkt uçuşlar en kısa transit süreyi sağlar ve aktarma kaynaklı gecikme riskini ortadan kaldırır. Aktarmalı seçenekler ise daha geniş destinasyon ağı ve çoğunlukla daha uygun maliyet sunar.",
          "Yolcu uçaklarının kargo bölümü (belly cargo) düzenli ve sık frekans sağlarken, hacimli ya da özel ölçülü yüklerde kargo uçakları devreye girer. Uçuş planı; yükün ölçüleri, termin ve destinasyondaki elleçleme koşulları birlikte değerlendirilerek kurulur.",
        ],
      },
      {
        heading: "Belgeler ve özel yükler",
        body: [
          "Hava taşımasının temel belgesi hava konşimentosudur (Air Waybill – AWB). Taşıma sözleşmesini ve yükün teslim alındığını belgeler; denizyolu konşimentosundan farklı olarak malın mülkiyetini temsil etmez, bu nedenle ciro edilemez.",
          "Tehlikeli madde kapsamındaki sevkiyatlar IATA Tehlikeli Maddeler Yönetmeliği'ne tabidir; ambalaj, etiketleme ve beyan bu kurallara göre hazırlanır. Lityum piller, aerosoller ve kimyasallar bu kapsamda özel işlem gerektiren yaygın yük tipleridir.",
          "Güvenlik mevzuatı gereği hava kargo, yükleme öncesinde güvenlik kontrolünden geçer. Bilinen gönderici statüsü ve doğru hazırlanmış beyan, bu sürecin gecikmesiz ilerlemesini sağlar.",
        ],
      },
    ],
    faq: [
      {
        q: "Hacim ağırlığı ne demek?",
        a: "Yükün kapladığı hacmin ağırlık karşılığıdır. Hava kargoda santimetre cinsinden en × boy × yükseklik değerinin 6000'e bölünmesiyle bulunur ve fiili ağırlıkla karşılaştırılır; ücret hangisi yüksekse onun üzerinden hesaplanır.",
      },
      {
        q: "AWB ile konşimento aynı şey mi?",
        a: "Hayır. AWB taşıma sözleşmesini ve yükün teslim alındığını belgeler ancak malın mülkiyetini temsil etmez ve ciro edilemez. Denizyolu konşimentosu ise mülkiyeti temsil eder ve devredilebilir.",
      },
      {
        q: "Lityum pil içeren ürün gönderebilir miyim?",
        a: "Lityum piller tehlikeli madde kapsamındadır ve IATA kurallarına uygun ambalaj, etiketleme ve beyan gerektirir. Ürünün pil tipi, kapasitesi ve cihazla birlikte olup olmadığı planlamayı etkilediği için teklif öncesinde paylaşılmalıdır.",
      },
    ],
  },

  {
    slug: "gemi-acenteligi",
    serviceId: "gemi-acenteligi",
    meta: {
      title: "Gemi Acenteliği | Ascend Lojistik",
      description:
        "Liman çağrılarında koordinasyon, dokümantasyon ve saha süreçlerinin tek merkezden yönetimi; yanaşma, resmi işlemler ve operasyon takibi.",
    },
    hero: {
      eyebrow: "Gemi Acenteliği",
      title: "Liman çağrısının her adımında tek muhatap",
      subtitle:
        "Gemi, liman ve resmi merciler arasındaki koordinasyonu yürütüyor; yanaşma, evrak ve operasyon süreçlerini şeffaf biçimde takip ediyoruz.",
    },
    intro:
      "Gemi acentesi, geminin uğradığı limanda donatan veya işleten adına hareket eden taraftır. Bir liman çağrısı; liman idaresi, gümrük, sahil sağlık, terminal işletmesi, kılavuzluk ve römorkaj hizmetleri ile yük ilgilileri gibi çok sayıda tarafın eşgüdümünü gerektirir. Acentenin işlevi, bu tarafların arasında tek temas noktası olarak süreci yürütmek ve geminin limanda geçirdiği süreyi öngörülebilir kılmaktır.",
    sections: [
      {
        heading: "Liman çağrısı nasıl yürütülür",
        body: [
          "Süreç, geminin varış bildirimiyle başlar. Tahmini varış zamanına göre yanaşma yeri talep edilir; kılavuz kaptan ve römorkör ihtiyacı, terminalin müsaitliği ve gelgit koşulları birlikte değerlendirilerek yanaşma planı oluşturulur.",
          "Gemi limana yanaştıktan sonra yükleme veya tahliye operasyonu terminal işletmesiyle koordine edilir. Operasyon boyunca ilerleme, gecikme riskleri ve tamamlanma süresi ilgili taraflara raporlanır.",
          "Kalkış aşamasında resmi çıkış işlemleri tamamlanır ve gemi bir sonraki limana yönlendirilir. Limanda geçen sürenin kısalması doğrudan maliyet avantajı sağladığı için planlamanın önceden yapılması belirleyicidir.",
        ],
      },
      {
        heading: "Dokümantasyon ve resmi süreçler",
        body: [
          "Liman çağrısı, gemiye ve yüke ilişkin beyanların eksiksiz ve zamanında yapılmasını gerektirir. Yük manifestosu, mürettebat ve kumanya listeleri ile sağlık ve güvenlik beyanları ilgili mercilere sunulur.",
          "Yükün teslim alınabilmesi için gerekli belgelerin düzenlenmesi ve yük ilgilileriyle paylaşılması da acentenin sorumluluğundadır. Belgelerdeki bir eksiklik hem geminin hem yükün beklemesine yol açabileceğinden, süreç baştan takip edilir.",
        ],
      },
      {
        heading: "Taşıma hizmetleriyle birlikte yürütülmesi",
        body: [
          "Acentelik hizmeti, denizyolu taşımacılığı operasyonlarıyla birlikte yürütüldüğünde liman tarafındaki süreç ile yükün kara tarafındaki hareketi aynı planın parçası haline gelir.",
          "Bu bütünlük, gümrük işlemleri ve iç nakliye planlamasının gemi operasyonuna göre önceden kurgulanmasını sağlar; konteynerin limanda beklemesinden doğan demuraj gibi kalemlerin önüne geçer.",
        ],
      },
    ],
    faq: [
      {
        q: "Gemi acentesi tam olarak neyi üstlenir?",
        a: "Geminin uğradığı limanda donatan veya işleten adına hareket eder; yanaşma planlaması, resmi beyanlar, terminal koordinasyonu ve yük ilgilileriyle iletişim dahil liman çağrısının tüm adımlarını yürütür.",
      },
      {
        q: "Acentelik hizmetini taşımadan bağımsız alabilir miyim?",
        a: "Evet. Acentelik, taşıma hizmetinden ayrı olarak da verilebilir. Denizyolu operasyonuyla birlikte yürütüldüğünde liman ve kara süreçleri tek planda buluştuğu için koordinasyon avantajı oluşur.",
      },
    ],
  },

  {
    slug: "multimodal-tasimacilik",
    serviceId: "multimodal",
    meta: {
      title: "Multimodal ve Kombine Taşımacılık | Ascend Lojistik",
      description:
        "Kara, deniz ve hava modlarını tek operasyon planında birleştirerek süre ve maliyet dengesini optimize eden kombine taşımacılık çözümleri.",
    },
    hero: {
      eyebrow: "Multimodal / Kombine Taşımacılık",
      title: "Birden fazla taşıma modu, tek operasyon planı",
      subtitle:
        "Rota esnekliği ve maliyet avantajı için modları birleştiriyor, aktarma noktalarını tek elden yönetiyoruz.",
    },
    intro:
      "Multimodal taşımacılık, bir sevkiyatın kara, deniz, hava veya demiryolu modlarından birden fazlası kullanılarak tek bir taşıma sözleşmesi altında yürütülmesidir. Amaç, her etapta o etaba en uygun modu kullanarak süre ile maliyet arasında dengeli bir sonuç elde etmektir. Tek sözleşme altında yürütüldüğü için sorumluluk dağılmaz; operasyon boyunca tek muhatap bulunur.",
    sections: [
      {
        heading: "Hangi durumlarda avantaj sağlar",
        body: [
          "Tamamı havayoluyla taşındığında maliyeti yüksek, tamamı denizyoluyla taşındığında ise termini uzun kalan sevkiyatlar multimodal planlamanın tipik kullanım alanıdır. Uzun mesafenin denizyolu ile, termin açısından kritik son etabın karayolu veya havayolu ile yapılması toplam süreyi kabul edilebilir seviyeye çekerken maliyeti sınırlar.",
          "Doğrudan servis bulunmayan destinasyonlarda da kombine planlama devreye girer. Aktarma merkezleri üzerinden kurgulanan rotalar, tek modla ulaşılamayan noktalara erişim sağlar.",
        ],
      },
      {
        heading: "Aktarma noktaları ve risk yönetimi",
        body: [
          "Multimodal taşımanın kritik noktası aktarmalardır. Her mod değişimi ek elleçleme, ek belge ve ek zaman anlamına gelir; planlamanın kalitesi bu geçişlerin ne kadar sorunsuz yürüdüğüyle ölçülür.",
          "Aktarma noktalarındaki terminal müsaitliği, bağlantı süreleri ve gümrük işlemleri operasyon başlamadan önce kurgulanır. Bağlantı kaçırma riskine karşı alternatif senaryolar önceden belirlenir.",
          "Ambalajın birden fazla elleçlemeye dayanacak şekilde hazırlanması, tek modlu taşımalara göre daha önemlidir; paletleme ve sabitleme planı buna göre yapılır.",
        ],
      },
      {
        heading: "Tek sözleşme, tek sorumluluk",
        body: [
          "Sevkiyatın farklı etaplarının ayrı ayrı sözleşmelerle yürütülmesi, bir aksaklık durumunda sorumluluğun tespitini zorlaştırır. Multimodal yaklaşımda operasyonun tamamı tek plan ve tek muhatap altında yürütülür.",
          "Bu yapı, yükün hangi etapta olduğunun tek yerden takip edilmesini de mümkün kılar; durum bilgisi ve belge akışı parçalanmaz.",
        ],
      },
    ],
    faq: [
      {
        q: "Multimodal ile intermodal aynı şey mi?",
        a: "Yakın kavramlardır ancak farklıdırlar. Multimodal taşımada tüm etaplar tek bir taşıma sözleşmesi ve tek sorumluluk altında yürütülür. Intermodal taşımada ise yük aynı taşıma ünitesi içinde kalarak mod değiştirir, etaplar ayrı sözleşmelere konu olabilir.",
      },
      {
        q: "Aktarma yükün hasar riskini artırır mı?",
        a: "Her elleçleme teorik olarak risk taşır. Bu nedenle aktarma noktaları, ambalaj dayanımı ve sabitleme planı operasyon öncesinde birlikte değerlendirilir; uygun ambalajla risk pratikte kontrol altında tutulur.",
      },
    ],
  },

  {
    slug: "proje-tasimaciligi",
    serviceId: "proje",
    meta: {
      title: "Proje ve Özel Yük Taşımacılığı | Ascend Lojistik",
      description:
        "Gabari dışı ve ağır tonajlı yükler için mühendislik odaklı planlama: yükleme etüdü, rota fizibilitesi, izin süreçleri ve saha koordinasyonu.",
    },
    hero: {
      eyebrow: "Proje ve Özel Yük Taşımacılığı",
      title: "Gabari dışı ve ağır tonajlı yüklerde mühendislik odaklı planlama",
      subtitle:
        "Rota etüdünden izin süreçlerine, yükleme planından saha koordinasyonuna kadar her adımı önceden kurguluyoruz.",
    },
    intro:
      "Proje taşımacılığı, standart araç ve konteyner ölçülerine sığmayan ya da olağan ağırlık sınırlarını aşan yüklerin taşınmasıdır. Türbin parçaları, jeneratörler, tanklar, pres ve enerji ekipmanları bu kapsamın tipik örnekleridir. Bu sevkiyatlarda taşıma, bir nakliye işi olmaktan çok bir mühendislik ve izin planlaması işidir; hazırlık süresi taşımanın kendisinden uzun olabilir.",
    sections: [
      {
        heading: "Rota etüdü ve fizibilite",
        body: [
          "Planlama, yükün gerçek ölçüleri ve ağırlık merkezinin belirlenmesiyle başlar. Ardından güzergâh üzerindeki köprüler, viyadükler, üst geçitler, tünel yükseklikleri, dönüş yarıçapları ve yol taşıma kapasiteleri incelenir.",
          "Kritik noktalarda saha keşfi yapılır. Gerekirse geçici önlemler planlanır: levha veya engel sökümü, enerji hatlarının yükseltilmesi ya da alternatif güzergâh kullanımı gündeme gelebilir.",
          "Fizibilite çalışması, taşımanın mümkün olup olmadığını ve hangi ekipmanla yapılacağını belirler. Bu aşamanın sonucu, hem süre hem maliyet tahmininin temelini oluşturur.",
        ],
      },
      {
        heading: "Ekipman ve yükleme planı",
        body: [
          "Yükün ağırlığı ve ölçülerine göre lowbed, semi-lowbed veya modüler treylerler kullanılır. Modüler sistemlerde aks sayısı yüke göre artırılarak yol üzerindeki ağırlık dağılımı düzenlenir.",
          "Denizyolu etabı gerektiğinde flat rack veya open top konteynerler, ölçülerin bunları da aştığı durumlarda konvansiyonel gemi yükleme seçenekleri değerlendirilir.",
          "Yükleme ve bağlama planı, yükün taşıma boyunca hareket etmeyeceğini güvence altına alacak biçimde hazırlanır; vinç kapasitesi ve kaldırma noktaları bu planın parçasıdır.",
        ],
      },
      {
        heading: "İzinler ve saha koordinasyonu",
        body: [
          "Gabari dışı ve ağır tonajlı taşımalar, güzergâh üzerindeki yetkili kurumlardan özel taşıma izni gerektirir. İzin süreci ülkeye ve güzergâha göre değiştiği için planlamanın erken başlatılması kritiktir.",
          "Taşıma sırasında öncü ve refakat araçları, gerektiğinde trafik yönetimi ve zaman kısıtlı geçişler devreye girer. Bu unsurların tamamı önceden belirlenir ve ilgili taraflarla eşgüdüm içinde yürütülür.",
          "Operasyonun her adımı raporlanır; yükleme, güzergâh ilerlemesi ve teslim aşamaları kayıt altına alınır.",
        ],
      },
    ],
    faq: [
      {
        q: "Proje taşıması için ne kadar önceden planlama gerekir?",
        a: "Süre, güzergâha ve izin gerektiren nokta sayısına göre değişir. Rota etüdü, ekipman tedariki ve resmi izinler zaman aldığından, planlamanın olabildiğince erken başlatılması gecikme riskini azaltır.",
      },
      {
        q: "Hangi bilgileri paylaşmam gerekiyor?",
        a: "Yükün en, boy, yükseklik ve ağırlık bilgileri ile ağırlık merkezi ve kaldırma noktaları planlamanın temelidir. Yükleme ve teslim adreslerindeki saha koşulları ile varsa çizim ve teknik dokümanlar da süreci hızlandırır.",
      },
    ],
  },

  {
    slug: "parsiyel-tasimacilik",
    serviceId: "parsiyel",
    meta: {
      title: "Parsiyel ve Komple Taşımalar | Ascend Lojistik",
      description:
        "Küçük hacimli düzenli sevkiyatlardan komple yüklemelere esnek kapasite yönetimi; konsolidasyon programları, depo ve termin planlaması.",
    },
    hero: {
      eyebrow: "Parsiyel ve Komple Taşımalar",
      title: "Hacme göre doğru kapasite, terminle uyumlu planlama",
      subtitle:
        "Küçük hacimli yüklerde konsolidasyonla maliyet avantajı, komple yüklerde hız ve doğrudan teslim.",
    },
    intro:
      "Her sevkiyat bir aracı ya da konteyneri doldurmaz. Parsiyel taşımacılık, farklı göndericilere ait yükleri aynı araçta veya konteynerde birleştirerek küçük hacimli sevkiyatların da uygun maliyetle taşınmasını sağlar. Komple taşıma ise kapasitenin tamamının tek gönderiye ayrılmasıdır ve hız ile doğrudan teslim önceliklendiğinde tercih edilir.",
    sections: [
      {
        heading: "Konsolidasyon nasıl çalışır",
        body: [
          "Parsiyel sevkiyatlar, çıkış bölgesindeki bir konsolidasyon noktasında toplanır. Aynı hatta gidecek yükler birleştirilerek araç veya konteyner oluşturulur ve varış noktasında yeniden ayrıştırılarak alıcılarına yönlendirilir.",
          "Bu yapı, tek başına bir aracı dolduramayacak yüklerin de düzenli hatlardan yararlanmasını sağlar. Karşılığında toplama ve ayrıştırma adımları nedeniyle transit süresi komple taşımaya göre uzar.",
          "Düzenli ve öngörülebilir sevkiyat hacmi olan firmalarda konsolidasyon programı, hem maliyeti hem termin belirsizliğini azaltır.",
        ],
      },
      {
        heading: "Maliyet nasıl oluşur",
        body: [
          "Parsiyel fiyatlandırmada yalnızca ağırlık değil, yükün kapladığı alan da dikkate alınır. Karayolunda yükleme metresi, denizyolunda ise metreküp esas alınan ölçülerdir; ağırlık ile hacimden hangisi yüksek karşılık üretiyorsa maliyet onun üzerinden hesaplanır.",
          "Bu nedenle ambalaj ve paletleme doğrudan maliyeti etkiler. Düzgün istiflenmiş, standart palet ölçülerine uygun yükler hem daha az yer kaplar hem elleçleme sırasında daha iyi korunur.",
          "Komple taşımada ise kapasitenin tamamı tahsis edildiği için maliyet sevkiyat başına belirlenir; hacmi kapasiteye yaklaşan yüklerde bu model genellikle daha avantajlı hale gelir.",
        ],
      },
      {
        heading: "Ambalaj ve elleçleme",
        body: [
          "Parsiyel yükler taşıma boyunca birden fazla kez elleçlenir ve başka yüklerle aynı alanı paylaşır. Ambalajın istiflemeye dayanıklı olması ve yükün palet sınırlarını aşmaması bu nedenle önemlidir.",
          "Etiketleme, ayrıştırma aşamasında yükün doğru yönlendirilmesini sağlar. Eksik veya okunaksız etiket, varışta gecikmeye yol açan en yaygın nedenlerden biridir.",
        ],
      },
    ],
    faq: [
      {
        q: "Parsiyel sevkiyatta süre neden daha uzun?",
        a: "Yük, çıkışta konsolidasyon noktasında toplanır ve varışta yeniden ayrıştırılır. Bu ek adımlar ile hattın kalkış programı, transit süreyi komple taşımaya göre uzatır.",
      },
      {
        q: "Maliyet ağırlığa göre mi hesaplanıyor?",
        a: "Ağırlık ile yükün kapladığı alan karşılaştırılır ve hangisi yüksek karşılık üretiyorsa maliyet onun üzerinden hesaplanır. Hafif ve hacimli yüklerde belirleyici olan hacimdir.",
      },
      {
        q: "Paletsiz gönderebilir miyim?",
        a: "Mümkündür ancak önerilmez. Paletli yükler elleçleme sırasında daha iyi korunur ve istiflemeye uygun olduğu için alanı daha verimli kullanır; bu da maliyeti olumlu etkiler.",
      },
    ],
  },
];

export const servicePageBySlug = new Map(servicePagesTr.map((page) => [page.slug, page]));
export const servicePageByServiceId = new Map(servicePagesTr.map((page) => [page.serviceId, page]));
