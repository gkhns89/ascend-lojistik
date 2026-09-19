import type { ServicePage } from "./service-pages-tr";

/**
 * Hizmet detay sayfalarinin Ingilizce karsiliklari. Turkce surumle ayni
 * yapida ve ayni bilgiyi tasir; yeni iddia eklenmez. Sirkete dair sayisal
 * iddia (ofis sayisi, filo, sefer sikligi, sertifika) burada da yoktur.
 */
export const servicePagesEn: ServicePage[] = [
  {
    slug: "road-freight",
    serviceId: "karayolu",
    meta: {
      title: "Road Freight | Ascend Logistics",
      description:
        "Full truck load (FTL) and groupage (LTL) road freight across Europe, the Balkans, the CIS and the Middle East; equipment selection, CMR and NCTS transit.",
    },
    hero: {
      eyebrow: "Road Freight",
      title: "Full and groupage road freight across Europe and the Middle East",
      subtitle:
        "End-to-end road operations planned around the right equipment, the right route and the correct transit regime.",
    },
    intro:
      "Road freight is the only mode that can deliver door to door on shipments from Türkiye to Europe and the Middle East. Because no transhipment is required, the cargo is handled fewer times and transit times are markedly shorter than by sea. At Ascend Logistics we plan vehicles around the weight, volume, temperature requirements and dangerous goods class of the cargo, and treat customs and transit as an inseparable part of the operation.",
    sections: [
      {
        heading: "The difference between full loads (FTL) and groupage (LTL)",
        body: [
          "A full truck load (FTL) dedicates the entire vehicle to a single consignment. Because the cargo is not combined with another shipment en route, the risk of transhipment disappears and transit time is as short as it can be. It is the usual choice where the cargo fills the vehicle, is fragile, or has a critical deadline.",
          "Groupage (LTL) consolidates cargo from different shippers onto the same vehicle. Because the cost reflects only the space occupied, it offers a significant advantage on small, regular shipments. In return, the consolidation and transhipment steps make transit times longer than on a full load.",
          "Groupage pricing takes account of the space the cargo occupies as well as its weight. On European lanes the common practice is to treat each loading metre (ldm) as equivalent to a given weight; that ratio varies by carrier and by lane and is confirmed at the quotation stage.",
        ],
      },
      {
        heading: "Choosing the equipment",
        body: [
          "Vehicle type depends as much on loading and unloading conditions as on the physical properties of the cargo. Curtain-side vehicles are used where side or top loading is required, and refrigerated vehicles for food and pharmaceutical shipments that need temperature control. Mega trailers give a volume advantage on high-volume but light cargo.",
          "Lowbed and specialised equipment come into play for out-of-gauge dimensions or heavy tonnage. Those shipments also require a route survey and a permit process, so they are handled under project cargo.",
        ],
      },
      {
        heading: "Documents and the transit regime",
        body: [
          "The CMR is the core document evidencing the contract of carriage in international road transport. It records the consignor, the consignee, the description of the goods and the delivery terms, and is signed on delivery to show that carriage is complete.",
          "On shipments between the European Union and common transit countries, customs transit is handled electronically through NCTS; a T1 declaration allows the goods to move between countries under customs supervision. Opening the transit correctly and discharging it on time determines whether the shipment moves without delay.",
          "Cargo classed as dangerous goods falls under ADR. Packaging, labelling, vehicle equipment and driver certification are planned according to those rules.",
        ],
      },
    ],
    specs: {
      heading: "Commonly used vehicle types",
      note: "Dimensions and capacities vary by vehicle; planning is done at the quotation stage using the actual measurements of the cargo.",
      rows: [
        { label: "Curtain-side (standard)", value: "Side and top loading, general cargo" },
        { label: "Mega trailer", value: "High-volume, low-density cargo" },
        { label: "Refrigerated", value: "Temperature-controlled food and pharmaceuticals" },
        { label: "Lowbed / special equipment", value: "Out-of-gauge and heavy-lift cargo" },
      ],
    },
    faq: [
      {
        q: "Should I choose groupage or a full load?",
        a: "If the cargo fills a significant share of the vehicle's capacity, or the deadline is critical, a full load is usually the better option. For small, regular shipments with some flexibility on timing, groupage offers a cost advantage. The decision becomes clear at the quotation stage once volume and weight are known.",
      },
      {
        q: "What is a CMR and why does it matter?",
        a: "The CMR is the document evidencing the contract of carriage in international road transport. It records the condition of the goods when they were collected and the delivery terms, is signed on delivery, and is the document relied on in any dispute over damage or shortage.",
      },
      {
        q: "How long does transit take?",
        a: "It depends on the route, congestion at border crossings, customs formalities and whether the shipment moves as a full load or groupage. A realistic transit time is given once the route and cargo details have been shared, and accompanies the quotation.",
      },
    ],
  },

  {
    slug: "sea-freight",
    serviceId: "denizyolu",
    meta: {
      title: "Sea Freight | Ascend Logistics",
      description:
        "FCL and LCL container shipping, container types, bills of lading and booking management; port-to-port and door-to-door sea freight solutions.",
    },
    hero: {
      eyebrow: "Sea Freight",
      title: "The right balance of service and cost in FCL and LCL shipping",
      subtitle:
        "Port-to-port or door-to-door sea operations planned with mainline carriers and our agency network.",
    },
    intro:
      "Sea freight carries the lowest cost per unit and forms the backbone of high-volume shipments where the schedule allows some flexibility. On Far East, American and European lanes there are two basic models, using either the whole container or part of it depending on the volume of the cargo. At Ascend Logistics we handle service selection, booking management and port processes from a single point.",
    sections: [
      {
        heading: "The difference between FCL and LCL",
        body: [
          "FCL (Full Container Load) dedicates the whole container to a single consignment. The container is sealed at the loading point and is not opened until arrival, which reduces both handling and the risk of damage. It is preferred where the cargo fills a container, or where it must not be mixed with other goods even if it does not.",
          "LCL (Less than Container Load) combines cargo from different shippers in the same container. The consolidation at origin and deconsolidation at destination lengthen the process, but on small shipments it offers a clear cost advantage over hiring a whole container.",
          "LCL pricing compares weight against volume and charges on whichever is greater; the common practice in the industry is to treat one cubic metre as equivalent to one thousand kilograms. On light, bulky cargo the cost is therefore set by volume.",
        ],
      },
      {
        heading: "Container types",
        body: [
          "Standard dry van containers are used for general cargo. Where the cargo is tall, a High Cube container offers additional internal height over a standard box.",
          "Reefer containers are used for temperature-controlled shipments, flat racks for long cargo that will not pass through the container doors, and open top containers where the cargo must be craned in from above. Container type is decided together with the dimensions of the cargo and the loading method.",
        ],
      },
      {
        heading: "Bills of lading, delivery terms and free time",
        body: [
          "The core document in sea freight is the bill of lading. It represents the contract of carriage, the receipt for the goods and title to them; releasing the cargo at destination depends on it.",
          "Incoterms determine where responsibility and costs pass between the parties. Terms such as FOB, CIF or EXW directly affect who bears the local charges beyond the freight itself, so they need to be settled at the quotation stage.",
          "If a container stays at the destination port beyond the free time allowed it incurs demurrage, and a delay in returning the container to the carrier incurs detention. Planning customs clearance and inland transport in advance avoids both.",
        ],
      },
    ],
    specs: {
      heading: "Common container types",
      note: "Internal dimensions and payloads vary by carrier and by the age of the container.",
      rows: [
        { label: "20' / 40' Dry Van", value: "General cargo, standard dry goods" },
        { label: "40' High Cube", value: "Bulky cargo needing extra internal height" },
        { label: "Reefer", value: "Temperature-controlled shipments" },
        { label: "Open Top / Flat Rack", value: "Top loading, out-of-gauge dimensions" },
      ],
    },
    faq: [
      {
        q: "Is LCL or FCL more suitable?",
        a: "If the cargo fills a significant part of a container, FCL is usually better on both cost and transit time. For small shipments LCL is more suitable. A precise comparison emerges from a quotation based on volume and weight.",
      },
      {
        q: "What are demurrage and detention?",
        a: "Demurrage is the charge that arises when a container stays in the port area beyond the free time allowed. Detention arises when the container is returned late to the carrier after unloading. Both are avoided by planning customs clearance and inland transport in advance.",
      },
      {
        q: "Is door-to-door delivery possible?",
        a: "Yes. In addition to port-to-port carriage, inland transport can be arranged from the point of origin to the port and from the destination port to the delivery address, with customs formalities handled as part of the operation.",
      },
    ],
  },

  {
    slug: "air-freight",
    serviceId: "havayolu",
    meta: {
      title: "Air Freight | Ascend Logistics",
      description:
        "Air cargo for time-critical shipments: direct and transit flight planning, air waybills, volumetric weight and door delivery options.",
    },
    hero: {
      eyebrow: "Air Freight",
      title: "Air cargo for time-critical shipments",
      subtitle:
        "The most suitable flight plan and door-to-door tracking for urgent shipments, high-value goods and short-deadline projects.",
    },
    intro:
      "Air freight outperforms every other mode where the deadline is what matters. Its unit cost is high; in return it lowers total cost wherever it prevents inventory expense, a production stoppage or a contractual penalty for late delivery. High-value, low-volume, time-critical cargo is the typical use case.",
    sections: [
      {
        heading: "How the rate is calculated: volumetric weight",
        body: [
          "Air cargo is charged on whichever is greater, the actual weight of the shipment or its volumetric weight. That figure is known as the chargeable weight.",
          "Volumetric weight is found, under the widely applied IATA rule, by multiplying length, width and height in centimetres and dividing by 6000. One cubic metre is therefore treated as roughly 167 kilograms. On light, bulky cargo the cost consequently exceeds the actual weight.",
          "Because the dimensions of the packaging feed straight into the cost, palletising and boxing plans should be reviewed with the real external measurements before quoting.",
        ],
      },
      {
        heading: "Direct and transit flight planning",
        body: [
          "Direct flights give the shortest transit time and remove the risk of delay caused by transfers. Connecting options offer a wider destination network and usually a more favourable cost.",
          "The cargo hold of passenger aircraft (belly cargo) provides regular, frequent capacity, while freighters come into play for bulky or unusually shaped cargo. The flight plan is built by weighing the dimensions of the cargo, the deadline and the handling conditions at destination together.",
        ],
      },
      {
        heading: "Documents and special cargo",
        body: [
          "The core document in air transport is the air waybill (AWB). It evidences the contract of carriage and receipt of the goods; unlike a sea bill of lading it does not represent title and therefore cannot be endorsed.",
          "Shipments classed as dangerous goods fall under the IATA Dangerous Goods Regulations; packaging, labelling and declaration are prepared to those rules. Lithium batteries, aerosols and chemicals are common cargo types requiring that treatment.",
          "Security regulations require air cargo to pass a security screening before loading. Known consignor status and a correctly prepared declaration keep that process moving without delay.",
        ],
      },
    ],
    faq: [
      {
        q: "What does volumetric weight mean?",
        a: "It is the weight equivalent of the space the cargo occupies. In air freight it is found by multiplying length, width and height in centimetres and dividing by 6000, then comparing the result with the actual weight; the rate is charged on whichever is greater.",
      },
      {
        q: "Is an AWB the same as a bill of lading?",
        a: "No. An air waybill evidences the contract of carriage and receipt of the goods, but does not represent title and cannot be endorsed. A sea bill of lading does represent title and is transferable.",
      },
      {
        q: "Can I ship a product containing lithium batteries?",
        a: "Lithium batteries are classed as dangerous goods and require packaging, labelling and declaration compliant with IATA rules. The battery type, its capacity and whether it ships inside equipment all affect planning, so these should be shared before quoting.",
      },
    ],
  },

  {
    slug: "ship-agency",
    serviceId: "gemi-acenteligi",
    meta: {
      title: "Ship Agency | Ascend Logistics",
      description:
        "Coordination, documentation and on-site processes for port calls managed from one place: berthing, official formalities and operational tracking.",
    },
    hero: {
      eyebrow: "Ship Agency",
      title: "A single point of contact at every stage of the port call",
      subtitle:
        "We coordinate between the vessel, the port and the authorities, and follow berthing, documentation and operations transparently.",
    },
    intro:
      "A ship agent acts on behalf of the owner or operator at the port the vessel calls at. A port call requires the coordination of many parties: the port authority, customs, health authorities, the terminal operator, pilotage and towage services and the cargo interests. The agent's role is to act as the single point of contact between them and to make the time the vessel spends in port predictable.",
    sections: [
      {
        heading: "How a port call is handled",
        body: [
          "The process begins with notice of the vessel's arrival. A berth is requested against the estimated time of arrival; the pilot and tug requirement, terminal availability and tidal conditions are weighed together to produce the berthing plan.",
          "Once the vessel is alongside, the loading or discharge operation is coordinated with the terminal operator. Progress, delay risks and the expected completion time are reported to the parties involved throughout.",
          "At departure, outward clearance is completed and the vessel is despatched to her next port. Because a shorter stay translates directly into cost savings, planning ahead is decisive.",
        ],
      },
      {
        heading: "Documentation and official formalities",
        body: [
          "A port call requires declarations relating to the vessel and the cargo to be made completely and on time. Cargo manifests, crew and stores lists and health and security declarations are submitted to the relevant authorities.",
          "Preparing the documents needed to release the cargo and sharing them with the cargo interests is also the agent's responsibility. Because a gap in the paperwork can hold up both the vessel and the cargo, the process is followed from the outset.",
        ],
      },
      {
        heading: "Working alongside freight services",
        body: [
          "When agency work runs together with sea freight operations, the port-side process and the movement of the cargo inland become part of one plan.",
          "That continuity allows customs formalities and inland transport to be arranged around the vessel's schedule, which heads off charges such as demurrage arising from containers sitting in port.",
        ],
      },
    ],
    faq: [
      {
        q: "What exactly does a ship agent take on?",
        a: "The agent acts for the owner or operator at the port of call, handling every step of the port call: berth planning, official declarations, terminal coordination and communication with the cargo interests.",
      },
      {
        q: "Can I use agency services without the freight?",
        a: "Yes. Agency work can be provided independently of carriage. When it runs alongside a sea freight operation, the port and inland processes come together in one plan, which brings a coordination advantage.",
      },
    ],
  },

  {
    slug: "multimodal-transport",
    serviceId: "multimodal",
    meta: {
      title: "Multimodal and Combined Transport | Ascend Logistics",
      description:
        "Combined transport solutions that bring road, sea and air into one operational plan to optimise the balance between transit time and cost.",
    },
    hero: {
      eyebrow: "Multimodal / Combined Transport",
      title: "More than one mode, a single operational plan",
      subtitle:
        "We combine modes for route flexibility and cost advantage, and manage the transfer points from one place.",
    },
    intro:
      "Multimodal transport carries a shipment under a single contract using more than one of the road, sea, air and rail modes. The aim is to use the most suitable mode on each leg and arrive at a balanced result between time and cost. Because it runs under one contract, responsibility is not divided and there is a single point of contact throughout.",
    sections: [
      {
        heading: "Where it pays off",
        body: [
          "Shipments that would be expensive entirely by air, yet too slow entirely by sea, are the typical case for multimodal planning. Covering the long leg by sea and the time-critical final leg by road or air brings the total transit time down to an acceptable level while containing the cost.",
          "Combined planning also comes into play where no direct service exists. Routes built through transfer hubs give access to destinations a single mode cannot reach.",
        ],
      },
      {
        heading: "Transfer points and managing the risk",
        body: [
          "The critical points of a multimodal move are the transfers. Every change of mode means extra handling, extra paperwork and extra time; the quality of the plan is measured by how smoothly those transitions run.",
          "Terminal availability at the transfer points, connection times and customs formalities are arranged before the operation starts. Alternative scenarios are set out in advance against the risk of a missed connection.",
          "Packaging that will withstand several handlings matters more here than on single-mode shipments, and palletising and securing plans are prepared accordingly.",
        ],
      },
      {
        heading: "One contract, one responsibility",
        body: [
          "Running the legs of a shipment under separate contracts makes it hard to establish responsibility when something goes wrong. In a multimodal arrangement the whole operation runs under one plan and one point of contact.",
          "That structure also makes it possible to see where the cargo is from one place; the status information and the flow of documents are not fragmented.",
        ],
      },
    ],
    faq: [
      {
        q: "Are multimodal and intermodal the same thing?",
        a: "They are close but distinct. In multimodal transport every leg runs under a single contract of carriage and a single responsibility. In intermodal transport the cargo stays within the same transport unit as it changes mode, and the legs may be subject to separate contracts.",
      },
      {
        q: "Does transhipment increase the risk of damage?",
        a: "Every handling carries some risk in theory. That is why transfer points, packaging strength and securing plans are assessed together before the operation; with suitable packaging the risk stays under control in practice.",
      },
    ],
  },

  {
    slug: "project-cargo",
    serviceId: "proje",
    meta: {
      title: "Project and Special Cargo | Ascend Logistics",
      description:
        "Engineering-led planning for out-of-gauge and heavy-lift cargo: loading studies, route feasibility, permit processes and site coordination.",
    },
    hero: {
      eyebrow: "Project and Special Cargo",
      title: "Engineering-led planning for out-of-gauge and heavy-lift cargo",
      subtitle:
        "From route surveys and permits to loading plans and site coordination, every step is arranged in advance.",
    },
    intro:
      "Project cargo covers loads that will not fit standard vehicle and container dimensions or that exceed ordinary weight limits. Turbine sections, generators, tanks, presses and power equipment are typical examples. On these shipments transport is less a haulage job than an exercise in engineering and permits; the preparation can take longer than the move itself.",
    sections: [
      {
        heading: "Route survey and feasibility",
        body: [
          "Planning begins by establishing the true dimensions of the cargo and its centre of gravity. The bridges, viaducts, overpasses, tunnel heights, turning radii and road load capacities along the route are then examined.",
          "Site visits are carried out at the critical points. Temporary measures are planned where necessary: removing signs or obstacles, raising power lines or using an alternative route may all come into play.",
          "The feasibility study determines whether the move is possible and what equipment it will take. Its conclusions form the basis of both the schedule and the cost estimate.",
        ],
      },
      {
        heading: "Equipment and the loading plan",
        body: [
          "Depending on weight and dimensions, lowbed, semi-lowbed or modular trailers are used. On modular systems the number of axles is increased to suit the load so that weight is distributed correctly on the road.",
          "Where a sea leg is required, flat rack or open top containers are considered, and where the dimensions exceed even those, conventional vessel loading options are evaluated.",
          "The loading and lashing plan is prepared so that the cargo cannot shift during the move; crane capacity and lifting points form part of that plan.",
        ],
      },
      {
        heading: "Permits and site coordination",
        body: [
          "Out-of-gauge and heavy-lift moves require special transport permits from the authorities along the route. Because the permit process varies by country and by route, starting early is critical.",
          "Pilot and escort vehicles, traffic management where needed and time-restricted passages come into play during the move. All of these are settled in advance and carried out in step with the parties involved.",
          "Every stage of the operation is reported; loading, progress along the route and delivery are all recorded.",
        ],
      },
    ],
    faq: [
      {
        q: "How far in advance does a project move need planning?",
        a: "It depends on the route and how many points require permits. Because route surveys, equipment sourcing and official permits all take time, starting as early as possible reduces the risk of delay.",
      },
      {
        q: "What information do you need from me?",
        a: "The length, width, height and weight of the cargo, together with its centre of gravity and lifting points, form the basis of the plan. Site conditions at the loading and delivery addresses, along with any drawings and technical documents, speed the process up.",
      },
    ],
  },

  {
    slug: "groupage",
    serviceId: "parsiyel",
    meta: {
      title: "Groupage and Full Loads | Ascend Logistics",
      description:
        "Flexible capacity management from small regular shipments to full loads: consolidation programmes, warehousing and schedule planning.",
    },
    hero: {
      eyebrow: "Groupage and Full Loads",
      title: "The right capacity for the volume, planned around the deadline",
      subtitle:
        "A cost advantage through consolidation on small shipments, speed and direct delivery on full loads.",
    },
    intro:
      "Not every shipment fills a vehicle or a container. Groupage combines cargo from different shippers on the same vehicle or in the same container so that small shipments can also move at a sensible cost. A full load dedicates the whole capacity to one consignment and is preferred where speed and direct delivery come first.",
    sections: [
      {
        heading: "How consolidation works",
        body: [
          "Groupage shipments are collected at a consolidation point in the region of origin. Cargo heading for the same lane is combined into a vehicle or container and separated again at the destination for onward delivery.",
          "That structure lets cargo that could not fill a vehicle on its own use regular services. In return, the collection and separation steps make transit times longer than on a full load.",
          "For companies with regular, predictable volumes, a consolidation programme reduces both cost and uncertainty over timing.",
        ],
      },
      {
        heading: "How the cost is formed",
        body: [
          "Groupage pricing takes account of the space the cargo occupies as well as its weight. Loading metres are the measure on the road and cubic metres at sea; the cost is charged on whichever of weight or volume produces the higher figure.",
          "Packaging and palletising therefore feed straight into the cost. Cargo stacked properly and built to standard pallet dimensions takes up less space and is better protected during handling.",
          "On a full load the whole capacity is dedicated, so the cost is set per shipment; where the volume approaches capacity, that model usually becomes the more favourable one.",
        ],
      },
      {
        heading: "Packaging and handling",
        body: [
          "Groupage cargo is handled several times during carriage and shares space with other consignments. Packaging that withstands stacking, and cargo that stays within the pallet footprint, therefore matter.",
          "Labelling is what routes the cargo correctly during separation. Missing or illegible labels are among the most common causes of delay at destination.",
        ],
      },
    ],
    faq: [
      {
        q: "Why does groupage take longer?",
        a: "The cargo is collected at a consolidation point at origin and separated again at destination. Those extra steps, together with the departure schedule of the service, make transit times longer than on a full load.",
      },
      {
        q: "Is the cost based on weight?",
        a: "Weight is compared against the space the cargo occupies and the cost is charged on whichever produces the higher figure. On light, bulky cargo it is volume that decides.",
      },
      {
        q: "Can I ship without pallets?",
        a: "It is possible but not recommended. Palletised cargo is better protected during handling and uses space more efficiently because it stacks, which works in favour of the cost.",
      },
    ],
  },
];
