const P = (id, name, o) => ({ id, name, system: 'skeletal', minLevel: 2, ...o });

export const SKELETAL_PARTS = [
  P('skull', 'Skull', {
    latin: 'Cranium',
    tags: ['bone', 'axial'],
    details: {
      basic:
        'Your skull is the hard helmet of bone around your brain. It also gives shape to your face.',
      middle:
        'The skull has two parts: the cranium, which covers the brain, and the facial bones. Babies are born with soft spots so the skull can grow.',
      high:
        'The cranium is formed by the frontal, two parietal, two temporal, occipital, sphenoid and ethmoid bones joined by sutures. Fontanelles in infants close during the first two years.',
      undergrad:
        'Skull foramina transmit vessels and nerves: the foramen magnum (medulla, vertebral arteries), jugular foramen (CN IX–XI), foramen ovale (CN V3), superior orbital fissure (CN III, IV, V1, VI). Fracture patterns are described as linear, depressed or basal.',
      phd:
        'Cranial sutures are stem-cell niches; craniosynostosis research implicates FGFR1–3, TWIST1 and MSX2. The skull marrow is now recognised as an immune compartment connected to the meninges by vascular channels, changing views of neuroimmune surveillance.',
    },
    facts: ['The skull has 22 bones joined by immovable joints called sutures.'],
  }),
  P('mandible', 'Lower Jaw (Mandible)', {
    latin: 'Mandibula',
    tags: ['bone', 'axial'],
    details: {
      basic: 'Your lower jaw holds your bottom teeth and moves so you can chew and talk.',
      middle:
        'The mandible is the only skull bone that moves. It hinges at the temporomandibular joint just in front of your ear.',
      high:
        'The mandible has a body and two rami ending in the condyle (articular) and coronoid (muscle attachment) processes. The mandibular division of the trigeminal nerve enters through the mandibular foramen as the inferior alveolar nerve.',
      undergrad:
        'The mandible is the strongest facial bone but commonly fractures at the angle, body and condyle. Dislocation of the temporomandibular joint occurs anteriorly and is reduced by downward and backward pressure on the molars.',
      phd:
        'TMJ disorders involve disc displacement and degenerative changes studied with MRI and jaw-tracking; the joint’s fibrocartilage has limited self-repair. Mandibular distraction osteogenesis and tissue-engineered condyles are active areas of craniofacial regeneration.',
    },
  }),
  P('cervical-vertebrae', 'Neck Vertebrae (C1–C7)', {
    latin: 'Vertebrae cervicales',
    tags: ['bone', 'spine', 'axial'],
    details: {
      basic: 'Seven small bones in your neck hold up your head and let you nod and turn.',
      middle: 'The top two are special: the atlas lets you nod "yes" and the axis lets you shake "no".',
      high:
        'C1 (atlas) articulates with the skull; C2 (axis) has the odontoid peg (dens) around which C1 rotates. C3–C7 have bifid spines and transverse foramina transmitting the vertebral arteries.',
      undergrad:
        'The vertebral artery enters at C6. Fractures: Jefferson burst fracture of C1, hangman’s fracture of C2 pedicles. Whiplash injuries strain the cervical soft tissues, most often at C5–C6.',
      phd:
        'Craniocervical junction research covers the transverse atlantal ligament, basilar invagination and CSF flow obstruction at the foramen magnum in Chiari malformation, studied with phase-contrast MRI.',
    },
  }),
  P('thoracic-vertebrae', 'Thoracic Vertebrae (T1–T12)', {
    latin: 'Vertebrae thoracicae',
    tags: ['bone', 'spine', 'axial'],
    details: {
      basic: 'Twelve bones in the middle of your back. Each one holds a pair of ribs.',
      middle:
        'Thoracic vertebrae make the gentle outward curve of your upper back, and the ribs attach to them.',
      high:
        'They have costal facets on the bodies and transverse processes for rib articulation, heart-shaped bodies and long downward-sloping spines.',
      undergrad:
        'Thoracic discs are thin and the canal is narrow, so disc prolapse is less common but more dangerous. T4–T5 is the level of the sternal angle; the spinal cord ends near L1–L2 in adults.',
      phd:
        'Thoracic kyphosis is quantified by the Cobb angle; Scheuermann disease and vertebral growth-plate (ring apophysis) mechanics are studied in adolescent spines. Thoracic spinal cord stimulation is being investigated for autonomic and motor recovery.',
    },
  }),
  P('lumbar-vertebrae', 'Lumbar Vertebrae (L1–L5)', {
    latin: 'Vertebrae lumbales',
    tags: ['bone', 'spine', 'axial'],
    details: {
      basic: 'Five big bones in your lower back that carry most of your body weight.',
      middle: 'They are the biggest vertebrae because they support everything above them.',
      high:
        'Lumbar vertebrae have large kidney-shaped bodies, no costal facets and no transverse foramina. The intervertebral discs are thick, allowing flexion and extension.',
      undergrad:
        'L4/L5 and L5/S1 discs carry the highest loads and most often prolapse, compressing the traversing nerve root (e.g. L5 root at the L4/L5 level). Lumbar puncture is done at L3/L4 or below.',
      phd:
        'Disc degeneration research covers annulus fibrosus lamellar mechanics, nucleus pulposus notochordal cells, inflammatory cytokine cascades and the poor correlation between imaging findings and pain. Biologics and annular closure devices are under trial.',
    },
  }),
  P('sacrum', 'Sacrum', {
    latin: 'Os sacrum',
    tags: ['bone', 'spine', 'pelvis'],
    details: {
      basic: 'A triangular bone at the bottom of your spine, wedged between your hip bones.',
      middle: 'Five bones fused together. It joins the spine to the pelvis and carries your weight to your legs.',
      high:
        'The sacrum has anterior (pelvic) sacral foramina for ventral rami and posterior foramina for dorsal rami; the sacral canal ends at the sacral hiatus, used for caudal epidural anaesthesia.',
      undergrad:
        'The lumbosacral junction (L5/S1) is the commonest site of spondylolisthesis. The sacroiliac joints transmit load to the pelvic ring and are a source of chronic low back and pelvic pain.',
      phd:
        'Sacroiliac joint research covers nutation/counternutation kinematics, ligamentous versus muscular (form versus force) closure, and minimally invasive joint fusion. Sacral nerve modulation (S3) treats overactive bladder and faecal incontinence.',
    },
  }),
  P('ribs', 'Ribs', {
    latin: 'Costae',
    tags: ['bone', 'thorax'],
    details: {
      basic: 'Twelve pairs of curved bones that wrap around your chest like a cage to protect your heart and lungs.',
      middle:
        'Ribs join the spine at the back and, at the front, to the breastbone by cartilage. They move up and down when you breathe.',
      high:
        'True ribs (1–7) attach directly to the sternum, false ribs (8–10) join the costal margin, and floating ribs (11–12) end in muscle. A typical rib has a head, neck, tubercle and shaft with a costal groove.',
      undergrad:
        'The neurovascular bundle runs in the costal groove, so needles are inserted just above the rib below. Flail chest occurs when three or more adjacent ribs fracture in two places, causing paradoxical movement.',
      phd:
        'Rib biomechanics research informs fracture fixation and older-adult trauma outcomes; the costal cartilage is studied as a source of chondrocytes and as a model of zonal cartilage organisation.',
    },
  }),
  P('sternum', 'Breastbone (Sternum)', {
    latin: 'Sternum',
    tags: ['bone', 'thorax'],
    details: {
      basic: 'The flat bone in the middle of your chest that your front ribs join to.',
      middle: 'It has three parts: the manubrium, the body and the small xiphoid process at the bottom.',
      high:
        'The sternal angle (angle of Louis) at the manubrium–body junction marks the second costal cartilage and the T4/T5 disc, and is the landmark for counting ribs.',
      undergrad:
        'The sternum is split for cardiac surgery (median sternotomy) and is the site of CPR chest compressions. Bone marrow biopsy is often taken from the sternum or the posterior iliac crest.',
      phd:
        'Sternal healing research covers sternal closure techniques, sternal blood supply and the use of sternal marrow for haematopoietic stem-cell sampling. Sternal foramen variants matter for acupuncture and biopsy safety.',
    },
  }),
  P('clavicle', 'Collarbone (Clavicle)', {
    latin: 'Clavicula',
    tags: ['bone', 'girdle'],
    details: {
      basic: 'The thin bone you can feel across the top of your chest, between your neck and shoulder.',
      middle: 'It holds your shoulder out from your body so your arm can swing freely. It is the most often broken bone in children.',
      high:
        'The clavicle is the only long bone that lies horizontally and the only one to ossify partly by intramembranous ossification. It links the sternum to the acromion of the scapula.',
      undergrad:
        'Mid-shaft fractures (about 80%) are pulled by the sternocleidomastoid and pectoralis major; the subclavian vessels and brachial plexus lie just deep to it.',
      phd:
        'Comparative research examines clavicle loss in cursorial mammals and its effect on shoulder mechanics. Clinical trials compare plating versus sling treatment for displaced mid-shaft fractures in adults.',
    },
  }),
  P('scapula', 'Shoulder Blade (Scapula)', {
    latin: 'Scapula',
    tags: ['bone', 'girdle'],
    details: {
      basic: 'The flat triangular bone on the back of your shoulder that you can feel moving when you reach.',
      middle: 'It is held on by muscles, not by a joint with the spine, so your shoulder can move a lot.',
      high:
        'The scapula carries the glenoid cavity, the acromion, the coracoid process and the spine. It glides on the thorax through the scapulothoracic "joint".',
      undergrad:
        'The suprascapular nerve passes through the suprascapular notch; the axillary nerve through the quadrangular space. Scapular winging indicates long thoracic nerve (serratus anterior) palsy.',
      phd:
        'Scapulothoracic rhythm is modelled in 3D gait labs; research links dyskinesis to shoulder impingement and to nerve palsy rehabilitation strategies.',
    },
  }),
  P('humerus', 'Upper Arm Bone (Humerus)', {
    latin: 'Humerus',
    tags: ['bone', 'limb'],
    details: {
      basic: 'The long bone between your shoulder and your elbow.',
      middle: 'Its rounded top fits into the shoulder socket; its bottom end makes the hinge of the elbow.',
      high:
        'Proximal features: head, anatomical and surgical necks, greater and lesser tubercles with the intertubercular groove. Distal features: the condyle, capitulum, trochlea, epicondyles and the olecranon fossa.',
      undergrad:
        'The radial nerve lies in the spiral groove and is injured in mid-shaft fracture (wrist drop); the axillary nerve is at risk at the surgical neck; the ulnar nerve behind the medial epicondyle causes the "funny bone".',
      phd:
        'Proximal humerus fractures in osteoporosis are studied with locking-plate biomechanics and reverse shoulder arthroplasty outcomes. Endochondral ossification of the growth plate informs studies of limb lengthening.',
    },
  }),
  P('radius', 'Radius', {
    latin: 'Radius',
    tags: ['bone', 'limb'],
    details: {
      basic: 'One of the two bones in your forearm, on the thumb side.',
      middle: 'The radius spins around the other bone so you can turn your palm up and down.',
      high:
        'The proximal head articulates with the capitulum and the radial notch of the ulna; the distal end carries the styloid process and articulates with the scaphoid and lunate.',
      undergrad:
        'A Colles fracture (fall on an outstretched hand) is a dorsally displaced distal radius fracture producing a dinner-fork deformity; a Smith fracture is volarly displaced.',
      phd:
        'Distal radius research covers volar locking plate design, intra-articular step-off thresholds for post-traumatic arthritis, and radiocarpal kinematics measured with 4D CT.',
    },
  }),
  P('ulna', 'Ulna', {
    latin: 'Ulna',
    tags: ['bone', 'limb'],
    details: {
      basic: 'The forearm bone on the little-finger side; it makes the point of your elbow.',
      middle: 'The ulna is the stabilising bone, while the radius rotates around it.',
      high:
        'The olecranon process forms the elbow point; the trochlear notch grips the humerus; distally the head and styloid process complete the wrist joint with the triangular fibrocartilage complex.',
      undergrad:
        'Olecranon fractures disrupt the extensor mechanism; a Monteggia fracture is an ulnar shaft fracture with dislocation of the radial head.',
      phd:
        'Research covers proximal ulna dorsal angulation ("varus"/apex posterior deformity) that must be corrected at osteotomy, and forearm rotation mechanics after fracture malunion.',
    },
  }),
  P('hand-bones', 'Bones of the Hand', {
    latin: 'Ossa manus',
    tags: ['bone', 'limb'],
    details: {
      basic: 'Each hand has 27 bones: 8 in the wrist, 5 in the palm and 14 in the fingers.',
      middle:
        'Wrist bones sit in two rows and let your wrist move in many directions. Finger bones let you grip and pick things up.',
      high:
        'Carpals from lateral: scaphoid, lunate, triquetrum, pisiform (proximal row); trapezium, trapezoid, capitate, hamate (distal row). Metacarpals and proximal, middle and distal phalanges follow — the thumb has only two phalanges.',
      undergrad:
        'Scaphoid fracture causes snuffbox tenderness and risks proximal avascular necrosis; Bennett’s fracture is an intra-articular fracture-dislocation at the base of the first metacarpal.',
      phd:
        'Carpal kinematics are modelled as rows behaving as linked segments; scapholunate ligament injury leads to SLAC wrist arthritis. Thumb carpometacarpal (saddle) joint osteoarthritis is strongly heritable and a target for ligament reconstruction research.',
    },
  }),
  P('pelvis', 'Pelvis', {
    latin: 'Cingulum pelvicum',
    tags: ['bone', 'girdle'],
    details: {
      basic: 'The bowl-shaped bones at the bottom of your trunk that your legs attach to.',
      middle: 'It protects organs in the lower belly and carries the weight of your body to your legs.',
      high:
        'Two hip bones (ilium, ischium, pubis fused at the acetabulum) plus the sacrum and coccyx. The pelvic inlet and outlet matter in childbirth; the female pelvis is broader and shallower.',
      undergrad:
        'Pelvic fractures can cause massive bleeding from the venous plexus. The greater sciatic foramen transmits piriformis and the sciatic nerve; the lesser sciatic foramen transmits the obturator internus tendon and pudendal nerve.',
      phd:
        'Pelvic floor research covers levator ani injury in childbirth, POP-Q staging, and the childbirth–pelvic-floor dysfunction relationship modelled with MRI and finite-element simulation of vaginal delivery.',
    },
  }),
  P('femur', 'Thigh Bone (Femur)', {
    latin: 'Os femoris',
    tags: ['bone', 'limb'],
    details: {
      basic: 'The longest and strongest bone in your body, running from hip to knee.',
      middle: 'It can carry loads up to about 30 times your body weight when you jump.',
      high:
        'Proximal: head with the fovea, neck, greater and lesser trochanters. Distal: the condyles and the patellar surface. The linea aspera is the muscle ridge on the shaft.',
      undergrad:
        'Intracapsular neck-of-femur fractures threaten the blood supply to the head (avascular necrosis), because retinacular vessels run along the neck. Hip fracture is a major cause of morbidity in osteoporosis.',
      phd:
        'Femoral neck anteversion and neck–shaft angle research informs femoroacetabular impingement and cam/pincer morphology. Osteoporotic bone strength is studied with HR-pQCT and finite-element analysis.',
    },
  }),
  P('patella', 'Knee Cap (Patella)', {
    latin: 'Patella',
    tags: ['bone', 'limb'],
    details: {
      basic: 'The small round bone in front of your knee that protects the joint.',
      middle: 'It is the largest sesamoid bone, sitting inside a tendon to give the knee extra leverage.',
      high:
        'The patella articulates with the femoral trochlea; the quadriceps tendon inserts above and the patellar ligament continues below to the tibial tuberosity.',
      undergrad:
        'Patellar dislocation is usually lateral; the knee-jerk reflex (L3–L4) is elicited by tapping the patellar ligament. Chondromalacia patellae describes softening of the articular cartilage.',
      phd:
        'Patellofemoral research covers the trochlear groove geometry, the medial patellofemoral ligament, and joint reaction forces that reach several times body weight during stair descent.',
    },
  }),
  P('tibia', 'Shin Bone (Tibia)', {
    latin: 'Tibia',
    tags: ['bone', 'limb'],
    details: {
      basic: 'The big bone at the front of your lower leg; you can feel it just under the skin.',
      middle: 'It carries nearly all the weight from your thigh to your ankle.',
      high:
        'The tibial plateau articulates with the femoral condyles via the menisci; the medial malleolus forms the inner ankle bone; the tibial tuberosity receives the patellar ligament.',
      undergrad:
        'Because the anteromedial surface is subcutaneous, open fractures are common and heal slowly. Anterior compartment syndrome presents with pain on passive stretch.',
      phd:
        'Research covers plateau fracture reduction quality and post-traumatic osteoarthritis, tibial torsion measurement, and the bone–muscle unit in sarcopenia and disuse.',
    },
  }),
  P('fibula', 'Fibula', {
    latin: 'Fibula',
    tags: ['bone', 'limb'],
    details: {
      basic: 'The thin bone on the outside of your lower leg, next to the shin bone.',
      middle: 'It carries little weight but gives muscles a place to attach and forms the outer ankle.',
      high:
        'The head of the fibula is the attachment for the biceps femoris tendon and the site where the common fibular nerve winds; the lateral malleolus stabilises the ankle.',
      undergrad:
        'Common fibular nerve injury at the fibular neck causes foot drop with loss of dorsiflexion and eversion and sensory loss on the dorsum of the foot.',
      phd:
        'Fibula research includes its use as a vascularised free flap for mandibular reconstruction, and ankle syndesmosis injury (the "high ankle sprain") diagnosed with stress imaging.',
    },
  }),
  P('foot-bones', 'Bones of the Foot', {
    latin: 'Ossa pedis',
    tags: ['bone', 'limb'],
    details: {
      basic: 'Each foot has 26 bones that form springy arches to support your weight.',
      middle: 'Seven ankle bones, five long foot bones and fourteen toe bones work together when you walk.',
      high:
        'Tarsals: talus, calcaneus, navicular, cuboid and three cuneiforms. The talus transmits body weight to the heel and forefoot; the arches are supported by the plantar ligaments and fascia.',
      undergrad:
        'The calcaneus is the commonest tarsal fracture (fall from height). Talus fracture risks avascular necrosis; a Jones fracture is a fifth metatarsal base fracture with a poor healing zone.',
      phd:
        'Foot evolution research compares the human stiff longitudinal arch with the ape midfoot; body-mass-driven finite-element models predict arch deformation and plantar pressure in diabetes.',
    },
  }),
  P('joints', 'Joints', {
    latin: 'Articulationes',
    tags: ['joint', 'cartilage'],
    details: {
      basic: 'A joint is where two bones meet. Some joints move a lot, like your knee; some do not move at all.',
      middle:
        'Moving joints have a smooth cartilage surface, a slippery fluid and strong straps called ligaments holding the bones together.',
      high:
        'Three classes: fibrous (sutures, syndesmoses), cartilaginous (synchondroses, symphyses) and synovial. Synovial joints are further classed as hinge, pivot, condyloid, saddle, plane or ball-and-socket.',
      undergrad:
        'Synovial joints have articular cartilage, a capsule, a synovial membrane and fluid; they are supplied by articular nerves (Hilton’s law: the nerve supplying a joint also supplies the muscles moving it and the skin over it).',
      phd:
        'Synovial joint research covers chondrocyte mechanotransduction, lubricin and hyaluronan boundary lubrication, synovial macrophage subsets, and osteoarthritis as an inflammatory repair response of the whole joint organ.',
    },
  }),
  P('cartilage', 'Cartilage', {
    latin: 'Cartilago',
    tags: ['tissue', 'connective'],
    details: {
      basic: 'Cartilage is smooth, bendy, rubbery tissue. You can feel it in the tip of your nose and the top of your ear.',
      middle: 'It cushions the ends of bones in joints and gives shape to soft parts like your nose and ears.',
      high:
        'Three types: hyaline (articular surfaces, trachea, fetal skeleton), elastic (pinna, epiglottis) and fibrocartilage (intervertebral discs, pubic symphysis, menisci).',
      undergrad:
        'Cartilage is avascular and aneural; it relies on diffusion from synovial fluid and on intermittent loading (pumping) for nutrition, which is why immobilisation harms it.',
      phd:
        'Cartilage repair research covers autologous chondrocyte implantation, matrix-induced scaffolds, mesenchymal stem-cell recruitment and the zonal collagen architecture (superficial tangential, transitional, radial, calcified) that grafts rarely reproduce.',
    },
  }),
  P('bone-tissue', 'Bone Tissue', {
    latin: 'Textus osseus',
    minLevel: 3,
    tags: ['tissue', 'connective', 'histology'],
    details: {
      basic: 'Bone is hard because it holds calcium. It is also alive, with cells living inside it.',
      middle:
        'Bone is made of a hard outer shell (compact bone) and a spongy honeycomb inside (spongy bone), where blood cells are made.',
      high:
        'Osseous tissue has osteocytes in lacunae, osteoblasts building matrix and osteoclasts resorbing it. The unit of compact bone is the osteon (Haversian system) with central canals carrying vessels.',
      undergrad:
        'Bone remodelling couples resorption and formation via the RANK/RANKL/OPG system and mechanosensing by osteocytes; parathyroid hormone and vitamin D regulate calcium balance.',
      phd:
        'Bone is an endocrine organ: osteocalcin influences insulin secretion and male fertility, and osteocyte-derived sclerostin (targeted by romosozumab) controls the Wnt pathway. Frontiers include osteoimmunology, osteocyte lacuno-canalicular fluid flow, and bone–brain cross-talk.',
    },
  }),
];

export default SKELETAL_PARTS;
