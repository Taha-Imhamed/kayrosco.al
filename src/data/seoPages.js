export const SITE_URL = "https://www.kayrosco.al";

export const categoryConfig = {
  consulting: {
    label: "Consulting",
    intro: "Company registration, residency permits, work permits, business licenses, tax registration, and compliance support in Albania.",
    accent: "#d88b52",
    serviceRoot: "/consulting",
  },
  travel: {
    label: "Travel",
    intro: "Airport transfers, private tours, car rentals, travel planning, and business travel support in Albania.",
    accent: "#7ec8bf",
    serviceRoot: "/travel",
  },
  tech: {
    label: "Tech",
    intro: "Web development, ecommerce, mobile apps, software solutions, and SEO support for businesses in Albania.",
    accent: "#8fd3ff",
    serviceRoot: "/tech",
  },
};

export const cities = [
  { slug: "tirana", name: "Tirana", region: "the capital and the main business hub" },
  { slug: "durres", name: "Durres", region: "a major logistics and coastal business center" },
  { slug: "vlore", name: "Vlore", region: "an important southern coastal destination" },
  { slug: "shkoder", name: "Shkoder", region: "a northern city with tourism and cross-border commercial activity" },
  { slug: "berat", name: "Berat", region: "a heritage destination with strong tourism demand" },
  { slug: "sarande", name: "Sarande", region: "a major Ionian tourism city" },
];

const serviceDefinitions = {
  consulting: [
    {
      slug: "company-registration-albania",
      legacySlugs: ["company-registration-albania-albania"],
      title: "Company Registration in Albania",
      summary: "Get support with company registration in Albania, including entity selection, NUIS setup, tax registration, and practical follow-up.",
      terms: ["business registration", "company formation", "NUIS", "National Business Center", "tax registration"],
      benefits: ["Clear setup process", "Support for foreign founders", "Reduced compliance mistakes"],
      steps: ["Choose the business structure", "Prepare shareholder and company documents", "Register with the relevant Albanian authority", "Complete tax and operational follow-up"],
    },
    {
      slug: "residency-permit-albania",
      legacySlugs: ["residency-permit-albania-albania"],
      title: "Residency Permit Support in Albania",
      summary: "Residency permit support for foreign founders, professionals, families, and long-stay applicants in Albania.",
      terms: ["residence permit", "temporary residence", "foreign residency", "renewal process", "immigration support"],
      benefits: ["Eligibility review", "Document preparation support", "Renewal planning"],
      steps: ["Review the legal basis for the permit", "Collect the identity and supporting records", "Prepare and submit the application", "Track renewal and compliance deadlines"],
    },
    {
      slug: "work-permit-albania",
      legacySlugs: ["work-permit-albania-albania"],
      title: "Work Permit Support in Albania",
      summary: "Practical guidance for employers and foreign professionals who need work permit support in Albania.",
      terms: ["employment authorization", "foreign employee permit", "labor compliance", "hiring in Albania", "permit renewal"],
      benefits: ["Employer coordination", "Clear permit workflow", "Lower filing risk"],
      steps: ["Confirm employment eligibility", "Prepare employer and employee records", "Submit the permit request", "Track approval, renewals, and obligations"],
    },
    {
      slug: "business-license-albania",
      legacySlugs: ["business-license-albania-albania"],
      title: "Business License Guide in Albania",
      summary: "Support for business license requirements, regulated activities, and operational compliance in Albania.",
      terms: ["license application", "regulated activity", "permits", "compliance documents", "business operations"],
      benefits: ["License requirement review", "Submission support", "Reduced regulatory confusion"],
      steps: ["Identify the regulated activity", "Prepare supporting documents", "Submit the request", "Manage renewals or amendments"],
    },
    {
      slug: "tax-registration-albania",
      legacySlugs: ["tax-registration-albania-albania"],
      title: "Tax Registration in Albania",
      summary: "Tax registration support for new and active businesses in Albania, including VAT and operational compliance planning.",
      terms: ["tax setup", "VAT registration", "fiscal obligations", "business tax", "financial compliance"],
      benefits: ["Aligned business setup", "Lower registration errors", "Better financial onboarding"],
      steps: ["Review the company tax profile", "Register required tax obligations", "Confirm invoicing and reporting readiness", "Maintain ongoing compliance"],
    },
    {
      slug: "public-document-assistance-albania",
      legacySlugs: ["public-document-assistance-albania-albania"],
      title: "Public Document Assistance in Albania",
      summary: "Get help with public documents, certificates, official records, and e-Albania related administrative procedures.",
      terms: ["certificates", "civil documents", "public services", "document request", "official records"],
      benefits: ["Simpler process navigation", "Faster document planning", "Reduced confusion around public procedures"],
      steps: ["Identify the exact document", "Confirm the issuing authority", "Prepare the required references", "Submit and follow up on the request"],
    },
  ],
  travel: [
    {
      slug: "tirana-airport-transfer",
      legacySlugs: [],
      title: "Tirana Airport Transfer",
      summary: "Reliable airport transfer support in Tirana for tourists, families, executives, and business travelers.",
      terms: ["airport pickup", "airport drop off", "private transfer", "Rinas airport", "travel logistics"],
      benefits: ["Smoother arrival experience", "Flexible transfer planning", "Better timing for flights and meetings"],
      steps: ["Share your flight details", "Confirm pickup or drop-off requirements", "Coordinate timing and route", "Receive practical local follow-up support"],
    },
    {
      slug: "car-rental-tirana",
      legacySlugs: ["car-rental-albania"],
      title: "Car Rental in Tirana",
      summary: "Flexible car rental support in Tirana for tourism, business travel, and multi-city itineraries across Albania.",
      terms: ["vehicle hire", "self drive", "travel mobility", "rental options", "road trip Albania"],
      benefits: ["Freedom to move", "Better route planning", "Vehicle options for different trip styles"],
      steps: ["Define the route and trip length", "Select the right vehicle category", "Confirm dates and driver documents", "Coordinate pickup and return logistics"],
    },
    {
      slug: "private-tours-albania",
      legacySlugs: ["private-tours-albania-albania"],
      title: "Private Tours in Albania",
      summary: "Private tours across Albania with more flexibility, local context, and customized trip planning.",
      terms: ["custom tours", "guided travel", "Albania itinerary", "private guide", "local experiences"],
      benefits: ["Tailored itineraries", "Flexible pacing", "Local destination knowledge"],
      steps: ["Choose the destinations", "Set the pace and style", "Coordinate transport and timing", "Finalize a practical day-by-day route"],
    },
    {
      slug: "travel-planning-albania",
      legacySlugs: ["travel-planning-albania-albania"],
      title: "Travel Planning in Albania",
      summary: "End-to-end travel planning for Albania, including itinerary design, practical local advice, and trip structure.",
      terms: ["trip planning", "itinerary design", "travel organization", "holiday planning", "custom route"],
      benefits: ["Clearer itineraries", "Better use of travel time", "Practical destination planning"],
      steps: ["Define travel goals", "Map the trip route", "Balance transport and sightseeing", "Finalize the itinerary"],
    },
    {
      slug: "day-trips-tirana",
      legacySlugs: ["day-trips-albania"],
      title: "Day Trips from Tirana",
      summary: "Day trip planning from Tirana to heritage cities, coastline spots, and mountain destinations in Albania.",
      terms: ["excursions", "one day tour", "short trips", "city departures", "destination planning"],
      benefits: ["Efficient travel days", "Useful for short visits", "Simple departure planning"],
      steps: ["Choose the destination", "Set the trip length", "Coordinate transport timing", "Finalize stops and return plan"],
    },
    {
      slug: "business-travel-support-albania",
      legacySlugs: ["business-travel-support-albania-albania"],
      title: "Business Travel Support in Albania",
      summary: "Travel support for executives, investors, staff, and partner visits in Albania.",
      terms: ["corporate travel", "executive support", "meeting logistics", "investor travel", "business itinerary"],
      benefits: ["Time-saving coordination", "Reliable transport schedules", "Better alignment with business meetings"],
      steps: ["Map the meeting schedule", "Coordinate transfers and hotel timing", "Adjust routes to business priorities", "Keep logistics responsive as plans evolve"],
    },
  ],
  tech: [
    {
      slug: "web-development-albania",
      legacySlugs: ["web-development-albania-albania"],
      title: "Web Development Services in Albania",
      summary: "Professional web development services in Albania for businesses that need fast, modern, conversion-focused websites.",
      terms: ["website development", "business website", "frontend development", "responsive design", "conversion optimization"],
      benefits: ["Stronger online presence", "Better lead capture", "Scalable site foundations"],
      steps: ["Define the website goals", "Plan structure and messaging", "Design and build the product", "Launch and optimize based on performance"],
    },
    {
      slug: "mobile-app-development-albania",
      legacySlugs: ["mobile-app-development-albania-albania"],
      title: "Mobile App Development in Albania",
      summary: "Mobile app development support in Albania for startups and established businesses building iOS and Android products.",
      terms: ["app development", "iOS app", "Android app", "product design", "mobile product"],
      benefits: ["Direct user reach", "Clearer product execution", "Scalable app roadmap"],
      steps: ["Clarify the app use case", "Define the MVP feature set", "Design the user experience", "Build, test, and iterate"],
    },
    {
      slug: "software-development-albania",
      legacySlugs: ["software-development-albania-albania"],
      title: "Software Development in Albania",
      summary: "Custom software development in Albania for internal systems, portals, workflow automation, and operational control.",
      terms: ["custom software", "business systems", "workflow automation", "portal development", "internal tools"],
      benefits: ["Less manual work", "More operational clarity", "Better-fit systems"],
      steps: ["Audit business workflows", "Define the software requirements", "Build iteratively", "Support rollout and improvement"],
    },
    {
      slug: "ecommerce-development-albania",
      legacySlugs: ["ecommerce-development-albania-albania"],
      title: "E-Commerce Development in Albania",
      summary: "E-commerce development support for Albanian businesses that need online stores, better checkout flow, and stronger digital sales.",
      terms: ["online store", "ecommerce website", "payments", "product catalog", "digital sales"],
      benefits: ["Better conversion flow", "Clear product structure", "Scalable store architecture"],
      steps: ["Define products and buyers", "Design the store structure", "Build checkout and integrations", "Optimize for sales growth"],
    },
    {
      slug: "seo-services-albania",
      legacySlugs: ["seo-optimization-albania", "seo-optimization-albania-albania"],
      title: "SEO Services for Albanian Businesses",
      summary: "SEO services in Albania covering technical SEO, on-page structure, landing pages, and long-term organic growth.",
      terms: ["search engine optimization", "keyword targeting", "organic traffic", "technical SEO", "content SEO"],
      benefits: ["More relevant search traffic", "Better search structure", "Long-term organic visibility"],
      steps: ["Audit the site", "Map search intent", "Improve technical and on-page SEO", "Publish and refine content clusters"],
    },
    {
      slug: "website-redesign-albania",
      legacySlugs: ["ui-ux-design-albania", "ui-ux-design-albania-albania"],
      title: "Website Redesign Services in Albania",
      summary: "Website redesign support for companies that need better UX, stronger messaging, cleaner structure, and improved performance.",
      terms: ["website redesign", "user experience", "interface design", "conversion", "customer journey"],
      benefits: ["Better usability", "Clearer positioning", "Improved conversion potential"],
      steps: ["Review the current site", "Define the content and UX goals", "Redesign the structure and interface", "Launch and refine"],
    },
  ],
};

const articleDefinitions = {
  consulting: [
    {
      slug: "how-to-register-a-company-in-albania",
      title: "How to Register a Company in Albania",
      searchIntent: "founders and investors who need a practical company registration process in Albania",
      painPoint: "foreign founders often struggle with business structure, required documents, tax setup, and local follow-up",
      relatedTerms: ["company registration in Albania", "business registration", "LLC formation", "NUIS", "National Business Center"],
      serviceSlug: "company-registration-albania",
      ctaText: "Get company registration support",
      steps: ["Choose the right legal form", "Prepare shareholder and director documents", "Submit the registration file", "Complete tax registration and operational setup"],
      mistakes: ["Choosing the wrong entity type", "Submitting incomplete supporting documents", "Ignoring tax setup after registration", "Assuming all follow-up is automatic"],
      faq: [
        ["Can foreigners register a company in Albania?", "Yes. Foreign founders can register companies in Albania, but they need the correct documents, structure, and practical follow-up support."],
        ["How long does company registration in Albania take?", "Timelines depend on the business structure, the completeness of the file, and the follow-up steps required after filing."],
        ["What documents are usually required?", "A standard file often includes identity documents, shareholder information, company details, and any case-specific authorizations or supporting records."],
      ],
    },
    {
      slug: "residency-permit-guide-for-foreigners-in-albania",
      title: "Residency Permit Guide for Foreigners in Albania",
      searchIntent: "foreigners who need to understand residency permit routes, documents, and renewal planning in Albania",
      painPoint: "many applicants do not know which permit route fits their purpose of stay or how early they should prepare renewals",
      relatedTerms: ["residency permit support", "residence permit Albania", "temporary residence", "permit renewal", "immigration documentation"],
      serviceSlug: "residency-permit-albania",
      ctaText: "Get residency permit support",
      steps: ["Identify the legal basis for residence", "Prepare identity and supporting records", "Submit the application correctly", "Monitor renewals and compliance deadlines"],
      mistakes: ["Applying under the wrong basis", "Delaying document preparation", "Overlooking renewal timelines", "Assuming travel plans do not affect permit logistics"],
      faq: [
        ["Who can apply for residency in Albania?", "Eligibility depends on the legal basis of stay, such as work, family, business activity, or another recognized route."],
        ["Do I need to renew my permit?", "In many cases yes. Renewal timing and documentation should be planned early to avoid unnecessary problems."],
        ["Can Kayrosco support both first applications and renewals?", "Yes. KAYROSCO GROUP can support first-time residency planning and follow-up for renewals."],
      ],
    },
    {
      slug: "work-permit-process-in-albania",
      title: "Work Permit Process in Albania",
      searchIntent: "employers and foreign professionals who need a clearer view of work permit steps and compliance requirements",
      painPoint: "companies often underestimate the coordination needed between employer documentation, employment terms, and permit filing",
      relatedTerms: ["work permit support", "employment authorization", "labor compliance", "foreign employee permit", "hiring in Albania"],
      serviceSlug: "work-permit-albania",
      ctaText: "Get work permit assistance",
      steps: ["Confirm the employment basis", "Prepare employer and employee records", "Submit the permit request", "Track approval and future renewal obligations"],
      mistakes: ["Treating the permit as only an HR task", "Using incomplete employer records", "Missing timing around employment start dates", "Not coordinating permit and residency steps"],
      faq: [
        ["Do employers need to be involved in the work permit process?", "Yes. Employer participation is usually essential because company records and employment details are part of the permit workflow."],
        ["Is a work permit the same as residency?", "Not always. Work and residence processes can be connected, but they are not automatically the same thing in every case."],
        ["Can KAYROSCO help employers and employees together?", "Yes. That is often the most efficient way to reduce delays and miscommunication."],
      ],
    },
    {
      slug: "business-license-guide-in-albania",
      title: "Business License Guide in Albania",
      searchIntent: "operators who need to know whether their business activity requires licensing or regulated approvals",
      painPoint: "many companies assume company registration alone is enough, then discover additional licensing rules too late",
      relatedTerms: ["business license guide", "regulated activity", "permits", "compliance documents", "operational approval"],
      serviceSlug: "business-license-albania",
      ctaText: "Check business license requirements",
      steps: ["Identify the activity", "Review the applicable licensing basis", "Prepare supporting records", "Submit and monitor the application"],
      mistakes: ["Starting operations before confirming licensing needs", "Ignoring sector-specific rules", "Underestimating supporting evidence requirements", "Missing renewal or amendment obligations"],
      faq: [
        ["Does every business need a separate license in Albania?", "No. Requirements depend on the exact activity and sector, which is why early review matters."],
        ["When should licensing be reviewed?", "Ideally before launch, because operational decisions may depend on the answer."],
        ["Can one business need more than one approval?", "Yes. Some businesses need layered approvals depending on their services or regulated activities."],
      ],
    },
    {
      slug: "tax-guide-for-new-businesses-in-albania",
      title: "Tax Guide for New Businesses in Albania",
      searchIntent: "new companies that want to understand tax registration, reporting expectations, and practical setup priorities",
      painPoint: "new founders often focus on registration first and leave tax setup unclear until it creates operational friction",
      relatedTerms: ["tax registration in Albania", "VAT registration", "business tax", "fiscal obligations", "financial compliance"],
      serviceSlug: "tax-registration-albania",
      ctaText: "Get tax registration guidance",
      steps: ["Understand the company tax profile", "Register the required obligations", "Confirm invoicing and reporting processes", "Maintain structured ongoing compliance"],
      mistakes: ["Ignoring tax setup after registration", "Assuming one-size-fits-all obligations", "Failing to align accounting and operations", "Leaving invoicing decisions too late"],
      faq: [
        ["Do all businesses in Albania have the same tax obligations?", "No. Obligations vary by activity, turnover, and business profile."],
        ["When should tax registration be handled?", "As early as possible during business setup so operational planning stays aligned."],
        ["Why does this matter for new founders?", "Because weak tax onboarding can slow operations, affect invoicing, and create avoidable compliance issues."],
      ],
    },
    {
      slug: "documents-needed-for-company-registration-in-albania",
      title: "Documents Needed for Company Registration in Albania",
      searchIntent: "founders who want a practical checklist of documents for Albanian company registration",
      painPoint: "applications are often delayed not by the filing itself but by missing, inconsistent, or poorly prepared documents",
      relatedTerms: ["company registration documents", "document checklist", "shareholder records", "business setup paperwork", "registration file"],
      serviceSlug: "company-registration-albania",
      ctaText: "Review your company registration documents",
      steps: ["Identify the entity and ownership structure", "Prepare identity and corporate records", "Check translations or formalities if needed", "Submit a complete, consistent registration file"],
      mistakes: ["Using incomplete identity records", "Ignoring entity-specific document needs", "Submitting inconsistent business details", "Assuming one checklist fits every case"],
      faq: [
        ["Is there one universal document list?", "Not exactly. The final list depends on the entity type, ownership profile, and the practical structure of the business."],
        ["Why do documents cause delays?", "Because inconsistencies and missing records can interrupt the filing process even if the business plan itself is clear."],
        ["Can KAYROSCO review the file before submission?", "Yes. Pre-submission review is often one of the most useful steps in reducing avoidable delays."],
      ],
    },
  ],
  travel: [
    {
      slug: "best-private-tours-in-albania",
      title: "Best Private Tours in Albania",
      searchIntent: "travelers searching for flexible private tours, local insight, and practical route planning across Albania",
      painPoint: "visitors often waste time on rigid itineraries that do not match pace, interests, or travel logistics",
      relatedTerms: ["private tours in Albania", "custom tours", "guided travel", "local experiences", "Albania itinerary"],
      serviceSlug: "private-tours-albania",
      ctaText: "Plan a private tour in Albania",
      steps: ["Choose the destinations", "Set your preferred pace", "Match transport to the route", "Build a realistic day-by-day plan"],
      mistakes: ["Trying to cover too much in one trip", "Ignoring transfer times", "Choosing routes without local context", "Using generic itineraries for special-interest travel"],
      faq: [
        ["Why choose a private tour instead of a fixed group trip?", "Private tours are more flexible and can be aligned with pace, interests, and practical travel needs."],
        ["Can Albania private tours be customized?", "Yes. Customization is one of the main reasons travelers choose private support."],
        ["Is this useful for families or business travelers too?", "Yes. Private planning is especially valuable when timing and comfort matter."],
      ],
    },
    {
      slug: "tirana-airport-transfer-guide",
      title: "Tirana Airport Transfer Guide",
      searchIntent: "arriving visitors who want a clearer airport transfer plan for Tirana and surrounding destinations",
      painPoint: "airport arrival is often the most stressful part of the trip, especially for late flights, families, or first-time visitors",
      relatedTerms: ["Tirana airport transfer", "airport pickup", "Rinas airport", "private transfer", "arrival logistics"],
      serviceSlug: "tirana-airport-transfer",
      ctaText: "Book airport transfer support",
      steps: ["Confirm arrival details", "Define destination and timing", "Choose private or business transfer needs", "Coordinate live follow-up if plans shift"],
      mistakes: ["Ignoring flight timing variability", "Choosing transport without luggage planning", "Leaving destination coordination unclear", "Treating airport transfer as an afterthought"],
      faq: [
        ["Is airport transfer support useful for business travel?", "Yes. It reduces friction and makes arrival logistics more predictable."],
        ["Can transfers be coordinated for destinations outside Tirana?", "Yes. Transfer planning can extend to other cities and destinations in Albania."],
        ["Why plan this in advance?", "Advance planning reduces uncertainty and saves time during arrival."],
      ],
    },
    {
      slug: "car-rental-tips-in-albania",
      title: "Car Rental Tips in Albania",
      searchIntent: "travelers evaluating whether car rental is the best fit for an Albania trip",
      painPoint: "independent travelers often choose car rental without first matching the vehicle, route, and travel style to the real itinerary",
      relatedTerms: ["car rental in Albania", "self drive", "vehicle hire", "road trip Albania", "travel mobility"],
      serviceSlug: "car-rental-tirana",
      ctaText: "Get car rental support in Tirana",
      steps: ["Review the route", "Choose the right car category", "Match the vehicle to the number of travelers", "Plan pickup, return, and city transitions carefully"],
      mistakes: ["Choosing a car too small for the route", "Ignoring city parking considerations", "Underestimating trip timing", "Treating one route as suitable for every traveler"],
      faq: [
        ["Is car rental a good option for Albania?", "It can be excellent when the route, comfort needs, and travel style make independent mobility worthwhile."],
        ["Should travelers pick up in Tirana?", "Tirana is a common and practical pickup point for many itineraries."],
        ["Can rental planning be paired with broader trip support?", "Yes. That often produces a more practical overall itinerary."],
      ],
    },
    {
      slug: "7-day-albania-travel-itinerary",
      title: "7-Day Albania Travel Itinerary",
      searchIntent: "visitors who want a structured one-week Albania itinerary that balances cities, coast, and heritage destinations",
      painPoint: "many week-long itineraries are either too rushed or too generic to be practical",
      relatedTerms: ["7-day Albania itinerary", "travel planning in Albania", "week itinerary", "trip route", "southern Albania travel"],
      serviceSlug: "travel-planning-albania",
      ctaText: "Get a custom Albania itinerary",
      steps: ["Choose your entry and exit points", "Balance city, heritage, and coastal days", "Plan realistic transfer windows", "Adjust the route to your travel style"],
      mistakes: ["Trying to cover every region in one week", "Ignoring road time", "Leaving no space for flexibility", "Building the plan without a clear travel priority"],
      faq: [
        ["Is seven days enough to see Albania well?", "Yes, if the route is realistic and aligned with the traveler’s goals."],
        ["Should one week focus on one region or several?", "That depends on travel style, but strong itineraries usually avoid unnecessary overreach."],
        ["Can business travelers also use this kind of itinerary planning?", "Yes. Structured planning is useful for mixed business and leisure trips too."],
      ],
    },
    {
      slug: "best-day-trips-from-tirana",
      title: "Best Day Trips from Tirana",
      searchIntent: "travelers based in Tirana who want efficient day trips without complex overnight planning",
      painPoint: "short-stay visitors often want strong day trips but do not know which ones are realistic in one day",
      relatedTerms: ["day trips from Tirana", "one day tour", "short trips", "Tirana excursions", "destination planning"],
      serviceSlug: "day-trips-tirana",
      ctaText: "Plan a day trip from Tirana",
      steps: ["Choose the day-trip style", "Set the departure time", "Confirm travel duration", "Build a route with realistic stops"],
      mistakes: ["Choosing destinations that are too far", "Leaving transport unclear", "Trying to combine too many stops", "Ignoring seasonal demand"],
      faq: [
        ["What makes a strong day trip from Tirana?", "A strong day trip balances destination quality, travel time, and the pace of the day."],
        ["Are heritage cities good day-trip options?", "Yes. Heritage destinations are often among the strongest one-day options."],
        ["Can day trips be customized for families or couples?", "Yes. The format is flexible and can be adapted to the traveler profile."],
      ],
    },
    {
      slug: "southern-albania-travel-guide",
      title: "Southern Albania Travel Guide",
      searchIntent: "travelers researching the southern Albania coast, route planning, and destination priorities",
      painPoint: "southern Albania is attractive but route planning becomes inefficient when visitors do not structure coast, city, and travel time well",
      relatedTerms: ["southern Albania travel guide", "Ionian coast", "Sarande travel", "Vlore travel", "coastal itinerary"],
      serviceSlug: "travel-planning-albania",
      ctaText: "Plan a southern Albania trip",
      steps: ["Choose the coastal priority destinations", "Balance transport with hotel changes", "Set realistic stay lengths", "Adjust the route for season and travel style"],
      mistakes: ["Overloading the coastline with too many stops", "Ignoring peak-season timing", "Changing hotels too often", "Planning the route without transfer logic"],
      faq: [
        ["Why is southern Albania popular for travel planning?", "It combines coastline, resort areas, and destination variety in a way many visitors find attractive."],
        ["Should southern Albania be done as one trip or part of a larger itinerary?", "Either can work, but route structure matters a lot."],
        ["Can KAYROSCO help with coastal trip logistics?", "Yes. Travel planning support is designed for exactly that type of coordination."],
      ],
    },
  ],
  tech: [
    {
      slug: "web-development-services-in-albania",
      title: "Web Development Services in Albania",
      searchIntent: "companies searching for reliable web development services in Albania for lead generation, positioning, and performance",
      painPoint: "many business websites fail because they are built around appearance only and not around structure, conversion, or maintainability",
      relatedTerms: ["web development in Albania", "website development", "business website", "responsive design", "conversion optimization"],
      serviceSlug: "web-development-albania",
      ctaText: "Talk to Kayrosco Tech about web development",
      steps: ["Define business goals", "Clarify content and conversion paths", "Design and build the site", "Launch with performance and SEO in mind"],
      mistakes: ["Starting without clear goals", "Using generic layouts that do not reflect the business", "Ignoring mobile performance", "Treating launch as the end of the process"],
      faq: [
        ["What makes a strong business website?", "A strong website combines clear messaging, strong UX, technical quality, and a real conversion path."],
        ["Why use a local development partner in Albania?", "A local partner can align language, market context, and operational expectations more effectively."],
        ["Can web development and SEO be planned together?", "Yes. That usually produces a better long-term result."],
      ],
    },
    {
      slug: "mobile-app-development-process-in-albania",
      title: "Mobile App Development Process in Albania",
      searchIntent: "founders and operators who need a realistic mobile app development process rather than vague app promises",
      painPoint: "many app projects fail because requirements, MVP scope, and user flows are not aligned early enough",
      relatedTerms: ["mobile app development in Albania", "app development", "iOS app", "Android app", "MVP"],
      serviceSlug: "mobile-app-development-albania",
      ctaText: "Start a mobile app project",
      steps: ["Clarify the use case", "Define the MVP", "Design the user journey", "Build, test, and iterate"],
      mistakes: ["Starting with too many features", "Skipping workflow validation", "Underestimating QA and iteration", "Ignoring post-launch priorities"],
      faq: [
        ["What is the first step in mobile app development?", "The first step is clarifying the real problem, users, and product goal."],
        ["Should every app start as a full product?", "No. MVP-first execution is often more practical and lower risk."],
        ["Can mobile app development be connected to a web platform too?", "Yes. Many products require connected web and mobile experiences."],
      ],
    },
    {
      slug: "e-commerce-development-guide-albania",
      title: "E-Commerce Development Guide Albania",
      searchIntent: "businesses that want to understand what an ecommerce build really requires before investing in an online store",
      painPoint: "stores often underperform because structure, payments, product organization, and UX are not designed as one system",
      relatedTerms: ["e-commerce development Albania", "online store", "ecommerce website", "payments", "product catalog"],
      serviceSlug: "ecommerce-development-albania",
      ctaText: "Build an e-commerce store with Kayrosco Tech",
      steps: ["Define the product and buyer structure", "Plan catalog and checkout flow", "Build the platform and integrations", "Optimize for sales and operations"],
      mistakes: ["Using unclear product structure", "Ignoring checkout friction", "Launching without operational readiness", "Treating the store as only a design project"],
      faq: [
        ["What matters most in ecommerce development?", "Store structure, checkout flow, product organization, and operational alignment matter more than surface appearance alone."],
        ["Can ecommerce be built for small businesses too?", "Yes. Good ecommerce execution is valuable at multiple business sizes."],
        ["Does SEO matter for ecommerce stores in Albania?", "Yes. Search visibility is often one of the most important long-term growth channels."],
      ],
    },
    {
      slug: "seo-for-albanian-businesses",
      title: "SEO for Albanian Businesses",
      searchIntent: "companies in Albania that want more organic traffic, stronger landing pages, and clearer search strategy",
      painPoint: "many businesses publish pages without search intent, internal linking, or technical consistency, so rankings stay weak",
      relatedTerms: ["SEO services for Albanian businesses", "organic traffic", "keyword targeting", "technical SEO", "content SEO"],
      serviceSlug: "seo-services-albania",
      ctaText: "Improve SEO for your Albanian business",
      steps: ["Audit the current site", "Define service and intent clusters", "Fix technical and on-page structure", "Publish and refine content over time"],
      mistakes: ["Targeting only generic keywords", "Ignoring technical issues", "Using weak internal linking", "Expecting SEO without consistent publishing"],
      faq: [
        ["Why is SEO important for businesses in Albania?", "It helps businesses capture qualified search demand over time instead of depending only on paid traffic or word of mouth."],
        ["Does SEO require content as well as technical work?", "Yes. Technical SEO and content structure work best together."],
        ["Can KAYROSCO support both strategy and implementation?", "Yes. That is the point of a service-led SEO approach."],
      ],
    },
    {
      slug: "website-redesign-checklist-for-businesses",
      title: "Website Redesign Checklist for Businesses",
      searchIntent: "companies preparing a website redesign and wanting a practical checklist before they rebuild",
      painPoint: "redesigns often fail when businesses jump into visuals without fixing structure, content goals, and UX issues",
      relatedTerms: ["website redesign services", "UX checklist", "conversion improvement", "site structure", "business website"],
      serviceSlug: "website-redesign-albania",
      ctaText: "Plan your website redesign",
      steps: ["Audit the current site", "Define redesign goals", "Rebuild the structure and content path", "Launch with performance and search in mind"],
      mistakes: ["Redesigning only for appearance", "Losing important pages during rebuild", "Ignoring search equity and redirects", "Not aligning the new design with conversions"],
      faq: [
        ["When should a business redesign its website?", "When the site no longer supports positioning, lead generation, usability, or modern performance expectations."],
        ["Does redesign affect SEO?", "Yes. A redesign can help or hurt SEO depending on how structure, content, and redirects are handled."],
        ["Should redesigns include content strategy too?", "Yes. Content and UX should be aligned during the redesign process."],
      ],
    },
    {
      slug: "technical-seo-guide-for-service-companies",
      title: "Technical SEO Guide for Service Companies",
      searchIntent: "service companies that need technical SEO explained in a practical way tied to lead-generation pages",
      painPoint: "technical SEO is often treated as abstract, while service companies actually need it tied directly to routing, indexation, speed, and metadata",
      relatedTerms: ["technical SEO guide", "service company SEO", "metadata", "indexation", "crawlability"],
      serviceSlug: "seo-services-albania",
      ctaText: "Get technical SEO support",
      steps: ["Audit crawlability and indexation", "Fix metadata and canonical issues", "Improve page structure and internal linking", "Monitor performance and search behavior"],
      mistakes: ["Ignoring canonical problems", "Leaving thin service pages live", "Using weak internal linking", "Treating speed and metadata as optional"],
      faq: [
        ["What is technical SEO for service companies?", "It is the part of SEO that improves crawlability, metadata, structure, performance, and how search engines understand service pages."],
        ["Why is this different from blog SEO alone?", "Service companies need technical SEO tied directly to conversion-oriented landing pages, not only articles."],
        ["Can technical SEO improve lead generation?", "Yes. Better indexing and page structure usually improve both visibility and conversion quality."],
      ],
    },
  ],
};

function buildArticleSections(article, category) {
  const categoryLabel = categoryConfig[category].label;
  return [
    {
      title: "Understanding the search intent behind this topic",
      paragraphs: [
        `${article.title} is a strong search topic because people looking for it usually have immediate intent. They are not browsing casually. They are searching for a solution, a step-by-step explanation, or a provider who understands the Albanian market. That is especially true for ${article.searchIntent}. When readers land on a page like this, they expect practical direction, useful context, and fewer vague promises.`,
        `KAYROSCO GROUP treats this topic as part of a real service journey. In Albania, good ${categoryLabel.toLowerCase()} support often depends on more than one action. It depends on sequencing, preparation, clarity about documents or route planning, and strong follow-up. This article is designed to answer the topic in a natural way while also helping readers move toward the right next step if they want direct support.`,
      ],
    },
    {
      title: "Why this process is often harder than it looks",
      paragraphs: [
        `One reason this topic matters is that ${article.painPoint}. Many people start with a generic assumption, then discover that the real work is in the details. In practice, delays and frustration usually come from weak preparation, unclear decision-making, or misunderstanding how local execution works. That is why broad online advice often feels incomplete when someone tries to apply it in Albania.`,
        `A more reliable approach is to translate the topic into concrete decisions: what needs to be prepared first, what sequence makes the most sense, which supporting records matter most, and which problems can be avoided early. This kind of practical framing is where KAYROSCO GROUP adds value. Instead of treating the topic as a one-step answer, we treat it as a process with operational checkpoints.`,
      ],
    },
    {
      title: "Key concepts and related terms you should understand",
      paragraphs: [
        `Search engines connect this topic to related terms such as ${article.relatedTerms.join(", ")}. These related ideas matter because they help users understand the full scope of the subject and they help Google understand that the page covers the topic naturally rather than through keyword stuffing. If someone is searching for ${article.title.toLowerCase()}, they often also need clarity on the adjacent terms around it.`,
        `From a practical standpoint, those related terms usually represent the real questions people ask once they move beyond the headline query. They want to know about timing, compliance, route logic, documentation, technical structure, or the exact workflow. A strong page should address the main search term while also explaining those supporting concepts so the reader leaves with a complete and actionable understanding.`,
      ],
    },
    {
      title: "Practical steps to approach this correctly",
      paragraphs: [
        `The strongest way to approach ${article.title.toLowerCase()} is to break it into practical stages instead of trying to solve everything at once. The first step is preparation. The second is choosing the right route or structure. The third is execution with the correct supporting details. The fourth is follow-up, because in Albania many processes are only truly successful when the after-submission or after-launch stage is handled well too.`,
        `At KAYROSCO GROUP, we usually recommend a structured approach that avoids rushed decisions and prevents avoidable repetition later. Whether the topic is consulting, travel, or tech, strong execution is built on sequence, clarity, and context. That is why the checklist on this page is intentionally practical rather than abstract.`,
      ],
      list: article.steps,
    },
    {
      title: "Common mistakes and how to avoid them",
      paragraphs: [
        `Many problems around ${article.title.toLowerCase()} are avoidable. The issue is not usually a lack of effort. It is that people begin with incomplete assumptions and then react to problems after they appear. That is more expensive in time and energy than building the process correctly from the start.`,
        `The most common mistakes include ${article.mistakes.join(", ")}. These are not rare edge cases. They are patterns that appear again and again. A strong provider helps reduce those mistakes by turning a confusing process into a clearer sequence of decisions, documents, actions, and follow-up tasks.`,
      ],
    },
    {
      title: "How this connects to a broader Albania strategy",
      paragraphs: [
        `${article.title} rarely exists in isolation. In real projects, this topic is often connected to wider decisions around operations, relocation, compliance, destination planning, software execution, or commercial growth. A founder may start with company registration and then need tax setup. A traveler may begin with airport transfer planning and then need a full itinerary. A business may request web development and then realize SEO needs to be built in from day one.`,
        `That is why KAYROSCO GROUP operates as a group rather than as disconnected services. If a client’s needs expand from one topic into another, the transition can stay coherent. This creates better continuity, clearer communication, and more useful internal linking across the site because the pages reflect real user journeys rather than isolated keyword targets.`,
      ],
    },
  ];
}

function buildCta(pageTitle, path) {
  return {
    path,
    label: `Request support for ${pageTitle.toLowerCase()}`,
  };
}

function createServicePage(category, service, index) {
  const related = serviceDefinitions[category]
    .filter((candidate) => candidate.slug !== service.slug)
    .slice(0, 4)
    .map((candidate) => `/${category}/${candidate.slug}`);

  return {
    id: `${category}-${service.slug}`,
    kind: "service",
    category,
    path: `/${category}/${service.slug}`,
    legacyPaths: service.legacySlugs.map((slug) => `/${category}/${slug}`),
    title: service.title,
    seoTitle: `${service.title} | KAYROSCO GROUP`,
    metaDescription: service.summary,
    intro: `${service.summary} KAYROSCO GROUP provides practical ${categoryConfig[category].label.toLowerCase()} support with clear communication, strong process handling, and connected follow-up.`,
    sections: [
      {
        title: `Why clients search for ${service.title.toLowerCase()}`,
        paragraphs: [
          `People looking for ${service.title.toLowerCase()} usually want more than a generic explanation. They want a provider who understands the real steps, the relevant local context in Albania, and the follow-up details that make the process work in practice.`,
          `KAYROSCO GROUP supports clients through structured guidance and connected execution. That means reducing ambiguity, clarifying the timeline, and helping align this service with any related consulting, travel, or technical needs that may appear during the process.`,
        ],
      },
      {
        title: "What this service typically includes",
        paragraphs: [
          `${service.benefits.join(", ")}. The exact scope depends on the case, but strong support usually means better preparation, fewer avoidable mistakes, and clearer next steps throughout the workflow.`,
        ],
      },
      {
        title: "Related terms and semantic context",
        paragraphs: [
          `This page is also relevant to searches around ${service.terms.join(", ")}. Those related terms help search engines and users understand the full topic around ${service.title.toLowerCase()}.`,
        ],
      },
    ],
    steps: service.steps,
    faq: [
      {
        q: `How long does ${service.title.toLowerCase()} usually take in Albania?`,
        a: `Timing depends on the case, the completeness of the records, and the operational context. Good preparation usually makes the process easier to manage.`,
      },
      {
        q: `Can foreign clients use this service in Albania?`,
        a: `Yes. Many KAYROSCO GROUP clients are foreign founders, international travelers, remote teams, investors, or residents who need practical support in Albania.`,
      },
      {
        q: `What documents are commonly required?`,
        a: `Requirements vary by case, but most workflows involve identity records, supporting references, operational details, and any case-specific forms or approvals.`,
      },
    ],
    keywords: [service.title, ...service.terms, categoryConfig[category].label, "Albania"],
    relatedPaths: related,
    cta: buildCta(service.title, "/contact"),
    priority: index === 0 ? "0.9" : "0.8",
  };
}

function createLocationPage(category, service, city) {
  const baseSlug = service.slug.replace(/-albania$/, "");
  const locationSlug = baseSlug.endsWith(`-${city.slug}`) ? baseSlug : `${baseSlug}-${city.slug}`;
  const path = `/${category}/${locationSlug}`;

  if (path === `/${category}/${service.slug}`) {
    return null;
  }

  return {
    id: `${category}-${service.slug}-${city.slug}`,
    kind: "location",
    category,
    city,
    path,
    title: `${service.title} in ${city.name}, Albania`,
    seoTitle: `${service.title} in ${city.name}, Albania | KAYROSCO GROUP`,
    metaDescription: `${service.summary} Local support for ${city.name}, Albania from KAYROSCO GROUP.`,
    intro: `If you are looking for ${service.title.toLowerCase()} in ${city.name}, KAYROSCO GROUP offers support tailored to ${city.region}. We help clients connect the service to local timing, documents, route planning, and practical next steps.`,
    sections: [
      {
        title: `${service.title} in ${city.name}`,
        paragraphs: [
          `${city.name} is ${city.region}, which means clients often need clearer local coordination, faster communication, and support that reflects the actual environment rather than generic assumptions.`,
          `This location page supports searches around ${service.title.toLowerCase()} ${city.name.toLowerCase()}, ${category} services in ${city.name.toLowerCase()}, and practical service support in Albania linked to that city.`,
        ],
      },
      {
        title: "Why local execution matters",
        paragraphs: [
          `Location pages are useful because real service delivery depends on geography, logistics, timing, and user intent. The best results come from combining broad Albania expertise with location-aware planning.`,
        ],
      },
    ],
    steps: service.steps,
    faq: [
      {
        q: `Do you support ${service.title.toLowerCase()} specifically in ${city.name}?`,
        a: `Yes. This page exists for people looking for ${service.title.toLowerCase()} in ${city.name}, Albania and nearby areas.`,
      },
      {
        q: `Can preparation happen before arriving in ${city.name}?`,
        a: `In many cases yes. Advance preparation often makes the local execution easier and faster once the project starts.`,
      },
    ],
    keywords: [service.title, city.name, `${service.title} ${city.name}`, `${category} ${city.name}`, "Albania"],
    relatedPaths: [`/${category}/${service.slug}`, ...serviceDefinitions[category].filter((item) => item.slug !== service.slug).slice(0, 2).map((item) => `/${category}/${item.slug}`)],
    cta: buildCta(service.title, "/contact"),
    priority: "0.7",
  };
}

function createArticlePage(category, article) {
  const servicePath = `/${category}/${article.serviceSlug}`;
  return {
    id: `insights-${category}-${article.slug}`,
    kind: "article",
    category,
    path: `/insights/${article.slug}`,
    title: article.title,
    seoTitle: `${article.title} | KAYROSCO GROUP Insights`,
    metaDescription: `${article.title} with practical guidance from KAYROSCO GROUP for clients and businesses working in Albania.`,
    intro: `${article.title} is written for ${article.searchIntent}. It explains the topic in a clear way, connects it to practical action, and links it back to the most relevant KAYROSCO service pages.`,
    sections: buildArticleSections(article, category),
    steps: article.steps,
    faq: article.faq.map(([q, a]) => ({ q, a })),
    keywords: [article.title, ...article.relatedTerms, categoryConfig[category].label, "Albania"],
    relatedPaths: [
      servicePath,
      ...serviceDefinitions[category].filter((service) => service.slug !== article.serviceSlug).slice(0, 3).map((service) => `/${category}/${service.slug}`),
    ],
    cta: {
      path: servicePath,
      label: article.ctaText,
    },
    priority: "0.7",
  };
}

export const seoServicePages = Object.entries(serviceDefinitions).flatMap(([category, services]) =>
  services.map((service, index) => createServicePage(category, service, index))
);

const locationSeeds = {
  consulting: ["company-registration-albania", "residency-permit-albania", "work-permit-albania", "business-license-albania"],
  travel: ["tirana-airport-transfer", "car-rental-tirana", "private-tours-albania", "day-trips-tirana"],
  tech: ["web-development-albania", "mobile-app-development-albania", "software-development-albania", "ecommerce-development-albania"],
};

export const seoLocationPages = Object.entries(locationSeeds).flatMap(([category, slugs]) =>
  cities.flatMap((city) =>
    slugs
      .map((slug) => createLocationPage(category, serviceDefinitions[category].find((service) => service.slug === slug), city))
      .filter(Boolean)
  )
);

export const seoArticlePages = Object.entries(articleDefinitions).flatMap(([category, articles]) =>
  articles.map((article) => createArticlePage(category, article))
);

export const seoToolPages = [
  {
    id: "tool-company-registration-cost",
    slug: "company-registration-cost-calculator-albania",
    kind: "tool",
    path: "/tools/company-registration-cost-calculator-albania",
    title: "Company Registration Cost Calculator Albania",
    seoTitle: "Company Registration Cost Calculator Albania | KAYROSCO GROUP",
    metaDescription: "Estimate company registration planning costs in Albania with a practical calculator from KAYROSCO GROUP.",
    intro: "This calculator helps founders estimate planning ranges around company registration in Albania before moving into direct support.",
    faq: [
      {
        q: "Is this an official government fee quote?",
        a: "No. It is a planning tool designed to help users estimate cost ranges before requesting tailored support.",
      },
    ],
  },
  {
    id: "tool-travel-budget",
    slug: "albania-travel-budget-calculator",
    kind: "tool",
    path: "/tools/albania-travel-budget-calculator",
    title: "Albania Travel Budget Calculator",
    seoTitle: "Albania Travel Budget Calculator | KAYROSCO GROUP",
    metaDescription: "Estimate transport, accommodation, and activity costs for your Albania trip with a practical travel planning calculator.",
    intro: "This calculator helps visitors compare daily spending styles and get a clearer travel budget for Albania.",
    faq: [
      {
        q: "Can this help with a custom itinerary?",
        a: "Yes. It provides a useful baseline before moving into a more tailored travel planning discussion.",
      },
    ],
  },
  {
    id: "tool-residency-eligibility",
    slug: "residency-permit-eligibility-checker-albania",
    kind: "tool",
    path: "/tools/residency-permit-eligibility-checker-albania",
    title: "Residency Permit Eligibility Checker Albania",
    seoTitle: "Residency Permit Eligibility Checker Albania | KAYROSCO GROUP",
    metaDescription: "Use a simple residency permit eligibility checker to understand likely Albania residency routes before starting the process.",
    intro: "This checker helps users think through likely Albania residency pathways before starting a formal application workflow.",
    faq: [
      {
        q: "Does this replace legal or immigration advice?",
        a: "No. It is an early decision-support tool that helps users understand likely routes before asking for direct support.",
      },
    ],
  },
];

export const publicPartnerPage = {
  path: "/partners",
  title: "Partners, Collaborations & Referral Opportunities | KAYROSCO GROUP",
  description: "Partner-friendly information for travel, consulting, technology, media, and business collaboration opportunities with KAYROSCO GROUP in Albania.",
};

export const seoPages = [...seoServicePages, ...seoLocationPages, ...seoArticlePages, ...seoToolPages];

const legacyRedirectPairs = seoServicePages.flatMap((page) =>
  (page.legacyPaths || []).map((legacyPath) => [legacyPath, page.path])
);

export const legacyPathRedirects = Object.fromEntries(legacyRedirectPairs);

export function resolveSeoPath(pathname) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (legacyPathRedirects[normalized]) {
    return { redirect: legacyPathRedirects[normalized], page: null };
  }
  const page = seoPages.find((entry) => entry.path === normalized);
  return { redirect: null, page: page ?? null };
}

export function findSeoPage(pathname) {
  return resolveSeoPath(pathname).page;
}

export const seoCollections = {
  services: seoServicePages,
  locations: seoLocationPages,
  insights: seoArticlePages,
  tools: seoToolPages,
};
