/**
 * The microscopic world: cells, organelles and the four basic tissues.
 * These parts unlock at higher levels and are explored in the "Micro" view.
 */
const P = (id, name, o) => ({ id, name, system: 'micro', minLevel: 4, ...o });

export const MICRO_PARTS = [
  P('cell', 'The Cell', {
    latin: 'Cellula',
    tags: ['cell', 'histology'],
    details: {
      basic: 'Everything in your body is built from tiny living bricks called cells.',
      middle: 'A cell is the smallest unit of life. Your body is made of trillions of them.',
      high:
        'A human cell has a plasma membrane, cytoplasm with organelles, and a nucleus containing DNA. There are roughly 30–40 trillion cells in the body, of which about 25 trillion are red blood cells.',
      undergrad:
        'The membrane is a phospholipid bilayer with proteins, cholesterol and glycolipids; transport is passive, facilitated or active. The cytoskeleton (actin, intermediate filaments, microtubules) gives shape, movement and intracellular transport.',
      phd:
        'Research covers phase separation and membraneless organelles, the mechanics of the nucleus and laminopathies, cell-size scaling laws, and the construction of synthetic minimal cells. The Human Cell Atlas project is mapping every cell type by single-cell transcriptomics.',
    },
    facts: ['About 37 trillion cells make up an adult human body.', 'Human cells contain around 20,000 protein-coding genes.'],
  }),
  P('nucleus', 'Nucleus & DNA', {
    latin: 'Nucleus',
    tags: ['organelle'],
    details: {
      basic: 'The control centre of the cell, holding the instruction book for your body.',
      middle: 'The instructions are written in a long molecule called DNA, coiled into 46 chromosomes.',
      high:
        'The nucleus has a double membrane with nuclear pores, chromatin (euchromatin and heterochromatin), the nucleolus (ribosome assembly) and the nuclear lamina. DNA is packaged around histones into nucleosomes.',
      undergrad:
        'Transcription makes mRNA, which is spliced and exported; translation occurs on ribosomes. Each somatic cell carries 46 chromosomes (23 pairs); the cell cycle is G1, S, G2 and M with checkpoints.',
      phd:
        'Research covers 3D genome organisation (TADs, CTCF loops, lamin-associated domains), epigenetic regulation by methylation and histone modification, CRISPR-based epigenome editing, telomere biology and senescence, and the nuclear mechanotransduction of force into gene expression.',
    },
  }),
  P('mitochondria', 'Mitochondria', {
    latin: 'Mitochondria',
    tags: ['organelle'],
    details: {
      basic: 'The power stations of the cell, turning food and oxygen into usable energy.',
      middle: 'Busy cells like heart muscle are packed with them because they need a lot of energy.',
      high:
        'They have a double membrane, their own circular DNA (inherited from the mother), and cristae carrying the electron transport chain. They make ATP by oxidative phosphorylation.',
      undergrad:
        'Glycolysis in the cytosol yields 2 ATP; the Krebs cycle and electron transport chain produce about 30–32 ATP per glucose. Mitochondria also buffer calcium and control apoptosis via cytochrome c release.',
      phd:
        'Research covers mitochondrial dynamics (fusion and fission, mitophagy), heteroplasmy and mitochondrial disease thresholds, mitochondria as innate-immune signalling platforms (mtDNA release, cGAS-STING), and the endosymbiotic origin of the organelle.',
    },
  }),
  P('er-golgi', 'Endoplasmic Reticulum & Golgi', {
    latin: 'Reticulum endoplasmicum et apparatus Golgiensis',
    tags: ['organelle'],
    details: {
      basic: 'A factory and post office inside the cell that makes and packages proteins and fats.',
      middle:
        'The rough ER makes proteins, the smooth ER makes fats and stores calcium, and the Golgi wraps everything for delivery.',
      high:
        'Rough ER is studded with ribosomes and folds secretory and membrane proteins, with quality control and the unfolded protein response. Smooth ER synthesises lipids and steroids and detoxifies drugs. The Golgi modifies (glycosylation), sorts and dispatches cargo.',
      undergrad:
        'Vesicular traffic uses COPI (retrograde), COPII (ER to Golgi) and clathrin (secretory and endocytic) coats, with SNARE-mediated fusion. Proteasomes degrade misfolded cytosolic proteins.',
      phd:
        'Research covers ER–plasma-membrane contact sites and lipid exchange, ER stress and the integrated stress response in diabetes and neurodegeneration, secretory pathway cargo receptors, and super-resolution imaging of Golgi trafficking.',
    },
  }),
  P('membrane', 'Cell Membrane', {
    latin: 'Membrana cellularis',
    tags: ['organelle', 'structure'],
    details: {
      basic: 'A thin skin around every cell that decides what goes in and out.',
      middle: 'It is made mainly of fat molecules with protein doors and pumps embedded in it.',
      high:
        'A fluid mosaic of phospholipids, cholesterol, integral and peripheral proteins and sugars (the glycocalyx). Transport includes channels, carriers and pumps; the Na⁺/K⁺-ATPase uses about a third of the cell’s ATP.',
      undergrad:
        'Membrane potential arises from ion gradients and selective permeability, described by the Goldman equation. Receptors (GPCRs, receptor tyrosine kinases, ion channels) transduce signals; caveolae and clathrin pits drive endocytosis.',
      phd:
        'Research covers lipid raft and nanodomain controversy, mechanosensitive channels (Piezo), cryo-EM structures of transporters and GPCRs, phase separation in membrane signalling, and the endothelial glycocalyx as a vascular barrier.',
    },
  }),
  P('epithelium', 'Epithelial Tissue', {
    latin: 'Textus epithelialis',
    tags: ['tissue', 'histology'],
    details: {
      basic: 'Epithelium is the sheet of cells that covers your body and lines all its tubes and organs.',
      middle: 'Skin, the lining of your mouth, your gut and your blood vessels are all epithelium.',
      high:
        'Classified by layers (simple, stratified, pseudostratified) and cell shape (squamous, cuboidal, columnar), plus specialisations: transitional urothelium, ciliated, keratinised, and glandular epithelium.',
      undergrad:
        'Epithelia rest on a basement membrane, are avascular and polarised (apical, lateral and basal surfaces) with tight junctions, adherens junctions, desmosomes and gap junctions. Glands are exocrine (ducts) or endocrine (ductless).',
      phd:
        'Research covers apical-basal polarity complexes (Par, Crumbs, Scribble), epithelial–mesenchymal transition in development, fibrosis and cancer, stem-cell-driven turnover kinetics, and the mechanics of epithelial sheets and tissue folding.',
    },
  }),
  P('connective-tissue', 'Connective Tissue', {
    latin: 'Textus connectivus',
    tags: ['tissue', 'histology'],
    details: {
      basic: 'Connective tissue is the packing and support material of the body.',
      middle: 'It includes bone, cartilage, fat, tendons and the loose tissue that holds everything together.',
      high:
        'All connective tissue has cells (fibroblasts, adipocytes, chondrocytes, osteocytes, and blood and immune cells), fibres (collagen, elastic, reticular) and ground substance. Types: embryonic, connective tissue proper, cartilage, bone and blood.',
      undergrad:
        'Collagen types differ in role: type I in bone, tendon and skin; type II in cartilage; type III in reticular tissue; type IV in basement membranes. Fibroblasts become myofibroblasts in wound contraction.',
      phd:
        'Research covers fibroblast heterogeneity by single-cell atlases, extracellular-matrix mechanobiology and stiffness-driven disease, fibrosis as failed resolution, proteoglycan and hyaluronan biology, and the matrix as a reservoir of growth factors.',
    },
  }),
  P('muscle-tissue-types', 'Muscle Tissue Types', {
    latin: 'Textus muscularis (typi)',
    tags: ['tissue', 'histology'],
    details: {
      basic: 'Muscle comes in three kinds that do three different jobs.',
      middle:
        'Skeletal muscle moves bones, cardiac muscle pumps blood, and smooth muscle squeezes your organs.',
      high:
        'Skeletal muscle has long multinucleated fibres with peripheral nuclei and sarcomeres; cardiac has branched cells with one or two central nuclei and intercalated discs; smooth has spindle cells with no striations.',
      undergrad:
        'Fibre types: type I (slow oxidative), type IIA (fast oxidative-glycolytic) and IIX (fast glycolytic). Regeneration relies on satellite cells under Pax7 control; cardiac muscle has very limited regeneration.',
      phd:
        'Research covers myosin heavy-chain isoform plasticity, titin and nebulin mechanics, the neuromuscular junction as a model synapse, and cardiac regeneration via cardiomyocyte proliferation, direct reprogramming or cell therapy.',
    },
  }),
  P('nervous-tissue', 'Nervous Tissue', {
    latin: 'Textus nervosus',
    tags: ['tissue', 'histology'],
    details: {
      basic: 'Nervous tissue carries messages as tiny electrical signals.',
      middle: 'It is made of neurons, which send signals, and glia, which look after them.',
      high:
        'Neurons have a soma, dendrites and an axon with Nissl substance; glia include astrocytes, oligodendrocytes, microglia and ependymal cells in the CNS, plus Schwann and satellite cells in the PNS.',
      undergrad:
        'Myelination by oligodendrocytes (CNS, one cell myelinates several axons) or Schwann cells (PNS, one cell myelinates one internode). The nodes of Ranvier concentrate voltage-gated sodium channels.',
      phd:
        'Research covers astrocyte calcium waves and the tripartite synapse, microglial pruning and complement tagging, oligodendrocyte precursor plasticity, activity-dependent myelination and its role in learning, and brain organoid models.',
    },
  }),
  P('stem-cells', 'Stem Cells', {
    latin: 'Cellulae praecursoriae',
    tags: ['cell', 'function'],
    details: {
      basic: 'Stem cells are unspecialised cells that can turn into many different cell types.',
      middle: 'Your body uses them to repair and replace tissue all the time.',
      high:
        'They are classified by potency: totipotent (zygote), pluripotent (embryonic inner cell mass, iPSCs), multipotent (haematopoietic, mesenchymal) and unipotent (e.g. epidermal basal cells). They self-renew and differentiate.',
      undergrad:
        'Adult stem-cell niches include bone marrow, intestinal crypts, the hair follicle bulge and the subventricular zone. Induced pluripotent stem cells are made with Yamanaka factors (Oct4, Sox2, Klf4, c-Myc).',
      phd:
        'Research covers reprogramming and transdifferentiation, niche signals (Wnt, Notch, BMP), organoids and blastoids, lineage tracing and clonal dynamics in human tissues, and the translation of cell therapy for diabetes, Parkinson disease and heart failure.',
    },
  }),
  P('molecular', 'Genes, Proteins & Signalling', {
    latin: 'Genes et viae significationis',
    tags: ['molecular'],
    details: {
      basic: 'Your body follows instructions written in your genes, which tell cells which proteins to make.',
      middle: 'Proteins do most of the work in a cell, and each cell uses only the genes it needs.',
      high:
        'DNA → RNA → protein is the central dogma. Gene expression is controlled by promoters, enhancers, transcription factors, chromatin state and non-coding RNAs; the proteome far exceeds the ~20,000 genes through splicing and modification.',
      undergrad:
        'Signalling pathways (MAPK, PI3K-AKT, JAK-STAT, Wnt, Notch, Hedgehog, TGF-β) relay information; second messengers include cAMP, calcium, IP3 and DAG. Enzymes are regulated allosterically and by phosphorylation.',
      phd:
        'Frontiers include CRISPR gene editing and base/prime editing, RNA therapeutics and splicing modulation, targeted protein degradation (PROTACs), intrinsically disordered proteins and condensates, and systems-biology models of metabolism.',
    },
  }),
  P('homeostasis', 'Homeostasis', {
    latin: 'Homeostasis',
    tags: ['function'],
    details: {
      basic: 'Homeostasis means keeping everything inside you steady, even when the world changes.',
      middle: 'Your temperature, water, salt, sugar and oxygen levels are all kept in a narrow healthy range.',
      high:
        'Control systems have a receptor, a control centre and an effector, usually working by negative feedback. Examples: thermoregulation, baroreflex control of blood pressure, glycaemic control and osmoregulation.',
      undergrad:
        'Set points can be adjusted (fever) and feed-forward responses anticipate change (cephalic phase of digestion, exercise tachycardia). Failure produces disease: diabetes, hypertension, dehydration, acid–base disorders.',
      phd:
        'Research covers predictive and anticipatory regulation (allostasis), biological robustness and degeneracy, circadian and ultradian control architecture, and control-theory models of physiological networks used in wearable health monitoring.',
    },
  }),
  P('aging', 'Ageing & Senescence', {
    latin: 'Senescentia',
    tags: ['function', 'research'],
    details: {
      basic: 'As people get older, their bodies change: they grow, then slowly wear out.',
      middle: 'Cells repair less well, bones get thinner, and muscles get weaker, but staying active helps.',
      high:
        'Hallmarks of ageing include genomic instability, telomere attrition, epigenetic alterations, loss of proteostasis, mitochondrial dysfunction, cellular senescence, stem-cell exhaustion and altered intercellular communication.',
      undergrad:
        'Senescent cells accumulate and secrete inflammatory signals (the SASP). Sarcopenia, osteopenia, immunosenescence and reduced organ reserve are the functional consequences.',
      phd:
        'Frontiers include senolytics and senomorphics, partial epigenetic reprogramming, caloric restriction and mTOR/AMPK/IGF pathways, heterochronic parabiosis evidence, and the debate over what ageing actually is — damage accumulation versus a developmental programme.',
    },
  }),
];

export default MICRO_PARTS;
