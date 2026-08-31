const P = (id, name, o) => ({ id, name, system: 'muscular', minLevel: 2, ...o });

export const MUSCULAR_PARTS = [
  P('muscle-overview', 'Muscle Tissue', {
    latin: 'Textus muscularis',
    tags: ['tissue'],
    details: {
      basic: 'Muscles are the parts of you that pull. When they get shorter, you move.',
      middle:
        'There are three kinds: skeletal muscles you control, smooth muscle in your organs, and cardiac muscle in your heart, which never rests.',
      high:
        'Skeletal muscle is striated, multinucleated and voluntary; cardiac muscle is striated, branched, involuntary and joined by intercalated discs; smooth muscle is spindle-shaped, non-striated and involuntary.',
      undergrad:
        'Contraction follows the sliding-filament model: calcium binds troponin C, tropomyosin shifts, myosin heads cycle on actin. Motor units recruit from small (slow, oxidative) to large (fast, glycolytic).',
      phd:
        'Research spans excitation–contraction coupling (DHPR–RyR1), titin-based passive stiffness, myosin super-relaxed state, satellite-cell niches and myokines (irisin, myostatin). Single-nucleus RNA sequencing is redefining fibre-type heterogeneity.',
    },
  }),
  P('pectoralis', 'Chest Muscle (Pectoralis Major)', {
    latin: 'Musculus pectoralis major',
    tags: ['muscle', 'trunk'],
    details: {
      basic: 'The big muscle on your chest that pulls your arm across your body.',
      middle: 'It helps you push, throw and hug, and it lifts your arm forwards.',
      high:
        'Origin: medial half of clavicle, sternum and upper costal cartilages. Insertion: lateral lip of the intertubercular groove of the humerus. Action: adduction, medial rotation and flexion of the arm.',
      undergrad:
        'Supplied by the lateral and medial pectoral nerves (C5–T1). It forms the anterior wall of the axilla and the anterior axillary fold; a pectoralis major rupture is a "weightlifter’s tear".',
      phd:
        'The muscle is used as a flap in breast and head/neck reconstruction; tendon repair timing, and muscle–tendon junction mechanics, are active research areas in sports medicine.',
    },
  }),
  P('deltoid', 'Shoulder Muscle (Deltoid)', {
    latin: 'Musculus deltoideus',
    tags: ['muscle', 'limb'],
    details: {
      basic: 'The rounded muscle on top of your shoulder that lifts your arm out to the side.',
      middle: 'It has three parts — front, middle and back — that lift your arm forward, sideways and backward.',
      high:
        'Origin: lateral third of clavicle, acromion and spine of scapula; insertion: deltoid tuberosity of humerus. The middle fibres are the main abductor after the first 15° initiated by supraspinatus.',
      undergrad:
        'Supplied by the axillary nerve (C5–C6); the needle for intramuscular injection goes into the middle of the deltoid to avoid the axillary nerve and radial nerve. Muscle wasting is seen in axillary nerve injury.',
      phd:
        'Deltoid moment arms are measured with 3D imaging to plan reverse shoulder arthroplasty; research also covers deltoid compensation after rotator-cuff tears and muscle fat fraction as an outcome marker.',
    },
  }),
  P('biceps', 'Biceps Brachii', {
    latin: 'Musculus biceps brachii',
    tags: ['muscle', 'limb'],
    details: {
      basic: 'The muscle at the front of your upper arm. Bend your elbow and feel it get hard.',
      middle: 'It bends the elbow and turns your palm upward — that is how you screw in a light bulb.',
      high:
        'Two heads arise from the scapula (supraglenoid tubercle and coracoid process) and insert on the radial tuberosity and the bicipital aponeurosis. Nerve: musculocutaneous (C5–C6).',
      undergrad:
        'It is a strong supinator and a weaker flexor; the biceps reflex tests C5–C6. Rupture of the long head produces the Popeye deformity and is common in middle-aged men.',
      phd:
        'Biceps tenodesis versus tenotomy trials, and the role of the long head in glenohumeral stability (extra-articular versus intra-articular path), are active research areas. Tendon mechanics are studied with shear-wave elastography.',
    },
  }),
  P('triceps', 'Triceps Brachii', {
    latin: 'Musculus triceps brachii',
    tags: ['muscle', 'limb'],
    details: {
      basic: 'The muscle at the back of your upper arm that straightens your elbow.',
      middle: 'When you push up from a chair or do a press-up, your triceps does the work.',
      high:
        'Three heads (long, lateral, medial) arise from the scapula and humerus and insert on the olecranon of the ulna. Nerve: radial (C6–C8).',
      undergrad:
        'The triceps reflex tests C7 (mainly). The radial nerve runs between the lateral and medial heads in the spiral groove; fracture of the mid-shaft risks nerve injury.',
      phd:
        'Research covers the medial head as the workhorse in extension, triceps tendon repair, and the muscle’s use as a flap and as a nerve-transfer donor for elbow flexion restoration.',
    },
  }),
  P('forearm-muscles', 'Forearm Muscles', {
    latin: 'Musculi antebrachii',
    tags: ['muscle', 'limb'],
    details: {
      basic: 'Muscles in your forearm that move your wrist, hand and fingers.',
      middle:
        'The muscles at the front bend your wrist and fingers; those at the back straighten them.',
      high:
        'Anterior compartment has superficial (pronator teres, flexor carpi radialis/ulnaris, palmaris longus, flexor digitorum superficialis) and deep layers (flexor digitorum profundus, flexor pollicis longus, pronator quadratus); posterior has superficial and deep extensors including the anatomical snuffbox tendons.',
      undergrad:
        'Nerves: mostly median (anterior) and radial/posterior interosseous (posterior), with the ulnar nerve supplying flexor carpi ulnaris and the medial half of FDP. Common sites of overuse: lateral and medial epicondylitis.',
      phd:
        'Tendinopathy research has shifted from "inflammation" to failed healing and neurovascular ingrowth; enthesis biology, mechanotherapy dosing and eccentric loading protocols are studied with imaging and biomarker endpoints.',
    },
  }),
  P('abdominal-muscles', 'Abdominal Muscles', {
    latin: 'Musculi abdominis',
    tags: ['muscle', 'trunk'],
    details: {
      basic: 'The muscles over your belly that hold your organs in and help you bend forwards.',
      middle:
        'Four layers: rectus abdominis in front (the "six pack"), and obliques and transversus at the sides.',
      high:
        'External oblique, internal oblique and transversus abdominis form flat muscles whose aponeuroses create the rectus sheath around rectus abdominis and the linea alba in the midline.',
      undergrad:
        'They raise intra-abdominal pressure for coughing, lifting and defecation, and are supplied by the lower intercostal, iliohypogastric and ilio-inguinal nerves (T7–L1). Weakness contributes to inguinal and ventral hernias.',
      phd:
        'Research includes the transversus abdominis plane (TAP) block, core-stability training effects on lumbopelvic control, and the biomechanics of abdominal wall reconstruction meshes.',
    },
  }),
  P('diaphragm', 'Diaphragm', {
    latin: 'Diaphragma',
    tags: ['muscle', 'respiration'],
    details: {
      basic: 'A big, dome-shaped muscle under your lungs. It is the muscle that makes you breathe.',
      middle:
        'When it flattens downwards, your chest gets bigger and air is sucked in. When it relaxes, air goes out.',
      high:
        'The diaphragm has a central tendon and peripheral muscular parts (sternal, costal, lumbar). Openings: T8 caval (IVC and right phrenic branches), T10 oesophageal (oesophagus and vagal trunks), T12 aortic (aorta, thoracic duct, azygos).',
      undergrad:
        'Supplied by the phrenic nerve (C3, C4, C5 — "C3, 4, 5 keep the diaphragm alive"). Irritation of the diaphragmatic pleura or peritoneum refers pain to the shoulder tip.',
      phd:
        'Diaphragm research covers diaphragm-protective ventilation, weaning failure and diaphragm atrophy in critical illness, ultrasound assessment of excursion and thickening fraction, and diaphragm pacing in spinal cord injury.',
    },
  }),
  P('trapezius', 'Trapezius', {
    latin: 'Musculus trapezius',
    tags: ['muscle', 'back'],
    details: {
      basic: 'The large, flat, triangular muscle at the back of your neck and upper back.',
      middle: 'It lifts your shoulders, pulls your shoulder blades together and helps you tilt your head back.',
      high:
        'Origin: external occipital protuberance, nuchal ligament and spines of C7–T12. Insertion: lateral third of clavicle, acromion and scapular spine. Nerve: accessory nerve (CN XI) with C3–C4 proprioceptive fibres.',
      undergrad:
        'The accessory nerve is at risk during posterior triangle neck surgery and lymph node biopsy; injury causes shoulder droop and difficulty raising the arm above the horizontal.',
      phd:
        'Research covers nerve transfer (e.g. to suprascapular nerve) for shoulder reanimation, scapular kinematics in neck pain, and myofascial trigger-point physiology.',
    },
  }),
  P('latissimus-dorsi', 'Latissimus Dorsi', {
    latin: 'Musculus latissimus dorsi',
    tags: ['muscle', 'back'],
    details: {
      basic: 'The wide, flat muscle of your back that pulls your arm down and backwards.',
      middle: 'It is the muscle you use when you climb, swim or pull something towards you.',
      high:
        'Origin: spines of T7–L5, thoracolumbar fascia, iliac crest and lower ribs; it twists to insert into the intertubercular groove. Action: extension, adduction and medial rotation of the humerus.',
      undergrad:
        'Nerve: thoracodorsal (C6–C8). It forms the posterior axillary fold and the posterior wall of the axilla; the thoracodorsal vessels supply it, which is why it is a popular free flap.',
      phd:
        'The latissimus dorsi flap and "latissimus cardiomyoplasty" (historically) reflect research into muscle plasticity: chronic electrical stimulation can convert fast to slow fibre types.',
    },
  }),
  P('gluteal-muscles', 'Gluteal Muscles', {
    latin: 'Musculi glutei',
    tags: ['muscle', 'limb'],
    details: {
      basic: 'The muscles of your bottom. They keep you upright when you stand on one leg.',
      middle: 'Gluteus maximus is the biggest and straightens your hip when you climb stairs or stand up.',
      high:
        'Gluteus maximus (inferior gluteal nerve) extends and laterally rotates the hip; gluteus medius and minimus (superior gluteal nerve) abduct and medially rotate, stabilising the pelvis in single-leg stance.',
      undergrad:
        'A positive Trendelenburg test (pelvis drops on the unsupported side) means weak hip abductors or superior gluteal nerve palsy. Intramuscular injections are given into the upper outer quadrant to avoid the sciatic nerve.',
      phd:
        'Research covers gluteal tendinopathy, greater trochanteric pain syndrome, hip abductor strength and running injury risk, and gluteal fat infiltration after total hip arthroplasty.',
    },
  }),
  P('quadriceps', 'Quadriceps Femoris', {
    latin: 'Musculus quadriceps femoris',
    tags: ['muscle', 'limb'],
    details: {
      basic: 'The big muscle group at the front of your thigh that straightens your knee.',
      middle: 'Four muscles work together through the knee cap so you can stand, walk and kick.',
      high:
        'Rectus femoris (which also flexes the hip) plus vastus lateralis, medialis and intermedius. They unite into the quadriceps tendon, continue as the patellar ligament and insert on the tibial tuberosity.',
      undergrad:
        'Nerve: femoral (L2–L4). The knee jerk tests L3–L4. Vastus medialis obliquus is the dynamic medial stabiliser of the patella; wasting after knee injury is rapid.',
      phd:
        'Research includes quadriceps activation failure after ACL injury, eccentric training and hypertrophy mechanisms, and the crucial role of quadriceps strength in knee osteoarthritis and post-arthroplasty outcomes.',
    },
  }),
  P('hamstrings', 'Hamstrings', {
    latin: 'Musculi ischiocrurales',
    tags: ['muscle', 'limb'],
    details: {
      basic: 'The muscles at the back of your thigh that bend your knee.',
      middle: 'Three muscles: biceps femoris, semitendinosus and semimembranosus. They help you run and jump.',
      high:
        'They arise from the ischial tuberosity (short head of biceps from the femur) and cross both hip and knee, so they extend the hip and flex the knee.',
      undergrad:
        'Nerve: sciatic (tibial division; short head of biceps by common fibular), L5–S2. Hamstring strains occur in the late swing phase of sprinting, usually in the biceps femoris long head.',
      phd:
        'Research covers eccentric strength (Nordic hamstring) programmes for injury prevention, intramuscular tendon involvement and reinjury risk, and the muscle’s use as an ACL graft (hamstring autograft) with consequences for knee flexor torque.',
    },
  }),
  P('calf-muscles', 'Calf Muscles', {
    latin: 'Musculi surae',
    tags: ['muscle', 'limb'],
    details: {
      basic: 'The muscles at the back of your lower leg that let you stand on tiptoe.',
      middle: 'Gastrocnemius and soleus join into the Achilles tendon, the strongest tendon in your body.',
      high:
        'Gastrocnemius arises from the femoral condyles (acts across knee and ankle); soleus from the tibia and fibula (pure plantarflexor, postural). Together via the calcaneal tendon they plantarflex the foot (S1–S2).',
      undergrad:
        'The tendon reflex tests S1–S2. The sural nerve lies near the tendon; the venae comitantes of the calf muscles form the "calf muscle pump" that returns venous blood against gravity.',
      phd:
        'Research covers Achilles tendinopathy and rupture management, plantarflexor power in ageing and sprinting, and the gastrocnemius "muscle–tendon spring" that stores and returns elastic energy during running.',
    },
  }),
  P('tendon', 'Tendons', {
    latin: 'Tendo',
    tags: ['tissue', 'connective'],
    details: {
      basic: 'Tendons are strong cords that join muscle to bone, so the pull reaches the bone.',
      middle: 'You can feel the big one at the back of your heel: the Achilles tendon.',
      high:
        'Tendons are dense regular connective tissue with parallel type I collagen bundles, tenocytes in rows, and a sheath or paratenon. They transmit force and store elastic energy.',
      undergrad:
        'The myotendinous junction is the weakest point in a stretched muscle. Tendons have poor blood supply in "watershed" zones (e.g. mid-portion Achilles), explaining degenerative rupture.',
      phd:
        'Frontiers include enthesis (fibrocartilaginous and fibrous) development, BMP/Scleraxis-expressing progenitors, mechanotransduction via integrins and Piezo1, and the failure of scar-mediated healing to restore tendon stiffness.',
    },
  }),
  P('smooth-muscle', 'Smooth Muscle', {
    latin: 'Textus muscularis levis',
    tags: ['tissue', 'organ'],
    details: {
      basic: 'Smooth muscle works inside you without you thinking about it, moving food along and squeezing blood vessels.',
      middle: 'It is found in the walls of your stomach, intestines, bladder and blood vessels.',
      high:
        'Spindle-shaped, single central nucleus, no sarcomeres but dense bodies; contraction uses calmodulin–myosin light-chain kinase rather than troponin. It shows slow waves, tone and plasticity.',
      undergrad:
        'Autonomic (sympathetic and parasympathetic), hormonal and local factors (stretch, pH, NO) regulate it. Gap junctions allow single-unit (visceral) smooth muscle to contract as a syncytium.',
      phd:
        'Research covers calcium sensitisation via RhoA/ROCK, latch state, phenotype switching in vascular disease, and the enteric nervous system’s control of peristalsis with interstitial cells of Cajal as pacemakers.',
    },
  }),
];

export default MUSCULAR_PARTS;
