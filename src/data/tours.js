/** Guided lessons: one tour per learning level. */
export const TOURS = {
  1: {
    title: 'Class 1–5 · Meet Your Body',
    steps: [
      {
        title: 'This is you!',
        text: 'This is a model of a human body. You can spin it around by dragging, and zoom with your scroll wheel. Everything you can see on the outside is called a body region.',
        systems: ['surface'], view: 'front',
      },
      {
        title: 'Your head',
        text: 'Your head holds your brain, your eyes, your ears, your nose and your mouth. The hard bone underneath — the skull — protects the brain like a helmet.',
        systems: ['surface'], partId: 'head', view: 'head',
      },
      {
        title: 'Your chest',
        text: 'Inside your chest, behind your ribs, are your heart and your two lungs. Your heart is a pump. Your lungs take oxygen out of the air.',
        systems: ['surface', 'cardiovascular', 'respiratory'], partId: 'chest', view: 'torso',
      },
      {
        title: 'Your tummy',
        text: 'Your abdomen (tummy) holds your stomach, liver and intestines. They turn your food into the energy you need to run and play.',
        systems: ['surface', 'digestive'], partId: 'abdomen', view: 'torso',
      },
      {
        title: 'Arms and hands',
        text: 'Your shoulder is a ball-and-socket joint, so your arm can swing in big circles. Your hand has 27 small bones and a thumb that can touch every fingertip.',
        systems: ['surface', 'skeletal'], partId: 'hand', view: 'front',
      },
      {
        title: 'Legs and feet',
        text: 'Your legs carry your whole body. Your femur (thigh bone) is the longest, strongest bone in you. Your feet have springy arches.',
        systems: ['surface', 'skeletal'], partId: 'foot', view: 'legs',
      },
      {
        title: 'Your skin',
        text: 'Skin is your largest organ. It keeps germs out, keeps water in, lets you feel the world and helps keep your temperature steady. Look after it!',
        systems: ['surface', 'integumentary'], partId: 'skin', view: 'front',
      },
    ],
  },
  2: {
    title: 'Class 6–8 · The Body Systems',
    steps: [
      {
        title: 'Eleven systems, one body',
        text: 'Your body is built from teams of organs called systems. Turn them on one by one in the left panel and watch the body being assembled layer by layer.',
        systems: ['surface'], view: 'front',
      },
      {
        title: 'The skeleton',
        text: '206 bones make your skeleton. It supports you, protects your organs, lets you move, makes blood cells inside the marrow, and stores calcium.',
        systems: ['skeletal'], partId: 'skull', view: 'front',
      },
      {
        title: 'The muscles',
        text: 'Over 600 skeletal muscles pull on your bones. Muscles work in pairs: your biceps bends the elbow and your triceps straightens it.',
        systems: ['skeletal', 'muscular'], partId: 'biceps', view: 'front',
      },
      {
        title: 'The heart and blood',
        text: 'The heart has four chambers and pumps blood through about 100,000 km of vessels. Arteries carry blood away, veins bring it back.',
        systems: ['cardiovascular'], partId: 'heart', view: 'torso',
      },
      {
        title: 'Breathing',
        text: 'Air travels down your windpipe, through branching bronchi, into millions of tiny air sacs called alveoli where oxygen enters your blood.',
        systems: ['respiratory'], partId: 'lungs', view: 'torso',
      },
      {
        title: 'Food and waste',
        text: 'The digestive system is a 9-metre tube plus the liver, pancreas and gallbladder. The urinary system — kidneys, ureters, bladder — cleans your blood.',
        systems: ['digestive', 'urinary'], partId: 'stomach', view: 'torso',
      },
      {
        title: 'The control room',
        text: 'Your brain, spinal cord and nerves form the control network. They sense, decide and command — and they do it in milliseconds.',
        systems: ['nervous'], partId: 'brain', view: 'head',
      },
    ],
  },
  3: {
    title: 'Class 9–10 · Organs in Depth',
    steps: [
      {
        title: 'Inside the heart',
        text: 'Follow one drop of blood: right atrium → right ventricle → lungs → left atrium → left ventricle → aorta → body. Four valves keep it flowing one way.',
        systems: ['cardiovascular'], partId: 'heart-chambers', view: 'torso',
      },
      {
        title: 'The heart’s own supply',
        text: 'The heart muscle cannot feed itself from the blood inside it. The coronary arteries, which branch off the very start of the aorta, do that job.',
        systems: ['cardiovascular'], partId: 'coronary', view: 'torso',
      },
      {
        title: 'The airway tree',
        text: 'Trachea → main bronchi → lobar → segmental → bronchioles → alveoli. About 23 generations of branching end in roughly 300 million air sacs.',
        systems: ['respiratory'], partId: 'bronchi', view: 'torso',
      },
      {
        title: 'A working kidney',
        text: 'Each kidney holds about a million nephrons. Each nephron filters blood, then carefully takes back the water and salts your body needs.',
        systems: ['urinary'], partId: 'kidney', view: 'torso',
      },
      {
        title: 'Joints and cartilage',
        text: 'Synovial joints have cartilage, a capsule and slippery fluid. Cartilage has no blood vessels, so it heals slowly — it depends on movement to get nutrition.',
        systems: ['skeletal'], partId: 'joints', view: 'legs',
      },
      {
        title: 'Nerves and reflexes',
        text: 'A reflex arc — receptor, sensory nerve, spinal cord, motor nerve, muscle — lets you pull your hand away before your brain even feels the pain.',
        systems: ['nervous'], partId: 'spinal-cord', view: 'back',
      },
    ],
  },
  4: {
    title: 'Undergraduate · Gross Anatomy & Physiology',
    steps: [
      {
        title: 'Origin, insertion, nerve, action',
        text: 'Every muscle is described by four things. Take the biceps: it arises from the scapula, inserts on the radial tuberosity, is supplied by the musculocutaneous nerve, and flexes and supinates.',
        systems: ['skeletal', 'muscular'], partId: 'biceps', view: 'front',
      },
      {
        title: 'Nerve supply of the limb',
        text: 'The brachial plexus gives rise to the median, ulnar and radial nerves. Each has a classic injury: wrist drop (radial), claw hand (ulnar), carpal tunnel (median).',
        systems: ['nervous', 'skeletal'], partId: 'peripheral-nerves', view: 'front',
      },
      {
        title: 'The peritoneal cavity',
        text: 'Intraperitoneal organs are suspended by mesenteries; retroperitoneal ones — kidneys, pancreas, duodenum, aorta — lie behind the peritoneum. This decides how disease spreads.',
        systems: ['digestive', 'urinary'], partId: 'peritoneum', view: 'torso',
      },
      {
        title: 'The nephron in 3D',
        text: 'Glomerulus, proximal tubule, loop of Henle, distal tubule, collecting duct. The loop builds the osmotic gradient; ADH and aldosterone tune the final urine.',
        systems: ['urinary'], partId: 'nephron', view: 'torso', micro: true,
      },
      {
        title: 'A tissue slide, in 3D',
        text: 'Drop to the microscopic level: epithelium rests on a basement membrane, is avascular and polarised, and renews itself from stem cells in the basal layer.',
        systems: ['micro'], partId: 'epithelium', micro: true,
      },
      {
        title: 'Feedback control',
        text: 'Homeostasis uses receptors, control centres and effectors with negative feedback. Fever is a raised set point; diabetes is a broken control loop.',
        systems: ['micro'], partId: 'homeostasis', micro: true,
      },
    ],
  },
  5: {
    title: 'MD / PhD · Molecules, Cells & Frontiers',
    steps: [
      {
        title: 'One cell, in detail',
        text: 'Start from the cell: membrane, cytoplasm, organelles, nucleus. The Human Cell Atlas is currently mapping every cell type in the body by single-cell sequencing.',
        systems: ['micro'], partId: 'cell', micro: true,
      },
      {
        title: 'The nucleus',
        text: 'Two metres of DNA packed into a 6-micron nucleus: nucleosomes, loops, topologically associating domains, lamin-associated domains. 3D genome architecture regulates which genes can be read.',
        systems: ['micro'], partId: 'nucleus', micro: true,
      },
      {
        title: 'Mitochondria',
        text: 'Former bacteria that became power plants. They keep their own genome, inherited only from the mother, and signal innate immunity when their DNA escapes.',
        systems: ['micro'], partId: 'mitochondria', micro: true,
      },
      {
        title: 'From gene to protein',
        text: 'DNA → RNA → protein, with splicing, editing and regulation at every step. CRISPR, RNA therapeutics and targeted protein degradation all act on this flow of information.',
        systems: ['micro'], partId: 'molecular', micro: true,
      },
      {
        title: 'Stem cells and regeneration',
        text: 'Intestinal crypts, bone marrow, the hair-follicle bulge: adult niches renew tissue for life. Organoids and reprogramming now let us grow miniature organs in a dish.',
        systems: ['micro'], partId: 'stem-cells', micro: true,
      },
      {
        title: 'Why we age',
        text: 'Genomic instability, telomere attrition, epigenetic drift, lost proteostasis, mitochondrial decline, senescence, stem-cell exhaustion and altered signalling. Which of these are causes, and which are consequences?',
        systems: ['micro'], partId: 'aging', micro: true,
      },
    ],
  },
};

export default TOURS;
