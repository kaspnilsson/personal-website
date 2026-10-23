export type Place = {
  name: string;
  address: string;
  hours: string;
  description: string;
  specialty: string;
  url: string;
};

export type PlaceSection = { id: string; title: string; places: Place[] };

export const transportation: Place[] = [
  {
    name: "Morgan Ave (L Train)",
    address: "Morgan Ave & Harrison Pl",
    hours: "6-minute walk from apartment",
    description:
      "Closest subway station with L train access to Manhattan and other Brooklyn neighborhoods, plus connections to J/M/Z lines nearby.",
    specialty: "Primary subway access, frequent service",
    url: "https://www.google.com/maps/search/?api=1&query=Morgan+Av+station+Brooklyn+NY",
  },
];

export const placeSections: PlaceSection[] = [
  {
    id: "groceries",
    title: "Groceries",
    places: [
      {
        name: "Food Story Natural Market",
        address: "40 Bogart St",
        hours: "24/7",
        description:
          "Health-focused grocery with organic, vegan, and gluten-free products. Fresh sushi made daily.",
        specialty: "Organic & specialty foods",
        url: "https://maps.app.goo.gl/jEeSfyFmPNefbdxT6",
      },
    ],
  },
  {
    id: "coffee",
    title: "Coffee",
    places: [
      {
        name: "Sey Coffee",
        address: "18 Grattan St",
        hours: "M-F 7am-5pm, Weekends 8am-5pm",
        description:
          "Award-winning micro roastery focusing on washed coffees with Nordic-style roasting. Glass wall view of roasting process.",
        specialty: "Single-origin coffee, Aeropress brewing",
        url: "https://maps.app.goo.gl/9CUeKZkszvoZ9pLG8",
      },
      {
        name: "Crossroads Cafe",
        address: "119 Knickerbocker Ave",
        hours: "M-F 8am-8pm, Weekends 10am-6pm",
        description:
          "Community-focused cafe with exposed brick, rotating local art, and live music events.",
        specialty: "Community events, local art",
        url: "https://maps.app.goo.gl/caYuYpBFo3PQuL9L8",
      },
      {
        name: "Swallow Cafe",
        address: "49 Bogart St",
        hours: "Daily 7am-7pm",
        description:
          "Independent cafe with free WiFi and bike repair station. Near Roberta's pizza.",
        specialty: "Bike-friendly, WiFi workspace",
        url: "https://maps.app.goo.gl/usinySaJz3kTS6Dt7",
      },
      {
        name: "La Cabra",
        address: "1329 Willoughby Ave",
        hours: "Daily 8am-6pm",
        description:
          "Danish coffee roastery with visible Loring roaster and modern oak retail space.",
        specialty: "Specialty tastings, Danish roasting",
        url: "https://maps.app.goo.gl/FF2NxdrP81XvLVLi9",
      },
    ],
  },
  {
    id: "takeout",
    title: "Takeout",
    places: [
      {
        name: "Semkeh",
        address: "53 Morgan Ave (Rear)",
        hours: "Daily 11am-11pm (Sun from 10am)",
        description:
          "Authentic Lebanese restaurant known for perfectly cooked shawarma and crispy falafel.",
        specialty: "Chicken shawarma, falafel",
        url: "https://maps.app.goo.gl/PUqshYNfcv4oxLpb6",
      },
    ],
  },
  {
    id: "restaurants",
    title: "Restaurants",
    places: [
      {
        name: "Roberta's",
        address: "261 Moore St",
        hours: "M-Th 12-10pm, F 12-11pm, Weekends 11am-11pm",
        description:
          "Iconic wood-fired pizza with rooftop garden ingredients. House-made pasta and cured meats.",
        specialty: "Wood-fired pizza, house salumi",
        url: "https://maps.app.goo.gl/vf2ACVUHYa6ma35p9",
      },
      {
        name: "Ichiran",
        address: "374 Johnson Ave",
        hours: "Daily 11am-11pm",
        description:
          "Famous Japanese ramen chain with solo dining booths and customizable tonkotsu bowls where you order via paper form and focus entirely on the rich, creamy broth.",
        specialty: "Customizable tonkotsu ramen",
        url: "https://maps.app.goo.gl/Dre4EG133egsBYvy6",
      },
      {
        name: "Syndicated",
        address: "40 Bogart St",
        hours: "Daily 5pm+",
        description:
          "Unique dine-in cinema and bar in a renovated warehouse where you can watch indie films while enjoying cocktails and food delivered to your seat.",
        specialty: "Movie theater + bar",
        url: "https://maps.app.goo.gl/nALsF3iZMDJt3Z2Q6",
      },
      {
        name: "A-Un",
        address: "156 Knickerbocker Ave",
        hours: "M-F 5-9:30pm, Weekends 12-3:30pm & 5-9:30pm",
        description:
          "Cozy Japanese restaurant by the team behind Wasan, featuring seasonal small plates, fresh sushi, and an excellent sake selection curated by their sommelier.",
        specialty: "Seasonal Japanese dishes, sake pairings",
        url: "https://maps.app.goo.gl/Qp88j3GReWV6oY1D7",
      },
      {
        name: "Chaingmai Diner",
        address: "942 Flushing Ave",
        hours: "Daily 11:30am-10pm (Fri-Sat til 11pm)",
        description:
          "Authentic Northern Thai restaurant with cozy plant-filled atmosphere, specializing in traditional dishes like larb and fermented rice noodles that customers rave about.",
        specialty: "Northern Thai cuisine, curries",
        url: "https://maps.app.goo.gl/MyoLqG1n3ptu4tAh9",
      },
      {
        name: "Nowon",
        address: "436 Jefferson St",
        hours: "Tue-Thu 5-11pm, Fri 5pm-12am, Weekends 2pm-12am",
        description:
          "Korean-American pocha (bar) with dim lighting and '90s hip-hop vibes, famous for their legendary cheeseburger with roasted kimchi and creative Korean fusion dishes.",
        specialty: "Korean fusion burgers, cocktails",
        url: "https://maps.app.goo.gl/GPCp3KKqssgRzTVx5",
      },
      {
        name: "Tong",
        address: "321 Starr St",
        hours: "Daily 12-3:30pm & 5-10pm (Fri-Sat til 11pm)",
        description:
          "MICHELIN Guide authentic Thai restaurant in a rustic warehouse space, specializing in kub klaem small plates and fiery Isaan dishes that don't hold back on chilies.",
        specialty: "Authentic Thai small plates, spicy Isaan cuisine",
        url: "https://maps.app.goo.gl/zrC15Zpe7zwgEem58",
      },
    ],
  },
  {
    id: "bars",
    title: "Bars",
    places: [
      {
        name: "Kings County Brewers Collective",
        address: "381 Troutman St",
        hours: "M-Th 4-11pm, F 3pm-12am, Sat 12pm-12am, Sun 1-10pm",
        description:
          "Bushwick's first brick-and-mortar brewery in 40+ years, featuring creative craft beers with quirky names, laid-back taproom vibes, and an ambitious barrel-aging program.",
        specialty: "Craft beer, barrel-aged releases",
        url: "https://maps.app.goo.gl/yS62zoan39BbxNDY7",
      },
      {
        name: "The Johnson's",
        address: "369 Troutman St",
        hours: "M-W 3pm-2am, Th-F 3pm-4am, Sat 2pm-4am, Sun 2pm-2am",
        description:
          "Sister bar to the LES original, this larger Bushwick spot attracts recent grads with cheap beers, pool tables, cozy booths, and retro atmosphere serving bar food like corn dogs.",
        specialty: "Cheap beers, pool tables, bar food",
        url: "https://maps.app.goo.gl/TFoRT4WZ1Mom2hVk9",
      },
      {
        name: "Carousel",
        address: "36 Wyckoff Ave",
        hours: "Opens 3pm daily",
        description:
          "Retro 70s-inspired bar with absinthe-focused cocktails, pool tables, dance floor, and a conversation pit that can be reserved for groups and birthdays.",
        specialty: "Absinthe cocktails, pool tables",
        url: "https://maps.app.goo.gl/mcVD4VdT83P8PBGs5",
      },
      {
        name: "Alphaville",
        address: "140 Wilson Ave",
        hours: "Daily 4pm-4am",
        description:
          "Classic Bushwick dive bar and music venue established in 2014, featuring world-class cocktails with fresh-squeezed juices, live music, karaoke nights, and surprisingly good burgers.",
        specialty: "Live music, whiskey selection, karaoke",
        url: "https://maps.app.goo.gl/SLiJEzb3WWJrXDt89",
      },
      {
        name: "Fine Time",
        address: "84 Central Ave",
        hours: "M-F 5pm-4am, Weekends 3pm-4am",
        description:
          "Award-winning dive bar with the best patio in Bushwick, featuring free hot dogs and popcorn, frozen margaritas, pool table, and backyard games like cornhole and shuffleboard.",
        specialty: "Happy hour deals, backyard patio",
        url: "https://maps.app.goo.gl/jQX3u3zJjcLubTE77",
      },
    ],
  },
  {
    id: "clubs",
    title: "Clubs",
    places: [
      {
        name: "Elsewhere",
        address: "599 Johnson Ave",
        hours: "Th 5-11pm, F 5pm-12am, Weekends 2pm-12am",
        description:
          "Multi-room music venue in renovated warehouse with rooftop bar, gallery, and multiple performance spaces.",
        specialty: "Underground music, multi-room parties",
        url: "https://maps.app.goo.gl/MNmKqqdHjHr2d6tz5",
      },
      {
        name: "Basement",
        address: "52-19 Flushing Ave, Maspeth",
        hours: "Fri-Sat 10pm-5am",
        description:
          "NYC's premier underground techno club in a converted factory, featuring massive sound systems and selective door policy reminiscent of Berlin's Berghain.",
        specialty: "Techno music, international DJs",
        url: "https://maps.app.goo.gl/rUax7p6FRXfmGh7Z8",
      },
      {
        name: "Nowadays",
        address: "56-06 Cooper Ave, Ridgewood",
        hours: "Thu 10pm-12am, Fri 10pm-4am, Sat 10pm-6am, Sun 12am-10pm",
        description:
          "Community-centered indoor-outdoor dance club on the Bushwick-Ridgewood border with a warehouse dance floor, park-like outdoor area, and 24-hour weekend parties.",
        specialty: "House & techno, all-ages events, weekend marathons",
        url: "https://maps.app.goo.gl/pcjcBsLrACV4XrJ2A",
      },
      {
        name: "Bossa Nova Civic Club",
        address: "1271 Myrtle Ave, Brooklyn",
        hours: "Daily 7pm-4am",
        description:
          "Bushwick's hottest underground techno club with 140-capacity space under the subway overpass, featuring European-style dancing, fog machines, and fresh empanadas.",
        specialty: "Techno music, underground dance culture",
        url: "https://maps.app.goo.gl/wEoHNkMsrC88KBAE8",
      },
      {
        name: "Ornithology Jazz Club",
        address: "6 Suydam St, Bushwick",
        hours: "Daily 7pm-late (live jazz nightly)",
        description:
          "Bohemian jazz performance space from the Smalls team featuring live jazz every night with no cover, three floors including rooftop, and vegan Mediterranean food.",
        specialty: "Live jazz, vegan cuisine, intimate performances",
        url: "https://maps.app.goo.gl/teSFuCr6Br5WtVE56",
      },
    ],
  },
  {
    id: "comedy",
    title: "Comedy",
    places: [
      {
        name: "Comedy Cellar",
        address: "117 MacDougal St, Greenwich Village",
        hours: "Daily 11am-3am (shows: 6:45pm, 8:45pm, 10:45pm, 12:30am)",
        description:
          "NYC's most legendary comedy club since 1981, universally recognized as the greatest comedy room in the country with surprise appearances by comedy legends.",
        specialty: "A-list comedians, intimate basement setting",
        url: "https://www.google.com/maps?cid=15186798998046674051",
      },
      {
        name: "The Stand",
        address: "116 E 16th St, Union Square",
        hours:
          "Mon 5pm-12am, Tu-Thu 12pm-12am, Fri 12pm-2am, Sat 11am-2am, Sun 11am-12am",
        description:
          "Bi-level venue combining comedy shows with Northern Italian cuisine and steakhouse offerings, named best comedy venue by New York Magazine.",
        specialty: "High-end dining with comedy, no drink minimums",
        url: "https://www.google.com/maps/place/The+Stand+NYC/@40.7312507,-73.995589,16z/data=!4m6!3m5!1s0x89c259a015566081:0x4a6339f6049de57c!8m2!3d40.7353369!4d-73.9884791!16s%2Fg%2F11h0cd13x?entry=tts",
      },
      {
        name: "New York Comedy Club",
        address: "241 E 24th St, Gramercy",
        hours:
          "Mon-Wed 6-11pm, Thu 5pm-12am, Fri 6pm-1am, Sat 4pm-1am, Sun 4pm-12am",
        description:
          "Serving NYC comedy since 1989 with newly renovated bar and showroom, featuring nightly showcases with local and international talent.",
        specialty: "Established comedy showcase, multiple locations",
        url: "https://www.google.com/maps/place/New+York+Comedy+Club/@40.7389205,-73.9998747,15z/data=!4m7!3m6!1s0x89c2590a3831ebf5:0x18417b14375043f7!8m2!3d40.7389205!4d-73.9808203!15sChxOZXcgWW9yayBDb21lZHkgQ2x1YiBtaWR0b3duIgOIAQGSAQtjb21lZHlfY2x1YuABAA!16s%2Fg%2F12hly4yjm?entry=tts",
      },
    ],
  },
];
