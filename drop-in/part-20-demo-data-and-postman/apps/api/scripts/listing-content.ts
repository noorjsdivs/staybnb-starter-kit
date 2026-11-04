/**
 * Curated listing content — one unique, hand-written title + blurb per seeded
 * listing, keyed by city and seed slot (0-11).
 *
 * Slot order MUST match the seeder: listings are created per city in slot
 * order, and the listing type cycles through LISTING_TYPES with the *global*
 * index, so each slot below is written for the type it lands on:
 *
 *   Cities starting at a global index divisible by 8 (Lisbon, Paris,
 *   Amsterdam, Marrakesh, Bali, New York, Tulum, Sydney):
 *     house, apartment, villa, loft, cottage, cabin, guesthouse, room,
 *     house, apartment, villa, loft
 *
 *   Cities starting at global index ≡ 4 (mod 8) (Barcelona, Rome, Reykjavík,
 *   Tokyo, Cape Town, Aspen, Dubai):
 *     cottage, cabin, guesthouse, room, house, apartment, villa, loft,
 *     cottage, cabin, guesthouse, room
 */

export interface ListingContent {
  /** Unique, Airbnb-style listing title. */
  title: string;
  /** 1–2 unique sentences; a factual specs sentence is appended at runtime. */
  blurb: string;
}

export function composeDescription(
  entry: ListingContent | undefined,
  specs: {
    city: string;
    type: string;
    maxGuests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  },
): string {
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const specsSentence = `Sleeps ${specs.maxGuests} guests across ${plural(
    specs.bedrooms,
    "bedroom",
  )} with ${plural(specs.beds, "bed")} and ${plural(specs.bathrooms, "bathroom")}.`;
  if (!entry) {
    return `A welcoming ${specs.type} in ${specs.city}. ${specsSentence}`;
  }
  return `${entry.blurb} ${specsSentence}`;
}

export const CITY_LISTING_CONTENT: Record<string, ListingContent[]> = {
  Lisbon: [
    {
      title: "Azulejo-tiled townhouse in the heart of Alfama",
      blurb:
        "Fado drifts up from the tavernas below this blue-tiled townhouse, folded into Alfama's maze of stairways. The Miradouro de Santa Luzia and its river views are a two-minute climb.",
    },
    {
      title: "Chiado balcony apartment over the rooftops",
      blurb:
        "Throw open the French doors and look across Chiado's terracotta rooftops to the Tagus. A Bertrand bookshop, century-old cafés and the Santa Catarina viewpoint are all on your doorstep.",
    },
    {
      title: "Estrela garden villa with a plunge pool",
      blurb:
        "A rare walled garden in the middle of the city, with lemon trees shading the plunge pool. The Estrela Basilica's dome peeks over the garden wall, and tram 28 stops at the corner.",
    },
    {
      title: "Converted warehouse loft beside LX Factory",
      blurb:
        "Raw steel trusses and ten-foot windows remain from this loft's days as a riverside warehouse. Stumble into LX Factory's weekend market, rooftop bars and bookshops next door.",
    },
    {
      title: "Fisherman's cottage above Cais do Sodré",
      blurb:
        "This snug pink cottage once housed river fishermen; today it hides on a quiet stair street above the Time Out Market. The ferry to Cacilhas and its sunset grills leaves from the bottom of the hill.",
    },
    {
      title: "Wooden garden cabin in Príncipe Real",
      blurb:
        "Tucked behind an antiques dealer's townhouse, this cedar cabin opens onto a private jungle of banana palms. Príncipe Real's concept stores and the botanical garden are a short stroll.",
    },
    {
      title: "Family-run guesthouse on the Graça hilltop",
      blurb:
        "Three generations have kept this guesthouse at Lisbon's highest miradouro. Breakfast is warm pastéis on the terrace while the whole city glows below you.",
    },
    {
      title: "Sunny private room in a Bairro Alto flat",
      blurb:
        "A bright corner room in a shared upper-floor flat, quiet by day and steps from Bairro Alto's famous nightlife when you want it. Your host leaves a map of her favourite ginjinha bars.",
    },
    {
      title: "Pastel corner house in old Mouraria",
      blurb:
        "In the neighbourhood where fado was born, this slim mint-green house stacks three floors above a cobbled largo. Hidden Chinese canteens and the Martim Moniz market are around the corner.",
    },
    {
      title: "Baixa apartment beneath the Santa Justa Lift",
      blurb:
        "Pombaline arches frame the windows of this second-floor apartment on Rua Áurea. Watch the Santa Justa Lift creak past your window and walk to Praça do Comércio in four minutes.",
    },
    {
      title: "Belém riverside villa near the pastel bakery",
      blurb:
        "Mornings here start with still-warm pastéis de Belém and a riverside run past the Discoveries monument. The villa's roof terrace looks straight onto the 25 de Abril bridge.",
    },
    {
      title: "Santos design loft with glimpses of the Tagus",
      blurb:
        "In Lisbon's design district, this double-height loft mixes Portuguese mid-century furniture with work by local ceramicists. The river appears between rooftops from the mezzanine bed.",
    },
  ],

  Barcelona: [
    {
      title: "Garden cottage hidden in leafy Sarrià",
      blurb:
        "Sarrià still feels like the village it once was, and this stone cottage hides in one of its deepest gardens. Fig trees shade the breakfast table; the old town's bakeries are a five-minute walk.",
    },
    {
      title: "Artist's rooftop cabin in Gràcia",
      blurb:
        "A painter built this timber cabin on her Gràcia rooftop as a studio; now it sleeps guests beneath a skylight full of stars. Plaça del Sol's terraces hum below.",
    },
    {
      title: "Modernist guesthouse off Passeig de Gràcia",
      blurb:
        "Original Catalan vault ceilings and stained glass survive in this 1900s guesthouse. Gaudí's Casa Batlló glitters two blocks away, yet the inner courtyard stays whisper-quiet.",
    },
    {
      title: "Juliet-balcony room in the Gothic Quarter",
      blurb:
        "Open the shutters of this high-ceilinged room and lean out over a medieval alley where guitarists play at dusk. The cathedral's bells are your morning alarm, in the gentlest way.",
    },
    {
      title: "Trencadís-tiled house near Park Güell",
      blurb:
        "Broken-tile mosaics in the entry hall nod to the park up the hill. This vertical family house stacks a workspace, a hammock terrace and a roof deck with the whole city spread to the sea.",
    },
    {
      title: "Eixample corner apartment with gallery windows",
      blurb:
        "Nine tall windows wrap this chamfered Eixample corner, flooding the herringbone floors with light. Market runs to Mercat de la Concepció replace supermarket trips here.",
    },
    {
      title: "Montjuïc hillside villa overlooking the port",
      blurb:
        "Halfway up Montjuïc, this villa's terraced garden steps down toward the harbour cranes and cruise ships. Nights end in the outdoor kitchen watching the Magic Fountain glow below.",
    },
    {
      title: "Poblenou factory loft near Bogatell Beach",
      blurb:
        "Barcelona's old textile quarter gave this loft its brick arches and iron columns. Cycle the seafront to Bogatell Beach in five minutes, then work from the communal rooftop.",
    },
    {
      title: "Whitewashed beach cottage in Barceloneta",
      blurb:
        "Two rooms, blue shutters, and sand fifty metres away — this is old fishermen's Barceloneta. Grab vermut and anchovies at the corner bodega like the neighbours have for decades.",
    },
    {
      title: "Rooftop cabin above Sant Antoni market",
      blurb:
        "This cedar-clad cabin sits on a terrace directly above the renovated Sant Antoni market dome. Sunday's book market unfolds beneath your feet; the tapas triangle starts at the door.",
    },
    {
      title: "Bohemian guesthouse on an El Born side street",
      blurb:
        "Behind a carved wooden door near the Picasso Museum, this guesthouse layers vintage textiles over 18th-century stone. The Santa Maria del Mar basilica is your closest neighbour.",
    },
    {
      title: "Sunlit room with Sagrada Família views",
      blurb:
        "From the window seat of this top-floor room you can watch the basilica's cranes at work — a construction site three lifetimes long. The Avinguda Gaudí café strip is just below.",
    },
  ],

  Paris: [
    {
      title: "Ivy-clad townhouse on a Montmartre lane",
      blurb:
        "On a cobbled lane the tour groups never find, ivy swallows the facade of this three-storey townhouse. The Sacré-Cœur is four minutes up the hill; the vineyard of Clos Montmartre, two.",
    },
    {
      title: "Saint-Germain apartment with herringbone floors",
      blurb:
        "Herringbone oak, marble fireplace, gilt mirror — this second-floor apartment is Paris as you imagined it. Café de Flore and the Luxembourg Gardens bracket your morning walk.",
    },
    {
      title: "Trocadéro garden villa facing the Eiffel Tower",
      blurb:
        "A private garden in the 16th with the Eiffel Tower rising beyond the hedge — the hourly sparkle show is yours from the dining terrace. The Seine and Palais de Tokyo are downhill.",
    },
    {
      title: "Canal Saint-Martin loft in a former print shop",
      blurb:
        "Ink stains still mark the concrete floor of this print-works loft. Watch the canal's swing bridges turn from the window, and picnic on the quay like a local when the sun's out.",
    },
    {
      title: "Hidden courtyard cottage in Belleville",
      blurb:
        "Through a graffitied passage and across a cobbled courtyard sits this improbable two-room cottage with its own fig tree. Belleville's street art and Chinatown noodles are outside the gate.",
    },
    {
      title: "Writer's cabin on a Pigalle rooftop",
      blurb:
        "Six floors up, this zinc-wrapped cabin was built for a novelist who wanted only sky. A desk, a bed, a tiny terrace over the rooftops of SoPi — and nothing to interrupt you.",
    },
    {
      title: "Artists' guesthouse in the Batignolles",
      blurb:
        "Painters have kept studios in this courtyard since the 1890s, and the guesthouse walls double as their gallery. The organic market on Boulevard des Batignolles runs every Saturday.",
    },
    {
      title: "Attic room overlooking Le Marais rooftops",
      blurb:
        "A classic chambre under the eaves, with a skylight framing chimney pots and, if you crane, the Centre Pompidou's pipes. Falafel on Rue des Rosiers is a two-minute descent.",
    },
    {
      title: "17th-century house on Île Saint-Louis",
      blurb:
        "Stone walls a metre thick and beams from Louis XIV's era hold this narrow island house together. Berthillon ice cream is on the corner; both riverbanks are a bridge away.",
    },
    {
      title: "Bastille apartment above a market street",
      blurb:
        "The Marché d'Aligre's calls float up to this fourth-floor apartment every morning. Buy your cheese downstairs, then wander to the Coulée verte, the elevated garden that inspired the High Line.",
    },
    {
      title: "Latin Quarter villa with a secret garden",
      blurb:
        "Behind a nondescript door off Rue Mouffetard hides a villa and walled garden the Sorbonne's professors once kept. Roses climb the study window; the Panthéon looms at the street's end.",
    },
    {
      title: "Palais-Royal loft with gallery skylights",
      blurb:
        "North-facing skylights — an old photographer's studio — wash this loft in even, silvery light. The Palais-Royal arcades, Buren's columns and the Louvre are all within five minutes.",
    },
  ],

  Rome: [
    {
      title: "Vine-draped cottage on the Aventine Hill",
      blurb:
        "Wisteria has claimed the pergola of this gardener's cottage on Rome's quietest hill. The Orange Garden's viewpoint and the famous keyhole of the Knights of Malta are a short stroll.",
    },
    {
      title: "Garden cabin among Garbatella's courtyards",
      blurb:
        "Garbatella was built as a garden suburb a century ago, and this timber cabin sits in one of its communal courtyards, all ochre walls and drying laundry. Rome's best carbonara is two lanes over.",
    },
    {
      title: "Convent-turned-guesthouse near Piazza Navona",
      blurb:
        "Nuns kept these vaulted rooms for four centuries; the cloister garden and its orange trees remain. Bernini's fountains at Piazza Navona are a ninety-second walk.",
    },
    {
      title: "Frescoed room above Campo de' Fiori",
      blurb:
        "A faded 18th-century fresco spans the ceiling of this room over the market square. Fall asleep to the fountain, wake to flower sellers setting up beneath your shutters.",
    },
    {
      title: "Terracotta house in the lanes of Trastevere",
      blurb:
        "Ochre walls, green shutters, and a roof terrace built for long dinners — this house sits in Trastevere's knot of cobbled lanes. Santa Maria's golden mosaics glow at the end of the street.",
    },
    {
      title: "Monti apartment with Colosseum glimpses",
      blurb:
        "From the kitchen window of this beamed apartment, the Colosseum's arches appear between rooftops. Monti's vintage shops and wine bars fill the streets below Rome's oldest quarter.",
    },
    {
      title: "Appian Way villa among the umbrella pines",
      blurb:
        "Just past the ancient gate, this villa sits in a garden of umbrella pines along the world's oldest highway. Cycle past 2,000-year-old tombs before breakfast, be at the Forum by ten.",
    },
    {
      title: "Ostiense loft in a converted pasta factory",
      blurb:
        "The grain hoppers are gone but the steel gantries remain in this pasta-factory loft. Street art covers Ostiense's walls outside, and Testaccio's food market is across the bridge.",
    },
    {
      title: "Gardener's cottage at the edge of Villa Borghese",
      blurb:
        "This former groundskeeper's cottage backs directly onto Villa Borghese's park — rent rowboats on the lake or walk to the Galleria Borghese's Berninis in ten minutes.",
    },
    {
      title: "Rooftop cabin hideout in Pigneto",
      blurb:
        "Pigneto is Rome's scruffy, brilliant corner, and this rooftop cabin overlooks its whole patchwork of terraces and aerials. Natural-wine bars and Pasolini's old haunts line the street below.",
    },
    {
      title: "Prati guesthouse a stroll from the Vatican",
      blurb:
        "St Peter's dome fills the end of the avenue outside this stately Prati guesthouse. Beat the basilica queues at dawn, then reward yourself at the Mercato Trionfale's food stalls.",
    },
    {
      title: "Sunlit room near the Spanish Steps",
      blurb:
        "An airy corner room one street from the Spanish Steps, with a window bench made for people-watching over Via Margutta, the ivy-hung lane where Fellini lived.",
    },
  ],

  Amsterdam: [
    {
      title: "Crooked canal house on the Brouwersgracht",
      blurb:
        "This 1680s house leans agreeably over one of Amsterdam's prettiest canals, all beams, steep stairs and window seats. Houseboats and drawbridges compose the view from every floor.",
    },
    {
      title: "De Pijp apartment above the Albert Cuyp market",
      blurb:
        "The city's liveliest market sets up beneath your windows six days a week — stroopwafels made fresh at the stall on the corner. The apartment itself is calm, white and full of plants.",
    },
    {
      title: "Amstel riverside villa with a boat dock",
      blurb:
        "Watch the rowing eights glide past from this villa's private dock on the Amstel. The city centre is ten minutes by bike along the river dyke, past windmill De Gooyer.",
    },
    {
      title: "Shipyard loft on the NDSM wharf",
      blurb:
        "Cranes and container ships frame the view from this loft on Amsterdam's old shipbuilding wharf, now the city's art quarter. The free ferry drops you behind Centraal Station.",
    },
    {
      title: "Courtyard cottage behind the Nine Streets",
      blurb:
        "A hidden hofje cottage wrapped around a courtyard of hollyhocks, seconds from the Nine Streets' boutiques. It's hard to believe the Royal Palace is a seven-minute walk.",
    },
    {
      title: "Houseboat cabin moored on the Prinsengracht",
      blurb:
        "Sleep at water level in this converted barge's snug cabin, ducks tapping the hull at dawn. The Anne Frank House and Westerkerk's carillon are two bridges away.",
    },
    {
      title: "Jordaan guesthouse with a hofje garden",
      blurb:
        "Brown-café territory: this Jordaan guesthouse keeps a secret almshouse garden out back and a resident cat named Rembrandt. Monday's Noordermarkt flea market is around the corner.",
    },
    {
      title: "Gabled attic room in the Haarlemmerbuurt",
      blurb:
        "Under the bell gable of a 17th-century spice merchant's house, this attic room looks down one of Amsterdam's best food streets. The Westerpark's greenery starts where the shops end.",
    },
    {
      title: "Plantage townhouse by the botanical garden",
      blurb:
        "Amsterdam's leafiest quarter: this tall townhouse faces the Hortus Botanicus' 1682 glasshouses. Artis Zoo's morning birdcalls carry over the garden wall.",
    },
    {
      title: "Oud-West apartment two streets from Vondelpark",
      blurb:
        "Bikes hang in the hall of this relaxed Oud-West apartment, yours to ride into Vondelpark two streets away. The Foodhallen's twenty kitchens cover dinner when you're lazy.",
    },
    {
      title: "Garden villa in leafy Watergraafsmeer",
      blurb:
        "Six metres below sea level in a former lake bed, this 1920s villa keeps a deep lawn and an apple tree older than the neighbourhood. The city centre is a fifteen-minute cycle along the Ringvaart.",
    },
    {
      title: "Westerpark gasworks loft with steel beams",
      blurb:
        "Part of the old municipal gasworks, this loft keeps its riveted beams and factory windows overlooking Westerpark's lawns. Culture park events and Sunday markets happen at your doorstep.",
    },
  ],

  Reykjavík: [
    {
      title: "Corrugated-iron cottage in old Vesturbær",
      blurb:
        "Clad in the red corrugated iron that defines old Reykjavík, this 1912 cottage sits in the city's original western quarter. The geothermal Vesturbæjarlaug pool — the locals' living room — is on the next block.",
    },
    {
      title: "Turf-roofed cabin on the city's green edge",
      blurb:
        "Grass grows on the roof of this modern take on the Icelandic turf house, at the edge of the Elliðaárdalur valley. Wild salmon run the river below; downtown is ten minutes' drive.",
    },
    {
      title: "Old Harbour guesthouse by the whale-watching piers",
      blurb:
        "Fishing boats and whale-watching riggers tie up across the street from this harbourfront guesthouse. Harpa's glass honeycomb glitters a five-minute walk along the quay.",
    },
    {
      title: "Bright room beneath Hallgrímskirkja's spire",
      blurb:
        "The rocket-shaped church tower fills the window of this warm, wood-floored room. Roll out of bed and be first up the spire when the viewing deck opens.",
    },
    {
      title: "Nordic timber house just off Laugavegur",
      blurb:
        "One street back from the main shopping drag, this black-timber house pairs sheepskins and a wood stove with a hot tub in the yard — steam rising into the winter dark, northern lights permitting.",
    },
    {
      title: "Tjörnin pond apartment with swan views",
      blurb:
        "Whooper swans and arctic terns patrol the pond outside this parliament-quarter apartment. City Hall, the National Gallery and the best hot-dog stand in Iceland are all within 400 metres.",
    },
    {
      title: "Seltjarnarnes villa facing the northern lights",
      blurb:
        "At the peninsula's tip past the Grótta lighthouse, this villa has no streetlights north of it — just sea, sky, and on clear winter nights, the aurora from the sunroom.",
    },
    {
      title: "Grandi fish-factory loft on the waterfront",
      blurb:
        "Reykjavík's old fish-packing district is now its food-hall-and-galleries quarter, and this concrete loft keeps the harbour view the packers had. Omnom chocolate and Marshall House art are neighbours.",
    },
    {
      title: "Painted tin cottage on Grettisgata",
      blurb:
        "Mustard-yellow outside, pale timber inside, this doll's-house cottage sits on a quiet street of its equally colourful siblings. Laugavegur's cafés and record shops are one block north.",
    },
    {
      title: "Geothermal valley cabin by Laugardalur",
      blurb:
        "Beside the city's biggest thermal pool complex and botanical garden, this pine cabin comes with bathrobes for the two-minute walk to the hot pots.",
    },
    {
      title: "Guesthouse on the rainbow street to the church",
      blurb:
        "Skólavörðustígur's painted rainbow runs straight past this guesthouse door, uphill to Hallgrímskirkja. Icelandic wool shops, galleries and the famous braud & co bakery line the way.",
    },
    {
      title: "Snug room in a 101 designer flat",
      blurb:
        "A calm, wool-and-birch room in a designer's own downtown flat, with her studio's ceramics on every shelf. She'll mark up your map with the pools and dive bars worth knowing.",
    },
  ],

  Marrakesh: [
    {
      title: "Restored riad with a mosaic courtyard pool",
      blurb:
        "Behind a studded cedar door in the Medina, this 19th-century riad opens to a courtyard of zellige mosaics, orange trees and a chill plunge pool. The rooftop looks over a sea of pink terraces to the Koutoubia.",
    },
    {
      title: "Guéliz apartment near the Majorelle Garden",
      blurb:
        "In the palm-lined new town, this bright apartment puts Yves Saint Laurent's cobalt-blue Majorelle Garden a six-minute walk away — go at opening time, before the crowds.",
    },
    {
      title: "Palmeraie villa amid a thousand palms",
      blurb:
        "Out in the palm oasis north of the city, this pisé villa keeps a long pool, a fire pit and silence. Camels pad past the gate at sunset; the souks are twenty minutes by taxi.",
    },
    {
      title: "Sidi Ghanem loft in the designers' quarter",
      blurb:
        "Marrakesh's industrial quarter hides its best design studios, and this loft — raw brick, brass, hand-loomed rugs — sits above one of them. Factory-price ceramics and candles surround you.",
    },
    {
      title: "Adobe cottage in an Agdal olive grove",
      blurb:
        "Olive trees planted by sultans surround this earthen cottage at the city's southern edge. The Atlas mountains line the horizon from the roof terrace, snow-capped into late spring.",
    },
    {
      title: "Kasbah rooftop cabin with Atlas views",
      blurb:
        "Up a winding stair in the old royal quarter, this cedar-and-canvas rooftop cabin catches every sunset over the Atlas. The Saadian Tombs and the storks of the Badi Palace are below.",
    },
    {
      title: "Lantern-lit guesthouse in the Mouassine quarter",
      blurb:
        "Hundreds of brass lanterns light this guesthouse's stairwells after dark. The Medina's calmest quarter surrounds you — the secret Mouassine fountain and Le Jardin Secret are both two lanes away.",
    },
    {
      title: "Zellige-tiled room by Bab Doukkala",
      blurb:
        "Handmade green tiles cover this room floor-to-ceiling, cool even in August. The Bab Doukkala food market — where locals actually shop — is just through the city gate.",
    },
    {
      title: "Courtyard house in the old Mellah",
      blurb:
        "In the former Jewish quarter, this tall house wraps around a courtyard strung with bougainvillea. The spice market and the newly restored Bahia Palace are minutes on foot.",
    },
    {
      title: "Hivernage apartment with a shared garden pool",
      blurb:
        "Marrakesh's garden district: this ground-floor apartment opens onto a shared pool ringed by jasmine. The Menara gardens' reflecting pool and mountain backdrop are a short walk.",
    },
    {
      title: "Atlas-view villa on the Ourika road",
      blurb:
        "South of the city where the land starts to climb, this villa faces the High Atlas across olive terraces. Day-trip to Berber valley markets, be back for drinks by the pool at golden hour.",
    },
    {
      title: "Gallery loft above the spice souks",
      blurb:
        "A carpet dealer's storeroom became this gallery-white loft, its narrow balcony hanging directly over the spice souk's pyramids of saffron and cumin. Jemaa el-Fnaa's drums start at dusk.",
    },
  ],

  Tokyo: [
    {
      title: "Machiya-style cottage in old Yanaka",
      blurb:
        "Yanaka survived the century intact, and so did this wooden machiya with its lattice front and moss garden. Temple bells, cemetery cherry blossoms and Japan's best croquette stand are all outside.",
    },
    {
      title: "Hinoki-scented cabin near Inokashira Park",
      blurb:
        "Cypress wood inside and out gives this Kichijoji garden cabin its forest smell. Row the swan boats on Inokashira's lake, then queue with locals at the park's tiny yakitori bars.",
    },
    {
      title: "Ryokan-style guesthouse in Asakusa",
      blurb:
        "Futons on tatami, deep cedar soaking tub, a courtyard of raked stones — a small inn experience, three streets from Sensō-ji temple's incense and market stalls.",
    },
    {
      title: "Tatami room over a Kagurazaka alley",
      blurb:
        "Kagurazaka's cobbled geisha lanes wind below this second-floor tatami room. The French bakeries and hidden kaiseki restaurants of Tokyo's most Parisian hill are your neighbourhood.",
    },
    {
      title: "Paper-lantern townhouse in Shimokitazawa",
      blurb:
        "A lantern-maker once worked in this narrow townhouse in Tokyo's vintage-shopping quarter. Record stores, curry shops and tiny theatres pack the car-free lanes around it.",
    },
    {
      title: "Nakameguro apartment on the cherry-tree canal",
      blurb:
        "In blossom week, the Meguro River outside this window turns into a pink tunnel. The rest of the year it's Tokyo's calmest café strip — coffee roasters and design shops along the water.",
    },
    {
      title: "Modernist villa in the Daikanyama hills",
      blurb:
        "Concrete, glass and a private maple courtyard by a student of Ando — this villa hides in Tokyo's most polished low-rise district. Tsutaya's famous bookstore campus is a four-minute walk.",
    },
    {
      title: "Shibuya loft above the neon crossing",
      blurb:
        "Eleven floors above the world's busiest intersection, this loft frames the scramble crossing in one huge window — a living Bladerunner screensaver that never repeats.",
    },
    {
      title: "Garden cottage on Koenji's vintage streets",
      blurb:
        "Koenji is Tokyo's thrift-store and punk-café quarter, and this cottage hides in a lane of potted gardens behind the arcades. August's awa-odori dance festival passes the front gate.",
    },
    {
      title: "Ebisu garden cabin behind an izakaya lane",
      blurb:
        "Through a gap between lantern-lit izakayas, this timber cabin sits in an impossible pocket garden. Ebisu's beer memorial hall and Michelin-starred ramen are both five minutes away.",
    },
    {
      title: "Roppongi guesthouse near the art triangle",
      blurb:
        "The Mori, Suntory and National Art Center museums form a triangle around this quiet guesthouse. Roppongi Hills' viewing deck shows you Fuji at dusk on clear days.",
    },
    {
      title: "Shinjuku room with Mount Fuji sunsets",
      blurb:
        "West-facing on a high floor, this room catches Fuji silhouetted against orange skies beyond the skyscrapers. The all-night energy of Golden Gai's 200 micro-bars is a ten-minute walk.",
    },
  ],

  Bali: [
    {
      title: "Teak joglo house amid Ubud rice terraces",
      blurb:
        "An antique joglo — a carved teak pavilion trucked from Java — anchors this house in the emerald staircase of Ubud's rice paddies. Ducks patrol the terraces; the Campuhan ridge walk starts nearby.",
    },
    {
      title: "Surf apartment steps from Batu Bolong, Canggu",
      blurb:
        "Wax your board on the balcony and be in the Batu Bolong lineup in four minutes. Post-surf smoothie bowls and Canggu's shortcut scooter lanes are all part of the routine.",
    },
    {
      title: "Cliff-edge villa above the Uluwatu breaks",
      blurb:
        "The infinity pool of this villa ends where the cliff does, thirty metres above Uluwatu's famous left-handers. Sunset drumming at the clifftop temple carries on the wind.",
    },
    {
      title: "Jungle loft over the Ayung River gorge",
      blurb:
        "Open on two sides to the jungle canopy, this loft hangs above the Ayung's whitewater far below. Monkeys commute along the balcony rail at dawn; bring nothing shiny.",
    },
    {
      title: "Bamboo cottage in the Sidemen valley",
      blurb:
        "Hand-lashed bamboo, rice-paddy views and Mount Agung looming behind — Sidemen is Bali as it was thirty years ago. Village weavers work their looms along the lane.",
    },
    {
      title: "A-frame cabin under Munduk's waterfalls",
      blurb:
        "Cloud forest wraps this highland A-frame, cool enough at night for the fireplace. Four waterfalls are within an hour's walk, coffee plantations closer still.",
    },
    {
      title: "Family-compound guesthouse in old Sanur",
      blurb:
        "Stay inside a real Balinese family compound — shrine, frangipani courtyard, grandmother's daily offerings — with your own private pavilion. Sanur's gentle beach is a barefoot walk.",
    },
    {
      title: "Lotus-pond room in a Pererenan villa",
      blurb:
        "Your room opens onto a lotus pond that mirrors the sunset; beyond the wall, Pererenan's black-sand beach and its slower, kinder version of the Canggu scene.",
    },
    {
      title: "Beach house on Jimbaran's golden bay",
      blurb:
        "Fishing boats land the morning catch a hundred metres from this whitewashed beach house — buy it, and the seafood grills on the sand will cook it for dinner.",
    },
    {
      title: "Seminyak apartment behind Petitenget temple",
      blurb:
        "Behind the sea temple's tiered gates, this apartment puts Seminyak's beach clubs, boutiques and restaurants within a ten-minute radius while staying off the loud strip itself.",
    },
    {
      title: "Black-sand coast villa in Amed",
      blurb:
        "East Bali's diving coast: this villa faces a bay of jukung outriggers, with a Japanese wreck snorkellable from the beach. Mount Agung fills the sky behind the pool at sunrise.",
    },
    {
      title: "Rice-field loft on Tabanan's green edge",
      blurb:
        "Nothing but paddies between this loft's daybed and the Batukaru foothills. The UNESCO rice terraces of Jatiluwih are a scenic forty-minute ride uphill.",
    },
  ],

  "Cape Town": [
    {
      title: "Candy-coloured cottage in the Bo-Kaap",
      blurb:
        "Painted lilac like its neighbours, this cottage sits on the Bo-Kaap's steepest cobbled street beneath Signal Hill. The muezzin's call and the noon gun keep the neighbourhood's old rhythms.",
    },
    {
      title: "Fynbos cabin on the Constantia wine slopes",
      blurb:
        "Proteas and sugarbirds surround this timber cabin on the edge of South Africa's oldest wine valley. Walk to two tasting rooms; Kirstenbosch garden is over the hill.",
    },
    {
      title: "Victorian guesthouse in the City Bowl",
      blurb:
        "Broekie-lace ironwork trims the veranda of this 1890s guesthouse under Table Mountain's full face. Kloof Street's café mile begins at the bottom of the garden.",
    },
    {
      title: "Sea-view room above Kalk Bay harbour",
      blurb:
        "Watch fishermen sell snoek off the boats from this room's bay window. Kalk Bay's antique shops and tidal pool are below; whales pass offshore in season.",
    },
    {
      title: "Clifton bungalow steps from Fourth Beach",
      blurb:
        "Forty-eight steps down from the road, this bungalow hangs above Clifton's white sand and impossibly blue (and famously cold) water. Sundowners on the deck are compulsory.",
    },
    {
      title: "Sea Point apartment on the promenade",
      blurb:
        "Joggers, dog-walkers and Atlantic sunsets stream past this apartment's floor-level view of the Sea Point prom. The public pools' art-deco diving boards are two blocks along.",
    },
    {
      title: "Camps Bay villa beneath the Twelve Apostles",
      blurb:
        "The mountain buttresses glow pink behind this villa at dusk while the palm strip and beach light up below. The infinity pool looks down the whole sweep of the bay.",
    },
    {
      title: "Woodstock loft in the Old Biscuit Mill",
      blurb:
        "Cape Town's design quarter grew up around this converted mill, and the loft's brick shell overlooks its Saturday food market. First Thursdays' gallery crawl starts outside.",
    },
    {
      title: "Harbour cottage in Hout Bay",
      blurb:
        "Seals loll on the harbour wall opposite this fisherman's cottage. Buy fish and chips on the quay, or take the coastal road to Chapman's Peak — the drive begins at your door.",
    },
    {
      title: "Cabin hideout under Devil's Peak",
      blurb:
        "On the mountain's forested lower slopes, this stone-and-timber cabin trades sea views for silence, night jars and hiking trails that start where the garden ends.",
    },
    {
      title: "De Waterkant guesthouse with harbour views",
      blurb:
        "In the village-like quarter above the V&A, this guesthouse stacks three terraces toward the cranes and Table Bay. The Cape Quarter's restaurants are on the cobbles below.",
    },
    {
      title: "Leafy garden room below Kloof Street",
      blurb:
        "A private garden room under an old oak, with the mountain filling the sky above the hedge. Kloof Street's bakeries and bars are two minutes' walk uphill.",
    },
  ],

  "New York": [
    {
      title: "Brownstone parlor floor on a West Village block",
      blurb:
        "Twelve-foot ceilings, a marble mantel and stoop-side people-watching on one of the Village's tree-vaulted blocks. Washington Square's arch is a five-minute stroll.",
    },
    {
      title: "SoHo apartment behind a cast-iron facade",
      blurb:
        "Corinthian columns of painted iron frame the oversized windows of this 1870s loft-building apartment. Cobblestones, galleries and the world's most concentrated shopping are downstairs.",
    },
    {
      title: "Secret carriage house in Brooklyn Heights",
      blurb:
        "Down a private mews lane, this converted 1860s carriage house keeps its hayloft beams and adds a bricked garden. The Promenade's full-skyline view is at the end of the street.",
    },
    {
      title: "Williamsburg loft with Manhattan skyline views",
      blurb:
        "The Empire State and Chrysler line up in this corner loft's windows across the East River. Smorgasburg, the ferry and North 6th's music venues are all within ten minutes.",
    },
    {
      title: "Hidden rear cottage in the East Village",
      blurb:
        "Through the building's passage and across a garden stands an actual freestanding cottage — a 19th-century holdout the city forgot. Tompkins Square and St. Marks are around the corner.",
    },
    {
      title: "Rooftop cabin studio in Greenpoint",
      blurb:
        "A cedar cabin on a Greenpoint rooftop, with the midtown skyline as the backsplash to your morning coffee. Polish bakeries and the East River ferry are below.",
    },
    {
      title: "Harlem brownstone guesthouse near Marcus Garvey Park",
      blurb:
        "Stained glass and original parquet survive in this 1899 brownstone's guest floor. Sunday gospel, Red Rooster's fried yardbird and the park's drummers are the neighbourhood soundtrack.",
    },
    {
      title: "Sunny room in a Chelsea artist's flat",
      blurb:
        "Your host paints in the front room; you sleep in the back one, hung with her canvases. The High Line's northern spur and 200 galleries are within a few blocks.",
    },
    {
      title: "Shuttered townhouse off Riverside Park",
      blurb:
        "On a quiet Upper West Side block, this townhouse floor keeps its shutters, pocket doors and piano. Riverside Park's Hudson paths and Zabar's counter are equally close.",
    },
    {
      title: "DUMBO apartment under the bridge arches",
      blurb:
        "The Manhattan Bridge's stone arch frames this apartment's famous cobblestone view. Jane's Carousel, the ferry and Brooklyn Bridge Park's lawns are one block down.",
    },
    {
      title: "Tribeca penthouse with a private terrace",
      blurb:
        "A full-floor penthouse atop a converted spice warehouse, with a planted terrace looking over Tribeca's rooftop water towers to One World Trade.",
    },
    {
      title: "Lower East Side loft above a jazz bar",
      blurb:
        "The house trio plays until midnight beneath this loft — soundproofed floors mean you choose whether to listen. Katz's, Russ & Daughters and the Tenement Museum are your block's history lesson.",
    },
  ],

  Aspen: [
    {
      title: "Miner's cottage in Aspen's West End",
      blurb:
        "Built in the 1880s silver boom, this gingerbread-trimmed cottage sits among the West End's Victorians. Walk to the Music Festival tent in summer, the gondola shuttle in winter.",
    },
    {
      title: "Ski-in log cabin at Aspen Highlands",
      blurb:
        "Ski to the door of this hand-hewn log cabin below Highland Bowl. The wood stove, bourbon shelf and boot dryers cover everything a powder day demands.",
    },
    {
      title: "Creekside guesthouse on Maroon Creek",
      blurb:
        "The creek runs loud with snowmelt past this guesthouse's deck. The Maroon Bells — the most photographed peaks in North America — are up the valley road before the crowds wake.",
    },
    {
      title: "Alpine room steps from the gondola",
      blurb:
        "First chair, guaranteed: this warm, wood-panelled room is a two-minute walk from the Silver Queen Gondola. Après at the Ajax Tavern is even closer.",
    },
    {
      title: "Victorian house two blocks off Main Street",
      blurb:
        "A blue-and-white Victorian with a porch swing and peony beds, close enough to walk everywhere, far enough to hear only magpies. The Hopkins Avenue bike path passes the gate.",
    },
    {
      title: "Slope-view apartment at Snowmass Base",
      blurb:
        "Watch the groomers comb Fanny Hill at dusk from this balcony, then walk down to the Base Village ice rink and s'mores fires. Ski storage is steps from the lift.",
    },
    {
      title: "Red Mountain villa with valley panoramas",
      blurb:
        "From Aspen's billionaire hillside, this villa's wall of glass takes in all four ski mountains and the town's lights below. The hot tub is positioned for exactly that view.",
    },
    {
      title: "Downtown loft above the après-ski bars",
      blurb:
        "Exposed brick from the building's mining-era past, and Aspen's bar scene literally downstairs. Stumble home from the J-Bar in ninety seconds.",
    },
    {
      title: "Aspen-grove cottage at Buttermilk's edge",
      blurb:
        "A white aspen grove surrounds this quiet cottage at the base of the X Games mountain. In fall the whole property turns gold; in winter it's ski-shuttle simple.",
    },
    {
      title: "Smuggler Mountain cabin with a wood stove",
      blurb:
        "Halfway up Aspen's local hiking mountain, this cabin rewards the drive with valley views and total quiet. The Smuggler trailhead — the town's favourite workout — is at the road's end.",
    },
    {
      title: "Ranch guesthouse in Woody Creek",
      blurb:
        "Down-valley where Hunter S. Thompson held court, this working-ranch guesthouse trades glitz for horses, peace and the Woody Creek Tavern's green chili.",
    },
    {
      title: "Cosy room in a McLain Flats farmhouse",
      blurb:
        "A farmhouse room with mountain views across hay meadows, ten minutes from town on the scenic back road. Mornings mean coffee on the porch and elk in the field.",
    },
  ],

  Tulum: [
    {
      title: "Palapa-roofed house in Tulum Pueblo",
      blurb:
        "A traditional palm-thatch palapa crowns this breezy concrete house in the town's grid — real taquerías outside, not beach-club prices. Cycle to the sand in fifteen minutes.",
    },
    {
      title: "Aldea Zamá apartment with rooftop plunge pool",
      blurb:
        "Between town and beach, this polished apartment tops out in a private roof deck and plunge pool. The jungle-lined boulevards below stay quiet after dark.",
    },
    {
      title: "Beachfront villa on the Boca Paila road",
      blurb:
        "Barefoot from your bed to the Caribbean in twenty steps. This villa on the hotel-zone road runs on solar, faces the sunrise, and keeps hammocks strung between coconut palms.",
    },
    {
      title: "Polished-concrete loft in La Veleta",
      blurb:
        "Tulum's expat quarter hides this double-height loft of chukum plaster and polished concrete, wrapped by jungle garden. The neighbourhood cenote and taco carts are minutes away.",
    },
    {
      title: "Thatched cottage a bike ride from the cenotes",
      blurb:
        "Bikes come with this stick-and-thatch cottage, and the Gran Cenote's turquoise cave pools are an easy pedal up the Cobá road — go at 8am and have them almost alone.",
    },
    {
      title: "Off-grid jungle cabin near Holistika",
      blurb:
        "Solar power, rain showers, and a jungle soundtrack of motmots and howler monkeys. The art trail and cacao ceremonies of Holistika are a short walk through the trees.",
    },
    {
      title: "Jungle guesthouse with an open-air kitchen",
      blurb:
        "Meals happen under the palapa of this guesthouse's shared open-air kitchen, where iguanas supervise from the wall. A dipping pool cools the afternoons.",
    },
    {
      title: "Breezy room steps from Playa Paraíso",
      blurb:
        "One of Tulum's dreamiest beaches is a two-minute walk from this simple, sea-breezy room. The clifftop Maya ruins are visible from the sand where you'll swim.",
    },
    {
      title: "Stone house beside a private cenote",
      blurb:
        "This Maya-stone house shares its garden with a small, swimmable cenote — your own limestone pool, lit turquoise at midday. Bats replace the birds at dusk; it's magic, not a bug.",
    },
    {
      title: "Top-floor apartment overlooking the treetops",
      blurb:
        "The jungle canopy rolls unbroken to the sea horizon from this top-floor terrace. Sunrise yoga up here needs no studio; toucans occasionally audit the class.",
    },
    {
      title: "Soliman Bay villa on a quiet cove",
      blurb:
        "North of the crowds, Soliman Bay curves calm and reef-protected past this villa's lawn. Snorkel from the beach, kayak at dawn, and let Tulum's scene stay twenty minutes away.",
    },
    {
      title: "Tankah loft between reef and jungle",
      blurb:
        "The Mesoamerican reef on one side, a cenote lagoon on the other — this loft in low-key Tankah puts both within walking distance. Casa Cenote's mangrove channel is made for paddleboards.",
    },
  ],

  Dubai: [
    {
      title: "Courtyard cottage in historic Al Fahidi",
      blurb:
        "Wind-tower architecture keeps this coral-stone cottage cool in the old quarter's lanes. Abra boats cross the Creek for one dirham; the spice and gold souks are on the far bank.",
    },
    {
      title: "Desert-edge cabin beyond the Al Qudra lakes",
      blurb:
        "Where the city finally stops, this off-grid cabin faces open dunes and flamingo-visited lakes. The desert cycle track passes the door; the stars at night need no telescope.",
    },
    {
      title: "Arabian guesthouse by the Creek in Al Seef",
      blurb:
        "Carved mashrabiya screens filter the light in this Creek-side guesthouse, styled after the pearl-trading houses. Dhows load cargo outside exactly as they have for a century.",
    },
    {
      title: "Skyline room on the 60th floor Downtown",
      blurb:
        "Floor-to-ceiling glass on the 60th floor, with the Burj Khalifa close enough to count its lights. The Dubai Mall's fountain show plays silently below every evening.",
    },
    {
      title: "Palm Jumeirah garden home on the fronds",
      blurb:
        "A private lawn runs down to the water on one of the Palm's outer fronds, with the Marina skyline stacked across the bay. Paddleboard mornings, barbecue evenings.",
    },
    {
      title: "Marina apartment with yacht-harbour views",
      blurb:
        "Superyachts idle beneath this apartment's balcony on the Marina's glittering canyon of towers. The beach at JBR and the Marina Walk's restaurants are minutes on foot.",
    },
    {
      title: "Emirates Hills villa with a private pool",
      blurb:
        "Behind the gates of Dubai's quietest address, this villa wraps a palm-shaded pool and outdoor majlis. The Montgomerie golf course rolls out beyond the garden wall.",
    },
    {
      title: "DIFC loft amid the art galleries",
      blurb:
        "The financial district's gallery row is downstairs from this black-steel loft — openings most Thursdays, world-class dining always. The Museum of the Future glows at the street's end.",
    },
    {
      title: "Bougainvillea cottage in old Jumeirah",
      blurb:
        "One of the last single-storey villas on its street, buried in magenta bougainvillea. Kite Beach, artisan coffee and the Friday morning ritual of the Jumeirah mosque tour are all close.",
    },
    {
      title: "Kite Beach cabin with sunset decks",
      blurb:
        "Kitesurfers launch a hundred metres from this beach cabin's twin decks, and the Burj Al Arab's sail catches the last light every evening. Outdoor showers keep the sand outside.",
    },
    {
      title: "City Walk guesthouse below the towers",
      blurb:
        "European-style low-rise streets, murals and fountains surround this guesthouse — an oddly walkable pocket of Dubai. Downtown's spectacle is one metro stop away.",
    },
    {
      title: "Burj-view room over the Dubai Fountain",
      blurb:
        "The fountain's full choreography plays directly below this room's window seat, with the Burj Khalifa mirrored in the lake behind it. Earplugs provided, never used.",
    },
  ],

  Sydney: [
    {
      title: "Terrace house on a Paddington lane",
      blurb:
        "Iron lacework and a frangipani-shaded courtyard, on a lane of art galleries off Oxford Street. Saturday's Paddington Markets and the William Street boutiques are a short walk.",
    },
    {
      title: "Bondi apartment above the surf break",
      blurb:
        "Check the swell from bed: this apartment looks straight down onto Bondi's sand and lineup. The Icebergs pool and the coastal walk to Bronte bracket your mornings.",
    },
    {
      title: "Mosman villa overlooking Balmoral Beach",
      blurb:
        "Balmoral's pale sand and harbour swimming enclosure sit below this villa's jacaranda-framed veranda. The ferry from nearby wharves makes the Opera House a scenic commute.",
    },
    {
      title: "Surry Hills loft in a converted warehouse",
      blurb:
        "Clerestory windows and ironbark beams from the building's rag-trade days crown this loft. Crown Street's small bars and Sydney's best coffee are all within three blocks.",
    },
    {
      title: "Sandstone cottage in The Rocks",
      blurb:
        "Convict-cut sandstone walls, 1840s floorboards, and the Harbour Bridge rising directly overhead. The weekend markets and Sydney's oldest pubs are literally around the corner.",
    },
    {
      title: "Bush cabin above Shelly Beach, Manly",
      blurb:
        "Kookaburras own the deck of this timber cabin in the banksia scrub above Cabbage Tree Bay. Snorkel with groupers at Shelly Beach, then ride the ferry past the Heads at sunset.",
    },
    {
      title: "Federation guesthouse in leafy Glebe",
      blurb:
        "Stained glass and return verandas distinguish this 1905 Federation guesthouse on a jacaranda street. Glebe's bookshops and the Blackwattle Bay foreshore walk are at the gate.",
    },
    {
      title: "Harbour-glimpse room in Potts Point",
      blurb:
        "Between art-deco apartment blocks, this room catches a wedge of harbour and the evening light show on the bridge. Sydney's densest strip of cafés and wine bars is downstairs.",
    },
    {
      title: "Weatherboard house by Coogee's ocean pool",
      blurb:
        "A classic weatherboard two streets from Coogee's sand, with an outdoor shower for post-swim rinses. McIver's Ladies Baths and Wylie's ocean pool are both a short walk south.",
    },
    {
      title: "Newtown apartment over King Street's cafés",
      blurb:
        "Sydney's most eclectic street runs beneath this apartment — Thai canteens, record shops, live rooms and murals. The inner-west's craft breweries are an easy wander.",
    },
    {
      title: "Balmain villa with a harbourside deck",
      blurb:
        "On Balmain's sandstone peninsula, this villa's deck looks across the working harbour to the Anzac Bridge. The ferry from Thames Street wharf beats any commute in the city.",
    },
    {
      title: "Darlinghurst loft above a laneway gallery",
      blurb:
        "The gallery downstairs rotates local artists monthly, and lends the loft its polished concrete and picture rails. Darlinghurst's theatre district and late-night eats surround you.",
    },
  ],
};
