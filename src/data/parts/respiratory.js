const P = (id, name, o) => ({ id, name, system: 'respiratory', minLevel: 2, ...o });

export const RESPIRATORY_PARTS = [
  P('lungs', 'Lungs', {
    latin: 'Pulmones',
    tags: ['organ'],
    details: {
      basic: 'Two spongy bags in your chest that take oxygen from the air into your blood.',
      middle:
        'The right lung has three lobes and the left has two (to leave room for the heart). You breathe about 12–20 times a minute.',
      high:
        'Each lung is covered by visceral pleura and lined by parietal pleura with a fluid-filled cavity between them, held at negative pressure. Blood arrives via pulmonary arteries and leaves via pulmonary veins.',
      undergrad:
        'The hilum contains the main bronchus, pulmonary artery and veins, lymphatics and nerves. Lungs have a dual blood supply: pulmonary (gas exchange) and bronchial (nutrition, from the aorta).',
      phd:
        'Frontiers include the pulmonary niche for platelet biogenesis discovered by intravital imaging, single-cell atlases revealing new airway and alveolar cell states, distal airway stem cells, and lung-regeneration approaches after fibrosis or transplant.',
    },
    facts: [
      'If you unfolded all your alveoli they would cover roughly half a tennis court.',
      'At rest you move about 6 litres of air per minute.',
    ],
  }),
  P('trachea', 'Windpipe (Trachea)', {
    latin: 'Trachea',
    tags: ['airway'],
    details: {
      basic: 'The tube in your neck that carries air down to your lungs.',
      middle:
        'It is held open by C-shaped rings of cartilage, so it never collapses. That is why your neck feels bumpy.',
      high:
        'A tube 10–12 cm long with 16–20 cartilage rings, a smooth muscle (trachealis) and ciliated respiratory epithelium. It bifurcates at the carina (T4/T5) into the right and left main bronchi.',
      undergrad:
        'Foreign bodies more often enter the right main bronchus because it is wider and more vertical. Tracheostomy is usually performed between the 2nd and 3rd tracheal rings.',
      phd:
        'Research covers mucociliary clearance and ciliary beating, airway basal cell biology, tissue-engineered tracheas and the mechanical design principles of cartilage-ringed airways.',
    },
  }),
  P('bronchi', 'Bronchi & Bronchioles', {
    latin: 'Bronchi et bronchioli',
    minLevel: 3,
    tags: ['airway'],
    details: {
      basic: 'The windpipe splits into two tubes, one for each lung, then into smaller and smaller branches.',
      middle: 'The branching tubes look like an upside-down tree, ending in millions of tiny air sacs.',
      high:
        'Main bronchi → lobar → segmental (10 right, 8–10 left) → subsegmental → bronchioles → terminal and respiratory bronchioles. Bronchioles lack cartilage and are held open by alveolar traction; smooth muscle controls their diameter.',
      undergrad:
        'Bronchoconstriction in asthma is mediated by muscarinic (M3) and leukotriene pathways, relieved by beta-2 agonists. Bronchopulmonary segments are surgical units, each with its own segmental bronchus and artery.',
      phd:
        'Research covers airway remodelling, epithelium-derived cytokines (TSLP, IL-25, IL-33) driving type 2 inflammation, club and ciliated cell plasticity, and the "small airways" as the silent zone of early obstructive disease.',
    },
  }),
  P('alveoli', 'Alveoli (Air Sacs)', {
    latin: 'Alveoli pulmonis',
    minLevel: 3,
    tags: ['tissue', 'gas exchange'],
    details: {
      basic: 'Tiny bubble-shaped air sacs at the ends of the airways where oxygen enters your blood.',
      middle:
        'There are about 300–500 million of them, and their walls are so thin that gases slip across in a fraction of a second.',
      high:
        'The blood–gas barrier is about 0.3 µm thick: type I pneumocytes, fused basement membrane and capillary endothelium. Type II pneumocytes secrete surfactant, which lowers surface tension and prevents collapse.',
      undergrad:
        'Gas exchange follows Fick’s law; ventilation–perfusion matching keeps V/Q near 1. Surfactant deficiency in premature infants causes neonatal respiratory distress syndrome.',
      phd:
        'Research covers alveolar type II cell stemness and AT1 transdifferentiation, alveolar regeneration versus fibrosis (the "failed repair" model of IPF), mechanotransduction in ventilator-induced lung injury, and the stochastic nature of alveolarisation.',
    },
  }),
  P('larynx', 'Voice Box (Larynx)', {
    latin: 'Larynx',
    tags: ['organ', 'airway'],
    details: {
      basic: 'The bump in your throat (Adam’s apple). It makes your voice when air passes through it.',
      middle:
        'Two vocal cords vibrate as air passes. It also has a flap, the epiglottis, that closes when you swallow so food does not go down the wrong way.',
      high:
        'Cartilages: thyroid, cricoid, epiglottis, and paired arytenoid, corniculate and cuneiform. Intrinsic muscles are all supplied by the recurrent laryngeal nerve except cricothyroid (external laryngeal nerve).',
      undergrad:
        'The rima glottidis is the narrowest part of the adult airway. Bilateral recurrent laryngeal nerve injury paralyses the cords and may need tracheostomy; unilateral injury causes hoarseness.',
      phd:
        'Research covers voice biomechanics and the mucosal wave, laryngeal reinnervation, and high-speed videoendoscopy with machine learning for diagnosing vocal fold lesions.',
    },
  }),
  P('pharynx', 'Throat (Pharynx)', {
    latin: 'Pharynx',
    tags: ['organ', 'airway', 'digestive'],
    details: {
      basic: 'The space behind your nose and mouth that both air and food pass through.',
      middle:
        'It splits into two tubes at the bottom: the windpipe in front (air) and the gullet behind (food).',
      high:
        'Three parts: nasopharynx (with the pharyngeal tonsil/adenoids and the Eustachian tube opening), oropharynx (palatine tonsils) and laryngopharynx. The pharyngeal constrictors swallow in sequence; the muscles are supplied by the pharyngeal plexus (CN IX, X).',
      undergrad:
        'Waldeyer’s ring is the ring of lymphoid tissue guarding the entrance. The retropharyngeal and parapharyngeal spaces are routes for the spread of infection. Obstructive sleep apnoea is often due to pharyngeal collapse.',
      phd:
        'Research covers swallow biomechanics and aspiration, pharyngeal electrical stimulation for dysphagia, upper-airway dilator muscle control, and the pharynx as a reservoir for the aerodigestive microbiome.',
    },
  }),
  P('pleura', 'Pleura', {
    latin: 'Pleura',
    minLevel: 3,
    tags: ['membrane', 'tissue'],
    details: {
      basic: 'A thin, slippery double-layered wrapping around each lung.',
      middle: 'The two layers slide over each other with a little fluid between them, so breathing does not hurt.',
      high:
        'Visceral pleura covers the lung; parietal pleura lines the chest wall, diaphragm and mediastinum. The pleural cavity normally holds about 5–10 mL of fluid at negative pressure.',
      undergrad:
        'A pneumothorax (air in the cavity) collapses the lung; a pleural effusion (fluid) or empyema (pus) also separates the layers. Pain from parietal pleura is carried by intercostal nerves; visceral pleura is insensitive.',
      phd:
        'Research covers pleural mesothelial biology, fluid turnover and the newly appreciated pleural lymphatics, indwelling tunnelled catheters versus pleurodesis, and mesothelioma genomics after asbestos exposure.',
    },
  }),
  P('nasal-cavity', 'Nasal Cavity & Sinuses', {
    latin: 'Cavitas nasi et sinus paranasales',
    minLevel: 3,
    tags: ['airway'],
    details: {
      basic: 'The inside of your nose warms, wets and filters the air you breathe.',
      middle: 'Hairs and mucus catch dust; the sticky mucus is what you blow out of your nose.',
      high:
        'Three conchae (turbinates) create the superior, middle and inferior meatuses; paranasal sinuses open into them. The mucociliary escalator moves mucus towards the pharynx at about 1 cm per minute.',
      undergrad:
        'The osteomeatal complex is where the frontal, maxillary and anterior ethmoid sinuses drain; blockage causes sinusitis. The nose humidifies ~10,000 litres of air per day.',
      phd:
        'Research covers mucociliary dysfunction in primary ciliary dyskinesia and cystic fibrosis, nasal nitric oxide as a diagnostic, sinus microbiome in chronic rhinosinusitis, and the nose as a route for brain-targeted drug delivery.',
    },
  }),
  P('respiratory-control', 'Control of Breathing', {
    latin: 'Regulatio respirationis',
    minLevel: 4,
    tags: ['function', 'control'],
    details: {
      basic: 'You do not have to think about breathing: your brain does it for you automatically.',
      middle: 'You can hold your breath for a while, but soon your brain makes you breathe again.',
      high:
        'The medullary respiratory centres (pre-Bötzinger complex and others) generate rhythm; central chemoreceptors respond to CO₂ via CSF pH, and peripheral chemoreceptors in the carotid and aortic bodies respond to low O₂, high CO₂ and low pH.',
      undergrad:
        'CO₂, not lack of oxygen, is the main driver of ventilation at rest. In chronic CO₂ retainers (some COPD patients) hypoxic drive becomes important, so uncontrolled oxygen can depress ventilation.',
      phd:
        'Research covers central chemosensitive neurons (retrotrapezoid nucleus, raphe), the coupling of rhythm and pattern generation, sigh and gasping mechanisms, opioid-induced respiratory depression and the molecular basis of sudden infant death syndrome.',
    },
  }),
];

export default RESPIRATORY_PARTS;
