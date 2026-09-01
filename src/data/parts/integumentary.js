const P = (id, name, o) => ({ id, name, system: 'integumentary', minLevel: 1, ...o });

export const INTEGUMENTARY_PARTS = [
  P('skin', 'Skin', {
    latin: 'Cutis',
    tags: ['organ', 'tissue'],
    details: {
      basic: 'Skin is the stretchy waterproof covering over your whole body. It is your largest organ.',
      middle:
        'It keeps germs and water out, keeps water in, lets you feel touch, and helps control your temperature.',
      high:
        'Two main layers: the epidermis (stratified squamous keratinised epithelium with five strata: basale, spinosum, granulosum, lucidum in thick skin, corneum) and the dermis (papillary and reticular, with collagen and elastin), over a subcutaneous hypodermis.',
      undergrad:
        'Skin makes vitamin D under UV light; it carries out thermoregulation by sweating, vasodilation, vasoconstriction and piloerection. The rule of nines estimates burn area; the depth is graded as superficial, partial or full thickness.',
      phd:
        'Research covers keratinocyte differentiation and barrier lipids, the skin and gut microbiome, resident memory T cells and cutaneous immune surveillance, chronic wound biology, and engineered skin substitutes with appendages.',
    },
    facts: [
      'Your skin weighs about 3.5–5 kg and covers roughly 1.5–2 m².',
      'You shed about 30,000–40,000 dead skin cells every hour.',
    ],
  }),
  P('epidermis', 'Epidermis', {
    latin: 'Epidermis',
    minLevel: 3,
    tags: ['tissue', 'layer'],
    details: {
      basic: 'The thin outer layer of your skin that you can see.',
      middle: 'New cells are made at the bottom and slowly move up, flattening and hardening on the way.',
      high:
        'Layers: stratum basale (stem cells and melanocytes), spinosum (desmosomes), granulosum (keratohyalin and lamellar bodies), lucidum (thick skin only) and corneum (dead keratinised corneocytes).',
      undergrad:
        'Keratinocytes are the main cell; melanocytes give pigment (transferred in melanosomes), Langerhans cells are antigen-presenting, and Merkel cells are touch receptors. It takes about 4 weeks for a cell to travel from base to surface.',
      phd:
        'Research covers epidermal stem-cell niches and the hair follicle bulge, the corneocyte cornified envelope and filaggrin mutations in eczema, melanocyte–keratinocyte signalling, and non-invasive optical imaging of the living epidermis.',
    },
  }),
  P('dermis', 'Dermis', {
    latin: 'Dermis',
    minLevel: 3,
    tags: ['tissue', 'layer'],
    details: {
      basic: 'The thick, tough layer under the surface of your skin.',
      middle: 'It holds your blood vessels, nerves, sweat glands and hair roots, and gives skin its strength.',
      high:
        'Collagen (mainly types I and III) and elastic fibres made by fibroblasts, in a ground substance of glycosaminoglycans. Papillary dermis has capillary loops and Meissner corpuscles; reticular dermis has larger vessels, Pacinian corpuscles and appendages.',
      undergrad:
        'Blisters split at the dermo-epidermal junction or within the epidermis depending on the disease. Photoageing and intrinsic ageing degrade collagen via matrix metalloproteinases and reduce elastic recoil.',
      phd:
        'Research covers fibroblast heterogeneity and the papillary–reticular divide, mechanobiology and myofibroblast conversion, the glycation of collagen, and the papillary dermis as the site of first-pass immune surveillance in skin.',
    },
  }),
  P('hair', 'Hair & Nails', {
    latin: 'Pili et ungues',
    tags: ['appendage'],
    details: {
      basic: 'Hair keeps you warm and protects your skin; nails protect and support your fingertips.',
      middle:
        'Hair grows from tiny pockets in the skin called follicles. Nails are made of the same hard protein, keratin.',
      high:
        'A follicle has a bulb with the dermal papilla, matrix, inner and outer root sheaths, a sebaceous gland and the arrector pili muscle. Growth cycles through anagen, catagen and telogen. The nail unit has a matrix, bed, plate and folds.',
      undergrad:
        'Scalp hair grows about 1 cm per month; diffuse shedding follows stress (telogen effluvium). Androgenetic alopecia is driven by dihydrotestosterone in genetically susceptible follicles.',
      phd:
        'Research covers the Wnt/β-catenin and Sonic hedgehog control of follicle cycling, hair-follicle neogenesis and dermal papilla cell therapy for hair loss, and nail as a window to systemic disease and drug exposure.',
    },
  }),
  P('sweat-glands', 'Sweat & Oil Glands', {
    latin: 'Glandulae sudoriferae et sebaceae',
    minLevel: 3,
    tags: ['gland', 'appendage'],
    details: {
      basic: 'Your skin has tiny glands that make sweat to cool you and oil to keep it soft.',
      middle:
        'Sweat cools you as it dries; oil (sebum) waterproofs your skin and hair.',
      high:
        'Eccrine glands (everywhere, watery, cholinergic, for thermoregulation) and apocrine glands (armpits and groin, thicker, responding to stress and hormones). Sebaceous glands secrete sebum into hair follicles.',
      undergrad:
        'Sweat is hypotonic; heavy sweating can cause hyponatraemia. Sebum and the acid mantle keep skin pH around 5; overactive sebaceous glands plus Cutibacterium acnes drive acne.',
      phd:
        'Research covers sweat gland physiology and cystic fibrosis diagnosis by sweat chloride, thermoregulatory sweating in heat illness, and the skin microbiome–immune interaction in acne and hidradenitis suppurativa.',
    },
  }),
  P('touch-receptors', 'Touch & Temperature Sensors', {
    latin: 'Receptores cutanei',
    minLevel: 3,
    tags: ['sense', 'receptor'],
    details: {
      basic: 'Your skin is full of tiny sensors that let you feel touch, pressure, heat, cold and pain.',
      middle: 'Some places, like your fingertips, have far more sensors than others, like your back.',
      high:
        'Meissner corpuscles (light touch), Merkel discs (sustained touch and texture), Pacinian corpuscles (vibration), Ruffini endings (stretch), free nerve endings (pain, temperature) and hair follicle receptors.',
      undergrad:
        'Two-point discrimination maps receptor density; the fingertips discriminate about 2 mm. Thermoreceptors use TRP channels (TRPV1 for heat, TRPM8 for cold); pain fibres are A-delta (fast) and C (slow).',
      phd:
        'Research covers Piezo1/2 mechanotransduction, the molecular basis of itch versus pain, central sensitisation and chronic pain, and the development of electronic skin and prosthetic sensory feedback.',
    },
  }),
  P('wound-healing', 'Wound Healing', {
    latin: 'Sanatio vulneris',
    minLevel: 4,
    tags: ['function', 'tissue'],
    details: {
      basic: 'When you cut yourself, your skin repairs itself — that is what a scab is for.',
      middle:
        'Special cells rush in to clean the cut, then new tissue grows to fill it and close it up.',
      high:
        'Phases: haemostasis (platelet plug and fibrin), inflammation (neutrophils then macrophages), proliferation (granulation tissue, angiogenesis, re-epithelialisation, collagen), and remodelling (collagen maturation, scar contraction).',
      undergrad:
        'Healing is by primary intention (clean, sutured) or secondary intention (open, granulating). Wounds in skin heal to about 70–80% of original tensile strength; chronic wounds stall, often in inflammation.',
      phd:
        'Research covers myofibroblast mechanobiology, macrophage phenotype switching, keloid and hypertrophic scarring, foetal scarless healing, and the molecular control of appendage regeneration that adult mammalian skin lacks.',
    },
  }),
];

export default INTEGUMENTARY_PARTS;
