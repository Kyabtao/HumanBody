const P = (id, name, o) => ({ id, name, system: 'lymphatic', minLevel: 2, ...o });

export const LYMPHATIC_PARTS = [
  P('lymph-nodes', 'Lymph Nodes', {
    latin: 'Nodi lymphoidei',
    tags: ['organ', 'immune'],
    details: {
      basic: 'Small bean-shaped lumps that filter germs out of the fluid draining from your tissues.',
      middle:
        'They swell and feel tender when you are fighting an infection — that is why your neck glands swell with a sore throat.',
      high:
        'There are about 600 nodes. Each has a capsule, an outer cortex with follicles and germinal centres, a paracortex (T-cell area with high endothelial venules) and a medulla with sinuses. Afferent vessels enter at the convex side, efferent vessels leave at the hilum.',
      undergrad:
        'Nodes filter lymph through a meshwork of macrophages and dendritic cells where lymphocytes meet antigen. Sentinel node biopsy maps the first draining node in cancer; nodes also stage cancer spread (TNM).',
      phd:
        'Research covers lymph node stromal subsets (fibroblastic reticular cells, follicular dendritic cells), germinal centre dynamics and affinity maturation, tertiary lymphoid structures in tumours and autoimmunity, and lymph node organoids.',
    },
  }),
  P('spleen', 'Spleen', {
    latin: 'Splen',
    tags: ['organ', 'immune'],
    details: {
      basic: 'An organ under your ribs on the left that filters your blood and fights germs.',
      middle: 'It also recycles old red blood cells, like a quality-control centre.',
      high:
        'Red pulp filters and removes aged erythrocytes; white pulp (periarteriolar lymphoid sheaths and follicles) mounts immune responses to blood-borne antigens. It is the largest lymphoid organ.',
      undergrad:
        'It filters encapsulated bacteria — after splenectomy patients need vaccination against pneumococcus, meningococcus and H. influenzae, and are at risk of overwhelming post-splenectomy infection. Hypersplenism destroys blood cells.',
      phd:
        'Research covers the splenic marginal zone B cell and its role in T-independent responses, splenic red-pulp macrophages and iron recycling, the spleen’s monocyte reservoir mobilised after myocardial infarction, and non-invasive spleen stiffness as a fibrosis marker.',
    },
  }),
  P('lymph-vessels', 'Lymphatic Vessels', {
    latin: 'Vasa lymphatica',
    tags: ['vessel'],
    details: {
      basic: 'A second network of thin tubes that carries clear fluid called lymph around your body.',
      middle:
        'They collect leaked fluid from tissues and return it to the blood, and they carry germ-fighting cells to the lymph nodes.',
      high:
        'Lymphatic capillaries (blind-ended, with overlapping button-like endothelial junctions and anchoring filaments) drain to collecting vessels with valves and smooth muscle, then to nodes and finally the thoracic duct and right lymphatic duct at the venous angles.',
      undergrad:
        'Lymph is moved by skeletal muscle pumps, arterial pulsation, respiration and intrinsic lymphangion contraction — there is no central pump. The thoracic duct drains everything except the right upper quadrant of the body.',
      phd:
        'Research covers lymphatic specification (PROX1, SOX18, VEGFR3), collecting-vessel pumping and shear-dependent maturation, chyle leaks and lymphoedema genetics, and the newly mapped meningeal lymphatics draining brain interstitial fluid.',
    },
  }),
  P('tonsils', 'Tonsils & Adenoids', {
    latin: 'Tonsillae',
    tags: ['organ', 'immune'],
    details: {
      basic: 'Lumps of germ-fighting tissue at the back of your throat.',
      middle: 'They are the first guards against germs that come in through your nose and mouth.',
      high:
        'Waldeyer’s ring: pharyngeal (adenoids), tubal, palatine and lingual tonsils. They contain lymphoid follicles with crypts that sample inhaled and swallowed antigens.',
      undergrad:
        'The palatine tonsil lies between the palatoglossal and palatopharyngeal arches; its arterial supply includes the tonsillar branch of the facial artery, and its venous drainage (via the external palatine vein) matters in post-tonsillectomy haemorrhage.',
      phd:
        'Research covers mucosal associated lymphoid tissue (MALT) induction of IgA, the tonsillar microbiome in recurrent tonsillitis, and the immunology of tonsillectomy versus conservative management.',
    },
  }),
  P('bone-marrow', 'Bone Marrow', {
    latin: 'Medulla ossium',
    minLevel: 3,
    tags: ['tissue', 'immune'],
    details: {
      basic: 'A soft, jelly-like substance inside your bones that makes new blood cells.',
      middle: 'Every second, your marrow makes millions of red cells, white cells and platelets.',
      high:
        'Red marrow (haematopoietic) is in flat bones and the ends of long bones in adults; yellow marrow is fatty. It contains haematopoietic stem cells in perivascular and endosteal niches with stromal support.',
      undergrad:
        'Blood formation follows lineage trees: myeloid (erythrocytes, granulocytes, monocytes, platelets) and lymphoid (B, T, NK). Bone marrow biopsy is taken from the iliac crest; extramedullary haematopoiesis reappears in marrow failure.',
      phd:
        'Research covers HSC niche biology (CXCL12-abundant reticular cells, leptin-receptor stroma), clonal haematopoiesis and pre-leukaemic clones, stress haematopoiesis in inflammation, and in vivo HSC gene editing and transplantation.',
    },
  }),
  P('immunity-innate', 'Innate Immunity', {
    latin: 'Immunitas innata',
    minLevel: 3,
    tags: ['function', 'immune'],
    details: {
      basic: 'The fast, general defence you are born with: skin, mucus, and cells that eat germs.',
      middle: 'It acts within minutes and does not need to learn the germ first.',
      high:
        'Includes epithelial barriers and antimicrobial peptides, complement, phagocytes (neutrophils, macrophages), NK cells, dendritic cells, mast cells and pattern-recognition receptors such as Toll-like receptors detecting PAMPs.',
      undergrad:
        'Inflammation has the classic signs (calor, dolor, rubor, tumor, functio laesa) mediated by histamine, prostaglandins, bradykinin and cytokines. Dendritic cells bridge innate and adaptive immunity by presenting antigen.',
      phd:
        'Research covers inflammasome biology, trained immunity via epigenetic and metabolic rewiring, neutrophil heterogeneity and NETosis, cGAS–STING DNA sensing, and the resolution of inflammation by specialised pro-resolving mediators.',
    },
  }),
  P('immunity-adaptive', 'Adaptive Immunity', {
    latin: 'Immunitas adaptiva',
    minLevel: 3,
    tags: ['function', 'immune'],
    details: {
      basic: 'The smarter defence that learns about a germ and remembers it for next time.',
      middle:
        'That is why you usually get some childhood illnesses only once, and why vaccines protect you.',
      high:
        'B cells make antibodies and can mature into plasma cells; T cells include CD4⁺ helpers (Th1, Th2, Th17, Treg) and CD8⁺ cytotoxic cells. Recognition uses rearranged receptors generated by V(D)J recombination.',
      undergrad:
        'Antibodies (IgM first, then class-switched IgG, IgA, IgE) neutralise, opsonise and activate complement. Antigen presentation uses MHC class I (all cells, to CD8) and class II (professional APCs, to CD4). Immunological memory produces a faster, larger secondary response.',
      phd:
        'Research covers germinal centre selection and somatic hypermutation, T-cell exhaustion and checkpoint immunotherapy, B-cell repertoire sequencing, tissue-resident memory cells, mRNA vaccine platforms, and immune tolerance mechanisms in autoimmunity and transplantation.',
    },
  }),
];

export default LYMPHATIC_PARTS;
