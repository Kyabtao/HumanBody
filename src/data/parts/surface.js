/**
 * Body surface & regions — the entry point for the youngest learners.
 * Each part carries five depth tiers (basic → PhD).
 */
const P = (id, name, o) => ({ id, name, system: 'surface', minLevel: 1, ...o });

export const SURFACE_PARTS = [
  P('head', 'Head', {
    latin: 'Caput',
    tags: ['region', 'external'],
    details: {
      basic:
        'Your head sits on top of your neck and holds your brain, eyes, ears, nose and mouth. The hard skull inside protects the brain like a helmet.',
      middle:
        'The head contains the brain inside the skull, plus the sensory organs for sight, hearing, smell and taste, and the opening of the digestive and respiratory tracts. It is supplied mainly by the carotid and vertebral arteries.',
      high:
        'The head is divided into the cranium (braincase: frontal, parietal, temporal, occipital, sphenoid, ethmoid bones) and the face (viscerocranium, 14 bones). The scalp has five layers: skin, connective tissue, aponeurosis (galea), loose areolar tissue and pericranium — remembered as SCALP.',
      undergrad:
        'Clinically the head is assessed by cranial nerve examination (I–XII), skull radiography/CT for fractures, and landmarks such as the nasion, bregma, lambda and external occipital protuberance. The blood–brain barrier and the dural venous sinuses make intracranial infection and bleeding especially dangerous.',
      phd:
        'Craniofacial development depends on neural-crest-derived mesenchyme, and the cranial sutures remain patent until synostosis signals bone maturity — premature fusion (craniosynostosis) is a model for studying suture stem cells and FGFR signalling. Research frontiers include glymphatic CSF clearance, skull marrow immunity and non-invasive ultrasound neuromodulation through the temporal window.',
    },
    facts: [
      'The adult skull is made of 22 bones, 8 in the cranium and 14 in the face.',
      'Your head is about one-eighth of your total body height.',
    ],
  }),
  P('face', 'Face', {
    latin: 'Facies',
    tags: ['region', 'external'],
    details: {
      basic:
        'Your face is the front of your head. It holds your eyes, nose, mouth, cheeks and chin, and it shows how you feel — happy, surprised or sleepy.',
      middle:
        'The face contains the openings of the digestive and respiratory systems and all the muscles of facial expression. These muscles are unusual: they are attached to skin, not to bone, which is why you can make so many expressions.',
      high:
        'Facial expression muscles are all supplied by the facial nerve (CN VII); the muscles of chewing are supplied by the trigeminal nerve (CN V3). The sensory supply of the face is trigeminal, via the ophthalmic, maxillary and mandibular divisions.',
      undergrad:
        'The face has a rich blood supply from the facial and maxillary arteries with abundant anastomoses, so facial wounds bleed heavily but heal fast. The "danger triangle" of the mid-face drains partly to the cavernous sinus, making infections there potentially intracranial.',
      phd:
        'Facial morphogenesis integrates neural-crest migration, SHH/FGF/BMP gradients and mechanical forces; modern 3D morphometrics and GWAS link facial shape to hundreds of loci. Frontiers include face transplantation immunology (vascularised composite allografts) and facial nerve regeneration using conduits and growth-factor gradients.',
    },
  }),
  P('neck', 'Neck', {
    latin: 'Cervix / Collum',
    tags: ['region', 'external'],
    details: {
      basic:
        'Your neck holds your head up and lets you turn to look around. Food, air and blood all travel through it.',
      middle:
        'The neck carries the windpipe (trachea) and food pipe (oesophagus) in front, the spine behind, and large blood vessels and nerves on the sides. Seven neck bones (cervical vertebrae) support the head.',
      high:
        'The neck is organised into triangles by the sternocleidomastoid muscle: anterior and posterior triangles. It contains the thyroid and parathyroid glands, the larynx and trachea, the carotid sheath (common carotid artery, internal jugular vein, vagus nerve) and the cervical plexus.',
      undergrad:
        'Cervical fascia layers (investing, pretracheal, prevertebral, carotid sheath) determine how neck infections spread — retropharyngeal and "danger space" infections can track into the mediastinum. Cervical lymph node levels I–VI are the standard map for cancer staging.',
      phd:
        'Neck research spans carotid body chemoreception (and its role in hypertension and sleep apnoea), ultrasound and AI-based thyroid nodule risk stratification, and selective neck dissection that preserves lymphatic function. The neck is also the access route for lymphovenous anastomosis in lymphoedema surgery.',
    },
  }),
  P('shoulder', 'Shoulder', {
    latin: 'Cingulum pectorale',
    tags: ['region', 'joint'],
    details: {
      basic:
        'Your shoulder is where your arm joins your body. It is a ball-and-socket joint, so your arm can swing in big circles.',
      middle:
        'The shoulder girdle is made of the clavicle (collarbone) and scapula (shoulder blade). The ball of the humerus sits in the shallow socket of the scapula, giving huge freedom of movement.',
      high:
        'The glenohumeral joint is stabilised by the rotator cuff (supraspinatus, infraspinatus, teres minor, subscapularis — SITS) and by the glenoid labrum. Because the socket is shallow, the shoulder is the most commonly dislocated large joint.',
      undergrad:
        'Shoulder motion combines glenohumeral, scapulothoracic, acromioclavicular and sternoclavicular movement in roughly a 2:1 ratio after the first 30° of abduction. The axillary nerve and circumflex humeral artery wind around the surgical neck of the humerus and are at risk in dislocation and fracture.',
      phd:
        'Rotator-cuff tendon disease is now modelled as failed mechano-biological healing with fatty infiltration and altered extracellular-matrix turnover; research covers scaffold augmentation, biologics (PRP, MSC), and kinematic modelling of scapular dyskinesis. Comparative anatomy shows the trade-off between mobility and stability across primates.',
    },
  }),
  P('arm', 'Upper Arm', {
    latin: 'Brachium',
    tags: ['region', 'limb'],
    details: {
      basic:
        'Your upper arm runs from the shoulder to the elbow. The big muscle at the front is the biceps; the one at the back is the triceps.',
      middle:
        'One bone, the humerus, runs through the upper arm. The biceps bends the elbow and the triceps straightens it. The main artery is the brachial artery — the one a nurse puts a blood-pressure cuff around.',
      high:
        'The arm is divided into anterior (flexor) and posterior (extensor) compartments by the medial and lateral intermuscular septa. The brachial artery, median, ulnar and radial nerves and the basilic vein travel through it; the radial nerve spirals in the humeral groove.',
      undergrad:
        'Blood pressure is measured over the brachial artery at heart level. Mid-shaft humeral fractures can injure the radial nerve causing wrist drop; supracondylar fractures in children threaten the brachial artery and can produce Volkmann ischaemic contracture.',
      phd:
        'Compartment syndrome is a pressure–perfusion problem modelled by the relationship between compartment pressure, mean arterial pressure and microvascular flow (ΔP theory), and remains a diagnostic research target with near-infrared spectroscopy. Limb regeneration models (axolotl) are contrasted with scar-based mammalian repair.',
    },
  }),
  P('elbow', 'Elbow', {
    latin: 'Cubitus',
    tags: ['region', 'joint'],
    details: {
      basic:
        'Your elbow is the hinge in the middle of your arm. It lets you bend your arm to bring food to your mouth.',
      middle:
        'Three bones meet at the elbow: the humerus above, and the radius and ulna below. It works as a hinge for bending, and the radius rotates to turn your palm up and down.',
      high:
        'The elbow is a synovial hinge joint between the humerus, ulna and radius, with a thin capsule and strong collateral ligaments. The funny bone tingling is the ulnar nerve passing behind the medial epicondyle.',
      undergrad:
        'Carrying angle is about 5–15° in men and 10–15° in women. The anterior cubital fossa contains, from lateral to medial, the biceps tendon, brachial artery and median nerve — the classic site for venepuncture using the median cubital vein.',
      phd:
        'Elbow biomechanics research uses inverse dynamics and instrumented implants to measure joint reaction forces, informing total elbow arthroplasty design. Ulnar nerve subluxation and cubital tunnel syndrome are studied with high-resolution nerve ultrasound and diffusion MRI.',
    },
  }),
  P('forearm', 'Forearm', {
    latin: 'Antebrachium',
    tags: ['region', 'limb'],
    details: {
      basic:
        'Your forearm is between your elbow and your wrist. It has two bones side by side so you can twist your hand.',
      middle:
        'The radius and ulna are the two forearm bones. Muscles in the forearm move your wrist and fingers; many of their tendons run under straps called retinacula at the wrist.',
      high:
        'The forearm has an anterior flexor compartment (mostly median nerve, except flexor carpi ulnaris and the medial half of flexor digitorum profundus, supplied by the ulnar nerve) and a posterior extensor compartment (radial nerve / posterior interosseous branch). The interosseous membrane binds radius to ulna and transmits load.',
      undergrad:
        'Pronation and supination occur at the superior and inferior radioulnar joints with the radius rotating around the ulna. A Colles fracture is a dorsally displaced distal radius fracture; a Monteggia fracture is ulnar shaft fracture with radial head dislocation.',
      phd:
        'Forearm fracture research covers locked plating versus intramedullary devices, distal radioulnar joint instability and the forearm as a load-sharing two-bone structure analysed with finite-element models. Tendon transfer surgery (e.g. pronator teres rerouting) is refined with cadaveric moment-arm measurements.',
    },
  }),
  P('hand', 'Hand', {
    latin: 'Manus',
    tags: ['region', 'limb'],
    details: {
      basic:
        'Your hand has 27 small bones and an opposable thumb, so you can hold a pencil, catch a ball and feel how things feel.',
      middle:
        'Each hand has 8 wrist bones (carpals), 5 palm bones (metacarpals) and 14 finger bones (phalanges). The thumb can touch every fingertip — that is what makes human hands so clever with tools.',
      high:
        'The hand has thenar and hypothenar muscles, lumbricals and interossei, supplied mainly by the median and ulnar nerves, with extensors from the radial nerve. The palmar aponeurosis and flexor tendon sheaths keep the grip efficient.',
      undergrad:
        'Carpal tunnel syndrome is compression of the median nerve under the flexor retinaculum. The anatomical snuffbox is bounded by the extensor pollicis longus and brevis tendons; tenderness there suggests a scaphoid fracture, which risks avascular necrosis of the proximal pole.',
      phd:
        'Hand research spans cortical homunculus mapping and neuroplasticity after stroke, tendon healing biology (adhesion versus intrinsic healing), and bionic hand interfaces using targeted muscle reinnervation and intraneural electrodes. Dexterity is quantified with kinematic gloving and grasp taxonomies.',
    },
  }),
  P('chest', 'Chest', {
    latin: 'Thorax',
    tags: ['region', 'trunk'],
    details: {
      basic:
        'Your chest is the upper part of your trunk. Inside the rib cage are your heart and lungs.',
      middle:
        'The chest is protected by 12 pairs of ribs, the sternum in front and the spine behind. The diaphragm muscle below helps you breathe.',
      high:
        'The thoracic cavity contains the heart in the middle mediastinum and the lungs in the pleural cavities. The intercostal muscles and diaphragm drive ventilation, changing thoracic volume and therefore intrathoracic pressure.',
      undergrad:
        'Chest landmarks: the sternal angle (T4/T5) marks the second costal cartilage and the tracheal bifurcation; the nipple line is roughly the 4th intercostal space. Chest drains are inserted in the "triangle of safety" bounded by pectoralis major, latissimus dorsi and the 5th intercostal space.',
      phd:
        'Thoracic research includes chest-wall mechanics modelled by the Campbell diagram, rib-fracture fixation outcomes, and lung-protective ventilation strategies derived from pressure–volume curves. The thoracic duct and the pleural lymphatics are being re-mapped with modern imaging.',
    },
  }),
  P('abdomen', 'Abdomen', {
    latin: 'Abdomen',
    tags: ['region', 'trunk'],
    details: {
      basic:
        'Your belly (abdomen) is between your chest and your hips. It holds your stomach, liver, intestines, kidneys and more.',
      middle:
        'The abdomen has no bones protecting the front, only layers of muscle. It is divided into nine regions by doctors to describe where organs are and where pain comes from.',
      high:
        'The abdominal cavity is lined by peritoneum; the organs are either intraperitoneal (stomach, liver, spleen, jejunum, ileum, transverse colon) or retroperitoneal (kidneys, ureters, pancreas, duodenum, aorta, IVC).',
      undergrad:
        'The nine-region scheme uses two vertical mid-clavicular lines and the subcostal and intertubercular planes; the four-quadrant scheme is used for acute pain. Referred pain follows dermatomes: diaphragmatic irritation refers to the shoulder (C3–C5, phrenic nerve).',
      phd:
        'Abdominal research covers the gut–brain axis and enteric nervous system, microbiome signalling, peritoneal metastasis biology and HIPEC, and abdominal compartment syndrome with pressure thresholds around 12–20 mmHg. Surgical navigation now uses augmented-reality overlays of CT-derived models.',
    },
  }),
  P('back', 'Back', {
    latin: 'Dorsum',
    tags: ['region', 'trunk'],
    details: {
      basic:
        'Your back is the rear of your trunk. Strong muscles there help you stand up straight and lift things.',
      middle:
        'The spine, or backbone, runs down the middle of your back. It has 33 bones called vertebrae, and it protects the spinal cord.',
      high:
        'The back has superficial muscles connecting the upper limb to the trunk (trapezius, latissimus dorsi, rhomboids), intermediate respiratory muscles (serratus posterior) and deep intrinsic muscles (erector spinae, transversospinalis) that move and stabilise the vertebral column.',
      undergrad:
        'Curvatures: cervical and lumbar lordosis, thoracic and sacral kyphosis. A lumbar puncture is performed in the L3/L4 or L4/L5 interspace, below the conus medullaris. The "safe triangle" for chest drain and the renal angle for kidney tenderness are posterior landmarks.',
      phd:
        'Back pain research has shifted from a purely biomechanical model to a biopsychosocial one, with MRI showing that disc degeneration is common in asymptomatic people. Frontiers include disc regeneration, nucleus pulposus cell therapy, and sensorimotor retraining for chronic low back pain.',
    },
  }),
  P('hip', 'Hip', {
    latin: 'Coxa',
    tags: ['region', 'joint'],
    details: {
      basic:
        'Your hip is where your leg joins your body. It is a strong ball-and-socket joint that carries your weight.',
      middle:
        'The thigh bone (femur) has a round head that fits into a deep socket in the pelvis. Strong ligaments and big muscles keep it steady while you walk and run.',
      high:
        'The hip joint is formed by the acetabulum of the pelvis and the head of the femur, deepened by the acetabular labrum. The femur has an angle of inclination (~125°) and torsion, which are important in deformity and fracture.',
      undergrad:
        'Hip fractures are classified as intracapsular (risk of avascular necrosis from damage to the retinacular vessels) or extracapsular. The Trendelenburg sign indicates gluteus medius or superior gluteal nerve weakness.',
      phd:
        'Femoroacetabular impingement and developmental dysplasia are studied with 3D CT and gait analysis; arthroplasty research compares bearing surfaces, corrosion at the head–neck junction and periprosthetic osteolysis driven by wear-particle macrophage activation.',
    },
  }),
  P('thigh', 'Thigh', {
    latin: 'Femur regio',
    tags: ['region', 'limb'],
    details: {
      basic:
        'Your thigh is between your hip and your knee. It has the longest, strongest bone in your body, the femur.',
      middle:
        'The big muscles at the front (quadriceps) straighten the knee; the muscles at the back (hamstrings) bend it. The femoral artery brings blood down the leg.',
      high:
        'The thigh has anterior (femoral nerve), medial (obturator nerve) and posterior (sciatic nerve) compartments. The femoral triangle contains the femoral nerve, artery, vein and lymphatics (NAVEL) and is the access route for cardiac catheterisation.',
      undergrad:
        'The adductor canal transmits the femoral vessels to the popliteal fossa. Quadriceps atrophy appears rapidly after knee injury; the knee-jerk reflex tests the femoral nerve (L3–L4).',
      phd:
        'Research topics include sarcopenia and muscle fat infiltration quantified by MRI, hamstring injury mechanisms during high-speed running (lengthening during late swing), and the myokine signalling by which contracting muscle communicates with other organs.',
    },
  }),
  P('knee', 'Knee', {
    latin: 'Genu',
    tags: ['region', 'joint'],
    details: {
      basic:
        'Your knee is the hinge between thigh and shin. It lets you bend your leg and straighten it to stand.',
      middle:
        'The knee cap (patella) sits in front of the joint. Cushions of cartilage called menisci act as shock absorbers between the femur and the tibia.',
      high:
        'The knee is a modified hinge with the femorotibial and patellofemoral joints, protected by the anterior and posterior cruciate ligaments (ACL, PCL), the medial and lateral collateral ligaments and the menisci.',
      undergrad:
        'The "unhappy triad" after a valgus twist tears the ACL, MCL and medial meniscus. Knee effusion is drained laterally; the joint is entered with the leg extended. Patellar reflex tests L3–L4.',
      phd:
        'ACL reconstruction research compares graft choice, tunnel placement and remnant preservation; the posterolateral corner and anterolateral ligament have been rediscovered and re-defined. Osteoarthritis is now treated as a whole-joint, inflammatory, mechanically driven disease studied with compositional MRI (T2 mapping).',
    },
  }),
  P('leg', 'Lower Leg', {
    latin: 'Crus',
    tags: ['region', 'limb'],
    details: {
      basic:
        'Your lower leg runs from knee to ankle. It has two bones: the big shin bone (tibia) and the thin fibula on the outside.',
      middle:
        'The calf muscle at the back (gastrocnemius) pushes you up on your toes when you walk, run and jump.',
      high:
        'The leg has anterior (tibial nerve? no — deep fibular nerve), lateral (superficial fibular) and posterior (tibial nerve) compartments. The anterior compartment is the classic site of compartment syndrome.',
      undergrad:
        'The tibia is subcutaneous on its anteromedial surface, so open fractures are common. The saphenous vein and nerve accompany the great saphenous vein; the common fibular nerve winds around the fibular neck and injury causes foot drop.',
      phd:
        'Research includes limb-loading and bone-remodelling relationships (Wolff’s law quantified by strain gauges), tibial bone-transport and regenerate quality in distraction osteogenesis, and the use of near-infrared spectroscopy to detect compartment ischaemia early.',
    },
  }),
  P('foot', 'Foot', {
    latin: 'Pes',
    tags: ['region', 'limb'],
    details: {
      basic:
        'Your feet carry your whole body. Each foot has 26 bones, and the arches act like springs when you walk.',
      middle:
        'Feet have 7 ankle bones (tarsals), 5 metatarsals and 14 toe bones. The Achilles tendon at the back is the strongest tendon in the body.',
      high:
        'The foot has longitudinal and transverse arches maintained by ligaments (spring ligament, plantar fascia) and muscles (tibialis posterior, peroneus longus). The ankle joint is a mortise between tibia, fibula and talus.',
      undergrad:
        'Ankle sprains usually tear the anterior talofibular ligament. Plantar fasciitis causes heel pain worst on first steps. Diabetic foot ulcers are screened with the 10 g monofilament and vibration sense.',
      phd:
        'Foot biomechanics research uses pressure plates and finite-element models to design offloading devices; the foot as a propulsive lever is central to studies of human walking energetics and the evolution of bipedalism. Regenerative approaches target plantar fascia and Achilles tendinopathy.',
    },
  }),
];

export default SURFACE_PARTS;
