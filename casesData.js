/**
 * casesData.js
 *
 * CaseLink Investigation Cases Repository
 * Provides sample fictional case dossiers structured for DSA analysis:
 * - Linear records (Evidence via LinkedList / Arrays)
 * - Suspects indexed via Binary Search Tree (by suspicion score, supporting duplicates)
 * - Witnesses queued via Queue FIFO ordering
 * - Relationship networks via Graph (BFS / DFS / Degrees of Separation)
 * - Crime event timelines reconstructed via Backtracking with constraints
 * - Canonical verdict solutions with coherent forensic proof and red-herring analyses
 */

const cases = [
  {
    id: "CASE-1042",
    title: "The Blackwood Manor Mystery",
    leadInvestigator: "Inspector H. Vance",
    incidentDate: "October 18, 2026, 21:30",
    status: "Active Investigation",
    synopsis: "Lord Pemberton was discovered incapacitated on his study floor. An antique knife was recovered nearby, power lines were deliberately cut, and high-value promissory bonds are missing from the wall safe.",
    evidence: [
      { id: "EV1", name: "Kitchen Knife", importance: 88, category: "Physical Object", description: "Damascus steel chef's knife; fibers matching study drapes found on hilt. Owned by Arthur Black." },
      { id: "EV2", name: "Torn Photograph", importance: 55, category: "Document", description: "Burned photo fragment showing Arthur Black and Daniel Cole arguing outside the estate gate." },
      { id: "EV3", name: "Victim's Phone", importance: 95, category: "Physical Object", description: "Displays 3 unanswered calls from Arthur Black immediately prior to the 21:19 blackout." },
      { id: "EV4", name: "Muddy Footprint", importance: 40, category: "Physical Object", description: "Size 10 trench boot indentation discovered outside study terrace window; matches Arthur Black's footwear." },
      { id: "EV5", name: "Threatening Letter", importance: 78, category: "Document", description: "Demands repayment of past loan, initialed 'D.C.' with crimson wax seal." },
      { id: "EV6", name: "Master Keycard", importance: 92, category: "Physical Object", description: "Executive visitor security pass issued to Arthur Black, logging east corridor access at 21:15." },
      { id: "EV7", name: "Tripped Circuit Fuse", importance: 62, category: "Physical Object", description: "Deliberately blown 30A ceramic fuse cutting lights to the study wing at 21:19." },
      { id: "EV8", name: "Stolen Promissory Bonds", importance: 98, category: "Document", description: "Recovered hidden inside Arthur Black's locked valise in the library, bearing Lord Pemberton's embossed seal." },
      { id: "EV9", name: "Ceramic Fuse Latent Print", importance: 84, category: "Forensic", description: "Partial index fingerprint lifted from tripped 30A fuse (EV7) matching Arthur Black's biometric record." }
    ],
    suspects: [
      { id: "S1", name: "Arthur Black", suspicion: 73, role: "Senior Business Partner", alibi: "Claims he was in the downstairs reading room examining financial accounts." },
      { id: "S2", name: "Maria Lane", suspicion: 41, role: "Family Associate & Botanist", alibi: "Reported tending greenhouse plants; seen briefly on exterior terrace." },
      { id: "S3", name: "Daniel Cole", suspicion: 88, role: "Disgruntled Creditor", alibi: "Unverified whereabouts between 21:00 and 22:00; debt overdue." },
      { id: "S4", name: "The Butler (E. Higgins)", suspicion: 73, role: "Head Butler", alibi: "Claims to have been preparing late service tea in the scullery pantry." },
      { id: "S5", name: "Victoria Sterling", suspicion: 60, role: "Estranged Heiress", alibi: "Stayed in guest wing; admits hearing glass break around 21:20." }
    ],
    witnesses: [
      { name: "Night Gate Guard", statement: "Observed Daniel Cole's dark sedan idling near rear service driveway with lights switched off; Cole never passed through the locked gate." },
      { name: "Groundskeeper", statement: "Noticed flashlights moving through terrace garden before the main house lights tripped; saw a tall figure in a heavy overcoat near the window." },
      { name: "Scullery Maid", statement: "Heard raised voices coming from Lord Pemberton's study shortly before silence, and earlier observed Arthur Black hurrying down the east service corridor at 21:14." },
      { name: "Visiting Doctor", statement: "Estimated victim incapacitation window between 21:20 and 21:35." }
    ],
    graphEdges: [
      { a: "[PERSON] Lord Pemberton (Victim)", b: "[PERSON] Arthur Black", relationship: "business partner of" },
      { a: "[PERSON] Lord Pemberton (Victim)", b: "[PERSON] Maria Lane", relationship: "friend of" },
      { a: "[PERSON] Lord Pemberton (Victim)", b: "[LOCATION] Study", relationship: "found in" },
      { a: "[PERSON] Arthur Black", b: "[EVIDENCE] Kitchen Knife", relationship: "owns" },
      { a: "[PERSON] Arthur Black", b: "[EVIDENCE] Victim's Phone", relationship: "called" },
      { a: "[PERSON] Arthur Black", b: "[EVIDENCE] Master Keycard", relationship: "carried" },
      { a: "[PERSON] Arthur Black", b: "[EVIDENCE] Stolen Promissory Bonds", relationship: "concealed" },
      { a: "[PERSON] Arthur Black", b: "[EVIDENCE] Tripped Circuit Fuse", relationship: "tampered with" },
      { a: "[PERSON] Maria Lane", b: "[PERSON] Daniel Cole", relationship: "seen with" },
      { a: "[PERSON] Daniel Cole", b: "[EVIDENCE] Torn Photograph", relationship: "found near" },
      { a: "[PERSON] Daniel Cole", b: "[EVIDENCE] Threatening Letter", relationship: "authored" },
      { a: "[PERSON] The Butler", b: "[LOCATION] Study", relationship: "possesses key to" },
      { a: "[PERSON] The Butler", b: "[PERSON] Arthur Black", relationship: "conversed with" },
      { a: "[EVIDENCE] Kitchen Knife", b: "[LOCATION] Study", relationship: "recovered in" },
      { a: "[LOCATION] Study", b: "[LOCATION] Terrace Garden", relationship: "accessible via" }
    ],
    events: [
      { id: "E1", description: "Lord Pemberton enters study and bolts internal deadbolt" },
      { id: "E2", description: "Perimeter window is forced open from terrace garden" },
      { id: "E3", description: "Fuse is pulled, extinguishing study lighting" },
      { id: "E4", description: "Violent altercation ensues in total darkness" },
      { id: "E5", description: "Lord Pemberton collapses and safe contents are seized" }
    ],
    constraints: [
      { type: "before", before: "E1", after: "E4", label: "Pemberton must enter study before struggle ensues" },
      { type: "before", before: "E2", after: "E4", label: "Window forced open before struggle takes place" },
      { type: "before", before: "E3", after: "E4", label: "Lights extinguished before or during confrontation" },
      { type: "mustFollow", before: "E3", after: "E4", label: "Altercation occurs IMMEDIATELY after lights cut out" },
      { type: "before", before: "E4", after: "E5", label: "Altercation precedes collapse and theft" }
    ],
    solution: {
      canonicalCulpritId: "S1",
      canonicalCulpritName: "Arthur Black",
      motive: "Lord Pemberton had uncovered that Arthur Black had been systematically embezzling joint firm capital and had forged £250,000 in company promissory bonds to cover personal gambling debts. Pemberton secured the bonds in his private wall safe and threatened to deliver them to the authorities the next morning. Black needed to incapacitate Pemberton and retrieve the bonds before dawn.",
      methodAndOpportunity: "Using the executive visitor keycard (EV6) issued for his stay, Black bypassed the east corridor at 21:15 to access the service fuse box. At 21:18, he placed three unanswered calls to Lord Pemberton's mobile (EV3) to confirm the victim was alone in the study and to cause a distraction. At 21:19, Black deliberately pulled the 30A ceramic fuse (EV7), leaving his latent fingerprint (EV9). In total darkness, he slipped across the terrace garden in size 10 trench boots (EV4), pried open the study window (E2), attacked Pemberton with his Damascus knife (EV1) causing him to collapse (E4), raided the wall safe for the promissory bonds (E5), and concealed them in his private valise (EV8).",
      chronologicalExplanation: "1. 21:15 - Arthur Black uses his executive guest pass (EV6) to enter the east servant corridor.\n2. 21:18 - Black calls Lord Pemberton three times (EV3); Pemberton bolts the study door from inside (E1) and ignores the calls.\n3. 21:19 - Black pulls the 30A ceramic fuse (E3, EV7), leaving a latent print (EV9) and plunging the study into darkness.\n4. 21:20 - Black traverses the terrace garden in size 10 boots (EV4) and forces open the study window (E2).\n5. 21:21 - Altercation erupts immediately in darkness; Pemberton is incapacitated with Black's knife (E4, EV1).\n6. 21:23 - Black loots the wall safe, takes the promissory bonds (E5, EV8), and retreats to the library.",
      decisiveEvidenceIds: ["EV1", "EV3", "EV4", "EV6", "EV7", "EV8", "EV9"],
      decisiveEvidenceExplanation: "• EV8 (Stolen Promissory Bonds): The definitive stolen goods found hidden inside Arthur Black's locked valise.\n• EV9 (Ceramic Fuse Latent Print): Biometric confirmation connecting Black directly to the electrical sabotage.\n• EV1 (Kitchen Knife): Damascus chef's knife owned by Arthur Black, bearing drapery fibers from the study.\n• EV6 (Master Keycard): Executive visitor security log timestamped at 21:15 in the east servant corridor.\n• EV3 (Victim's Phone): 3 incoming calls from Black right before the blackout were used to distract Pemberton.\n• EV4 (Muddy Footprint): Size 10 trench boot indentation outside terrace window matches Black's bespoke footwear.\n• EV7 (Tripped Fuse): Explains the sudden blackout directly preceding the altercation.",
      misleadingClues: [
        {
          suspectId: "S3",
          suspectName: "Daniel Cole",
          clueIds: ["EV5", "EV2"],
          explanation: "Daniel Cole has the highest suspicion score (88) and authored the threatening debt letter (EV5). However, night gate security logs prove Cole's sedan remained outside the locked perimeter gate. Cole had no master keycard (EV6), could not access the internal fuse box, and never entered the manor."
        },
        {
          suspectId: "S4",
          suspectName: "The Butler (E. Higgins)",
          clueIds: ["EV6"],
          explanation: "The Butler (suspicion 73) possesses master study keys, but the corridor card log recorded an executive visitor pass, not staff credentials. Higgins wears size 8 soft house slippers, which contradict the size 10 trench boot impressions (EV4). Higgins was in the scullery preparing tea."
        },
        {
          suspectId: "S2",
          suspectName: "Maria Lane",
          clueIds: ["EV4"],
          explanation: "Maria Lane (suspicion 41) was tending greenhouse plants on the terrace, but wears size 6 garden clogs and had no financial connection to the promissory bonds."
        },
        {
          suspectId: "S5",
          suspectName: "Victoria Sterling",
          clueIds: [],
          explanation: "Victoria Sterling (suspicion 60) was in the guest wing during the incident; her alibi was confirmed by telephone room service records at 21:22."
        }
      ],
      remainingUncertainty: "While Black's fingerprint on the fuse and the stolen bonds in his valise conclusively prove his guilt, Lord Pemberton's exact level of consciousness when the safe was opened remains medically uncertain.",
      suspectHints: {
        "S3": "While Daniel Cole's threatening letter (EV5) and high suspicion score make him an obvious person of interest, gate logs confirm his sedan remained outside the locked estate gate. Look for someone with verified internal access to the east servant corridor and fuse box at 21:15.",
        "S4": "Although The Butler had study keys, the corridor access log (EV6) registered an executive visitor pass, not servant credentials. Notice also that the Butler wears size 8 slippers, unlike the size 10 trench boots found outside the window.",
        "S2": "Maria Lane was near the greenhouse, but her footwear size and lack of financial motive clear her. Focus on who had a direct financial motive regarding the stolen promissory bonds.",
        "S5": "Victoria Sterling was verified to be in the guest wing by telephone service logs at 21:22. Re-examine the owner of the Damascus steel knife and the corridor keycard."
      }
    }
  },
  {
    id: "CASE-2019",
    title: "The Poisoned Decanter",
    leadInvestigator: "Chief Inspector Adler",
    incidentDate: "October 14, 2026, 20:00",
    status: "Active Investigation",
    synopsis: "A high-profile diplomat collapsed during an official diplomatic dinner. Toxin analysis confirmed belladonna extract in the vintage port decanter. Strict service logs provide deterministic ordering constraints.",
    evidence: [
      { id: "EV11", name: "Crystal Port Decanter", importance: 96, category: "Physical Object", description: "Traces of lethal belladonna alkaloid found inside neck rim." },
      { id: "EV12", name: "Amber Glass Vial", importance: 82, category: "Physical Object", description: "Disposed behind pantry wine cooler; faint almond residue." },
      { id: "EV13", name: "Dining Room Seating Chart", importance: 50, category: "Document", description: "Shows deceased seated adjacent to Ambassador Moretti." },
      { id: "EV14", name: "Kitchen Service Log", importance: 74, category: "Document", description: "Decanter officially checked out from cellar at 19:40 by Sommelier Dupont." },
      { id: "EV15", name: "Crushed Belladonna Berries", importance: 90, category: "Forensic", description: "Fresh botanical residue of Atropa belladonna found inside Sommelier Dupont's cellar corkscrew pouch." },
      { id: "EV16", name: "Rare Wine Shortage Audit", importance: 76, category: "Document", description: "Victim's private audit memo warning Dupont that wine cellar embezzlement would be reported to the police after dinner." },
      { id: "EV17", name: "Digestive Bitter Drops", importance: 45, category: "Physical Object", description: "Medical prescription confirming Attaché Vance uses almond-scented digestive drops, explaining the amber vial (EV12)." }
    ],
    suspects: [
      { id: "S10", name: "Ambassador Moretti", suspicion: 85, role: "Foreign Envoy", alibi: "In dining hall greeting guests until banquet seated." },
      { id: "S11", name: "Sommelier Dupont", suspicion: 68, role: "Head Sommelier", alibi: "Claims decanter was unsealed in open view of kitchen staff." },
      { id: "S12", name: "Attaché Vance", suspicion: 90, role: "Diplomatic Aide", alibi: "Seen lingering outside pantry corridor just before service." }
    ],
    witnesses: [
      { name: "Banquet Waiter", statement: "Poured wine directly from the crystal decanter upon diner's request; Sommelier Dupont personally handed me the decanter with strict orders to serve the guest of honor first." },
      { name: "Kitchen Porter", statement: "Observed Attaché Vance near the wine pantry shelves at 19:45 taking digestive drops, but Sommelier Dupont was alone with the decanter from 19:38 to 19:43." }
    ],
    graphEdges: [
      { a: "[PERSON] Diplomat (Victim)", b: "[PERSON] Ambassador Moretti", relationship: "rival of" },
      { a: "[PERSON] Diplomat (Victim)", b: "[LOCATION] Banquet Hall", relationship: "dined in" },
      { a: "[PERSON] Diplomat (Victim)", b: "[EVIDENCE] Rare Wine Shortage Audit", relationship: "authored" },
      { a: "[PERSON] Attaché Vance", b: "[LOCATION] Pantry", relationship: "seen near" },
      { a: "[PERSON] Attaché Vance", b: "[EVIDENCE] Amber Glass Vial", relationship: "handled" },
      { a: "[PERSON] Attaché Vance", b: "[EVIDENCE] Digestive Bitter Drops", relationship: "prescribed to" },
      { a: "[PERSON] Sommelier Dupont", b: "[EVIDENCE] Crystal Port Decanter", relationship: "poured from" },
      { a: "[PERSON] Sommelier Dupont", b: "[EVIDENCE] Crushed Belladonna Berries", relationship: "carried" },
      { a: "[PERSON] Sommelier Dupont", b: "[EVIDENCE] Rare Wine Shortage Audit", relationship: "threatened by" },
      { a: "[EVIDENCE] Crystal Port Decanter", b: "[LOCATION] Banquet Hall", relationship: "served in" }
    ],
    events: [
      { id: "A", description: "Suspect slips into butler's pantry unnoticed" },
      { id: "B", description: "Poison is added to decanter in pantry" },
      { id: "C", description: "Decanter is brought out to dining table" },
      { id: "D", description: "Guest pours and drinks from decanter" },
      { id: "E", description: "Guest collapses and emergency services alerted" }
    ],
    constraints: [
      { type: "before", before: "A", after: "B", label: "Suspect must enter pantry before adulterating decanter" },
      { type: "mustFollow", before: "A", after: "B", label: "Poison added IMMEDIATELY upon entering pantry" },
      { type: "before", before: "B", after: "C", label: "Poison introduced before decanter is carried to dining table" },
      { type: "before", before: "C", after: "D", label: "Decanter placed on table before victim drinks" },
      { type: "before", before: "D", after: "E", label: "Victim consumes wine before collapse" }
    ],
    solution: {
      canonicalCulpritId: "S11",
      canonicalCulpritName: "Sommelier Dupont",
      motive: "The victim, an experienced diplomatic inspector, was auditing the embassy's private cellar and discovered that Sommelier Dupont had embezzled and sold over €100,000 of rare vintage grand crus, substituting them with cheap table wine. The victim authored an audit notice (EV16) demanding Dupont's confession immediately following the dinner, threatening criminal prosecution.",
      methodAndOpportunity: "As Head Sommelier, Dupont had exclusive custody of the vintage port decanter checked out from the cellar at 19:40 (EV14). Dupont slipped into the butler's pantry (Event A), extracted lethal belladonna alkaloid (EV11) from crushed berries in his pouch (EV15), and coated the inner neck of the decanter (Event B). He instructed the junior waiter to pour for the guest of honor first (Event C). When the diplomat drank (Event D), the lethal alkaloid caused sudden cardiovascular collapse (Event E).",
      chronologicalExplanation: "1. 19:40 - Sommelier Dupont checks out the decanter from the cellar vault (EV14).\n2. 19:41 - Dupont slips into the butler's pantry unobserved (Event A).\n3. 19:42 - Dupont coats the inner neck rim of the decanter with belladonna extract (Event B, EV11, EV15).\n4. 19:44 - Decanter is carried out to the dining hall with specific instructions (Event C).\n5. 19:50 - The diplomat pours and drinks the port (Event D).\n6. 19:55 - The diplomat collapses and emergency medical services are dispatched (Event E).",
      decisiveEvidenceIds: ["EV11", "EV14", "EV15", "EV16"],
      decisiveEvidenceExplanation: "• EV15 (Crushed Belladonna Berries): Direct forensic link found inside Dupont's corkscrew pouch matching the poison in the decanter.\n• EV16 (Rare Wine Shortage Audit): Uncovers the urgent blackmail motive and impending criminal exposure against Dupont.\n• EV11 (Crystal Port Decanter): The murder instrument coated with lethal belladonna alkaloid.\n• EV14 (Kitchen Service Log): Establishes Dupont's exclusive checkout custody at 19:40 during the poison window.",
      misleadingClues: [
        {
          suspectId: "S12",
          suspectName: "Attaché Vance",
          clueIds: ["EV12", "EV17"],
          explanation: "Attaché Vance holds the highest suspicion score (90) and handled an amber glass vial (EV12) behind the pantry cooler. However, chemical analysis and prescription records (EV17) prove the vial contained almond-scented digestive drops for acid reflux, completely unrelated to the deadly belladonna alkaloid (EV11)."
        },
        {
          suspectId: "S10",
          suspectName: "Ambassador Moretti",
          clueIds: ["EV13"],
          explanation: "Ambassador Moretti (suspicion 85) was a known diplomatic rival seated next to the victim (EV13). However, dozens of foreign guests verify that Moretti remained in the banquet hall throughout the reception and never entered the service pantry."
        }
      ],
      remainingUncertainty: "The exact geographic source where Dupont foraged the wild belladonna berries remains unidentified, though botanical soil on his shoes matches the embassy conservatory grounds.",
      suspectHints: {
        "S12": "Attaché Vance had the highest suspicion score (90) and handled the amber vial (EV12), but chemical testing revealed the vial only held almond digestive bitters (EV17). The lethal poison was belladonna alkaloid (EV11). Re-examine who had exclusive preparation custody of the decanter.",
        "S10": "Ambassador Moretti is a known rival, but banquet witnesses confirm he never entered the pantry where the decanter was prepared. Look at the service log (EV14) to see who checked out the decanter."
      }
    }
  },
  {
    id: "CASE-3081",
    title: "The Riverside Warehouse Break-in",
    leadInvestigator: "Detective Miller",
    incidentDate: "October 16, 2026, 03:15",
    status: "Active Investigation",
    synopsis: "High-grade industrial components were stolen from a bonded dockside warehouse. Multiple security sensors (fence, dog, lock, power, door) created interlocking forensic constraints.",
    evidence: [
      { id: "EV21", name: "Cut Wire Fence Section", importance: 65, category: "Physical Object", description: "Industrial wire cutters used on North perimeter fence to stage an external breach." },
      { id: "EV22", name: "Sedative Syringe", importance: 72, category: "Physical Object", description: "Veterinary tranquilizer dart containing xylazine retrieved near rear guard dog kennel." },
      { id: "EV23", name: "Smashed Padlock", importance: 80, category: "Physical Object", description: "Heavy brass padlock shorn with hydraulic spreader." },
      { id: "EV24", name: "Loading Bay Sensor Log", importance: 91, category: "Document", description: "Roller shutter open alert recorded at 03:32." },
      { id: "EV25", name: "Hydraulic Jaws of Life", importance: 87, category: "Physical Object", description: "Industrial spreader tool recovered from O'Connor's private workbench; paint transfer matches Smashed Padlock (EV23)." },
      { id: "EV26", name: "Veterinary Xylazine Receipt", importance: 78, category: "Document", description: "Invoice for canine sedative compound identical to EV22, issued to O'Connor's registered kennel." },
      { id: "EV27", name: "Consignment Black Market Note", importance: 94, category: "Document", description: "Encrypted manifest found in O'Connor's lodge locker detailing a £150,000 cash payout for the stolen components." },
      { id: "EV28", name: "Reefer Telematics Log", importance: 48, category: "Document", description: "Confirms Truck Driver Keller's vehicle was running automatically for a scheduled pre-cooling cycle while Keller was in the breakroom." }
    ],
    suspects: [
      { id: "S21", name: "Dock Boss O'Connor", suspicion: 75, role: "Union Foreman", alibi: "Claims off-shift sleeping in dockside lodge." },
      { id: "S22", name: "Truck Driver Keller", suspicion: 82, role: "Contract Hauler", alibi: "Vehicle GPS logged nearby at 03:20 with engine running." }
    ],
    witnesses: [
      { name: "River Patrol Officer", statement: "Spotted unlit box truck departing wharf towards highway around 03:40; driver wore an orange union foreman high-vis vest." },
      { name: "Dock Security Guard", statement: "Found guard dog unresponsive and side gate unlatched at 03:35. The dog routinely attacks strangers, but whines affectionately for Foreman O'Connor." }
    ],
    graphEdges: [
      { a: "[PERSON] Dock Boss O'Connor", b: "[LOCATION] Warehouse", relationship: "oversees" },
      { a: "[PERSON] Dock Boss O'Connor", b: "[EVIDENCE] Hydraulic Jaws of Life", relationship: "owns" },
      { a: "[PERSON] Dock Boss O'Connor", b: "[EVIDENCE] Veterinary Xylazine Receipt", relationship: "billed to" },
      { a: "[PERSON] Dock Boss O'Connor", b: "[EVIDENCE] Consignment Black Market Note", relationship: "authored" },
      { a: "[PERSON] Truck Driver Keller", b: "[LOCATION] Loading Bay", relationship: "parked near" },
      { a: "[PERSON] Truck Driver Keller", b: "[EVIDENCE] Loading Bay Sensor Log", relationship: "triggered" },
      { a: "[PERSON] Truck Driver Keller", b: "[EVIDENCE] Reefer Telematics Log", relationship: "logged by" },
      { a: "[LOCATION] Warehouse", b: "[EVIDENCE] Smashed Padlock", relationship: "entry point" }
    ],
    events: [
      { id: "W1", description: "Perimeter fence is cut at north-east corner" },
      { id: "W2", description: "Guard dog at warehouse rear is sedated" },
      { id: "W3", description: "Side door padlock is broken open" },
      { id: "W4", description: "Warehouse interior lights flicker off (fuse tripped)" },
      { id: "W5", description: "Loading bay roller door is raised and goods removed" }
    ],
    constraints: [
      { type: "before", before: "W1", after: "W3", label: "Fence cut before door padlock broken" },
      { type: "before", before: "W2", after: "W5", label: "Dog sedated before loading bay roller door opened" },
      { type: "mustFollow", before: "W3", after: "W4", label: "Interior fuse tripped IMMEDIATELY after door breached" },
      { type: "before", before: "W4", after: "W5", label: "Lights cut before merchandise moved" },
      { type: "notAdjacent", a: "W1", b: "W5", label: "Fence breach and loading bay exit cannot be adjacent" }
    ],
    solution: {
      canonicalCulpritId: "S21",
      canonicalCulpritName: "Dock Boss O'Connor",
      motive: "Burdened by severe personal debt and illicit union kickback arrears, Dock Boss O'Connor negotiated a clandestine black-market deal to sell high-grade bonded industrial components for £150,000 (EV27).",
      methodAndOpportunity: "O'Connor leveraged his intimate knowledge of the wharf layout and security systems. At 03:15, he cut the perimeter fence (W1, EV21) to stage an external intrusion. Knowing the guard dog would not bark at him, he approached the kennel and administered a veterinary sedative dart (W2, EV22, EV26). He used his own hydraulic spreader (EV25) to shear the side door brass padlock (W3, EV23). Entering the dark warehouse, he tripped the interior fuse box (W4) at the electrical sub-panel that only facility managers knew how to operate. At 03:32, he raised the roller door (W5, EV24), loaded the pallets into an accomplice's unlit transport truck, and fled.",
      chronologicalExplanation: "1. 03:15 - O'Connor cuts the perimeter fence at the north corner to stage an outside break-in (W1, EV21).\n2. 03:20 - O'Connor tranquillizes the familiar guard dog with xylazine (W2, EV22, EV26).\n3. 03:26 - O'Connor shears the side door padlock using his hydraulic spreader (W3, EV23, EV25).\n4. 03:27 - Immediately upon entry, O'Connor cuts the internal power fuse (W4).\n5. 03:32 - Roller shutter is opened and components are transferred into the transport vehicle (W5, EV24, EV27).",
      decisiveEvidenceIds: ["EV21", "EV22", "EV23", "EV25", "EV26", "EV27"],
      decisiveEvidenceExplanation: "• EV25 (Hydraulic Jaws of Life): Direct mechanical forensic match to the shear stress marks on Smashed Padlock EV23.\n• EV26 (Veterinary Xylazine Receipt): Prescription invoice signed by O'Connor for the exact chemical compound in dart EV22.\n• EV27 (Consignment Black Market Note): Explicit financial ledger documenting the £150,000 stolen goods payout.\n• EV21 (Cut Wire Fence): Demonstrates the staged perimeter breach.\n• EV22 (Sedative Syringe): Demonstrates how the guard dog was bypassed without barking.\n• EV23 (Smashed Padlock): Physical breach point.",
      misleadingClues: [
        {
          suspectId: "S22",
          suspectName: "Truck Driver Keller",
          clueIds: ["EV24", "EV28"],
          explanation: "Truck Driver Keller has the highest suspicion score (82) because his vehicle GPS logged an active engine at 03:20 near the bay. However, telematics records (EV28) prove this was an automatic scheduled refrigeration pre-cooling cycle while Keller was resting inside the canteen. Keller had no sedative access, could not pacify the dog, and had no knowledge of the internal fuse layout."
        }
      ],
      remainingUncertainty: "The exact identity of the riverboat accomplice who received the stolen shipment downriver remains under maritime investigation.",
      suspectHints: {
        "S22": "Truck Driver Keller had an idling engine, but telematics logs (EV28) confirm an automated refrigeration cycle while he was inside the canteen. How would an external contractor calm the guard dog without noise and know the exact fuse location? Consider who oversees the facility daily."
      }
    }
  }
];

module.exports = { cases };
