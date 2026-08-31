const P = (id, name, o) => ({ id, name, system: 'urinary', minLevel: 2, ...o });

export const URINARY_PARTS = [
  P('kidney', 'Kidney', {
    latin: 'Ren',
    tags: ['organ'],
    details: {
      basic: 'Two bean-shaped organs that clean your blood and make urine.',
      middle:
        'They sit against the back wall of your belly, one on each side of your spine, below your ribs.',
      high:
        'Each kidney has a cortex, medulla with pyramids and papillae, and a collecting system (minor and major calyces, renal pelvis). Blood enters via the renal artery directly from the aorta and leaves via the renal vein.',
      undergrad:
        'Each kidney holds about a million nephrons. The hilum transmits vein, artery and pelvis (front to back: vein, artery, ureter). The right kidney is slightly lower because of the liver.',
      phd:
        'Research covers nephron endowment and hypertension programming, single-cell kidney atlases, the proximal tubule as a metabolic hub, fibrosis as the final common pathway of CKD, and xenotransplantation and bioengineered kidney grafts.',
    },
    facts: ['Your kidneys filter about 180 litres of fluid every day, and reabsorb more than 99% of it.'],
  }),
  P('nephron', 'Nephron', {
    latin: 'Nephronum',
    minLevel: 3,
    tags: ['functional unit', 'micro'],
    details: {
      basic: 'A nephron is the tiny filter unit inside each kidney. There are about a million of them.',
      middle: 'Each one filters blood, keeps what the body needs and lets the extra water and waste become urine.',
      high:
        'It has a glomerulus (capillary tuft in Bowman’s capsule), proximal convoluted tubule, loop of Henle, distal convoluted tubule and collecting duct. The juxtaglomerular apparatus secretes renin.',
      undergrad:
        'Glomerular filtration rate is about 125 mL/min and is autoregulated by myogenic response and tubuloglomerular feedback. The loop of Henle creates the medullary osmotic gradient; ADH controls water reabsorption in collecting ducts; aldosterone controls sodium.',
      phd:
        'Research covers podocyte slit-diaphragm biology and proteinuria, tubuloglomerular feedback signalling, SGLT2 inhibitors and tubulocentric views of diabetic kidney disease, and the oxygen-sensing HIF pathway in the medulla.',
    },
  }),
  P('ureter', 'Ureter', {
    latin: 'Ureter',
    tags: ['tube'],
    details: {
      basic: 'Two thin tubes that carry urine from your kidneys down to your bladder.',
      middle: 'Muscle in their walls squeezes in waves to push urine down, even against gravity.',
      high:
        'About 25–30 cm long, with constrictions at the ureteropelvic junction, pelvic brim (crossing iliac vessels) and the ureterovesical junction — the classic places where stones lodge.',
      undergrad:
        'Ureteric pain radiates from loin to groin. The ureters pass under the uterine artery in females ("water under the bridge") and under the vas deferens in males, a key relation in pelvic surgery.',
      phd:
        'Research covers ureteric peristaltic pacemaking by atypical smooth muscle cells, ureteric stenting and stent-related symptoms, and endourological stone management with laser fragmentation.',
    },
  }),
  P('bladder', 'Urinary Bladder', {
    latin: 'Vesica urinaria',
    tags: ['organ'],
    details: {
      basic: 'A stretchy bag in your lower tummy that stores urine until you go to the toilet.',
      middle: 'It can hold about 400–600 mL. Stretch sensors tell your brain when it is getting full.',
      high:
        'The wall has the detrusor smooth muscle and a urothelium; the trigone between the two ureteric orifices and the urethra is smooth. The internal sphincter is smooth muscle (involuntary), the external sphincter is skeletal (voluntary).',
      undergrad:
        'Filling is sympathetic (detrusor relaxation, internal sphincter contraction, T11–L2); voiding is parasympathetic (S2–S4). Spinal cord injury above the sacral level leads to a reflex (automatic) bladder.',
      phd:
        'Research covers urothelial sensory transduction (Piezo channels, ATP release), interstitial cystitis/bladder pain syndrome, overactive bladder neuromodulation, and tissue-engineered bladder augmentation.',
    },
  }),
  P('urethra', 'Urethra', {
    latin: 'Urethra',
    tags: ['tube'],
    details: {
      basic: 'The tube that carries urine from your bladder out of your body.',
      middle: 'The female urethra is short (about 4 cm); the male urethra is much longer (about 20 cm).',
      high:
        'The male urethra has prostatic, membranous and spongy (penile) parts and also carries semen; the female urethra opens in the vestibule in front of the vaginal opening.',
      undergrad:
        'The short female urethra explains the higher rate of urinary tract infections. The external sphincter surrounds the membranous urethra; catheterisation risks injury at the bulbomembranous junction.',
      phd:
        'Research covers the urethral continence mechanism (rhabdosphincter and supportive fascia), pelvic-floor biomechanics, and tissue-engineered urethral substitutes with buccal mucosa grafts.',
    },
  }),
  P('kidney-function', 'Filtration & Balance', {
    latin: 'Filtratio et aequilibrium',
    minLevel: 3,
    tags: ['function'],
    details: {
      basic: 'Your kidneys act like filters, keeping your blood clean and your water just right.',
      middle: 'They also balance salts and acids, and help control your blood pressure.',
      high:
        'Processes: glomerular filtration, tubular reabsorption, secretion and excretion. The RAAS (renin–angiotensin–aldosterone system) controls blood pressure and sodium; erythropoietin controls red cell production; vitamin D is activated here.',
      undergrad:
        'Acid–base balance depends on excreting H⁺ and regenerating bicarbonate, plus ammonium excretion. Clearance and GFR are estimated from creatinine and now cystatin C.',
      phd:
        'Research covers tubuloglomerular feedback and the macula densa, pressure natriuresis, the kidney–bone–parathyroid axis (FGF23, Klotho), and cardio-renal syndromes linking congestion to worsening filtration.',
    },
  }),
  P('adrenal', 'Adrenal Glands', {
    latin: 'Glandulae suprarenales',
    system: 'endocrine',
    minLevel: 3,
    tags: ['gland', 'endocrine'],
    details: {
      basic: 'Two small hats sitting on top of your kidneys that make hormones for stress and salt balance.',
      middle:
        'The outer part makes cortisol and aldosterone; the inner part makes adrenaline, which makes your heart race when you are scared.',
      high:
        'Cortex has three zones: glomerulosa (mineralocorticoids / aldosterone), fasciculata (glucocorticoids / cortisol) and reticularis (androgens). The medulla is a modified sympathetic ganglion secreting catecholamines.',
      undergrad:
        'The medulla is supplied by preganglionic sympathetic fibres (T10–L1) that synapse directly on chromaffin cells. Phaeochromocytoma causes episodic hypertension; Addison disease causes cortisol and aldosterone deficiency.',
      phd:
        'Research covers steroidogenic enzyme cascades and congenital adrenal hyperplasia, the HPA axis and circadian cortisol, chromaffin cell development from neural crest, and the role of adrenal-derived androgens in puberty (adrenarche).',
    },
  }),
];

export default URINARY_PARTS;
