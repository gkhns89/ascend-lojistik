import type { Content } from "./index";

/**
 * Ingilizce icerik. Turkce metinlerin birebir karsiligidir; yeni iddia
 * eklenmez. Portal bu surumde tanitilmaz, bu yuzden nav.cta disinda portala
 * yonlendiren bir metin yoktur (bkz. src/components/site/header.tsx).
 */
export const en: Content = {
  brand: {
    name: "ASCEND",
    suffix: "LOGISTICS",
    tagline: "Global Network. Strong Operations. Reliable Logistics.",
  },
  nav: {
    home: "Home",
    about: "About",
    services: "Services",
    network: "Global Network",
    digital: "Digital Solutions",
    contact: "Contact",
    cta: "Get a Quote",
  },
  home: {
    meta: {
      title: "Ascend Logistics | Global International Freight Forwarding",
      description:
        "Ascend Logistics provides road, sea, air and multimodal freight forwarding across Europe, the Americas, the Far East, the Middle East and Africa.",
    },
    hero: {
      eyebrow: "International Freight Forwarding",
      title: "Logistics Solutions That Connect the World",
      subtitle:
        "From Europe to the Americas, from the Far East to Africa: global solutions in road, sea and air freight.",
      primaryCta: "Get a Quote",
      secondaryCta: "Explore Our Services",
      badges: ["Road", "Sea", "Air", "Multimodal"],
    },
    about: {
      eyebrow: "About Us",
      title: "Founded in 2022, grown into a global network.",
      body: "Ascend Logistics was founded to bring a fast, reliable and solution-oriented approach to international freight forwarding. We combine a young and dynamic team with strong international partnerships, running operations across Europe, the Americas, the Far East, the Middle East and Africa.",
      quote: "Distances change. Our approach to solutions does not.",
      cta: "Our company profile",
      highlights: [
        { title: "Founded", text: "Established in 2022 with a focus on international freight." },
        { title: "Approach", text: "A tailored solution for every cargo, route and industry." },
        { title: "Scope", text: "End-to-end tracking from origin to final destination." },
      ],
    },
    services: {
      eyebrow: "Our Services",
      title: "The right transport model for every type of cargo",
      subtitle:
        "We plan and track the entire operation across road, sea, air and combined transport.",
      cta: "All services",
    },
    network: {
      eyebrow: "Global Reach",
      title: "Anywhere in the World, With a Single Partner",
      subtitle:
        "Our international partner network lets us plan operations across five continents and build route and cost advantages together.",
      cta: "Explore the global network",
    },
    why: {
      eyebrow: "Why Ascend?",
      title: "Predictability at every step of the operation",
      items: [
        {
          title: "Reliability",
          text: "Operations managed against committed timelines, traceable and reportable throughout.",
        },
        {
          title: "Speed",
          text: "Fast quoting, fast loading plans and short response times.",
        },
        {
          title: "Transparency",
          text: "Clear information throughout the process, with no surprise costs or uncertainty.",
        },
        {
          title: "Flexibility",
          text: "Immediate adaptation to changing routes, cargo types and deadlines.",
        },
        {
          title: "Global Reach",
          text: "A partner network across Europe, the Americas, the Far East, the Middle East and Africa.",
        },
        {
          title: "Customer Focus",
          text: "A single point of contact, end-to-end accountability and solutions designed around your needs.",
        },
      ],
    },
    digital: {
      eyebrow: "Digital Solutions",
      title: "Digital infrastructure that makes logistics manageable",
      subtitle:
        "Our digital solutions make the operation visible, bringing the status of your cargo, the financial picture and transit processes into one place.",
      cta: "See the digital solutions",
    },
    quote: {
      eyebrow: "Request a Quote",
      title: "Let us build the right route for your cargo together.",
      subtitle:
        "Share your route, cargo type and deadline; our operations team will prepare a tailored solution and quotation.",
      primaryCta: "Get a Quote",
      secondaryCta: "Contact Us",
    },
  },
  about: {
    meta: {
      title: "About | Ascend Logistics",
      description:
        "Ascend Logistics was founded in 2022 and runs international freight operations across Europe, the Americas, the Far East, the Middle East and Africa.",
    },
    hero: {
      eyebrow: "About Us",
      title: "A young, dynamic team with global connections",
      subtitle: "Global Network. Strong Operations. Reliable Logistics.",
    },
    story: {
      eyebrow: "Company Profile",
      title: "For us, logistics is more than moving cargo",
      paragraphs: [
        "Ascend Logistics was founded in 2022 to bring a fast, reliable and solution-oriented approach to international freight forwarding.",
        "Thanks to the international partner network we have built since our founding and our growing operational capability, we today carry out logistics operations across Europe, North and South America, the Far East, the Middle East, Africa and many other parts of the world.",
        "We combine our young and dynamic team with our global connections, developing tailored solutions for our customers' needs across different industries, routes and cargo types.",
        "In road, sea and air freight we plan and track the entire operation, from the point of departure to the final destination.",
      ],
      pillarsTitle: "The foundation of how we work",
      pillarsIntro: "For us, logistics is not simply moving a shipment from one point to another.",
      pillars: [
        "Determining the right transport model",
        "Building a suitable route",
        "Securing advantages in time and cost",
        "Following the operation consistently",
        "Keeping the customer correctly informed throughout",
      ],
    },
    mission: {
      label: "Our Mission",
      text: "To make international logistics faster, more reliable, more transparent and more manageable for our customers. To become a dependable part of our customers' supply chains through strong partners, a dynamic operational structure and a solution-oriented approach.",
    },
    vision: {
      label: "Our Vision",
      text: "To become a strong global logistics brand, reaching from Türkiye to the world and chosen in international markets for its reliability and service quality. To build a logistics organisation that keeps developing and grows together with its customers by bringing together technology, operational experience and international cooperation.",
    },
  },
  services: {
    meta: {
      title: "Services | Ascend Logistics",
      description:
        "Road, sea, air, multimodal, project cargo and groupage/full load freight forwarding solutions.",
    },
    hero: {
      eyebrow: "Our Services",
      title: "End-to-end international freight forwarding",
      subtitle:
        "We build the right transport model for your cargo, route and deadline, and manage the operation from a single point.",
    },
    items: [
      {
        id: "karayolu",
        icon: "truck",
        title: "Road Freight",
        short:
          "Full and groupage road solutions across Europe, the Balkans, the CIS and the Middle East.",
        body: "We plan vehicles according to curtain-side, refrigerated, mega and special equipment requirements, and manage customs and transit processes as part of the operation.",
        points: [
          "Full truck load (FTL) and groupage (LTL)",
          "Special equipment and refrigerated vehicle planning",
          "Transit and customs process tracking",
        ],
      },
      {
        id: "denizyolu",
        icon: "ship",
        title: "Sea Freight",
        short: "Competitive FCL and LCL container solutions supported by a global port network.",
        body: "Working with mainline carriers and our agency network, we balance the right service, the right transit time and the right cost for your cargo.",
        points: [
          "FCL / LCL container operations",
          "Port-to-port and door-to-door solutions",
          "Container type selection and booking management",
        ],
      },
      {
        id: "gemi-acenteligi",
        icon: "anchor",
        title: "Ship Agency",
        short:
          "Coordination, documentation and on-site processes for port calls, managed from one place.",
        body: "We coordinate between the parties involved in vessel and port operations, and transparently follow berthing, documentation and operational processes.",
        points: [
          "Port call and operational coordination",
          "Documentation and official process handling",
          "A single point of contact between vessel, port and site",
        ],
      },
      {
        id: "havayolu",
        icon: "plane",
        title: "Air Freight",
        short: "Fast direct and consolidated air cargo solutions for time-critical shipments.",
        body: "For urgent shipments, high-value goods and short-deadline projects we build the most suitable flight plan and follow the process door to door.",
        points: [
          "Direct and transit flight planning",
          "Time-critical and urgent shipments",
          "Airport and door delivery options",
        ],
      },
      {
        id: "multimodal",
        icon: "route",
        title: "Multimodal / Combined Transport",
        short: "Combining road, sea and air to optimise the balance between transit time and cost.",
        body: "By building more than one transport mode into a single operational plan, we create route flexibility and cost advantages.",
        points: [
          "Mode combination and route optimisation",
          "Transfer point and terminal management",
          "End-to-end accountability with a single contact",
        ],
      },
      {
        id: "proje",
        icon: "crane",
        title: "Project and Special Cargo",
        short:
          "Engineering-led planning for out-of-gauge, heavy-lift and special equipment shipments.",
        body: "We plan the loading study, route feasibility, permit processes and site coordination together, and report on every step.",
        points: [
          "Out-of-gauge and heavy-lift transport",
          "Route surveys and permit processes",
          "Site and loading coordination",
        ],
      },
      {
        id: "parsiyel",
        icon: "boxes",
        title: "Groupage and Full Loads",
        short: "Flexible capacity management, from small regular shipments to full loads.",
        body: "Regular consolidation programmes give small shipments a cost advantage, while full loads deliver speed and direct delivery.",
        points: [
          "Regular consolidation programmes",
          "Flexible capacity and schedule planning",
          "Warehousing and consolidation support",
        ],
      },
    ],
    cta: {
      title: "Which model is right for your cargo?",
      subtitle:
        "Share your route and cargo details and we will determine the most suitable transport model together.",
      button: "Get a Quote",
    },
  },
  network: {
    meta: {
      title: "Global Network | Ascend Logistics",
      description:
        "An international partner network across Europe, North and South America, the Far East, the Middle East and Africa.",
    },
    hero: {
      eyebrow: "Global Network",
      title: "Operations on five continents, one partner",
      subtitle:
        "Our international partner network lets us combine local operational knowledge with global standards across different regions.",
    },
    regionsTitle: "Key regions",
    regions: [
      {
        id: "europe",
        name: "Europe",
        text: "Road and combined transport options through our global agency network, coordinated from a single point.",
      },
      {
        id: "namerica",
        name: "North America",
        text: "Sea and air transport models, with port and inland distribution coordinated through local partners.",
      },
      {
        id: "samerica",
        name: "South America",
        text: "Container operations through our international agency network, alternative routing and end-to-end tracking.",
      },
      {
        id: "fareast",
        name: "Far East",
        text: "Developing the right transport model for your cargo from FCL/LCL, consolidation and air cargo options.",
      },
      {
        id: "mideast",
        name: "Middle East",
        text: "Alternative routing across road, sea and combined options, coordinated from a single point.",
      },
      {
        id: "africa",
        name: "Africa",
        text: "Port and inland coordination for project cargo and container shipments through our global agency network.",
      },
    ],
    strengthsTitle: "What makes our network strong",
    strengths: [
      {
        title: "Global agency network",
        text: "Processes in different regions are carried out through our international agency and partner network.",
      },
      {
        title: "A single contact",
        text: "Every process across every country is managed by one operations lead.",
      },
      {
        title: "Route alternatives",
        text: "More than one route and mode scenario is evaluated for each shipment.",
      },
    ],
  },
  digital: {
    meta: {
      title: "Digital Solutions | Ascend Logistics",
      description:
        "Digital logistics solutions covering shipment tracking, financial visibility, NCTS transit monitoring and automated e-mail notifications.",
    },
    hero: {
      eyebrow: "Digital Solutions",
      title: "Digital infrastructure that makes operations visible",
      subtitle:
        "Our customer portal approach is being designed to bring shipment status, financial visibility and transit processes together on one screen.",
      note: "The visuals below are illustrative and show an example interface layout.",
    },
    modules: [
      {
        id: "tracking",
        icon: "radar",
        title: "Shipment Tracking",
        text: "A tracking approach that shows which stage a shipment has reached, with planned and actual dates in a single list.",
        points: [
          "Shipment status flow",
          "Planned versus actual date comparison",
          "Access to documents and references",
        ],
      },
      {
        id: "finance",
        icon: "wallet",
        title: "Financial Visibility",
        text: "A finance module designed so that shipment-level costs and account balances can be followed clearly and consistently.",
        points: [
          "Shipment-level cost view",
          "Account balance and due date tracking",
          "Document-level matching",
        ],
      },
      {
        id: "ncts",
        icon: "shield",
        title: "NCTS Transit Monitoring",
        text: "A tracking setup intended to let you follow the status of transit declarations on the same screen as the operations team.",
        points: [
          "Transit declaration statuses",
          "Deadline and arrival checkpoints",
          "A shared view with the operations team",
        ],
      },
      {
        id: "notifications",
        icon: "bell",
        title: "Automated E-mail Notifications",
        text: "A notification structure that automatically informs the relevant people when a critical status changes.",
        points: [
          "Automatic notifications based on status",
          "Distribution by person and role",
          "Summarised operational information",
        ],
      },
    ],
    preview: {
      eyebrow: "Example Interface",
      title: "The operation on a single screen",
      subtitle: "Illustrative example — contains no real customer data.",
      columns: ["Reference", "Route", "Mode", "Status"],
      rows: [
        { ref: "ASC-0000A", route: "Istanbul → Rotterdam", mode: "Road", status: "In transit" },
        { ref: "ASC-0000B", route: "Shanghai → Izmir", mode: "Sea", status: "At port" },
        { ref: "ASC-0000C", route: "Istanbul → Chicago", mode: "Air", status: "Scheduled" },
        { ref: "ASC-0000D", route: "Mersin → Algiers", mode: "Multimodal", status: "In customs" },
      ],
    },
  },
  contact: {
    meta: {
      title: "Contact | Ascend Logistics",
      description:
        "Reach the Ascend Logistics operations team through our quotation request and contact forms.",
    },
    hero: {
      eyebrow: "Contact",
      title: "Get in touch with our operations team",
      subtitle: "Send us your quotation request or write to us with general enquiries.",
    },
    info: {
      title: "Contact Details",
      note: "You can reach our team directly for your international logistics needs.",
      items: [
        { label: "Phone", value: "+90 212 963 0553" },
        { label: "E-mail", value: "info@ascendlojistik.com" },
        {
          label: "Address",
          value:
            "Ataköy 7-8-9-10.Kısım Mah. Çobançeşme E-5 Yanyol Cad. No:20/1 Ataköy Towers A Blok Kat:6 İç Kapı No:109, 34158 Bakırköy/İstanbul, Türkiye",
        },
      ],
    },
    quoteForm: {
      title: "Quotation Request",
      subtitle:
        "Once you fill in the details, your e-mail application opens with the request prepared; you complete the sending yourself.",
      fields: {
        company: "Company Name",
        person: "Contact Person",
        email: "E-mail",
        phone: "Phone",
        origin: "Origin",
        destination: "Destination",
        mode: "Transport Mode",
        cargo: "Cargo Type / Weight / Dimensions",
        message: "Additional Notes",
      },
      modes: ["Road", "Sea", "Ship Agency", "Air", "Multimodal", "Project Cargo"],
      submit: "Send Request by E-mail",
    },
    contactForm: {
      title: "Contact Form",
      subtitle:
        "Once you fill in the details, your e-mail application opens with the message prepared; you complete the sending yourself.",
      fields: { name: "Full Name", email: "E-mail", subject: "Subject", message: "Your Message" },
      submit: "Send Message by E-mail",
    },
  },
  footer: {
    about:
      "Ascend Logistics is a globally focused logistics organisation providing international solutions in road, sea and air freight.",
    slogan: "Anywhere in the World, With a Single Partner.",
    columns: {
      pages: "Pages",
      services: "Services",
      contact: "Contact",
    },
    contactNote:
      "+90 212 963 0553 · info@ascendlojistik.com · Ataköy Towers, Bakırköy/İstanbul, Türkiye",
    rights: "All rights reserved.",
  },
};
