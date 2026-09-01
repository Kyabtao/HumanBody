const P = (id, name, o) => ({ id, name, system: 'cardiovascular', minLevel: 2, ...o });

export const CARDIOVASCULAR_PARTS = [
  P('heart', 'Heart', {
    latin: 'Cor',
    tags: ['organ', 'muscle'],
    details: {
      basic:
        'Your heart is a pump about the size of your fist. It pushes blood all around your body, all day, every day.',
      middle:
        'It has four rooms: two atria on top and two ventricles below. It beats about 100,000 times a day.',
      high:
        'The right side pumps deoxygenated blood to the lungs (pulmonary circulation); the left side pumps oxygenated blood to the body (systemic circulation). Valves — tricuspid, pulmonary, mitral, aortic — keep blood flowing one way.',
      undergrad:
        'The cardiac cycle has systole and diastole; the conduction system is SA node → AV node → bundle of His → bundle branches → Purkinje fibres. Coronary arteries (right, left anterior descending, circumflex) supply the muscle; ischaemia causes angina and infarction.',
      phd:
        'Frontiers include cardiomyocyte turnover (~0.5–1%/year), cardiac regeneration via proliferation or reprogramming of fibroblasts, induced pluripotent stem-cell-derived cardiomyocytes for disease modelling, optogenetic and opto-electronic pacing, and mechano-electric feedback in arrhythmogenesis.',
    },
    facts: [
      'Your heart beats about 2.5 billion times in an average lifetime.',
      'It pumps roughly 5 litres of blood every minute at rest.',
    ],
  }),
  P('heart-chambers', 'Heart Chambers', {
    latin: 'Camerae cordis',
    minLevel: 3,
    tags: ['organ'],
    details: {
      basic: 'The heart’s four hollow rooms: right atrium, right ventricle, left atrium and left ventricle.',
      middle: 'Thin-walled atria receive blood; thick-walled ventricles push it out.',
      high:
        'The right atrium receives the superior and inferior vena cava and coronary sinus; the right ventricle pumps through the pulmonary trunk. The left atrium receives four pulmonary veins; the left ventricle, with a wall three times thicker, pumps into the aorta.',
      undergrad:
        'Fetal shunts: the foramen ovale (atrial) and ductus arteriosus (pulmonary trunk to aorta) close after birth. Septal defects are classified as ASD (ostium primum, secundum, sinus venosus) or VSD (membranous, muscular).',
      phd:
        'Research covers chamber-specific gene programmes (TBX5, NKX2-5, GATA4), trabeculation and compaction defects (non-compaction cardiomyopathy), single-cell atlases of the conduction system, and 4D flow MRI of intracavitary flow and thrombosis risk.',
    },
  }),
  P('heart-valves', 'Heart Valves', {
    latin: 'Valvae cordis',
    minLevel: 3,
    tags: ['organ'],
    details: {
      basic: 'Four doorways with flaps that snap shut so blood flows the right way and never backwards.',
      middle: 'The "lub-dub" sound of your heartbeat is the sound of these valves closing.',
      high:
        'The tricuspid and mitral valves are atrioventricular valves anchored by chordae tendineae to papillary muscles; the pulmonary and aortic valves are semilunar, with three cusps.',
      undergrad:
        'Auscultation areas: aortic (right 2nd intercostal space), pulmonary (left 2nd), tricuspid (left lower sternal border), mitral (apex, 5th space mid-clavicular line). Stenosis or regurgitation produce characteristic murmurs radiating in specific directions.',
      phd:
        'Research covers valve interstitial cell biology, endothelial-to-mesenchymal transition, calcific aortic stenosis as an active osteogenic process (Lp(a), NOTCH1, BMP), prosthetic valve thrombosis and the durability of bioprostheses.',
    },
  }),
  P('arteries', 'Arteries', {
    latin: 'Arteriae',
    tags: ['vessel'],
    details: {
      basic: 'Arteries carry bright red, oxygen-rich blood away from your heart to your body.',
      middle: 'They have thick, stretchy walls because the blood inside is under high pressure.',
      high:
        'Three layers: tunica intima (endothelium), media (smooth muscle and elastic tissue) and adventitia. Elastic arteries (aorta) damp the pulse; muscular arteries distribute; arterioles control resistance.',
      undergrad:
        'Pulse is palpable where an artery crosses bone (radial, carotid, femoral). Atherosclerosis affects medium and large arteries at branch points; vessels anastomose around joints, and "end arteries" (e.g. central retinal) lack that safety net.',
      phd:
        'Research covers endothelial mechanotransduction (Klf2, eNOS, shear stress), nitric oxide and endothelin biology, arterial stiffness as an independent risk marker (pulse wave velocity), and vascular smooth muscle phenotype switching in disease.',
    },
  }),
  P('veins', 'Veins', {
    latin: 'Venae',
    tags: ['vessel'],
    details: {
      basic: 'Veins carry darker, oxygen-poor blood back to your heart.',
      middle:
        'They have thin walls and one-way valves, and your muscles squeeze them to help blood climb back up your legs.',
      high:
        'Veins are capacitance vessels holding about 60–70% of blood volume. Superficial and deep systems are connected by perforators with valves that direct flow from superficial to deep.',
      undergrad:
        'Venous return depends on the muscle pump, respiratory pump and competent valves; failure causes varicose veins and venous insufficiency. Deep vein thrombosis risks pulmonary embolism.',
      phd:
        'Research covers venous thromboembolism pathophysiology (Virchow’s triad at molecular level), post-thrombotic syndrome and valve destruction, and the emerging understanding of valve development (Foxc2, Gata2) and lymphatic-like venous identity.',
    },
  }),
  P('aorta', 'Aorta', {
    latin: 'Aorta',
    tags: ['vessel', 'major'],
    details: {
      basic: 'The biggest blood vessel in your body. It carries blood from your heart to everywhere else.',
      middle:
        'It starts at the heart, arches over it like a rainbow, then runs down through your chest and belly.',
      high:
        'Parts: ascending aorta, arch (brachiocephalic trunk, left common carotid, left subclavian), descending thoracic aorta and abdominal aorta (coeliac trunk, superior and inferior mesenteric, renal, gonadal arteries) ending at the bifurcation into common iliacs.',
      undergrad:
        'The ligamentum arteriosum (remnant of the ductus arteriosus) tethers the arch and is where coarctation occurs; the recurrent laryngeal nerve hooks under it. Abdominal aortic aneurysms are usually infrarenal.',
      phd:
        'Research covers wall-stress and rupture-risk modelling beyond diameter criteria, the role of intramural thrombus and proteolysis, endovascular versus open repair trials, and the developmental origins of great-vessel anomalies from the pharyngeal arch arteries.',
    },
  }),
  P('vena-cava', 'Vena Cava', {
    latin: 'Vena cava superior et inferior',
    tags: ['vessel', 'major'],
    details: {
      basic: 'The two biggest veins. They bring used blood back to the heart.',
      middle: 'The superior vena cava brings blood from your head and arms; the inferior one from below your chest.',
      high:
        'The SVC is formed by the two brachiocephalic veins and drains into the right atrium; the IVC is formed by the common iliac veins, ascends through the diaphragm at T8 and also receives hepatic, renal and lumbar veins.',
      undergrad:
        'SVC obstruction causes facial and arm oedema with distended neck veins; IVC obstruction (or compression in pregnancy) causes leg oedema. Central venous catheters are positioned at the SVC–right atrial junction.',
      phd:
        'Research covers central venous pressure physiology and the Guytonian venous return curves, azygos collateralisation, May-Thurner syndrome (left iliac compression), and the use of intravascular ultrasound in venous stenting.',
    },
  }),
  P('coronary', 'Coronary Arteries', {
    latin: 'Arteriae coronariae',
    minLevel: 3,
    tags: ['vessel', 'heart'],
    details: {
      basic: 'These small arteries feed the heart muscle itself, so the heart has its own fuel supply.',
      middle: 'They branch off the aorta right where it leaves the heart and wrap around it like a crown.',
      high:
        'The left coronary artery divides into the anterior interventricular (LAD) and circumflex branches; the right coronary artery gives the posterior descending artery in right-dominant hearts (~85%) and supplies the SA and AV nodes in most people.',
      undergrad:
        'Atherosclerotic plaque rupture causes acute coronary syndromes: LAD occlusion = anterior STEMI, RCA = inferior STEMI. Right dominance determines which territory is at risk in inferior infarction.',
      phd:
        'Research covers plaque biology and the thin-cap fibroatheroma, intravascular imaging (OCT, IVUS) guided PCI, coronary physiology (FFR, iFR), collateral circulation, microvascular dysfunction and ischaemia with non-obstructive coronary arteries (INOCA).',
    },
  }),
  P('blood', 'Blood', {
    latin: 'Sanguis',
    tags: ['tissue', 'fluid'],
    details: {
      basic: 'Blood is the red liquid that travels in your vessels carrying oxygen and food to every cell.',
      middle:
        'It has red cells (oxygen carriers), white cells (germ fighters), platelets (clotters) and a yellow liquid called plasma.',
      high:
        'Blood is about 55% plasma and 45% cells. Haematocrit is the red cell fraction; haemoglobin (about 150 g/L) carries oxygen; the ABO and Rh systems govern transfusion compatibility.',
      undergrad:
        'Plasma proteins (albumin, globulins, fibrinogen) determine oncotic pressure, immunity and clotting. Haemostasis involves vasoconstriction, platelet plug formation and the coagulation cascade, ending in cross-linked fibrin.',
      phd:
        'Research covers haematopoietic stem-cell hierarchies, clonal haematopoiesis of indeterminate potential (CHIP) and cardiovascular risk, the glycome of the endothelial glycocalyx, oxygen sensing via HIF and EPO, and liquid-biopsy analysis of circulating tumour DNA.',
    },
  }),
  P('red-blood-cell', 'Red Blood Cells', {
    latin: 'Erythrocyta',
    minLevel: 3,
    tags: ['cell', 'blood'],
    details: {
      basic: 'Tiny red discs in your blood that carry oxygen from your lungs to the rest of you.',
      middle: 'They are shaped like squashed doughnuts so they can bend through the smallest vessels.',
      high:
        'Mature erythrocytes lack a nucleus and mitochondria, relying on glycolysis; they contain about 270 million haemoglobin molecules each and live about 120 days before removal by splenic and liver macrophages.',
      undergrad:
        'Erythropoiesis in red marrow is driven by erythropoietin from the kidney. Anaemia is classified by cell size (microcytic, normocytic, macrocytic) and reticulocyte response.',
      phd:
        'Research covers erythropoietic stress and ineffective erythropoiesis in thalassaemia, foetal-to-adult haemoglobin switching (BCL11A, HbF induction therapy), stored-blood lesions in transfusion, and red cells as nitric-oxide-carrying regulators of blood flow.',
    },
  }),
  P('white-blood-cell', 'White Blood Cells', {
    latin: 'Leucocyta',
    minLevel: 3,
    tags: ['cell', 'immune'],
    details: {
      basic: 'White cells are your body’s defenders. They find and destroy germs.',
      middle:
        'Types include neutrophils (first responders), lymphocytes (make antibodies and remember germs), monocytes and eosinophils.',
      high:
        'Granulocytes (neutrophils, eosinophils, basophils) and agranulocytes (lymphocytes, monocytes). A normal count is about 4–11 × 10⁹/L; neutrophils dominate in bacterial infection, lymphocytes in viral illness, eosinophils in allergy and parasites.',
      undergrad:
        'Leucocyte extravasation uses selectin rolling, integrin adhesion and transmigration. A left shift (bands) indicates bacterial infection; leukaemia is malignant proliferation of precursors.',
      phd:
        'Research covers neutrophil extracellular traps (NETs) in thrombosis and autoimmunity, trained immunity and epigenetic reprogramming of monocytes, single-cell immune atlases, and CAR-T cell engineering.',
    },
  }),
  P('platelets', 'Platelets', {
    latin: 'Thrombocyta',
    minLevel: 3,
    tags: ['cell', 'clotting'],
    details: {
      basic: 'Platelets are tiny cell fragments that stick together to stop bleeding when you cut yourself.',
      middle: 'They plug the hole and help make a scab.',
      high:
        'Platelets are anucleate fragments of megakaryocytes, about 2–3 µm across, with granules (alpha and dense) and a lifespan of 7–10 days. They adhere via GpIb–vWF and aggregate via GpIIb/IIIa–fibrinogen.',
      undergrad:
        'Antiplatelet drugs target these pathways: aspirin blocks COX-1/TXA2, clopidogrel blocks P2Y12, and GpIIb/IIIa inhibitors block final aggregation. Thrombocytopenia causes petechiae and purpura.',
      phd:
        'Research covers platelet transcriptomics, thrombo-inflammation (platelet–leukocyte aggregates), immunothrombosis in sepsis, and the role of the liver and lung in thrombopoiesis revealed by intravital imaging.',
    },
  }),
  P('capillaries', 'Capillaries', {
    latin: 'Vasa capillaria',
    minLevel: 3,
    tags: ['vessel', 'micro'],
    details: {
      basic: 'Capillaries are the tiniest blood vessels, thinner than a hair, where blood and cells swap materials.',
      middle: 'There are billions of them; nearly every cell in your body is close to one.',
      high:
        'Three types: continuous (muscle, lung, brain), fenestrated (kidney, intestine, endocrine) and sinusoidal (liver, spleen, marrow). Exchange occurs by diffusion, filtration, transcytosis and bulk flow (Starling forces).',
      undergrad:
        'Starling’s equation balances capillary hydrostatic pressure against plasma oncotic pressure; the revised model emphasises the endothelial glycocalyx. Capillary beds are regulated by precapillary sphincters and metarterioles.',
      phd:
        'Research covers pericyte–endothelial cross-talk, the blood–brain barrier and efflux transporters, capillary recruitment and functional shunting in sepsis, and angiodiversity revealed by single-cell endothelial mapping.',
    },
  }),
  P('spleen-vascular', 'Circulation Circuits', {
    latin: 'Circuitus sanguinis',
    minLevel: 3,
    tags: ['function', 'vessel'],
    details: {
      basic: 'Blood travels in two big loops: one to the lungs to pick up oxygen, one around the body to deliver it.',
      middle:
        'The pulmonary loop goes heart → lungs → heart. The systemic loop goes heart → body → heart.',
      high:
        'Pulmonary circulation is low-pressure, low-resistance; systemic is high-pressure. Portal systems (hepatic portal vein, hypothalamo-hypophyseal portal) carry blood through two capillary beds before returning to the heart.',
      undergrad:
        'Cardiac output = heart rate × stroke volume (~5 L/min); blood pressure = cardiac output × systemic vascular resistance. Mean arterial pressure is roughly diastolic + 1/3 pulse pressure.',
      phd:
        'Research covers ventricular–arterial coupling, microcirculatory heterogeneity in shock, pulmonary vascular recruitment and hypoxic vasoconstriction, and the haemodynamic coherence between macro- and microcirculation in critical care.',
    },
  }),
];

export default CARDIOVASCULAR_PARTS;
