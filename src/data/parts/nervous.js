const P = (id, name, o) => ({ id, name, system: 'nervous', minLevel: 2, ...o });

export const NERVOUS_PARTS = [
  P('brain', 'Brain', {
    latin: 'Encephalon',
    tags: ['organ', 'CNS'],
    details: {
      basic:
        'Your brain is the boss of your body. It lets you think, feel, learn, move and remember.',
      middle:
        'The brain sits safely inside the skull and floats in fluid. It uses about 20% of the energy you get from food, though it is only about 2% of your weight.',
      high:
        'Major parts: cerebrum (two hemispheres with frontal, parietal, temporal and occipital lobes), cerebellum, brainstem (midbrain, pons, medulla) and diencephalon (thalamus, hypothalamus). Twelve pairs of cranial nerves arise from it.',
      undergrad:
        'The brain is protected by the skull, three meninges (dura, arachnoid, pia), cerebrospinal fluid and the blood–brain barrier. Blood supply comes from the internal carotid (anterior circulation) and vertebrobasilar systems (posterior), joined by the circle of Willis.',
      phd:
        'Frontiers: connectomics and the glymphatic clearance system, meningeal lymphatics and neuroimmune interaction, astrocyte and microglial roles in synaptic pruning, neural organoids for development and disease, and brain–computer interfaces decoding speech from cortical activity.',
    },
    facts: [
      'The adult brain is about 1.4 kg and contains roughly 86 billion neurons.',
      'It produces about 20 watts of power — enough to light a dim bulb.',
    ],
  }),
  P('cerebrum', 'Cerebrum', {
    latin: 'Cerebrum',
    tags: ['organ', 'CNS', 'lobe'],
    details: {
      basic: 'The biggest part of your brain, wrinkled like a walnut, that does your thinking.',
      middle:
        'It has a left and a right half. The left side usually handles language and maths; the right side usually handles shapes, faces and music.',
      high:
        'Each hemisphere has frontal (planning, movement), parietal (sensation, spatial sense), temporal (hearing, memory) and occipital (vision) lobes. The surface is folded into gyri and sulci, increasing cortical area.',
      undergrad:
        'The motor and sensory homunculi map the body onto the pre- and post-central gyri. Broca’s area (speech production) and Wernicke’s area (comprehension) are usually in the left hemisphere.',
      phd:
        'Cortical research covers columnar and laminar organisation, predictive-coding models of perception, cortical plasticity after stroke or amputation, and the default mode network revealed by resting-state fMRI.',
    },
  }),
  P('cerebellum', 'Cerebellum', {
    latin: 'Cerebellum',
    tags: ['organ', 'CNS'],
    details: {
      basic: 'The "little brain" at the back, under the main brain. It keeps your balance.',
      middle:
        'It makes your movements smooth and accurate, and helps you learn skills like riding a bike.',
      high:
        'It has two hemispheres and a midline vermis, three peduncles connecting to the brainstem, and is organised into the vestibulocerebellum, spinocerebellum and cerebrocerebellum.',
      undergrad:
        'Damage causes ataxia, intention tremor, dysdiadochokinesia, nystagmus and scanning speech, with ipsilateral signs. It does not initiate movement but coordinates and times it.',
      phd:
        'The cerebellum contains most of the brain’s neurons in a crystalline circuit of granule cells, Purkinje cells and climbing fibres; research covers internal models, motor learning, eyeblink conditioning, and unexpected cognitive and affective roles.',
    },
  }),
  P('brainstem', 'Brainstem', {
    latin: 'Truncus encephali',
    tags: ['organ', 'CNS'],
    details: {
      basic: 'The stalk at the base of the brain that connects it to the spinal cord.',
      middle: 'It keeps you alive without you thinking: it controls breathing, heartbeat and blood pressure.',
      high:
        'Made of the midbrain, pons and medulla. It contains the nuclei of cranial nerves III–XII, the reticular formation, and the ascending and descending tracts linking cord and brain.',
      undergrad:
        'The medullary respiratory and cardiovascular centres control breathing and circulation; the reticular activating system maintains consciousness. Lesions produce crossed (alternating) deficits "long tract + cranial nerve" signs.',
      phd:
        'Research covers central chemoreception (retrotrapezoid nucleus), the locus coeruleus noradrenergic system and arousal, brainstem death criteria, and connectomic mapping of the ascending arousal network in disorders of consciousness.',
    },
  }),
  P('thalamus', 'Thalamus', {
    latin: 'Thalamus',
    tags: ['organ', 'CNS'],
    details: {
      basic: 'A relay station in the middle of the brain that passes messages to the thinking part.',
      middle: 'Almost everything you see, hear or touch goes through the thalamus first.',
      high:
        'A paired egg-shaped nuclear mass forming the lateral walls of the third ventricle, with relay nuclei (VPL, VPM, LGN, MGN), association nuclei and intralaminar nuclei.',
      undergrad:
        'The VPL carries body sensation and VPM face sensation to the cortex; the LGN relays vision and the MGN hearing. Thalamic stroke causes contralateral hemisensory loss and sometimes the severe "thalamic pain" syndrome.',
      phd:
        'Research covers thalamocortical loops and oscillations (sleep spindles, absence seizures), the matrix versus core nuclei, central post-stroke pain mechanisms, and deep brain stimulation of the thalamus for tremor and epilepsy.',
    },
  }),
  P('hypothalamus', 'Hypothalamus', {
    latin: 'Hypothalamus',
    tags: ['organ', 'CNS', 'endocrine'],
    details: {
      basic: 'A small part deep in the brain that keeps your body temperature steady and tells you when you are hungry or thirsty.',
      middle:
        'It links the brain to the hormone system through the pituitary gland, which hangs just below it.',
      high:
        'It controls the autonomic nervous system, appetite, thirst, sleep–wake cycles, thermoregulation, circadian rhythms (via the suprachiasmatic nucleus) and releasing hormones for the anterior pituitary.',
      undergrad:
        'The hypothalamo-hypophyseal portal system carries releasing hormones to the anterior pituitary; the supraoptic and paraventricular nuclei produce ADH and oxytocin, transported down axons to the posterior pituitary.',
      phd:
        'Research covers leptin/melanocortin and ghrelin circuits in obesity, AgRP/NPY and POMC neurons, fever and thermogenesis, circadian misalignment and metabolic disease, and hypothalamic inflammation in diet-induced obesity.',
    },
  }),
  P('pituitary', 'Pituitary Gland', {
    latin: 'Hypophysis',
    system: 'endocrine',
    tags: ['gland', 'endocrine'],
    details: {
      basic: 'A pea-sized gland under the brain that tells other glands what to do.',
      middle: 'It is called the "master gland" because its hormones control growth, the thyroid, the adrenals and more.',
      high:
        'The anterior lobe (adenohypophysis) secretes GH, TSH, ACTH, LH, FSH and prolactin; the posterior lobe (neurohypophysis) stores and releases ADH and oxytocin made in the hypothalamus.',
      undergrad:
        'It sits in the sella turcica, below the optic chiasm — so a tumour causes bitemporal hemianopia. Adenomas cause mass effects and either hormone excess (e.g. acromegaly, Cushing disease, prolactinoma) or hypopituitarism.',
      phd:
        'Research covers pituitary stem cells, transcription factors (PROP1, PIT1, TPIT), the hypothalamic-pituitary-end-organ feedback models, and the paradoxical pars intermedia remnant in human fetal life.',
    },
  }),
  P('spinal-cord', 'Spinal Cord', {
    latin: 'Medulla spinalis',
    tags: ['organ', 'CNS'],
    details: {
      basic: 'A thick cable of nerves running down your backbone, carrying messages between brain and body.',
      middle:
        'It is protected by the bones of your spine and it controls fast reflexes, like pulling your hand away from something hot.',
      high:
        'It has 31 segments (8 cervical, 12 thoracic, 5 lumbar, 5 sacral, 1 coccygeal) giving rise to spinal nerves. White matter (ascending/descending tracts) surrounds butterfly-shaped grey matter.',
      undergrad:
        'Major ascending tracts: dorsal columns (fine touch, vibration, proprioception) and spinothalamic (pain, temperature); major descending: corticospinal (voluntary movement). Injury causes signs below the level, with spinal shock initially.',
      phd:
        'Research covers central pattern generators for locomotion, axon regeneration after injury (Nogo, PTEN, chondroitinase), epidural stimulation restoring stepping, and the central nervous system’s inhibitory extracellular matrix.',
    },
  }),
  P('peripheral-nerves', 'Peripheral Nerves', {
    latin: 'Nervi peripherici',
    tags: ['nerve', 'PNS'],
    details: {
      basic: 'Nerves are like wires running all over your body, carrying messages to and from the brain.',
      middle:
        'Some nerves carry feelings inwards, some carry movement commands outwards, and some do both.',
      high:
        'Twelve pairs of cranial nerves serve the head and neck; 31 pairs of spinal nerves serve the rest. Each nerve is bundled with connective tissue layers: endoneurium, perineurium, epineurium.',
      undergrad:
        'A dermatome is the skin area supplied by one spinal nerve; a myotome the muscle group. Peripheral nerves contain sensory, motor and autonomic fibres; injury causes lower motor neuron signs with Wallerian degeneration distal to the lesion.',
      phd:
        'Research covers the neurovascular unit of the nerve, perineurial barrier and blood–nerve barrier, Schwann cell reprogramming (c-Jun) after injury, macrophage clearance of debris, and targeted reinnervation for prosthetic control.',
    },
  }),
  P('autonomic', 'Autonomic Nervous System', {
    latin: 'Systema nervosum autonomicum',
    tags: ['nerve', 'PNS'],
    details: {
      basic: 'The part of your nervous system that works by itself: heartbeat, digestion, sweating.',
      middle:
        'It has two opposing teams: the sympathetic ("fight or flight") speeds you up, and the parasympathetic ("rest and digest") calms you down.',
      high:
        'Sympathetic outflow is thoracolumbar (T1–L2) with short preganglionic and long postganglionic fibres near the sympathetic chain; parasympathetic is craniosacral (CN III, VII, IX, X and S2–S4) with long preganglionic fibres to ganglia in or near target organs.',
      undergrad:
        'Sympathetic uses noradrenaline at most postganglionic endings (except sweat glands, which are cholinergic) and the adrenal medulla releases adrenaline; parasympathetic uses acetylcholine on muscarinic receptors.',
      phd:
        'Frontiers include the vagal anti-inflammatory reflex (cholinergic pathways), the enteric nervous system as a "second brain", neuroimmune synapse-like contacts, baroreflex physiology in hypertension, and bioelectronic medicine.',
    },
  }),
  P('neuron', 'Neuron', {
    latin: 'Neuronum',
    minLevel: 3,
    tags: ['cell', 'histology'],
    details: {
      basic: 'A neuron is a nerve cell — a tiny messenger that sends signals around your body.',
      middle:
        'It has branches (dendrites) to receive signals, a cell body, and a long tail (axon) that carries the signal away.',
      high:
        'Neurons generate action potentials by voltage-gated Na⁺ influx and K⁺ efflux; at the synapse the signal is passed chemically by neurotransmitters such as glutamate, GABA, dopamine and acetylcholine.',
      undergrad:
        'Myelin (Schwann cells in the PNS, oligodendrocytes in the CNS) speeds conduction by saltatory conduction; nodes of Ranvier regenerate the signal. Multipolar, bipolar and unipolar types exist.',
      phd:
        'Research covers ion channel structure and gating, dendritic computation with active conductances, synaptic plasticity rules (Hebbian and homeostatic), optogenetic dissection of circuits, and single-cell transcriptomic classification of hundreds of neuronal types.',
    },
  }),
  P('eye', 'Eye', {
    latin: 'Oculus',
    tags: ['sense', 'organ'],
    details: {
      basic: 'Your eyes catch the light and let you see colours, shapes and movement.',
      middle:
        'Light passes through the pupil to the back of the eye, where the retina turns it into nerve signals for the brain.',
      high:
        'Layers: fibrous (sclera, cornea), vascular (choroid, ciliary body, iris) and inner (retina). The cornea and lens refract light; the retina contains rods (dim light) and cones (colour, with three opsins).',
      undergrad:
        'The optic nerve (CN II) exits at the optic disc — the blind spot. Lesions before the chiasm cause monocular blindness, at the chiasm bitemporal hemianopia, and behind it homonymous hemianopia. Aqueous humour circulation failure raises pressure in glaucoma.',
      phd:
        'Research covers phototransduction cascades, retinal ganglion cell subtypes (over 30) and their central targets, optogenetics and gene therapy for inherited retinopathies (e.g. RPE65), retinal prostheses, and cortical plasticity in amblyopia.',
    },
  }),
  P('ear', 'Ear', {
    latin: 'Auris',
    tags: ['sense', 'organ'],
    details: {
      basic: 'Your ears let you hear sounds and also help you keep your balance.',
      middle:
        'Sound shakes the eardrum and three tiny bones, and the shaking becomes nerve signals in the cochlea.',
      high:
        'Outer ear collects sound, middle ear (tympanic membrane, malleus, incus, stapes, oval window) amplifies it, and the inner ear cochlea converts it via hair cells. The semicircular canals detect rotation and the utricle and saccule detect linear acceleration.',
      undergrad:
        'The vestibulocochlear nerve (CN VIII) carries hearing and balance; the facial nerve passes through the middle ear. Conductive deafness involves the outer/middle ear, sensorineural deafness the cochlea or nerve.',
      phd:
        'Research covers cochlear tonotopy and outer hair cell electromotility (prestin), hair-cell regeneration attempts (Atoh1, notch inhibition), vestibular evoked potentials, and cochlear implant processing strategies and auditory cortex plasticity.',
    },
  }),
  P('nose', 'Nose', {
    latin: 'Nasus',
    tags: ['sense', 'organ'],
    details: {
      basic: 'Your nose lets you smell things and helps you breathe.',
      middle:
        'Hairs and sticky mucus inside trap dust and germs; special smell detectors sit high inside the nose.',
      high:
        'The nasal cavity is divided by the septum and warmed and humidified by three conchae. Olfactory receptors lie in the olfactory epithelium in the roof, sending axons through the cribriform plate to the olfactory bulb (CN I).',
      undergrad:
        'The paranasal sinuses (frontal, ethmoid, sphenoid, maxillary) drain into the meatuses; the sphenopalatine artery (from the maxillary) is the source of severe posterior epistaxis. Kiesselbach’s plexus causes anterior nosebleeds.',
      phd:
        'Research covers the combinatorial receptor code of ~400 human olfactory receptor genes, the direct route of olfaction to cortex without a thalamic relay, olfactory dysfunction as an early marker of neurodegeneration, and the nasal route for CNS drug delivery.',
    },
  }),
  P('tongue', 'Tongue', {
    latin: 'Lingua',
    tags: ['sense', 'organ', 'digestive'],
    details: {
      basic: 'Your tongue lets you taste sweet, sour, salty, bitter and savoury, and it helps you talk and swallow.',
      middle:
        'Tiny bumps called papillae hold your taste buds. Different areas of the tongue are slightly more sensitive to different tastes.',
      high:
        'The tongue has intrinsic and extrinsic muscles (all supplied by CN XII except palatoglossus, CN X). Taste (anterior two-thirds via CN VII chorda tympani, posterior third via CN IX, epiglottis via CN X) uses receptors on microvilli.',
      undergrad:
        'General sensation: lingual nerve (CN V3). The tongue has filiform (no taste), fungiform, foliate and circumvallate papillae; the last are arranged in a V at the sulcus terminalis.',
      phd:
        'Research covers taste receptor types (T1R/T2R families, ENaC for salt), the labelled-line versus pattern coding debate, gut "taste" receptors controlling incretin release, and tongue strength and swallow biomechanics in dysphagia.',
    },
  }),
  P('meninges', 'Meninges', {
    latin: 'Meninges',
    minLevel: 3,
    tags: ['tissue', 'CNS'],
    details: {
      basic: 'Three thin layers wrap around your brain and spinal cord to cushion and protect them.',
      middle: 'There is fluid between the layers, so your brain floats safely inside your skull.',
      high:
        'From outside in: dura mater (tough, with dural venous sinuses), arachnoid mater and pia mater. Spaces are epidural (potential, containing vessels), subdural (potential) and subarachnoid (containing CSF and vessels).',
      undergrad:
        'Extradural haematoma is arterial (middle meningeal artery) with a lucid interval; subdural is venous (bridging veins) in the elderly; subarachnoid haemorrhage is usually from a berry aneurysm and presents as a thunderclap headache.',
      phd:
        'Frontiers: the discovery of meningeal lymphatic vessels, dural venous sinus-associated immunity, the skull–meninges bone marrow route for immune cell entry, and glymphatic CSF–ISF exchange regulated by aquaporin-4 and sleep.',
    },
  }),
  P('reflex', 'Reflex Arc', {
    latin: 'Arcus reflexus',
    minLevel: 3,
    tags: ['function', 'PNS'],
    details: {
      basic: 'A reflex is a super-fast automatic action, like blinking or pulling your hand back from something hot.',
      middle:
        'The message goes to the spinal cord and back, without waiting for the brain — that is why it is so quick.',
      high:
        'Components: receptor, sensory neuron, integration centre (often a synapse in the cord), motor neuron and effector. Monosynaptic (knee jerk) versus polysynaptic (withdrawal with crossed extension).',
      undergrad:
        'Reflex testing localises spinal levels: biceps C5–C6, triceps C7, knee L3–L4, ankle S1–S2. Upper motor neuron lesions cause brisk reflexes and an extensor plantar response (Babinski).',
      phd:
        'Research covers stretch-reflex gain control by gamma motor neurons, presynaptic inhibition, reciprocal Ia inhibition, and reflex modulation during locomotion through central pattern generator gating.',
    },
  }),
];

export default NERVOUS_PARTS;
