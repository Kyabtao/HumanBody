const P = (id, name, o) => ({ id, name, system: 'reproductive', minLevel: 2, ...o });

export const REPRODUCTIVE_PARTS = [
  P('gonads', 'Gonads (Testes & Ovaries)', {
    latin: 'Gonades',
    tags: ['organ'],
    details: {
      basic: 'The organs that make the special cells needed to start a new life: sperm in males, eggs in females.',
      middle:
        'They also make hormones that shape the body during puberty and keep the reproductive system working.',
      high:
        'Testes (in the scrotum, outside the body because sperm need to be a few degrees cooler) contain seminiferous tubules and Leydig cells. Ovaries (in the pelvis) contain follicles at many stages of development.',
      undergrad:
        'Gametes are haploid, produced by meiosis; both gonads are controlled by hypothalamic GnRH → pituitary LH and FSH → sex steroids, with inhibin feedback from Sertoli or granulosa cells.',
      phd:
        'Research covers germline specification and the epigenetic reprogramming of primordial germ cells, the blood–testis barrier and immune privilege, ovarian follicle pool dynamics and the controversy over postnatal oogenesis, and in vitro gametogenesis.',
    },
  }),
  P('uterus', 'Uterus', {
    latin: 'Uterus',
    tags: ['organ'],
    details: {
      basic: 'A hollow, pear-shaped organ in a woman’s pelvis where a baby grows.',
      middle:
        'Its muscular wall stretches hugely during pregnancy and then contracts powerfully to push the baby out.',
      high:
        'The body (fundus, corpus) has three layers: endometrium (with a functional layer shed each month), myometrium, and perimetrium. The cervix opens into the vagina; the uterine tubes open into the peritoneal cavity.',
      undergrad:
        'Supplied by the uterine artery (which crosses over the ureter — "water under the bridge"), with support from the cardinal and uterosacral ligaments. The menstrual cycle has proliferative and secretory phases under oestrogen then progesterone.',
      phd:
        'Research covers endometrial receptivity and the implantation window, decidua and placental immunology (maternal–fetal tolerance), adenomyosis and endometriosis pathogenesis, and uterus transplantation and bioengineered uterine scaffolds.',
    },
  }),
  P('placenta', 'Placenta', {
    latin: 'Placenta',
    minLevel: 3,
    tags: ['organ', 'development'],
    details: {
      basic: 'A temporary organ that grows during pregnancy to feed and oxygenate the baby.',
      middle:
        'It connects the baby to the mother’s blood supply through the umbilical cord, without the two bloods mixing.',
      high:
        'It is fetomaternal: chorionic villi (fetal) bathe in maternal blood in the intervillous space. It performs gas exchange, nutrient transfer, waste removal and hormone production (hCG, progesterone, oestrogens, lactogen).',
      undergrad:
        'Transport is by diffusion, facilitated transport and active transport; IgG is transferred actively to give the baby passive immunity. Abnormal implantation (placenta praevia, accreta) causes bleeding; pre-eclampsia involves abnormal trophoblast invasion.',
      phd:
        'Research covers trophoblast invasion and spiral artery remodelling, trophoblast organoids, cell-free fetal DNA in maternal plasma for non-invasive prenatal testing, and the placenta as a record of intrauterine programming (the developmental origins of adult disease).',
    },
  }),
  P('sperm-path', 'Male Duct System', {
    latin: 'Ductus genitales masculini',
    minLevel: 3,
    tags: ['tube', 'organ'],
    details: {
      basic: 'A set of tubes that carry sperm from the testes out of the body.',
      middle: 'Sperm are stored and matured in a coiled tube behind each testicle called the epididymis.',
      high:
        'Epididymis → vas deferens (ductus deferens) → ejaculatory duct (joining the seminal vesicle duct) → urethra. The seminal vesicles, prostate and bulbourethral glands add fluid to make semen.',
      undergrad:
        'The spermatic cord contains the vas deferens, testicular artery, pampiniform plexus, lymphatics and genital branch of the genitofemoral nerve. Vasectomy cuts the vas; the prostate is palpable on rectal examination.',
      phd:
        'Research covers epididymal maturation and the epididymosome transfer of RNAs to sperm, the blood–epididymis barrier, prostate biology and androgen signalling in benign hyperplasia and cancer, and male contraceptive development.',
    },
  }),
  P('gametes', 'Gametes & Fertilisation', {
    latin: 'Gameta et fertilisatio',
    minLevel: 3,
    tags: ['cell', 'function'],
    details: {
      basic: 'A sperm cell and an egg cell can join together to begin a new human being.',
      middle:
        'Each contributes half the instructions; together they make a complete set of 46 chromosomes.',
      high:
        'Sperm has a head (nucleus and acrosome), midpiece (mitochondria) and tail. The oocyte is surrounded by the zona pellucida and cumulus cells. Fertilisation usually occurs in the ampulla of the uterine tube.',
      undergrad:
        'The acrosome reaction and zona reaction (cortical granule release) prevent polyspermy. Cleavage follows as the zygote travels to the uterus; implantation begins about day 6–7 after fertilisation.',
      phd:
        'Research covers sperm selection and chemotaxis, oocyte activation by PLCζ, cortical granule exocytosis, the mechanics of the zona pellucida, mitochondrial inheritance and the ethics and biology of mitochondrial replacement and embryo models.',
    },
  }),
  P('puberty', 'Puberty & Growth', {
    latin: 'Pubertas',
    minLevel: 3,
    tags: ['function'],
    details: {
      basic: 'Puberty is the time when your body changes from a child’s body into an adult’s body.',
      middle: 'It usually starts between 8 and 14, and it happens at different times for different people.',
      high:
        'The hypothalamus begins pulsing GnRH, which drives LH and FSH and the rise in sex steroids. This produces the growth spurt, development of secondary sexual characteristics and maturation of the gonads.',
      undergrad:
        'Tanner stages describe pubertal development; adrenarche (adrenal androgens) is separate from gonadarche. Precocious or delayed puberty is investigated with bone age, hormone assays and sometimes imaging.',
      phd:
        'Research covers the kisspeptin/neurokinin B/dynorphin (KNDy) neurons that gate GnRH pulsatility, the genetic architecture of pubertal timing (LIN28B, MKRN3), the secular trend toward earlier puberty, and the long-term metabolic and cancer risks linked to pubertal timing.',
    },
  }),
  P('mammary', 'Mammary Glands', {
    latin: 'Glandulae mammariae',
    minLevel: 3,
    tags: ['gland', 'organ'],
    details: {
      basic: 'Mammary glands make milk to feed a baby after it is born.',
      middle: 'Both men and women have breast tissue; it develops much more in women at puberty.',
      high:
        'The breast has 15–20 lobes, each with a lactiferous duct opening on the nipple, embedded in fat and supported by Cooper’s suspensory ligaments. Lobules contain alveoli that secrete milk under prolactin.',
      undergrad:
        'Lymph drains mainly to the axillary nodes (and internal mammary nodes), which is why sentinel node biopsy guides breast cancer surgery. Milk ejection is an oxytocin-driven neuroendocrine reflex.',
      phd:
        'Research covers mammary stem cells and lineage tracing, the mammary microbiome, ductal carcinoma in situ biology and overdiagnosis, and breast density, risk models and personalised screening.',
    },
  }),
  P('pregnancy-development', 'Embryo & Development', {
    latin: 'Embryogenesis',
    minLevel: 4,
    tags: ['development'],
    details: {
      basic: 'A baby starts as one cell and grows, cell by cell, into a body with all its parts.',
      middle: 'By eight weeks the embryo already has a beating heart, and by twelve weeks all the organs have begun.',
      high:
        'Weeks 1–2: pre-embryonic (cleavage, blastocyst, implantation). Weeks 3–8: embryonic, when the three germ layers (ectoderm, mesoderm, endoderm) form and organogenesis occurs. From week 9: fetal period of growth and maturation.',
      undergrad:
        'Teratogens cause the most damage during organogenesis; critical periods differ by organ. The neural tube folds in week 4 (folic acid prevents defects); the heart is the first functional organ.',
      phd:
        'Research covers gastrulation and the primitive streak, notochord signalling and somitogenesis (the segmentation clock), neural crest migration, organoid and embryo models, and the ethical frameworks for human embryo research beyond 14 days.',
    },
  }),
];

export default REPRODUCTIVE_PARTS;
