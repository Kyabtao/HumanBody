const P = (id, name, o) => ({ id, name, system: 'endocrine', minLevel: 2, ...o });

export const ENDOCRINE_PARTS = [
  P('thyroid', 'Thyroid Gland', {
    latin: 'Glandula thyroidea',
    tags: ['gland'],
    details: {
      basic: 'A butterfly-shaped gland in your neck that sets how fast your body uses energy.',
      middle: 'It makes hormones that control growth, body temperature and how quickly you burn food.',
      high:
        'Two lobes joined by an isthmus, lying in front of the trachea. Follicular cells secrete T4 and T3, needing iodine; parafollicular C cells secrete calcitonin, which lowers blood calcium.',
      undergrad:
        'The recurrent laryngeal nerves run in the tracheo-oesophageal grooves and are at risk in thyroidectomy. HPT axis: TRH (hypothalamus) → TSH (pituitary) → T3/T4, with negative feedback. Goitre results from iodine deficiency or stimulation.',
      phd:
        'Research covers the sodium–iodide symporter and organification, thyroid hormone receptor isoforms and tissue-specific action, thyroid eye disease autoimmunity, and the debate around subclinical hypothyroidism and treatment thresholds.',
    },
  }),
  P('parathyroid', 'Parathyroid Glands', {
    latin: 'Glandulae parathyroideae',
    minLevel: 3,
    tags: ['gland'],
    details: {
      basic: 'Four tiny glands on the back of your thyroid that keep the calcium level in your blood just right.',
      middle: 'Calcium is needed for bones, muscles and nerves, so the level must stay steady.',
      high:
        'They secrete parathyroid hormone (PTH), which raises blood calcium by acting on bone, kidney (reabsorption and vitamin D activation) and indirectly on the gut.',
      undergrad:
        'Hyperparathyroidism causes "stones, bones, groans and psychiatric overtones"; hypoparathyroidism after neck surgery causes tetany. Calcium is sensed by the calcium-sensing receptor (CaSR).',
      phd:
        'Research covers PTH pulsatility and its anabolic versus catabolic bone effects, FGF23–Klotho–vitamin D interplay, and tertiary hyperparathyroidism in renal disease via the calcium–phosphate–PTH axis.',
    },
  }),
  P('pancreas-islets', 'Pancreatic Islets', {
    latin: 'Insulae pancreaticae',
    minLevel: 3,
    tags: ['gland', 'micro'],
    details: {
      basic: 'Small clusters of cells in the pancreas that make insulin, the hormone that controls blood sugar.',
      middle:
        'After a meal, insulin tells your cells to take sugar out of the blood; glucagon does the opposite between meals.',
      high:
        'Islets of Langerhans contain beta cells (insulin, amylin), alpha (glucagon), delta (somatostatin), PP and epsilon (ghrelin) cells, with a rich fenestrated capillary network and complex paracrine control.',
      undergrad:
        'Type 1 diabetes is autoimmune beta-cell destruction; type 2 involves insulin resistance with relative deficiency. Insulin signals through the receptor tyrosine kinase and GLUT4 translocation.',
      phd:
        'Research covers beta-cell heterogeneity and dedifferentiation, glucagon-like peptide-1 receptor agonists and dual/triple agonists, islet transplantation and encapsulation, and closed-loop insulin delivery algorithms.',
    },
  }),
  P('pineal', 'Pineal Gland', {
    latin: 'Glandula pinealis',
    minLevel: 4,
    tags: ['gland', 'brain'],
    details: {
      basic: 'A tiny gland deep in your brain that makes a hormone which helps you feel sleepy at night.',
      middle: 'It follows light: darkness switches it on and light switches it off, setting your body clock.',
      high:
        'It secretes melatonin from tryptophan, driven by the suprachiasmatic nucleus via a pathway through the superior cervical ganglion. Melatonin peaks at night and helps entrain circadian rhythms.',
      undergrad:
        'Light reaching the retina via intrinsically photosensitive retinal ganglion cells (melanopsin) suppresses melatonin. Pineal calcification is common and visible on skull X-ray; tumours (pinealomas) can cause Parinaud syndrome.',
      phd:
        'Research covers the molecular circadian clock (BMAL1/CLOCK/PER/CRY), melatonin receptor pharmacology, seasonal breeding biology, and chronotherapy — timing drugs to circadian biology.',
    },
  }),
  P('thymus', 'Thymus', {
    latin: 'Thymus',
    minLevel: 3,
    tags: ['gland', 'immune'],
    details: {
      basic: 'A gland behind your breastbone that trains young immune cells when you are a child.',
      middle: 'It is biggest in childhood and slowly shrinks after puberty, replaced by fat.',
      high:
        'The thymus has a cortex (dense with developing T cells) and a medulla (with Hassall’s corpuscles). T-cell precursors from bone marrow undergo positive and negative selection here.',
      undergrad:
        'Selection creates self-tolerant, self-MHC-restricted T cells; AIRE gene expression in medullary epithelium presents self-antigens. DiGeorge syndrome (22q11 deletion) causes thymic aplasia and T-cell deficiency.',
      phd:
        'Research covers thymic involution and immune ageing, Treg development, thymic epithelial cell heterogeneity by single-cell sequencing, and strategies for thymic regeneration and tolerance induction in transplantation.',
    },
  }),
  P('hormones', 'Hormones', {
    latin: 'Hormona',
    tags: ['function'],
    details: {
      basic: 'Hormones are chemical messages carried in your blood that tell organs what to do.',
      middle: 'They work slowly compared with nerves, but their effects last much longer.',
      high:
        'Three chemical classes: peptides and proteins (insulin, GH), steroids from cholesterol (cortisol, oestrogen, testosterone) and amines from tyrosine (thyroid hormone, catecholamines). Receptors may be on the cell surface or inside the cell.',
      undergrad:
        'Control is usually by negative feedback loops (e.g. hypothalamic–pituitary–target gland axes), with pulsatile secretion and circadian rhythms; positive feedback occurs in ovulation and childbirth.',
      phd:
        'Research covers receptor pharmacology and biased agonism, nuclear receptor co-regulators, hormone pulsatility encoding information, endocrine-disrupting chemicals, and the emerging field of exosomal hormone and microRNA signalling.',
    },
  }),
  P('growth-hormone', 'Growth & Metabolism Axis', {
    latin: 'Axis incrementi',
    minLevel: 4,
    tags: ['function'],
    details: {
      basic: 'A hormone from the pituitary tells your bones and muscles to grow while you are a child.',
      middle: 'Too little slows growth; too much makes a child grow very tall or an adult’s hands and feet enlarge.',
      high:
        'Growth hormone acts directly and through IGF-1 from the liver. It is released in pulses, especially during deep sleep, and is stimulated by GHRH and ghrelin and inhibited by somatostatin.',
      undergrad:
        'GH raises blood glucose and promotes lipolysis and protein synthesis; IGF-1 mediates most growth effects at the epiphyseal plates. Acromegaly results from a GH-secreting adenoma in adults, gigantism before epiphyseal fusion.',
      phd:
        'Research covers GH secretagogue receptors, the GH–insulin–longevity trade-off studied in GH-receptor-deficient cohorts, IGF-1 signalling in cancer, and the biology of growth-plate senescence at puberty.',
    },
  }),
  P('stress-response', 'Stress Response (HPA Axis)', {
    latin: 'Axis hypothalamo-pituitary-adrenalis',
    minLevel: 4,
    tags: ['function'],
    details: {
      basic: 'When something scares you, your body gets ready fast: faster heartbeat, quicker breathing, more energy.',
      middle:
        'The fast alarm uses nerves and adrenaline; a slower chemical alarm uses cortisol from the adrenal glands.',
      high:
        'The hypothalamus releases CRH, the pituitary releases ACTH, and the adrenal cortex releases cortisol; cortisol feeds back to switch the system off. Sympathetic activation and the adrenal medulla handle the immediate response.',
      undergrad:
        'Acute stress is adaptive; chronic elevation of cortisol causes muscle wasting, fat redistribution, hyperglycaemia, immune suppression and bone loss (Cushing syndrome pattern).',
      phd:
        'Research covers glucocorticoid receptor sensitivity and FKBP5, early-life programming of the HPA axis, allostatic load, and the two-way links between stress, inflammation and depression.',
    },
  }),
];

export default ENDOCRINE_PARTS;
